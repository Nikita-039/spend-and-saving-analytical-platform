# SpendIQ — Spend & Saving Analytics Platform

A full-stack MERN application for analyzing organizational spending, monitoring budgets, and managing spend records.

## 🔑 Test Login Credentials

| Role | Email | Password |
|---|---|---|
| Demo | `demo@spend.com` | `Demo@123` |
| Analyst | `analyst@spend.com` | `Analyst@123` |

## 🛠 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Custom Design System) |
| Charts | Recharts |
| Table | TanStack Table v8 |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Authentication | JWT + bcryptjs |
| Database | MongoDB Atlas (Mongoose ODM) |

## 📁 Project Structure

```
spend-and-saving-analytical-platform/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── controllers/          # Auth & Record controllers
│   │   ├── middleware/           # JWT auth, error handler
│   │   ├── models/               # User, SpendRecord schemas
│   │   ├── routes/               # API routes
│   │   ├── seed/seeder.js        # Database seeder
│   │   └── server.js             # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/axios.js          # Axios instance + API helpers
    │   ├── components/           # Charts, KPI, Table, UI
    │   ├── context/              # Auth + Records context
    │   ├── pages/                # Login, Dashboard, DataTable
    │   └── utils/formatters.js   # Shared utilities
    └── package.json
```

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier is fine)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd spend-and-saving-analytical-platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/spend_analytics?retryWrites=true&w=majority
JWT_SECRET=spend_analytics_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Database Setup
**Create a MongoDB Atlas cluster:**
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user
4. Whitelist your IP (or use `0.0.0.0/0` for all)
5. Copy the connection string into `.env` as `MONGO_URI`

**Seed the database:**
```bash
npm run seed
```
This creates 80 realistic spend records + 2 test user accounts.

### 4. Start the Backend
```bash
npm run dev    # Development (with nodemon)
# or
npm start      # Production
```
Backend runs on `http://localhost:5000`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

The Vite proxy is configured to forward `/api/*` calls to `http://localhost:5000`.

## 🚀 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Records (Protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/records` | List records (filter, sort, paginate) |
| POST | `/api/records` | Create record |
| PUT | `/api/records/:id` | Update record |
| DELETE | `/api/records/:id` | Delete record |
| GET | `/api/records/summary` | Dashboard KPI + chart data |
| GET | `/api/records/options` | Filter dropdown options |

## ✨ Features

### Dashboard
- **8 KPI Cards**: Total Budget, Actual Spend, Savings, Savings %, Records, Approval Rate, Top Vendor, Top Location
- **5 Chart Types**: Line (monthly trend), Bar (by BU), Donut Pie (by category), Stacked Bar, Area (cumulative savings)
- **8 Data-Driven Insights**: Dynamically computed and filter-aware

### Global Filters
Date Range · Business Unit · Category · Vendor · Location · Status · Reset

### Spend Data Table
- Search, Sort, Pagination
- Column Resizing, Reordering, Pinning, Show/Hide
- **Inline Editing** for Budget, Actual Spend, Category (double-click)
- Delete records

### Add Record
- Full form modal with all fields
- Auto-calculated Savings and Savings %
- Client + server validation

## 🌐 Deployment

### Backend (Railway or Render)
1. Push code to GitHub
2. Create new Railway/Render project from repo
3. Set environment variables (MONGO_URI, JWT_SECRET, etc.)
4. Deploy from `backend/` directory with start command `npm start`

### Frontend (Vercel)
1. Import repo in Vercel
2. Set root to `frontend/`
3. Set `VITE_API_URL` env var to your deployed backend URL
4. Update Vite config to use env variable instead of proxy
5. Deploy

## 📊 Sample Data
The seeder generates 80 records across:
- **Business Units**: Engineering, Marketing, Sales, Operations, Finance, HR, Legal, Product
- **Categories**: Software, Hardware, Travel, Consulting, Cloud Services, Training, Facilities, etc.
- **Vendors**: AWS, Microsoft, Salesforce, Google Cloud, Oracle, Adobe, and more
- **Locations**: New York, San Francisco, London, Singapore, Mumbai, Chicago, Austin, Seattle
- **Date Range**: Last 18 months
