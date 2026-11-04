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
  { fgName: 'Text main (#1B1B1B)', fg: '#1B1B1B', bgName: 'Card surface (#FBF9F5)', bg: '#FBF9F5', minAA: 4.5 },
  { fgName: 'Text muted (#4A4A45)', fg: '#4A4A45', bgName: 'Card surface (#FBF9F5)', bg: '#FBF9F5', minAA: 4.5 },
  { fgName: 'Text main (#1B1B1B)', fg: '#1B1B1B', bgName: 'Solid plain bg (#FAF8F4)', bg: '#FAF8F4', minAA: 4.5 },
  { fgName: 'Text muted (#4A4A45)', fg: '#4A4A45', bgName: 'Solid plain bg (#FAF8F4)', bg: '#FAF8F4', minAA: 4.5 },
  { fgName: 'Text main (#1B1B1B)', fg: '#1B1B1B', bgName: 'Page gradient sand (#EFE8DB)', bg: '#EFE8DB', minAA: 4.5 },
  { fgName: 'Text main (#1B1B1B)', fg: '#1B1B1B', bgName: 'Page gradient sage (#DDE6DF)', bg: '#DDE6DF', minAA: 4.5 },
  { fgName: 'White (#FFFFFF)', fg: '#FFFFFF', bgName: 'Primary button teal (#0F5C4D)', bg: '#0F5C4D', minAA: 4.5 },
  { fgName: 'White (#FFFFFF)', fg: '#FFFFFF', bgName: 'Danger button red (#9B1C1C)', bg: '#9B1C1C', minAA: 4.5 },
  { fgName: 'Text main (#1B1B1B)', fg: '#1B1B1B', bgName: 'Secondary button bg (#F0ECE4)', bg: '#F0ECE4', minAA: 4.5 },
  { fgName: 'Primary teal (#0F5C4D)', fg: '#0F5C4D', bgName: 'Card surface (#FBF9F5)', bg: '#FBF9F5', minAA: 4.5 },
];

console.log('=== WCAG AA CONTRAST RATIO AUDIT ===\n');
let allPass = true;
pairs.forEach(p => {
  const ratio = getContrast(p.fg, p.bg);
  const pass = ratio >= p.minAA;
  if (!pass) allPass = false;
  console.log(`${pass ? 'PASS' : 'FAIL'} | Ratio: ${ratio.toFixed(2)}:1 (Min: ${p.minAA}:1) | ${p.fgName} on ${p.bgName}`);
});

console.log('\nAudit Result:', allPass ? 'ALL PAIRS PASS WCAG AA' : 'SOME PAIRS FAILED');
