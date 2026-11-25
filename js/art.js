// Hand-drawn SVG produce, so we don't depend on stock photos or emoji.
// Every drawing sits in a 100 x 80 box with its own ground shadow.
// Vendors can still upload a real photo for any item; that replaces the drawing.

const shadow = (rx = 34, cx = 50) => `<ellipse cx="${cx}" cy="73" rx="${rx}" ry="4.5" fill="#3b2a1a" opacity=".13"/>`;

// c = [shade, body, highlight]
function ball(cx, cy, r, c) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c[0]}"/>` +
    `<circle cx="${cx - r * .08}" cy="${cy - r * .1}" r="${r * .88}" fill="${c[1]}"/>` +
    `<ellipse cx="${cx - r * .38}" cy="${cy - r * .42}" rx="${r * .26}" ry="${r * .15}" fill="${c[2]}" opacity=".75" transform="rotate(-35 ${cx - r * .38} ${cy - r * .42})"/>`;
}
function oval(cx, cy, rx, ry, rot, c) {
  return `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c[0]}"/>` +
    `<ellipse cx="${cx - rx * .06}" cy="${cy - ry * .1}" rx="${rx * .9}" ry="${ry * .84}" fill="${c[1]}"/>` +
    `<ellipse cx="${cx - rx * .35}" cy="${cy - ry * .45}" rx="${rx * .3}" ry="${ry * .16}" fill="${c[2]}" opacity=".7"/></g>`;
}
// onion / garlic / brinjal shape: round bottom, pointed top
function dropPath(cx, cy, r, tip) {
  return `M${cx - r} ${cy}C${cx - r} ${cy - r * .8} ${cx - r * .25} ${cy - r * tip * .8} ${cx} ${cy - r * tip}` +
    `C${cx + r * .25} ${cy - r * tip * .8} ${cx + r} ${cy - r * .8} ${cx + r} ${cy}A${r} ${r} 0 0 1 ${cx - r} ${cy}Z`;
}
function drop(cx, cy, r, tip, c) {
  return `<path d="${dropPath(cx, cy, r, tip)}" fill="${c[0]}"/>` +
    `<path d="${dropPath(cx - r * .07, cy - r * .06, r * .88, tip)}" fill="${c[1]}"/>` +
    `<path d="M${cx - r * .5} ${cy + r * .5}Q${cx - r * .62} ${cy - r * .3} ${cx - r * .12} ${cy - r * tip * .85}" stroke="${c[2]}" stroke-width="${r * .12}" fill="none" stroke-linecap="round" opacity=".6"/>`;
}
const heap3 = (f) => f(50, 38) + f(34, 55) + f(66, 55);
const heap5 = (f) => f(40, 36) + f(62, 36) + f(26, 56) + f(50, 57) + f(74, 56);

