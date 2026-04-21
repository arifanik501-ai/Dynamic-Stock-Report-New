        let inventoryData = [];
        let currentReportType = 'initial'; // tracks: 'accessories', 'assemble', 'armature', 'initial'

        window.STORAGE_KEYS = {
            accessories: 'mep_report_accessories',
            armature: 'mep_report_armature'
        };

        const REPORT_CONFIG = {
            accessories: {
                title: 'FAN ACCESSORIES STOCK REPORT',
                sigName: 'Nafija',
                sigDesc: 'Jr. Engineer',
                headers: ['Opening', 'Production', 'Consumption', 'Closing'],
                themeIndex: 1,
                emoji: '📦'
            },
            armature: {
                title: 'FAN ARMATURE STOCK REPORT',
                sigName: 'Takbir Hossain',
                sigDesc: 'Asst. Engineer',
                headers: ['Opening', 'Production', 'Consumption', 'Closing'],
                themeIndex: 0,
                emoji: '⚙️'
            }
        };

        const themes = [
            { name: "Midnight Teal",   bg: '#0c1222', primary: '#164e63', accent: '#0891b2', text: '#cffafe', glow: 'rgba(8, 145, 178, 0.15)' },
            { name: "Forest Depth",    bg: '#0a1612', primary: '#1a4d2e', accent: '#4f6f52', text: '#f0fdf4', glow: 'rgba(79, 111, 82, 0.15)' },
            { name: "Espresso Night",  bg: '#151010', primary: '#43302b', accent: '#624a42', text: '#fffaf3', glow: 'rgba(98, 74, 66, 0.15)' },
            { name: "Deep Ocean",      bg: '#0a1020', primary: '#102a43', accent: '#243b53', text: '#f0f4f8', glow: 'rgba(36, 59, 83, 0.2)' },
            { name: "Carbon Steel",    bg: '#0f1218', primary: '#1e293b', accent: '#475569', text: '#f8fafc', glow: 'rgba(71, 85, 105, 0.15)' },
            { name: "Crimson Dark",    bg: '#150a0a', primary: '#7f1d1d', accent: '#991b1b', text: '#fef2f2', glow: 'rgba(153, 27, 27, 0.12)' }
        ];

        // ============ PAGE SWITCHING ============
        function switchPage(pageId) {
            // Hide all pages
            document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));

            // Show selected page
            document.getElementById('page-' + pageId).classList.add('active');

            // Activate tab
            const tabMap = {
                'generator': 'tab-generator',
                'archive-accessories': 'tab-accessories',
                'archive-armature': 'tab-armature'
            };
            document.getElementById(tabMap[pageId]).classList.add('active');

            // Animate glass slider to active tab
            moveSlider(tabMap[pageId]);

            // Show/hide controls panel
            const controlsPanel = document.getElementById('generator-controls');
            if (pageId === 'generator') {
                controlsPanel.style.display = 'flex';
            } else {
                controlsPanel.style.display = 'none';
            }

            // Render archive if needed
            if (pageId.startsWith('archive-')) {
                const type = pageId.replace('archive-', '');
                renderArchivePage(type);
            }
        }

        // ============ SAVE REPORT ============
        function saveCurrentReport(silent = false) {
            if (currentReportType === 'initial' || inventoryData.length === 0) {
                if (!silent) showToast("No report data to save!");
                return;
            }

            const reportDate = document.getElementById('display-date-text').innerText;
            const now = new Date();
            const savedAt = now.toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });

            const reportData = {
                type: currentReportType,
                data: JSON.parse(JSON.stringify(inventoryData)),
                reportDate: reportDate,
                savedAt: savedAt,
                savedTimestamp: now.getTime()
            };

            const key = window.STORAGE_KEYS[currentReportType];
            localStorage.setItem(key, JSON.stringify(reportData));

            // Sync to Firebase if available
            if (window.firebaseSet && window.firebaseRef && window.firebaseDB) {
                window.firebaseSet(window.firebaseRef(window.firebaseDB, 'inventory_reports/' + currentReportType), reportData)
                    .catch(e => console.error("Firebase sync failed:", e));
            }

            // Animate save button
            const btn = document.getElementById('btn-save-report');
            btn.classList.add('save-pulse');
            setTimeout(() => btn.classList.remove('save-pulse'), 700);

            // Update badge
            updateBadges();

            const config = REPORT_CONFIG[currentReportType];
            if (!silent) showToast(`${config.emoji} ${config.title} — Saved!`);
        }

        // ============ RENDER ARCHIVE PAGE ============
        function renderArchivePage(type) {
            const container = document.getElementById('archive-content-' + type);
            const key = window.STORAGE_KEYS[type];
            const stored = localStorage.getItem(key);
            const config = REPORT_CONFIG[type];

            if (!stored) {
                container.innerHTML = `
                    <div class="archive-empty">
                        <svg class="archive-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                        </svg>
                        <div class="archive-empty-title">No Saved Report Yet</div>
                        <div class="archive-empty-desc">Generate a "${config.title}" from the Report Generator and click the Save button.</div>
                    </div>
                `;
                return;
            }

            const report = JSON.parse(stored);
            const headers = config.headers;

            let tableRows = '';
            report.data.forEach((item, idx) => {
                const closing = item.opening + item.production - item.consumption;
                tableRows += `
                    <tr style="animation: rowFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(idx, 10) * 0.05}s backwards;">
                        <td>${item.name}</td>
                        <td>${item.opening.toLocaleString()}</td>
                        <td style="color: var(--accent-theme); font-weight: 900;">${item.production.toLocaleString()}</td>
                        <td style="color: #f43f5e; font-weight: 900;">${item.consumption.toLocaleString()}</td>
                        <td style="font-weight: 900; background: rgba(255, 255, 255, 0.03);">${closing.toLocaleString()}</td>
                    </tr>
                `;
            });

            container.innerHTML = `
                <div class="archive-card">
                    <div class="archive-card-header">
                        <div class="report-name">${config.emoji} ${config.title}</div>
                        <div class="archive-meta">
                            <div class="archive-meta-item">
                                <span class="archive-meta-label">Report Date</span>
                                <span class="archive-meta-value">${report.reportDate}</span>
                            </div>
                            <div class="archive-meta-item">
                                <span class="archive-meta-label">Saved At</span>
                                <span class="archive-meta-value">${report.savedAt}</span>
                            </div>
                        </div>
                    </div>
                    <div class="archive-card-body">
                        <table class="archive-table">
                            <thead>
                                <tr>
                                    <th style="width: 30%;">Item Names</th>
                                    <th>${headers[0]}</th>
                                    <th>${headers[1]}</th>
                                    <th>${headers[2]}</th>
                                    <th>${headers[3]}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                    <div class="archive-footer">
                        <div class="archive-sig-block">
                            <div class="archive-sig-item">
                                <div class="archive-sig-label">Reported By</div>
                                <div class="archive-sig-name">${config.sigName}</div>
                                <div class="archive-sig-desc">${config.sigDesc}</div>
                            </div>
                            <div class="archive-sig-item">
                                <div class="archive-sig-label">Authorized By</div>
                                <div class="archive-sig-name">Arif Ahmed Anik</div>
                                <div class="archive-sig-desc">Incharge</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="deleteArchive('${type}')" class="btn-util archive-action-btn archive-delete-btn" title="Delete" style="width: 38px; height: 38px; border-radius: 10px;">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                            <button onclick="loadToGenerator('${type}')" class="btn-util archive-action-btn" title="Load" style="width: auto; padding: 8px 16px; border-radius: 10px; gap: 6px; display: flex; font-size: 9px; font-weight: 800; letter-spacing: 0.1em;">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                LOAD
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // ============ DELETE ARCHIVE ============
        function deleteArchive(type) {
            if (!confirm(`Are you sure you want to delete the saved ${REPORT_CONFIG[type].title}?`)) return;
            localStorage.removeItem(window.STORAGE_KEYS[type]);
            
            // Delete from Firebase if available
            if (window.firebaseSet && window.firebaseRef && window.firebaseDB) {
                window.firebaseSet(window.firebaseRef(window.firebaseDB, 'inventory_reports/' + type), null)
                    .catch(e => console.error("Firebase delete failed:", e));
            }

            renderArchivePage(type);
            updateBadges();
            showToast("Archive Deleted");
        }

        // ============ LOAD TO GENERATOR ============
        function loadToGenerator(type) {
            const stored = localStorage.getItem(window.STORAGE_KEYS[type]);
            if (!stored) return;

            const report = JSON.parse(stored);
            inventoryData = report.data;
            currentReportType = type;
            renderTable();
            updateReportBranding(type);
            switchPage('generator');
            showToast(`${REPORT_CONFIG[type].emoji} Loaded to Generator`);
        }

        // ============ UPDATE BADGES ============
        function updateBadges() {
            ['accessories', 'armature'].forEach(type => {
                const badge = document.getElementById('badge-' + type);
                const stored = localStorage.getItem(window.STORAGE_KEYS[type]);
                if (stored) {
                    const report = JSON.parse(stored);
                    badge.textContent = report.savedAt;
                    badge.classList.remove('empty');
                } else {
                    badge.textContent = 'EMPTY';
                    badge.classList.add('empty');
                }
            });
        }

        // ============ CORE FUNCTIONS ============

        function applyTheme(theme) {
            if (!theme) return;
            const root = document.documentElement;
            root.style.setProperty('--bg-retro', theme.bg);
            root.style.setProperty('--primary-theme', theme.primary);
            root.style.setProperty('--accent-theme', theme.accent);
            root.style.setProperty('--text-on-primary', theme.text);
            if (theme.glow) root.style.setProperty('--glow-color', theme.glow);

            // Animate background orbs with new theme
            const orbs = document.querySelectorAll('.bg-orb');
            orbs[0].style.background = `radial-gradient(circle, ${theme.accent}40, transparent 70%)`;
            orbs[1].style.background = `radial-gradient(circle, ${theme.primary}50, transparent 70%)`;
            orbs[2].style.background = `radial-gradient(circle, ${theme.accent}25, transparent 70%)`;
        }

        function randomizeTheme() {
            if (document.body.classList.contains('lite-mode')) {
                toggleLiteMode(); // Turn off lite mode when randomizing dark themes
            }
            const random = themes[Math.floor(Math.random() * themes.length)];
            applyTheme(random);
            showToast(`${random.name} Theme Applied`);
        }

        function toggleLiteMode() {
            document.body.classList.toggle('lite-mode');
            if (document.body.classList.contains('lite-mode')) {
                showToast("Lite Mode Enabled");
            } else {
                showToast("Dark Mode Restored");
            }
        }


        function refreshData() {
            inventoryData = [];
            currentReportType = 'initial';
            renderTable();
            updateReportBranding('initial');
            showToast("Data Purged");
        }

        function toggleModal(show) {
            const modal = document.getElementById('import-modal');
            if (show) {
                modal.classList.remove('hidden');
                document.getElementById('paste-area').value = "";
                setTimeout(() => document.getElementById('paste-area').focus(), 100);
            } else {
                modal.classList.add('hidden');
            }
        }

        function updateFormattedDate(val) {
            if (!val) return;
            const date = new Date(val);
            
            // Day number
            const day = date.getDate();
            const dayEl = document.getElementById('display-date-day');
            if (dayEl) dayEl.innerText = day;
            
            // Month + Year
            const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
            const myEl = document.getElementById('display-date-monthyear');
            if (myEl) myEl.innerText = monthYear;
            
            // Weekday
            const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
            const wdEl = document.getElementById('display-date-weekday');
            if (wdEl) wdEl.innerText = weekday;
            
            // Hidden full text (used by save/archive)
            const opt = { month: 'short', day: 'numeric', year: 'numeric', weekday: 'long' };
            const formatted = date.toLocaleDateString('en-US', opt).replace(',', ' \u2022');
            document.getElementById('display-date-text').innerText = formatted;
        }

        function setReportTitle(title, sub) {
            const box = document.getElementById('report-title-box');
            const textEl = box.querySelector('.report-title-text');
            const subEl = box.querySelector('.report-title-sub');
            if (textEl) textEl.innerText = title;
            if (subEl) subEl.innerText = sub;
        }

        function updateReportBranding(type) {
            const sig = document.getElementById('reported-by-sig');
            const nameLine = document.getElementById('reported-by-name');
            const descLine = document.getElementById('reported-by-desc');
            
            const h2 = document.getElementById('header-2');
            const h3 = document.getElementById('header-3');
            const h4 = document.getElementById('header-4');
            const h5 = document.getElementById('header-5');

            if (type === 'armature') {
                setReportTitle('Fan Armature Stock Report', 'MEP FAN LTD • Armature Division');
                sig.innerText = "Takbir Hossain";
                nameLine.innerText = "Takbir Hossain";
                descLine.innerText = "Asst. Engineer";
                applyTheme(themes[0]);
                h2.innerText = "Opening";
                h3.innerText = "Production";
                h4.innerText = "Consumption";
                h5.innerText = "Closing";
            } else if (type === 'accessories') {
                setReportTitle('Fan Accessories Stock Report', 'MEP FAN LTD • Accessories Division');
                sig.innerText = "Nafija";
                nameLine.innerText = "Nafija";
                descLine.innerText = "Jr. Engineer";
                applyTheme(themes[1]);
                h2.innerText = "Opening";
                h3.innerText = "Production";
                h4.innerText = "Consumption";
                h5.innerText = "Closing";
            } else {
                setReportTitle('Awaiting Report Type...', 'MEP FAN LTD • Inventory Ledger');
                sig.innerText = "...";
                nameLine.innerText = "...";
                descLine.innerText = "...";
                applyTheme(themes[0]);
            }

            currentReportType = type;
        }

        function processPastedData() {
            const text = document.getElementById('paste-area').value.trim();
            if (!text) {
                showToast("Please paste some data");
                return;
            }
            
            const lines = text.split('\n');
            let newItems = [];
            let reportType = 'accessories';
            
            lines.forEach((line) => {
                const parts = line.split(/\t| {2,}/).map(p => p.trim()).filter(p => p !== "");
                if (parts.length >= 4) {
                    const numericParts = parts.filter(p => !isNaN(p.replace(/,/g, '')) && p !== "");
                    const namePart = parts[0];
                    
                    if (namePart) {
                        const lowName = namePart.toLowerCase();
                        if (lowName.includes('armature')) reportType = 'armature';
                    }

                    if (numericParts.length >= 3) {
                        newItems.push({
                            name: namePart,
                            opening: parseFloat(numericParts[0].replace(/,/g, '')) || 0,
                            production: parseFloat(numericParts[1].replace(/,/g, '')) || 0,
                            consumption: parseFloat(numericParts[2].replace(/,/g, '')) || 0
                        });
                    }
                }
            });

            if (newItems.length > 0) {
                inventoryData = newItems;
                renderTable();
                updateReportBranding(reportType);
                toggleModal(false);
                showToast(`Sync Success: ${newItems.length} Items`);
                
                // Immediately save state locally and to Firebase
                saveCurrentReport(true);
            } else {
                showToast("Data Format Mismatch");
            }
        }

        function showToast(msg) {
            const t = document.getElementById('toast');
            document.getElementById('toast-message').innerText = msg.toUpperCase();
            t.classList.add('show');
            clearTimeout(t._timeout);
            t._timeout = setTimeout(() => {
                t.classList.remove('show');
            }, 3500);
        }

        function renderTable() {
            const container = document.getElementById('inventory-body');
            container.innerHTML = '';
            
            if (inventoryData.length === 0) {
                container.innerHTML = `<tr><td colspan="5" style="padding: 80px 20px; text-align: center; color: #94a3b8; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.15em; background: rgba(255,255,255,0.4);">
                    <div style="margin-bottom: 8px; opacity: 0.4;">
                        <svg style="width: 32px; height: 32px; margin: 0 auto; display: block;" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                    </div>
                    Awaiting External Data...
                </td></tr>`;
                return;
            }

            inventoryData.forEach((item, index) => {
                const closing = item.opening + item.production - item.consumption;
                const row = document.createElement('tr');
                row.style.animationDelay = `${Math.min(index, 10) * 0.04}s`;
                
                row.innerHTML = `
                    <td class="text-pivot-body uppercase bg-white/70">
                        <span class="lifted-text">${item.name}</span>
                    </td>
                    <td>
                        <div class="static-data-box"><span class="text-gray-600">${item.opening.toLocaleString()}</span></div>
                    </td>
                    <td>
                        <div class="static-data-box"><span style="color: var(--primary-theme)">${item.production.toLocaleString()}</span></div>
                    </td>
                    <td>
                        <div class="static-data-box"><span class="text-rose-600">${item.consumption.toLocaleString()}</span></div>
                    </td>
                    <td style="border-left: 3px solid var(--primary-theme); background: rgba(8, 145, 178, 0.04)">
                        <div class="text-pivot-body font-black tabular-nums" style="text-align: center; padding: 8px 0; display: block;">${closing.toLocaleString()}</div>
                    </td>
                `;
                container.appendChild(row);
            });
        }

        async function takeScreenshot(silentDownload = false) {
            const sheet = document.getElementById('report-page');
            
            if (silentDownload) {
                showToast("Syncing Snapshot to Cloud Storage...");
            } else {
                showToast("Generating Ultra-HD Capture...");
            }

            // Save originals
            const originalShadow = sheet.style.boxShadow;
            const originalBorderRadius = sheet.style.borderRadius;
            const originalAnimation = sheet.style.animation;
            const originalOverflow = sheet.style.overflow;

            // Fix: disable background-clip:text on .text-huge (html2canvas renders it invisible)
            const hugeTitle = sheet.querySelector('.text-huge');
            let origTitleStyles = {};
            if (hugeTitle) {
                origTitleStyles = {
                    background: hugeTitle.style.background,
                    webkitBackgroundClip: hugeTitle.style.webkitBackgroundClip,
                    webkitTextFillColor: hugeTitle.style.webkitTextFillColor,
                    backgroundClip: hugeTitle.style.backgroundClip,
                    color: hugeTitle.style.color
                };
                hugeTitle.style.background = 'none';
                hugeTitle.style.webkitBackgroundClip = 'unset';
                hugeTitle.style.webkitTextFillColor = 'unset';
                hugeTitle.style.backgroundClip = 'unset';
                hugeTitle.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-theme');
            }

            // Disable mobile overrides temporarily
            document.body.classList.remove('mobile-active');

            // Prepare sheet for capture
            sheet.style.boxShadow = 'none';
            sheet.style.borderRadius = '0';
            sheet.style.animation = 'none';
            sheet.style.overflow = 'visible';

            // Add a class to hide pseudo-elements during capture
            sheet.classList.add('capturing');

            // Inject a temporary style to neutralize pseudo-elements & animations inside the sheet
            const captureStyle = document.createElement('style');
            captureStyle.id = 'capture-fix-style';
            captureStyle.textContent = `
                .capturing .corner::before, .capturing .corner::after { display: block !important; }
                .capturing .pivot-table th::after { display: none !important; }
                .capturing .report-type-box::before { display: none !important; }
                .capturing .pivot-table tbody tr { animation: none !important; }
            `;
            document.head.appendChild(captureStyle);

            // Small delay to let styles apply
            await new Promise(r => setTimeout(r, 100));

            try {
                const canvasImg = await html2canvas(sheet, {
                    scale: 4,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    allowTaint: true,
                    removeContainer: true,
                });
                const dataUrl = canvasImg.toDataURL('image/jpeg', 1.0);
                const link = document.createElement('a');
                link.download = `MEP-Ledger-${new Date().toISOString().split('T')[0]}.jpg`;
                link.href = dataUrl;
                
                if (!silentDownload) {
                    link.click();
                }

                // Upload to Firebase Storage
                if (window.firebaseStorageSet && window.firebaseStorageRef && window.firebaseStorage) {
                    const filename = `mep_reports/${currentReportType}/MEP-Ledger-${new Date().toISOString().split('T')[0]}_${Date.now()}.jpg`;
                    const imgRef = window.firebaseStorageRef(window.firebaseStorage, filename);
                    window.firebaseStorageSet(imgRef, dataUrl, 'data_url')
                        .then(() => console.log("Screenshot synced to Cloud Storage"))
                        .catch(e => console.error("Cloud Storage sync failed:", e));
                }

                // Auto-save data to archive silently
                saveCurrentReport(true);
                
                if (silentDownload) {
                    showToast("Snapshot Synced to Cloud Storage");
                } else {
                    showToast("Exported & Synced to Cloud");
                }
            } catch (err) {
                console.error('Screenshot error:', err);
                showToast("Capture Failed: " + (err.message || "Unknown error"));
            } finally {
                // Restore everything
                sheet.style.boxShadow = originalShadow;
                sheet.style.borderRadius = originalBorderRadius;
                sheet.style.animation = originalAnimation;
                sheet.style.overflow = originalOverflow;
                sheet.classList.remove('capturing');

                // Remove temp style
                const tempStyle = document.getElementById('capture-fix-style');
                if (tempStyle) tempStyle.remove();

                // Restore title gradient
                if (hugeTitle) {
                    hugeTitle.style.background = origTitleStyles.background;
                    hugeTitle.style.webkitBackgroundClip = origTitleStyles.webkitBackgroundClip;
                    hugeTitle.style.webkitTextFillColor = origTitleStyles.webkitTextFillColor;
                    hugeTitle.style.backgroundClip = origTitleStyles.backgroundClip;
                    hugeTitle.style.color = origTitleStyles.color;
                }

                // Restore mobile overrides
                document.body.classList.add('mobile-active');
            }
        }

        // ============ LIQUID GRAVITY SLIDER ============
        function moveSlider(tabId, instant = false) {
            const slider = document.getElementById('tab-slider');
            const activeTab = document.getElementById(tabId);
            const nav = document.getElementById('tab-nav');
            if (!slider || !activeTab || !nav) return;

            const navRect = nav.getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();
            const offsetX = tabRect.left - navRect.left - 5; // subtract nav padding

            if (instant) {
                slider.style.transition = 'none';
                slider.style.width = tabRect.width + 'px';
                slider.style.transform = `translateX(${offsetX}px)`;
                slider.style.opacity = '1';
                return;
            }

            // Current state before moving
            const currentWidth = parseFloat(slider.style.width) || tabRect.width;
            let currentX = offsetX;
            if (slider.style.transform) {
                const parsed = parseFloat(slider.style.transform.replace(/[^-0-9.]/g, ''));
                if (!isNaN(parsed)) currentX = parsed;
            }

            const distance = Math.abs(offsetX - currentX);
            if (distance < 2) {
                // Ensure width is always corrected even if already near position
                slider.style.width = tabRect.width + 'px';
                slider.style.transform = `translateX(${offsetX}px)`;
                return;
            }

            // Liquid Squish Effect
            const minX = Math.min(currentX, offsetX);
            const maxX = Math.max(currentX + currentWidth, offsetX + tabRect.width);
            const stretchedWidth = maxX - minX;

            // Phase 1: Accelerate & Stretch
            slider.style.transition = 'width 0.25s cubic-bezier(0.25, 1, 0.4, 1), transform 0.25s cubic-bezier(0.25, 1, 0.4, 1)';
            slider.style.width = stretchedWidth + 'px';
            slider.style.transform = `translateX(${minX}px)`;

            // Phase 2: Elastic Snap
            clearTimeout(slider._liquidTimeout);
            slider._liquidTimeout = setTimeout(() => {
                slider.style.transition = 'width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
                slider.style.width = tabRect.width + 'px';
                slider.style.transform = `translateX(${offsetX}px)`;
            }, 80);

            slider.style.opacity = '1';
        }

        // ============ INIT ============
        window.onload = () => {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const picker = document.getElementById('statement-date-picker');
            if(picker) picker.value = dateStr;
            updateFormattedDate(dateStr);
            applyTheme(themes[0]);
            renderTable();
            updateReportBranding('initial');
            updateBadges();

            // Setup Clock
            const clockEl = document.getElementById('digital-clock');
            if (clockEl) {
                clockEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: true });
                setInterval(() => {
                    clockEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: true });
                }, 1000);
            }

            // Initialize slider position safely after fonts layout
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    moveSlider('tab-generator', true);
                });
            } else {
                setTimeout(() => moveSlider('tab-generator', true), 250);
            }
        };

        // Recalculate slider on resize instantly
        window.addEventListener('resize', () => {
            const active = document.querySelector('.tab-btn.active');
            if (active) moveSlider(active.id, true);
        });
    
    // --- Firebase Realtime Sync Module ---
        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
        import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
        import { getStorage, ref as storageRef, uploadString } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js";

        const firebaseConfig = {
            apiKey: "AIzaSyBcjbR7Qu7M-RnHUtLJ9zeehILqQHYLw4E",
            authDomain: "whatsapp-c10ef.firebaseapp.com",
            databaseURL: "https://whatsapp-c10ef-default-rtdb.firebaseio.com",
            projectId: "whatsapp-c10ef",
            storageBucket: "whatsapp-c10ef.firebasestorage.app",
            messagingSenderId: "675053106773",
            appId: "1:675053106773:web:b7078468691a07ecfec6dc",
            measurementId: "G-89Z8WBJ3R0"
        };

        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const database = getDatabase(app);
        const storage = getStorage(app);

        // Expose Database
        window.firebaseDB = database;
        window.firebaseRef = ref;
        window.firebaseSet = set;

        // Expose Storage
        window.firebaseStorage = storage;
        window.firebaseStorageRef = storageRef;
        window.firebaseStorageSet = uploadString;

        // Start Realtime Sync (Firebase -> Local Storage)
        const reportsRef = ref(database, 'inventory_reports');
        onValue(reportsRef, (snapshot) => {
            const data = snapshot.val() || {};
            let localChanged = false;

            // Wait until the main script defines STORAGE_KEYS
            if (!window.STORAGE_KEYS) return;

            ['accessories', 'armature'].forEach(type => {
                const key = window.STORAGE_KEYS[type];
                const remoteData = data[type];
                
                if (remoteData) {
                    const localDataStr = localStorage.getItem(key);
                    const remoteDataStr = JSON.stringify(remoteData);
                    
                    if (localDataStr !== remoteDataStr) {
                        localStorage.setItem(key, remoteDataStr);
                        localChanged = true;
                    }
                } else {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                        localChanged = true;
                    }
                }
            });

            if (localChanged) {
                if (typeof window.updateBadges === 'function') {
                    window.updateBadges();
                }
                const activeTab = document.querySelector('.page-content.active');
                if (activeTab && activeTab.id.startsWith('page-archive-')) {
                    const openType = activeTab.id.replace('page-archive-', '');
                    if (typeof window.renderArchivePage === 'function') {
                        window.renderArchivePage(openType);
                    }
                }
            }
        });
// Expose UI functions globally for module execution
window.switchPage = switchPage;
window.saveCurrentReport = saveCurrentReport;
window.renderArchivePage = renderArchivePage;
window.deleteArchive = deleteArchive;
window.loadToGenerator = loadToGenerator;
window.applyTheme = applyTheme;
window.randomizeTheme = randomizeTheme;
window.toggleLiteMode = toggleLiteMode;
window.refreshData = refreshData;
window.toggleModal = toggleModal;
window.processPastedData = processPastedData;
window.takeScreenshot = takeScreenshot;
window.updateBadges = updateBadges;
window.moveSlider = moveSlider;
