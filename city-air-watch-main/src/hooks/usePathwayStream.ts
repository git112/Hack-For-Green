/**
 * usePathwayStream — React hook for live AQI stream
 * ───────────────────────────────────────────────────
 * Connects to the Node.js SSE bridge (which proxies the
 * Pathway streaming engine). Provides:
 *   - Real-time ward AQI values
 *   - City-wide summary stats
 *   - Active alerts from threshold detection
 *   - Stream log entries (console feed)
 *   - Connection status (Pathway / Simulation / Disconnected)
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const STREAM_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/stream/live`;
const MAX_LOG_ENTRIES = 80;

export interface WardReading {
    ward_id: string;
    ward_name: string;
    ward_type?: string;
    aqi: number;
    rolling_avg: number;
    aqi_level: string;
    spike: boolean;
    pm25: number;
    pm10: number;
    no2?: number;
    co?: number;
    timestamp: string;
    alert?: StreamAlert | null;
}

export interface StreamAlert {
    type: string;
    severity: string;
    icon: string;
    ward_id: string;
    ward_name: string;
    aqi: number;
    threshold?: number;
    action?: string;
    timestamp: string;
}

export interface CitySummary {
    avg_aqi: number;
    max_aqi: number;
    aqi_level: string;
    critical_wards: number;
    total_wards: number;
}

export interface StreamLogEntry {
    id: number;
    level: 'info' | 'warning' | 'critical' | 'success';
    message: string;
    data?: Record<string, unknown>;
    timestamp: string;
}

export interface PipelineStats {
    total_events: number;
    spikes_detected: number;
    alerts_triggered: number;
    windows_processed: number;
    started_at?: string;
    layer?: string;
}

export interface StreamState {
    connected: boolean;
    pathwayConnected: boolean;
    simulationMode: boolean;
    wards: Record<string, WardReading>;
    wardsList: WardReading[];
    cityStats: CitySummary | null;
    activeAlerts: StreamAlert[];
    logs: StreamLogEntry[];
    pipelineStats: PipelineStats | null;
    lastUpdate: string | null;
    tick: number;
}

const initialState: StreamState = {
    connected: false,
    pathwayConnected: false,
    simulationMode: false,
    wards: {},
    wardsList: [],
    cityStats: null,
    activeAlerts: [],
    logs: [],
    pipelineStats: null,
    lastUpdate: null,
    tick: 0,
};

export function usePathwayStream() {
    const [state, setState] = useState<StreamState>(initialState);
    const esRef = useRef<EventSource | null>(null);
    const logsRef = useRef<StreamLogEntry[]>([]);

    const addLog = useCallback((entry: StreamLogEntry) => {
        logsRef.current = [entry, ...logsRef.current].slice(0, MAX_LOG_ENTRIES);
        setState(prev => ({ ...prev, logs: [...logsRef.current] }));
    }, []);

    const processPayload = useCallback((payload: Record<string, unknown>) => {
        if (!payload) return;

        const wards: Record<string, WardReading> = {};
        const wardsList: WardReading[] = Array.isArray(payload.wards) ? payload.wards as WardReading[] : [];
        wardsList.forEach(w => { wards[w.ward_id] = w; });

        const alerts = (Array.isArray(payload.active_alerts) ? payload.active_alerts : []) as StreamAlert[];
        const cityStats = payload.city_summary as CitySummary | null;
        const pipelineRaw = payload.pipeline as Record<string, unknown> | null;
        const rawStats = pipelineRaw?.stats as Partial<PipelineStats> | undefined;
        const pipelineStats: PipelineStats | null = pipelineRaw
            ? {
                total_events: rawStats?.total_events ?? 0,
                spikes_detected: rawStats?.spikes_detected ?? 0,
                alerts_triggered: rawStats?.alerts_triggered ?? 0,
                windows_processed: rawStats?.windows_processed ?? 0,
                started_at: rawStats?.started_at,
                layer: pipelineRaw.layer as string | undefined,
            }
            : null;

        setState(prev => ({
            ...prev,
            wards,
            wardsList,
            cityStats: cityStats || prev.cityStats,
            activeAlerts: alerts,
            pipelineStats: pipelineStats || prev.pipelineStats,
            lastUpdate: (payload.timestamp as string) || new Date().toISOString(),
            tick: (payload.tick as number) || prev.tick,
        }));
    }, []);

    useEffect(() => {
        let active = true;

        function connect() {
            if (!active) return;
            const es = new EventSource(STREAM_URL);
            esRef.current = es;

            es.onopen = () => {
                if (!active) return;
                setState(prev => ({ ...prev, connected: true }));
            };

            es.onmessage = (e) => {
                if (!active) return;
                try {
                    const msg = JSON.parse(e.data);

                    switch (msg.event) {
                        case 'connected':
                            setState(prev => ({
                                ...prev,
                                connected: true,
                                pathwayConnected: !!msg.pathway_connected,
                                simulationMode: !!msg.simulation_mode,
                            }));
                            break;

                        case 'stream_update':
                        case 'snapshot':
                            processPayload(msg.payload || msg);
                            setState(prev => ({
                                ...prev,
                                pathwayConnected: !msg.payload?.pipeline?.layer?.includes('Simulation'),
                                simulationMode: !!msg.payload?.pipeline?.layer?.includes('Simulation'),
                            }));
                            break;

                        case 'log':
                            addLog(msg.log);
                            break;

                        case 'log_history':
                            if (Array.isArray(msg.logs)) {
                                logsRef.current = [...msg.logs, ...logsRef.current].slice(0, MAX_LOG_ENTRIES);
                                setState(prev => ({ ...prev, logs: [...logsRef.current] }));
                            }
                            break;

                        case 'heartbeat':
                            break;

                        default:
                            if (msg.wards) processPayload(msg);
                    }
                } catch {
                    // ignore parse errors
                }
            };

            es.onerror = () => {
                if (!active) return;
                setState(prev => ({ ...prev, connected: false }));
                es.close();
                // Reconnect after 5s
                setTimeout(() => { if (active) connect(); }, 5000);
            };
        }

        connect();

        return () => {
            active = false;
            esRef.current?.close();
        };
    }, [processPayload, addLog]);

    return state;
}