function calyx(cx, cy) {
  return [0, 72, 144, 216, 288].map(a => `<ellipse cx="${cx}" cy="${cy - 3}" rx="1.7" ry="3.6" fill="#3f7d2c" transform="rotate(${a} ${cx} ${cy})"/>`).join('') +
    `<circle cx="${cx}" cy="${cy}" r="1.6" fill="#2f5f1f"/>`;
}
function coil(color, edge, n = 64) {
  let s = '', d = '';
  for (let k = 1; k <= n; k++) {
    const a = k * 0.52, r = 5 + k * 0.48;
    d += (k === 1 ? 'M' : 'L') + (50 + r * Math.cos(a)).toFixed(1) + ' ' + (44 + r * Math.sin(a) * 0.58).toFixed(1);
  }
  s += `<path d="${d}" stroke="#5f8f3a" stroke-width="1.4" fill="none" opacity=".8"/>`;
  for (let k = n; k > 0; k--) {
    const a = k * 0.52, r = 5 + k * 0.48;
    const x = 50 + r * Math.cos(a), y = 44 + r * Math.sin(a) * 0.58;
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="2.3" fill="${color}" stroke="${edge}" stroke-width=".8" transform="rotate(${(a * 57).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return s;
}
function bunch(leaf) {
  let s = '';
  const tips = [];
  for (let i = 0; i < 9; i++) {
    const a = -1.05 + i * 0.26;
    const x = 50 + Math.sin(a) * 40, y = 64 - Math.cos(a) * 46;
    tips.push([x, y, a]);
    s += `<path d="M50 66Q${50 + Math.sin(a) * 14} ${44} ${x.toFixed(1)} ${y.toFixed(1)}" stroke="#5c8a33" stroke-width="1.6" fill="none"/>`;
  }
  tips.forEach(([x, y, a], i) => { s += leaf(x, y, a, i); });
  return s + `<rect x="43" y="56" width="14" height="6" rx="2" fill="#c9a46a"/><rect x="43" y="56" width="14" height="2" rx="1" fill="#e3c590"/>`;
}
function cone(fill) {
  return `<path d="M30 30L50 74L70 30Z" fill="#d9d2bf"/><path d="M50 74L70 30H58Z" fill="#c6bea8"/>` +
    `<path d="M35 38h29M38 45h23M41 52h17M44 59h11" stroke="#a69d86" stroke-width="1.2" opacity=".6"/>` + fill;
}
function pouch(top, band, bottom) {
  return `<path d="M30 16l4 -3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3v50l-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3z" fill="${bottom}"/>` +
    `<path d="M30 16l4 -3 4 3 4-3 4 3 4-3 4 3 4-3 4 3 4-3 4 3v22H30z" fill="${top}"/>` +
    `<rect x="30" y="36" width="40" height="9" fill="${band}"/><path d="M36 24h20M36 29h14" stroke="${band}" stroke-width="2.4" stroke-linecap="round"/>` +
    `<rect x="62" y="18" width="4" height="44" rx="2" fill="#fff" opacity=".25"/>`;
}

const RED = ['#9e2218', '#d8392b', '#ffb1a1'];
const ART = {
  tomato: () => heap3((x, y) => ball(x, y, 16, RED) + calyx(x + 1, y - 13)),
  onion: () => heap3((x, y) => drop(x, y + 2, 15, 1.45, ['#7a2c4c', '#b04a76', '#e7a3c2']) + `<path d="M${x} ${y - 20}l-1 -4" stroke="#8a6a3a" stroke-width="1.6"/>`),
  shallot: () => heap5((x, y) => drop(x, y + 6, 10, 1.5, ['#8c3a4a', '#c45e6e', '#f0b0ba'])),
  potato: () => heap3((x, y) => oval(x, y, 17, 13, (x - 50) / 3, ['#8a6030', '#c99a5b', '#f0d7a8']) +
    `<circle cx="${x - 5}" cy="${y + 2}" r="1.1" fill="#7a5226"/><circle cx="${x + 6}" cy="${y - 3}" r="1" fill="#7a5226"/><circle cx="${x + 2}" cy="${y + 6}" r="1" fill="#7a5226"/>`),
  brinjal: () => [[38, 46, -58], [62, 50, -38]].map(([x, y, rot]) =>
    `<g transform="rotate(${rot} ${x} ${y})">${drop(x, y + 10, 13, 2.4, ['#2f163d', '#5b2f73', '#b28ad0'])}` +
    `<path d="M${x - 7} ${y - 16}Q${x} ${y - 24} ${x + 7} ${y - 16}L${x + 3} ${y - 12}L${x} ${y - 15}L${x - 3} ${y - 12}Z" fill="#4a7d2a"/>` +
    `<rect x="${x - 1.5}" y="${y - 30}" width="3" height="9" rx="1.5" fill="#4a7d2a"/></g>`).join(''),
  okra: () => [-40, -15, 10, 35].map((rot, i) =>
    `<g transform="rotate(${rot} 50 68)"><path d="M50 22C44 34 44 56 47 66H53C56 56 56 34 50 22Z" fill="${['#4a7d27', '#5f9a35', '#4f862b', '#68a43c'][i]}"/>` +
    `<path d="M50 26V64" stroke="#a9d27c" stroke-width="1" opacity=".7"/><rect x="47" y="64" width="6" height="6" rx="2" fill="#3c6620"/></g>`).join(''),
  drumstick: () => [0, 7, 14].map(d =>
    `<path d="M${14 + d} ${66 - d / 2}Q50 ${48 - d} ${88 - d / 2} ${26 + d}" stroke="#3f6b22" stroke-width="7" fill="none" stroke-linecap="round"/>` +
    `<path d="M${14 + d} ${65 - d / 2}Q50 ${47 - d} ${88 - d / 2} ${25 + d}" stroke="#7bab4a" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="9 2"/>`).join(''),
  carrot: () => [[-62, 42], [-48, 50], [-34, 58]].map(([rot, x]) =>
    `<g transform="rotate(${rot} ${x} 60)"><path d="M${x - 7} 60Q${x} 56 ${x + 7} 60L${x + 1} 100Q${x} 102 ${x - 1} 100Z" fill="#e0701c" transform="translate(0 -40)"/>` +
    `<path d="M${x - 4} 30h7M${x - 3} 40h6M${x - 2} 50h4" stroke="#b9530c" stroke-width="1.2" transform="translate(0 -6)"/>` +
    `<path d="M${x} 20l-5 -12M${x} 20l0 -14M${x} 20l5 -12" stroke="#4f8a2c" stroke-width="2.4" stroke-linecap="round"/></g>`).join(''),
  beans: () => [0, 1, 2, 3, 4].map(i =>
    `<path d="M${16 + i * 3} ${58 - i * 6}Q50 ${72 - i * 6} ${84 - i * 2} ${40 - i * 5}" stroke="#3f7a26" stroke-width="6.5" fill="none" stroke-linecap="round"/>` +
    `<path d="M${17 + i * 3} ${57 - i * 6}Q50 ${70 - i * 6} ${83 - i * 2} ${39 - i * 5}" stroke="#77b04a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`).join(''),
  cabbage: () => ball(50, 44, 27, ['#4f8a3a', '#8cc56a', '#e2f5c8']) +
    `<path d="M50 70Q40 44 50 20M50 70Q62 46 74 34M50 70Q36 50 26 36" stroke="#5e9a45" stroke-width="1.6" fill="none"/>`,
  chilli: () => [-30, -12, 6, 22].map((rot, i) =>
    `<g transform="rotate(${rot} 50 62)"><path d="M48 62Q40 40 52 18Q46 40 55 62Z" fill="${i % 2 ? '#3f8a26' : '#2f7a1e'}"/>` +
    `<path d="M49 62q3 5 7 4" stroke="#6a5a2a" stroke-width="2" fill="none" stroke-linecap="round"/></g>`).join(''),
  ginger: () => [[38, 50, 14, 9, -20], [56, 46, 13, 9, 15], [68, 56, 10, 7, 30], [46, 60, 11, 7, 0], [30, 40, 8, 6, -40]]
    .map(([x, y, rx, ry, r]) => oval(x, y, rx, ry, r, ['#a77a3c', '#d2a865', '#f4dcae'])).join('') +
    `<path d="M34 50h6M54 46h5M64 56h4" stroke="#9b6e33" stroke-width="1.2"/>`,
  garlic: () => [[38, 50], [62, 50]].map(([x, y]) => drop(x, y + 6, 15, 1.6, ['#cfc4ae', '#f4efe3', '#ffffff']) +
    `<path d="M${x} ${y + 20}Q${x - 6} ${y} ${x} ${y - 16}M${x} ${y + 20}Q${x + 6} ${y} ${x} ${y - 16}" stroke="#d7ccb6" stroke-width="1.2" fill="none"/>`).join(''),
  coriander: () => bunch((x, y) => [0, 1, 2].map(k => `<circle cx="${x + [-4, 4, 0][k]}" cy="${y + [2, 2, -4][k]}" r="4" fill="${['#4f9a35', '#3f8a2a', '#5fae3f'][k]}"/>`).join('')),
  curry: () => bunch((x, y, a) => [0, 1, 2].map(k => `<ellipse cx="${x}" cy="${y + k * 6}" rx="5.5" ry="2.4" fill="${k % 2 ? '#2f6a24' : '#3f7d2c'}" transform="rotate(${a * 57 + (k % 2 ? 30 : -30)} ${x} ${y + k * 6})"/>`).join('')),
  mint: () => bunch((x, y, a, i) => `<ellipse cx="${x - 3}" cy="${y}" rx="5" ry="3.8" fill="#3d8a4a"/><ellipse cx="${x + 3}" cy="${y + 2}" rx="5" ry="3.8" fill="#55a35f"/><path d="M${x - 6} ${y}h6" stroke="#2e6b39" stroke-width=".8"/>`),
  keerai: () => bunch((x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="6" fill="#3a7a2a" transform="rotate(${a * 57} ${x} ${y})"/><ellipse cx="${x - 1}" cy="${y - 1}" rx="6" ry="4.4" fill="#58a03c" transform="rotate(${a * 57} ${x} ${y})"/>`),
  murungai: () => bunch((x, y) => [0, 1, 2, 3, 4, 5].map(k => `<circle cx="${x + Math.cos(k) * 5}" cy="${y + Math.sin(k) * 4}" r="2" fill="${k % 2 ? '#4f9a35' : '#6ab845'}"/>`).join('')),
  lemon: () => heap5((x, y) => oval(x, y + 4, 11, 8.5, -10, ['#b99a10', '#f2d230', '#fff6b0']) + `<circle cx="${x + 11}" cy="${y + 2}" r="1.6" fill="#b99a10"/>`),
  banana: () => `<rect x="18" y="12" width="9" height="16" rx="3" fill="#6b4b22"/>` + [4, 3, 2, 1, 0].map(i =>
    `<path d="M26 ${24 + i * 2}Q${42 + i * 3} ${58 + i * 3} 84 ${30 + i * 8}" stroke="#b98a12" stroke-width="12" fill="none" stroke-linecap="round"/>` +
    `<path d="M26 ${23 + i * 2}Q${42 + i * 3} ${56 + i * 3} 84 ${29 + i * 8}" stroke="#f2c933" stroke-width="8.5" fill="none" stroke-linecap="round"/>` +
    `<path d="M32 ${30 + i * 2}Q${44 + i * 3} ${52 + i * 3} 70 ${38 + i * 7}" stroke="#fff1a8" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>` +
    `<circle cx="85" cy="${30 + i * 8}" r="2.4" fill="#4a3517"/>`).join(''),
  guava: () => heap3((x, y) => ball(x, y, 15, ['#5f8d2a', '#9cc94a', '#e8f7bd']) + `<circle cx="${x + 9}" cy="${y + 8}" r="1.8" fill="#4b3a1c"/>`),
  pomegranate: () => heap3((x, y) => ball(x, y, 16, ['#6e1220', '#b5233a', '#f59aa6']) +
    `<path d="M${x - 4} ${y - 14}l1 -6 2 3 1 -5 1 5 2 -3 1 6z" fill="#8a1a2a"/>`),
  papaya: () => oval(40, 44, 26, 15, -20, ['#5f7d20', '#a6c044', '#e6f0a0']) +
    `<g transform="rotate(-8 64 56)"><ellipse cx="64" cy="56" rx="22" ry="13" fill="#d9661a"/><ellipse cx="64" cy="55" rx="19" ry="10.5" fill="#f59a3c"/>` +
    `<ellipse cx="64" cy="55" rx="10" ry="4.6" fill="#e07a2a"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<circle cx="${57 + k * 2.3}" cy="${54 + (k % 2) * 2}" r="1.4" fill="#2a1a10"/>`).join('')}</g>`,
  sapota: () => heap3((x, y) => oval(x, y + 2, 14, 11, 8, ['#5e3a1e', '#9a6a3f', '#dcb48c'])),
  orange: () => heap3((x, y) => ball(x, y, 15, ['#b4560c', '#f08c1f', '#ffd6a4']) + `<circle cx="${x + 1}" cy="${y - 12}" r="1.4" fill="#6a4a1a"/>`) +
    `<path d="M51 26q8 -8 14 -2q-8 6 -14 2z" fill="#4f8a2c"/>`,
  apple: () => heap3((x, y) => ball(x, y, 15, ['#7e1717', '#c9302c', '#ffaaa6']) +
    `<path d="M${x} ${y - 13}q1 -5 3 -6" stroke="#5a3a1a" stroke-width="1.8" fill="none"/><path d="M${x + 2} ${y - 16}q6 -4 9 0q-6 3 -9 0z" fill="#4f8a2c"/>`),
  ilaneer: () => ball(66, 46, 21, ['#3d6b22', '#6aa33a', '#c6e79a']) + `<path d="M58 28l8 -8 8 8z" fill="#8bbf55"/>` +
    ball(40, 44, 25, ['#3d6b22', '#73ad3f', '#cdedA4']) + `<path d="M30 22L40 10L50 22Z" fill="#9bcb63"/><ellipse cx="40" cy="15" rx="5" ry="2.4" fill="#f4f1dc"/>` +
    `<path d="M41 15L50 -2" stroke="#e46f1b" stroke-width="3" stroke-linecap="round"/><path d="M41 15L50 -2" stroke="#fff" stroke-width="3" stroke-dasharray="3 3"/>`,
  coconut: () => heap3((x, y) => ball(x, y, 15, ['#3e2512', '#7a4b26', '#c08b58']) +
    `<circle cx="${x - 4}" cy="${y - 4}" r="1.8" fill="#2a170a"/><circle cx="${x + 3}" cy="${y - 5}" r="1.8" fill="#2a170a"/><circle cx="${x}" cy="${y + 1}" r="1.8" fill="#2a170a"/>` +
    `<path d="M${x - 10} ${y + 6}l4 -2M${x + 8} ${y + 7}l-3 -3M${x + 9} ${y - 8}l-4 2" stroke="#a07040" stroke-width="1"/>`),
  jaggery: () => [[34, 52], [62, 52], [48, 38]].map(([x, y]) =>
    `<path d="M${x - 13} ${y + 14}L${x - 9} ${y - 8}Q${x} ${y - 13} ${x + 9} ${y - 8}L${x + 13} ${y + 14}Q${x} ${y + 19} ${x - 13} ${y + 14}Z" fill="#7a4a1a"/>` +
    `<path d="M${x - 9} ${y + 12}L${x - 6} ${y - 6}Q${x} ${y - 10} ${x + 4} ${y - 7}" fill="#a8672a"/><ellipse cx="${x}" cy="${y - 8}" rx="8" ry="3" fill="#c0803c"/>`).join(''),
  tamarind: () => [0, 1, 2, 3].map(i => `<path d="M${18 + i * 4} ${60 - i * 9}Q50 ${42 - i * 9} ${82 - i * 2} ${56 - i * 8}" stroke="#5a3418" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="11 1.5"/>` +
    `<path d="M${20 + i * 4} ${58 - i * 9}Q50 ${40 - i * 9} ${78 - i * 2} ${54 - i * 8}" stroke="#8c5a30" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`).join(''),
  jasmine: () => coil('#fffdf4', '#b3a77f'),
  kanakambaram: () => coil('#f28a2e', '#c4601a', 56),
  marigold: () => [[36, 44, 17], [66, 50, 15]].map(([x, y, r]) => {
    let s = '';
    [[r, '#c95f0c', 16], [r * .72, '#f08a1c', 13], [r * .44, '#f7b22e', 9]].forEach(([rr, col, n]) => {
      for (let k = 0; k < n; k++) { const a = k / n * 6.283; s += `<circle cx="${(x + Math.cos(a) * rr * .72).toFixed(1)}" cy="${(y + Math.sin(a) * rr * .72).toFixed(1)}" r="${(rr * .38).toFixed(1)}" fill="${col}"/>`; }
    });
    return s + `<circle cx="${x}" cy="${y}" r="${r * .2}" fill="#d9821a"/>`;
  }).join(''),
  rose: () => `<path d="M20 64q14 -16 30 -6q-16 10 -30 6z" fill="#3f7d2c"/><path d="M80 62q-14 -14 -28 -4q14 9 28 4z" fill="#4f8a2c"/>` +
    [[34, 44, 14], [64, 42, 15], [50, 56, 13]].map(([x, y, r]) => ball(x, y, r, ['#7a0f1e', '#c21f36', '#f27a8c']) +
    `<path d="M${x} ${y}m-2 0a2 2 0 1 1 4 0a5 5 0 1 1 -10 0a8 8 0 1 1 16 0" stroke="#7a0f1e" stroke-width="1.6" fill="none"/>`).join(''),
  garland: () => {
    let s = '';
    for (let k = 0; k <= 40; k++) {
      const u = k / 40, x = 18 + u * 64, y = 10 + Math.sin(u * Math.PI) * 52;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6" fill="${k % 3 === 0 ? '#f28a2e' : '#fffdf4'}" stroke="${k % 3 === 0 ? '#c4601a' : '#d8d0b2'}" stroke-width=".8"/>`;
    }
    return s + ball(50, 62, 7, ['#7a0f1e', '#c21f36', '#f27a8c']) + `<path d="M50 69v6M47 70l-2 5M53 70l2 5" stroke="#e8b02a" stroke-width="1.6"/>`;
  },
  lotus: () => [-56, -28, 28, 56, 0].map((rot, i) => `<path d="M50 66Q37 46 50 18Q63 46 50 66Z" fill="${['#e48aa8', '#ef9fbb', '#ef9fbb', '#e48aa8', '#f7c3d4'][i]}" stroke="#c96b8c" stroke-width=".8" transform="rotate(${rot} 50 66)"/>`).join('') +
    `<ellipse cx="50" cy="66" rx="22" ry="4" fill="#4f8a2c"/>`,
  sundal: () => cone([[42, 28], [50, 25], [58, 28], [46, 23], [54, 22], [38, 31], [62, 31], [50, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#d8a75c" stroke="#b07f3c" stroke-width=".8"/>`).join('') +
    `<path d="M44 26l3 -1M55 24l2 1M50 28l-2 1" stroke="#3f7d2c" stroke-width="1.6"/><path d="M41 24h4M57 27h4" stroke="#fff" stroke-width="1.6"/>`),
  peanuts: () => cone([[42, 27, 20], [53, 24, -30], [60, 30, 40], [47, 31, -10]].map(([x, y, r]) =>
    `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x - 3}" cy="${y}" rx="4.4" ry="3.6" fill="#c9965a"/><ellipse cx="${x + 3.4}" cy="${y}" rx="4" ry="3.4" fill="#d8a96c"/></g>`).join('')),
  bajji: () => `<path d="M14 66Q50 50 88 62L84 70Q50 64 18 72Z" fill="#4f8a2c"/>` +
    [[34, 54, -15], [60, 52, 12], [48, 42, -5]].map(([x, y, r]) => oval(x, y, 16, 9, r, ['#9c5a12', '#d98b2b', '#f7cd86']) +
    `<path d="M${x - 8} ${y + 1}h4M${x + 3} ${y - 3}h4" stroke="#b8701c" stroke-width="1.4"/>`).join(''),
  murukku: () => [[50, 56], [50, 40]].map(([cx, cy]) => {
    let d = `M${cx} ${cy}`;
    for (let k = 1; k <= 30; k++) { const a = k * 0.62, r = k * 0.62; d += `L${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r * .5).toFixed(1)}`; }
    return `<path d="${d}" stroke="#9a6428" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#d9a35a" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 1.2"/>`;
  }).join(''),
  milk: () => pouch('#ffffff', '#2d6fb5', '#2d6fb5'),
  curd: () => pouch('#ffffff', '#3f8a46', '#f4f1e6'),
  eggs: () => [[36, 54], [62, 54], [49, 40], [49, 60]].map(([x, y]) => oval(x, y, 10, 13, 0, ['#d6bf98', '#f3e6cf', '#ffffff'])).join(''),
  bread: () => `<path d="M18 66V40Q18 24 34 26Q42 18 50 26Q58 18 66 26Q82 24 82 40V66Z" fill="#a96a2c"/>` +
    `<path d="M22 66V42Q22 30 34 31Q42 24 50 31Q58 24 66 31Q78 30 78 42V66Z" fill="#e8c890"/><path d="M34 34v32M50 32v34M66 34v32" stroke="#c9a46a" stroke-width="1.4"/>`,
  agarbathi: () => [0, 1, 2, 3, 4, 5].map(i => `<path d="M${38 + i * 4} 30V${8 + (i % 3) * 3}" stroke="#6b3a1a" stroke-width="1.6"/>`).join('') +
    `<rect x="32" y="28" width="36" height="42" rx="3" fill="#7a2348"/><rect x="36" y="38" width="28" height="16" rx="2" fill="#f2c14e"/><circle cx="50" cy="46" r="5" fill="#e46f1b"/>`,
  camphor: () => `<rect x="28" y="34" width="44" height="34" rx="3" fill="#2d6fb5"/><rect x="28" y="34" width="44" height="10" fill="#4a8ad0"/>` +
    [[36, 24], [48, 22], [60, 25], [42, 30], [55, 30]].map(([x, y]) => `<rect x="${x}" y="${y}" width="9" height="9" rx="2" fill="#fbfbf6" stroke="#d9d9cf"/>`).join(''),
  // Kitchen and home staples
  rice: () => pouch('#fbf3dc', '#c99a3a', '#c99a3a'),
  toordal: () => pouch('#fff3d0', '#d98a2a', '#d98a2a'),
  atta: () => pouch('#f6ead0', '#9a6a3a', '#9a6a3a'),
  oil: () => `<rect x="36" y="22" width="28" height="44" rx="7" fill="#e6bd3c"/><rect x="45" y="11" width="10" height="13" rx="2" fill="#8a5a22"/>` +
    `<rect x="40" y="38" width="20" height="16" rx="2" fill="#fbf1c8"/><ellipse cx="44" cy="30" rx="3" ry="6" fill="#fff4c4" opacity=".7"/>`,
  sugar: () => pouch('#fbfbf6', '#7fb3e0', '#7fb3e0'),
  salt: () => `<rect x="34" y="32" width="32" height="34" rx="4" fill="#f7f7f2" stroke="#b9bcc0"/><rect x="34" y="32" width="32" height="9" rx="3" fill="#3f7fc4"/><circle cx="50" cy="55" r="5" fill="#dfe7ef"/>`,
  tea: () => `<rect x="26" y="34" width="48" height="32" rx="3" fill="#2f7a4a"/><rect x="26" y="34" width="48" height="9" fill="#4a9a66"/>` +
    `<path d="M38 53q4 -5 8 0t8 0" stroke="#e8f5e0" stroke-width="2" fill="none"/>`,
  coffee: () => `<rect x="28" y="34" width="44" height="32" rx="3" fill="#5a3418"/><rect x="28" y="34" width="44" height="9" fill="#7a4a24"/>` +
    `<circle cx="50" cy="55" r="6" fill="#c98a4a"/>`,
  soap: () => `<rect x="24" y="44" width="52" height="22" rx="6" fill="#e9a6b9"/><rect x="24" y="40" width="52" height="14" rx="6" fill="#f9d3dd"/>` +
    `<rect x="30" y="46" width="14" height="3" rx="1.5" fill="#ffffff" opacity=".7"/>`,
  detergent: () => pouch('#ffffff', '#d9432e', '#d9432e'),
  toothpaste: () => `<rect x="36" y="26" width="28" height="40" rx="6" fill="#f6fbff" stroke="#8aa0c0"/>` +
    `<rect x="36" y="20" width="28" height="10" rx="3" fill="#2d6fb5"/><rect x="40" y="36" width="20" height="8" fill="#3fb3a6"/>`
};

// Used for items vendors add themselves that aren't in our catalogue.
const CAT_ART = { veg: 'tomato', fruit: 'guava', flower: 'marigold', snack: 'murukku', grocery: 'jaggery', daily: 'milk' };

function art(type, cat) {
  const key = ART[type] ? type : CAT_ART[cat] || 'tomato';
  return `<svg class="art" viewBox="0 -4 100 84" aria-hidden="true">${shadow()}${ART[key]()}</svg>`;
}

// Picture for a listing: the vendor's own photo if they uploaded one.
function itemPic(l, cls = '') {
  return l.photo
    ? `<img class="pic photo ${cls}" src="${l.photo}" alt="">`
    : `<span class="pic ${cls}">${art(l.type, l.cat)}</span>`;
}

const CAT_COLOR = { veg: '#2f9e6a', fruit: '#f4a21c', flower: '#d6457a', snack: '#c46a2b', grocery: '#7a5a3a', daily: '#3f6fd8' };

// A little stall with an awning in the vendor's category colour.
function stall(v, size = 48) {
  if (v.photo) return `<img class="stall photo" src="${v.photo}" alt="" style="width:${size}px;height:${size}px">`;
  const c = CAT_COLOR[v.cat] || '#2f9e6a';
  const scallops = [0, 1, 2, 3, 4].map(i => `<path d="M${6 + i * 10.4} 22a5.2 5.2 0 0 0 10.4 0" fill="${i % 2 ? '#fff' : c}"/>`).join('');
  return `<svg class="stall" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">` +
    `<rect width="64" height="64" rx="16" fill="${c}" opacity=".12"/>` +
    `<path d="M8 12h48l2 10H6z" fill="${c}"/><path d="M18 12h10v10H16zM38 12h10l2 10H38z" fill="#fff" opacity=".9"/>${scallops}` +
    `<rect x="10" y="26" width="3" height="24" fill="#8a6a44"/><rect x="51" y="26" width="3" height="24" fill="#8a6a44"/>` +
    `<rect x="8" y="40" width="48" height="12" rx="2" fill="#b98a5a"/><rect x="8" y="40" width="48" height="4" fill="#d6a874"/>` +
    `<circle cx="20" cy="37" r="5" fill="${c}"/><circle cx="31" cy="36" r="5.5" fill="${c}" opacity=".75"/><circle cx="43" cy="37" r="5" fill="${c}" opacity=".9"/>` +
    `<circle cx="18" cy="56" r="4" fill="#4a3a2a"/><circle cx="46" cy="56" r="4" fill="#4a3a2a"/></svg>`;
}

// The pushcart on the landing page.
function heroCart() {
  const tom = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${ART.tomato()}</g>`;
  const oni = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${ART.onion()}</g>`;
  const chi = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${ART.chilli()}</g>`;
  const bri = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${ART.brinjal()}</g>`;
  const ban = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(70 50 40)">${ART.banana()}</g>`;
  const scallops = Array.from({ length: 12 }, (_, i) => `<path d="M${38 + i * 24} 96a12 12 0 0 0 24 0" fill="${i % 2 ? '#f4a21c' : '#2e2a72'}"/>`).join('');
  const stripes = Array.from({ length: 6 }, (_, i) => `<path d="M${62 + i * 48} 56h24l6 40h-24z" fill="#f4a21c"/>`).join('');
  return `<svg class="hero-cart" viewBox="0 0 400 330" role="img" aria-label="A vegetable pushcart with a price board">
    <ellipse cx="200" cy="308" rx="170" ry="12" fill="#000" opacity=".12"/>
    <rect x="58" y="96" width="7" height="140" fill="#6d4e2e"/><rect x="335" y="96" width="7" height="140" fill="#6d4e2e"/>
    <path d="M38 56h324l6 40H32z" fill="#2e2a72"/>${stripes}${scallops}
    <path d="M32 96h336" stroke="#1f1b54" stroke-width="2"/>
    ${ban(262, 92, .9)}
    <path d="M44 226h312l-10 26H54z" fill="#8a5a32"/><rect x="40" y="214" width="320" height="16" rx="4" fill="#b8804a"/>
    <path d="M40 214h320" stroke="#d9a46a" stroke-width="4"/><path d="M60 236h280M66 244h268" stroke="#6d4528" stroke-width="2" opacity=".5"/>
    ${tom(138, 148, .95)}${oni(214, 154, .85)}${bri(272, 152, .78)}${chi(118, 170, .55)}${tom(176, 168, .72)}
    <path d="M356 226l30 -26" stroke="#6d4e2e" stroke-width="8" stroke-linecap="round"/>
    <g transform="translate(110 280)"><circle r="26" fill="#3a2a1c"/><circle r="20" fill="none" stroke="#8a6a44" stroke-width="3"/><path d="M-20 0H20M0 -20V20M-14 -14L14 14M14 -14L-14 14" stroke="#8a6a44" stroke-width="2.4"/><circle r="5" fill="#c9a46a"/></g>
    <g transform="translate(290 280)"><circle r="26" fill="#3a2a1c"/><circle r="20" fill="none" stroke="#8a6a44" stroke-width="3"/><path d="M-20 0H20M0 -20V20M-14 -14L14 14M14 -14L-14 14" stroke="#8a6a44" stroke-width="2.4"/><circle r="5" fill="#c9a46a"/></g>
    <g transform="translate(22 122) rotate(-5)">
      <rect width="132" height="96" rx="6" fill="#8a6a44"/><rect x="6" y="6" width="120" height="84" rx="3" fill="#2e3a33"/>
      <text x="66" y="28" text-anchor="middle" class="chalk" font-size="14">இன்றைய விலை</text>
      <path d="M22 35h88" stroke="#fbf6e8" stroke-width="1" opacity=".4"/>
      <text x="14" y="54" class="chalk" font-size="13">Thakkali</text><text x="118" y="54" text-anchor="end" class="chalk" font-size="14">₹40</text>
      <text x="14" y="76" class="chalk" font-size="13">Vengayam</text><text x="118" y="76" text-anchor="end" class="chalk" font-size="14">₹45</text>
    </g>
  </svg>`;
}
