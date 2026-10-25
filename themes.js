// ============ MEP LEDGER THEME ENGINE ============
// Optimized: reduced from 273 palettes to 3 curated palettes.
// Keeping the list tiny removes hundreds of DOM nodes from the theme
// selector and eliminates needless style recalculation on open.
// Each theme: { name, bg, primary, accent, text, glow, mode }

const themes = [
    { name: "Ocean Breeze", bg: '#ecfeff', primary: '#cffafe', accent: '#0891b2', text: '#164e63', glow: 'rgba(8, 145, 178, 0.08)', mode: 'lite' },
    { name: "Cloud White",  bg: '#ffffff', primary: '#e2e8f0', accent: '#3b82f6', text: '#0f172a', glow: 'rgba(59, 130, 246, 0.08)', mode: 'lite' },
    { name: "Emerald Foam", bg: '#ecfdf5', primary: '#d1fae5', accent: '#059669', text: '#064e3b', glow: 'rgba(5, 150, 105, 0.08)', mode: 'lite' },
];