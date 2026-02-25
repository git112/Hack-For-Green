# Fixing Gemini API 403 Forbidden Error

## Error Message
```
[403 Forbidden] Method doesn't allow unregistered callers
```

## Possible Causes & Solutions

### 1. API Key Not Enabled for Generative Language API

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Generative Language API"
4. Click **Enable** if it's not already enabled
5. Wait a few minutes for the API to activate

### 2. API Key Restrictions

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your API key (starts with `AIzaSy...`)
4. Click on it to edit
5. Under **API restrictions**, make sure:
   - Either "Don't restrict key" is selected, OR
   - "Restrict key" is selected AND "Generative Language API" is in the allowed list
6. Click **Save**

### 3. Invalid or Expired API Key

**Solution:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the new key
4. Update `server/.env`:
   ```env
   GEMINI_API_KEY=your_new_api_key_here
   ```
5. Restart the server

### 4. Wrong Model Name

The code now tries multiple models:
- First: `gemini-pro` (most compatible)
- Fallback: `gemini-1.5-flash` (faster alternative)

If both fail, the error will be shown.

### 5. API Key Format Issue

**Verify your API key:**
```bash
cd server
node -e "require('dotenv').config(); console.log('Key length:', process.env.GEMINI_API_KEY?.length); console.log('Starts with:', process.env.GEMINI_API_KEY?.substring(0, 10));"
```

Should show:
- Length: 39 characters
- Starts with: `AIzaSy...`

## Quick Test

Test your API key directly:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

Replace `YOUR_API_KEY` with your actual key.

## After Fixing

1. Restart the server:
   ```bash
   cd server
   npm run dev
   ```

2. Test the chatbot in your browser

3. Check server logs for any remaining errors

## Still Having Issues?

1. **Check API Quota**: Make sure you haven't exceeded your API quota
2. **Check Billing**: Some APIs require billing to be enabled
3. **Try a New API Key**: Sometimes creating a fresh key resolves issues
4. **Check Server Logs**: Look for specific error messages in the terminal

