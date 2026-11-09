// =====================================================================
// MEP FAN LTD — Assembly Rejection Module
// Mirrors the "MEP_Fan_Assembly_Defect_Analysis" workbook:
//   Rejection Entry   → Entry page (date • model • production • 16 defects • disassembled • remarks)
//   Daily Dashboard   → Daily page   (Total Defect, Rate, Disassembled, Recovery)
//   Monthly Filter    → Monthly page (category qty / % / Pareto, model split)
//   Monthly Summary   → Yearly page  (Jan–Dec matrix, MoM, trend, top defect)
//   Rejection Report  → Records page (filter + CSV)
// Data: history from rejection-seed.json (exported from the workbook) merged with
// Firebase  rejection_module/entries/<id>  (new / edited / deleted rows win).
// =====================================================================

const FB_VERSION = '12.12.0';
const FB_PATH = 'rejection_module/entries';
const firebaseConfig = {
    apiKey: 'AIzaSyBcjbR7Qu7M-RnHUtLJ9zeehILqQHYLw4E',
    authDomain: 'whatsapp-c10ef.firebaseapp.com',
    databaseURL: 'https://whatsapp-c10ef-default-rtdb.firebaseio.com',
    projectId: 'whatsapp-c10ef',
    storageBucket: 'whatsapp-c10ef.firebasestorage.app',
    messagingSenderId: '675053106773',
    appId: '1:675053106773:web:b7078468691a07ecfec6dc'
};

const DEFECTS = [
    ['humming', 'Humming Noise'], ['bearing', 'Bearing Sound'], ['taptal', 'Tap & Tal'], ['fitting', 'Fitting'],
    ['rotor', 'Rotor Touch'], ['jam', 'Jam'], ['xlcrack', 'XL Crack'], ['wireleak', 'Wire Leak'],
    ['lockwatt', 'Lock Watt'], ['painting', 'Painting'], ['border', 'Border'], ['highwatt', 'High Watt'],
    ['shaft', 'Shaft Loose'], ['notrunning', 'Not Running'], ['crack', 'Crack Body / Cover'], ['conveyor', 'Conveyor Scratch']
];
const DKEYS = DEFECTS.map(d => d[0]);
const DLABEL = Object.fromEntries(DEFECTS);
const MODELS = ['5601', '5602', '5603', '5606', '5607', '4801', '3601', '2401'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PALETTE = ['#e11d48', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#94a3b8'];

// ---------------- helpers ----------------
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const dateOf = k => { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
const todayKey = () => keyOf(new Date());
const fmt = n => (Math.round((+n || 0) * 100) / 100).toLocaleString('en-US');
const pct = (a, b, dp = 2) => b > 0 ? (a / b * 100).toFixed(dp) + '%' : '0.00%';
const pnum = (a, b) => b > 0 ? a / b * 100 : 0;
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const longDate = k => dateOf(k).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
const shortDate = k => dateOf(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const defTotal = e => DKEYS.reduce((s, k) => s + (+e.d?.[k] || 0), 0);
const toast = msg => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); };
const ICON = {
    box: '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8"/></svg>',
    alert: '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/></svg>',
    tool: '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4 2.5-2.5z"/></svg>',
    shield: '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4"/></svg>',
    target: '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
    cal: '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
    bulb: '<svg fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg>',
    edit: '<svg fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
    del: '<svg fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6M14 11v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg>'
};

// ---------------- state ----------------
const S = {
    seed: [], remote: {}, entries: [], byId: new Map(), byDate: new Map(), dates: [],
    page: 'daily', dirty: new Set(['daily', 'entry', 'monthly', 'yearly', 'records']),
    cloud: 'connecting', db: null, fb: null, editingId: null,
    daily: { date: null }, monthly: { y: null, m: null, model: '' }, yearly: { y: null, view: 'qty' }
};

// ---------------- data merge + index ----------------
function rebuild() {
    const map = new Map();
    const seen = {};
    S.seed.forEach(r => {
        const base = r.date + '_' + r.model;
        seen[base] = (seen[base] || 0) + 1;
        const id = seen[base] > 1 ? base + '_' + seen[base] : base;
        map.set(id, Object.assign({ id, src: 'excel' }, r));
    });
    Object.entries(S.remote || {}).forEach(([id, r]) => {
        if (!r || typeof r !== 'object') return;
        if (r.deleted) map.delete(id);
        else if (r.date && r.model != null) map.set(id, Object.assign({ id, src: 'cloud' }, r));
    });
    S.byId = map;
    S.entries = [...map.values()].sort((a, b) => a.date === b.date ? String(a.model).localeCompare(String(b.model)) : a.date.localeCompare(b.date));
    S.byDate = new Map();
    S.entries.forEach(e => { if (!S.byDate.has(e.date)) S.byDate.set(e.date, []); S.byDate.get(e.date).push(e); });
    S.dates = [...S.byDate.keys()];
    _aggCache.clear();
    ['daily', 'entry', 'monthly', 'yearly', 'records'].forEach(p => S.dirty.add(p));
    $('sb-count').textContent = S.entries.length;
    $('sb-latest').textContent = S.dates.length ? shortDate(S.dates[S.dates.length - 1]) : '—';
}

const _aggCache = new Map();
function agg(list) {
    const a = { prod: 0, def: 0, dis: 0, d: Object.fromEntries(DKEYS.map(k => [k, 0])), n: list.length, days: new Set(), models: {} };
    list.forEach(e => {
        const t = defTotal(e);
        a.prod += +e.prod || 0; a.def += t; a.dis += +e.dis || 0; a.days.add(e.date);
        DKEYS.forEach(k => { a.d[k] += +e.d?.[k] || 0; });
        const m = a.models[e.model] || (a.models[e.model] = { prod: 0, def: 0, dis: 0, n: 0 });
        m.prod += +e.prod || 0; m.def += t; m.dis += +e.dis || 0; m.n++;
    });
    a.rec = a.def > 0 ? (a.def - a.dis) / a.def * 100 : 0;
    a.sorted = DKEYS.map(k => [k, a.d[k]]).sort((x, y) => y[1] - x[1]);
    a.top = a.sorted[0] && a.sorted[0][1] > 0 ? a.sorted[0] : null;
    return a;
}
function aggMonth(y, m, model = '') {
    const key = y + '-' + pad(m + 1) + '|' + model;
    if (_aggCache.has(key)) return _aggCache.get(key);
    const pre = y + '-' + pad(m + 1);
    const r = agg(S.entries.filter(e => e.date.startsWith(pre) && (!model || e.model === model)));
    _aggCache.set(key, r);
    return r;
}
const aggDay = k => agg(S.byDate.get(k) || []);

// ---------------- Chart.js (local copy first, CDN fallback) ----------------
let _chartP = null;
function loadChart() {
    if (window.Chart) return Promise.resolve(window.Chart);
    if (_chartP) return _chartP;
    const tryLoad = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = () => window.Chart ? res(window.Chart) : rej(); s.onerror = rej; document.head.appendChild(s); });
    _chartP = tryLoad('../js/chart.min.js').catch(() => tryLoad('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js')).then(C => {
        C.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
        C.defaults.font.size = 11; C.defaults.color = '#64748b';
        C.defaults.plugins.legend.labels.usePointStyle = true; C.defaults.plugins.legend.labels.boxWidth = 8;
        C.defaults.plugins.tooltip.backgroundColor = 'rgba(15,23,42,.92)'; C.defaults.plugins.tooltip.padding = 10; C.defaults.plugins.tooltip.cornerRadius = 10;
        C.defaults.maintainAspectRatio = false; C.defaults.animation.duration = 450;
        C.defaults.plugins.legend.labels.padding = 18; C.defaults.plugins.legend.labels.color = '#475569';
        C.defaults.plugins.legend.labels.font = { size: 11, weight: 600 };
        C.defaults.plugins.legend.labels.pointStyle = 'circle';
        C.defaults.plugins.tooltip.titleFont = { size: 12, weight: 800 }; C.defaults.plugins.tooltip.bodyFont = { size: 11.5, weight: 600 };
        C.defaults.plugins.tooltip.footerFont = { size: 10.5, weight: 700 }; C.defaults.plugins.tooltip.boxPadding = 5; C.defaults.plugins.tooltip.usePointStyle = true;
        C.register(rjPlugin);
        return C;
    });
    return _chartP;
}
// Tiny in-house plugin (no extra download):
//   options.plugins.rj.lines  = [{ axis, value, label, color }]  → dashed reference line + pill label
//   options.plugins.rj.labels = [{ ds, fmt, color, offset, skipZero, inside }] → value labels on points/bars
function _pill(ctx, x, y, text, bg, align = 'center') {
    ctx.save();
    ctx.font = "800 9.5px 'Plus Jakarta Sans', system-ui, sans-serif";
    const w = ctx.measureText(text).width + 12, h = 18, r = 9;
    const startX = align === 'right' ? x - w : (align === 'center' ? x - w / 2 : x);
    ctx.fillStyle = bg;
    ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(startX, y - h / 2, w, h, r);
    else ctx.rect(startX, y - h / 2, w, h);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, startX + w / 2, y + 0.5);
    ctx.restore();
}
const rjPlugin = {
    id: 'rj',
    afterDraw(chart, _a, opts) {
        const ax = opts.axes; if (!ax || !chart.chartArea) return;
        const { ctx, chartArea: a } = chart;
        ctx.save();
        ctx.font = "800 9px 'Plus Jakarta Sans', sans-serif"; ctx.textBaseline = 'bottom';
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0.8px';
        const y = a.top - 6;
        if (ax.left && chart.scales.y) { ctx.fillStyle = ax.leftColor || '#64748b'; ctx.textAlign = 'left'; ctx.fillText(ax.left.toUpperCase(), chart.scales.y.left, y); }
        const r = chart.scales.y1;
        if (ax.right && r) { ctx.fillStyle = ax.rightColor || '#64748b'; ctx.textAlign = 'right'; ctx.fillText(ax.right.toUpperCase(), r.right, y); }
        ctx.restore();
    },
    afterDatasetsDraw(chart, _a, opts) {
        const { ctx, chartArea: a } = chart;
        if (!a) return;
        (opts.lines || []).forEach(l => {
            const sc = chart.scales[l.axis]; if (!sc || l.value == null || !isFinite(l.value)) return;
            const y = sc.getPixelForValue(l.value);
            if (y < a.top - 1 || y > a.bottom + 1) return;
            ctx.save();
            ctx.setLineDash(l.dash || [6, 5]); ctx.lineWidth = 1.4; ctx.strokeStyle = l.color;
            ctx.beginPath(); ctx.moveTo(a.left, y); ctx.lineTo(a.right, y); ctx.stroke();
            ctx.setLineDash([]);
            _pill(ctx, a.right - 2, y, l.label, l.color, 'right');
            ctx.restore();
        });
        (opts.keyLabels || []).forEach(kl => {
            const meta = chart.getDatasetMeta(0);
            if (!meta || !meta.data || !meta.data[kl.idx]) return;
            const pt = meta.data[kl.idx];
            if (pt) _pill(ctx, pt.x, pt.y - 12, kl.text, kl.color, 'center');
        });
        (opts.labels || []).forEach(L => {
            const meta = chart.getDatasetMeta(L.ds);
            if (!meta || meta.hidden) return;
            ctx.save();
            ctx.font = "800 10px 'Manrope', 'Plus Jakarta Sans', sans-serif";
            ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
            meta.data.forEach((el, i) => {
                const v = chart.data.datasets[L.ds].data[i];
                if (v == null || (L.skipZero && !v)) return;
                const txt = L.fmt ? L.fmt(v, i) : String(v);
                const y = el.y - (L.offset == null ? 6 : L.offset);
                ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.strokeText(txt, el.x, y);
                ctx.fillStyle = typeof L.color === 'function' ? L.color(v, i) : (L.color || '#0f172a');
                ctx.fillText(txt, el.x, y);
            });
            ctx.restore();
        });
    }
};
// Premium scale presets: flat labels, no axis border, soft dashed grid
const wrapLabel = s => { s = String(s); const w = s.split(/\s+/); if (s.length <= 10 || w.length < 2) return s; const m = Math.ceil(w.length / 2); return [w.slice(0, m).join(' '), w.slice(m).join(' ')]; };
const xScale = (extra = {}) => ({
    grid: { display: false }, border: { display: false },
    ticks: { color: '#475569', font: { size: 10.5, weight: 600 }, maxRotation: 0, minRotation: 0, autoSkip: true, autoSkipPadding: 10, padding: 6 },
    ...extra
});
const yScale = (extra = {}, ticks = {}) => ({
    grid: { color: 'rgba(148,163,184,.20)', drawTicks: false }, border: { display: false, dash: [4, 4] },
    ticks: { color: '#94a3b8', font: { size: 10, weight: 600 }, padding: 8, maxTicksLimit: 6, ...ticks },
    ...extra
});
const charts = {};
async function chart(id, cfg) {
    const C = await loadChart().catch(() => null);
    const el = $(id); if (!C || !el) return;
    if (charts[id]) { charts[id].config.type = cfg.type; charts[id].data = cfg.data; charts[id].options = cfg.options || {}; charts[id].update(); return; }
    charts[id] = new C(el, cfg);
}
const gridC = 'rgba(148,163,184,.16)';

