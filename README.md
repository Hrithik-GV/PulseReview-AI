# ⚡ PulseReview AI 

**PulseReview AI** is a state-of-the-art, multi-agent AI DevOps platform that acts as a Senior Principal Engineer for your codebase. It automatically intercepts GitHub Pull Requests, analyzes the code using a swarm of specialized AI agents (Security, Bug, Performance, and Quality), and posts detailed, inline code reviews directly to GitHub in seconds.

Built for the **Product Space Hackathon**.

---

## 🚀 Features
* **Real-time Webhook Integration:** Instantly triggers analysis the moment a PR is opened on GitHub.
* **Multi-Agent Swarm (CrewAI + Gemini 1.5):** Runs specialized AI agents in parallel to analyze different aspects of the code.
* **Automated GitHub Comments:** Posts high-level summaries and precise, inline comments directly onto the developer's Pull Request.
* **Hyperspeed Dashboard:** A beautiful, responsive React/Vite dashboard to monitor webhook health, view live workflow telemetry, and read AI reports.
* **Fault-Tolerant Mock Mode:** If the GitHub connection drops or API keys are missing, the backend seamlessly falls back to a simulated diff mode for continuous UI testing.

---

## 🛠️ Technology Stack
* **Frontend:** React, Vite, CSS3 (Glassmorphism, custom animations)
* **Backend:** FastAPI (Python), Uvicorn, background async tasks
* **AI & Orchestration:** Gemini 1.5 API, CrewAI concepts
* **Database:** MongoDB (Local / Atlas) for storing telemetry and review history
* **Integration:** GitHub Apps / Webhooks

---

## 💻 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Hrithik-GV/PulseReview-AI.git
cd "PulseReview AI"
```

### 2. Setup the Python Backend
Open a terminal in the root folder:
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```
**Create a `.env` file inside the `backend` folder:**
```env
# Credentials for Judges to test the platform
GITHUB_TOKEN="your_github_classic_token_here"
GITHUB_WEBHOOK_SECRET="your_webhook_secret_here"
GEMINI_API_KEY="your_gemini_api_key_here"
MONGODB_URI="mongodb://localhost:27017"
```
**Run the backend:**
```bash
python main.py
```

### 3. Setup the React Frontend
Open a *new* terminal in the root folder:
```bash
cd frontend
npm install
npm run dev
```
Open your browser to `http://localhost:5173/` to view the dashboard!

---

## 🧪 Testing the Workflow (For Judges)
1. Ensure both the frontend and backend are running.
2. Open the Dashboard at `http://localhost:5173`.
3. Navigate to the **Repositories** tab and click **Connect Repository**.
4. Enter a public GitHub repository (e.g., `Hrithik-GV/pulsereview-test`) and connect it.
5. Click **Trigger Review** next to the repository in the list.
6. Enter an open **Pull Request Number** that exists in that repository.
7. Click **Execute Agents** and watch the AI swarm analyze the code live in the Workflows tab!
8. Check the Pull Request on GitHub to see the AI's posted comments!
