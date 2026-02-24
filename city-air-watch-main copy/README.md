To build the GovTech website, you need a structured flow that clearly separates the Public, Citizen, and Government experiences.

Here is the step-by-step website flow you should follow during development:

🌐 1. PUBLIC FLOW (Entry Point)
Accessible to everyone before logging in.

A. Page 1: Landing Page (Home)

Header: Logo, Navigation (Home, Live Map, Login, Register).

Hero Section:

Headline: "Smart Pollution Action for [City Name]"

Live Widget: Display Current City Average AQI (e.g., "150 AQI - Moderate").

Search Bar: "Enter Pincode or Ward."

Features: Icons explaining "Clean Route," "Earn Credits," and "AI Reporting."

Footer: Emergency numbers and Copyright.

B. Page 2: Registration

Toggle Switch: [ Citizen ] vs [ Government ].

Citizen Form: Name, Email, Password, Home Ward (Dropdown).

Govt Form: Name, Employee ID, Official Email, Password, Assigned Zone.

C. Page 3: Login

Input: Email & Password.

Backend Logic:

If User == Citizen → Redirect to Page 4.

If User == Official → Redirect to Page 8.

👤 2. CITIZEN FLOW (Logged In)
Focus: Personal usage, reporting, and rewards.

D. Page 4: Citizen Dashboard (Home)

Header: "Welcome, [Name] | Wallet: 450 Credits".

My Ward Status: Card showing the AQI of the user's specific ward.

Simple Map: Shows the user's 5km radius with Safe (Green) or Unsafe (Red) zones.

Quick Actions: Buttons for "Report Issue" and "Find Clean Route".

E. Page 5: Smart Report (AI Camera)

Input: Button to Upload/Take Photo.

Process: Display "AI Detecting..." animation.

Result: "Garbage Burning Detected (98% Confidence)".

Submit: Button to send report to Govt.

Success: "Report Sent! +50 Credits Earned."

F. Page 6: Clean Navigation

Input: Start Point & Destination.

Output: Comparison Card:

Route A: Fast but Polluted (Red).

Route B: Clean & Healthy (Green - Recommended).

Map Display: Visualizes both paths on the map.

G. Page 7: Rewards Wallet

Balance: Big text showing Total Credits.

Coupons: Grid of redeemable offers (e.g., "Free Bus Ticket - 200 Credits").

🏛️ 3. GOVERNMENT FLOW (Logged In)
Focus: Management, Analytics, and Deployment.

H. Page 8: Admin Dashboard (Command Center)

Overview Stats: Total Critical Wards, Active Complaints, Avg City AQI.

Heatmap: Advanced map showing pollution hotspots across the entire city. *

AI Prediction Box: "Warning: AQI predicted to rise in Ward 5 tomorrow."

I. Page 9: Action Center (Task Board)

Kanban View: Columns for New Reports, In Progress, Resolved.

Task Card:

Details: "Garbage Fire in Ward 12".

Evidence: View Photo (uploaded by citizen).

Action: Dropdown to "Assign Crew".

J. Page 10: Broadcast & Alerts

Input: Select Target Ward + Type Message (e.g., "High Dust Alert").

Action: Button to "Send SMS/App Notification".

K. Page 11: Analytics

Charts: Monthly pollution trends, Pollution Source breakdown (Traffic vs Industry).

Export: Button to "Download Monthly Report (PDF)".

---

## 🤖 GovAir AI Chatbot

The platform includes an official AI assistant called "GovAir AI" that provides role-based assistance:

### Features:
- **Role-Based Behavior**: Different responses based on user role (Public, Citizen, Officer, Admin)
- **Context-Aware**: Uses current AQI, predictions, and health data to provide accurate information
- **Factual & Neutral**: Never speculates or provides political opinions
- **Always Available**: Floating chat button accessible from all pages

### Setup:

1. **Backend Environment Variable**:
   Create a `.env` file in the `server/` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

2. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your server `.env` file

3. **Frontend Environment Variable** (optional):
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

### Role-Based Capabilities:

- **Public**: General air quality information and public health advisories
- **Citizen**: Personalized ward data, health recommendations, and reporting guidance
- **Officer**: Technical data analysis, source contributions, and enforcement insights
- **Admin**: System-wide analysis, policy simulation support, and strategic insights

### Troubleshooting: ERR_CONNECTION_REFUSED

If you see `ERR_CONNECTION_REFUSED` when using the chatbot:

1. **Make sure the backend server is running:**
   ```bash
   cd server
   npm run dev
   ```

2. **Check that the server is listening on port 3000:**
   - You should see: `Server running on port 3000`
   - Test with: `curl http://localhost:3000/health`

3. **Verify your `.env` file exists in `server/` directory** with:
   - `GEMINI_API_KEY=your_key_here`
   - `PORT=3000`
   - `MONGODB_URI=...`

4. **Make sure MongoDB is running** (if using local MongoDB)

See `SERVER_SETUP.md` for detailed setup instructions.