// Shared "production vs rate" chart (Daily 14-day + Monthly daily trend).
// Bars = production (left axis). Lines = defect % and disassembled % of that day's production
// (right axis), drawn monotone so a line never bulges above/below the real points.
function rateTrend(id, keys, aggs, avgRate, avgLabel, highlight) {
    const def = aggs.map(v => v.prod ? +pnum(v.def, v.prod).toFixed(2) : null);
    const dis = aggs.map(v => v.prod ? +pnum(v.dis, v.prod).toFixed(2) : null);
    const maxR = Math.max(1, ...def.filter(x => x != null), ...dis.filter(x => x != null), avgRate || 0);

    // Update header avg badge if present
    if (id === 'c-d-trend') {
        const badge = $('d-trend-avg');
        if (badge) badge.textContent = avgRate ? `14D Avg: ${avgRate.toFixed(2)}%` : '—';
    } else if (id === 'c-m-daily') {
        const badge = $('m-trend-avg');
        if (badge) badge.textContent = avgRate ? `Month Avg: ${avgRate.toFixed(2)}%` : '—';
    }

    // Smart keypoints: only highlight Peak and Selected day to prevent visual clutter
    let maxIdx = -1, maxVal = -1;
    def.forEach((v, i) => {
        if (v != null && v > maxVal) { maxVal = v; maxIdx = i; }
    });
    const hlIdx = highlight ? keys.indexOf(highlight) : -1;
    const keyLabels = [];
    if (maxIdx > -1 && maxVal > 0) {
        keyLabels.push({ idx: maxIdx, text: `Peak ${maxVal.toFixed(1)}%`, color: '#be123c' });
    }
    if (hlIdx > -1 && hlIdx !== maxIdx && def[hlIdx] != null) {
        keyLabels.push({ idx: hlIdx, text: `${def[hlIdx].toFixed(1)}%`, color: '#e11d48' });
    }

    chart(id, {
        type: 'bar',
        data: {
            labels: keys.map(k => shortDate(k)),
            datasets: [
                {
                    type: 'line',
                    label: 'Defect %',
                    data: def,
                    borderColor: '#e11d48',
                    borderWidth: 2.6,
                    tension: 0.35,
                    cubicInterpolationMode: 'monotone',
                    spanGaps: true,
                    fill: true,
                    backgroundColor: (ctx) => {
                        const chart = ctx.chart;
                        const { ctx: c, chartArea: a } = chart;
                        if (!a) return 'rgba(225, 29, 72, 0.08)';
                        const g = c.createLinearGradient(0, a.top, 0, a.bottom);
                        g.addColorStop(0, 'rgba(225, 29, 72, 0.22)');
                        g.addColorStop(0.65, 'rgba(225, 29, 72, 0.04)');
                        g.addColorStop(1, 'rgba(225, 29, 72, 0.00)');
                        return g;
                    },
                    pointRadius: keys.map(k => k === highlight ? 6 : 3.5),
                    pointHoverRadius: 7,
                    pointBackgroundColor: keys.map(k => k === highlight ? '#e11d48' : '#ffffff'),
                    pointBorderColor: '#e11d48',
                    pointBorderWidth: 2,
                    yAxisID: 'y1',
                    order: 1
                },
                {
                    type: 'line',
                    label: 'Disassembled %',
                    data: dis,
                    borderColor: '#f59e0b',
                    borderWidth: 1.8,
                    borderDash: [5, 4],
                    tension: 0.35,
                    cubicInterpolationMode: 'monotone',
                    spanGaps: true,
                    fill: false,
                    pointRadius: 0,
                    pointHoverRadius: 4.5,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    yAxisID: 'y1',
                    order: 2
                },
                {
                    type: 'bar',
                    label: 'Production',
                    data: aggs.map(v => v.prod),
                    backgroundColor: (ctx) => {
                        const k = keys[ctx.dataIndex];
                        return k === highlight ? 'rgba(99, 102, 241, 0.45)' : 'rgba(148, 163, 184, 0.22)';
                    },
                    hoverBackgroundColor: 'rgba(99, 102, 241, 0.58)',
                    borderRadius: { topLeft: 7, topRight: 7 },
                    borderSkipped: false,
                    maxBarThickness: 34,
                    yAxisID: 'y',
                    order: 3
                }
            ]
        },
        options: {
            interaction: { mode: 'index', intersect: false },
            layout: { padding: { top: 18, bottom: 4, left: 2, right: 6 } },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.94)',
                    padding: { top: 9, bottom: 9, left: 12, right: 12 },
                    cornerRadius: 11,
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    borderWidth: 1,
                    boxPadding: 6,
                    usePointStyle: true,
                    callbacks: {
                        title: it => longDate(keys[it[0].dataIndex]),
                        label: c => {
                            const v = aggs[c.dataIndex];
                            if (c.dataset.label === 'Production') return ` Production: ${fmt(v.prod)} fans`;
                            if (c.dataset.label === 'Defect %') return ` Defect Rate: ${c.raw}% (${fmt(v.def)} pcs)`;
                            return ` Disassembled: ${c.raw}% (${fmt(v.dis)} pcs)`;
                        }
                    }
                },
                rj: {
                    axes: { left: 'Production (pcs)', right: 'Rate (%)', leftColor: '#6366f1', rightColor: '#e11d48' },
                    lines: avgRate ? [{ axis: 'y1', value: +avgRate.toFixed(2), label: `${avgLabel} ${avgRate.toFixed(2)}%`, color: 'rgba(225, 29, 72, 0.85)', dash: [5, 4] }] : [],
                    keyLabels: keyLabels
                }
            },
            scales: {
                x: xScale(),
                y: yScale({ beginAtZero: true }, { callback: v => v >= 1000 ? (v / 1000) + 'k' : v }),
                y1: yScale({ position: 'right', min: 0, suggestedMax: Math.ceil(maxR * 1.25), grid: { display: false } }, { callback: v => v + '%' })
            }
        }
    });
}

// ---------------- page switching ----------------
const TITLES = { daily: 'Daily Dashboard', entry: 'Rejection Entry', monthly: 'Monthly Analysis', yearly: 'Yearly Summary', records: 'Records' };
function show(page) {
    S.page = page;
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
    document.querySelectorAll('.sb-item[data-page]').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    $('page-title').textContent = TITLES[page];
    try { localStorage.setItem('mep_rej_page', page); } catch (e) {}
    renderActive();
    window.scrollTo({ top: 0 });
}
function renderActive() {
    if (S.dirty.has(S.page)) {
        S.dirty.delete(S.page);
        ({ daily: renderDaily, entry: renderEntry, monthly: renderMonthly, yearly: renderYearly, records: renderRecords })[S.page]();
    }
    refreshAllDropdowns();   // renders set select .value directly (no 'change'), so redraw labels after
}

// ---------------- KPI tile ----------------
function kpi({ lbl, val, sub = '', ico = 'box', cls = '', ring = null }) {
    return `<div class="card kpi ${cls}"><div class="kpi-top"><span class="kpi-lbl">${lbl}</span>${ring !== null
        ? `<span class="ring" style="--p:${Math.min(100, Math.max(0, ring)).toFixed(1)}"><span>${ring.toFixed(0)}%</span></span>`
        : `<span class="kpi-ico">${ICON[ico]}</span>`}</div><div class="kpi-v">${val}</div><div class="kpi-s">${sub}</div></div>`;
}
function delta(cur, prev, unit = '%', invert = true) {
    if (prev == null || !isFinite(prev)) return '<span class="tag flat">—</span>';
    const d = cur - prev;
    if (Math.abs(d) < 0.005) return '<span class="tag flat">= 0.00' + unit + '</span>';
    const worse = invert ? d > 0 : d < 0;
    return `<span class="tag ${worse ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(2)}${unit}</span>`;
}

// ---------------- defect bars ----------------
function bars(a, base) {
    const rows = a.sorted.filter(x => x[1] > 0);
    if (!rows.length) return '<div class="empty">No defects recorded</div>';
    const max = rows[0][1];
    const zero = DKEYS.length - rows.length;
    return rows.map(([k, q], i) => `<div class="dbar${i === 0 ? ' top' : ''}"><span class="n" title="${DLABEL[k]}">${DLABEL[k]}</span><span class="t"><i style="width:${(q / max * 100).toFixed(1)}%"></i></span><span class="q">${fmt(q)}</span><span class="p">${pct(q, base)}</span></div>`).join('')
        + (zero ? `<div class="hint" style="margin-top:8px">${zero} categor${zero > 1 ? 'ies' : 'y'} at zero</div>` : '');
}

// =====================================================================
// DAILY DASHBOARD
// =====================================================================
function renderDaily() {
    if (!S.daily.date || !S.byDate.has(S.daily.date) && S.daily.date > (S.dates[S.dates.length - 1] || '')) S.daily.date = S.dates[S.dates.length - 1] || todayKey();
    const k = S.daily.date;
    $('d-date').value = k;
    const a = aggDay(k);
    const idx = S.dates.indexOf(k);
    const prevK = idx > 0 ? S.dates[idx - 1] : S.dates.filter(x => x < k).pop();
    const p = prevK ? aggDay(prevK) : null;
    const rate = pnum(a.def, a.prod), disR = pnum(a.dis, a.prod);
    $('d-sub').textContent = a.n ? '• ' + longDate(k) : '• ' + longDate(k) + ' — no entry';
    $('d-kpis').innerHTML = [
        kpi({ lbl: 'Total Production', val: fmt(a.prod), ico: 'box', cls: 'k-blue', sub: `${Object.keys(a.models).length} model${Object.keys(a.models).length === 1 ? '' : 's'} • 100% manufactured` }),
        kpi({ lbl: 'Total Defect', val: fmt(a.def), ico: 'alert', sub: `Rate <b class="num">${pct(a.def, a.prod)}</b> ${p ? delta(rate, pnum(p.def, p.prod)) : ''}` }),
        kpi({ lbl: 'Disassembled', val: fmt(a.dis), ico: 'tool', cls: 'k-amber', sub: `<b class="num">${pct(a.dis, a.prod)}</b> of production ${p ? delta(disR, pnum(p.dis, p.prod)) : ''}` }),
        kpi({ lbl: 'Recovery', val: a.def ? a.rec.toFixed(2) + '%' : '—', ring: a.def ? a.rec : 0, cls: 'k-green', sub: `${fmt(Math.max(0, a.def - a.dis))} defects recovered` }),
        kpi({ lbl: 'Top Defect', val: a.top ? esc(DLABEL[a.top[0]]) : '—', ico: 'target', cls: 'k-violet', sub: a.top ? `<b class="num">${fmt(a.top[1])}</b> pcs • ${pct(a.top[1], a.def, 1)} of defects` : 'nothing logged' })
    ].join('');
    const dTop = $('d-kpis').querySelectorAll('.kpi-v')[4]; if (dTop) { dTop.style.fontSize = '19px'; dTop.style.lineHeight = '1.15'; }
    $('d-bd-sub').textContent = a.n ? '% = of production' : '';
    $('d-bars').innerHTML = a.n ? bars(a, a.prod) : '<div class="empty">No entry for this date. Use <b>Entry</b> to add it.</div>';
    const ms = Object.entries(a.models).sort((x, y) => y[1].prod - x[1].prod);
    $('d-models').innerHTML = `<thead><tr><th class="l">Model</th><th>Prod</th><th>Defect</th><th>Rate</th><th>Disasm.</th></tr></thead><tbody>${ms.map(([m, v]) =>
        `<tr><td class="l"><b>${esc(m)}</b></td><td>${fmt(v.prod)}</td><td class="hot">${fmt(v.def)}</td><td>${pct(v.def, v.prod)}</td><td>${fmt(v.dis)}</td></tr>`).join('') || '<tr><td class="l" colspan="5" style="text-align:center;color:#94a3b8">—</td></tr>'}</tbody>`;
    // last 14 data days
    const end = S.dates.filter(x => x <= k).slice(-14);
    const endAgg = end.map(aggDay);
    const span = agg(end.flatMap(x => S.byDate.get(x) || []));
    rateTrend('c-d-trend', end, endAgg, pnum(span.def, span.prod), '14-day avg', k);
    // insight
    const mA = aggMonth(dateOf(k).getFullYear(), dateOf(k).getMonth());
    const mRate = pnum(mA.def, mA.prod);
    const parts = [];
    if (a.n) {
        parts.push(`Defect rate <b>${pct(a.def, a.prod)}</b> vs month average <b>${mRate.toFixed(2)}%</b> — ${rate > mRate ? 'worse than' : 'better than'} the month so far.`);
        if (a.top) parts.push(`<b>${DLABEL[a.top[0]]}</b> is the biggest cause today (${pct(a.top[1], a.def, 1)} of defects).`);
        if (a.def) parts.push(`Recovery <b>${a.rec.toFixed(1)}%</b>: ${fmt(a.def - a.dis)} of ${fmt(a.def)} defective fans were fixed without disassembly.`);
    } else parts.push('No production logged for this date.');
    $('d-insight').innerHTML = `<span class="ic">${ICON.bulb}</span><p>${parts.join(' ')}</p>`;
    // month to date (1st of the month → selected day)
    const mPre = k.slice(0, 7);
    const mtd = agg(S.entries.filter(e => e.date.startsWith(mPre) && e.date <= k));
    $('d-mtd-sub').textContent = MONTHS[+mPre.slice(5) - 1].slice(0, 3) + ' 1 – ' + shortDate(k);
    $('d-mtd').innerHTML = [
        ['Production', fmt(mtd.prod)],
        ['Working days', mtd.days.size + ' • avg ' + fmt(Math.round(mtd.prod / (mtd.days.size || 1)))],
        ['Defect', fmt(mtd.def) + ' • ' + pct(mtd.def, mtd.prod)],
        ['Disassembled', fmt(mtd.dis) + ' • ' + pct(mtd.dis, mtd.prod)],
        ['Recovery', mtd.def ? mtd.rec.toFixed(1) + '%' : '—'],
        ['Top defect', mtd.top ? DLABEL[mtd.top[0]] : '—']
    ].map(([l, v]) => `<div><small>${l}</small><b>${esc(v)}</b></div>`).join('');
}

