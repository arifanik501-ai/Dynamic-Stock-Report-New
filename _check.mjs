/**
 * Throw-away validator: runs `node --check` on every JS file + every inline
 * <script> block in index.html, and asserts the perf edits are in place.
 * Writes a report to _report.txt (terminal output capture is broken here).
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const dir = process.cwd();
const out = [];
const ok = (m) => out.push('OK   ' + m);
const bad = (m) => out.push('FAIL ' + m);

function syntaxCheck(label, code, asModule) {
    const tmp = join(dir, `_tmp_${Math.random().toString(36).slice(2)}.${asModule ? 'mjs' : 'js'}`);
    writeFileSync(tmp, code, 'utf8');
    try {
        execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
        ok(`${label} — syntax clean (${code.split('\n').length} lines, ${asModule ? 'esm' : 'cjs'})`);
    } catch (e) {
        const msg = (e.stderr ? e.stderr.toString() : String(e)).split('\n').slice(0, 6).join(' / ');
        bad(`${label} — ${msg}`);
    } finally {
        try { unlinkSync(tmp); } catch { /* ignore */ }
    }
}

out.push('=== node ' + process.version + ' ===');

// 1) External JS files
for (const f of ['script.js', 'themes.js', 'sw.js']) {
    if (!existsSync(join(dir, f))) { bad(`${f} — missing`); continue; }
    syntaxCheck(f, readFileSync(join(dir, f), 'utf8'), f === 'sw.js');
}

// 2) Inline <script> blocks in index.html
const html = readFileSync(join(dir, 'index.html'), 'utf8');
const blocks = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)];
blocks.forEach((m, i) => {
    const attrs = m[1] || '';
    const body = m[2] || '';
    const n = i + 1;
    if (/\bsrc\s*=/.test(attrs)) { ok(`index.html <script#${n}> — external (${(attrs.match(/src\s*=\s*["']([^"']+)/) || [])[1] || '?'})`); return; }
    if (!body.trim()) { ok(`index.html <script#${n}> — empty`); return; }
    const isModule = /type\s*=\s*["']module["']/.test(attrs) || /^\s*import\s/m.test(body);
    syntaxCheck(`index.html <script#${n}>`, body, isModule);
});

// 3) Assert the performance edits from this session are really present
const css = readFileSync(join(dir, 'app.css'), 'utf8');
const sw = readFileSync(join(dir, 'sw.js'), 'utf8');
const inAny = (re, label) => (re.test(css) || re.test(html) || re.test(sw) ? ok(label) : bad(label));

inAny(/\.bg-canvas\s*,\s*\.bg-grid\s*\{[^}]*will-change:\s*transform/, 'app.css — .bg-canvas/.bg-grid promoted to own layer');
inAny(/\.bg-canvas\s*,\s*\.bg-orb\s*\{[^}]*transition:\s*opacity/, 'app.css — bg transition limited to opacity');
inAny(/\.controls-panel\s*,\s*\.rnd-controls\s*\{\s*backdrop-filter:\s*none\s*!important/, 'app.css — FAB panels drop live backdrop blur');
inAny(/requestAnimationFrame\(\(\)\s*=>\s*requestAnimationFrame\(/, 'index.html — theme grid built on double rAF');
inAny(/CACHE_NAME\s*=\s*'mep-ledger-v17'/, 'sw.js — cache bumped to v17');
inAny(/animation-iteration-count:\s*1\s*!important/, 'app.css — global animation budget (single pass, no loops)');
inAny(/transition-duration:\s*0\.12s\s*!important/, 'app.css — global transition clamp 120ms');
inAny(/if\s*\(!overlay\.classList\.contains\('active'\)\)\s*return;/, 'index.html — deferred theme build aborts if closed');

const braces = (css.match(/\{/g) || []).length + '/' + (css.match(/\}/g) || []).length;
out.push(`INFO app.css braces ${braces}; lines ${css.split('\n').length}`);
out.push(`INFO index.html script tags ${(html.match(/<script/gi) || []).length}/${(html.match(/<\/script>/gi) || []).length}`);
out.push(`INFO .bg-orb elements in index.html: ${(html.match(/class="[^"]*\bbg-orb\b/g) || []).length}`);

// cleanup the stray probe file from the outer folder
try { unlinkSync(join(dir, '..', 'ncheck.txt')); out.push('INFO cleaned ../ncheck.txt'); } catch { /* ignore */ }

writeFileSync(join(dir, '_report.txt'), out.join('\n'), 'utf8');
