import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(__dir, '../assets');

const SIZE = 1024;
const C = 512;
const GREEN = '#4ADE80';
const DARK = '#0F0F0F';
const BALL_FILL = '#1C1C1C';

function ball(r) {
  const so = Math.round(r * 0.05);
  const fs = Math.round(r * 0.52); // font size
  const fs2 = Math.round(r * 0.22); // subtitle font size
  return `
    <circle cx="${C}" cy="${C}" r="${r}" fill="#161616" stroke="${GREEN}" stroke-width="${so}"/>
    <text x="${C}" y="${C + fs * 0.35}" text-anchor="middle"
      font-family="Arial Black, Arial, sans-serif" font-weight="900"
      font-size="${fs}" fill="${GREEN}" letter-spacing="-4">HL</text>
  `.trim();
}

function svg(content, bg = false) {
  const bg_rect = bg ? `<rect width="${SIZE}" height="${SIZE}" fill="${DARK}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}">${bg_rect}${content}</svg>`;
}

const icons = [
  // icon.png: dark bg, big ball (65% of canvas)
  { name: 'icon.png', content: svg(ball(330), true), transparent: false },
  // splash-icon.png: transparent, medium ball centered
  { name: 'splash-icon.png', content: svg(ball(240)), transparent: true },
  // android foreground: transparent, content within safe center 600px (r=220 stays within 512±220=292~732)
  { name: 'android-icon-foreground.png', content: svg(ball(220)), transparent: true },
];

for (const { name, content, transparent } of icons) {
  let img = sharp(Buffer.from(content));
  if (!transparent) img = img.flatten({ background: DARK });
  await img.png().toFile(`${ASSETS}/${name}`);
  console.log(`✓ assets/${name}`);
}

console.log('\nDone. Restart expo to see the new icons.');
