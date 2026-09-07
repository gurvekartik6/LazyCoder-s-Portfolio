/**
 * LazyCoders Portfolio — Simplified Frontend Server
 * Express + EJS (No database, No admin backend)
 */

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// App Configuration
// ─────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─────────────────────────────────────────────
// Visitor Counter (Simple JSON file storage)
// ─────────────────────────────────────────────
const VISITOR_FILE = path.join(__dirname, "visitors.json");

// Initialize visitor file if it doesn't exist
if (!fs.existsSync(VISITOR_FILE)) {
  fs.writeFileSync(VISITOR_FILE, JSON.stringify({ count: 0 }));
}

function getVisitorCount() {
  try {
    const data = fs.readFileSync(VISITOR_FILE, "utf8");
    const json = JSON.parse(data);
    return json.count || 0;
  } catch (e) {
    return 0;
  }
}

function incrementVisitor() {
  try {
    const current = getVisitorCount();
    const newCount = current + 1;
    fs.writeFileSync(VISITOR_FILE, JSON.stringify({ count: newCount }));
    return newCount;
  } catch (e) {
    return 0;
  }
}

// ─────────────────────────────────────────────
// Data: Team Members
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
    {
    name: "Gopal Wagh",
    photo: "/images/Gopal_pic.jpeg",
    github: "https://github.com/gopalwagh",
    linkedin: "https://www.linkedin.com/in/gopal-wagh-9ba402385",
  },
];

// ─────────────────────────────────────────────
// Data: Projects
// ─────────────────────────────────────────────
const projects = [
  {
    name: "Jan Consent",
    tagline: "Digital Consent System",
    description:
      "Jan Consent is a revolutionary digital consent management platform built on blockchain technology. It allows citizens to grant, track, and revoke consent for data sharing across government and private services. The system eliminates paperwork, ensures transparency, and creates an immutable audit trail for every consent transaction. Ideal for healthcare authorizations, legal agreements, and KYC processes.",
    tech: ["Blockchain", "Solidity", "Web3.js", "Node.js", "Ethereum"],
    github: "https://github.com/teamlazycoder/JanConsent",
  },
  {
    name: "Krishak Mitra AI",
    tagline: "AI-Powered Farmer Assistant for Indian Agriculture",
    description:
      "Krishak Mitra AI is an intelligent virtual assistant designed specifically for Indian farmers. Using advanced computer vision and machine learning, it detects crop diseases from smartphone photos, provides weather forecasts and soil analysis, and predicts market prices for better selling decisions. The system works in multiple Indian languages through voice and text interfaces, making advanced agricultural technology accessible to rural farmers.",
    tech: ["Python", "TensorFlow", "Flask", "OpenCV", "NLP"],
    github: "https://github.com/teamlazycoder/KrishakMitraAI",
  },
  {
    name: "Maternal System",
    tagline: "Comprehensive Healthcare Platform for Mothers & Children",
    description:
      "The Maternal System is a full-featured healthcare platform that tracks maternal health from pregnancy through postpartum care. It manages prenatal checkup schedules, vaccination records for children under five, growth milestone tracking, and connects patients directly with healthcare providers. The system sends automated reminders for appointments and vaccinations via SMS and email, reducing missed care visits and improving health outcomes for mothers and children in underserved communities.",
    tech: ["React", "Node.js", "PostgreSQL", "Twilio", "Express"],
    github: "https://github.com/lazycoders/maternal-system",
  },
  {
    name: "Industrial Wastewater Management",
    tagline: "IoT + ML Solution for Water Treatment Compliance",
    description:
      "This end-to-end environmental monitoring system combines IoT sensors with machine learning to manage industrial wastewater in real-time. Sensors placed in treatment plants continuously monitor pH levels, chemical concentrations, temperature, and turbidity. The ML model predicts contamination trends before they exceed safety limits and automatically triggers treatment adjustments. The system ensures regulatory compliance, reduces environmental impact, and provides detailed reporting for audits and certifications.",
    tech: ["IoT", "Python", "Scikit-learn", "MQTT", "Arduino", "React"],
    github: "https://github.com/lazycoders/wastewater-mgmt",
  },
];

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────

/** HOME PAGE */
app.get("/", (req, res) => {
  const visitors = incrementVisitor(); // Increment and get real count
  res.render("index", { 
    teamMembers, 
    visitors: visitors,
    page: "home" 
  });
});

/** PROJECTS PAGE */
app.get("/projects", (req, res) => {
  const visitors = getVisitorCount();
  res.render("projects", { 
    projects, 
    visitors: visitors,
    page: "projects" 
  });
});

/** CONTACT PAGE */
app.get("/contact", (req, res) => {
  const visitors = getVisitorCount();
  res.render("contact", {
    page: "contact",
    visitors: visitors,
    email: "teamlazycoder@gmail.com"
  });
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  const visitors = getVisitorCount();
  res.status(404).render("404", { 
    page: "404",
    visitors: visitors 
  });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nLazyCoders Portfolio running at http://localhost:${PORT}`);
});