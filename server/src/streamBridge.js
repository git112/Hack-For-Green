/**
 * PATHWAY STREAM BRIDGE (Fixed - Windows compatible)
 * ─────────────────────────────────────────────────────
 * Polls the Pathway Python REST endpoints every 5s
 * and broadcasts updates to all connected frontend SSE clients.
 */

import http from 'http';

const PATHWAY_BASE = 'http://localhost:5000';
const POLL_INTERVAL_MS = 5000;

// All connected frontend SSE clients
const sseClients = new Set();

// Latest stream state (cache for new clients)
let latestStreamData = null;
let pathwayConnected = false;
let connectionAttempts = 0;
let pollTimer = null;
let tick = 0;

// ─── Stream Log Buffer ────────────────────────────────
const streamLog = [];
const MAX_LOG = 100;

function addLog(level, message, data = null) {
  const entry = {
    id: Date.now() + Math.random(),
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  streamLog.unshift(entry);
  if (streamLog.length > MAX_LOG) streamLog.pop();
  broadcastToClients({ event: 'log', log: entry });
  return entry;
}

// ─── Broadcast to all SSE clients ────────────────────
function broadcastToClients(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  const dead = [];
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      dead.push(client);
    }
  }
  dead.forEach(c => sseClients.delete(c));
}

// ─── HTTP GET helper (Promise) ────────────────────────
function httpGet(url, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk.toString(); });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.on('error', reject);
  });
}

