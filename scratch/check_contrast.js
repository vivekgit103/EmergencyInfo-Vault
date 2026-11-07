/**
 * WCAG 2.1 Contrast Ratio Verification
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 */

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ];
}

function getLuminance([r, g, b]) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrast(hex1, hex2) {
  const lum1 = getLuminance(hexToRgb(hex1));
  const lum2 = getLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

const pairs = [
  // --- Dark Theme (Marketing and Auth Pages) ---
  { theme: 'Dark', fgName: 'Text main (#F3EFE6)', fg: '#F3EFE6', bgName: 'Base (#141412)', bg: '#141412', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Text main (#F3EFE6)', fg: '#F3EFE6', bgName: 'Surface (#1D1D1A)', bg: '#1D1D1A', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Text main (#F3EFE6)', fg: '#F3EFE6', bgName: 'Raised surface (#252521)', bg: '#252521', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Text muted (#B9B3A5)', fg: '#B9B3A5', bgName: 'Base (#141412)', bg: '#141412', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Text muted (#B9B3A5)', fg: '#B9B3A5', bgName: 'Surface (#1D1D1A)', bg: '#1D1D1A', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Text muted (#B9B3A5)', fg: '#B9B3A5', bgName: 'Raised surface (#252521)', bg: '#252521', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Clay accent (#D9A66F)', fg: '#D9A66F', bgName: 'Base (#141412)', bg: '#141412', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Clay accent (#D9A66F)', fg: '#D9A66F', bgName: 'Surface (#1D1D1A)', bg: '#1D1D1A', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Sage teal (#5FB8A3)', fg: '#5FB8A3', bgName: 'Base (#141412)', bg: '#141412', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Dark text (#141412)', fg: '#141412', bgName: 'Sage teal button (#5FB8A3)', bg: '#5FB8A3', minAA: 4.5 },
  { theme: 'Dark', fgName: 'Text main (#F3EFE6)', fg: '#F3EFE6', bgName: 'Secondary button (#252521)', bg: '#252521', minAA: 4.5 },
  { theme: 'Dark', fgName: 'White (#FFFFFF)', fg: '#FFFFFF', bgName: 'Danger red (#C04545)', bg: '#C04545', minAA: 4.5 },

  // --- Light Theme (Application Pages: Dashboard, Preview, Public Emergency) ---
  { theme: 'Light', fgName: 'Text main (#1B1B1B)', fg: '#1B1B1B', bgName: 'Base solid (#FAF8F4)', bg: '#FAF8F4', minAA: 4.5 },
  { theme: 'Light', fgName: 'Text main (#1B1B1B)', fg: '#1B1B1B', bgName: 'Surface card (#FFFFFF)', bg: '#FFFFFF', minAA: 4.5 },
  { theme: 'Light', fgName: 'Text muted (#4A4A45)', fg: '#4A4A45', bgName: 'Base solid (#FAF8F4)', bg: '#FAF8F4', minAA: 4.5 },
  { theme: 'Light', fgName: 'Text muted (#4A4A45)', fg: '#4A4A45', bgName: 'Surface card (#FFFFFF)', bg: '#FFFFFF', minAA: 4.5 },
  { theme: 'Light', fgName: 'White (#FFFFFF)', fg: '#FFFFFF', bgName: 'Primary teal button (#0F5C4D)', bg: '#0F5C4D', minAA: 4.5 },
  { theme: 'Light', fgName: 'Text main (#1B1B1B)', fg: '#1B1B1B', bgName: 'Secondary button (#FAF8F4)', bg: '#FAF8F4', minAA: 4.5 },
  { theme: 'Light', fgName: 'White (#FFFFFF)', fg: '#FFFFFF', bgName: 'Danger red (#9B1C1C)', bg: '#9B1C1C', minAA: 4.5 },
  { theme: 'Light', fgName: 'Primary teal (#0F5C4D)', fg: '#0F5C4D', bgName: 'Base solid (#FAF8F4)', bg: '#FAF8F4', minAA: 4.5 },
  { theme: 'Light', fgName: 'Danger red (#9B1C1C)', fg: '#9B1C1C', bgName: 'Base solid (#FAF8F4)', bg: '#FAF8F4', minAA: 4.5 },
];

console.log('=== WCAG AA CONTRAST RATIO AUDIT (SYNAPSE REDESIGN) ===\n');
let allPass = true;
pairs.forEach(p => {
  const ratio = getContrast(p.fg, p.bg);
  const pass = ratio >= p.minAA;
  if (!pass) allPass = false;
  console.log(`[${p.theme}] ${pass ? 'PASS' : 'FAIL'} | Ratio: ${ratio.toFixed(2)}:1 (Min: ${p.minAA}:1) | ${p.fgName} on ${p.bgName}`);
});

console.log('\nAudit Result:', allPass ? 'ALL PAIRS PASS WCAG AA' : 'SOME PAIRS FAILED');
