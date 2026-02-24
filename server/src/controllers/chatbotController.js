import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────
//  LOCAL RAG ENGINE  (works without any API key)
//  Generates intelligent responses from live data + doc store
// ─────────────────────────────────────────────────────────

const WHO_GUIDELINES = {
  good: { range: '0-50', advice: 'Air quality is satisfactory. No risk to general population.' },
  satisfactory: { range: '51-100', advice: 'Minor breathing discomfort possible for sensitive people (children, elderly, respiratory patients).' },
  moderate: { range: '101-200', advice: 'Breathing discomfort for people with lung disease, asthma, heart disease, children and older adults. Limit prolonged outdoor exertion.' },
  poor: { range: '201-300', advice: 'Breathing discomfort likely for most people on prolonged exposure. Everyone should reduce outdoor activity.' },
  very_poor: { range: '301-400', advice: 'Respiratory illness on prolonged exposure. Serious effects on healthy people. Stay indoors, use air purifiers.' },
  severe: { range: '401-500', advice: 'Health impacts even on healthy people. SERIOUS impact on sensitive groups. Avoid ALL outdoor activity. Seek medical attention if symptoms occur.' },
};

const GOVT_RULES = [
  { threshold: 200, rule: 'Construction activities banned in Delhi NCR when AQI exceeds 200.' },
  { threshold: 300, rule: 'Industries must halt operations (GRAP Stage III) when AQI exceeds 300.' },
  { threshold: 350, rule: 'Schools and colleges must close when AQI exceeds 350.' },
  { threshold: 400, rule: 'Odd-even vehicle scheme activated; emergency health advisory issued when AQI exceeds 400.' },
];

const ELDERLY_ADVICE = {
  100: 'Limit prolonged outdoor exertion. Take breaks during outdoor activities.',
  150: 'Avoid outdoor activity during peak hours (7-9 AM, 5-8 PM). Stay hydrated.',
  200: 'Stay indoors. Use air purifiers if available. Keep windows closed. Wear N95 mask if going outside.',
  300: 'Emergency level. Stay indoors strictly. Seek immediate medical attention if respiratory symptoms (coughing, shortness of breath) occur.',
};

function getAqiLevel(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

function getAqiLevelKey(aqi) {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'satisfactory';
  if (aqi <= 200) return 'moderate';
  if (aqi <= 300) return 'poor';
  if (aqi <= 400) return 'very_poor';
  return 'severe';
}

/**
 * Parse ward data from the ward_context string sent by frontend
 */
function parseWardContext(wardContext) {
  if (!wardContext) return { wards: [], alerts: [], cityAvg: null, cityMax: null, criticalCount: 0 };

  const wards = [];
  const alerts = [];
  let cityAvg = null;
  let cityMax = null;
  let criticalCount = 0;

  const lines = wardContext.split('\n');
  for (const line of lines) {
    // Parse ward lines like: "Ward 1 - Central: AQI=85 (Good), rolling_avg=82.3"
    const wardMatch = line.match(/^(.+?):\s*AQI=(\d+)\s*\(([^)]+)\),\s*rolling_avg=([\d.]+)(.*)/);
    if (wardMatch) {
      wards.push({
        name: wardMatch[1].trim(),
        aqi: parseInt(wardMatch[2]),
        level: wardMatch[3].trim(),
        avg: parseFloat(wardMatch[4]),
        spike: line.includes('SPIKE'),
      });
    }
    // Parse alert lines
    const alertMatch = line.match(/[🚨🔴🟠]\s*(.+?):\s*(\w+)\s*\(AQI=(\d+)\)/);
    if (alertMatch) {
      alerts.push({ ward: alertMatch[1].trim(), severity: alertMatch[2], aqi: parseInt(alertMatch[3]) });
    }
    // Parse city stats
    const avgMatch = line.match(/City Average AQI:\s*([\d.]+)/);
    if (avgMatch) cityAvg = parseFloat(avgMatch[1]);
    const maxMatch = line.match(/City Max AQI:\s*(\d+)/);
    if (maxMatch) cityMax = parseInt(maxMatch[1]);
    const critMatch = line.match(/Critical Wards:\s*(\d+)/);
    if (critMatch) criticalCount = parseInt(critMatch[1]);
  }

  return { wards, alerts, cityAvg, cityMax, criticalCount };
}

/**
 * Generate intelligent local response based on query + live data
 */
