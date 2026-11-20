// The backdrop, built once as an SVG string. Flat, painted cumulus lit from the
// right, dusky cirrus above, mist over soft dunes, and a lone cloaked walker on
// the near ridge. One scene for both modes: colors are CSS variables, swapped
// when the app is dark.

// A small seeded generator, so the clouds are the same on every load.
function rng(seed) {
  let s = seed | 0

  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)

    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A cloud mass, painted flat. Each lobe is [cx, cy, radius, puffs]. Every puff
// is filled from one wash that runs across the whole mass, shadow at the lower
// left to light at the upper right, so the puffs melt into a single silhouette
// with a scalloped edge. Only the large puff at each lobe's heart gets a soft
// lit crown that fades to nothing, stronger where it faces the light. Lower
// puffs are drawn last and overlap the ones behind.
const washes = []

function mass(seed, name, lobes) {
  const next = rng(seed)
  const puffs = []

  for (const [cx, cy, radius, count] of lobes) {
    puffs.push([cx, cy, radius * 0.8, true])

    for (let i = 0; i < count; i++) {
      const angle = next() * Math.PI * 2
      const reach = (0.45 + next() * 0.55) * radius
      const size = radius * (0.3 + next() * 0.26)

      puffs.push([cx + Math.cos(angle) * reach * 1.05, cy + Math.sin(angle) * reach * 0.8, size])
    }
  }
  puffs.sort((a, b) => a[1] - b[1])

  const xs = lobes.map(lobe => lobe[0])
  const ys = lobes.map(lobe => lobe[1])
  const minX = Math.min(...xs) - 140
  const maxX = Math.max(...xs) + 140
  const minY = Math.min(...ys) - 140
  const maxY = Math.max(...ys) + 140
  const wash = `w${washes.length}`

  washes.push(
    `<linearGradient id="${wash}" gradientUnits="userSpaceOnUse" x1="${minX}" y1="${maxY}" x2="${maxX}" y2="${minY}">` +
      `<stop offset="0.1" stop-color="var(--${name}-sh)"/>` +
      `<stop offset="0.55" stop-color="var(--${name}-mid)"/>` +
      `<stop offset="1" stop-color="var(--${name}-hi)"/></linearGradient>`,
  )

  return puffs
    .map(([x, y, r, isCore]) => {
      const body = `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="url(#${wash})"/>`

      if (!isCore) {
        // About half the smaller puffs take a blush of pink, lavender or gold
        // that fades out before the puff's edge, so the bank isn't one color.
        const pick = next()

        if (pick > 0.5) {
          return body
        }
        const tint = pick < 0.2 ? 't1' : pick < 0.36 ? 't2' : 't3'

        return body + `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="url(#${tint})"/>`
      }
      const facing = ((x - minX) / (maxX - minX)) * 0.7 + ((maxY - y) / (maxY - minY)) * 0.5
      const crown = Math.min(0.6, Math.max(0.12, (facing - 0.2) * 0.7))

      return body + `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="url(#${name}C)" opacity="${crown.toFixed(2)}"/>`
    })
    .join('')
}

// A puff's lit crown: the family's highlight, fading out toward its belly.
const crownGradient = name =>
  `<linearGradient id="${name}C" x1="0.78" y1="0.08" x2="0.36" y2="0.8">` +
  `<stop offset="0" stop-color="var(--${name}-hi)"/>` +
  `<stop offset="0.8" stop-color="var(--${name}-hi)" stop-opacity="0"/></linearGradient>`

const BACK = mass(7, 'pB', [
  [560, 150, 170, 5],
  [330, 90, 150, 4],
  [770, 270, 130, 4],
])

const TOWER = mass(21, 'pA', [
  [40, 330, 110, 3],
  [330, 250, 150, 6],
  [180, 420, 170, 6],
  [420, 470, 160, 6],
  [80, 600, 170, 5],
  [300, 640, 190, 6],
  [560, 640, 150, 5],
])

