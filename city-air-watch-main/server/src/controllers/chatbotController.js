import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI - check API key when actually needed (lazy initialization)
let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
      console.warn('⚠️  Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
      return null;
    }
    console.log('✅ Initializing Gemini AI with API key:', apiKey.substring(0, 15) + '...');
    try {
      genAI = new GoogleGenerativeAI(apiKey);
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
      return null;
    }
  }
  return genAI;
};

// Role-based system prompts
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

export const chat = async (req, res) => {
  try {
    const { message, user_role, ward_id, city, current_aqi, predicted_aqi, source_contribution, health_data } = req.body;

    if (!message || !user_role) {
      return res.status(400).json({
        success: false,
        message: 'Message and user_role are required',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key not configured. Please set GEMINI_API_KEY in your .env file.',
      });
    }

    // Initialize Gemini AI directly (simpler and more reliable)
    let genAI;
    try {
      genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
      return res.status(500).json({
        success: false,
        message: `Failed to initialize Gemini AI: ${error.message}. Please check your API key.`,
      });
    }

    // Build context
    const context = {
      ward_id: ward_id || null,
      city: city || 'Delhi',
      current_aqi: current_aqi || null,
      predicted_aqi: predicted_aqi || null,
      source_contribution: source_contribution || null,
      health_data: health_data || null,
    };

    // Get role-based system prompt
    const systemPrompt = getSystemPrompt(user_role, context);

    // Initialize the model - try different model identifiers
    // Note: Model names may vary by API version and availability
    let model;
    let text;
    
    // Try models in order of preference
    const modelOptions = [
      { model: 'gemini-1.5-flash' },  // Latest fast model
      { model: 'gemini-1.5-pro' },    // Latest pro model
      { model: 'gemini-pro' },         // Legacy model
    ];
    
    let lastError = null;
    for (const modelOption of modelOptions) {
      try {
        model = genAI.getGenerativeModel(modelOption);
        const fullPrompt = `${systemPrompt}\n\nUser Question: ${message}\n\nAssistant Response:`;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        text = response.text();
        console.log(`✅ Successfully used model: ${modelOption.model}`);
        break;
      } catch (error) {
        lastError = error;
        console.log(`⚠️  Model ${modelOption.model} failed: ${error.message.substring(0, 100)}`);
        continue;
      }
    }
    
    if (!text) {
      throw new Error(`All model attempts failed. Last error: ${lastError?.message || 'Unknown error'}. Please verify your API key has access to Gemini models.`);
    }

    res.status(200).json({
      success: true,
      response: text,
      role: user_role,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    
    let errorMessage = 'Failed to generate response';
    
    if (error.message && error.message.includes('403')) {
      errorMessage = 'API Key authentication failed. Please verify:\n' +
        '1. Your API key is valid at https://makersuite.google.com/app/apikey\n' +
        '2. The Generative Language API is enabled in Google Cloud Console\n' +
        '3. The API key has proper permissions';
    } else if (error.message && (error.message.includes('API key') || error.message.includes('404'))) {
      // 404 usually means model not found, but could also be API key issue
      errorMessage = `API Error: ${error.message}\n\nPlease check:\n` +
        '1. Your API key is valid and has access to Gemini models\n' +
        '2. The Generative Language API is enabled in Google Cloud Console\n' +
        '3. Your API key has not expired or been revoked';
    } else {
      errorMessage = error.message || 'Failed to generate response';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

