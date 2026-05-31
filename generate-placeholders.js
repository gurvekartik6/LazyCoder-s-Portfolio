// generate-placeholders.js
// Creates placeholder SVG avatars for each team member
const fs = require('fs');
const path = require('path');

const members = [
  { file: 'kartik.jpg',  name: 'KG', color1: '#f97316', color2: '#ea580c' },
  { file: 'atharva.jpg', name: 'AD', color1: '#8b5cf6', color2: '#7c3aed' },
  { file: 'akshay.jpg',  name: 'AK', color1: '#06b6d4', color2: '#0891b2' },
  { file: 'darshan.jpg', name: 'DB', color1: '#10b981', color2: '#059669' },
  { file: 'prajwal.jpg', name: 'PF', color1: '#f43f5e', color2: '#e11d48' },
];

const dir = path.join(__dirname, 'public/images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

members.forEach(({ file, name, color1, color2 }) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#g)" rx="24"/>
  <circle cx="100" cy="78" r="36" fill="rgba(255,255,255,0.25)"/>
  <ellipse cx="100" cy="160" rx="55" ry="38" fill="rgba(255,255,255,0.2)"/>
  <text x="100" y="88" font-family="system-ui,sans-serif" font-size="32" font-weight="700"
    fill="white" text-anchor="middle" dominant-baseline="central">${name}</text>
</svg>`;

  // Save as SVG (browsers accept .jpg paths that serve SVG if content-type is right)
  // We'll save as .svg but rename to match expected .jpg path
  const svgPath = path.join(dir, file.replace('.jpg', '.svg'));
  fs.writeFileSync(svgPath, svg);
  
  // Copy as the jpg filename too
  fs.writeFileSync(path.join(dir, file), svg);
  console.log(`✅ Created ${file}`);
});

console.log('\n📁 All placeholder images created in public/images/');
console.log('   Replace with real photos when available.\n');