// ─── AQI level helper ─────────────────────────────────
function getAQILevel(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

// ─── Simulation fallback (when Pathway offline) ───────
const simHistory = {};
const SIM_WARDS = [
  { id: 'ward_1', name: 'Ward 1 - Central', base: 85, type: 'residential' },
  { id: 'ward_2', name: 'Ward 2 - North', base: 45, type: 'park' },
  { id: 'ward_3', name: 'Ward 3 - Traffic Hub', base: 156, type: 'traffic' },
  { id: 'ward_4', name: 'Ward 4 - East', base: 120, type: 'mixed' },
  { id: 'ward_5', name: 'Ward 5 - West', base: 98, type: 'commercial' },
  { id: 'ward_6', name: 'Ward 6 - Industrial', base: 210, type: 'industrial' },
  { id: 'ward_7', name: 'Ward 7 - South', base: 112, type: 'residential' },
  { id: 'ward_8', name: 'Ward 8 - Market Area', base: 145, type: 'commercial' },
];

function generateSimData() {
  const hour = new Date().getHours();
  const timeFactor = (hour >= 7 && hour <= 9) ? 1.25 : (hour >= 17 && hour <= 20) ? 1.20 : (hour >= 0 && hour <= 5) ? 0.75 : 1.0;

  const wards = SIM_WARDS.map(w => {
    if (!simHistory[w.id]) simHistory[w.id] = [];
    const drift = Math.sin(tick * 0.3) * 12;
    const noise = (Math.random() - 0.5) * 16;
    const isSpike = (w.type === 'industrial' || w.type === 'traffic') && Math.random() < 0.05;
    const spikeVal = isSpike ? Math.floor(Math.random() * 60 + 30) : 0;
    const aqi = Math.max(10, Math.min(500, Math.round(w.base * timeFactor + drift + noise + spikeVal)));

    simHistory[w.id].push(aqi);
    if (simHistory[w.id].length > 20) simHistory[w.id].shift();
    const hist = simHistory[w.id];
    const rollingAvg = Math.round((hist.reduce((a, b) => a + b, 0) / hist.length) * 10) / 10;
    const spike = isSpike || (hist.length >= 3 && aqi > rollingAvg * 1.30);

    const prevAlert = latestStreamData?.wards?.find(ww => ww.ward_id === w.id);
    const prevAqi = prevAlert?.aqi ?? 0;

    let alert = null;
    const thresholds = [
      { t: 300, severity: 'EMERGENCY', icon: '🚨', action: 'Immediate action required. Industrial halt mandatory.' },
      { t: 200, severity: 'CRITICAL', icon: '🔴', action: 'High pollution. Vulnerable groups must stay indoors.' },
      { t: 150, severity: 'WARNING', icon: '🟠', action: 'Elevated AQI. Limit outdoor activities.' },
    ];
    for (const th of thresholds) {
      if (aqi >= th.t && prevAqi < th.t) {
        alert = {
          type: 'THRESHOLD_ALERT', severity: th.severity, icon: th.icon,
          ward_id: w.id, ward_name: w.name, aqi, threshold: th.t, action: th.action,
          timestamp: new Date().toISOString()
        };
        break;
      }
    }

    return {
      ward_id: w.id, ward_name: w.name, ward_type: w.type,
      aqi, rolling_avg: rollingAvg, aqi_level: getAQILevel(aqi),
      spike, alert,
      pm25: Math.round(aqi * 0.6 + (Math.random() - 0.5) * 6),
      pm10: Math.round(aqi * 0.9 + (Math.random() - 0.5) * 10),
      no2: Math.round(aqi * 0.3 + (Math.random() - 0.5) * 4),
      timestamp: new Date().toISOString(),
    };
  });

  const aqis = wards.map(w => w.aqi);
  const cityAvg = Math.round((aqis.reduce((a, b) => a + b, 0) / aqis.length) * 10) / 10;
  const criticalWards = wards.filter(w => w.aqi > 150).length;
  const activeAlerts = wards.filter(w => w.alert).map(w => w.alert);

  // Log spikes
  wards.filter(w => w.spike).forEach(w => {
    addLog('warning', `⚡ SPIKE: ${w.ward_name} — AQI ${w.aqi} (rolling avg: ${w.rolling_avg})`, { ward_id: w.ward_id });
  });
  // Log threshold alerts
  wards.filter(w => w.alert).forEach(w => {
    if (w.alert.severity === 'EMERGENCY' || w.alert.severity === 'CRITICAL') {
      addLog('critical', `${w.alert.icon} ALERT: ${w.ward_name} crossed AQI ${w.alert.threshold} — ${w.alert.severity}`, { ward_id: w.ward_id, aqi: w.aqi });
    } else {
      addLog('warning', `${w.alert.icon} ${w.alert.severity}: ${w.ward_name} AQI=${w.aqi}`, { ward_id: w.ward_id });
    }
  });

  return {
    event: 'aqi_update',
    tick,
    timestamp: new Date().toISOString(),
    pipeline: {
      layer: 'Pathway Streaming Engine (Simulated)',
      stats: {
        total_events: tick * 8,
        spikes_detected: wards.filter(w => w.spike).length,
        alerts_triggered: activeAlerts.length,
        windows_processed: tick,
        started_at: new Date().toISOString(),
      },
    },
    city_summary: {
      avg_aqi: cityAvg,
      max_aqi: Math.max(...aqis),
      aqi_level: getAQILevel(Math.round(cityAvg)),
      critical_wards: criticalWards,
      total_wards: wards.length,
    },
    wards,
    active_alerts: activeAlerts,
  };
}

// ─── Poll Pathway Engine REST ─────────────────────────
async function pollPathway() {
  try {
    // Try /wards endpoint (snapshot of current state)
    const wardsData = await httpGet(`${PATHWAY_BASE}/wards`);
    const alertsData = await httpGet(`${PATHWAY_BASE}/alerts`);
    const statusData = await httpGet(`${PATHWAY_BASE}/status`);

    if (!pathwayConnected) {
      pathwayConnected = true;
      connectionAttempts = 0;
      addLog('success', '🟢 Pathway Engine Connected — Live AQI stream active (port 5000)');
      addLog('info', '📚 Document Store online: WHO Guidelines + Govt Rules + Health Advisories');
      console.log('✅ [Bridge] Connected to Pathway Engine via REST polling');
    }

    const wards = wardsData.wards || [];
    const alerts = alertsData.alerts || [];
    const aqis = wards.map(w => w.aqi || 0);
    const cityAvg = aqis.length ? Math.round((aqis.reduce((a, b) => a + b, 0) / aqis.length) * 10) / 10 : 0;

    // Log spikes from pathway
    wards.filter(w => w.spike).forEach(w => {
      addLog('warning', `⚡ SPIKE DETECTED: ${w.ward_name} — AQI ${w.aqi} (rolling avg: ${w.rolling_avg})`, { ward_id: w.ward_id, aqi: w.aqi });
    });
    alerts.forEach(a => {
      addLog('critical', `${a.icon || '🚨'} THRESHOLD ALERT: ${a.ward_name} — ${a.severity} (AQI=${a.aqi})`, { ward_id: a.ward_id });
    });

    // Summary log every tick
    addLog('info',
      `📊 Pathway window update — CityAvg: ${cityAvg} | Max: ${Math.max(...aqis, 0)} | Critical: ${wards.filter(w => w.aqi > 150).length}/${wards.length}`,
      { tick }
    );

    const payload = {
      event: 'aqi_update',
      tick,
      timestamp: new Date().toISOString(),
      pipeline: {
        layer: 'Pathway Streaming Engine v1.0',
        stats: statusData.stats || {},
      },
      city_summary: {
        avg_aqi: cityAvg,
        max_aqi: Math.max(...aqis, 0),
        aqi_level: getAQILevel(Math.round(cityAvg)),
        critical_wards: wards.filter(w => w.aqi > 150).length,
        total_wards: wards.length,
      },
      wards,
      active_alerts: alerts,
    };

    latestStreamData = payload;
    broadcastToClients({ event: 'stream_update', payload });

  } catch (err) {
    connectionAttempts++;
    if (pathwayConnected) {
      pathwayConnected = false;
      addLog('warning', '⚠️ Pathway Engine disconnected — switching to simulation mode');
    }

    if (connectionAttempts <= 3) {
      console.warn(`⚠️  [Bridge] Pathway unreachable (attempt ${connectionAttempts}): ${err.message}`);
    }

    // Use simulation data while Pathway is offline
    const simPayload = generateSimData();
    latestStreamData = simPayload;
    broadcastToClients({ event: 'stream_update', payload: simPayload });

    if (connectionAttempts === 3) {
      addLog('info', '🤖 Simulation mode active — Start Pathway engine to switch to live data');
    }
  }

  tick++;
  // Schedule next poll
  pollTimer = setTimeout(pollPathway, POLL_INTERVAL_MS);
}

// ─── Express Route Handlers ───────────────────────────
export function setupStreamRoutes(app) {
  // SSE endpoint for frontend
  app.get('/api/stream/live', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    sseClients.add(res);
    console.log(`📡 [Bridge] SSE client connected (total: ${sseClients.size})`);

    // Send current snapshot immediately
    if (latestStreamData) {
      res.write(`data: ${JSON.stringify({ event: 'stream_update', payload: latestStreamData })}\n\n`);
    }
    // Send recent logs
    if (streamLog.length) {
      res.write(`data: ${JSON.stringify({ event: 'log_history', logs: streamLog.slice(0, 30) })}\n\n`);
    }
    // Send connection status
    res.write(`data: ${JSON.stringify({
      event: 'connected',
      pathway_connected: pathwayConnected,
      simulation_mode: !pathwayConnected,
      timestamp: new Date().toISOString(),
    })}\n\n`);

    // Heartbeat every 20s to keep connection alive
    const heartbeat = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ event: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`);
      } catch {
        clearInterval(heartbeat);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
      console.log(`📡 [Bridge] SSE client disconnected (total: ${sseClients.size})`);
    });
  });

  // Current AQI state (REST)
  app.get('/api/stream/state', (req, res) => {
    res.json({
      connected: pathwayConnected,
      simulation_mode: !pathwayConnected,
      clients: sseClients.size,
      tick,
      latest: latestStreamData,
    });
  });

  // Stream logs (REST)
  app.get('/api/stream/logs', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    res.json({ logs: streamLog.slice(0, limit) });
  });

  // Pathway status proxy
  app.get('/api/stream/pathway-status', async (req, res) => {
    try {
      const data = await httpGet(`${PATHWAY_BASE}/status`, 3000);
      res.json({ connected: true, ...data });
    } catch {
      res.json({ connected: false, message: 'Pathway engine not running on port 5000' });
    }
  });
}

// ─── Init ─────────────────────────────────────────────
export function initStreamBridge() {
  addLog('info', '🚀 Pathway Stream Bridge initializing...');
  addLog('info', '🔌 Connecting to Pathway Engine at http://localhost:5000...');
  // Start polling immediately
  pollPathway();
}
