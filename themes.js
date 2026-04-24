// ============ MEP LEDGER THEME ENGINE ============
// Externalized theme definitions for performance optimization
// Each theme: { name, bg, primary, accent, text, glow, mode }
// mode: 'dark' (default) or 'lite'

const themes = [
    // ═══════════════════════════════════════════════════
    // ██████  DARK THEMES  ██████
    // ═══════════════════════════════════════════════════

    // ─── ORIGINAL CORE ───
    { name: "Midnight Teal",     bg: '#0c1222', primary: '#164e63', accent: '#0891b2', text: '#cffafe', glow: 'rgba(8, 145, 178, 0.15)', mode: 'dark' },
    { name: "Forest Depth",      bg: '#0a1612', primary: '#1a4d2e', accent: '#4f6f52', text: '#f0fdf4', glow: 'rgba(79, 111, 82, 0.15)', mode: 'dark' },
    { name: "Espresso Night",    bg: '#151010', primary: '#43302b', accent: '#624a42', text: '#fffaf3', glow: 'rgba(98, 74, 66, 0.15)', mode: 'dark' },
    { name: "Deep Ocean",        bg: '#0a1020', primary: '#102a43', accent: '#243b53', text: '#f0f4f8', glow: 'rgba(36, 59, 83, 0.2)', mode: 'dark' },
    { name: "Carbon Steel",      bg: '#0f1218', primary: '#1e293b', accent: '#475569', text: '#f8fafc', glow: 'rgba(71, 85, 105, 0.15)', mode: 'dark' },
    { name: "Crimson Dark",      bg: '#150a0a', primary: '#7f1d1d', accent: '#991b1b', text: '#fef2f2', glow: 'rgba(153, 27, 27, 0.12)', mode: 'dark' },

    // ─── PREMIUM NEON ───
    { name: "Neon Amethyst",     bg: '#100a16', primary: '#581c87', accent: '#9333ea', text: '#faf5ff', glow: 'rgba(147, 51, 234, 0.15)', mode: 'dark' },
    { name: "Cyber Gold",        bg: '#141208', primary: '#854d0e', accent: '#ca8a04', text: '#fefce8', glow: 'rgba(202, 138, 4, 0.15)', mode: 'dark' },
    { name: "Toxic Lime",        bg: '#0a1608', primary: '#166534', accent: '#16a34a', text: '#f0fdf4', glow: 'rgba(22, 163, 74, 0.15)', mode: 'dark' },
    { name: "Abyssal Indigo",    bg: '#0a0a1a', primary: '#312e81', accent: '#4f46e5', text: '#eef2ff', glow: 'rgba(79, 70, 229, 0.15)', mode: 'dark' },
    { name: "Solar Flare",       bg: '#160a0a', primary: '#9a3412', accent: '#ea580c', text: '#fff7ed', glow: 'rgba(234, 88, 12, 0.15)', mode: 'dark' },
    { name: "Cosmic Pink",       bg: '#160a12', primary: '#9d174d', accent: '#db2777', text: '#fdf2f8', glow: 'rgba(219, 39, 119, 0.15)', mode: 'dark' },
    { name: "Electric Cyan",     bg: '#081416', primary: '#155e75', accent: '#06b6d4', text: '#ecfeff', glow: 'rgba(6, 182, 212, 0.15)', mode: 'dark' },
    { name: "Void Violet",       bg: '#120816', primary: '#4c1d95', accent: '#7c3aed', text: '#f5f3ff', glow: 'rgba(124, 58, 237, 0.15)', mode: 'dark' },
    { name: "Volcanic Ruby",     bg: '#16080a', primary: '#9f1239', accent: '#e11d48', text: '#fff1f2', glow: 'rgba(225, 29, 72, 0.15)', mode: 'dark' },
    { name: "Dark Emerald",      bg: '#081610', primary: '#065f46', accent: '#10b981', text: '#ecfdf5', glow: 'rgba(16, 185, 129, 0.15)', mode: 'dark' },
    { name: "Nebula Fuchsia",    bg: '#160a14', primary: '#86198f', accent: '#c026d3', text: '#fdf4ff', glow: 'rgba(192, 38, 211, 0.15)', mode: 'dark' },
    { name: "Obsidian Silver",   bg: '#101214', primary: '#3f3f46', accent: '#71717a', text: '#f4f4f5', glow: 'rgba(113, 113, 122, 0.15)', mode: 'dark' },
    { name: "Twilight Blue",     bg: '#0a121a', primary: '#1e3a8a', accent: '#2563eb', text: '#eff6ff', glow: 'rgba(37, 99, 235, 0.15)', mode: 'dark' },
    { name: "Desert Bronze",     bg: '#14100c', primary: '#78350f', accent: '#b45309', text: '#fffbeb', glow: 'rgba(180, 83, 9, 0.15)', mode: 'dark' },
    { name: "Aurora Mint",       bg: '#081a18', primary: '#115e59', accent: '#14b8a6', text: '#f0fdfa', glow: 'rgba(20, 184, 166, 0.15)', mode: 'dark' },
    { name: "Blood Moon",        bg: '#1a0a0a', primary: '#7f1d1d', accent: '#dc2626', text: '#fef2f2', glow: 'rgba(220, 38, 38, 0.15)', mode: 'dark' },
    { name: "Cyber Magma",       bg: '#1a0515', primary: '#831843', accent: '#be185d', text: '#fdf2f8', glow: 'rgba(190, 24, 93, 0.15)', mode: 'dark' },
    { name: "Ghost White",       bg: '#1e242a', primary: '#64748b', accent: '#94a3b8', text: '#f8fafc', glow: 'rgba(148, 163, 184, 0.15)', mode: 'dark' },

    // ─── BRIGHT & COLORFUL ───
    { name: "Tropical Paradise", bg: '#1a0b06', primary: '#c05621', accent: '#ed8936', text: '#ffedd5', glow: 'rgba(237, 137, 54, 0.15)', mode: 'dark' },
    { name: "Neon Cyberpunk",    bg: '#090514', primary: '#b83280', accent: '#f472b6', text: '#fce7f3', glow: 'rgba(244, 114, 182, 0.15)', mode: 'dark' },
    { name: "Sunny Melon",       bg: '#141108', primary: '#b45309', accent: '#f59e0b', text: '#fef3c7', glow: 'rgba(245, 158, 11, 0.15)', mode: 'dark' },
    { name: "Aqua Marine",       bg: '#051414', primary: '#0369a1', accent: '#0ea5e9', text: '#e0f2fe', glow: 'rgba(14, 165, 233, 0.15)', mode: 'dark' },
    { name: "Electric Violet",   bg: '#0e0514', primary: '#5b21b6', accent: '#a78bfa', text: '#ede9fe', glow: 'rgba(167, 139, 250, 0.15)', mode: 'dark' },

    // ─── GOLDEN ───
    { name: "Royal Gold",        bg: '#14110a', primary: '#92400e', accent: '#f59e0b', text: '#fef3c7', glow: 'rgba(245, 158, 11, 0.20)', mode: 'dark' },

    // ─── EXPANDED DARK ───
    { name: "Burnt Sienna",      bg: '#160e08', primary: '#7c2d12', accent: '#c2410c', text: '#fff7ed', glow: 'rgba(194, 65, 12, 0.15)', mode: 'dark' },
    { name: "Terracotta Dusk",   bg: '#1a0f0a', primary: '#9a3412', accent: '#d97706', text: '#fef9c3', glow: 'rgba(217, 119, 6, 0.15)', mode: 'dark' },
    { name: "Copper Flame",      bg: '#14100a', primary: '#a16207', accent: '#eab308', text: '#fefce8', glow: 'rgba(234, 179, 8, 0.18)', mode: 'dark' },
    { name: "Sandstorm",         bg: '#161208', primary: '#713f12', accent: '#a16207', text: '#fef9c3', glow: 'rgba(161, 98, 7, 0.15)', mode: 'dark' },
    { name: "Mahogany Wood",     bg: '#120a06', primary: '#6b2c0e', accent: '#92400e', text: '#fed7aa', glow: 'rgba(146, 64, 14, 0.15)', mode: 'dark' },
    { name: "Arctic Freeze",     bg: '#080e18', primary: '#1e3a5f', accent: '#3b82f6', text: '#dbeafe', glow: 'rgba(59, 130, 246, 0.18)', mode: 'dark' },
    { name: "Sapphire Night",    bg: '#0a0c1e', primary: '#1e40af', accent: '#3b82f6', text: '#dbeafe', glow: 'rgba(59, 130, 246, 0.15)', mode: 'dark' },
    { name: "Frozen Lake",       bg: '#081218', primary: '#0c4a6e', accent: '#0284c7', text: '#e0f2fe', glow: 'rgba(2, 132, 199, 0.15)', mode: 'dark' },
    { name: "Glacial Blue",      bg: '#0a1018', primary: '#1e3a5f', accent: '#38bdf8', text: '#e0f2fe', glow: 'rgba(56, 189, 248, 0.15)', mode: 'dark' },
    { name: "Deep Bermuda",      bg: '#061414', primary: '#134e4a', accent: '#2dd4bf', text: '#ccfbf1', glow: 'rgba(45, 212, 191, 0.15)', mode: 'dark' },
    { name: "Navy Admiral",      bg: '#0a0c16', primary: '#1e3a5f', accent: '#1d4ed8', text: '#dbeafe', glow: 'rgba(29, 78, 216, 0.15)', mode: 'dark' },
    { name: "Grape Nebula",      bg: '#120a18', primary: '#6b21a8', accent: '#a855f7', text: '#f3e8ff', glow: 'rgba(168, 85, 247, 0.15)', mode: 'dark' },
    { name: "Lavender Storm",    bg: '#0e0a16', primary: '#5b21b6', accent: '#8b5cf6', text: '#ede9fe', glow: 'rgba(139, 92, 246, 0.15)', mode: 'dark' },
    { name: "Plum Twilight",     bg: '#140a14', primary: '#701a75', accent: '#a21caf', text: '#fae8ff', glow: 'rgba(162, 28, 175, 0.15)', mode: 'dark' },
    { name: "Mystic Purple",     bg: '#100812', primary: '#581c87', accent: '#7e22ce', text: '#f5f3ff', glow: 'rgba(126, 34, 206, 0.15)', mode: 'dark' },
    { name: "Ultraviolet",       bg: '#0c0814', primary: '#4c1d95', accent: '#6d28d9', text: '#ede9fe', glow: 'rgba(109, 40, 217, 0.18)', mode: 'dark' },
    { name: "Jade Temple",       bg: '#081410', primary: '#064e3b', accent: '#059669', text: '#d1fae5', glow: 'rgba(5, 150, 105, 0.15)', mode: 'dark' },
    { name: "Amazon Jungle",     bg: '#0a1608', primary: '#14532d', accent: '#22c55e', text: '#dcfce7', glow: 'rgba(34, 197, 94, 0.15)', mode: 'dark' },
    { name: "Neon Matrix",       bg: '#060e06', primary: '#15803d', accent: '#4ade80', text: '#dcfce7', glow: 'rgba(74, 222, 128, 0.20)', mode: 'dark' },
    { name: "Pine Forest",       bg: '#0a120c', primary: '#1a4d2e', accent: '#059669', text: '#ecfdf5', glow: 'rgba(5, 150, 105, 0.12)', mode: 'dark' },
    { name: "Moss Garden",       bg: '#0c1208', primary: '#365314', accent: '#84cc16', text: '#ecfccb', glow: 'rgba(132, 204, 22, 0.15)', mode: 'dark' },
    { name: "Cherry Blossom",    bg: '#16080c', primary: '#881337', accent: '#f43f5e', text: '#ffe4e6', glow: 'rgba(244, 63, 94, 0.15)', mode: 'dark' },
    { name: "Scarlet Blade",     bg: '#1a0808', primary: '#991b1b', accent: '#ef4444', text: '#fee2e2', glow: 'rgba(239, 68, 68, 0.18)', mode: 'dark' },
    { name: "Rose Quartz",       bg: '#140810', primary: '#9d174d', accent: '#ec4899', text: '#fce7f3', glow: 'rgba(236, 72, 153, 0.15)', mode: 'dark' },
    { name: "Sunset Blaze",      bg: '#180a06', primary: '#b91c1c', accent: '#f97316', text: '#ffedd5', glow: 'rgba(249, 115, 22, 0.15)', mode: 'dark' },
    { name: "Magenta Pulse",     bg: '#14060e', primary: '#a21caf', accent: '#e879f9', text: '#fae8ff', glow: 'rgba(232, 121, 249, 0.18)', mode: 'dark' },
    { name: "Shadow Realm",      bg: '#0a0a0c', primary: '#18181b', accent: '#3f3f46', text: '#e4e4e7', glow: 'rgba(63, 63, 70, 0.15)', mode: 'dark' },
    { name: "Onyx Midnight",     bg: '#08080a', primary: '#1c1917', accent: '#44403c', text: '#e7e5e4', glow: 'rgba(68, 64, 60, 0.12)', mode: 'dark' },
    { name: "Charcoal Abyss",    bg: '#0c0c0e', primary: '#27272a', accent: '#52525b', text: '#d4d4d8', glow: 'rgba(82, 82, 91, 0.15)', mode: 'dark' },
    { name: "Phantom Black",     bg: '#060608', primary: '#0f172a', accent: '#334155', text: '#cbd5e1', glow: 'rgba(51, 65, 85, 0.15)', mode: 'dark' },
    { name: "Dragon Fire",       bg: '#160806', primary: '#b91c1c', accent: '#fbbf24', text: '#fef3c7', glow: 'rgba(251, 191, 36, 0.18)', mode: 'dark' },
    { name: "Northern Lights",   bg: '#081216', primary: '#0e7490', accent: '#22d3ee', text: '#cffafe', glow: 'rgba(34, 211, 238, 0.18)', mode: 'dark' },
    { name: "Sakura Moon",       bg: '#12080c', primary: '#be185d', accent: '#fb7185', text: '#ffe4e6', glow: 'rgba(251, 113, 133, 0.15)', mode: 'dark' },
    { name: "Ocean Storm",       bg: '#0a1016', primary: '#0c4a6e', accent: '#0ea5e9', text: '#e0f2fe', glow: 'rgba(14, 165, 233, 0.18)', mode: 'dark' },
    { name: "Emerald City",      bg: '#061208', primary: '#065f46', accent: '#34d399', text: '#d1fae5', glow: 'rgba(52, 211, 153, 0.18)', mode: 'dark' },
    { name: "Amber Sunset",      bg: '#14100a', primary: '#b45309', accent: '#fbbf24', text: '#fef3c7', glow: 'rgba(251, 191, 36, 0.15)', mode: 'dark' },
    { name: "Electric Storm",    bg: '#0c0816', primary: '#4338ca', accent: '#818cf8', text: '#e0e7ff', glow: 'rgba(129, 140, 248, 0.18)', mode: 'dark' },
    { name: "Midnight Rose",     bg: '#140810', primary: '#831843', accent: '#f472b6', text: '#fce7f3', glow: 'rgba(244, 114, 182, 0.18)', mode: 'dark' },
    { name: "Titanium Chrome",   bg: '#0e1014', primary: '#374151', accent: '#6b7280', text: '#f3f4f6', glow: 'rgba(107, 114, 128, 0.15)', mode: 'dark' },
    { name: "Neon Sunrise",      bg: '#160a06', primary: '#c2410c', accent: '#fb923c', text: '#ffedd5', glow: 'rgba(251, 146, 60, 0.18)', mode: 'dark' },
    { name: "Frozen Tundra",     bg: '#0a1214', primary: '#164e63', accent: '#67e8f9', text: '#cffafe', glow: 'rgba(103, 232, 249, 0.15)', mode: 'dark' },
    { name: "Crimson Tide",      bg: '#140608', primary: '#9f1239', accent: '#fb7185', text: '#ffe4e6', glow: 'rgba(251, 113, 133, 0.18)', mode: 'dark' },
    { name: "Galaxy Nebula",     bg: '#0a0614', primary: '#4338ca', accent: '#a78bfa', text: '#ede9fe', glow: 'rgba(167, 139, 250, 0.18)', mode: 'dark' },
    { name: "Rust Metal",        bg: '#12080a', primary: '#78350f', accent: '#ea580c', text: '#fff7ed', glow: 'rgba(234, 88, 12, 0.15)', mode: 'dark' },
    { name: "Quantum Blue",      bg: '#060c18', primary: '#1d4ed8', accent: '#60a5fa', text: '#dbeafe', glow: 'rgba(96, 165, 250, 0.18)', mode: 'dark' },
    { name: "Volcanic Orange",   bg: '#160c06', primary: '#9a3412', accent: '#fb923c', text: '#ffedd5', glow: 'rgba(251, 146, 60, 0.15)', mode: 'dark' },
    { name: "Midnight Orchid",   bg: '#100612', primary: '#6b21a8', accent: '#c084fc', text: '#f3e8ff', glow: 'rgba(192, 132, 252, 0.18)', mode: 'dark' },
    { name: "Steel Thunder",     bg: '#0c0e12', primary: '#334155', accent: '#64748b', text: '#e2e8f0', glow: 'rgba(100, 116, 139, 0.15)', mode: 'dark' },
    { name: "Coral Reef",        bg: '#120808', primary: '#b91c1c', accent: '#fb7185', text: '#ffe4e6', glow: 'rgba(251, 113, 133, 0.15)', mode: 'dark' },
    { name: "Mystic Turquoise",  bg: '#061412', primary: '#0f766e', accent: '#2dd4bf', text: '#ccfbf1', glow: 'rgba(45, 212, 191, 0.18)', mode: 'dark' },

    // ─── EXPANDED DARK VOL. 2 ───
    { name: "Hacker Terminal",   bg: '#030805', primary: '#14532d', accent: '#00ff9c', text: '#bbf7d0', glow: 'rgba(0, 255, 156, 0.22)', mode: 'dark' },
    { name: "Retro CRT",         bg: '#050a04', primary: '#166534', accent: '#39ff14', text: '#d9f99d', glow: 'rgba(57, 255, 20, 0.20)', mode: 'dark' },
    { name: "Dark Matter",       bg: '#05060a', primary: '#1e1b4b', accent: '#7c3aed', text: '#e0e7ff', glow: 'rgba(124, 58, 237, 0.18)', mode: 'dark' },
    { name: "Ink Well",          bg: '#07090f', primary: '#1e293b', accent: '#38bdf8', text: '#e2e8f0', glow: 'rgba(56, 189, 248, 0.15)', mode: 'dark' },
    { name: "Tungsten Edge",     bg: '#0a0a0e', primary: '#292524', accent: '#a8a29e', text: '#f5f5f4', glow: 'rgba(168, 162, 158, 0.14)', mode: 'dark' },
    { name: "Gunmetal Grey",     bg: '#0b0d10', primary: '#1f2937', accent: '#9ca3af', text: '#f3f4f6', glow: 'rgba(156, 163, 175, 0.14)', mode: 'dark' },
    { name: "Stealth Bomber",    bg: '#04060a', primary: '#0f172a', accent: '#1e40af', text: '#cbd5e1', glow: 'rgba(30, 64, 175, 0.18)', mode: 'dark' },
    { name: "Mariana Trench",    bg: '#04081a', primary: '#0c1e3f', accent: '#1d4ed8', text: '#dbeafe', glow: 'rgba(29, 78, 216, 0.18)', mode: 'dark' },
    { name: "Midnight Peacock",  bg: '#040e14', primary: '#0e4a6e', accent: '#14b8a6', text: '#ccfbf1', glow: 'rgba(20, 184, 166, 0.20)', mode: 'dark' },
    { name: "Deep Amethyst",     bg: '#0c0614', primary: '#3b0764', accent: '#a855f7', text: '#f3e8ff', glow: 'rgba(168, 85, 247, 0.20)', mode: 'dark' },
    { name: "Obsidian Gold",     bg: '#0a0805', primary: '#1c1917', accent: '#eab308', text: '#fef9c3', glow: 'rgba(234, 179, 8, 0.22)', mode: 'dark' },
    { name: "Black Pearl",       bg: '#060708', primary: '#111827', accent: '#e5e7eb', text: '#f9fafb', glow: 'rgba(229, 231, 235, 0.10)', mode: 'dark' },
    { name: "Void Black",        bg: '#020204', primary: '#0a0a0a', accent: '#525252', text: '#e5e5e5', glow: 'rgba(82, 82, 82, 0.14)', mode: 'dark' },
    { name: "Blackberry",        bg: '#0a0612', primary: '#1e1b4b', accent: '#8b5cf6', text: '#ede9fe', glow: 'rgba(139, 92, 246, 0.18)', mode: 'dark' },
    { name: "Forest Mystic",     bg: '#04100a', primary: '#134e4a', accent: '#4ade80', text: '#dcfce7', glow: 'rgba(74, 222, 128, 0.18)', mode: 'dark' },
    { name: "Emerald Abyss",     bg: '#04110c', primary: '#064e3b', accent: '#10b981', text: '#ecfdf5', glow: 'rgba(16, 185, 129, 0.20)', mode: 'dark' },
    { name: "Ruby Shadow",       bg: '#120308', primary: '#881337', accent: '#f43f5e', text: '#ffe4e6', glow: 'rgba(244, 63, 94, 0.18)', mode: 'dark' },
    { name: "Dark Cherry",       bg: '#120406', primary: '#7f1d1d', accent: '#b91c1c', text: '#fecaca', glow: 'rgba(185, 28, 28, 0.18)', mode: 'dark' },
    { name: "Oxblood Noir",      bg: '#100608', primary: '#450a0a', accent: '#dc2626', text: '#fee2e2', glow: 'rgba(220, 38, 38, 0.15)', mode: 'dark' },
    { name: "Teal Phantom",      bg: '#03100e', primary: '#115e59', accent: '#5eead4', text: '#ccfbf1', glow: 'rgba(94, 234, 212, 0.18)', mode: 'dark' },
    { name: "Cobalt Edge",       bg: '#060a18', primary: '#1e3a8a', accent: '#60a5fa', text: '#dbeafe', glow: 'rgba(96, 165, 250, 0.18)', mode: 'dark' },
    { name: "Indigo Depth",      bg: '#070820', primary: '#312e81', accent: '#6366f1', text: '#e0e7ff', glow: 'rgba(99, 102, 241, 0.20)', mode: 'dark' },
    { name: "Noir Crimson",      bg: '#0a0406', primary: '#3f0a0a', accent: '#991b1b', text: '#fecaca', glow: 'rgba(153, 27, 27, 0.16)', mode: 'dark' },
    { name: "Graphite Slate",    bg: '#0a0b0d', primary: '#1f2937', accent: '#4b5563', text: '#e5e7eb', glow: 'rgba(75, 85, 99, 0.14)', mode: 'dark' },
    { name: "Plasma Pink",       bg: '#0e0412', primary: '#86198f', accent: '#f472b6', text: '#fce7f3', glow: 'rgba(244, 114, 182, 0.20)', mode: 'dark' },
    { name: "Toxic Green",       bg: '#041404', primary: '#14532d', accent: '#84cc16', text: '#ecfccb', glow: 'rgba(132, 204, 22, 0.22)', mode: 'dark' },
    { name: "Lava Core",         bg: '#120403', primary: '#7f1d1d', accent: '#f97316', text: '#ffedd5', glow: 'rgba(249, 115, 22, 0.22)', mode: 'dark' },
    { name: "Arctic Aurora",     bg: '#041014', primary: '#134e4a', accent: '#22d3ee', text: '#cffafe', glow: 'rgba(34, 211, 238, 0.20)', mode: 'dark' },
    { name: "Nightshade",        bg: '#0a0612', primary: '#4c1d95', accent: '#c084fc', text: '#f3e8ff', glow: 'rgba(192, 132, 252, 0.18)', mode: 'dark' },
    { name: "Dark Mocha",        bg: '#140e0a', primary: '#44403c', accent: '#a78b71', text: '#fef7ed', glow: 'rgba(167, 139, 113, 0.14)', mode: 'dark' },

    // ═══════════════════════════════════════════════════
    // ██████  LITE / LIGHT THEMES  ██████
    // ═══════════════════════════════════════════════════

    // ─── SOFT & CLEAN ───
    { name: "Cloud White",       bg: '#ffffff', primary: '#e2e8f0', accent: '#3b82f6', text: '#0f172a', glow: 'rgba(59, 130, 246, 0.08)', mode: 'lite' },
    { name: "Cream Paper",       bg: '#fefdf8', primary: '#f5f0e6', accent: '#d97706', text: '#1c1917', glow: 'rgba(217, 119, 6, 0.08)', mode: 'lite' },
    { name: "Snow Drift",        bg: '#f8fafc', primary: '#e2e8f0', accent: '#64748b', text: '#0f172a', glow: 'rgba(100, 116, 139, 0.08)', mode: 'lite' },
    { name: "Pearl Mist",        bg: '#fafafa', primary: '#f4f4f5', accent: '#a1a1aa', text: '#18181b', glow: 'rgba(161, 161, 170, 0.08)', mode: 'lite' },
    { name: "Ivory Silk",        bg: '#fffbeb', primary: '#fef3c7', accent: '#f59e0b', text: '#451a03', glow: 'rgba(245, 158, 11, 0.10)', mode: 'lite' },

    // ─── BLUE FAMILY ───
    { name: "Sky Blue",          bg: '#f0f9ff', primary: '#e0f2fe', accent: '#0284c7', text: '#0c4a6e', glow: 'rgba(2, 132, 199, 0.08)', mode: 'lite' },
    { name: "Ocean Breeze",      bg: '#ecfeff', primary: '#cffafe', accent: '#0891b2', text: '#164e63', glow: 'rgba(8, 145, 178, 0.08)', mode: 'lite' },
    { name: "Arctic Blue",       bg: '#eff6ff', primary: '#dbeafe', accent: '#2563eb', text: '#1e3a8a', glow: 'rgba(37, 99, 235, 0.08)', mode: 'lite' },
    { name: "Powder Blue",       bg: '#f0f9ff', primary: '#bae6fd', accent: '#0ea5e9', text: '#075985', glow: 'rgba(14, 165, 233, 0.08)', mode: 'lite' },
    { name: "Cornflower",        bg: '#eef2ff', primary: '#e0e7ff', accent: '#4f46e5', text: '#312e81', glow: 'rgba(79, 70, 229, 0.08)', mode: 'lite' },
    { name: "Baby Blue",         bg: '#f0f9ff', primary: '#e0f2fe', accent: '#38bdf8', text: '#0c4a6e', glow: 'rgba(56, 189, 248, 0.08)', mode: 'lite' },
    { name: "Sapphire Light",    bg: '#eff6ff', primary: '#dbeafe', accent: '#3b82f6', text: '#1e40af', glow: 'rgba(59, 130, 246, 0.10)', mode: 'lite' },
    { name: "Navy Frost",        bg: '#f1f5f9', primary: '#e2e8f0', accent: '#1d4ed8', text: '#1e3a5f', glow: 'rgba(29, 78, 216, 0.08)', mode: 'lite' },

    // ─── GREEN FAMILY ───
    { name: "Mint Fresh",        bg: '#f0fdfa', primary: '#ccfbf1', accent: '#14b8a6', text: '#134e4a', glow: 'rgba(20, 184, 166, 0.08)', mode: 'lite' },
    { name: "Spring Garden",     bg: '#f0fdf4', primary: '#dcfce7', accent: '#22c55e', text: '#14532d', glow: 'rgba(34, 197, 94, 0.08)', mode: 'lite' },
    { name: "Emerald Light",     bg: '#ecfdf5', primary: '#d1fae5', accent: '#10b981', text: '#065f46', glow: 'rgba(16, 185, 129, 0.08)', mode: 'lite' },
    { name: "Sage Harmony",      bg: '#f0fdf4', primary: '#dcfce7', accent: '#4ade80', text: '#166534', glow: 'rgba(74, 222, 128, 0.08)', mode: 'lite' },
    { name: "Lime Zest",         bg: '#f7fee7', primary: '#ecfccb', accent: '#84cc16', text: '#365314', glow: 'rgba(132, 204, 22, 0.08)', mode: 'lite' },
    { name: "Forest Glade",      bg: '#f0fdf4', primary: '#bbf7d0', accent: '#059669', text: '#064e3b', glow: 'rgba(5, 150, 105, 0.08)', mode: 'lite' },
    { name: "Jade Mist",         bg: '#f0fdfa', primary: '#b2f5ea', accent: '#0d9488', text: '#115e59', glow: 'rgba(13, 148, 136, 0.08)', mode: 'lite' },
    { name: "Teal Whisper",      bg: '#f0fdfa', primary: '#ccfbf1', accent: '#2dd4bf', text: '#0f766e', glow: 'rgba(45, 212, 191, 0.10)', mode: 'lite' },

    // ─── PURPLE & PINK FAMILY ───
    { name: "Lavender Dream",    bg: '#faf5ff', primary: '#f3e8ff', accent: '#a855f7', text: '#581c87', glow: 'rgba(168, 85, 247, 0.08)', mode: 'lite' },
    { name: "Violet Haze",       bg: '#f5f3ff', primary: '#ede9fe', accent: '#7c3aed', text: '#4c1d95', glow: 'rgba(124, 58, 237, 0.08)', mode: 'lite' },
    { name: "Rose Petal",        bg: '#fdf2f8', primary: '#fce7f3', accent: '#ec4899', text: '#9d174d', glow: 'rgba(236, 72, 153, 0.08)', mode: 'lite' },
    { name: "Blush Pink",        bg: '#fff1f2', primary: '#ffe4e6', accent: '#f43f5e', text: '#9f1239', glow: 'rgba(244, 63, 94, 0.08)', mode: 'lite' },
    { name: "Orchid Bloom",      bg: '#fdf4ff', primary: '#fae8ff', accent: '#c026d3', text: '#86198f', glow: 'rgba(192, 38, 211, 0.08)', mode: 'lite' },
    { name: "Lilac Frost",       bg: '#faf5ff', primary: '#f3e8ff', accent: '#9333ea', text: '#6b21a8', glow: 'rgba(147, 51, 234, 0.08)', mode: 'lite' },
    { name: "Cotton Candy",      bg: '#fdf2f8', primary: '#fce7f3', accent: '#f472b6', text: '#831843', glow: 'rgba(244, 114, 182, 0.08)', mode: 'lite' },
    { name: "Fuchsia Glow",      bg: '#fdf4ff', primary: '#fae8ff', accent: '#d946ef', text: '#701a75', glow: 'rgba(217, 70, 239, 0.10)', mode: 'lite' },

    // ─── WARM FAMILY (Gold, Orange, Red) ───
    { name: "Golden Hour",       bg: '#fffbeb', primary: '#fef3c7', accent: '#f59e0b', text: '#78350f', glow: 'rgba(245, 158, 11, 0.10)', mode: 'lite' },
    { name: "Honey Glow",        bg: '#fefce8', primary: '#fef9c3', accent: '#eab308', text: '#713f12', glow: 'rgba(234, 179, 8, 0.08)', mode: 'lite' },
    { name: "Peach Sorbet",      bg: '#fff7ed', primary: '#ffedd5', accent: '#f97316', text: '#9a3412', glow: 'rgba(249, 115, 22, 0.08)', mode: 'lite' },
    { name: "Tangerine Light",   bg: '#fff7ed', primary: '#fed7aa', accent: '#ea580c', text: '#7c2d12', glow: 'rgba(234, 88, 12, 0.08)', mode: 'lite' },
    { name: "Sunset Glow",       bg: '#fff7ed', primary: '#ffedd5', accent: '#fb923c', text: '#9a3412', glow: 'rgba(251, 146, 60, 0.10)', mode: 'lite' },
    { name: "Coral Soft",        bg: '#fff1f2', primary: '#ffe4e6', accent: '#fb7185', text: '#9f1239', glow: 'rgba(251, 113, 133, 0.08)', mode: 'lite' },
    { name: "Ruby Cream",        bg: '#fef2f2', primary: '#fecaca', accent: '#ef4444', text: '#991b1b', glow: 'rgba(239, 68, 68, 0.08)', mode: 'lite' },
    { name: "Amber Warm",        bg: '#fffbeb', primary: '#fde68a', accent: '#d97706', text: '#92400e', glow: 'rgba(217, 119, 6, 0.10)', mode: 'lite' },

    // ─── NEUTRAL & EARTHY ───
    { name: "Stone Gray",        bg: '#f9fafb', primary: '#f3f4f6', accent: '#6b7280', text: '#1f2937', glow: 'rgba(107, 114, 128, 0.08)', mode: 'lite' },
    { name: "Warm Sand",         bg: '#fefdf8', primary: '#fef9c3', accent: '#a16207', text: '#713f12', glow: 'rgba(161, 98, 7, 0.08)', mode: 'lite' },
    { name: "Linen White",       bg: '#faf8f5', primary: '#f5f0e6', accent: '#92400e', text: '#451a03', glow: 'rgba(146, 64, 14, 0.08)', mode: 'lite' },
    { name: "Driftwood",         bg: '#fafaf9', primary: '#f5f5f4', accent: '#78716c', text: '#1c1917', glow: 'rgba(120, 113, 108, 0.08)', mode: 'lite' },
    { name: "Porcelain",         bg: '#fafafa', primary: '#f5f5f5', accent: '#737373', text: '#171717', glow: 'rgba(115, 115, 115, 0.08)', mode: 'lite' },
    { name: "Slate Breeze",      bg: '#f8fafc', primary: '#f1f5f9', accent: '#475569', text: '#0f172a', glow: 'rgba(71, 85, 105, 0.08)', mode: 'lite' },
    { name: "Zinc Clean",        bg: '#fafafa', primary: '#f4f4f5', accent: '#52525b', text: '#18181b', glow: 'rgba(82, 82, 91, 0.08)', mode: 'lite' },
    { name: "Concrete Soft",     bg: '#f9fafb', primary: '#e5e7eb', accent: '#4b5563', text: '#111827', glow: 'rgba(75, 85, 99, 0.08)', mode: 'lite' },

    // ─── PASTEL SPECIALS ───
    { name: "Pastel Rainbow",    bg: '#fef2f2', primary: '#fce7f3', accent: '#f472b6', text: '#831843', glow: 'rgba(244, 114, 182, 0.10)', mode: 'lite' },
    { name: "Butter Yellow",     bg: '#fefce8', primary: '#fef08a', accent: '#ca8a04', text: '#854d0e', glow: 'rgba(202, 138, 4, 0.08)', mode: 'lite' },
    { name: "Ice Blue",          bg: '#ecfeff', primary: '#a5f3fc', accent: '#06b6d4', text: '#155e75', glow: 'rgba(6, 182, 212, 0.08)', mode: 'lite' },
    { name: "Sakura",            bg: '#fdf2f8', primary: '#fbcfe8', accent: '#db2777', text: '#9d174d', glow: 'rgba(219, 39, 119, 0.08)', mode: 'lite' },
    { name: "Pistachio",         bg: '#ecfdf5', primary: '#a7f3d0', accent: '#059669', text: '#065f46', glow: 'rgba(5, 150, 105, 0.10)', mode: 'lite' },
    { name: "Wisteria",          bg: '#f5f3ff', primary: '#ddd6fe', accent: '#8b5cf6', text: '#5b21b6', glow: 'rgba(139, 92, 246, 0.08)', mode: 'lite' },
    { name: "Apricot Cream",     bg: '#fff7ed', primary: '#fed7aa', accent: '#c2410c', text: '#7c2d12', glow: 'rgba(194, 65, 12, 0.08)', mode: 'lite' },
    { name: "Sea Foam",          bg: '#f0fdfa', primary: '#99f6e4', accent: '#14b8a6', text: '#0f766e', glow: 'rgba(20, 184, 166, 0.10)', mode: 'lite' },

    // ─── PREMIUM LITE SPECIALS ───
    { name: "Royal Ivory",       bg: '#fffbf0', primary: '#fef3c7', accent: '#b45309', text: '#78350f', glow: 'rgba(180, 83, 9, 0.10)', mode: 'lite' },
    { name: "Diamond White",     bg: '#ffffff', primary: '#f1f5f9', accent: '#0ea5e9', text: '#0c4a6e', glow: 'rgba(14, 165, 233, 0.10)', mode: 'lite' },
    { name: "Morning Dew",       bg: '#f0fdf4', primary: '#d1fae5', accent: '#34d399', text: '#064e3b', glow: 'rgba(52, 211, 153, 0.10)', mode: 'lite' },
    { name: "Silver Lining",     bg: '#f8fafc', primary: '#e2e8f0', accent: '#94a3b8', text: '#334155', glow: 'rgba(148, 163, 184, 0.10)', mode: 'lite' },
    { name: "Champagne",         bg: '#fefdf5', primary: '#fef3c7', accent: '#ca8a04', text: '#854d0e', glow: 'rgba(202, 138, 4, 0.10)', mode: 'lite' },
    { name: "Frosted Glass",     bg: '#f8fafc', primary: '#e2e8f0', accent: '#3b82f6', text: '#1e3a8a', glow: 'rgba(59, 130, 246, 0.10)', mode: 'lite' },
    { name: "Twilight Rose",     bg: '#fff1f2', primary: '#fecdd3', accent: '#e11d48', text: '#881337', glow: 'rgba(225, 29, 72, 0.08)', mode: 'lite' },
    { name: "Golden Sand",       bg: '#fffbeb', primary: '#fde68a', accent: '#f59e0b', text: '#92400e', glow: 'rgba(245, 158, 11, 0.12)', mode: 'lite' },
];
