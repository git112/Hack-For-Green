# 🚀 Deployment Guide: CleanAirGov

This guide outlines the steps to deploy the CleanAirGov platform to a live production environment.

## 🛠️ Deployment Options

### Option 1: Render / Railway (Recommended for Ease)
Render and Railway are the easiest platforms for deploying multi-service apps.

1.  **Database**: Create a free **MongoDB Atlas** cluster.
    -   Get the Connection String (e.g., `mongodb+srv://...`).
2.  **Backend**: Connect your GitHub repo to Render/Railway.
    -   Point to the `server/` directory.
    -   Set Environment Variables: `MONGODB_URI`, `GEMINI_API_KEY`, `JWT_SECRET`.
3.  **Frontend**: Connect your GitHub repo.
    -   Render/Vercel handles the production build automatically.
    -   Set `VITE_API_URL` to your live backend URL.
4.  **Pathway**: Use a "Web Service" on Render or Railway using the `pathway_service/Dockerfile`.

### Option 2: Docker (Best for Advanced Users/VPS)
I have provided Dockerfiles for all 3 services and a `docker-compose.yml`.

1.  **Clone the repo** on your VPS (DigitalOcean, AWS, etc.).
2.  **Install Docker & Docker Compose**.
3.  **Configure Environment**: Create a `.env` file in the root:
    ```env
    GEMINI_API_KEY=your_key
    JWT_SECRET=your_secret
    ```
4.  **Run**:
    ```bash
    docker-compose up -d --build
    ```

---

## 🔑 Crucial Environment Variables

| Variable | Required In | Purpose |
| :--- | :--- | :--- |
| `MONGODB_URI` | Backend | Connection to your database |
| `GEMINI_API_KEY` | Backend & Pathway | Powers AI Reporting & RAG Chatbot |
| `JWT_SECRET` | Backend | Used to secure user sessions |
| `VITE_API_URL` | Frontend | URL of your deployed backend |

## 🌐 Moving to Production Checklist
- [ ] Change `localhost:3000` references to your live backend domain.
- [ ] Ensure MongoDB Atlas IP Whitelisting is set to `0.0.0.0/0` (access from anywhere).
- [ ] Secure your Gemini API key (never commit it to GitHub).
- [ ] Monitor logs via `pm2 logs` (if on VPS) or the service dashboard.

---
Need help with a specific platform? Just ask!