// =====================================================================
// ENTRY
// =====================================================================
function buildEntryForm() {
    $('f-model').innerHTML = MODELS.map(m => `<option value="${m}">${m}</option>`).join('');
    $('def-grid').innerHTML = DEFECTS.map(([k, l]) => `<div class="def" data-k="${k}"><label title="${l}">${l}</label><input type="number" min="0" inputmode="numeric" data-k="${k}" placeholder="0"></div>`).join('');
    $('f-date').value = todayKey();
    const inputs = () => [$('f-date'), $('f-model'), $('f-prod'), ...document.querySelectorAll('#def-grid input'), $('f-dis'), $('f-rem')];
    $('entry-wrap').addEventListener('input', e => {
        if (e.target.matches('#def-grid input')) e.target.closest('.def').classList.toggle('has', +e.target.value > 0);
        liveSummary();
    });
    $('entry-wrap').addEventListener('keydown', e => {
        if (e.key !== 'Enter' || e.target.tagName === 'BUTTON') return;
        e.preventDefault();
        const list = inputs(), i = list.indexOf(e.target);
        if (i > -1 && i < list.length - 1) { list[i + 1].focus(); list[i + 1].select?.(); } else saveEntry();
    });
    $('f-date').addEventListener('change', () => { S.dirty.add('entry'); renderEntry(); });
    $('f-model').addEventListener('change', liveSummary);
    $('f-save').addEventListener('click', saveEntry);
    $('f-reset').addEventListener('click', () => resetForm(true));
    $('e-new').addEventListener('click', () => { resetForm(true); $('f-prod').focus(); });
    $('f-day').addEventListener('click', onRowAction);
    $('pend-card').addEventListener('click', e => { const b = e.target.closest('[data-date]'); if (b) gotoEntryDate(b.dataset.date); });
    const repRun = (btn, fn) => btn.addEventListener('click', async () => {
        btn.disabled = true;
        try { await fn(); } catch (err) { console.error('Report export failed:', err); toast('Report failed — see console'); }
        finally { btn.disabled = false; }
    });
    repRun($('rep-daily'), exportDailyReport);
    repRun($('rep-monthly'), exportMonthlyReport);
    document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && S.page === 'entry') { e.preventDefault(); saveEntry(); } });
}
function readForm() {
    const d = {};
    document.querySelectorAll('#def-grid input').forEach(i => { const v = Math.max(0, Math.round(+i.value || 0)); if (v) d[i.dataset.k] = v; });
    return { date: $('f-date').value, model: $('f-model').value, prod: Math.max(0, Math.round(+$('f-prod').value || 0)), d, dis: Math.max(0, Math.round(+$('f-dis').value || 0)), rem: $('f-rem').value.trim() };
}
function liveSummary() {
    const f = readForm(), t = defTotal(f);
    $('s-def').textContent = fmt(t);
    $('s-rate').textContent = pct(t, f.prod);
    $('s-dis').textContent = fmt(f.dis);
    $('s-rec').textContent = t ? ((t - f.dis) / t * 100).toFixed(2) + '%' : '—';
    $('f-sum-date').textContent = f.date ? shortDate(f.date) + ' • ' + f.model : '';
}
function fillForm(e) {
    $('f-date').value = e.date; $('f-model').value = MODELS.includes(String(e.model)) ? String(e.model) : MODELS[0];
    if (!MODELS.includes(String(e.model))) { const o = document.createElement('option'); o.value = o.textContent = e.model; $('f-model').appendChild(o); $('f-model').value = e.model; }
    $('f-prod').value = e.prod || '';
    if (typeof refreshAllDropdowns === 'function') refreshAllDropdowns();
    document.querySelectorAll('#def-grid input').forEach(i => { const v = +e.d?.[i.dataset.k] || 0; i.value = v || ''; i.closest('.def').classList.toggle('has', v > 0); });
    $('f-dis').value = e.dis || ''; $('f-rem').value = e.rem || '';
    liveSummary();
}
function resetForm(keepDate) {
    const date = keepDate ? $('f-date').value : todayKey();
    S.editingId = null; $('entry-wrap').classList.remove('editing'); document.querySelector('#page-entry .toolbar').classList.remove('editing');
    fillForm({ date, model: $('f-model').value || MODELS[0], prod: '', d: {}, dis: '', rem: '' });
    $('f-save').lastChild.textContent = 'Save entry';
}
function renderEntry() {
    const k = $('f-date').value || todayKey();
    const list = S.byDate.get(k) || [];
    $('f-day-count').textContent = list.length ? list.length + ' row' + (list.length > 1 ? 's' : '') : 'none yet';
    $('f-day').innerHTML = `<thead><tr><th class="l">Model</th><th>Prod</th><th>Defect</th><th>Rate</th><th>Disasm.</th><th></th></tr></thead><tbody>${list.map(e => {
        const t = defTotal(e);
        return `<tr><td class="l"><b>${esc(e.model)}</b>${e.src === 'cloud' ? '' : ' <span class="hint">excel</span>'}</td><td>${fmt(e.prod)}</td><td class="hot">${fmt(t)}</td><td>${pct(t, e.prod)}</td><td>${fmt(e.dis || 0)}</td><td><span class="act"><button type="button" data-act="edit" data-id="${esc(e.id)}" title="Edit">${ICON.edit}</button><button type="button" data-act="del" data-id="${esc(e.id)}" title="Delete">${ICON.del}</button></span></td></tr>`;
    }).join('') || '<tr><td class="l" colspan="6" style="text-align:center;color:#94a3b8;padding:18px">No entries on this date</td></tr>'}</tbody>`;
    liveSummary();
    renderPending();
    updateReportButtons();
}

// Running-month entry calendar. Holidays come from the SFG module's holiday list
// (Firebase inventory_reports/_settings/holidays, cached in localStorage mep_sfg_holidays).
function holidays() {
    if (S.hol) return S.hol;
    try { return JSON.parse(localStorage.getItem('mep_sfg_holidays') || '{}') || {}; } catch (e) { return {}; }
}
function renderPending() {
    const today = todayKey(), t = dateOf(today), sel = $('f-date').value;
    const y = t.getFullYear(), m = t.getMonth(), pre = today.slice(0, 7);
    const hol = holidays();
    const days = [];
    for (let d = 1; d <= t.getDate(); d++) days.push(pre + '-' + pad(d));      // never past today
    const info = days.map(k => {
        const list = S.byDate.get(k) || [];
        const st = list.length ? 'ok' : hol[k] ? 'hol' : 'miss';
        return { k, st, prod: list.reduce((s, e) => s + (+e.prod || 0), 0), n: list.length };
    });
    const ok = info.filter(i => i.st === 'ok').length, hl = info.filter(i => i.st === 'hol').length;
    const missing = info.filter(i => i.st === 'miss');
    const pastMissing = missing.filter(i => i.k < today);
    const working = info.length - hl;
    $('pend-title').textContent = MONTHS[m] + ' ' + y;
    $('pend-sub').textContent = pastMissing.length
        ? `${pastMissing.length} day${pastMissing.length > 1 ? 's' : ''} still need an entry`
        : (missing.length ? 'All past days entered • today is pending' : 'All days entered so far');
    $('pend-stats').innerHTML =
        `<span class="pst ok"><b>${ok}</b>entered</span><span class="pst miss"><b>${missing.length}</b>pending</span>` + (hl ? `<span class="pst hol"><b>${hl}</b>holiday</span>` : '');
    $('pend-prog').style.width = (working ? ok / working * 100 : 0).toFixed(1) + '%';
    $('pend-miss').innerHTML = missing.length
        ? missing.slice().reverse().map(i => `<button type="button" class="mchip${i.k === today ? ' today' : ''}" data-date="${i.k}" title="Enter ${longDate(i.k)}"><small>${i.k === today ? 'Today' : dateOf(i.k).toLocaleDateString('en-US', { weekday: 'short' })}</small><b>${dateOf(i.k).getDate()}</b><small>${MONTHS[m].slice(0, 3)}</small></button>`).join('')
        : `<div class="all-done">✓ Every working day of ${MONTHS[m]} up to today has an entry.</div>`;
    // calendar, week starting Saturday (factory week); empty cells for days before the 1st
    const WD = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const lead = (new Date(y, m, 1).getDay() + 1) % 7;
    let html = WD.map(w => `<div class="wd${w === 'Fri' ? ' fri' : ''}">${w}</div>`).join('');
    for (let i = 0; i < lead; i++) html += '<div class="cd blank"></div>';
    info.forEach(i => {
        const s = i.st === 'ok' ? fmt(i.prod) + (i.n > 1 ? ' • ' + i.n : '') : i.st === 'hol' ? 'Holiday' : i.k === today ? 'Due today' : 'Missing';
        html += `<button type="button" class="cd ${i.st}${i.k === today ? ' today' : ''}${i.k === sel ? ' sel' : ''}" data-date="${i.k}" title="${longDate(i.k)}${i.st === 'ok' ? ' • production ' + fmt(i.prod) : ''}"><span class="n">${+i.k.slice(8)}</span><span class="s">${s}</span></button>`;
    });
    $('pend-cal').innerHTML = html;
}
function gotoEntryDate(k) {
    if (S.page !== 'entry') show('entry');
    $('f-date').value = k;
    resetForm(true);
    S.dirty.add('entry'); renderEntry();
    $('entry-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { $('f-prod').focus(); }, 250);
    toast('Entering ' + longDate(k));
}
function onRowAction(ev) {
    const b = ev.target.closest('button[data-act]'); if (!b) return;
    const e = S.byId.get(b.dataset.id); if (!e) return;
    if (b.dataset.act === 'edit') {
        if (S.page !== 'entry') show('entry');
        S.editingId = e.id; fillForm(e);
        document.querySelector('#page-entry .toolbar').classList.add('editing');
        $('f-save').lastChild.textContent = 'Update entry';
        S.dirty.add('entry'); renderEntry();
        $('f-prod').focus();
    } else if (b.dataset.act === 'del') {
        if (!confirm(`Delete ${e.model} on ${longDate(e.date)}?\nProduction ${fmt(e.prod)}, defect ${fmt(defTotal(e))}.`)) return;
        writeEntry(e.id, { deleted: true, ts: Date.now() }).then(ok => toast(ok ? 'Entry deleted' : 'Deleted locally — will sync when online'));
        if (S.editingId === e.id) resetForm(true);
    }
}
async function saveEntry() {
    const f = readForm();
    if (!f.date) return toast('Pick a date');
    if (!f.prod) { $('f-prod').focus(); return toast('Enter the production quantity'); }
    const t = defTotal(f);
    if (t > f.prod && !confirm(`Total defect (${t}) is more than production (${f.prod}). Save anyway?`)) return;
    if (f.dis > t && !confirm(`Disassembled (${f.dis}) is more than total defect (${t}). Save anyway?`)) return;
    let id = S.editingId;
    if (!id) {
        const clash = (S.byDate.get(f.date) || []).find(e => String(e.model) === f.model);
        if (clash) {
            if (!confirm(`${f.model} already has an entry on ${shortDate(f.date)}. Replace it?`)) return;
            id = clash.id;
        } else id = f.date + '_' + f.model;
    }
    const prev = S.byId.get(id);
    if (prev && (prev.date !== f.date || String(prev.model) !== f.model)) {
        // date or model changed while editing → move: delete the old key, write the new one
        await writeEntry(id, { deleted: true, ts: Date.now() });
        id = f.date + '_' + f.model;
    }
    const now = new Date();
    const rec = { date: f.date, model: f.model, prod: f.prod, d: f.d, ts: now.getTime(),
        savedAt: now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) };
    if (f.dis) rec.dis = f.dis;
    if (f.rem) rec.rem = f.rem;
    $('f-save').disabled = true;
    const ok = await writeEntry(id, rec);
    $('f-save').disabled = false;
    toast((ok ? '✓ Saved • ' : 'Saved locally • ') + f.model + ' • ' + shortDate(f.date));
    S.daily.date = f.date;
    resetForm(true);
    $('f-prod').focus();
}

