/**
 * LazyCoders Portfolio — server.js
 * Express + EJS + PostgreSQL backend
 */

require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const session = require("express-session");
const { Parser } = require("json2csv");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// PostgreSQL Connection Pool (Render Compatible)
// ─────────────────────────────────────────────
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Required for Render
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "lazycoders_db",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "",
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
      }
);

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    console.error(
      "   Check your DATABASE_URL or .env credentials and make sure PostgreSQL is running."
    );
  } else {
    console.log("Connected to PostgreSQL");
    release();
  }
});

// ─────────────────────────────────────────────
// App Configuration
// ─────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "lazycoders_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

// ─────────────────────────────────────────────
// Data: Team Members (roles and skills removed)
// ─────────────────────────────────────────────
const teamMembers = [
  {
    name: "Kartik Gurve",
    photo: "/images/kartik.PNG",
    github: "https://github.com/gurvekartik6",
    linkedin: "https://www.linkedin.com/in/kartik-gurve-17290521b/",
  },
  {
    name: "Atharva Deotare",
    photo: "/images/atharva.png",
    github: "https://github.com/deotareatharva-hub",
    linkedin: "https://www.linkedin.com/in/atharva-deotare-371b42324",
  },
  {
    name: "Akshay Kamble",
    photo: "/images/akshay.jpeg",
    github: "https://github.com/akshaykamble",
    linkedin: "https://linkedin.com/in/akshay-kamble",
  },
  {
    name: "Darshan Bijewar",
    photo: "/images/darshan.jpeg",
    github: "https://github.com/darshanbijewar1-del",
    linkedin: "https://www.linkedin.com/in/darshan-bijewar-12515a339",
  },
  {
    name: "Prajwal Fupare",
    photo: "/images/prajwal.jpg",
    github: "https://github.com/prajwalfupare",
    linkedin: "https://linkedin.com/in/prajwal-fupare",
  },
];

// ─────────────────────────────────────────────
// Data: Projects (with clear descriptions)
// ─────────────────────────────────────────────
const projects = [
  {
    name: "Jan Consent",
    tagline: "Digital Consent System",
    description:
      "Jan Consent is a revolutionary digital consent management platform built on blockchain technology. It allows citizens to grant, track, and revoke consent for data sharing across government and private services. The system eliminates paperwork, ensures transparency, and creates an immutable audit trail for every consent transaction. Ideal for healthcare authorizations, legal agreements, and KYC processes.",
    tech: ["Blockchain", "Solidity", "Web3.js", "Node.js", "Ethereum"],
    github: "https://github.com/teamlazycoder/JanConsent",
    // emoji: "🔗",
  },
  {
    name: "Krishak Mitra AI",
    tagline: "AI-Powered Farmer Assistant for Indian Agriculture",
    description:
      "Krishak Mitra AI is an intelligent virtual assistant designed specifically for Indian farmers. Using advanced computer vision and machine learning, it detects crop diseases from smartphone photos, provides weather forecasts and soil analysis, and predicts market prices for better selling decisions. The system works in multiple Indian languages through voice and text interfaces, making advanced agricultural technology accessible to rural farmers.",
    tech: ["Python", "TensorFlow", "Flask", "OpenCV", "NLP"],
    github: "https://github.com/teamlazycoder/KrishakMitraAI",
    // emoji: "🌾",
  },
  {
    name: "Maternal System",
    tagline: "Comprehensive Healthcare Platform for Mothers & Children",
    description:
      "The Maternal System is a full-featured healthcare platform that tracks maternal health from pregnancy through postpartum care. It manages prenatal checkup schedules, vaccination records for children under five, growth milestone tracking, and connects patients directly with healthcare providers. The system sends automated reminders for appointments and vaccinations via SMS and email, reducing missed care visits and improving health outcomes for mothers and children in underserved communities.",
    tech: ["React", "Node.js", "PostgreSQL", "Twilio", "Express"],
    github: "https://github.com/lazycoders/maternal-system",
    // emoji: "🏥",
  },
  {
    name: "Industrial Wastewater Management",
    tagline: "IoT + ML Solution for Water Treatment Compliance",
    description:
      "This end-to-end environmental monitoring system combines IoT sensors with machine learning to manage industrial wastewater in real-time. Sensors placed in treatment plants continuously monitor pH levels, chemical concentrations, temperature, and turbidity. The ML model predicts contamination trends before they exceed safety limits and automatically triggers treatment adjustments. The system ensures regulatory compliance, reduces environmental impact, and provides detailed reporting for audits and certifications.",
    tech: ["IoT", "Python", "Scikit-learn", "MQTT", "Arduino", "React"],
    github: "https://github.com/lazycoders/wastewater-mgmt",
    // emoji: "🏭",
  },
];

// ─────────────────────────────────────────────
// Helper: Track Visitor
// ─────────────────────────────────────────────
async function trackVisitor(req, page = "/") {
  try {
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    await pool.query(
      "INSERT INTO visitors (ip_address, page) VALUES ($1, $2)",
      [ip, page]
    );
  } catch (e) {
    /* silently ignore if visitors table doesn't exist */
  }
}

