// Global State
let currentData = [];
let currentCalendarView = 'weekly'; 
let globalTotalEvents = 0;
let globalActiveThreats = 0;

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const pageViews = document.querySelectorAll('.page-view');
const pageTitle = document.getElementById('page-title');
const tilesContainer = document.getElementById('tiles-container');
const btnWeekly = document.getElementById('btn-weekly');
const btnMonthly = document.getElementById('btn-monthly');
const logFileInput = document.getElementById('log-file-input');
const logsTableBody = document.getElementById('logs-table-body');
const detailDateTitle = document.getElementById('detail-date-title');
const btnBack = document.getElementById('btn-back');
const detailView = document.getElementById('detail-view');
const viewCalendar = document.getElementById('view-calendar');
const dashTotalEvents = document.getElementById('dash-total-events');
const dashActiveThreats = document.getElementById('dash-active-threats');

// Init
function init() {
    setupNav();
    setupCalendar();
    renderTiles();
    updateDashboardStats();
}

function updateDashboardStats() {
    dashTotalEvents.textContent = globalTotalEvents.toLocaleString();
    dashActiveThreats.textContent = globalActiveThreats.toLocaleString();
    
    if (globalTotalEvents > 0) {
        document.querySelectorAll('.stat-hint').forEach(el => {
            if (el.textContent.includes('bekleniyor') || el.textContent.includes('yapılmadı') || el.textContent.includes('bekliyor')) {
                el.textContent = "Güncel veri analizi";
                el.classList.remove('text-danger');
                el.classList.add('text-success');
            }
        });
    }
}

// Navigation Logic
function setupNav() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Update Active Tab
            navItems.forEach(nav => nav.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Hide all views
            pageViews.forEach(view => view.classList.add('hidden'));
            
            // Show target view
            const targetId = e.currentTarget.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
            
            // Update Title
            pageTitle.textContent = e.currentTarget.textContent.trim();
        });
    });

    // Upload Logic
    if (logFileInput) {
        logFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                
                reader.onload = function(evt) {
                    const content = evt.target.result;
                    parseLogFile(content, file.name);
                };
                
                reader.readAsText(file);
                e.target.value = ''; 
            }
        });
    }
}

// Simple Log Parser for Demo
function parseLogFile(content, fileName) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const newLogs = [];
    
    let criticals = 0;
    
    lines.forEach((line, index) => {
        // Basic parsing: look for IP and some keywords
        const ipMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
        const ip = ipMatch ? ipMatch[0] : 'Bilinmeyen IP';
        
        // Extract time (HH:MM) roughly
        const timeMatch = line.match(/(\d{2}:\d{2})/);
        const time = timeMatch ? timeMatch[0] : '12:00';
        
        let type = 'Genel Trafik';
        let severity = 'Düşük';
        
        // Use the raw log line as payload, strip out the date/host part if it looks like syslog
        let payload = line.substring(0, 150).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (line.includes(' sshd')) {
             const parts = line.split('sshd');
             if (parts.length > 1) {
                 payload = parts[1].substring(parts[1].indexOf(':') + 1).trim().substring(0, 100);
             }
        }
        
        // Very basic threat detection
        if (line.includes('403') || line.includes('401') || line.includes('404')) {
            severity = 'Orta';
            type = 'Tarama / Yetkisiz Erişim';
        }
        if (line.includes('Failed password') || line.includes('Invalid user') || line.includes('authentication failure')) {
            severity = 'Orta';
            type = 'SSH / Giriş Kaba Kuvvet (Brute-Force)';
        }
        if (line.includes('SQL') || line.includes('UNION') || line.includes("OR '1'='1") || line.includes('<script>')) {
            severity = 'Kritik';
            type = 'Web Saldırısı (XSS/SQLi)';
            criticals++;
        }
        if (line.includes('Nmap') || line.includes('Masscan') || line.includes('Nikto') || line.includes('DirBuster')) {
            severity = 'Kritik';
            type = 'Zafiyet / Port Taraması';
            criticals++;
        }

        newLogs.push({
            id: `upload-${Date.now()}-${index}`,
            time: time,
            type: type,
            payload: payload,
            count: 1,
            ip: ip,
            severity: severity
        });
    });

    if (newLogs.length > 0) {
        globalTotalEvents += newLogs.length;
        globalActiveThreats += criticals;
        updateDashboardStats();
        
        // Create a new day entry for the uploaded log
        const today = new Date();
        const newDayData = {
            dateObj: today,
            formattedDate: today.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            dayName: today.toLocaleDateString('tr-TR', { weekday: 'long' }),
            logs: newLogs.sort((a, b) => a.time.localeCompare(b.time)),
            totalEvents: newLogs.length,
            criticalCount: criticals
        };
        
        // Prepend to current data
        currentData.unshift(newDayData);
        renderTiles();
        
        alert(`"${fileName}" başarıyla işlendi! ${newLogs.length} satır bulundu. Takvim görünümünden yeni verileri inceleyebilirsiniz.`);
        
        // Automatically switch to calendar view
        document.querySelector('[data-target="view-calendar"]').click();
    } else {
        alert("Log dosyası boş veya desteklenmeyen bir formatta.");
    }
}

