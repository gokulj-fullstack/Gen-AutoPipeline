# ⚡ PipeGen — AI-Powered CI/CD Pipeline Generator

> Generate production-ready Jenkins & GitHub Actions pipelines from your project structure using **LLaMA 3.1 8B Instant** via **Groq**.

---

## 🏗️ Architecture

```
pipegen/
├── backend/          ← Node.js + Express API server
│   ├── server.js     ← Main server (Groq + LLaMA integration)
│   ├── package.json
│   └── .env.example
└── frontend/         ← Vanilla HTML/CSS/JS UI
    ├── package.json
    └── public/
        └── index.html
```

**2-Tier Architecture:**
- **Tier 1 (Frontend):** Static HTML served via `serve` — handles all UI, wizard steps, file input, syntax highlighting
- **Tier 2 (Backend):** Express API — calls Groq's LLaMA 3.1 for pipeline generation, stack detection, and customization

---

## 🚀 Quick Start

### 1. Get a Groq API Key (Free)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API Keys** → **Create API Key**
4. Copy your key (starts with `gsk_...`)

### 2. Start the Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GROQ_API_KEY (optional — you can also enter it in the UI)
npm start
```

Backend runs on: `http://localhost:3001`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:5173`

### 4. Open the App
Visit `http://localhost:5173` in your browser.

---

## 🔑 Using the App

1. **Step 1 — API Key:** Enter your Groq API key in the UI
2. **Step 2 — Input:** Paste your folder structure, upload files, or enter a GitHub URL
3. **Step 3 — Configure:** Choose CI/CD tools, deploy target, environments, branch strategy
4. **Step 4 — Detection:** Auto-detects your language, framework, test framework, Docker, IaC
5. **Step 5 — Generate:** LLaMA 3.1 writes your Jenkinsfile + GitHub Actions YAML
6. **Step 6 — Customize:** Ask AI to modify specific stages (e.g. "Add Slack notification on failure")

---

## 🛠️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/detect` | Detect stack from project input |
| POST | `/api/generate` | Generate pipeline code via LLaMA 3.1 |
| POST | `/api/customize` | Modify existing pipeline with instruction |

### `/api/generate` Request Body
```json
{
  "projectInput": "package.json contents or file tree...",
  "deployTarget": "aws",
  "branchStrategy": "gitflow",
  "environments": ["dev", "staging", "prod"],
  "security": ["sast", "deps"],
  "registry": "ghcr",
  "ciTools": ["jenkins", "github-actions"]
}
```

### Headers
```
X-Groq-Api-Key: gsk_your_key_here
```

---

## 🤖 Model

- **Model:** `llama-3.1-8b-instant`
- **Provider:** Groq (ultra-fast inference)
- **Max tokens:** 3000 per generation

---

## 🔧 Configuration

Edit `backend/.env`:
```env
GROQ_API_KEY=gsk_your_key_here   # Optional if passing via header
PORT=3001
```

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| AI | LLaMA 3.1 8B Instant via Groq SDK |
| Fonts | Sora + JetBrains Mono |

---

## 🗺️ Roadmap

- [ ] GitLab CI & Azure DevOps support
- [ ] GitHub repo URL analysis (fetch actual files)
- [ ] Pipeline versioning & diff view
- [ ] Team workspace & approval flow
- [ ] VS Code extension
