# 🛡️ SafePay — Contextual Fraud Detection Dashboard

A full-stack fraud detection system that uses a **Contextual Risk Engine** to score, classify, and explain suspicious transactions in real time.

> Built with React, Express.js, MySQL, and a custom weighted risk scoring algorithm.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🎯 What Does It Do?

SafePay replaces the traditional "if amount > X, block it" approach with a **multi-signal contextual risk engine** that analyzes transactions the way a human fraud analyst would — by looking at **patterns, context, and behavior**, not just one number.

### The Problem
Static fraud rules are easily bypassed. A fraudster can stay under the amount threshold, or a legitimate high-value transaction gets blocked unnecessarily.

### The Solution
A **weighted scoring system** that combines 4 independent signals to produce a single risk score (0.0 – 1.0), with **explainable reasons** for every decision.

---

## 🧠 How the Risk Engine Works

### 4 Signals, 1 Score

| Signal | Weight | What It Detects |
|--------|--------|----------------|
| **Amount Deviation** | 30% | How far is this amount from the customer's average? |
| **Velocity** | 40% | How many transactions in the last 15 minutes? (Bot detection) |
| **Time & Context** | 10% | Late-night (12am–5am) or international transactions |
| **Account Changes** | 20% | Was the password changed recently? (Account takeover) |

### Tiered Actions

| Risk Score | Level | Action | Dashboard Color |
|-----------|-------|--------|----------------|
| 0.00 – 0.40 | 🟢 LOW | Approve | Green |
| 0.41 – 0.75 | 🟡 MEDIUM | Challenge (Verify Identity) | Amber |
| 0.76 – 1.00 | 🔴 HIGH | Block | Red |

### Critical Overrides
- If **any single signal** maxes out (1.0), the score is forced to at least **0.5** (Medium Risk)
- If the **Amount Deviation** signal is ≥ 0.9, the score is forced to at least **0.8** (High Risk)
- This prevents a $1,000,000 transaction from being "Approved" just because it happened during daytime

### Explainable Decisions
Every transaction includes **human-readable reasons**:
```json
{
  "riskScore": 0.82,
  "riskLevel": "HIGH",
  "action": "BLOCK",
  "reasons": [
    "Unusual amount: 150% above customer average",
    "Risk context: international transaction",
    "Recent account change: password modified within 24 hours"
  ]
}
```

---

## 🏗️ Architecture

```
┌─────────────────────┐         HTTP/REST API        ┌──────────────────────┐
│   React Frontend    │ ◄──────────────────────────► │   Express Backend    │
│   (localhost:5173)  │    GET  /api/fraudAlert       │   (localhost:5000)   │
│                     │    POST /api/transactions     │                     │
│  • Dashboard UI     │    DEL  /api/transactions/:id │  • REST API Routes  │
│  • Color-coded      │                               │  • Risk Engine      │
│    Transaction Table│                               │  • DB Connection    │
│  • Risk Modals      │                               │    Pool             │
└─────────────────────┘                               └──────────┬─────────┘
                                                                 │ SQL
                                                      ┌──────────▼─────────┐
                                                      │   MySQL Database   │
                                                      │  safepay_records   │
                                                      └────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MySQL** (v8+)
- **npm** (v9+)

### 1. Clone the Repository
```bash
git clone https://github.com/Tofunmi2003/safepay-fraud-dashboard.git
cd safepay-fraud-dashboard
```

### 2. Set Up the Database
```sql
CREATE DATABASE transactions;
USE transactions;

CREATE TABLE safepay_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer VARCHAR(255),
  amount DECIMAL(12,2),
  location VARCHAR(255),
  is_international TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  password_changed_at DATETIME DEFAULT NULL
);
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=transactions
```

### 4. Install Dependencies & Run

**Backend:**
```bash
npm install
node server.js
# Server runs on http://localhost:5000
```

**Frontend:**
```bash
cd safepay-frontend
npm install
npm run dev
# Dashboard runs on http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/fraudAlert` | Fetch all transactions with risk scores & stats | `{ stats, transactions }` |
| `POST` | `/api/transactions` | Add a new transaction & get instant risk assessment | `{ transactionId, riskAssessment }` |
| `DELETE` | `/api/transactions/:id` | Remove a transaction | `{ message }` |

---

## 🛡️ Security Features

- **SQL Injection Prevention** — Parameterized queries with `?` placeholders
- **Environment Variables** — Database credentials stored in `.env`, never in code
- **CORS Configuration** — Cross-Origin Resource Sharing enabled for frontend-backend communication
- **Input Validation** — Server-side validation of all incoming data
- **.gitignore** — Sensitive files (`db.js`, `.env`) excluded from version control

---

## 🖥️ Dashboard Features

- **Real-Time Stats Cards** — Live counts of Approved / Challenged / Blocked transactions
- **Color-Coded Transaction Table** — Green (safe), Amber (suspicious), Red (blocked)
- **Expandable Risk Details** — Click any row to see signal breakdown with visual bars
- **Tiered Fraud Modals** — Amber modal for "Verify Identity", Red modal for "Blocked"
- **Password Change Simulator** — Toggle to test account takeover scenarios
- **Responsive Design** — Works on desktop and mobile

---

## 📂 Project Structure

```
safepay-fraud-dashboard/
├── server.js              # Express API server (routes + middleware)
├── safePay.js             # Contextual Risk Engine (4 signals + scoring)
├── db.js                  # MySQL connection pool (gitignored)
├── .env                   # Database credentials (gitignored)
├── .gitignore             # Security: excludes db.js and .env
└── safepay-frontend/
    ├── src/
    │   ├── App.jsx                    # Main app (state management + API calls)
    │   ├── components/
    │   │   ├── Sidebar.jsx            # Navigation sidebar
    │   │   ├── StatsCard.jsx          # Animated stats cards
    │   │   ├── TransactionForm.jsx    # Transaction input form
    │   │   ├── TransactionTable.jsx   # Color-coded transaction table
    │   │   └── FraudModal.jsx         # Tiered risk alert modals
    │   └── index.css                  # Global styles (Tailwind)
    ├── tailwind.config.js             # Tailwind CSS configuration
    └── vite.config.js                 # Vite build configuration
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Component-based UI with fast HMR |
| **Styling** | Tailwind CSS v3 | Utility-first responsive design |
| **Animations** | Framer Motion | Smooth UI transitions and modal animations |
| **Icons** | Lucide React | Modern icon library |
| **Backend** | Node.js + Express.js | REST API server |
| **Database** | MySQL + mysql2/promise | Persistent data storage with connection pooling |
| **Security** | dotenv + CORS | Credential management + cross-origin access |

---

## 🔮 Future Improvements

- [ ] User authentication (JWT login/signup)
- [ ] Geolocation-based risk signal
- [ ] Machine learning model integration
- [ ] Real-time WebSocket updates
- [ ] Transaction history graphs (Chart.js)
- [ ] Deploy to cloud (Render/Railway + PlanetScale)

---

## 👤 Author

**Tofunmi** — Full-Stack Developer

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