// =====================================================================
// MONTHLY
// =====================================================================
function renderMonthly() {
    const M = S.monthly;
    if (M.y == null) { const last = S.dates[S.dates.length - 1] || todayKey(); M.y = +last.slice(0, 4); M.m = +last.slice(5, 7) - 1; }
    $('m-month').value = M.m; $('m-year').value = M.y; $('m-model').value = M.model;
    const a = aggMonth(M.y, M.m, M.model);
    const pm = M.m === 0 ? [M.y - 1, 11] : [M.y, M.m - 1];
    const p = aggMonth(pm[0], pm[1], M.model);
    const rate = pnum(a.def, a.prod), pRate = p.prod ? pnum(p.def, p.prod) : null;
    $('m-sub').textContent = '• ' + MONTHS[M.m] + ' ' + M.y + (M.model ? ' • model ' + M.model : '');
    $('m-kpis').innerHTML = [
        kpi({ lbl: 'Production', val: fmt(a.prod), ico: 'box', cls: 'k-blue', sub: `${a.days.size} working day${a.days.size === 1 ? '' : 's'} • avg <b class="num">${fmt(Math.round(a.prod / (a.days.size || 1)))}</b>/day` }),
        kpi({ lbl: 'Total Rejection', val: fmt(a.def), ico: 'alert', sub: `Rate <b class="num">${rate.toFixed(2)}%</b> ${delta(rate, pRate)} vs ${MONTHS[pm[1]].slice(0, 3)}` }),
        kpi({ lbl: 'Disassembled', val: fmt(a.dis), ico: 'tool', cls: 'k-amber', sub: `<b class="num">${pct(a.dis, a.prod)}</b> of production` }),
        kpi({ lbl: 'Recovery', val: a.def ? a.rec.toFixed(2) + '%' : '—', ring: a.def ? a.rec : 0, cls: 'k-green', sub: `${fmt(Math.max(0, a.def - a.dis))} fixed in line` }),
        kpi({ lbl: 'Top Defect', val: a.top ? esc(DLABEL[a.top[0]]) : '—', ico: 'target', cls: 'k-violet', sub: a.top ? `<b class="num">${fmt(a.top[1])}</b> • ${pct(a.top[1], a.prod)} of prod` : '—' })
    ].join('');
    const topV = $('m-kpis').querySelectorAll('.kpi-v')[4]; if (topV) { topV.style.fontSize = '19px'; topV.style.lineHeight = '1.15'; }
    // pareto
    const rows = a.sorted.filter(x => x[1] > 0);
    // Pareto: each point of the line = share of ALL defects covered by this bar and every bar to its left.
    let cum = 0;
    const cumPct = rows.map(r => +((cum += r[1]) / (a.def || 1) * 100).toFixed(1));
    const sharePct = rows.map(r => +(r[1] / (a.def || 1) * 100).toFixed(1));
    // "vital few" = the bars needed to reach 80% (including the one that crosses it)
    const vitalN = Math.max(1, cumPct.findIndex(v => v >= 80) + 1 || rows.length);
    const maxQ = rows.length ? rows[0][1] : 0;
    chart('c-m-pareto', {
        type: 'bar',
        data: { labels: rows.map(r => wrapLabel(DLABEL[r[0]])), datasets: [
            { type: 'bar', label: 'Defect qty', data: rows.map(r => r[1]),
              backgroundColor: rows.map((r, i) => i < vitalN ? 'rgba(225,29,72,.88)' : 'rgba(253,164,175,.70)'),
              hoverBackgroundColor: rows.map((r, i) => i < vitalN ? '#be123c' : '#fb7185'),
              borderRadius: { topLeft: 8, topRight: 8 }, borderSkipped: false, maxBarThickness: 46, yAxisID: 'y', order: 2 },
            { type: 'line', label: 'Cumulative share %', data: cumPct, borderColor: '#0f172a', borderWidth: 2.2,
              backgroundColor: 'rgba(15,23,42,.06)', fill: false, cubicInterpolationMode: 'monotone',
              pointRadius: rows.map((r, i) => i < vitalN ? 4.5 : 3), pointBackgroundColor: rows.map((r, i) => i < vitalN ? '#e11d48' : '#fff'),
              pointBorderColor: '#0f172a', pointBorderWidth: 1.6, yAxisID: 'y1', order: 1 }
        ] },
        options: {
            interaction: { mode: 'index', intersect: false },
            layout: { padding: { top: 26 } },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: {
                    title: it => DLABEL[rows[it[0].dataIndex][0]],
                    label: c => c.datasetIndex === 0 ? ` Qty: ${fmt(c.raw)}  •  ${sharePct[c.dataIndex]}% of defects` : ` Running total: ${c.raw}% of all defects`,
                    footer: it => it[0].dataIndex < vitalN ? 'Vital few — fix first' : 'Trivial many'
                } },
                rj: {
                    axes: { left: 'Defect qty', right: 'Cumulative share', leftColor: '#be123c', rightColor: '#0f172a' },
                    lines: [{ axis: 'y1', value: 80, label: '80% cut-off', color: '#be123c' }],
                    labels: [
                        { ds: 0, fmt: v => fmt(v), color: (v, i) => i < vitalN ? '#9f1239' : '#64748b', offset: 4 },
                        { ds: 1, fmt: v => v + '%', color: '#0f172a', offset: 9 }
                    ]
                }
            },
            scales: {
                x: xScale({ ticks: { color: '#475569', font: { size: 10.5, weight: 600 }, maxRotation: 0, minRotation: 0, autoSkip: false, padding: 6 } }),
                y: yScale({ beginAtZero: true, suggestedMax: maxQ * 1.15 }),
                y1: yScale({ position: 'right', min: 0, max: 110, grid: { display: false } }, { stepSize: 20, maxTicksLimit: 7, callback: v => v <= 100 ? v + '%' : '' })
            }
        }
    });
    $('m-pareto-sub').innerHTML = rows.length
        ? `<b style="color:#9f1239">${rows.slice(0, vitalN).map(r => DLABEL[r[0]]).join(', ')}</b> = ${cumPct[vitalN - 1]}% of all defects`
        : '';
    // table
    $('m-tbl-sub').textContent = rows.length + ' active categories';
    $('m-table').innerHTML = `<thead><tr><th class="l">Defect Category</th><th>Qty</th><th>Rejection %</th><th>Share</th></tr></thead><tbody>${a.sorted.map(([k, q]) =>
        `<tr><td class="l">${DLABEL[k]}</td><td class="${q ? 'hot' : 'z'}">${fmt(q)}</td><td class="${q ? '' : 'z'}">${pct(q, a.prod)}</td><td class="${q ? '' : 'z'}">${pct(q, a.def, 1)}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td class="l">TOTAL REJECTION</td><td>${fmt(a.def)}</td><td>${pct(a.def, a.prod)}</td><td>100%</td></tr><tr><td class="l">DISASSEMBLED FAN</td><td>${fmt(a.dis)}</td><td>${pct(a.dis, a.prod)}</td><td></td></tr></tfoot>`;
    // daily trend
    const pre = M.y + '-' + pad(M.m + 1);
    const days = S.dates.filter(x => x.startsWith(pre));
    const dayAgg = days.map(x => agg((S.byDate.get(x) || []).filter(e => !M.model || e.model === M.model)));
    rateTrend('c-m-daily', days, dayAgg, rate, 'Month avg');
    // by model
    const ms = Object.entries(a.models).sort((x, y) => y[1].prod - x[1].prod);
    $('m-models').innerHTML = `<thead><tr><th class="l">Model</th><th>Rows</th><th>Production</th><th>Defect</th><th>Rate</th><th>Disasm.</th><th>Recovery</th></tr></thead><tbody>${ms.map(([m, v]) =>
        `<tr><td class="l"><b>${esc(m)}</b></td><td>${v.n}</td><td>${fmt(v.prod)}</td><td class="hot">${fmt(v.def)}</td><td>${pct(v.def, v.prod)}</td><td>${fmt(v.dis)}</td><td>${v.def ? ((v.def - v.dis) / v.def * 100).toFixed(1) + '%' : '—'}</td></tr>`).join('') || '<tr><td class="l" colspan="7" style="text-align:center;color:#94a3b8;padding:18px">No data</td></tr>'}</tbody>`;
    // insight (Pareto 80/20)
    let c = 0, n80 = 0; for (const r of rows) { c += r[1]; n80++; if (c / (a.def || 1) >= .8) break; }
    const top3 = rows.slice(0, 3), top3Share = top3.reduce((s, r) => s + r[1], 0);
    $('m-insight').innerHTML = `<span class="ic">${ICON.bulb}</span><p>${a.n
        ? `<b>${n80} of ${rows.length}</b> categories make up 80% of rejections. The top three — <b>${top3.map(r => DLABEL[r[0]]).join(', ')}</b> — account for <b>${pct(top3Share, a.def, 1)}</b>; fixing these first gives the biggest drop. ${pRate != null ? `Rate is <b>${rate.toFixed(2)}%</b>, ${rate > pRate ? 'up' : 'down'} ${Math.abs(rate - pRate).toFixed(2)} pts from ${MONTHS[pm[1]]}.` : ''}`
        : 'No entries in this month.'}</p>`;
}

// =====================================================================
// YEARLY (Monthly Summary)
// =====================================================================
function renderYearly() {
    const Y = S.yearly;
    if (Y.y == null) Y.y = +(S.dates[S.dates.length - 1] || todayKey()).slice(0, 4);
    $('y-year').value = Y.y;
    document.querySelectorAll('#y-view button').forEach(b => b.classList.toggle('on', b.dataset.v === Y.view));
    const ms = MONTHS.map((_, i) => aggMonth(Y.y, i));
    const ytd = agg(S.entries.filter(e => e.date.startsWith(Y.y + '-')));
    $('y-sub').textContent = '• ' + Y.y;
    $('y-kpis').innerHTML = [
        kpi({ lbl: 'Total Production (YTD)', val: fmt(ytd.prod), ico: 'box', cls: 'k-blue', sub: 'Manufactured assemblies' }),
        kpi({ lbl: 'Total Rejections (YTD)', val: fmt(ytd.def), ico: 'alert', sub: 'Defective units identified' }),
        kpi({ lbl: 'YTD Rejection Rate', val: pct(ytd.def, ytd.prod), ico: 'shield', cls: 'k-violet', sub: 'Annual quality loss rate' }),
        kpi({ lbl: 'Disassembled for Rework', val: fmt(ytd.dis), ico: 'tool', cls: 'k-amber', sub: 'Recoverable fan units' }),
        kpi({ lbl: 'Disassembled %', val: pct(ytd.dis, ytd.prod), ring: pnum(ytd.dis, ytd.prod) * 5, cls: 'k-green', sub: '% of total production' })
    ].join('');
    // ring shows x5 for visibility; label it with the real value
    const r = $('y-kpis').querySelector('.ring span'); if (r) r.textContent = pnum(ytd.dis, ytd.prod).toFixed(1) + '%';
    chart('c-y-month', {
        type: 'bar',
        data: { labels: MONTHS.map(m => m.slice(0, 3)), datasets: [
            { type: 'line', label: 'Rejection %', data: ms.map(a => a.prod ? +pnum(a.def, a.prod).toFixed(2) : null), borderColor: '#0f172a', borderWidth: 2.2, cubicInterpolationMode: 'monotone', pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: '#0f172a', pointBorderWidth: 2, spanGaps: true, yAxisID: 'y1' },
            { type: 'bar', label: 'Total defect', data: ms.map(a => a.def), backgroundColor: 'rgba(225,29,72,.8)', borderRadius: 6, yAxisID: 'y' },
            { type: 'bar', label: 'Disassembled', data: ms.map(a => a.dis), backgroundColor: 'rgba(245,158,11,.65)', borderRadius: 6, yAxisID: 'y' }
        ] },
        options: { interaction: { mode: 'index', intersect: false }, layout: { padding: { top: 26 } },
            plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { footer: items => 'Production: ' + fmt(ms[items[0].dataIndex].prod) } },
                rj: { axes: { left: 'Pcs', right: 'Rejection %', leftColor: '#be123c', rightColor: '#0f172a' }, lines: ytd.prod ? [{ axis: 'y1', value: +pnum(ytd.def, ytd.prod).toFixed(2), label: 'YTD avg ' + pct(ytd.def, ytd.prod), color: '#9f1239' }] : [],
                      labels: [{ ds: 0, fmt: v => v.toFixed(1) + '%', color: '#0f172a', offset: 9 }] } },
            scales: { x: xScale(), y: yScale({ beginAtZero: true }, { callback: v => v >= 1000 ? (v / 1000) + 'k' : v }),
                y1: yScale({ position: 'right', min: 0, suggestedMax: Math.ceil(Math.max(1, ...ms.map(a => pnum(a.def, a.prod))) * 1.3), grid: { display: false } }, { callback: v => v + '%' }) } }
    });
    const act = ytd.sorted.filter(x => x[1] > 0);
    const top = act.slice(0, 8), other = act.slice(8).reduce((s, x) => s + x[1], 0);
    $('y-top-sub').textContent = act.length ? 'share of ' + fmt(ytd.def) + ' rejections' : '';
    chart('c-y-donut', {
        type: 'doughnut',
        data: { labels: top.map(x => DLABEL[x[0]]).concat(other ? ['Others'] : []), datasets: [{ data: top.map(x => x[1]).concat(other ? [other] : []), backgroundColor: PALETTE, borderColor: '#fff', borderWidth: 2, hoverOffset: 8 }] },
        options: { cutout: '62%', plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: c => ` ${c.label}: ${fmt(c.raw)} (${pct(c.raw, ytd.def, 1)})` } } } }
    });
    // matrix
    const pctView = Y.view === 'pct';
    let prevDef = null;
    const body = ms.map((a, i) => {
        const has = a.prod > 0;
        const mom = has && prevDef != null ? a.def - prevDef : null;
        const momPct = has && prevDef ? (a.def - prevDef) / prevDef * 100 : null;
        const trend = !has ? '<span class="hint">No production</span>' : prevDef == null ? '<span class="tag flat">Baseline</span>' : a.def > prevDef ? '<span class="tag up">▲ Increased</span>' : a.def < prevDef ? '<span class="tag down">▼ Improved</span>' : '<span class="tag flat">= Same</span>';
        if (has) prevDef = a.def;
        const cells = DKEYS.map(k => {
            const q = a.d[k];
            if (!q) return '<td class="z">–</td>';
            const share = q / (a.def || 1), alpha = Math.min(.85, .08 + share * 1.6);
            return `<td><span class="heat" style="background:rgba(225,29,72,${alpha.toFixed(2)});color:${alpha > .45 ? '#fff' : '#881337'}">${pctView ? pct(q, a.prod) : fmt(q)}</span></td>`;
        }).join('');
        return `<tr><td class="l"><b>${MONTHS[i]}</b></td><td class="${has ? '' : 'z'}">${fmt(a.prod)}</td>${cells}<td class="hot">${fmt(a.def)}</td><td>${has ? pct(a.def, a.prod) : '–'}</td><td>${fmt(a.dis)}</td><td>${has ? pct(a.dis, a.prod) : '–'}</td><td>${mom == null ? '–' : (mom > 0 ? '+' : '') + fmt(mom)}</td><td>${momPct == null ? '–' : (momPct > 0 ? '+' : '') + momPct.toFixed(1) + '%'}</td><td class="l">${trend}</td><td class="l">${a.top ? DLABEL[a.top[0]] + ' <span class="hint">' + fmt(a.top[1]) + '</span>' : '<span class="hint">None</span>'}</td></tr>`;
    }).join('');
    $('y-matrix').innerHTML = `<thead><tr><th class="l">Month</th><th>Production</th>${DEFECTS.map(d => `<th>${d[1]}</th>`).join('')}<th>Total Rej.</th><th>Rej. %</th><th>Disasm.</th><th>Disasm. %</th><th>MoM Qty</th><th>MoM %</th><th class="l">Trend</th><th class="l">Top Defect</th></tr></thead><tbody>${body}</tbody>
        <tfoot><tr><td class="l">YTD TOTAL</td><td>${fmt(ytd.prod)}</td>${DKEYS.map(k => `<td>${pctView ? pct(ytd.d[k], ytd.prod) : fmt(ytd.d[k])}</td>`).join('')}<td>${fmt(ytd.def)}</td><td>${pct(ytd.def, ytd.prod)}</td><td>${fmt(ytd.dis)}</td><td>${pct(ytd.dis, ytd.prod)}</td><td></td><td></td><td></td><td class="l">${ytd.top ? DLABEL[ytd.top[0]] : ''}</td></tr></tfoot>`;
}

// =====================================================================
// RECORDS
// =====================================================================
function filteredRecords() {
    const mo = $('r-month').value, md = $('r-model').value, q = $('r-q').value.trim().toLowerCase();
    return S.entries.filter(e => (!mo || e.date.startsWith(mo)) && (!md || String(e.model) === md) &&
        (!q || (e.date + ' ' + e.model + ' ' + (e.rem || '') + ' ' + longDate(e.date)).toLowerCase().includes(q))).slice().reverse();
}
function renderRecords() {
    const list = filteredRecords();
    const a = agg(list);
    $('r-sub').textContent = `• ${list.length} rows • prod ${fmt(a.prod)} • defect ${fmt(a.def)} (${pct(a.def, a.prod)})`;
    const LIMIT = 500;
    const rows = list.slice(0, LIMIT).map(e => {
        const t = defTotal(e);
        return `<tr><td class="l">${e.date}</td><td class="l"><b>${esc(e.model)}</b></td><td>${fmt(e.prod)}</td>${DKEYS.map(k => { const v = +e.d?.[k] || 0; return v ? `<td>${v}</td>` : '<td class="z">–</td>'; }).join('')}<td class="hot">${fmt(t)}</td><td>${pct(t, e.prod)}</td><td>${fmt(e.dis || 0)}</td><td class="l" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${esc(e.rem || '')}</td><td><span class="act"><button type="button" data-act="edit" data-id="${esc(e.id)}" title="Edit">${ICON.edit}</button><button type="button" data-act="del" data-id="${esc(e.id)}" title="Delete">${ICON.del}</button></span></td></tr>`;
    }).join('');
    $('r-table').innerHTML = `<thead><tr><th class="l">Date</th><th class="l">Model</th><th>Prod</th>${DEFECTS.map(d => `<th>${d[1]}</th>`).join('')}<th>Total</th><th>Rej. %</th><th>Disasm.</th><th class="l">Remarks</th><th></th></tr></thead><tbody>${rows || `<tr><td class="l" colspan="${DKEYS.length + 9}" style="text-align:center;color:#94a3b8;padding:24px">No records</td></tr>`}</tbody>
        <tfoot><tr><td class="l" colspan="2">TOTAL${list.length > LIMIT ? ' (first ' + LIMIT + ' shown)' : ''}</td><td>${fmt(a.prod)}</td>${DKEYS.map(k => `<td>${fmt(a.d[k])}</td>`).join('')}<td>${fmt(a.def)}</td><td>${pct(a.def, a.prod)}</td><td>${fmt(a.dis)}</td><td></td><td></td></tr></tfoot>`;
}
function exportCsv() {
    const list = filteredRecords().slice().reverse();
    const head = ['Date', 'Model', 'Production Quantity', ...DEFECTS.map(d => d[1]), 'Total Rejection', 'Rejection %', 'Disassembled Fan', 'Remarks'];
    const q = v => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = [head.map(q).join(',')].concat(list.map(e => { const t = defTotal(e); return [e.date, e.model, e.prod, ...DKEYS.map(k => +e.d?.[k] || 0), t, e.prod ? (t / e.prod * 100).toFixed(2) + '%' : '0%', e.dis || 0, e.rem || ''].map(q).join(','); }));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `MEP-Rejection-${$('r-month').value || 'all'}${$('r-model').value ? '-' + $('r-model').value : ''}.csv`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

// =====================================================================
// FIREBASE
// =====================================================================
const PENDING_KEY = 'mep_rej_pending';
function setCloud(state, label) {
    S.cloud = state;
    const chip = $('cloud-chip'), sb = $('sb-sync');
    const text = label || { live: 'Firebase live', offline: 'Offline • local', error: 'Sync error', connecting: 'Connecting…' }[state];
    chip.className = 'chip' + (state === 'live' ? '' : state === 'error' ? ' err' : ' off');
    chip.lastElementChild.textContent = text;
    sb.className = 'sb-sync' + (state === 'live' ? '' : state === 'error' ? ' err' : ' off');
    sb.lastElementChild.textContent = text;
}
function readPending() { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '{}') || {}; } catch (e) { return {}; } }
function writePending(p) { try { localStorage.setItem(PENDING_KEY, JSON.stringify(p)); } catch (e) {} }
async function writeEntry(id, rec) {
    S.remote = Object.assign({}, S.remote, { [id]: rec });   // optimistic
    rebuild(); renderActive();
    if (!S.db) { const p = readPending(); p[id] = rec; writePending(p); return false; }
    try {
        await S.fb.set(S.fb.ref(S.db, FB_PATH + '/' + id), rec);
        return true;
    } catch (e) {
        console.error('Rejection save failed:', e);
        const p = readPending(); p[id] = rec; writePending(p);
        setCloud('error', 'Save failed • queued');
        return false;
    }
}
async function flushPending() {
    const p = readPending(), ids = Object.keys(p);
    if (!ids.length || !S.db) return;
    for (const id of ids) {
        try { await S.fb.set(S.fb.ref(S.db, FB_PATH + '/' + id), p[id]); delete p[id]; } catch (e) { break; }
    }
    writePending(p);
    if (!Object.keys(p).length) toast('Queued entries synced');
}
async function initFirebase() {
    const pend = readPending();
    if (Object.keys(pend).length) { S.remote = Object.assign({}, S.remote, pend); rebuild(); }
    try {
        const [appM, dbM] = await Promise.all([
            import(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-app.js`),
            import(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-database.js`)
        ]);
        const app = appM.getApps().length ? appM.getApp() : appM.initializeApp(firebaseConfig);
        S.db = dbM.getDatabase(app);
        S.fb = { ref: dbM.ref, set: dbM.set };
        dbM.onValue(dbM.ref(S.db, '.info/connected'), s => setCloud(s.val() ? 'live' : 'offline'));
        dbM.onValue(dbM.ref(S.db, FB_PATH), snap => {
            S.remote = Object.assign({}, snap.val() || {}, readPending());
            rebuild(); fillSelectors(); renderActive();
        }, err => { console.error(err); setCloud('error'); });
        // SFG holiday list (shared off days) → greys them out of "pending"
        dbM.onValue(dbM.ref(S.db, 'inventory_reports/_settings/holidays'), snap => {
            const v = snap.val() || {}, clean = {};
            Object.keys(v).forEach(k => { if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v[k]) clean[k] = v[k]; });
            S.hol = clean;
            try { localStorage.setItem('mep_sfg_holidays', JSON.stringify(clean)); } catch (e) {}
            if (S.page === 'entry') renderPending(); else S.dirty.add('entry');
        });
        flushPending();
    } catch (e) {
        console.error('Firebase unavailable:', e);
        setCloud('offline');
    }
}

// =====================================================================
// REPORT JPG EXPORT — drawn straight onto a canvas (no html2canvas), so the layout
// is pixel-exact, fast, and never depends on what is on screen.
// =====================================================================
const RP = {
    W: 1400, PAD: 48, S: 2,
    red: '#e11d48', red2: '#f43f5e', redD: '#9f1239', ink: '#0f172a', ink2: '#334155', mute: '#64748b', line: '#fecdd3',
    green: '#059669', amber: '#d97706', blue: '#2563eb',
    J: "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif", N: "'Manrope', 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif"
};
function rpCtx(h) {
    const c = document.createElement('canvas'); c.width = RP.W * RP.S; c.height = h * RP.S;
    const x = c.getContext('2d'); x.scale(RP.S, RP.S); x.textBaseline = 'alphabetic'; return [c, x];
}
function rpRR(x, X, Y, W, H, R) { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, W, H, R); else x.rect(X, Y, W, H); }
function rpT(x, t, X, Y, o = {}) {
    x.font = `${o.w || 700} ${o.s || 14}px ${o.num ? RP.N : RP.J}`;
    x.fillStyle = o.c || RP.ink; x.textAlign = o.a || 'left'; x.textBaseline = o.b || 'alphabetic';
    if ('letterSpacing' in x) x.letterSpacing = o.ls || '0px';
    x.fillText(String(t), X, Y);
    const w = x.measureText(String(t)).width;
    if ('letterSpacing' in x) x.letterSpacing = '0px';
    return w;
}
function rpW(x, t, o = {}) { x.font = `${o.w || 700} ${o.s || 14}px ${o.num ? RP.N : RP.J}`; if ('letterSpacing' in x) x.letterSpacing = o.ls || '0px'; const w = x.measureText(String(t)).width; if ('letterSpacing' in x) x.letterSpacing = '0px'; return w; }
function rpCard(x, X, Y, W, H, fill = '#ffffff') {
    x.save(); x.shadowColor = 'rgba(136,19,55,.10)'; x.shadowBlur = 24; x.shadowOffsetY = 8;
    rpRR(x, X, Y, W, H, 20); x.fillStyle = fill; x.fill(); x.restore();
    rpRR(x, X + .5, Y + .5, W - 1, H - 1, 20); x.strokeStyle = RP.line; x.lineWidth = 1; x.stroke();
}
// delta chip: kind 'bad-up' (higher = worse), 'good-up', 'neutral'
function rpChip(x, X, Y, d, unit, kind, align = 'left') {
    let txt, bg, fg;
    if (d == null || !isFinite(d)) { txt = '— no previous'; bg = '#f1f5f9'; fg = RP.mute; }
    else if (Math.abs(d) < 0.005) { txt = '= no change'; bg = '#f1f5f9'; fg = RP.mute; }
    else {
        const up = d > 0, worse = kind === 'bad-up' ? up : kind === 'good-up' ? !up : null;
        const v = unit === '%' || unit === ' pts' ? Math.abs(d).toFixed(2) : fmt(Math.abs(Math.round(d)));
        txt = (up ? '▲ ' : '▼ ') + v + unit;
        bg = worse == null ? '#e0f2fe' : worse ? '#ffe4e6' : '#d1fae5';
        fg = worse == null ? '#0369a1' : worse ? '#be123c' : '#047857';
    }
    const w = rpW(x, txt, { s: 11.5, w: 800, num: true }) + 18, h = 24;
    const L = align === 'right' ? X - w : X;
    rpRR(x, L, Y - h / 2, w, h, 12); x.fillStyle = bg; x.fill();
    rpT(x, txt, L + w / 2, Y + 1, { s: 11.5, w: 800, num: true, c: fg, a: 'center', b: 'middle' });
    return w;
}
function rpHeader(x, kicker, title, pill, sub) {
    const W = RP.W, H = 168;
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#9f1239'); g.addColorStop(.55, '#e11d48'); g.addColorStop(1, '#fb7185');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // soft glass orbs
    [[W - 160, -40, 220, .16], [W - 420, 150, 160, .10], [120, 190, 180, .08]].forEach(([cx, cy, r, a]) => { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fillStyle = `rgba(255,255,255,${a})`; x.fill(); });
    // brand tile
    rpRR(x, RP.PAD, 40, 56, 56, 16); x.fillStyle = 'rgba(255,255,255,.18)'; x.fill(); x.strokeStyle = 'rgba(255,255,255,.4)'; x.stroke();
    rpT(x, 'M', RP.PAD + 28, 69, { s: 26, w: 800, c: '#fff', a: 'center', b: 'middle' });
    rpT(x, kicker, RP.PAD + 74, 58, { s: 12, w: 800, c: 'rgba(255,255,255,.85)', ls: '3px' });
    rpT(x, title, RP.PAD + 74, 92, { s: 30, w: 800, c: '#fff' });
    rpT(x, 'MEP FAN LTD  •  Assembly Quality Control', RP.PAD + 74, 122, { s: 13, w: 600, c: 'rgba(255,255,255,.8)' });
    // right pill
    const pw = rpW(x, pill, { s: 16, w: 800 }) + 36;
    rpRR(x, W - RP.PAD - pw, 44, pw, 42, 21); x.fillStyle = '#fff'; x.fill();
    rpT(x, pill, W - RP.PAD - pw / 2, 66, { s: 16, w: 800, c: RP.redD, a: 'center', b: 'middle' });
    if (sub) rpT(x, sub, W - RP.PAD, 112, { s: 12.5, w: 700, c: 'rgba(255,255,255,.9)', a: 'right' });
    return H;
}
function rpKpis(x, Y, tiles) {
    const gap = 16, n = tiles.length, w = (RP.W - RP.PAD * 2 - gap * (n - 1)) / n, h = 138;
    tiles.forEach((t, i) => {
        const X = RP.PAD + i * (w + gap);
        rpCard(x, X, Y, w, h);
        x.fillStyle = t.accent; rpRR(x, X + 18, Y + 18, 6, 22, 3); x.fill();
        rpT(x, t.label.toUpperCase(), X + 32, Y + 34, { s: 11, w: 800, c: RP.mute, ls: '1.6px' });
        rpT(x, t.value, X + 20, Y + 84, { s: 36, w: 800, num: true, c: t.vc || RP.ink });
        if (t.sub) rpT(x, t.sub, X + 20, Y + 112, { s: 12.5, w: 700, c: RP.mute });
        if (t.delta) rpChip(x, X + w - 18, Y + 32, t.delta[0], t.delta[1], t.delta[2], 'right');
    });
    return h;
}
function rpFooter(x, Y, note) {
    x.strokeStyle = RP.line; x.lineWidth = 1; x.beginPath(); x.moveTo(RP.PAD, Y); x.lineTo(RP.W - RP.PAD, Y); x.stroke();
    rpT(x, note, RP.PAD, Y + 30, { s: 12, w: 600, c: RP.mute });
    rpT(x, 'Generated ' + new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) + '  •  MEP Rejection Module',
        RP.W - RP.PAD, Y + 30, { s: 12, w: 700, c: RP.redD, a: 'right' });
    return 56;
}
// comparison bar rows: [{label, a, b}]  a = current, b = previous
function rpCompareRows(x, X, Y, W, rows, base, prevBase, labels) {
    const colQ = X + W - 330, colP = X + W - 250, colB = X + W - 160, colC = X + W - 16;
    rpT(x, labels[0], X + 20, Y + 22, { s: 10.5, w: 800, c: RP.mute, ls: '1.4px' });
    rpT(x, labels[1], colQ, Y + 22, { s: 10.5, w: 800, c: RP.mute, ls: '1.4px', a: 'right' });
    rpT(x, '% PROD', colP, Y + 22, { s: 10.5, w: 800, c: RP.mute, ls: '1.4px', a: 'right' });
    rpT(x, labels[2], colB, Y + 22, { s: 10.5, w: 800, c: RP.mute, ls: '1.4px', a: 'right' });
    rpT(x, 'CHANGE', colC, Y + 22, { s: 10.5, w: 800, c: RP.mute, ls: '1.4px', a: 'right' });
    const max = Math.max(1, ...rows.map(r => Math.max(r.a, r.b)));
    const barX = X + 190, barW = colQ - 60 - barX, rh = 40;
    rows.forEach((r, i) => {
        const y = Y + 40 + i * rh;
        if (i % 2 === 0) { rpRR(x, X + 8, y, W - 16, rh, 10); x.fillStyle = '#fff5f6'; x.fill(); }
        const mid = y + rh / 2;
        rpT(x, r.label, X + 20, mid + 1, { s: 13.5, w: 700, c: RP.ink2, b: 'middle' });
        // previous (ghost) + current bar
        rpRR(x, barX, mid + 5, Math.max(3, barW * r.b / max), 5, 3); x.fillStyle = '#cbd5e1'; x.fill();
        const g = x.createLinearGradient(barX, 0, barX + barW, 0); g.addColorStop(0, '#fb7185'); g.addColorStop(1, '#be123c');
        rpRR(x, barX, mid - 8, Math.max(r.a ? 4 : 0, barW * r.a / max), 11, 5); x.fillStyle = g; x.fill();
        rpT(x, fmt(r.a), colQ, mid + 1, { s: 15, w: 800, num: true, c: r.a ? RP.redD : '#cbd5e1', a: 'right', b: 'middle' });
        rpT(x, base ? (r.a / base * 100).toFixed(2) + '%' : '–', colP, mid + 1, { s: 13, w: 700, num: true, c: RP.ink2, a: 'right', b: 'middle' });
        rpT(x, fmt(r.b), colB, mid + 1, { s: 13.5, w: 700, num: true, c: RP.mute, a: 'right', b: 'middle' });
        // change measured as share of production so different-size days/months compare fairly
        const d = prevBase ? (base ? r.a / base * 100 : 0) - r.b / prevBase * 100 : null;
        rpChip(x, colC, mid, d, ' pts', 'bad-up', 'right');
    });
    // legend
    const ly = Y + 40 + rows.length * rh + 22;
    rpRR(x, X + 20, ly - 6, 22, 9, 4); x.fillStyle = '#e11d48'; x.fill(); rpT(x, labels[1].charAt(0) + labels[1].slice(1).toLowerCase(), X + 48, ly + 2, { s: 11.5, w: 700, c: RP.mute, b: 'middle' });
    rpRR(x, X + 150, ly - 4, 22, 5, 3); x.fillStyle = '#cbd5e1'; x.fill(); rpT(x, labels[2].charAt(0) + labels[2].slice(1).toLowerCase(), X + 178, ly + 2, { s: 11.5, w: 700, c: RP.mute, b: 'middle' });
    rpT(x, 'Change = difference in share of production (percentage points)', X + W - 20, ly + 2, { s: 11, w: 600, c: RP.mute, a: 'right', b: 'middle' });
    return 40 + rows.length * rh + 44;
}
function rpInsights(x, X, Y, W, title, lines) {
    rpT(x, title, X + 20, Y + 32, { s: 15, w: 800 });
    lines.forEach((ln, i) => {
        const y = Y + 66 + i * 52;
        x.beginPath(); x.arc(X + 30, y - 4, 11, 0, Math.PI * 2); x.fillStyle = ln[0]; x.fill();
        rpT(x, ln[1], X + 30, y - 3, { s: 11, w: 800, c: '#fff', a: 'center', b: 'middle' });
        rpT(x, ln[2], X + 52, y - 8, { s: 13.5, w: 800, c: RP.ink });
        rpT(x, ln[3], X + 52, y + 12, { s: 12, w: 600, c: RP.mute });
    });
    return 66 + lines.length * 52;
}
async function rpFonts() {
    try { await Promise.all(['800 20px "Plus Jakarta Sans"', '700 20px "Plus Jakarta Sans"', '600 20px "Plus Jakarta Sans"', '800 20px "Manrope"', '700 20px "Manrope"'].map(f => document.fonts.load(f))); } catch (e) {}
}
function rpCrop(src, h) {
    const out = document.createElement('canvas'); out.width = RP.W * RP.S; out.height = Math.ceil(h * RP.S);
    const x = out.getContext('2d'); x.fillStyle = '#fff7f8'; x.fillRect(0, 0, out.width, out.height); x.drawImage(src, 0, 0);
    return out;
}
function rpBlocked(c) {
    try { const x = c.getContext('2d'); const d = x.getImageData(Math.floor(c.width / 2), 40, 1, 1).data; return d[3] === 0 || (d[0] + d[1] + d[2]) < 10; } catch (e) { return true; }
}
function rpDownload(c, name) {
    if (rpBlocked(c)) { toast('Browser blocked the image (privacy setting) — allow canvas for this site, then retry'); return false; }
    const a = document.createElement('a'); a.download = name; a.href = c.toDataURL('image/jpeg', 0.95);
    document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 0);
    return true;
}
// Day used for the daily report: the selected date if it has entries, otherwise the
// last earlier day that has entries (covers missing days and holidays alike).
function reportDayFor(base) { return S.dates.filter(d => d <= base).pop() || null; }
function updateReportButtons() {
    const base = $('f-date').value || todayKey();
    const d = reportDayFor(base), p = d ? S.dates.filter(x => x < d).pop() : null;
    $('rep-daily-sub').textContent = d ? `${longDate(d)}${d !== base ? ' (last entry)' : ''}${p ? '  •  vs ' + shortDate(p) : ''}` : 'No entries yet';
    const t = dateOf(base), pm = t.getMonth() === 0 ? [t.getFullYear() - 1, 11] : [t.getFullYear(), t.getMonth() - 1];
    $('rep-monthly-sub').textContent = `${MONTHS[t.getMonth()]} ${t.getFullYear()}  •  vs ${MONTHS[pm[1]]} ${pm[0]}`;
}

async function exportDailyReport() {
    const base = $('f-date').value || todayKey();
    const day = reportDayFor(base);
    if (!day) return toast('No entries to report yet');
    const prev = S.dates.filter(x => x < day).pop() || null;
    const a = aggDay(day), p = prev ? aggDay(prev) : null;
    await rpFonts();
    const rows = DKEYS.map(k => ({ k, label: DLABEL[k], a: a.d[k], b: p ? p.d[k] : 0 })).filter(r => r.a || r.b).sort((m, n) => n.a - m.a || n.b - m.b);
    const [c, x] = rpCtx(2600);
    x.fillStyle = '#fff7f8'; x.fillRect(0, 0, RP.W, 2600);
    let y = rpHeader(x, 'DAILY REPORT', 'Assembly Rejection Report', longDate(day), prev ? 'Compared with ' + longDate(prev) : 'No earlier entry to compare');
    y += 26;
    if (day !== base) {
        const why = holidays()[base] ? 'is a holiday' : 'has no entry';
        rpRR(x, RP.PAD, y, RP.W - RP.PAD * 2, 40, 12); x.fillStyle = '#fef3c7'; x.fill();
        rpT(x, `ⓘ  ${longDate(base)} ${why} — showing the last entered day, ${longDate(day)}.`, RP.PAD + 18, y + 21, { s: 13, w: 700, c: '#92400e', b: 'middle' });
        y += 58;
    }
    const rate = pnum(a.def, a.prod), pRate = p ? pnum(p.def, p.prod) : null;
    y += rpKpis(x, y, [
        { label: 'Production', value: fmt(a.prod), sub: `${Object.keys(a.models).length} model${Object.keys(a.models).length > 1 ? 's' : ''}: ${Object.keys(a.models).join(', ')}`, accent: RP.blue, delta: [p ? a.prod - p.prod : null, '', 'neutral'] },
        { label: 'Total Rejection', value: fmt(a.def), vc: RP.redD, sub: `Rate ${rate.toFixed(2)}% of production`, accent: RP.red, delta: [pRate == null ? null : rate - pRate, ' pts', 'bad-up'] },
        { label: 'Disassembled', value: fmt(a.dis), sub: `${pnum(a.dis, a.prod).toFixed(2)}% of production`, accent: RP.amber, delta: [p ? pnum(a.dis, a.prod) - pnum(p.dis, p.prod) : null, ' pts', 'bad-up'] },
        { label: 'Recovery', value: a.def ? a.rec.toFixed(1) + '%' : '—', vc: RP.green, sub: `${fmt(Math.max(0, a.def - a.dis))} of ${fmt(a.def)} fixed in line`, accent: RP.green, delta: [p && p.def && a.def ? a.rec - p.rec : null, ' pts', 'good-up'] }
    ]);
    y += 22;
    // breakdown card
    const bh = rows.length ? 40 + rows.length * 40 + 44 : 120;
    rpCard(x, RP.PAD, y, RP.W - RP.PAD * 2, bh + 56);
    rpT(x, 'What was rejected', RP.PAD + 20, y + 34, { s: 17, w: 800 });
    rpT(x, `${rows.filter(r => r.a).length} of 16 categories • sorted by today’s qty`, RP.W - RP.PAD - 20, y + 34, { s: 12, w: 700, c: RP.mute, a: 'right' });
    if (rows.length) rpCompareRows(x, RP.PAD, y + 48, RP.W - RP.PAD * 2, rows, a.prod, p ? p.prod : 0, ['CATEGORY', 'TODAY', 'PREV DAY']);
    else rpT(x, 'No defects recorded on this day.', RP.W / 2, y + 110, { s: 15, w: 700, c: RP.mute, a: 'center' });
    y += bh + 56 + 22;
    // bottom: models + insights
    const half = (RP.W - RP.PAD * 2 - 16) / 2;
    const ms = Object.entries(a.models).sort((m, n) => n[1].prod - m[1].prod);
    const up = rows.map(r => ({ ...r, d: (a.prod ? r.a / a.prod : 0) - (p && p.prod ? r.b / p.prod : 0) })).sort((m, n) => n.d - m.d);
    const ins = [];
    if (a.top) ins.push([RP.red, '1', `${DLABEL[a.top[0]]} is the top cause`, `${fmt(a.top[1])} pcs • ${pct(a.top[1], a.def, 1)} of today's rejection`]);
    if (p && up.length && up[0].d > 0) ins.push(['#f97316', '▲', `${up[0].label} increased most`, `${fmt(up[0].b)} → ${fmt(up[0].a)} pcs vs previous day`]);
    const dn = up.slice().reverse().find(r => r.d < 0);
    if (p && dn) ins.push([RP.green, '▼', `${dn.label} improved most`, `${fmt(dn.b)} → ${fmt(dn.a)} pcs vs previous day`]);
    if (pRate != null) ins.push([rate > pRate ? RP.red : RP.green, '%', `Rate ${rate > pRate ? 'up' : 'down'} ${Math.abs(rate - pRate).toFixed(2)} pts`, `${pRate.toFixed(2)}% → ${rate.toFixed(2)}% of production`]);
    const ch = Math.max(70 + ms.length * 40 + (p ? 130 : 0), 66 + ins.length * 52) + 20;
    rpCard(x, RP.PAD, y, half, ch);
    rpT(x, 'Model-wise', RP.PAD + 20, y + 32, { s: 15, w: 800 });
    ['MODEL', 'PROD', 'REJ.', 'RATE', 'DISASM.'].forEach((h, i) => rpT(x, h, RP.PAD + (i ? 150 + i * 100 : 20), y + 60, { s: 10.5, w: 800, c: RP.mute, ls: '1.4px', a: i ? 'right' : 'left' }));
    ms.forEach(([m, v], i) => {
        const yy = y + 90 + i * 40;
        rpT(x, m, RP.PAD + 20, yy, { s: 15, w: 800, num: true });
        [fmt(v.prod), fmt(v.def), pct(v.def, v.prod), fmt(v.dis)].forEach((t, j) => rpT(x, t, RP.PAD + 250 + j * 100, yy, { s: 14, w: 700, num: true, c: j === 1 ? RP.redD : RP.ink2, a: 'right' }));
    });
    // previous-day snapshot fills the rest of the card
    if (p) {
        const by = y + ch - 118, bw = half - 40;
        rpRR(x, RP.PAD + 20, by, bw, 98, 14); x.fillStyle = '#f8fafc'; x.fill(); x.strokeStyle = '#e2e8f0'; x.stroke();
        rpT(x, 'PREVIOUS DAY  •  ' + longDate(prev).toUpperCase(), RP.PAD + 36, by + 26, { s: 10.5, w: 800, c: RP.mute, ls: '1.4px' });
        [['Production', fmt(p.prod)], ['Rejection', fmt(p.def)], ['Rate', pct(p.def, p.prod)], ['Disassembled', fmt(p.dis)]].forEach((kv, i) => {
            const X = RP.PAD + 36 + i * (bw - 32) / 4;
            rpT(x, kv[0], X, by + 52, { s: 11.5, w: 700, c: RP.mute });
            rpT(x, kv[1], X, by + 78, { s: 19, w: 800, num: true, c: i === 1 || i === 2 ? RP.redD : RP.ink });
        });
    }
    rpCard(x, RP.PAD + half + 16, y, half, ch, '#fffafb');
    rpInsights(x, RP.PAD + half + 16, y, half, 'Key points', ins.slice(0, 4));
    y += ch + 28;
    y += rpFooter(x, y, 'Rate = rejection ÷ production. Missing days and holidays fall back to the last entered day.');
    rpDownload(rpCrop(c, y + 10), `MEP-Rejection-Daily-${day}.jpg`) && toast('✓ Daily report downloaded • ' + shortDate(day));
}

