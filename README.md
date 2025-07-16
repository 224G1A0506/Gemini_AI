# Virtual Assistant

## About the Project

**Virtual Assistant** is a full-stack AI-powered assistant web application. Users can sign up, customize their assistant, and interact using natural language. The assistant can:
- Answer questions and perform smart commands (open YouTube, search Google, play music, tell jokes, etc.)
- Handle user authentication (sign up, sign in, log out)
- Store user preferences and assistant customization
- Integrate with external APIs and services
- Provide a modern, responsive UI

**Tech Stack:**
- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, JWT Auth
- **Deployment:** Render (backend), Vercel (frontend)

---

## Project Structure

```
virtualAssistant/
  backend/         # Node.js/Express API
  frontend/
    vite-project/  # React + Vite frontend
```

---

## 🚀 Deployment Guide

### 1. Backend (Render)
- Push your backend code to GitHub.
- Ensure `backend/package.json` has:
  ```json
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
  ```
- Go to [Render](https://render.com/), create a new Web Service, and connect your repo.
- Set root directory to `backend`.
- Set build command: `npm install` (or leave blank).
- Set start command: `npm start`.
- Add environment variables (from your `.env`).
- In `backend/index.js`, add your Vercel frontend URL to the CORS `allowedOrigins` array.
- Deploy and copy your Render backend URL (e.g., `https://your-backend.onrender.com`).

### 2. Frontend (Vercel)
- Push your frontend code to GitHub.
- In `frontend/vite-project/src/context/UserContext.jsx`, set:
  ```js
  const serverUrl = "https://your-backend.onrender.com";
  // or use: const serverUrl = import.meta.env.VITE_SERVER_URL;
  ```
- (Recommended) In `frontend/vite-project/.env`:
  ```
  VITE_SERVER_URL=https://your-backend.onrender.com
  ```
- Go to [Vercel](https://vercel.com/), create a new project, and connect your repo.
- Set root directory to `frontend/vite-project`.
- Set build command: `npm run build`.
- Set output directory: `dist`.
- Add environment variable `VITE_SERVER_URL` with your Render backend URL.
- Deploy!

---

## 🛠️ Quick Start (Local)

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend/vite-project
npm install
npm run dev
```

---

## 🌐 Live URLs
- **Backend:** [https://gemini-ai-2-kxit.onrender.com](https://gemini-ai-2-kxit.onrender.com)
- **Frontend:** [https://gemini-ai-ub8z.vercel.app](https://gemini-ai-ub8z.vercel.app)

---

## 📝 Notes
- Update CORS in backend for every new frontend deployment URL.
- Use environment variables for easy switching between local and production.
- For any CORS or deployment issues, check logs on Render and Vercel.

---

Happy coding! 🎉