async function getVisitorCount() {
  try {
    const res = await pool.query("SELECT COUNT(*) FROM visitors");
    return parseInt(res.rows[0].count) || 0;
  } catch (e) {
    return 0;
  }
}

// ─────────────────────────────────────────────
// Middleware: Admin Auth Guard
// ─────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.redirect("/admin/login");
}

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

/** HOME PAGE */
app.get("/", async (req, res) => {
  await trackVisitor(req, "/");
  const visitors = await getVisitorCount();
  res.render("index", { teamMembers, visitors, page: "home" });
});

/** PROJECTS PAGE */
app.get("/projects", async (req, res) => {
  await trackVisitor(req, "/projects");
  res.render("projects", { projects, page: "projects" });
});

/** CONTACT PAGE (GET) */
app.get("/contact", (req, res) => {
  res.render("contact", {
    page: "contact",
    success: req.query.success === "1",
    error: req.query.error || null,
  });
});

/** CONTACT PAGE (POST) — Save message to DB */
app.post("/contact", async (req, res) => {
  console.log("📝 Contact form submitted");
  console.log("Request body:", req.body);
  
  const { name, email, message } = req.body;

  // Server-side validation
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    console.log("❌ Validation failed - missing fields");
    return res.redirect("/contact?error=All+fields+are+required");
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("❌ Invalid email format");
    return res.redirect("/contact?error=Please+enter+a+valid+email+address");
  }

  // Check minimum length
  if (name.trim().length < 2) {
    return res.redirect("/contact?error=Name must be at least 2 characters");
  }
  
  if (message.trim().length < 10) {
    return res.redirect("/contact?error=Message must be at least 10 characters");
  }

  try {
    console.log("📤 Attempting to insert into database...");
    
    // First, check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'messages'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log("⚠️ Messages table doesn't exist! Creating it now...");
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Messages table created!");
    }
    
    // Insert the message
    const result = await pool.query(
      "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING id",
      [name.trim(), email.trim(), message.trim()]
    );
    
    console.log(`✅ Message inserted successfully! ID: ${result.rows[0].id}`);
    res.redirect("/contact?success=1");
    
  } catch (err) {
    console.error("❌ DB insert error:", err.message);
    console.error("Full error details:", err);
    res.redirect("/contact?error=Database error: " + encodeURIComponent(err.message));
  }
});

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────

/** Admin Login Page (GET) */
app.get("/admin/login", (req, res) => {
  if (req.session.isAdmin) return res.redirect("/admin");
  res.render("admin-login", { page: "admin", error: req.query.error || null });
});

/** Admin Login (POST) */
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.ADMIN_USERNAME || "lazycoders";
  const validPass = process.env.ADMIN_PASSWORD || "team2026";

  if (username === validUser && password === validPass) {
    req.session.isAdmin = true;
    res.redirect("/admin");
  } else {
    res.redirect("/admin/login?error=Invalid+credentials");
  }
});

/** Admin Logout */
app.get("/admin/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/admin/login");
});

/** Admin Dashboard */
app.get("/admin", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC"
    );
    const visitors = await getVisitorCount();
    res.render("admin", {
      page: "admin",
      messages: result.rows,
      visitors,
    });
  } catch (err) {
    console.error("Admin DB error:", err.message);
    res.render("admin", {
      page: "admin",
      messages: [],
      visitors: 0,
      dbError: "Could not load messages from database.",
    });
  }
});

/** Export messages as CSV */
app.get("/admin/export-csv", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, message, created_at FROM messages ORDER BY created_at DESC"
    );
    const fields = ["id", "name", "email", "message", "created_at"];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header("Content-Type", "text/csv");
    res.attachment("lazycoders_messages.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).send("Error exporting CSV: " + err.message);
  }
});

/** Delete a message */
app.post("/admin/delete/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM messages WHERE id = $1", [req.params.id]);
    res.redirect("/admin");
  } catch (err) {
    res.redirect("/admin");
  }
});

// ─────────────────────────────────────────────
// Debug Endpoint (Remove in production)
// ─────────────────────────────────────────────
app.get("/debug/db-test", async (req, res) => {
  try {
    // Test connection
    const timeResult = await pool.query("SELECT NOW()");
    
    // Test insert
    const insertResult = await pool.query(
      "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING id",
      ["Debug User", "debug@test.com", "Debug test at " + new Date().toISOString()]
    );
    
    // Get count
    const countResult = await pool.query("SELECT COUNT(*) FROM messages");
    
    res.json({
      success: true,
      database_time: timeResult.rows[0],
      inserted_id: insertResult.rows[0].id,
      total_messages: parseInt(countResult.rows[0].count)
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render("404", { page: "404" });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 LazyCoders Portfolio running at http://localhost:${PORT}`);
  console.log(`   Admin panel: http://localhost:${PORT}/admin`);
  console.log(`   Debug endpoint: http://localhost:${PORT}/debug/db-test`);
  console.log(`   Press Ctrl+C to stop.\n`);
});