async function exportMonthlyReport() {
    const base = $('f-date').value || todayKey();
    const t = dateOf(base), Y = t.getFullYear(), M = t.getMonth();
    const pm = M === 0 ? [Y - 1, 11] : [Y, M - 1];
    const a = aggMonth(Y, M), p = aggMonth(pm[0], pm[1]);
    if (!a.n && !p.n) return toast('No entries for this month');
    await rpFonts();
    const rate = pnum(a.def, a.prod), pRate = p.prod ? pnum(p.def, p.prod) : null;
    const rows = DKEYS.map(k => ({ k, label: DLABEL[k], a: a.d[k], b: p.d[k] })).filter(r => r.a || r.b).sort((m, n) => n.a - m.a || n.b - m.b);
    const [c, x] = rpCtx(2800);
    x.fillStyle = '#fff7f8'; x.fillRect(0, 0, RP.W, 2800);
    const isRunning = base.slice(0, 7) === todayKey().slice(0, 7);
    let y = rpHeader(x, 'MONTHLY REPORT', 'Monthly Rejection Report', `${MONTHS[M]} ${Y}`, `Compared with ${MONTHS[pm[1]]} ${pm[0]}${isRunning ? '  •  month to date (' + a.days.size + ' days)' : ''}`);
    y += 26;
    y += rpKpis(x, y, [
        // compare average per working day — a running month's total vs a full month would mislead
        { label: 'Production', value: fmt(a.prod), sub: `${a.days.size} working days • avg ${fmt(Math.round(a.prod / (a.days.size || 1)))}/day`, accent: RP.blue,
          delta: [p.prod && a.days.size ? a.prod / a.days.size - p.prod / (p.days.size || 1) : null, '/day', 'neutral'] },
        { label: 'Total Rejection', value: fmt(a.def), vc: RP.redD, sub: `Rate ${rate.toFixed(2)}% of production`, accent: RP.red, delta: [pRate == null ? null : rate - pRate, ' pts', 'bad-up'] },
        { label: 'Disassembled', value: fmt(a.dis), sub: `${pnum(a.dis, a.prod).toFixed(2)}% of production`, accent: RP.amber, delta: [p.prod ? pnum(a.dis, a.prod) - pnum(p.dis, p.prod) : null, ' pts', 'bad-up'] },
        { label: 'Recovery', value: a.def ? a.rec.toFixed(1) + '%' : '—', vc: RP.green, sub: `${fmt(Math.max(0, a.def - a.dis))} fixed in line`, accent: RP.green, delta: [p.def && a.def ? a.rec - p.rec : null, ' pts', 'good-up'] }
    ]);
    y += 22;
    // month vs month summary band
    rpCard(x, RP.PAD, y, RP.W - RP.PAD * 2, 110, '#fffafb');
    const cols = [['THIS MONTH', `${rate.toFixed(2)}%`, `${fmt(a.def)} of ${fmt(a.prod)}`, RP.redD], ['LAST MONTH', pRate == null ? '—' : `${pRate.toFixed(2)}%`, p.prod ? `${fmt(p.def)} of ${fmt(p.prod)}` : 'no data', RP.mute]];
    cols.forEach((cc, i) => {
        const X = RP.PAD + 30 + i * 300;
        rpT(x, cc[0], X, y + 36, { s: 11, w: 800, c: RP.mute, ls: '1.6px' });
        rpT(x, cc[1], X, y + 76, { s: 32, w: 800, num: true, c: cc[3] });
        rpT(x, cc[2], X, y + 98, { s: 12, w: 600, c: RP.mute });
    });
    if (pRate != null) {
        const d = rate - pRate, better = d < 0;
        const X = RP.PAD + 640, Wd = RP.W - RP.PAD - 30 - X;
        rpRR(x, X, y + 22, Wd, 66, 16); x.fillStyle = better ? '#d1fae5' : '#ffe4e6'; x.fill();
        rpT(x, better ? '▼ IMPROVED' : '▲ WORSE', X + 22, y + 48, { s: 12, w: 800, c: better ? '#047857' : '#be123c', ls: '2px' });
        rpT(x, `Rejection rate ${better ? 'down' : 'up'} ${Math.abs(d).toFixed(2)} pts vs ${MONTHS[pm[1]]}`, X + 22, y + 74, { s: 16, w: 800, c: better ? '#065f46' : '#881337' });
    }
    y += 132;
    // category comparison
    const bh = rows.length ? 40 + rows.length * 40 + 44 : 120;
    rpCard(x, RP.PAD, y, RP.W - RP.PAD * 2, bh + 56);
    rpT(x, 'Rejection by category', RP.PAD + 20, y + 34, { s: 17, w: 800 });
    rpT(x, `${MONTHS[M].slice(0, 3)} vs ${MONTHS[pm[1]].slice(0, 3)} • sorted by this month`, RP.W - RP.PAD - 20, y + 34, { s: 12, w: 700, c: RP.mute, a: 'right' });
    if (rows.length) rpCompareRows(x, RP.PAD, y + 48, RP.W - RP.PAD * 2, rows, a.prod, p.prod, ['CATEGORY', 'THIS MONTH', 'LAST MONTH']);
    y += bh + 56 + 22;
    // bottom: daily rate chart + insights
    const half = (RP.W - RP.PAD * 2 - 16) / 2, ch = 300;
    rpCard(x, RP.PAD, y, half, ch);
    rpT(x, 'Daily rejection rate', RP.PAD + 20, y + 32, { s: 15, w: 800 });
    const pre = Y + '-' + pad(M + 1), days = S.dates.filter(d => d.startsWith(pre)), dv = days.map(d => { const v = aggDay(d); return pnum(v.def, v.prod); });
    const cx = RP.PAD + 50, cy = y + 60, cw = half - 80, chh = ch - 110, mx = Math.max(1, ...dv, rate) * 1.2;
    x.strokeStyle = '#f1f5f9'; x.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const yy = cy + chh - chh * i / 4; x.beginPath(); x.moveTo(cx, yy); x.lineTo(cx + cw, yy); x.stroke(); rpT(x, (mx * i / 4).toFixed(0) + '%', cx - 8, yy + 4, { s: 10, w: 700, num: true, c: '#94a3b8', a: 'right' }); }
    const bw = days.length ? Math.min(34, cw / days.length * .65) : 0;
    days.forEach((d, i) => {
        const bx = cx + (i + .5) * cw / days.length - bw / 2, bhh = chh * dv[i] / mx;
        const g = x.createLinearGradient(0, cy + chh - bhh, 0, cy + chh); g.addColorStop(0, dv[i] > rate ? '#e11d48' : '#fb7185'); g.addColorStop(1, dv[i] > rate ? '#9f1239' : '#fda4af');
        rpRR(x, bx, cy + chh - bhh, bw, bhh, 5); x.fillStyle = g; x.fill();
        if (days.length <= 16 || i % 2 === 0) rpT(x, String(+d.slice(8)), bx + bw / 2, cy + chh + 18, { s: 10.5, w: 700, num: true, c: RP.mute, a: 'center' });
    });
    const ay = cy + chh - chh * rate / mx;
    x.setLineDash([6, 5]); x.strokeStyle = RP.redD; x.lineWidth = 1.5; x.beginPath(); x.moveTo(cx, ay); x.lineTo(cx + cw, ay); x.stroke(); x.setLineDash([]);
    const al = `Avg ${rate.toFixed(2)}%`, aw = rpW(x, al, { s: 11, w: 800 }) + 14;
    rpRR(x, cx + cw - aw, ay - 22, aw, 18, 9); x.fillStyle = RP.redD; x.fill(); rpT(x, al, cx + cw - aw / 2, ay - 12, { s: 11, w: 800, c: '#fff', a: 'center', b: 'middle' });
    // insights
    let cum = 0, n80 = 0; const act = a.sorted.filter(r => r[1] > 0); for (const r of act) { cum += r[1]; n80++; if (cum / (a.def || 1) >= .8) break; }
    const ch2 = rows.map(r => ({ ...r, d: (a.prod ? r.a / a.prod : 0) - (p.prod ? r.b / p.prod : 0) })).sort((m, n) => n.d - m.d);
    const ins = [];
    if (act.length) ins.push([RP.red, '80', `${act.slice(0, n80).map(r => DLABEL[r[0]]).slice(0, 3).join(', ')}${n80 > 3 ? ' +' + (n80 - 3) : ''}`, `${n80} categor${n80 > 1 ? 'ies' : 'y'} cause 80% of rejection — fix these first`]);
    if (p.prod && ch2.length && ch2[0].d > 0) ins.push(['#f97316', '▲', `${ch2[0].label} got worse`, `${(p.prod ? ch2[0].b / p.prod * 100 : 0).toFixed(2)}% → ${(ch2[0].a / (a.prod || 1) * 100).toFixed(2)}% of production`]);
    const best = ch2.slice().reverse().find(r => r.d < 0);
    if (p.prod && best) ins.push([RP.green, '▼', `${best.label} improved`, `${(best.b / p.prod * 100).toFixed(2)}% → ${(best.a / (a.prod || 1) * 100).toFixed(2)}% of production`]);
    const worstDay = days[dv.indexOf(Math.max(...dv))];
    if (worstDay) ins.push(['#7c3aed', '!', `Worst day: ${longDate(worstDay)}`, `${Math.max(...dv).toFixed(2)}% rejection rate`]);
    rpCard(x, RP.PAD + half + 16, y, half, ch, '#fffafb');
    rpInsights(x, RP.PAD + half + 16, y, half, 'Key points', ins.slice(0, 4));
    y += ch + 28;
    y += rpFooter(x, y, isRunning ? 'Running month: quantities are month-to-date; compare rates (% of production) for a fair view.' : 'Rate = rejection ÷ production.');
    rpDownload(rpCrop(c, y + 10), `MEP-Rejection-Monthly-${Y}-${pad(M + 1)}.jpg`) && toast('✓ Monthly report downloaded • ' + MONTHS[M] + ' ' + Y);
}