// Calendar Logic
function setupCalendar() {
    btnWeekly.addEventListener('click', () => {
        if (currentCalendarView !== 'weekly') {
            currentCalendarView = 'weekly';
            btnWeekly.classList.add('active');
            btnMonthly.classList.remove('active');
            renderTiles();
        }
    });

    btnMonthly.addEventListener('click', () => {
        if (currentCalendarView !== 'monthly') {
            currentCalendarView = 'monthly';
            btnMonthly.classList.add('active');
            btnWeekly.classList.remove('active');
            renderTiles();
        }
    });
    
    btnBack.addEventListener('click', () => {
        detailView.classList.add('hidden');
        viewCalendar.classList.remove('hidden');
    });

    // Make chart bars clickable (Note: Chart is still hardcoded in HTML for visual purpose, 
    // but clicks can just go to the latest day if available)
    const chartBars = document.querySelectorAll('.bar-container');
    chartBars.forEach((bar, index) => {
        bar.style.cursor = 'pointer';
        bar.addEventListener('click', () => {
            if (currentData && currentData.length > 0) {
                const targetDayIndex = index < currentData.length ? index : 0;
                
                pageViews.forEach(view => view.classList.add('hidden'));
                openDetailView(currentData[targetDayIndex]);
                
                navItems.forEach(nav => nav.classList.remove('active'));
                document.querySelector('[data-target="view-calendar"]').classList.add('active');
                pageTitle.textContent = "Takvim";
            } else {
                alert("Henüz log yüklenmediği için gösterilecek detay yok.");
            }
        });
    });
}

function getTopAttack(logs) {
    if (!logs.length) return 'Yok';
    const counts = {};
    let max = 0; let top = '';
    logs.forEach(log => {
        counts[log.type] = (counts[log.type] || 0) + 1;
        if (counts[log.type] > max) { max = counts[log.type]; top = log.type; }
    });
    return top;
}