function generateLocalResponse(message, wardContext, currentAqi) {
  const ctx = parseWardContext(wardContext);
  const query = message.toLowerCase();
  const avgAqi = ctx.cityAvg || currentAqi || 0;
  const level = getAqiLevel(avgAqi);
  const levelKey = getAqiLevelKey(avgAqi);

  // Sort wards by AQI descending
  const sortedWards = [...ctx.wards].sort((a, b) => b.aqi - a.aqi);
  const criticalWards = ctx.wards.filter(w => w.aqi > 150);
  const worstWard = sortedWards[0];
  const bestWard = sortedWards[sortedWards.length - 1];

  // ── Query: Ward 6 / critical / why ──────────────────────
  if (query.includes('ward 6') || query.includes('industrial') || query.includes('why') && query.includes('critical')) {
    const ward6 = ctx.wards.find(w => w.name.toLowerCase().includes('industrial') || w.name.toLowerCase().includes('ward 6'));
    if (ward6) {
      const guideline = WHO_GUIDELINES[getAqiLevelKey(ward6.aqi)];
      const rules = GOVT_RULES.filter(r => ward6.aqi > r.threshold);
      let response = `📊 **${ward6.name}** — Current Status\n\n`;
      response += `• AQI: **${ward6.aqi}** (${ward6.level})\n`;
      response += `• Rolling Average: ${ward6.avg}\n`;
      if (ward6.spike) response += `• ⚡ **SPIKE DETECTED** — AQI is rising rapidly\n`;
      response += `\n🏥 **WHO Advisory (${guideline.range}):**\n${guideline.advice}\n`;
      if (rules.length > 0) {
        response += `\n⚖️ **Government Actions Triggered:**\n`;
        rules.forEach(r => { response += `• ${r.rule}\n`; });
      }
      response += `\n🔍 **Why is this ward critical?**\nWard 6 is classified as an industrial zone. Industrial emissions, vehicular traffic from goods transport, and construction dust are the primary contributors. The combination of factory operations and limited green cover leads to persistently elevated AQI readings.`;
      return response;
    }
  }

  // ── Query: elderly / health / what should ──────────────
  if (query.includes('elderly') || query.includes('old') || query.includes('health') || query.includes('should')) {
    let elderlyKey = '100';
    if (avgAqi >= 300) elderlyKey = '300';
    else if (avgAqi >= 200) elderlyKey = '200';
    else if (avgAqi >= 150) elderlyKey = '150';

    let response = `👴 **Health Advisory for Elderly & Sensitive Groups**\n\n`;
    response += `Current City AQI: **${avgAqi}** (${level})\n\n`;
    response += `🏥 **Recommended Actions:**\n${ELDERLY_ADVICE[elderlyKey]}\n\n`;
    response += `📋 **General Guidelines:**\n`;
    response += `• Keep prescribed medications (inhalers, nebulizers) readily accessible\n`;
    response += `• Monitor symptoms: persistent coughing, wheezing, shortness of breath\n`;
    response += `• Use N95/KN95 masks when outdoor exposure is unavoidable\n`;
    response += `• Keep indoor air clean — use air purifiers, avoid incense/candles\n`;
    response += `• Stay hydrated and consume antioxidant-rich foods\n`;

    if (avgAqi > 200) {
      response += `\n⚠️ **IMPORTANT:** At the current AQI of ${avgAqi}, elderly individuals and people with respiratory conditions (asthma, COPD) should strictly avoid outdoor activity. Contact emergency services if breathing difficulty persists.`;
    }
    return response;
  }

  // ── Query: emergency / action / which wards ────────────
  if (query.includes('emergency') || query.includes('action') || query.includes('which ward')) {
    if (criticalWards.length === 0) {
      return `✅ **No Emergency Action Required**\n\nAll ${ctx.wards.length} wards are currently within acceptable AQI thresholds (below 150). The city average AQI is ${avgAqi} (${level}).\n\n📊 Continue monitoring — the Pathway Engine is tracking all wards in real-time.`;
    }

    let response = `🚨 **Emergency Action Assessment**\n\n`;
    response += `**${criticalWards.length} out of ${ctx.wards.length} wards** require attention:\n\n`;

    criticalWards.forEach(w => {
      const rules = GOVT_RULES.filter(r => w.aqi > r.threshold);
      response += `**${w.name}** — AQI ${w.aqi} (${w.level})${w.spike ? ' ⚡SPIKE' : ''}\n`;
      rules.forEach(r => { response += `  → ${r.rule}\n`; });
      response += `\n`;
    });

    const guideline = WHO_GUIDELINES[getAqiLevelKey(worstWard.aqi)];
    response += `🏥 **WHO Advisory for worst conditions (${guideline.range}):**\n${guideline.advice}\n\n`;
    response += `📋 **Immediate Government Actions:**\n`;
    if (worstWard.aqi > 400) response += `• ACTIVATE emergency health advisory across ALL wards\n• IMPLEMENT odd-even vehicle scheme\n`;
    if (worstWard.aqi > 300) response += `• HALT all industrial operations in affected wards (GRAP Stage III)\n• CLOSE schools and colleges if AQI > 350\n`;
    if (worstWard.aqi > 200) response += `• BAN all construction activities in affected zones\n`;
    response += `• DEPLOY water sprinklers on major roads\n• ISSUE public health notification via SMS/alerts`;

    return response;
  }

  // ── Query: summarize / summary / overview ──────────────
  if (query.includes('summar') || query.includes('overview') || query.includes('current') || query.includes('air quality')) {
    const guideline = WHO_GUIDELINES[levelKey];
    let response = `📊 **City Air Quality Summary**\n\n`;
    response += `• **City Average AQI:** ${avgAqi} (${level})\n`;
    if (ctx.cityMax) response += `• **Maximum AQI:** ${ctx.cityMax}\n`;
    response += `• **Critical Wards:** ${ctx.criticalCount}/${ctx.wards.length}\n\n`;

    if (sortedWards.length > 0) {
      response += `📍 **Ward Breakdown:**\n`;
      sortedWards.forEach(w => {
        const indicator = w.aqi > 200 ? '🔴' : w.aqi > 150 ? '🟠' : w.aqi > 100 ? '🟡' : '🟢';
        response += `${indicator} ${w.name}: AQI ${w.aqi} (${w.level})${w.spike ? ' ⚡' : ''}\n`;
      });
    }

    response += `\n🏥 **WHO Assessment (${guideline.range}):**\n${guideline.advice}\n`;

    const activeRules = GOVT_RULES.filter(r => (ctx.cityMax || avgAqi) > r.threshold);
    if (activeRules.length > 0) {
      response += `\n⚖️ **Active Government Directives:**\n`;
      activeRules.forEach(r => { response += `• ${r.rule}\n`; });
    }

    if (ctx.alerts.length > 0) {
      response += `\n🚨 **Active Alerts:**\n`;
      ctx.alerts.forEach(a => { response += `• ${a.ward}: ${a.severity} (AQI ${a.aqi})\n`; });
    }

    response += `\n💡 **Recommendation:** ${avgAqi > 200 ? 'Limit outdoor exposure. Vulnerable groups should stay indoors.' : avgAqi > 100 ? 'Sensitive individuals should limit prolonged outdoor exertion.' : 'Air quality is acceptable for most activities.'}`;

    return response;
  }

  // ── Default: general response ──────────────────────────
  const guideline = WHO_GUIDELINES[levelKey];
  let response = `📊 **GovAir AI — Air Quality Analysis**\n\n`;
  response += `Regarding your query: "${message}"\n\n`;
  response += `**Current Conditions:**\n`;
  response += `• City Average AQI: **${avgAqi}** (${level})\n`;
  if (worstWard) response += `• Highest AQI: ${worstWard.name} at **${worstWard.aqi}**\n`;
  if (bestWard) response += `• Lowest AQI: ${bestWard.name} at **${bestWard.aqi}**\n`;
  response += `• Critical Wards: ${ctx.criticalCount}/${ctx.wards.length}\n\n`;
  response += `🏥 **WHO Assessment:**\n${guideline.advice}\n\n`;

  if (avgAqi > 150) {
    const rules = GOVT_RULES.filter(r => avgAqi > r.threshold);
    if (rules.length > 0) {
      response += `⚖️ **Active Government Directives:**\n`;
      rules.forEach(r => { response += `• ${r.rule}\n`; });
    }
  }

  response += `\n💡 For specific information, try asking:\n• "Why is Ward 6 critical?"\n• "What should elderly people do?"\n• "Which wards need emergency action?"\n• "Summarize current air quality"`;

  return response;
}