// =====================================================================
// PREMIUM DROPDOWN — wraps every <select>; the native element stays as the source
// of truth (value + change event), so all existing code keeps working unchanged.
// =====================================================================
const DD = new Map();
const CARET = '<svg class="dd-car" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';
const CHECK = '<svg class="ck" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
const CAL_ICO = '<svg class="dd-ico" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>';
const CUBE_ICO = '<svg class="dd-ico" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>';
const YR_ICO = '<svg class="dd-ico" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const NOW_BADGE = '<span class="dd-cur-pill" title="Current Running Month"><span class="dd-cur-dot"></span><span>NOW</span></span>';
const NOW_BADGE_SM = '<span class="dd-cur-pill sm" title="Current Running Month"><span class="dd-cur-dot"></span><span>NOW</span></span>';

function getLeadIco(id) {
    if (/month/i.test(id)) return CAL_ICO;
    if (/model/i.test(id)) return CUBE_ICO;
    if (/year/i.test(id)) return YR_ICO;
    return '';
}

function getOptCount(sel, val) {
    if (!S || !S.entries) return null;
    if (sel.id === 'r-month') {
        return val ? S.entries.filter(e => e.date.startsWith(val)).length : S.entries.length;
    }
    if (sel.id === 'r-model') {
        return val ? S.entries.filter(e => String(e.model) === val).length : S.entries.length;
    }
    return null;
}