const MIDDLE = mass(34, 'pB', [
  [800, 470, 130, 5],
  [950, 560, 150, 6],
  [700, 620, 150, 5],
  [1080, 650, 130, 5],
  [860, 690, 170, 5],
])

const BRIGHT = mass(55, 'pC', [
  [1150, 480, 90, 4],
  [1250, 560, 120, 5],
  [1400, 640, 130, 5],
  [1540, 700, 120, 4],
  [1200, 690, 140, 5],
  [1000, 730, 110, 4],
])

const CLUMP = mass(89, 'pA', [
  [1040, 705, 70, 4],
  [1125, 742, 58, 3],
])

const tintGradient = (id, opacity) =>
  `<radialGradient id="t${id}"><stop offset="0" stop-color="var(--tint${id})" stop-opacity="${opacity}"/>` +
  `<stop offset="1" stop-color="var(--tint${id})" stop-opacity="0"/></radialGradient>`

const DEFS = tintGradient(1, 0.6) + tintGradient(2, 0.55) + tintGradient(3, 0.5) + washes.join('') + crownGradient('pA') + crownGradient('pB') + crownGradient('pC')

export const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
  svg {
    --sky-top: #6f86b8; --sky-mid: #b88ab0; --sky-low: #f0a080; --sky-hor: #fbd89c;
    --glow: #fff0cf; --glow-o: 0.9;
    --pA-hi: #f09a70; --pA-mid: #b0607a; --pA-sh: #4e4680;
    --pB-hi: #ffc98a; --pB-mid: #e8807a; --pB-sh: #8a5a98;
    --pC-hi: #fff4d6; --pC-mid: #fbc490; --pC-sh: #d88a92;
    --cirrus: #7a6aa0; --cirrus-lit: #f58a7a;
    --mist: #f6cfa4;
    --far: #eec79a; --lit-a: #f8d488; --lit-b: #e89a68; --streak: #9a78a8;
    --fore-a: #eadbd2; --fore-b: #a99cc8; --fore-edge: #fff4e2;
    --walker: #3a1422;
    --speck: #5a3320; --speck-o: 0.06; --edge: #4a2a3a; --edge-o: 0.22;
    --tint1: #f27a9a; --tint2: #8f7fd0; --tint3: #ffd070;
    --night: 0;
  }
  @media (prefers-color-scheme: dark) {
    svg {
      --sky-top: #0a0f24; --sky-mid: #2a1640; --sky-low: #7a2a44; --sky-hor: #d2682c;
      --glow: #f6a45c; --glow-o: 0.6;
      --pA-hi: #7a3848; --pA-mid: #33245a; --pA-sh: #101028;
      --pB-hi: #c8603c; --pB-mid: #6a2a56; --pB-sh: #221a40;
      --pC-hi: #f8b064; --pC-mid: #b04a4a; --pC-sh: #4a2450;
      --cirrus: #1a1838; --cirrus-lit: #a03a3c;
      --mist: #7c3420;
      --far: #4c2622; --lit-a: #6a3420; --lit-b: #3a1c1c; --streak: #120c20;
      --fore-a: #2a1c34; --fore-b: #100c1c; --fore-edge: #c8642e;
      --walker: #050308;
      --speck: #f3c9a0; --speck-o: 0.05; --edge: #000000; --edge-o: 0.5;
      --tint1: #b03a5a; --tint2: #4a3a90; --tint3: #e08a30;
      --night: 1;
    }
  }
  .back   { animation: sway 150s ease-in-out infinite alternate; }
  .tower  { animation: sway 120s ease-in-out infinite alternate-reverse; }
  .middle { animation: sway 100s ease-in-out infinite alternate; }
  .bright { animation: sway 84s ease-in-out infinite alternate-reverse; }
  @keyframes sway { from { transform: translateX(-34px); } to { transform: translateX(34px); } }
  .cirrus { animation: slide 110s ease-in-out infinite alternate; }
  @keyframes slide { from { transform: translateX(-70px); } to { transform: translateX(50px); } }
  .mist { animation: mist 46s ease-in-out infinite alternate; }
  .mist.b { animation-duration: 64s; animation-direction: alternate-reverse; }
  @keyframes mist { from { transform: translateX(-90px); opacity: 0.7; } to { transform: translateX(90px); opacity: 1; } }
  .glow { animation: breathe 16s ease-in-out infinite alternate; transform-origin: 1480px 690px; }
  @keyframes breathe { from { transform: scale(0.95); opacity: 0.85; } to { transform: scale(1.05); opacity: 1; } }
  .cloak { animation: cloak 7s ease-in-out infinite alternate; transform-origin: 1050px 896px; }
  @keyframes cloak { from { transform: skewX(-1.5deg); } to { transform: skewX(2.5deg); } }
  .stars { opacity: var(--night); }
  .stars circle { animation: twinkle 6s ease-in-out infinite alternate; }
  .stars circle:nth-child(2n) { animation-duration: 9s; animation-delay: -3s; }
  @keyframes twinkle { from { opacity: 0.2; } to { opacity: 0.9; } }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; }
  }
