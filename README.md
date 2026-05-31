# 🚀 LazyCoders Portfolio

> A production-ready team portfolio built with Node.js · Express · EJS · TailwindCSS · PostgreSQL

---

## 📋 Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Local Setup](#local-setup)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Running the App](#running-the-app)
7. [Admin Panel](#admin-panel)
8. [Deploy to Render.com](#deploy-to-rendercom)
9. [Features](#features)

---

## Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Runtime    | Node.js 18+              |
| Framework  | Express.js 4             |
| Templates  | EJS                      |
| Styling    | TailwindCSS (CDN)        |
| Database   | PostgreSQL                |
| ORM/Driver | node-postgres (pg)       |
| Sessions   | express-session           |
| CSV Export | json2csv                 |

---

## Project Structure

```
lazycoders-portfolio/
├── server.js              # Main Express app
├── package.json
├── .env                   # Environment variables (DO NOT COMMIT)
├── database.sql           # Database schema
├── generate-placeholders.js
├── views/
│   ├── index.ejs          # Home page
│   ├── projects.ejs       # Projects page
│   ├── contact.ejs        # Contact form
│   ├── admin.ejs          # Admin dashboard
│   ├── admin-login.ejs    # Admin login
│   ├── 404.ejs            # 404 page
│   └── partials/
│       ├── header.ejs     # Shared nav + head
│       └── footer.ejs     # Shared footer + scripts
├── public/
│   ├── style.css          # Custom CSS + 3D effects
│   ├── js/
│   │   └── main.js        # Dark mode, tilt, animations
│   └── images/
│       ├── kartik.jpg
│       ├── atharva.jpg
│       ├── akshay.jpg
│       ├── darshan.jpg
│       └── prajwal.jpg
```

---

## Local Setup

### Prerequisites
- Node.js ≥ 18  →  https://nodejs.org
- PostgreSQL ≥ 14  →  https://postgresql.org/download

### Step 1 — Clone and Install

```bash
# Clone the project
git clone https://github.com/lazycoders/portfolio.git
cd lazycoders-portfolio

# Install dependencies
npm install
```

### Step 2 — Generate Placeholder Images

```bash
node generate-placeholders.js
```

Replace the placeholder images in `public/images/` with real photos when ready.

---

## Database Setup

### Option A — Using psql CLI

```bash
# 1. Log into PostgreSQL
psql -U postgres

# 2. Create the database
CREATE DATABASE lazycoders_db;

# 3. Connect to it
\c lazycoders_db

# 4. Run the schema
\i database.sql

# 5. Verify
\dt
```

### Option B — Using pgAdmin
1. Open pgAdmin → Servers → PostgreSQL
2. Right-click Databases → Create → Database → Name: `lazycoders_db`
3. Open Query Tool on `lazycoders_db`
4. Paste the contents of `database.sql` and run

---

## Environment Variables

Copy `.env` and fill in your values:

```bash
cp .env .env.local   # optional backup
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lazycoders_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

SESSION_SECRET=change_this_to_something_random_32chars
ADMIN_USERNAME=lazycoders
ADMIN_PASSWORD=team2026

PORT=3000
NODE_ENV=development
```

---

## Running the App

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Open: http://localhost:3000

| Route          | Description              |
|----------------|--------------------------|
| `/`            | Home — Team Members      |
| `/projects`    | All 4 Projects           |
| `/contact`     | Contact Form             |
| `/admin/login` | Admin Login              |
| `/admin`       | Admin Dashboard          |
| `/admin/export-csv` | Download messages CSV |

---

## Admin Panel

**URL:** http://localhost:3000/admin  
**Username:** `lazycoders`  
**Password:** `team2026`

Features:
- View all contact form messages
- Delete individual messages
- Export all messages as CSV
- See total visitor count

---

## Deploy to Render.com

Render offers **free PostgreSQL + free Web Service** — perfect for this project.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/lazycoders-portfolio.git
git push -u origin main
```

> ⚠️ Add `.env` to `.gitignore` before pushing!

```bash
echo ".env" >> .gitignore
```

### Step 2 — Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **New** → **PostgreSQL**
3. Name: `lazycoders-db`
4. Plan: **Free**
5. Click **Create Database**
6. Copy the **External Database URL** (you'll need it)

### Step 3 — Run Schema on Render DB

```bash
# Install psql locally if needed, then:
psql "YOUR_RENDER_DATABASE_URL" -f database.sql
```

Or use a GUI like TablePlus / DBeaver with the connection details from Render.

### Step 4 — Deploy Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Name:** `lazycoders-portfolio`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **Environment Variables** — click "Add from .env" or add manually:
   - Parse the Render DB URL into: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   - Or set a single `DATABASE_URL` variable (update server.js to use it)
   - `SESSION_SECRET` = random string
   - `NODE_ENV` = `production`
   - `ADMIN_USERNAME` = `lazycoders`
   - `ADMIN_PASSWORD` = `team2026`

5. Click **Create Web Service**

Render will build and deploy automatically. You'll get a URL like:
`https://lazycoders-portfolio.onrender.com`

### Step 5 — Using DATABASE_URL (Recommended for Render)

Render provides a single `DATABASE_URL`. Update `server.js` Pool config:

```javascript
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host:     process.env.DB_HOST,
        port:     parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);
```

---

## Features

### Core
- ✅ Home page with all 5 team members + hover 3D effects
- ✅ Projects page with all 4 projects + GitHub links
- ✅ Contact form → saves to PostgreSQL
- ✅ Success/error messages after form submission
- ✅ Mobile responsive (TailwindCSS)

### Advanced
- ✅ Dark mode toggle (saves to localStorage)
- ✅ Admin panel (login protected)
- ✅ Admin: view all messages in table
- ✅ Admin: export messages as CSV
- ✅ Admin: delete messages
- ✅ Visitor counter (tracked in DB)
- ✅ 404 page
- ✅ Server-side + client-side form validation
- ✅ Environment variables for all secrets
- ✅ 3D tilt effect on cards (CSS + JS)
- ✅ Animated background blobs
- ✅ Scroll reveal animations

---

## NPM Scripts

```bash
npm start      # Start production server
npm run dev    # Start with nodemon (auto-restart)
```

---

## Customization

### Add Real Team Member Photos
Replace files in `public/images/` with actual photos (JPG/PNG/WebP).
Keep the same filenames: `kartik.jpg`, `atharva.jpg`, etc.

### Update GitHub/LinkedIn Links
Edit the `teamMembers` array in `server.js`.

### Update Project Links
Edit the `projects` array in `server.js`.

---

Made with ♥ by **LazyCoders** — Maharashtra, India 🇮🇳