function ddLabel(t) { return String(t).replace(/\s*\(current\)\s*$/, ''); }
let _anyDdOpen = false;
function ddClose(except) {
    _anyDdOpen = !!except;
    DD.forEach(d => { if (d !== except) d.wrap.classList.remove('open'); });
}

function ddRefresh(sel) {
    const d = DD.get(sel); if (!d) return;
    const opts = [...sel.options];
    const curOpt = opts[sel.selectedIndex];
    const isCur = o => o && /\(current\)\s*$/.test(o.text);
    d.btn.querySelector('.tx').innerHTML = esc(curOpt ? ddLabel(curOpt.text) : '') + (isCur(curOpt) ? NOW_BADGE : '');
    d.menu.innerHTML = opts.map((o, i) => {
        const cnt = getOptCount(sel, o.value);
        const cntHtml = cnt != null ? `<span class="dd-cnt">${cnt}</span>` : '';
        const isSep = i === 0 && opts.length > 2 && (sel.id === 'r-month' || sel.id === 'r-model');
        const sep = isSep ? '<div class="dd-sep"></div>' : '';
        return `<div class="dd-opt${o.selected ? ' on' : ''}" data-i="${i}" role="option" tabindex="0"><span class="dd-opt-main">${esc(ddLabel(o.text))}${isCur(o) ? NOW_BADGE_SM : ''}</span><span class="dd-opt-right">${cntHtml}${CHECK}</span></div>${sep}`;
    }).join('');
}