// ─────────────────────────────────────────────────────────
//  Role-based system prompts (for Gemini when available)
// ─────────────────────────────────────────────────────────
const getSystemPrompt = (userRole, context) => {
  const { ward_id, city, current_aqi, predicted_aqi, source_contribution, health_data } = context;

  const basePrompt = `You are "GovAir AI" — an official AI assistant for the Government Air Quality & Pollution Management Platform.

You operate inside a GOVERNMENT SYSTEM.

Your purpose is to:
• Inform citizens
• Assist government officers
• Support policy makers
• Explain air quality data using verified sources
• NEVER speculate
• NEVER provide political opinions
• NEVER override government authority
• ALWAYS stay factual, neutral, and explainable

You must strictly follow ROLE-BASED BEHAVIOR.

Current Context:
- City: ${city || 'Delhi'}
- User Role: ${userRole}
${ward_id ? `- Ward ID: ${ward_id}` : ''}
${current_aqi ? `- Current AQI: ${current_aqi}` : ''}
${predicted_aqi ? `- Predicted AQI: ${JSON.stringify(predicted_aqi)}` : ''}
${source_contribution ? `- Source Contribution: ${JSON.stringify(source_contribution)}` : ''}
${health_data ? `- Health Data: ${JSON.stringify(health_data)}` : ''}

`;

  switch (userRole.toLowerCase()) {
    case 'public':
      return basePrompt + `You are speaking to a PUBLIC USER (not logged in).
- Provide general information about air quality
- Explain AQI levels and what they mean
- Share public health advisories
- Direct users to official resources
- Do NOT provide personalized data or predictions
- Keep responses simple and accessible`;

    case 'citizen':
      return basePrompt + `You are speaking to a REGISTERED CITIZEN.
- Provide personalized air quality information for their ward
- Explain current AQI and what it means for their health
- Share health recommendations based on current conditions
- Explain predicted AQI trends
- Guide them on how to report pollution issues
- Provide actionable advice for reducing personal exposure
- Explain their ward's pollution sources if available`;

    case 'officer':
      return basePrompt + `You are speaking to a GOVERNMENT OFFICER.
- Provide detailed technical air quality data
- Explain pollution source contributions
- Assist with data analysis and trends
- Support decision-making with factual data
- Explain health impact data for their assigned zones
- Provide insights for enforcement actions
- Help interpret prediction models
- NEVER make policy decisions - only provide data and analysis`;

    case 'admin':
      return basePrompt + `You are speaking to a GOVERNMENT ADMINISTRATOR.
- Provide comprehensive system-wide air quality analysis
- Explain city-wide trends and patterns
- Support policy simulation analysis
- Provide detailed source contribution analysis
- Explain health impact assessments
- Assist with strategic decision-making
- Provide data-driven insights for policy planning
- Explain prediction model outputs in detail
- NEVER make policy decisions - only provide analysis and recommendations based on data`;

    default:
      return basePrompt + `Provide general information about air quality and the platform.`;
  }
};