</style>
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0.25" y2="1">
    <stop offset="0" stop-color="var(--sky-top)"/>
    <stop offset="0.36" stop-color="var(--sky-mid)"/>
    <stop offset="0.62" stop-color="var(--sky-low)"/>
    <stop offset="0.8" stop-color="var(--sky-hor)"/>
  </linearGradient>
  <radialGradient id="glow">
    <stop offset="0" stop-color="var(--glow)" stop-opacity="var(--glow-o)"/>
    <stop offset="1" stop-color="var(--glow)" stop-opacity="0"/>
  </radialGradient>
  ${DEFS}
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="var(--mist)" stop-opacity="0"/>
    <stop offset="0.55" stop-color="var(--mist)" stop-opacity="0.92"/>
    <stop offset="1" stop-color="var(--mist)" stop-opacity="1"/>
  </linearGradient>
  <radialGradient id="mistPuff">
    <stop offset="0" stop-color="var(--mist)" stop-opacity="0.75"/>
    <stop offset="1" stop-color="var(--mist)" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="lit" x1="0" y1="0" x2="1" y2="0.6">
    <stop offset="0" stop-color="var(--lit-a)"/><stop offset="1" stop-color="var(--lit-b)"/>
  </linearGradient>
  <linearGradient id="fore" x1="0.2" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="var(--fore-a)"/><stop offset="1" stop-color="var(--fore-b)"/>
  </linearGradient>
  <radialGradient id="vig" cx="0.5" cy="0.45" r="0.78">
    <stop offset="0.55" stop-color="var(--edge)" stop-opacity="0"/>
    <stop offset="1" stop-color="var(--edge)" stop-opacity="var(--edge-o)"/>
  </radialGradient>
  <pattern id="grainA" width="11" height="13" patternUnits="userSpaceOnUse">
    <circle cx="2" cy="3" r="0.7" fill="var(--speck)"/><circle cx="8" cy="10" r="0.5" fill="var(--speck)"/>
  </pattern>
  <pattern id="grainB" width="17" height="7" patternUnits="userSpaceOnUse">
    <circle cx="5" cy="2" r="0.6" fill="var(--speck)"/><circle cx="13" cy="5" r="0.45" fill="var(--speck)"/>
  </pattern>
</defs>

<rect width="1600" height="1000" fill="url(#sky)"/>
<g class="stars" fill="#f6e6cf">
  <circle cx="900" cy="60" r="1.2"/><circle cx="1010" cy="130" r="1"/><circle cx="1190" cy="40" r="1.4"/>
  <circle cx="1330" cy="110" r="1"/><circle cx="1460" cy="50" r="1.3"/><circle cx="1550" cy="190" r="1.1"/>
  <circle cx="1110" cy="220" r="0.9"/><circle cx="1400" cy="250" r="1"/><circle cx="960" cy="290" r="0.9"/>
  <circle cx="1270" cy="330" r="1"/><circle cx="1530" cy="360" r="0.9"/><circle cx="840" cy="170" r="1"/>