function ddOpen(sel) {
    const d = DD.get(sel); if (!d) return;
    ddClose(d);
    _anyDdOpen = true;
    const w = d.wrap;
    w.classList.add('open');
    w.classList.remove('up', 'right');
    const r = d.btn.getBoundingClientRect(), mh = Math.min(340, d.menu.scrollHeight + 12), mw = Math.min(330, Math.max(r.width, d.menu.scrollWidth));
    if (r.bottom + mh + 12 > innerHeight && r.top > mh + 12) w.classList.add('up');
    if (r.left + mw > innerWidth - 12) w.classList.add('right');
    const on = d.menu.querySelector('.on'); if (on) on.scrollIntoView({ block: 'nearest' });
}

function ddPick(sel, i) {
    if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event('change', { bubbles: true })); }
    ddRefresh(sel);
    const d = DD.get(sel); d.wrap.classList.remove('open'); d.btn.focus();
}

function enhanceSelect(sel) {
    if (DD.has(sel)) return;
    const wrap = document.createElement('div'); wrap.className = 'dd' + (/^(m-year|y-year)$/.test(sel.id) ? ' sm' : '');
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'dd-btn'; btn.setAttribute('aria-haspopup', 'listbox');
    btn.innerHTML = getLeadIco(sel.id) + '<span class="tx"></span>' + CARET;
    const menu = document.createElement('div'); menu.className = 'dd-menu'; menu.setAttribute('role', 'listbox');
    sel.parentNode.insertBefore(wrap, sel);
    wrap.append(sel, btn, menu);
    sel.classList.add('rj-native'); sel.tabIndex = -1;
    DD.set(sel, { wrap, btn, menu });
    btn.addEventListener('click', e => { e.stopPropagation(); wrap.classList.contains('open') ? wrap.classList.remove('open') : ddOpen(sel); });
    menu.addEventListener('click', e => { const o = e.target.closest('.dd-opt'); if (o) { e.stopPropagation(); ddPick(sel, +o.dataset.i); } });
    btn.addEventListener('keydown', e => {
        const open = wrap.classList.contains('open'), n = sel.options.length;
        if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            if (!open) return ddOpen(sel);
            const cur = menu.querySelector('.act') || menu.querySelector('.on'), items = [...menu.children].filter(el => el.classList.contains('dd-opt'));
            let i = cur ? items.indexOf(cur) : sel.selectedIndex;
            i = Math.min(items.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)));
            items.forEach(x => x.classList.remove('act'));
            if (items[i]) { items[i].classList.add('act'); items[i].scrollIntoView({ block: 'nearest' }); }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!open) return ddOpen(sel);
            const a = menu.querySelector('.act') || menu.querySelector('.on'); if (a) ddPick(sel, +a.dataset.i); else wrap.classList.remove('open');
        } else if (e.key === 'Escape' && open) { e.stopPropagation(); wrap.classList.remove('open'); }
        else if (e.key.length === 1) {
            const k = e.key.toLowerCase(), i = [...sel.options].findIndex((o, idx) => idx > sel.selectedIndex && o.text.toLowerCase().startsWith(k));
            if (i > -1) ddPick(sel, i);
        }
    });
    sel.addEventListener('change', () => ddRefresh(sel));
    ddRefresh(sel);
}

function enhanceAll() { document.querySelectorAll('select').forEach(enhanceSelect); }
function refreshAllDropdowns() { DD.forEach((_, sel) => ddRefresh(sel)); }
document.addEventListener('click', () => ddClose());
document.addEventListener('keydown', e => { if (e.key === 'Escape') ddClose(); });
window.addEventListener('scroll', () => { if (_anyDdOpen) ddClose(); }, { passive: true });

// =====================================================================
// INIT
// =====================================================================
function fillSelectors() {
    // keep whatever the user picked when the option lists are rebuilt after a cloud update
    const keep = ['m-model', 'r-model', 'r-month'].map(id => [id, $(id).value]);
    const years = [...new Set(S.dates.map(d => +d.slice(0, 4)).concat([new Date().getFullYear()]))].sort();
    $('m-month').innerHTML = MONTHS.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    $('m-year').innerHTML = $('y-year').innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    const models = [...new Set(MODELS.concat(S.entries.map(e => String(e.model))))];
    $('m-model').innerHTML = '<option value="">All models</option>' + models.map(m => `<option>${m}</option>`).join('');
    $('r-model').innerHTML = '<option value="">All models</option>' + models.map(m => `<option>${m}</option>`).join('');
    const curMonth = todayKey().slice(0, 7);
    const months = [...new Set(S.dates.map(d => d.slice(0, 7)).concat([curMonth]))].sort().reverse();
    $('r-month').innerHTML = '<option value="">All months</option>' + months.map(m => `<option value="${m}">${MONTHS[+m.slice(5) - 1]} ${m.slice(0, 4)}${m === curMonth ? ' (current)' : ''}</option>`).join('');
    keep.forEach(([id, v]) => {
        if (id === 'r-month' && !S.recMonthInit) return;   // first build: default to the running month
        if (v !== '' && [...$(id).options].some(o => o.value === v)) $(id).value = v;
        else if (v === '' && id === 'r-month') $(id).value = '';   // user explicitly chose "All months"
    });
    if (!S.recMonthInit) { S.recMonthInit = true; $('r-month').value = curMonth; }
    if (S.monthly.y != null) { $('m-month').value = S.monthly.m; $('m-year').value = S.monthly.y; }
    if (S.yearly.y != null) $('y-year').value = S.yearly.y;
    refreshAllDropdowns();   // option lists were rebuilt → redraw the premium menus
}
function wire() {
    document.querySelectorAll('.sb-item[data-page]').forEach(b => b.addEventListener('click', () => show(b.dataset.page)));
    // daily
    $('d-date').addEventListener('change', e => { S.daily.date = e.target.value; S.dirty.add('daily'); renderActive(); });
    document.querySelectorAll('[data-shift]').forEach(b => b.addEventListener('click', () => {
        const k = S.daily.date, i = S.dates.indexOf(k), n = +b.dataset.shift;
        S.daily.date = i > -1 ? (S.dates[i + n] || k) : (n < 0 ? S.dates.filter(x => x < k).pop() : S.dates.find(x => x > k)) || k;
        S.dirty.add('daily'); renderActive();
    }));
    $('d-latest').addEventListener('click', () => { S.daily.date = S.dates[S.dates.length - 1]; S.dirty.add('daily'); renderActive(); });
    // monthly
    const mUpd = () => { S.dirty.add('monthly'); renderActive(); };
    $('m-month').addEventListener('change', e => { S.monthly.m = +e.target.value; mUpd(); });
    $('m-year').addEventListener('change', e => { S.monthly.y = +e.target.value; mUpd(); });
    $('m-model').addEventListener('change', e => { S.monthly.model = e.target.value; mUpd(); });
    document.querySelectorAll('[data-mshift]').forEach(b => b.addEventListener('click', () => {
        let m = S.monthly.m + +b.dataset.mshift, y = S.monthly.y;
        if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
        S.monthly.m = m; S.monthly.y = y;
        if (![...$('m-year').options].some(o => +o.value === y)) $('m-year').insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`);
        mUpd();
    }));
    // yearly
    $('y-year').addEventListener('change', e => { S.yearly.y = +e.target.value; S.dirty.add('yearly'); renderActive(); });
    $('y-view').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; S.yearly.view = b.dataset.v; S.dirty.add('yearly'); renderActive(); });
    // records
    let rq;
    const rUpd = () => { S.dirty.add('records'); renderActive(); };
    $('r-month').addEventListener('change', rUpd); $('r-model').addEventListener('change', rUpd);
    $('r-q').addEventListener('input', () => { clearTimeout(rq); rq = setTimeout(rUpd, 180); });
    $('r-csv').addEventListener('click', exportCsv);
    $('r-table').addEventListener('click', onRowAction);
    // clock
    const tick = () => { $('clock').textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); };
    tick(); setInterval(tick, 15000);
}

(async function init() {
  try {
    buildEntryForm();
    wire();

    // 1. Instant Cache-First Load (0 ms wait on refresh)
    try {
        const cached = localStorage.getItem('mep_rej_seed');
        if (cached) S.seed = JSON.parse(cached) || [];
    } catch (e) {}

    rebuild();
    fillSelectors();
    enhanceAll();
    let start = 'daily'; try { start = localStorage.getItem('mep_rej_page') || 'daily'; } catch (e) {}
    if (!TITLES[start]) start = 'daily';
    show(start);
    loadChart();            // warm up chart engine in background

    // Clean up boot spinner if present
    const b = $('boot'); if (b) { if (typeof b.remove === 'function') b.remove(); else b.style.display = 'none'; }

    // 2. Fetch fresh seed in the background (non-blocking, keeps cache updated)
    fetch('rejection-seed.json').then(r => r.ok ? r.json() : []).then(fresh => {
        if (fresh && fresh.length) {
            const changed = !S.seed || S.seed.length !== fresh.length;
            S.seed = fresh;
            try { localStorage.setItem('mep_rej_seed', JSON.stringify(fresh)); } catch (e) {}
            if (changed) { rebuild(); fillSelectors(); renderActive(); }
        }
    }).catch(e => console.warn('Seed fetch:', e));

    initFirebase();
  } catch (err) {
    console.error('Rejection module init failed:', err);
    const b = $('boot'); if (b) { if (typeof b.remove === 'function') b.remove(); else b.style.display = 'none'; }
  }
})();
