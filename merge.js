const fs = require('fs');
const rootPath = 'd:/C_DRIVE_NEVER_EVER_DELETE/New folder (2)/Stock Report';
const indexPath = rootPath + '/index (1).html';
const cssPath = rootPath + '/styles.css';
const jsPath = rootPath + '/app.js';

let html = fs.readFileSync(indexPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>');
html = html.replace('<script type="module" src="app.js"></script>', '<script type="module">\n' + js + '\n</script>');

fs.writeFileSync(indexPath, html);
console.log('Successfully re-embedded everything directly to bypass CORS!');
