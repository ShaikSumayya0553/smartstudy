# SmartStudy – AI-Powered Personalized Study Planner & ML Engine

**SmartStudy** is a full-stack web application designed to empower students with AI-driven personalized study plans and supervised machine learning performance predictions.

---

## 🌟 Key Features

1. **User Authentication & Profiles**:
   - Secure JWT token-based authentication with `bcrypt` password hashing.
   - Customized study profile setup (subjects, skill levels: Beginner/Intermediate/Advanced, available study hours, target exam date, target score).

2. **AI-Generated Personalized Study Plans**:
   - Integrated with **LLM API** (Google Gemini API / OpenAI) with intelligent rule-based fallback.
   - Structured plan items: `Subject`, `Topic`, `Duration`, `Priority` (High/Medium/Low), and actionable `Recommendation`.
   - AI Strategic Overview summary tailored to days remaining before exam.

3. **Daily/Weekly Task Management**:
   - Complete daily checklist filterable by subject and status.
   - Instant completion toggle and study hour logging per task.

4. **Supervised ML Performance Predictor**:
   - Trained **Scikit-Learn Model** (`RandomForestRegressor` + `StandardScaler`).
   - Predicts student's expected exam score (0–100%) based on cumulative study hours, tasks completed, completion rate, past quiz averages, and study consistency streak.
   - Interactive **What-If Simulator** to visualize how altering study habits impacts predicted exam results.

5. **MongoDB Database Persistence**:
   - Stores user accounts, study profiles, AI generated plans, tasks, performance history, and prediction logs.
   - Integrated fallback memory engine ensuring 100% server stability.

6. **Modern High-Impact Dashboard**:
   - Built with React, Vite, Tailwind CSS & Recharts.
   - Responsive glassmorphism aesthetic with real-time score gauges and subject-wise progress analytics.

---

## 🏗 Architecture & Tech Stack

```
                 React Frontend (Vite + Tailwind CSS)
                       |
                       ↓
                 FastAPI Backend (Python)
                       |
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       AI Service   ML Service   MongoDB
     (LLM Planner)  (Scikit-Learn) (Atlas/Local)
          └────────────┼────────────┘
                       ↓
                 React Dashboard
```

- **Frontend**: React, Vite, Axios, Tailwind CSS, Recharts, Lucide Icons.
- **Backend**: Python 3.13, FastAPI, PyMongo, Pydantic, PyJWT, Passlib/Bcrypt.
- **ML**: Scikit-Learn (`RandomForestRegressor`, `StandardScaler`), Pandas, NumPy, Joblib.
- **AI**: Gemini Generative AI API integration with dynamic structured fallback generator.

---

## 🚀 Getting Started

### 1. Backend Setup & Startup

```bash
cd backend
# Create virtual environment (if not already created)
py -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train initial ML Model
python train.py

# Start FastAPI server
uvicorn main:app --reload --port 8000
```
Backend API will be running at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

### 2. Frontend Setup & Startup

```bash
cd frontend
npm install
npm run dev
```
Frontend Web App will be running at `http://localhost:3000`.

---

## 🧪 ML Model Details

- **Input Features**:
  1. `study_hours`: Total accumulated study hours
  2. `tasks_completed`: Count of completed study tasks
  3. `completion_rate`: Ratio of completed vs assigned tasks (0.0 to 1.0)
  4. `avg_past_score`: Average past quiz/test score (0–100)
  5. `days_studied`: Study consistency streak
- **Target**: `predicted_score` (Final exam score 0–100%)
- **Performance Metrics**:
  - $R^2$ Score: ~0.85
  - Mean Absolute Error (MAE): ~3.3%

---

## 📝 API Routes Summary

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Fetch authenticated user
- `GET / POST /api/profile` - Manage study profile
- `POST /api/study-plan/generate` - Generate AI personalized study plan
- `GET /api/study-plan` - Get latest active study plan
- `GET / POST / PUT / DELETE /api/tasks` - Manage study tasks
- `POST /api/predict` - Run ML performance prediction
- `POST /api/predict/log-score` - Log actual test scores and study hours
- `GET /api/dashboard` - Unified dashboard metrics & analytics payload
