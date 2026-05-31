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

// FIXED SESSION CONFIGURATION FOR RENDER
app.use(
  session({
    secret: process.env.SESSION_SECRET || "lazycoders_secret",
    resave: false,
    saveUninitialized: true, // Changed from false to true
    cookie: {
      secure: false, // Set to false for Render (HTTP/HTTPS handled by proxy)
      httpOnly: true,
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: 'lax', // Required for cross-origin requests
    },
    name: 'sessionId', // Explicit session cookie name
  })
);

// Session debugging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/admin') || req.path.startsWith('/debug')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log(`  Session ID: ${req.session?.id || 'no session'}`);
    console.log(`  isAdmin: ${req.session?.isAdmin || false}`);
  }
  next();
});

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
    photo: "/images/prajwal.jpeg",
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
// ADMIN ROUTES - COMPLETE FIXED VERSION
// ─────────────────────────────────────────────

/** Admin Login Page (GET) */
app.get("/admin/login", (req, res) => {
  console.log("=== Admin login page accessed ===");
  console.log("Current session ID:", req.session?.id);
  console.log("Current isAdmin:", req.session?.isAdmin);
  
  if (req.session && req.session.isAdmin) {
    console.log("User already logged in, redirecting to /admin");
    return res.redirect("/admin");
  }
  
  res.render("admin-login", { 
    page: "admin", 
    error: req.query.error || null 
  });
});

/** Admin Login (POST) - FIXED */
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  
  console.log("=========================================");
  console.log("ADMIN LOGIN ATTEMPT");
  console.log("Username entered:", username);
  console.log("Password entered:", password);
  console.log("Session ID before login:", req.session?.id);
  console.log("=========================================");
  
  // Hardcoded credentials
  if (username === "lazycoders" && password === "team2026") {
    // Set session
    req.session.isAdmin = true;
    req.session.authenticated = true;
    req.session.loginTime = Date.now();
    
    console.log("Session set with isAdmin = true");
    console.log("Session ID after setting:", req.session.id);
    
    // Save session explicitly
    req.session.save(function(err) {
      if (err) {
        console.error("Session save error:", err);
        return res.redirect("/admin/login?error=Session+error");
      }
      
      console.log("✅ Session saved successfully!");
      console.log("Verified - Session isAdmin:", req.session.isAdmin);
      
      // Redirect to admin dashboard
      res.redirect("/admin");
    });
    return;
  }
  
  console.log("❌ LOGIN FAILED - Invalid credentials");
  res.redirect("/admin/login?error=Invalid+credentials");
});

/** Admin Dashboard - Simplified Check */
app.get("/admin", async (req, res) => {
  console.log("=== Admin dashboard access ===");
  console.log("Session ID:", req.session?.id);
  console.log("Session isAdmin:", req.session?.isAdmin);
  console.log("Session authenticated:", req.session?.authenticated);
  
  // Check authentication
  if (!req.session || !req.session.isAdmin) {
    console.log("❌ Not authenticated, redirecting to login");
    return res.redirect("/admin/login");
  }
  
  console.log("✅ User is authenticated, loading dashboard");
  
  try {
    const result = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC"
    );
    
    console.log(`📊 Found ${result.rows.length} messages`);
    
    const visitors = await getVisitorCount();
    
    res.render("admin", {
      page: "admin",
      messages: result.rows,
      visitors: visitors,
      messageCount: result.rows.length
    });
  } catch (err) {
    console.error("Admin DB error:", err.message);
    res.render("admin", {
      page: "admin",
      messages: [],
      visitors: 0,
      dbError: "Could not load messages from database: " + err.message
    });
  }
});

/** Admin Logout */
app.get("/admin/logout", (req, res) => {
  console.log("=== Admin logout ===");
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/admin/login");
  });
});

/** Export messages as CSV */
app.get("/admin/export-csv", async (req, res) => {
  if (!req.session || !req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  
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
app.post("/admin/delete/:id", async (req, res) => {
  if (!req.session || !req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  
  try {
    await pool.query("DELETE FROM messages WHERE id = $1", [req.params.id]);
    res.redirect("/admin");
  } catch (err) {
    res.redirect("/admin");
  }
});

// ─────────────────────────────────────────────
// Debug Endpoints (Remove in production)
// ─────────────────────────────────────────────

app.get("/debug/db-test", async (req, res) => {
  try {
    const timeResult = await pool.query("SELECT NOW()");
    const insertResult = await pool.query(
      "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING id",
      ["Debug User", "debug@test.com", "Debug test at " + new Date().toISOString()]
    );
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

app.get("/debug/session", (req, res) => {
  res.json({
    hasSession: !!req.session,
    isAdmin: req.session?.isAdmin || false,
    sessionID: req.session?.id || "no session",
    authenticated: req.session?.authenticated || false,
    cookieSettings: {
      secure: req.session?.cookie?.secure || false,
      httpOnly: req.session?.cookie?.httpOnly || true,
      sameSite: req.session?.cookie?.sameSite || 'lax'
    }
  });
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
  console.log(`   Debug endpoints:`);
  console.log(`     - Database test: http://localhost:${PORT}/debug/db-test`);
  console.log(`     - Session check: http://localhost:${PORT}/debug/session`);
  console.log(`   Press Ctrl+C to stop.\n`);
});