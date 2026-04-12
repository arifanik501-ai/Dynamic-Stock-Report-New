const fs = require('fs');
const rootPath = 'd:/C_DRIVE_NEVER_EVER_DELETE/New folder (2)/Stock Report';
const indexPath = rootPath + '/index (1).html';
const cssPath = rootPath + '/styles.css';
const jsPath = rootPath + '/app.js';

const content = fs.readFileSync(indexPath, 'utf8');
const lines = content.split('\n');

const styleStart = lines.findIndex(l => l.includes('<style>'));
const styleEnd = lines.findIndex(l => l.includes('</style>'));
const scriptStart = lines.findIndex(l => l.includes('<script>'));
const scriptEnd = lines.findLastIndex(l => l.includes('</script>'));

// 1. EXTRACT STYLES
let cssLines = lines.slice(styleStart + 1, styleEnd);

// Add will-change for performance
cssLines.push('');
cssLines.push('/* Performance Optimizations */');
cssLines.push('.archive-table tr, #inventory-body tr {');
cssLines.push('    will-change: transform, opacity;');
cssLines.push('}');
fs.writeFileSync(cssPath, cssLines.join('\n'));

// 2. EXTRACT JS
const scriptsSection = lines.slice(scriptStart + 1, scriptEnd).join('\n');
let cleanJs = scriptsSection
    .replace(/<script type="module">/g, '')
    .replace(/<\/script>\s*<!-- Firebase Realtime Sync Module -->\s*<script type="module">/g, '\n\n// --- Firebase Sync Module ---\n\n')
    .replace(/<\/script>/g, '');

// Apply animation cap performance hotfixes
cleanJs = cleanJs.replace(
    /row\.style\.animationDelay = `\$\{index \* 0\.04\}s`;/,
    'row.style.animationDelay = `${Math.min(index, 10) * 0.04}s`;'
);

cleanJs = cleanJs.replace(
    /0\.4s cubic-bezier\(0\.16, 1, 0\.3, 1\) \$\{idx \* 0\.05\}s backwards;"/,
    '0.4s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(idx, 10) * 0.05}s backwards;"'
);

// Add global window exposures
const globals = [
    'switchPage', 'saveCurrentReport', 'renderArchivePage', 'deleteArchive',
    'loadToGenerator', 'applyTheme', 'randomizeTheme', 'toggleLiteMode',
    'refreshData', 'toggleModal', 'processPastedData', 'takeScreenshot',
    'updateBadges', 'moveSlider' // Needed globally sometimes inside app.js or html
];
cleanJs += '\n// Expose UI functions globally for module execution\n';
globals.forEach(fn => {
    cleanJs += `window.${fn} = ${fn};\n`;
});

fs.writeFileSync(jsPath, cleanJs);

// 3. REWRITE HTML
const newHtmlLines = [
    ...lines.slice(0, styleStart),
    '    <link rel="stylesheet" href="styles.css">',
    ...lines.slice(styleEnd + 1, scriptStart),
    '    <script type="module" src="app.js"></script>',
    ...lines.slice(scriptEnd + 1)
];

fs.writeFileSync(indexPath, newHtmlLines.join('\n'));
console.log('Split and optimization complete.');