</g>
<circle class="glow" cx="1480" cy="690" r="560" fill="url(#glow)"/>

<g class="cirrus">
  <g fill="var(--cirrus)" transform="rotate(-7 1250 200)">
    <ellipse cx="1260" cy="150" rx="400" ry="24" opacity="0.6"/>
    <ellipse cx="1480" cy="250" rx="320" ry="17" opacity="0.55"/>
    <ellipse cx="1060" cy="70" rx="320" ry="14" opacity="0.5"/>
    <ellipse cx="1540" cy="80" rx="280" ry="20" opacity="0.55"/>
    <ellipse cx="1180" cy="228" rx="230" ry="11" opacity="0.45"/>
  </g>
  <g fill="var(--cirrus-lit)" transform="rotate(-7 1250 200)">
    <ellipse cx="1300" cy="176" rx="330" ry="7" opacity="0.55"/>
    <ellipse cx="1500" cy="272" rx="260" ry="6" opacity="0.6"/>
    <ellipse cx="1400" cy="340" rx="320" ry="9" opacity="0.5"/>
    <ellipse cx="1560" cy="420" rx="240" ry="7" opacity="0.5"/>
  </g>
</g>

<g class="back" opacity="0.82">${BACK}</g>
<g class="tower">${TOWER}</g>
<g class="middle">${MIDDLE}</g>
<g class="bright">${BRIGHT}${CLUMP}</g>

<rect x="0" y="600" width="1600" height="300" fill="url(#haze)"/>
<g class="mist">
  <ellipse cx="300" cy="790" rx="460" ry="70" fill="url(#mistPuff)"/>
  <ellipse cx="1250" cy="770" rx="520" ry="80" fill="url(#mistPuff)"/>
</g>
<g class="mist b">
  <ellipse cx="760" cy="800" rx="480" ry="60" fill="url(#mistPuff)"/>
  <ellipse cx="1560" cy="740" rx="320" ry="90" fill="url(#mistPuff)"/>
</g>
<circle cx="1480" cy="720" r="330" fill="url(#glow)" opacity="0.55"/>

<path fill="var(--far)" opacity="0.85" d="M-100 822 Q300 800 700 818 T1700 792 L1700 1000 L-100 1000 Z"/>
<path fill="url(#lit)" d="M-100 742 C200 772 500 834 900 874 L1700 884 L1700 1000 L-100 1000 Z"/>
<g fill="var(--streak)" opacity="0.4">
  <path d="M430 846 Q700 838 1000 872 Q700 858 430 846 Z"/>
  <path d="M620 880 Q900 866 1240 882 Q900 884 620 880 Z"/>
  <path d="M-100 790 Q120 800 330 850 Q110 822 -100 812 Z"/>
  <path d="M900 858 Q1150 850 1420 866 Q1150 864 900 858 Z"/>
</g>

<path fill="url(#fore)" d="M-100 902 C300 962 600 962 800 930 C1000 900 1300 860 1700 800 L1700 1000 L-100 1000 Z"/>
<path fill="none" stroke="var(--fore-edge)" stroke-width="2" stroke-linecap="round" opacity="0.6" d="M800 930 C1000 900 1300 860 1700 800"/>
<path fill="var(--walker)" opacity="0.22" d="M1050 896 L952 918 L1056 902 Z"/>
<g class="cloak" fill="var(--walker)">
  <path d="M1053 777 C1044 779 1041 791 1040 800 C1034 830 1030 862 1031 892 L1050 897 L1062 894 C1072 895 1082 891 1091 882 C1080 866 1072 836 1067 806 C1066 794 1062 779 1053 777 Z"/>
</g>

<rect width="1600" height="1000" fill="url(#grainA)" opacity="var(--speck-o)"/>
<rect width="1600" height="1000" fill="url(#grainB)" opacity="var(--speck-o)"/>
<rect width="1600" height="1000" fill="url(#vig)"/>
</svg>`
