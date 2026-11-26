export const BODY_FONTS = [
  { id: 'space-grotesk', label: 'Space Grotesk', stack: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif", google: 'Space+Grotesk:wght@400;500;600;700' },
  { id: 'inter', label: 'Inter', stack: "'Inter', 'Segoe UI', system-ui, sans-serif", google: 'Inter:wght@400;500;600;700' },
  { id: 'plus-jakarta', label: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif", google: 'Plus+Jakarta+Sans:wght@400;500;600;700' },
  { id: 'manrope', label: 'Manrope', stack: "'Manrope', 'Segoe UI', system-ui, sans-serif", google: 'Manrope:wght@400;500;600;700' },
  { id: 'sora', label: 'Sora', stack: "'Sora', 'Segoe UI', system-ui, sans-serif", google: 'Sora:wght@400;500;600;700' },
  { id: 'dm-sans', label: 'DM Sans', stack: "'DM Sans', 'Segoe UI', system-ui, sans-serif", google: 'DM+Sans:wght@400;500;600;700' },
  { id: 'ibm-plex-sans', label: 'IBM Plex Sans', stack: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif", google: 'IBM+Plex+Sans:wght@400;500;600;700' },
  { id: 'system-sans', label: 'System Sans', stack: "system-ui, -apple-system, 'Segoe UI', sans-serif", google: '' },
];

export const DISPLAY_FONTS = [
  { id: 'instrument-serif', label: 'Instrument Serif', stack: "'Instrument Serif', Georgia, 'Times New Roman', serif", google: 'Instrument+Serif:ital@0;1' },
  { id: 'playfair', label: 'Playfair Display', stack: "'Playfair Display', Georgia, serif", google: 'Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600' },
  { id: 'fraunces', label: 'Fraunces', stack: "'Fraunces', Georgia, serif", google: 'Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500' },
  { id: 'cormorant', label: 'Cormorant Garamond', stack: "'Cormorant Garamond', Georgia, serif", google: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500' },
  { id: 'dm-serif', label: 'DM Serif Display', stack: "'DM Serif Display', Georgia, serif", google: 'DM+Serif+Display:ital@0;1' },
  { id: 'lora', label: 'Lora', stack: "'Lora', Georgia, serif", google: 'Lora:ital,wght@0,400;0,500;0,600;1,400;1,500' },
  { id: 'georgia', label: 'Georgia', stack: "Georgia, 'Times New Roman', serif", google: '' },
];

export const MONO_FONTS = [
  { id: 'jetbrains-mono', label: 'JetBrains Mono', stack: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace", google: 'JetBrains+Mono:wght@400;500;600' },
  { id: 'ibm-plex-mono', label: 'IBM Plex Mono', stack: "'IBM Plex Mono', 'Cascadia Code', Consolas, monospace", google: 'IBM+Plex+Mono:wght@400;500;600' },
  { id: 'space-mono', label: 'Space Mono', stack: "'Space Mono', 'Cascadia Code', Consolas, monospace", google: 'Space+Mono:ital,wght@0,400;0,700;1,400' },
  { id: 'fira-code', label: 'Fira Code', stack: "'Fira Code', 'Cascadia Code', Consolas, monospace", google: 'Fira+Code:wght@400;500;600' },
  { id: 'system-mono', label: 'System Mono', stack: "'Cascadia Code', Consolas, 'Courier New', monospace", google: '' },
];

export const TONES = {
  dark: [
    { id: 'default', label: 'Midnight', bg: '#06080a', panel: '#0b0f13', text: '#edf2f4' },
    { id: 'graphite', label: 'Graphite', bg: '#0a0c0e', panel: '#12161b', text: '#edf2f4' },
    { id: 'navy', label: 'Deep Navy', bg: '#050a12', panel: '#0b1421', text: '#edf2f4' },
    { id: 'forest', label: 'Forest', bg: '#050b08', panel: '#0c1711', text: '#edf2f4' },
  ],
  light: [
    { id: 'default', label: 'Paper', bg: '#f2efe7', panel: '#fbfaf6', text: '#11181d' },
    { id: 'mist', label: 'Mist', bg: '#eef2f4', panel: '#f8fafb', text: '#11181d' },
    { id: 'sand', label: 'Sand', bg: '#f5eddf', panel: '#fdf8ef', text: '#1b1712' },
  ],
};

const ALL_TONES = [...TONES.dark, ...TONES.light].map((tone) => tone.id);

export function findFont(list, id) {
  return list.find((font) => font.id === id) || list[0];
}

export function fontStack(list, id) {
  return findFont(list, id).stack;
}

export function normalizeFonts(settings = {}) {
  return {
    body: findFont(BODY_FONTS, settings.fontBody).id,
    display: findFont(DISPLAY_FONTS, settings.fontDisplay).id,
    mono: findFont(MONO_FONTS, settings.fontMono).id,
  };
}

export function normalizeTone(settings = {}) {
  const mode = settings.mode === 'light' ? 'light' : 'dark';
  const list = TONES[mode];
  const id = ALL_TONES.includes(settings.tone) ? settings.tone : 'default';
  return list.some((tone) => tone.id === id) ? id : 'default';
}

function googleFamilies(settings = {}) {
  const fonts = normalizeFonts(settings);
  return [
    findFont(BODY_FONTS, fonts.body).google,
    findFont(DISPLAY_FONTS, fonts.display).google,
    findFont(MONO_FONTS, fonts.mono).google,
  ].filter(Boolean);
}

export function fontHref(settings = {}) {
  const families = googleFamilies(settings);
  if (!families.length) return '';
  return `https://fonts.googleapis.com/css2?${families.map((family) => `family=${family}`).join('&')}&display=swap`;
}

export function loadFontFaces(settings = {}) {
  if (typeof document === 'undefined') return;
  const href = fontHref(settings);
  let link = document.getElementById('site-fonts');
  if (!href) {
    if (link) link.remove();
    return;
  }
  if (!link) {
    link = document.createElement('link');
    link.id = 'site-fonts';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.getAttribute('href') !== href) link.setAttribute('href', href);
}

export function applyTypography(settings = {}) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const fonts = normalizeFonts(settings);
  root.style.setProperty('--font-sans', fontStack(BODY_FONTS, fonts.body));
  root.style.setProperty('--font-serif', fontStack(DISPLAY_FONTS, fonts.display));
  root.style.setProperty('--font-mono', fontStack(MONO_FONTS, fonts.mono));
  loadFontFaces(settings);
}

export function tonePreview(settings = {}) {
  const mode = settings.mode === 'light' ? 'light' : 'dark';
  const id = normalizeTone(settings);
  return TONES[mode].find((tone) => tone.id === id) || TONES[mode][0];
}