// ─────────────────────────────────────────────────────────
//  MAIN CHAT HANDLER
//  Tries Gemini API first, falls back to local RAG engine
// ─────────────────────────────────────────────────────────
export const chat = async (req, res) => {
  try {
    const { message, user_role, ward_id, city, current_aqi, predicted_aqi, source_contribution, health_data, ward_context } = req.body;

    if (!message || !user_role) {
      return res.status(400).json({
        success: false,
        message: 'Message and user_role are required',
      });
    }

    // ── TRY GEMINI FIRST ──────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    let text = null;

    if (apiKey && apiKey !== 'your_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const context = {
          ward_id: ward_id || null,
          city: city || 'Delhi',
          current_aqi: current_aqi || null,
          predicted_aqi: predicted_aqi || null,
          source_contribution: source_contribution || null,
          health_data: health_data || null,
        };
        const systemPrompt = getSystemPrompt(user_role, context);

        const modelOptions = [
          { model: 'gemini-2.0-flash' },
          { model: 'gemini-1.5-flash' },
          { model: 'gemini-1.5-pro' },
        ];

        for (const modelOption of modelOptions) {
          try {
            const model = genAI.getGenerativeModel(modelOption);
            const fullPrompt = `${systemPrompt}\n\n${ward_context ? `Live Ward Data:\n${ward_context}\n\n` : ''}User Question: ${message}\n\nAssistant Response:`;
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            text = response.text();
            console.log(`✅ Gemini response via ${modelOption.model}`);
            break;
          } catch (err) {
            console.log(`⚠️  Model ${modelOption.model} failed: ${err.message.substring(0, 80)}`);
            continue;
          }
        }
      } catch (err) {
        console.log(`⚠️  Gemini unavailable: ${err.message.substring(0, 80)}`);
      }
    }

    // ── FALLBACK: LOCAL RAG ENGINE ──────────────────────────
    if (!text) {
      console.log('🧠 Using local RAG engine (no Gemini API)');
      text = generateLocalResponse(message, ward_context, current_aqi);
    }

    res.status(200).json({
      success: true,
      response: text,
      role: user_role,
      source: text ? 'local_rag' : 'gemini',
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate response',
    });
  }
};