function renderTiles() {
    tilesContainer.innerHTML = '';
    
    // Also render chart
    const trafficChart = document.getElementById('traffic-chart');
    if (trafficChart) {
        trafficChart.innerHTML = '';
        if (currentData.length === 0) {
            trafficChart.innerHTML = '<div style="margin: auto; color: var(--text-muted); font-size: 0.9rem;">Henüz veri yok</div>';
        } else {
            // Find max events to scale bars
            const maxEvents = Math.max(...currentData.map(d => d.totalEvents), 1);
            
            // Build last 7 days
            const today = new Date();
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dayName = d.toLocaleDateString('tr-TR', { weekday: 'long' });
                const formattedDate = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                
                const foundData = currentData.find(cd => cd.formattedDate === formattedDate);
                last7Days.push({ dayName, data: foundData });
            }
            
            last7Days.forEach(dayInfo => {
                const hasData = dayInfo.data != null;
                const percentage = hasData ? Math.max((dayInfo.data.totalEvents / maxEvents) * 100, 5) : 0;
                
                const barContainer = document.createElement('div');
                barContainer.className = 'bar-container';
                if (hasData) barContainer.style.cursor = 'pointer';
                
                let bgStyle = '';
                if (hasData && dayInfo.data.criticalCount > 0) bgStyle = 'background: var(--danger);';
                
                barContainer.innerHTML = `
                    <div class="bar" style="height: ${percentage}%; ${bgStyle}"></div>
                    <span class="chart-label" style="text-transform: capitalize;">${dayInfo.dayName.substring(0, 3)}</span>
                `;
                
                if (hasData) {
                    barContainer.addEventListener('click', () => {
                        pageViews.forEach(view => view.classList.add('hidden'));
                        openDetailView(dayInfo.data);
                        navItems.forEach(nav => nav.classList.remove('active'));
                        document.querySelector('[data-target="view-calendar"]').classList.add('active');
                        pageTitle.textContent = "Takvim";
                    });
                }
                
                trafficChart.appendChild(barContainer);
            });
        }
    }

    currentData.forEach((dayData, index) => {
        const delay = index * 0.03;
        const tile = document.createElement('div');
        tile.className = 'log-tile';
        tile.style.animation = `fadeInUp 0.4s ease forwards ${delay}s`;
        tile.style.opacity = '0';
        
        const criticalClass = dayData.criticalCount > 3 ? 'high' : (dayData.criticalCount > 0 ? 'medium' : 'low');
        
        tile.innerHTML = `
            <div class="tile-header">
                <span class="tile-date">${dayData.formattedDate}</span>
                <span class="tile-day">${dayData.dayName}</span>
            </div>
            <div class="tile-stats">
                <div class="stat-row"><span class="stat-label">Toplam Olay</span><span class="stat-value">${dayData.totalEvents.toLocaleString()}</span></div>
                <div class="stat-row"><span class="stat-label">Kritik Uyarılar</span><span class="stat-value ${criticalClass}">${dayData.criticalCount}</span></div>
            </div>
        `;
        tile.addEventListener('click', () => openDetailView(dayData));
        tilesContainer.appendChild(tile);
    });
}

function openDetailView(dayData) {
    detailDateTitle.textContent = `Log Detayları - ${dayData.formattedDate} (${dayData.dayName})`;
    
    // Generate Summary
    const summaryDiv = document.getElementById('detail-summary');
    if (summaryDiv) {
        summaryDiv.classList.remove('hidden');
        if (dayData.logs.length === 0) {
            summaryDiv.innerHTML = "<p>Bu tarihe ait herhangi bir olay veya saldırı logu bulunamadı.</p>";
        } else {
            const types = {};
            dayData.logs.forEach(l => { types[l.type] = (types[l.type] || 0) + 1; });
            const topType = Object.keys(types).sort((a,b) => types[b] - types[a])[0];
            
            summaryDiv.innerHTML = `
                <h3 style="color: var(--accent-primary); margin-bottom: 0.5rem; font-size: 1.1rem;">Günün Özeti</h3>
                <p>Bu gün içerisinde toplam <strong>${dayData.totalEvents}</strong> olay kaydedildi. 
                Sistem en çok <strong>${topType}</strong> türünde log algıladı. 
                Toplam <strong>${dayData.criticalCount}</strong> kritik tehdit engellendi. Aşağıdaki tabloda yakalanan payload (komut) ve hedef IP detaylarını inceleyebilirsiniz.</p>
            `;
        }
    }

    renderTable(dayData.logs);
    viewCalendar.classList.add('hidden');
    detailView.classList.remove('hidden');
}

function renderTable(logs) {
    logsTableBody.innerHTML = '';
    if (logs.length === 0) {
        logsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Bu güne ait log kaydı bulunamadı.</td></tr>';
        return;
    }
    
    logs.forEach(log => {
        const tr = document.createElement('tr');
        let badgeClass = 'badge-info';
        if (log.severity === 'Kritik') badgeClass = 'badge-critical';
        else if (log.severity === 'Orta') badgeClass = 'badge-warning';
        
        tr.innerHTML = `
            <td class="col-time">${log.time}</td>
            <td>${log.type}</td>
            <td><span class="payload-text">${log.payload}</span></td>
            <td>${log.count.toLocaleString()}</td>
            <td class="col-ip">${log.ip}</td>
            <td><span class="badge ${badgeClass}">${log.severity}</span></td>
        `;
        logsTableBody.appendChild(tr);
    });
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `@keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }`;
document.head.appendChild(style);

init();
