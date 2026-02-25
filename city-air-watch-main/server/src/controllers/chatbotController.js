import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLatestStreamData } from '../streamBridge.js';

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
function getDynamicContext() {
  const data = getLatestStreamData();
  if (!data) return { wards: [], alerts: [], cityAvg: 0, cityMax: 0, criticalCount: 0 };

  return {
    wards: data.wards || [],
    alerts: data.active_alerts || [],
    cityAvg: data.city_summary?.avg_aqi || 0,
    cityMax: data.city_summary?.max_aqi || 0,
    criticalCount: data.city_summary?.critical_wards || 0
  };
}

/**
 * Generate intelligent local response based on query + live data
 */
function generateLocalResponse(message, currentAqi) {
  const ctx = getDynamicContext();
  const query = message.toLowerCase();
  const avgAqi = ctx.cityAvg || currentAqi || 100;
  const level = getAqiLevel(avgAqi);
  const levelKey = getAqiLevelKey(avgAqi);

  // Sort wards by AQI descending
  const sortedWards = [...ctx.wards].sort((a, b) => b.aqi - a.aqi);
  const criticalWards = ctx.wards.filter(w => w.aqi > 150);
  const worstWard = sortedWards[0];
  const bestWard = sortedWards[sortedWards.length - 1];

  // ── Query: Greetings ─────────────────────────────────
  if (query.match(/^(hi|hello|hey|greetings|morning|evening|afternoon)/)) {
    return `👋 Hello! I'm **GovAir AI**, your official real-time assistant. I'm currently monitoring ${ctx.wards.length} wards across the city.\n\nThe city average AQI is currently **${avgAqi}** (${level}).\n\nYou can ask me about:\n• Current air quality in specific wards\n• Health advice for sensitive groups\n• Active government rules and restrictions\n• What to do during a pollution spike\n\nHow can I help you today?`;
  }

  // ── Query: who are you / what is this ──────────────────
  if (query.includes('who are you') || query.includes('what are you') || query.includes('purpose') || query.includes('what is this')) {
    return `🤖 I am **GovAir AI**, an intelligent bridging system connected directly to the **Pathway Streaming Engine**.\n\nUnlike traditional bots, I consume a live sub-second stream of sensor data to provide factual, government-verified air quality information. I can help you navigate local pollution levels, understand health impacts, and view active enforcement actions.`;
  }

  // ── Query: PM2.5 / PM10 / pollutants ────────────────────
  if (query.includes('pm2') || query.includes('pm10') || query.includes('pollutant') || query.includes('no2') || query.includes('carbon')) {
    const pWard = worstWard || ctx.wards[0];
    return `🧪 **Pollutant Analysis**\n\nIn the most affected ward (**${pWard.ward_name}**), our sensors are currently detecting:\n• **PM2.5**: ${pWard.pm25} µg/m³\n• **PM10**: ${pWard.pm10} µg/m³\n• **NO2**: ${pWard.no2 || 'N/A'} µg/m³\n\n**Note:** PM2.5 is especially hazardous as these fine particles can enter the bloodstream. The current levels in ${pWard.ward_id} are ${pWard.aqi > 150 ? 'above' : 'within'} safety limits.`;
  }

  // ── Query: rules / construction / industry / restriction ──
  if (query.includes('rule') || query.includes('restriction') || query.includes('construction') || query.includes('industr') || query.includes('grap')) {
    const activeRules = GOVT_RULES.filter(r => (ctx.cityMax || avgAqi) > r.threshold);
    let response = `⚖️ **Government Regulations & GRAP Rules**\n\n`;
    if (activeRules.length > 0) {
      response += `**CURRENTLY ACTIVE:**\n`;
      activeRules.forEach(r => { response += `✅ ${r.rule}\n`; });
    } else {
      response += `Currently, there are no emergency restrictions. However, the standing rules are:\n`;
      GOVT_RULES.forEach(r => { response += `• >${r.threshold} AQI: ${r.rule}\n`; });
    }
    return response;
  }

  // ── Query: highest / worst / max ──────────────────────
  if (query.includes('highest') || query.includes('worst') || query.includes('max')) {
    if (worstWard) {
      return `🚩 The highest AQI in the city is currently in **${worstWard.ward_name}** with a reading of **${worstWard.aqi}** (${worstWard.aqi_level || getAqiLevel(worstWard.aqi)}).\n\nThis is ${worstWard.aqi > 200 ? 'significantly' : 'moderately'} above the city average of ${avgAqi}. Residents in this area should follow "Severe" air quality precautions.`;
    }
  }

  // ── Query: lowest / best / clean ───────────────────────
  if (query.includes('lowest') || query.includes('best') || query.includes('clean') || query.includes('safest')) {
    if (bestWard) {
      return `✅ The lowest (best) air quality is currently in **${bestWard.ward_name}** with an AQI of **${bestWard.aqi}** (${bestWard.aqi_level || getAqiLevel(bestWard.aqi)}).\n\nThis ward is currently the safest area in the city regarding air pollution levels.`;
    }
  }

  // ── Query: how many / count / critical ──────────────────
  if ((query.includes('how many') || query.includes('count')) && (query.includes('critical') || query.includes('ward'))) {
    const count = ctx.criticalCount;
    if (count === 0) {
      return `Currently, there are **no wards** in the critical zone (AQI > 150). All ${ctx.wards.length} monitored wards are performing within acceptable parameters relative to emergency thresholds.`;
    }
    return `There are currently **${count} critical wards** out of ${ctx.wards.length} total monitored wards. These wards have AQI levels exceeding 150 and require active monitoring or intervention.`;
  }

  // ── Query: Ward 6 / industrial / why ──────────────────────
  if (query.includes('ward 6') || query.includes('industrial') || (query.includes('why') && query.includes('critical'))) {
    const ward6 = ctx.wards.find(w => w.ward_name.toLowerCase().includes('industrial') || w.ward_name.toLowerCase().includes('ward 6'));
    if (ward6) {
      const guideline = WHO_GUIDELINES[getAqiLevelKey(ward6.aqi)];
      const rules = GOVT_RULES.filter(r => ward6.aqi > r.threshold);
      let response = `📊 **${ward6.ward_name}** — Current Status\n\n`;
      response += `• AQI: **${ward6.aqi}** (${ward6.aqi_level || getAqiLevel(ward6.aqi)})\n`;
      response += `• Rolling Average: ${ward6.rolling_avg || ward6.avg}\n`;
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
  if (query.includes('elderly') || query.includes('old') || query.includes('health') || query.includes('should') || query.includes('mask') || query.includes('advice')) {
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
  if (query.includes('emergency') || query.includes('action') || query.includes('problem') || query.includes('danger')) {
    if (criticalWards.length === 0) {
      return `✅ **No Emergency Action Required**\n\nAll ${ctx.wards.length} wards are currently within acceptable AQI thresholds (below 150). The city average AQI is ${avgAqi} (${level}).\n\n📊 Continue monitoring — the Pathway Engine is tracking all wards in real-time.`;
    }

    let response = `🚨 **Emergency Action Assessment**\n\n`;
    response += `**${criticalWards.length} out of ${ctx.wards.length} wards** require attention:\n\n`;

    criticalWards.forEach(w => {
      const rules = GOVT_RULES.filter(r => w.aqi > r.threshold);
      response += `**${w.ward_name}** — AQI ${w.aqi} (${w.aqi_level})${w.spike ? ' ⚡SPIKE' : ''}\n`;
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
  if (query.includes('summar') || query.includes('overview') || query.includes('current') || query.includes('air quality') || query.includes('status') || query.includes('today')) {
    const guideline = WHO_GUIDELINES[levelKey];
    let response = `📊 **City Air Quality Summary**\n\n`;
    response += `• **City Average AQI:** ${avgAqi} (${level})\n`;
    if (ctx.cityMax) response += `• **Maximum AQI:** ${ctx.cityMax}\n`;
    response += `• **Critical Wards:** ${ctx.criticalCount}/${ctx.wards.length}\n\n`;

    if (sortedWards.length > 0) {
      response += `📍 **Ward Breakdown:**\n`;
      sortedWards.forEach(w => {
        const indicator = w.aqi > 200 ? '🔴' : w.aqi > 150 ? '🟠' : w.aqi > 100 ? '🟡' : '🟢';
        response += `${indicator} ${w.ward_name}: AQI ${w.aqi} (${w.aqi_level || getAqiLevel(w.aqi)})${w.spike ? ' ⚡' : ''}\n`;
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
      ctx.alerts.forEach(a => { response += `• ${a.ward_name || a.ward}: ${a.severity} (AQI ${a.aqi})\n`; });
    }

    response += `\n💡 **Recommendation:** ${avgAqi > 200 ? 'Limit outdoor exposure. Vulnerable groups should stay indoors.' : avgAqi > 100 ? 'Sensitive individuals should limit prolonged outdoor exertion.' : 'Air quality is acceptable for most activities.'}`;

    return response;
  }


  // ── Default: general response ──────────────────────────
  const guideline = WHO_GUIDELINES[levelKey];

  // If we've reached here and it's not a specific AQI query, 
  // try to be a bit more general but keep the data context.

  let response = `🤖 **GovAir Assistant** (Fallback Mode)\n\n`;

  if (query.includes('help') || query.includes('what can you do')) {
    response += `I am a real-time air quality assistant. Currently, my "Proper AI" (Gemini) is offline, so I'm running in restricted mode.\n\nI can answer anything about:\n• City AQI status\n• Ward-specific pollution\n• Health advisories\n• Government rules\n\nFor general questions about other topics, please try again when my AI engine is reconnected!`;
    return response;
  }

  response += `I'm analyzing the live stream for: "${message}"\n\n`;

  if (avgAqi > 200) {
    response += `⚠️ **Notice:** The city is currently experiencing **${level}** air quality. My analysis shows that several wards (including ${worstWard?.ward_name}) are in the red zone.\n\n`;
  } else {
    response += `The city-wide air quality is currently **${level}** (AQI ${avgAqi}).\n\n`;
  }

  response += `Regarding your question, I can provide specific insights on:\n`;
  response += `• **Health**: ${guideline.advice.substring(0, 100)}...\n`;
  response += `• **Hotspots**: ${worstWard?.ward_name} is the most polluted right now.\n`;
  response += `• **Rules**: ${ctx.cityMax > 200 ? 'Construction is restricted.' : 'No major restrictions active.'}\n\n`;
  response += `Is there something specific about the current AQI or a ward you'd like to know?`;

  return response;
}



// ─────────────────────────────────────────────────────────
//  Role-based system prompts (for Gemini when available)
// ─────────────────────────────────────────────────────────
const getSystemPrompt = (userRole, context) => {
  const { ward_id, city, current_aqi, live_wards } = context;

  return `You are "GovAir AI", a helpful and intelligent AI assistant. 
While you are part of the Government Air Quality platform, you are capable of assisting with ANY question or task the user has.

Context:
- City: ${city || 'Delhi'}
- User Role: ${userRole}
- Current City AQI: ${current_aqi || 'N/A'}
- Live Ward Data: ${JSON.stringify(live_wards || [])}

Instructions:
1. If the user asks about air quality, use the provided live data to give factual, real-time answers.
2. If the user asks about ANYTHING else (history, science, coding, general conversation, etc.), be a helpful general-purpose AI assistant.
3. Keep your tone professional but friendly.
4. If you use the air quality data, mention that it's "live data from the Pathway streaming engine".
5. Do not feel limited to only air quality topics. You are a "proper AI" and should answer "anything".`;
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
        const liveData = getLatestStreamData();
        const context = {
          ward_id: ward_id || null,
          city: city || 'Delhi',
          current_aqi: current_aqi || liveData?.city_summary?.avg_aqi || null,
          predicted_aqi: predicted_aqi || null,
          source_contribution: source_contribution || liveData?.wards?.[0]?.source_contribution || null,
          health_data: health_data || null,
          live_wards: liveData?.wards || []
        };
        const systemPrompt = getSystemPrompt(user_role, context);

        const modelOptions = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];

        for (const modelName of modelOptions) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}`;
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            text = response.text();
            console.log(`✅ Gemini response via ${modelName}`);
            break;
          } catch (err) {
            console.error(`⚠️  Model ${modelName} failed: ${err.message}`);
            continue;
          }
        }
      } catch (err) {
        console.error(`⚠️  Gemini Engine error: ${err.message}`);
      }
    }

    // ── FALLBACK: LOCAL RAG ENGINE ──────────────────────────
    if (!text) {
      console.log('🧠 Using local RAG engine (no Gemini API)');
      text = generateLocalResponse(message, current_aqi);
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
