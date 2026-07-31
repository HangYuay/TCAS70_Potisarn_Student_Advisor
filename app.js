// ============================================================
// TCAS70 PS Student Advisor - Main Application
// ============================================================

// ---- Storage Keys ----
const STORAGE_KEY = 'tcas70_ps_student_data';

// ---- App State ----
let state = {
  currentPage: 'dashboard',
  studentData: loadData(),
  searchQuery: '',
  selectedCategory: 'all',
  selectedUniversity: 'all',
  wishlist: JSON.parse(localStorage.getItem('tcas70_wishlist') || '[]'),
  modalProgramId: null,
  calendarView: 'timeline',
  calendarYear: 2026,
  calendarMonth: 10,  // 0-indexed: 10 = November
  recommendRound: 'all',   // 'all'|'round1'|'round2'|'round3'|'round4'
  prefSearchQuery: '',     // search query inside preferences modal
  plannerTargetId: null,   // program id currently shown in Planner's score-gap section (null = use rank #1)
  plannerPortfolioTargetId: null,  // program id currently shown in Planner's Portfolio-readiness section
  plannerExpandedEvents: new Set(),  // event ids with the detail/attachment panel open (not persisted)
  studyLogWeekStart: null,   // ISO date (Monday) of the week currently shown in ตารางอ่านหนังสือ
  studyLogAddingCell: null,  // "date|block" key of the cell currently showing its inline add-form
  studyLogEditingId: null,   // id of the study-log entry currently showing its inline edit-form
  mockTestDraft: null,       // in-progress mock-test session being composed/edited (not saved until "บันทึก")
  mockTestFormMode: null,    // null | 'new' | <entryId being edited>
  mistakeLogDraft: null,     // in-progress mistake-log entry being composed/edited
  mistakeLogFormMode: null,  // null | 'new' | <entryId being edited>
  mistakeLogSubjectFilter: 'all'  // 'all' | subjectKey
};

// ---- Default Student Data ----
function defaultData() {
  return {
    profile: {
      firstName: '',
      lastName: '',
      studentId: '',
      classRoom: '',
      schoolYear: '2569',
      phone: '',
      email: '',
      lineId: '',
      target: ''
    },
    gpa: {
      m401: '', m402: '', m411: '', m412: '',
      m421: '', m422: '', cumulative: ''
    },
    scores: {
      // TGAT
      tgat1: '', tgat2: '', tgat3: '',
      // TPAT
      tpat1: '', tpat2: '', tpat3: '', tpat4: '', tpat5: '',
      // A-Level
      amath1: '', amath2: '', ascience: '', asocial: '',
      athai: '', aeng: '', aphy: '', achem: '', abio: '',
      ahist: '', afre: '', ager: '', ajpn: '', achn: '', akor: ''
    },
    portfolio: {
      camps: [],
      activities: [],
      awards: [],
      competitions: [],
      volunteer: []
    },
    mockTests: [],   // [{ id, date, source, scores: {subjectKey: value}, files: [{name, dataUrl}] }]
    mistakeLog: [],  // [{ id, date, subject, topic, reason, correctAnswer, files: [{name, dataUrl}] }]
    interests: [],
    preferences: [],   // 10 อันดับคณะที่สนใจ (array of program IDs, ordered)
    planner: {
      roundPlans: { round1: [], round2: [], round3: [], round4: [] },  // { roundKey: [programId, ...] }
      completedEvents: {},   // { eventId: true }
      eventNotes: {},        // { eventId: { note: '', files: [{name, dataUrl}] } }
      selfNote: '',
      studyLog: []   // [{ id, date: 'YYYY-MM-DD', subject, topic, done }]
    },
    updatedAt: null
  };
}

// ---- Load / Save ----
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      return deepMerge(defaultData(), saved);
    }
  } catch (e) {}
  return defaultData();
}

function saveData() {
  state.studentData.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.studentData));
}

// ---- Auto-save (debounced) ----
let _autoSaveTimer = null;
function debounceSave(delay = 1000) {
  clearTimeout(_autoSaveTimer);
  _autoSaveTimer = setTimeout(() => {
    saveData();
    _showAutoSaveIndicator();
  }, delay);
}

function _showAutoSaveIndicator() {
  let ind = document.getElementById('autosave-indicator');
  if (!ind) return;
  ind.classList.add('visible');
  clearTimeout(ind._hideTimer);
  ind._hideTimer = setTimeout(() => ind.classList.remove('visible'), 2000);
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

// ============================================================
// NAVIGATION
// ============================================================
function navigate(page) {
  state.currentPage = page;
  // Sync sidebar nav items
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  // Sync mobile bottom nav items
  document.querySelectorAll('.mobile-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.querySelectorAll('.page-section').forEach(el => {
    el.classList.toggle('hidden', el.id !== `page-${page}`);
  });
  renderPage(page);
  // Close mobile sidebar if open
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Mobile Sidebar Controls ----
function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('mobile-open');
  if (isOpen) {
    closeMobileSidebar();
  } else {
    sidebar.classList.add('mobile-open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const overlay = document.getElementById('mobile-sidebar-overlay');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function renderPage(page) {
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'profile': renderProfile(); break;
    case 'scores': renderScores(); break;
    case 'portfolio': renderPortfolio(); break;
    case 'university': renderUniversitySearch(); break;
    case 'guide': renderGuide(); break;
    case 'recommend': renderRecommendations(); break;
    case 'calendar': renderCalendar(); break;
    case 'planner': renderPlanner(); break;
    case 'studylog': renderStudyLog(); break;
    case 'mocktest': renderMockTestPage(); break;
    case 'mistakelog': renderMistakeLogPage(); break;
  }
}

// ============================================================
// HEADER STUDENT CHIP
// ============================================================
function updateHeaderChip() {
  const p = state.studentData.profile;
  const name = p.firstName ? `${p.firstName} ${p.lastName}`.trim() : 'นักเรียน';
  const el = document.getElementById('student-chip-name');
  if (el) el.textContent = name;
}

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const p = state.studentData.profile;
  const gpa = state.studentData.gpa;
  const scores = state.studentData.scores;
  const portfolio = state.studentData.portfolio;

  const name = p.firstName ? `${p.firstName}` : 'นักเรียน';
  const cumGPA = parseFloat(gpa.cumulative) || 0;

  const tgat1 = parseFloat(scores.tgat1) || 0;
  const tgat2 = parseFloat(scores.tgat2) || 0;
  const tgat3 = parseFloat(scores.tgat3) || 0;
  const tgatTotal = tgat1 + tgat2 + tgat3;

  const totalItems = (portfolio.camps?.length || 0) +
    (portfolio.activities?.length || 0) +
    (portfolio.awards?.length || 0) +
    (portfolio.competitions?.length || 0) +
    (portfolio.volunteer?.length || 0);
  const nationalAwards = (portfolio.awards || [])
    .filter(a => a.level === 'national' || a.level === 'international').length;

  const container = document.getElementById('dashboard-content');
  if (!container) return;

  container.innerHTML = `
    <!-- Welcome Banner -->
    <div class="welcome-banner">
      <div class="welcome-title">สวัสดี, ${name}! 👋</div>
      <div class="welcome-sub">ระบบแนะแนวการศึกษาต่อระดับอุดมศึกษา ปีการศึกษา 2570</div>
      <div class="welcome-actions">
        <button class="btn btn-white btn-sm" onclick="navigate('recommend')">🎯 ดูคณะที่เหมาะกับคุณ</button>
        <button class="btn btn-white-outline btn-sm" onclick="navigate('university')">🔍 ค้นหาคณะ/มหาวิทยาลัย</button>
        <button class="btn btn-white-outline btn-sm" onclick="navigate('guide')">📋 เกณฑ์ TCAS70</button>
      </div>
    </div>

    <!-- KPI Cards Row -->
    <div class="dash-kpi-row">
      ${renderKPICard('📊', 'เกรดเฉลี่ยสะสม', cumGPA > 0 ? cumGPA.toFixed(2) : '—', 'จาก 4.00', cumGPA / 4, 'var(--primary)', 'scores')}
      ${renderKPICard('🧠', 'TGAT รวม', tgatTotal > 0 ? tgatTotal : '—', 'จาก 300', tgatTotal / 300, '#6366F1', 'scores')}
      ${renderKPICard('🏆', 'ผลงาน/กิจกรรม', totalItems, 'รายการ', Math.min(totalItems / 20, 1), 'var(--accent)', 'portfolio')}
      ${renderKPICard('🥇', 'รางวัลระดับชาติ+', nationalAwards, 'รางวัล', Math.min(nationalAwards / 5, 1), 'var(--success)', 'portfolio')}
    </div>

    <!-- Main infographic grid -->
    <div class="dash-infographic-grid">

      <!-- Left column: GPA Chart + Score Bars -->
      <div class="dash-col-left">

        <!-- GPA Bar Chart -->
        <div class="card dash-chart-card">
          <div class="dash-chart-header">
            <span class="dash-chart-icon">📊</span>
            <div>
              <div class="dash-chart-title">เกรดเฉลี่ยแต่ละเทอม (GPAX)</div>
              <div class="dash-chart-sub">ม.4 – ม.6</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigate('scores')" style="margin-left:auto;font-size:0.75rem">แก้ไข →</button>
          </div>
          ${renderGPABarChart(gpa)}
        </div>

        <!-- TGAT Score Chart -->
        <div class="card dash-chart-card">
          <div class="dash-chart-header">
            <span class="dash-chart-icon">🧠</span>
            <div>
              <div class="dash-chart-title">คะแนน TGAT</div>
              <div class="dash-chart-sub">Thai General Aptitude Test</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigate('scores')" style="margin-left:auto;font-size:0.75rem">แก้ไข →</button>
          </div>
          ${renderTGATChart(scores)}
        </div>

      </div>

      <!-- Right column: Portfolio Donut + Recommendations -->
      <div class="dash-col-right">

        <!-- Portfolio Donut -->
        <div class="card dash-chart-card">
          <div class="dash-chart-header">
            <span class="dash-chart-icon">🏆</span>
            <div>
              <div class="dash-chart-title">ผลงาน & กิจกรรม</div>
              <div class="dash-chart-sub">Portfolio Summary</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigate('portfolio')" style="margin-left:auto;font-size:0.75rem">แก้ไข →</button>
          </div>
          ${renderPortfolioDonut(portfolio)}
        </div>

        <!-- A-Level Radar/Bars -->
        <div class="card dash-chart-card">
          <div class="dash-chart-header">
            <span class="dash-chart-icon">📚</span>
            <div>
              <div class="dash-chart-title">คะแนน A-Level</div>
              <div class="dash-chart-sub">Academic Level</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="navigate('scores')" style="margin-left:auto;font-size:0.75rem">แก้ไข →</button>
          </div>
          ${renderALevelBars(scores)}
        </div>

      </div>
    </div>

    <!-- TCAS Timeline -->
    <div class="card" style="margin-top:0">
      <div class="dash-chart-header" style="padding:16px 20px 0">
        <span class="dash-chart-icon">📅</span>
        <div class="dash-chart-title">ไทม์ไลน์ TCAS70</div>
      </div>
      ${renderTCASTimeline()}
    </div>

    <!-- Top Recommendations -->
    <div style="margin-top:20px">
      <div class="section-title">🎯 คณะที่เหมาะกับคุณ (Top 3)</div>
      ${renderTopRecommendations()}
    </div>
  `;
}

function renderKPICard(icon, label, value, sub, ratio, color, page) {
  const pct = Math.round((ratio || 0) * 100);
  const circumference = 2 * Math.PI * 22;
  const dash = circumference * Math.min(ratio || 0, 1);
  return `
    <div class="dash-kpi-card" onclick="navigate('${page}')" style="cursor:pointer">
      <div class="dash-kpi-ring-wrap">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="22" fill="none" stroke="var(--border)" stroke-width="5"/>
          <circle cx="30" cy="30" r="22" fill="none" stroke="${color}" stroke-width="5"
            stroke-dasharray="${dash} ${circumference}" stroke-dashoffset="${circumference * 0.25}"
            stroke-linecap="round" transform="rotate(-90 30 30)"
            style="transition:stroke-dasharray 0.8s ease"/>
          <text x="30" y="34" text-anchor="middle" font-size="11" font-weight="700" fill="${color}"
            font-family="'Prompt',sans-serif">${pct > 0 ? pct + '%' : icon}</text>
        </svg>
      </div>
      <div class="dash-kpi-info">
        <div class="dash-kpi-label">${label}</div>
        <div class="dash-kpi-value" style="color:${color}">${value}</div>
        <div class="dash-kpi-sub">${sub}</div>
      </div>
    </div>
  `;
}

function renderGPABarChart(gpa) {
  const semesters = [
    { key: 'm401', label: 'ม.4/1' },
    { key: 'm402', label: 'ม.4/2' },
    { key: 'm411', label: 'ม.5/1' },
    { key: 'm412', label: 'ม.5/2' },
    { key: 'm421', label: 'ม.6/1' },
    { key: 'm422', label: 'ม.6/2' }
  ];
  const hasAny = semesters.some(s => parseFloat(gpa[s.key]) > 0);
  if (!hasAny && !parseFloat(gpa.cumulative)) {
    return `<div class="dash-empty" onclick="navigate('scores')">
      <span>📝</span> ยังไม่มีข้อมูล GPA — คลิกเพื่อกรอก
    </div>`;
  }
  return `
    <div class="gpa-bar-chart">
      ${semesters.map(s => {
        const val = parseFloat(gpa[s.key]) || 0;
        const pct = val / 4 * 100;
        const color = val >= 3.5 ? 'var(--success)' : val >= 3.0 ? 'var(--primary)' : val >= 2.5 ? 'var(--warning)' : val > 0 ? 'var(--danger)' : 'var(--border)';
        return `
          <div class="gpa-bar-row">
            <div class="gpa-bar-label">${s.label}</div>
            <div class="gpa-bar-track">
              <div class="gpa-bar-fill" style="width:${pct}%;background:${color}">
                ${val > 0 ? `<span class="gpa-bar-tip">${val.toFixed(2)}</span>` : ''}
              </div>
            </div>
            <div class="gpa-bar-val" style="color:${color}">${val > 0 ? val.toFixed(2) : '—'}</div>
          </div>
        `;
      }).join('')}
      ${parseFloat(gpa.cumulative) > 0 ? `
        <div class="gpa-bar-row gpa-cum-row">
          <div class="gpa-bar-label" style="font-weight:700;color:var(--primary)">GPAX</div>
          <div class="gpa-bar-track" style="background:rgba(26,58,107,0.08)">
            <div class="gpa-bar-fill" style="width:${parseFloat(gpa.cumulative)/4*100}%;background:var(--primary);">
              <span class="gpa-bar-tip">${parseFloat(gpa.cumulative).toFixed(2)}</span>
            </div>
          </div>
          <div class="gpa-bar-val" style="color:var(--primary);font-weight:700">${parseFloat(gpa.cumulative).toFixed(2)}</div>
        </div>` : ''}
      <div class="gpa-bar-scale">
        <span>0</span><span>1.00</span><span>2.00</span><span>3.00</span><span>4.00</span>
      </div>
    </div>
  `;
}

function renderTGATChart(scores) {
  const items = [
    { key: 'tgat1', label: 'TGAT1 อังกฤษ', max: 100, color: '#6366F1' },
    { key: 'tgat2', label: 'TGAT2 เหตุผล', max: 100, color: '#8B5CF6' },
    { key: 'tgat3', label: 'TGAT3 สมรรถนะ', max: 100, color: '#A78BFA' }
  ];
  const hasAny = items.some(i => parseFloat(scores[i.key]) > 0);
  if (!hasAny) return `<div class="dash-empty" onclick="navigate('scores')">
    <span>📝</span> ยังไม่มีคะแนน TGAT — คลิกเพื่อกรอก
  </div>`;
  const total = items.reduce((s,i) => s + (parseFloat(scores[i.key]) || 0), 0);
  return `
    <div class="score-horiz-chart">
      ${items.map(i => {
        const val = parseFloat(scores[i.key]) || 0;
        const pct = val / i.max * 100;
        return `
          <div class="score-h-row">
            <div class="score-h-label">${i.label}</div>
            <div class="score-h-track">
              <div class="score-h-fill" style="width:${pct}%;background:${i.color}"></div>
              <span class="score-h-val">${val > 0 ? val : '—'}/${i.max}</span>
            </div>
            <div class="score-h-pct" style="color:${i.color}">${pct > 0 ? Math.round(pct) + '%' : ''}</div>
          </div>
        `;
      }).join('')}
      ${total > 0 ? `<div class="tgat-total-row"><span>รวม TGAT</span><strong style="color:#6366F1">${total} / 300</strong><span style="color:var(--text-muted);font-size:0.75rem">(${Math.round(total/300*100)}%)</span></div>` : ''}
    </div>
  `;
}

function renderPortfolioDonut(portfolio) {
  const cats = [
    { key: 'camps', label: 'ค่าย', color: '#6366F1', icon: '⛺' },
    { key: 'awards', label: 'รางวัล', color: '#F59E0B', icon: '🏆' },
    { key: 'competitions', label: 'แข่งขัน', color: '#EF4444', icon: '🥊' },
    { key: 'activities', label: 'กิจกรรม', color: '#10B981', icon: '🎯' },
    { key: 'volunteer', label: 'อาสา', color: '#EC4899', icon: '💚' }
  ];
  const total = cats.reduce((s, c) => s + (portfolio[c.key]?.length || 0), 0);
  if (total === 0) {
    return `<div class="dash-empty" onclick="navigate('portfolio')">
      <span>📁</span> ยังไม่มีผลงาน — คลิกเพื่อเพิ่ม
    </div>`;
  }
  // Build SVG donut
  const r = 46, cx = 60, cy = 60, stroke = 16;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = cats.map(c => {
    const count = portfolio[c.key]?.length || 0;
    const pct = total > 0 ? count / total : 0;
    const seg = { ...c, count, pct, offset, dash: pct * circ };
    offset += pct * circ;
    return seg;
  }).filter(s => s.count > 0);

  return `
    <div class="portfolio-donut-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120" style="flex-shrink:0">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border)" stroke-width="${stroke}"/>
        ${segments.map(s => `
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
            stroke="${s.color}" stroke-width="${stroke}"
            stroke-dasharray="${s.dash} ${circ - s.dash}"
            stroke-dashoffset="${circ * 0.25 - s.offset}"
            stroke-linecap="butt"/>
        `).join('')}
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="18" font-weight="800" fill="var(--primary)" font-family="'Prompt',sans-serif">${total}</text>
        <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-family="'Prompt',sans-serif">รายการ</text>
      </svg>
      <div class="portfolio-legend">
        ${cats.map(c => {
          const count = portfolio[c.key]?.length || 0;
          return `<div class="port-legend-item" onclick="navigate('portfolio')">
            <span class="port-legend-dot" style="background:${c.color}"></span>
            <span class="port-legend-label">${c.icon} ${c.label}</span>
            <span class="port-legend-count" style="color:${c.color}">${count}</span>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderALevelBars(scores) {
  const items = [
    { key: 'amath1', label: 'คณิต 1', color: '#3B82F6' },
    { key: 'aeng', label: 'อังกฤษ', color: '#10B981' },
    { key: 'athai', label: 'ไทย', color: '#F59E0B' },
    { key: 'ascience', label: 'วิทย์', color: '#8B5CF6' },
    { key: 'achem', label: 'เคมี', color: '#EF4444' },
    { key: 'abio', label: 'ชีวะ', color: '#06B6D4' },
    { key: 'aphy', label: 'ฟิสิกส์', color: '#F97316' },
    { key: 'asocial', label: 'สังคม', color: '#84CC16' }
  ].filter(i => parseFloat(scores[i.key]) > 0);

  if (!items.length) return `<div class="dash-empty" onclick="navigate('scores')">
    <span>📝</span> ยังไม่มีคะแนน A-Level — คลิกเพื่อกรอก
  </div>`;

  return `
    <div class="alevel-grid">
      ${items.map(i => {
        const val = parseFloat(scores[i.key]) || 0;
        const pct = val / 100;
        return `
          <div class="alevel-cell" title="${i.label}: ${val}/100">
            <div class="alevel-ring-wrap">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="20" fill="none" stroke="var(--border)" stroke-width="4"/>
                <circle cx="26" cy="26" r="20" fill="none" stroke="${i.color}" stroke-width="4"
                  stroke-dasharray="${pct * 125.7} 125.7" stroke-dashoffset="31.4"
                  stroke-linecap="round" transform="rotate(-90 26 26)"/>
                <text x="26" y="30" text-anchor="middle" font-size="10" font-weight="700"
                  fill="${i.color}" font-family="'Prompt',sans-serif">${val}</text>
              </svg>
            </div>
            <div class="alevel-label">${i.label}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderTCASTimeline() {
  const roundColors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];
  const roundNames = ['Portfolio', 'โควตา', 'Admission', 'รับตรงอิสระ'];
  const roundPeriods = ['ธ.ค.69 – ก.พ.70', 'ก.พ. – มี.ค.70', 'เม.ย. – พ.ค.70', 'พ.ค. – มิ.ย.70'];
  const roundDescs = ['แฟ้มสะสมผลงาน', 'โควตาพื้นที่/ประเภท', 'สมัครกลาง mytcas', 'รับตรงของแต่ละมหา'];

  return `
    <div class="tcas-timeline" style="padding:16px 20px 20px">
      ${[0,1,2,3].map(i => `
        <div class="tcas-tl-item" onclick="navigate('guide')">
          <div class="tcas-tl-circle" style="background:${roundColors[i]}">
            <span style="font-size:0.85rem;font-weight:800;color:white">${i+1}</span>
          </div>
          <div class="tcas-tl-line" style="background:${i < 3 ? roundColors[i] + '40' : 'transparent'}"></div>
          <div class="tcas-tl-content">
            <div class="tcas-tl-name" style="color:${roundColors[i]}">${roundNames[i]}</div>
            <div class="tcas-tl-period">${roundPeriods[i]}</div>
            <div class="tcas-tl-desc">${roundDescs[i]}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTopRecommendations() {
  const hasData = parseFloat(state.studentData.gpa.cumulative) > 0 ||
    Object.values(state.studentData.scores).some(s => s !== '');

  if (!hasData) {
    return `
      <div class="card">
        <div class="card-body">
          <div class="empty-state" style="padding:24px">
            <div class="empty-state-icon" style="font-size:2rem">📝</div>
            <div class="empty-state-title">กรอกข้อมูลคะแนนก่อน</div>
            <div class="empty-state-desc">เพื่อให้ระบบแนะนำคณะที่เหมาะกับคุณ</div>
            <button class="btn btn-primary btn-sm" onclick="navigate('scores')">กรอกคะแนน</button>
          </div>
        </div>
      </div>
    `;
  }

  const { results: recs, fromPrefs, prefCount } = getTopRecommendations(3);

  const sourceChip = fromPrefs
    ? `<div class="rec-source-chip pref" onclick="navigate('profile')">📌 จาก ${prefCount} คณะที่คุณเลือกไว้ · แก้ไข →</div>`
    : `<div class="rec-source-chip all" onclick="navigate('profile')">🔍 จากคณะทั้งหมด · เลือก 10 อันดับ →</div>`;

  if (!recs.length) return `${sourceChip}<div class="card"><div class="card-body"><p style="color:var(--text-muted);font-size:0.85rem">ยังไม่พบคณะที่ตรงกับข้อมูลของคุณ</p></div></div>`;

  return sourceChip + recs.map(({ program, result }) => {
    const uni = getUniversityById(program.universityId);
    const pct = Math.min(result.score, 100);
    const color = pct >= 70 ? 'var(--success)' : pct >= 45 ? 'var(--warning)' : 'var(--text-muted)';
    return `
      <div class="rec-card mb-2" onclick="showProgramDetail('${program.id}')">
        <div class="rec-card-header">
          <div class="rec-uni-badge" style="background:${uni.color}">${uni.shortName}</div>
          <div class="rec-card-info">
            <div class="rec-program">${program.program}</div>
            <div class="rec-faculty">${program.faculty} · ${uni.name}</div>
          </div>
        </div>
        <div class="match-bar-wrap">
          <div class="match-bar-label"><span>ความเหมาะสม</span><strong style="color:${color}">${pct}%</strong></div>
          <div class="match-bar"><div class="match-bar-fill" style="width:${pct}%;background:${color}"></div></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderScoreSummaryWidget() {
  const scores = state.studentData.scores;
  const tgat1 = parseFloat(scores.tgat1) || 0;
  const tgat2 = parseFloat(scores.tgat2) || 0;
  const tgat3 = parseFloat(scores.tgat3) || 0;

  const aLevels = [
    { key: 'amath1', name: 'คณิต 1', max: 100 },
    { key: 'aeng', name: 'อังกฤษ', max: 100 },
    { key: 'athai', name: 'ไทย', max: 100 },
    { key: 'ascience', name: 'วิทย์', max: 100 },
    { key: 'achem', name: 'เคมี', max: 100 },
    { key: 'abio', name: 'ชีวะ', max: 100 },
    { key: 'aphy', name: 'ฟิสิกส์', max: 100 },
    { key: 'asocial', name: 'สังคม', max: 100 }
  ].filter(s => parseFloat(scores[s.key]) > 0);

  if (tgat1 + tgat2 + tgat3 === 0 && !aLevels.length) return '';

  return `
    <div class="mt-4">
      <div class="section-title">📈 สรุปคะแนนสอบ</div>
      <div class="card">
        <div class="card-body">
          <div class="grid-3">
            ${tgat1 > 0 ? `<div><div class="stat-label" style="font-size:0.72rem">TGAT1 อังกฤษ</div><div style="font-size:1.2rem;font-weight:700;color:var(--primary)">${tgat1}<span style="font-size:0.75rem;color:var(--text-muted)">/100</span></div></div>` : ''}
            ${tgat2 > 0 ? `<div><div class="stat-label" style="font-size:0.72rem">TGAT2 เหตุผล</div><div style="font-size:1.2rem;font-weight:700;color:var(--primary)">${tgat2}<span style="font-size:0.75rem;color:var(--text-muted)">/100</span></div></div>` : ''}
            ${tgat3 > 0 ? `<div><div class="stat-label" style="font-size:0.72rem">TGAT3 สมรรถนะ</div><div style="font-size:1.2rem;font-weight:700;color:var(--primary)">${tgat3}<span style="font-size:0.75rem;color:var(--text-muted)">/100</span></div></div>` : ''}
          </div>
          ${aLevels.length ? `
            <div class="divider"></div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${aLevels.map(s => {
                const val = parseFloat(scores[s.key]);
                const pct = val / s.max * 100;
                const c = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
                return `<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:8px 12px;min-width:90px">
                  <div style="font-size:0.7rem;color:var(--text-muted)">${s.name}</div>
                  <div style="font-size:1.1rem;font-weight:700;color:${c}">${val}<span style="font-size:0.7rem;color:var(--text-muted)">/${s.max}</span></div>
                </div>`;
              }).join('')}
            </div>` : ''}
        </div>
      </div>
    </div>
  `;
}

function getTopRecommendations(n = 5) {
  const prefs = state.studentData.preferences || [];
  const fromPrefs = prefs.length > 0;
  const pool = fromPrefs
    ? TCAS_DATA.programs.filter(p => prefs.includes(p.id))
    : TCAS_DATA.programs;

  const results = pool
    .map(program => ({ program, result: calculateMatchScore(program, state.studentData) }))
    .filter(r => r.result.score > 10)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, n);

  return { results, fromPrefs, prefCount: prefs.length };
}

// ============================================================
// PROFILE
// ============================================================
function renderProfile() {
  const p = state.studentData.profile;
  const container = document.getElementById('profile-content');
  if (!container) return;

  container.innerHTML = `
    <div class="profile-header-card">
      <div class="profile-avatar-large" onclick="editAvatar()" title="คลิกเพื่อเปลี่ยน">
        <img src="images/student-avatar.svg" alt="นักเรียน" class="avatar-img">
      </div>
      <div>
        <div class="profile-name">${p.firstName || 'กรุณากรอกชื่อ'} ${p.lastName || ''}</div>
        <div class="profile-meta">
          ${p.studentId ? `รหัสนักเรียน: ${p.studentId} · ` : ''}
          ม.${p.schoolYear === '2569' ? '6' : '5'} ปีการศึกษา 2569
        </div>
        <div class="profile-chips">
          ${p.classRoom ? `<div class="profile-chip">🏫 ${p.classRoom}</div>` : ''}
          <div class="profile-chip">📚 โรงเรียนโพธิสารพิทยากร</div>
          ${p.target ? `<div class="profile-chip">🎯 ${p.target}</div>` : ''}
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="icon">👤</span>ข้อมูลส่วนตัว</div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ชื่อ <span class="required">*</span></label>
              <input type="text" class="form-control" id="prof-firstName" value="${p.firstName || ''}" placeholder="ชื่อ" oninput="onProfileInput('firstName', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">นามสกุล <span class="required">*</span></label>
              <input type="text" class="form-control" id="prof-lastName" value="${p.lastName || ''}" placeholder="นามสกุล" oninput="onProfileInput('lastName', this.value)">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">รหัสนักเรียน</label>
              <input type="text" class="form-control" id="prof-studentId" value="${p.studentId || ''}" placeholder="เช่น 12345" oninput="onProfileInput('studentId', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">ห้องเรียน</label>
              <input type="text" class="form-control" id="prof-classRoom" value="${p.classRoom || ''}" placeholder="เช่น ม.6/1" oninput="onProfileInput('classRoom', this.value)">
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title"><span class="icon">📱</span>ข้อมูลติดต่อ</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">เบอร์โทร</label>
            <input type="tel" class="form-control" id="prof-phone" value="${p.phone || ''}" placeholder="0812345678" oninput="onProfileInput('phone', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">อีเมล</label>
            <input type="email" class="form-control" id="prof-email" value="${p.email || ''}" placeholder="email@example.com" oninput="onProfileInput('email', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">LINE ID</label>
            <input type="text" class="form-control" id="prof-lineId" value="${p.lineId || ''}" placeholder="line_id" oninput="onProfileInput('lineId', this.value)">
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-3">
      <div class="card-header"><div class="card-title"><span class="icon">🎯</span>เป้าหมายการศึกษา</div></div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">คณะ/สาขาที่ต้องการ (ระบุได้มากกว่า 1 อย่าง)</label>
          <input type="text" class="form-control" id="prof-target" value="${p.target || ''}" placeholder="เช่น แพทยศาสตร์, วิศวกรรมคอมพิวเตอร์, นิติศาสตร์" oninput="onProfileInput('target', this.value)">
        </div>
      </div>
    </div>

    <div class="flex gap-3 mt-4">
      <button class="btn btn-primary" onclick="saveProfile()">💾 บันทึกข้อมูล</button>
      <button class="btn btn-outline" onclick="navigate('scores')">ถัดไป: คะแนนสอบ →</button>
    </div>

    <!-- 10 อันดับที่สนใจ -->
    <div class="card mt-4">
      <div class="card-header">
        <div class="card-title"><span class="icon">🏆</span>คณะที่สนใจ 10 อันดับ
          <span style="font-size:0.75rem;font-weight:400;color:var(--text-muted);margin-left:6px">ใช้ในการประเมินรอบ Admission</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openPrefModal()">+ เพิ่มคณะ</button>
      </div>
      <div class="card-body" style="padding-top:8px">
        <div id="pref-list-container"></div>
      </div>
    </div>

    <!-- Reset Data Card -->
    <div class="card mt-4" style="border:1px solid #FEE2E2">
      <div class="card-header">
        <div class="card-title" style="color:#DC2626">⚠️ รีเซ็ตข้อมูล</div>
      </div>
      <div class="card-body">
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px">ล้างข้อมูลทั้งหมดออกจากอุปกรณ์นี้ และเริ่มต้นใหม่</p>
        <button class="btn btn-sm" style="background:#FEE2E2;color:#DC2626;border:1px solid #FCA5A5"
          onclick="confirmReset()">🗑️ ล้างข้อมูลทั้งหมด</button>
      </div>
    </div>
  `;

  // Render preferences list
  renderPrefList();
}

// ============================================================
// PREFERENCES — 10 อันดับคณะที่สนใจ
// ============================================================

function getPreferences() {
  return state.studentData.preferences || [];
}

function renderPrefList() {
  const container = document.getElementById('pref-list-container');
  if (!container) return;
  const prefs = getPreferences();

  if (prefs.length === 0) {
    container.innerHTML = `
      <div class="pref-empty">
        <div style="font-size:2rem;margin-bottom:8px">🎓</div>
        <div style="font-weight:600;color:var(--text-secondary);margin-bottom:4px">ยังไม่ได้เลือกคณะ</div>
        <div style="font-size:0.8rem;color:var(--text-muted)">กด "+ เพิ่มคณะ" เพื่อเลือกได้สูงสุด 10 อันดับ</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="pref-list">
      ${prefs.map((pid, i) => {
        const prog = TCAS_DATA.programs.find(p => p.id === pid);
        if (!prog) return '';
        const uni = getUniversityById(prog.universityId);
        const roundColors = ['#6366F1','#10B981','#F59E0B','#EF4444'];
        const roundBadges = prog.rounds.map(r =>
          `<span class="pref-round-badge" style="background:${roundColors[r-1]}20;color:${roundColors[r-1]};border-color:${roundColors[r-1]}40">รอบ ${r}</span>`
        ).join('');
        return `
          <div class="pref-item" data-idx="${i}">
            <div class="pref-rank" style="background:${i < 3 ? ['#F0A500','#94A3B8','#CD7F32'][i] : 'var(--surface-2)'};color:${i < 3 ? 'white' : 'var(--text-muted)'}">
              ${i + 1}
            </div>
            <div class="pref-item-body">
              <div class="pref-item-header">
                <span class="pref-uni-tag" style="background:${uni.color}20;color:${uni.color}">${uni.shortName}</span>
                <span class="pref-prog-name">${prog.program}</span>
              </div>
              <div class="pref-item-sub">${prog.faculty} · GPA ≥ ${prog.minGPA} · ${roundBadges}</div>
            </div>
            <div class="pref-actions">
              <button class="pref-btn" onclick="movePref(${i},-1)" ${i === 0 ? 'disabled' : ''} title="เลื่อนขึ้น">▲</button>
              <button class="pref-btn" onclick="movePref(${i},1)" ${i === prefs.length-1 ? 'disabled' : ''} title="เลื่อนลง">▼</button>
              <button class="pref-btn pref-btn-del" onclick="removePref(${i})" title="ลบออก">✕</button>
            </div>
          </div>`;
      }).join('')}
    </div>
    <div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;text-align:right">
      ${prefs.length}/10 อันดับ
      ${prefs.length < 10 ? `· <button class="btn-link" onclick="openPrefModal()" style="font-size:0.75rem">+ เพิ่มอีก</button>` : ''}
    </div>`;
}

function movePref(idx, dir) {
  const prefs = [...getPreferences()];
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= prefs.length) return;
  [prefs[idx], prefs[newIdx]] = [prefs[newIdx], prefs[idx]];
  state.studentData.preferences = prefs;
  saveData();
  renderPrefList();
}

function removePref(idx) {
  const prefs = [...getPreferences()];
  prefs.splice(idx, 1);
  state.studentData.preferences = prefs;
  saveData();
  renderPrefList();
}

function addToPref(programId) {
  const prefs = [...getPreferences()];
  if (prefs.includes(programId)) {
    showToast('⚠️ คณะนี้อยู่ในรายการแล้ว');
    return;
  }
  if (prefs.length >= 10) {
    showToast('⚠️ เลือกได้สูงสุด 10 อันดับเท่านั้น');
    return;
  }
  prefs.push(programId);
  state.studentData.preferences = prefs;
  saveData();
  renderPrefList();
  // Update counter badge inside modal
  const badge = document.getElementById('pref-modal-count');
  if (badge) badge.textContent = `${prefs.length}/10`;
  // Refresh modal list to show checkmark
  renderPrefModalList();
  showToast(`✅ เพิ่ม "${TCAS_DATA.programs.find(p=>p.id===programId)?.program}" แล้ว`);
}

// ---- Preferences Selection Modal ----
function openPrefModal() {
  state.prefSearchQuery = '';
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody  = document.getElementById('modal-body');
  const saveBtn    = document.getElementById('modal-save-btn');
  const cancelBtn  = document.getElementById('modal-cancel-btn');

  modalTitle.innerHTML = `🎓 เลือกคณะที่สนใจ <span id="pref-modal-count" style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">${getPreferences().length}/10</span>`;
  if (saveBtn)   saveBtn.style.display   = 'none';
  if (cancelBtn) cancelBtn.textContent   = 'ปิด';

  modalBody.innerHTML = `
    <div style="position:sticky;top:0;background:var(--surface);padding-bottom:12px;z-index:2">
      <input type="text" class="form-control" id="pref-search-input"
        placeholder="🔍 ค้นหาคณะหรือมหาวิทยาลัย..."
        oninput="state.prefSearchQuery=this.value;renderPrefModalList()"
        value="${state.prefSearchQuery}">
      <div id="pref-cat-filter" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        <button class="filter-chip ${!state.prefCatFilter?'active':''}" onclick="setPrefCat('')">ทั้งหมด</button>
        ${['วิทยาศาสตร์','วิศวกรรม','สาธารณสุข','มนุษยศาสตร์','สังคมศาสตร์','บริหาร','ศิลปะ','ครุศาสตร์'].map(c=>
          `<button class="filter-chip ${state.prefCatFilter===c?'active':''}" onclick="setPrefCat('${c}')">${c}</button>`
        ).join('')}
      </div>
    </div>
    <div id="pref-modal-list" style="margin-top:4px"></div>
  `;

  overlay.classList.add('active');
  renderPrefModalList();

  // Auto-focus search
  setTimeout(() => document.getElementById('pref-search-input')?.focus(), 100);
}

function setPrefCat(cat) {
  state.prefCatFilter = cat;
  renderPrefModalList();
  // Refresh filter buttons
  document.querySelectorAll('#pref-cat-filter .filter-chip').forEach(btn => {
    const val = btn.textContent.trim() === 'ทั้งหมด' ? '' : btn.textContent.trim();
    btn.classList.toggle('active', val === cat);
  });
}

function renderPrefModalList() {
  const container = document.getElementById('pref-modal-list');
  if (!container) return;

  const prefs = getPreferences();
  const q   = (state.prefSearchQuery || '').toLowerCase();
  const cat = state.prefCatFilter || '';

  let programs = TCAS_DATA.programs.filter(p => {
    const uni = getUniversityById(p.universityId);
    const matchQ = !q ||
      p.program.toLowerCase().includes(q) ||
      p.faculty.toLowerCase().includes(q) ||
      uni.name.toLowerCase().includes(q) ||
      uni.shortName.toLowerCase().includes(q);
    const matchCat = !cat || p.category === cat;
    return matchQ && matchCat;
  });

  if (programs.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:24px 0"><div class="empty-state-icon">🔍</div><div>ไม่พบคณะที่ค้นหา</div></div>`;
    return;
  }

  container.innerHTML = programs.map(p => {
    const uni = getUniversityById(p.universityId);
    const inPref = prefs.includes(p.id);
    const rank   = prefs.indexOf(p.id) + 1;
    const full   = prefs.length >= 10 && !inPref;
    const match  = calculateMatchScore(p, state.studentData);
    const pct    = Math.min(match.score, 100);
    const scoreColor = pct >= 65 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';

    return `
      <div class="pref-modal-item ${inPref ? 'pref-modal-item--selected' : ''} ${full ? 'pref-modal-item--disabled' : ''}"
           onclick="${full ? '' : inPref ? `removePrefById('${p.id}')` : `addToPref('${p.id}')`}">
        <div class="pref-modal-rank-badge ${inPref ? 'active' : ''}">
          ${inPref ? `<strong>${rank}</strong>` : `<span style="color:var(--text-muted);font-size:0.8rem">+</span>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
            <span style="font-size:0.65rem;font-weight:700;padding:1px 6px;border-radius:4px;background:${uni.color}20;color:${uni.color}">${uni.shortName}</span>
            <span style="font-weight:600;font-size:0.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.program}</span>
          </div>
          <div style="font-size:0.73rem;color:var(--text-muted)">${p.faculty} · GPA ≥ ${p.minGPA}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:0.78rem;font-weight:700;color:${scoreColor}">${pct}%</div>
          <div style="font-size:0.65rem;color:var(--text-muted)">เหมาะสม</div>
        </div>
      </div>`;
  }).join('');
}

function removePrefById(programId) {
  const prefs = [...getPreferences()];
  const idx = prefs.indexOf(programId);
  if (idx >= 0) prefs.splice(idx, 1);
  state.studentData.preferences = prefs;
  saveData();
  renderPrefList();
  const badge = document.getElementById('pref-modal-count');
  if (badge) badge.textContent = `${prefs.length}/10`;
  renderPrefModalList();
}

function saveProfile() {
  const fields = ['firstName', 'lastName', 'studentId', 'classRoom', 'phone', 'email', 'lineId', 'target'];
  fields.forEach(f => {
    const el = document.getElementById(`prof-${f}`);
    if (el) state.studentData.profile[f] = el.value.trim();
  });
  saveData();
  updateHeaderChip();
  showToast('✅ บันทึกข้อมูลโปรไฟล์แล้ว');
}

function onProfileInput(field, value) {
  state.studentData.profile[field] = value;
  updateHeaderChip();
  debounceSave();
}

// ============================================================
// SCORES
// ============================================================
function renderScores() {
  const container = document.getElementById('scores-content');
  if (!container) return;

  container.innerHTML = `
    <div class="tab-bar">
      <button class="tab-btn active" onclick="switchScoreTab(this,'gpa')">📊 GPA</button>
      <button class="tab-btn" onclick="switchScoreTab(this,'tgat')">🧠 TGAT</button>
      <button class="tab-btn" onclick="switchScoreTab(this,'tpat')">🎯 TPAT</button>
      <button class="tab-btn" onclick="switchScoreTab(this,'alevel')">📚 A-Level</button>
    </div>

    <div id="score-tab-gpa" class="tab-panel active">
      ${renderGPASection()}
    </div>
    <div id="score-tab-tgat" class="tab-panel">
      ${renderTGATSection()}
    </div>
    <div id="score-tab-tpat" class="tab-panel">
      ${renderTPATSection()}
    </div>
    <div id="score-tab-alevel" class="tab-panel">
      ${renderALevelSection()}
    </div>

    <div class="flex gap-3 mt-4">
      <button class="btn btn-primary" onclick="saveScores()">💾 บันทึกคะแนน</button>
      <button class="btn btn-outline" onclick="navigate('portfolio')">ถัดไป: ผลงาน →</button>
    </div>
  `;

  initScoreInputs();
}

function renderMockTestPage() {
  renderMockTestSection();
}

function switchScoreTab(btn, tab) {
  const container = document.getElementById('scores-content');
  container?.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  container?.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`score-tab-${tab}`);
  if (panel) panel.classList.add('active');
}

function renderGPASection() {
  const gpa = state.studentData.gpa;
  const semesters = [
    { key: 'm401', label: 'ม.4 เทอม 1' },
    { key: 'm402', label: 'ม.4 เทอม 2' },
    { key: 'm411', label: 'ม.5 เทอม 1' },
    { key: 'm412', label: 'ม.5 เทอม 2' },
    { key: 'm421', label: 'ม.6 เทอม 1' },
    { key: 'm422', label: 'ม.6 เทอม 2 (คาด)' }
  ];

  return `
    <div class="card">
      <div class="score-section-title">📊 เกรดเฉลี่ยแต่ละเทอม (GPAX)</div>
      <div class="card-body">
        <div class="gpa-grid">
          ${semesters.map(s => `
            <div class="gpa-card">
              <div class="gpa-card-label">${s.label}</div>
              <div class="gpa-card-value" id="gpa-display-${s.key}">${gpa[s.key] ? parseFloat(gpa[s.key]).toFixed(2) : '—'}</div>
              <input type="number" class="form-control score-input" id="gpa-${s.key}"
                value="${gpa[s.key] || ''}" min="0" max="4" step="0.01"
                placeholder="0.00 – 4.00" oninput="onGPAInput('${s.key}', this.value)">
              <span id="gpa-err-${s.key}" class="gpa-error hidden">⚠️ เกรดต้องไม่เกิน 4.00</span>
            </div>
          `).join('')}
        </div>
        <hr class="divider">
        <div class="form-group" style="max-width:300px">
          <label class="form-label">🏆 เกรดเฉลี่ยสะสม (GPAX) ปัจจุบัน</label>
          <input type="number" class="form-control score-input" id="gpa-cumulative"
            value="${gpa.cumulative || ''}" min="0" max="4" step="0.01"
            placeholder="0.00 – 4.00" style="font-size:1.1rem;font-weight:700"
            oninput="onGPAInput('cumulative', this.value)">
          <span id="gpa-err-cumulative" class="gpa-error hidden">⚠️ เกรดต้องไม่เกิน 4.00</span>
          <div class="form-hint">กรอกเกรดเฉลี่ยสะสมจากทะเบียน (ถ้ามี)</div>
        </div>
      </div>
    </div>
  `;
}

function onGPAInput(key, value) {
  const displayEl = document.getElementById(`gpa-display-${key}`);
  const errEl = document.getElementById(`gpa-err-${key}`);
  const inputEl = document.getElementById(`gpa-${key}`);

  if (value === '' || value === null) {
    if (displayEl) displayEl.textContent = '—';
    if (errEl) errEl.classList.add('hidden');
    if (inputEl) inputEl.classList.remove('error');
    state.studentData.gpa[key] = '';
    debounceSave();
    return;
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    if (displayEl) displayEl.textContent = '—';
    if (errEl) errEl.classList.add('hidden');
    if (inputEl) inputEl.classList.remove('error');
    return;
  }

  if (num < 0 || num > 4) {
    if (displayEl) displayEl.textContent = '!';
    if (errEl) errEl.classList.remove('hidden');
    if (inputEl) inputEl.classList.add('error');
    return;
  }

  if (errEl) errEl.classList.add('hidden');
  if (inputEl) inputEl.classList.remove('error');
  if (displayEl) displayEl.textContent = num.toFixed(2);
  state.studentData.gpa[key] = value;
  debounceSave();
}

function updateGPADisplay(key, val) {
  // Legacy — keep for backward compat, redirect to onGPAInput
  onGPAInput(key, val);
}

function renderTGATSection() {
  const s = state.studentData.scores;
  const tgats = [
    { key: 'tgat1', name: 'TGAT1 ความถนัดสื่อสารภาษาอังกฤษ', max: 100, desc: 'วัดความสามารถด้านการอ่าน เขียน ฟัง พูด ภาษาอังกฤษ' },
    { key: 'tgat2', name: 'TGAT2 การคิดอย่างมีเหตุผล', max: 100, desc: 'วัดทักษะการคิดวิเคราะห์ ตรรกะ และแก้ปัญหา' },
    { key: 'tgat3', name: 'TGAT3 สมรรถนะการทำงานในโลกอนาคต', max: 100, desc: 'วัดทักษะการทำงานร่วมกัน การสื่อสาร และการแก้ปัญหา' }
  ];

  return `
    <div class="card">
      <div class="score-section-title">🧠 TGAT - Thai General Aptitude Test</div>
      <div class="info-box mb-3" style="margin:16px 16px 0">
        <span>ℹ️</span>
        <span>TGAT สอบวันที่ 30 ม.ค. – 1 ก.พ. 2570 คะแนนแต่ละวิชาสูงสุด 100 คะแนน รวม 300 คะแนน ตรวจสอบกำหนดการล่าสุดที่ mytcas.com</span>
      </div>
      <table class="score-table">
        <thead><tr><th>วิชา</th><th>คะแนนที่ได้</th><th>เต็ม</th><th>%</th></tr></thead>
        <tbody>
          ${tgats.map(t => {
            const val = parseFloat(s[t.key]) || 0;
            const pct = val > 0 ? Math.round(val / t.max * 100) : 0;
            const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--text-muted)';
            return `
              <tr>
                <td>
                  <div style="font-weight:600;font-size:0.88rem">${t.name}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted)">${t.desc}</div>
                </td>
                <td>
                  <input type="number" class="score-input" id="score-${t.key}"
                    value="${s[t.key] || ''}" min="0" max="${t.max}" step="0.5"
                    placeholder="—" oninput="onScoreInput('${t.key}', this.value, ${t.max})">
                  <span id="err-${t.key}" class="score-error hidden">⚠️ เกินคะแนนเต็ม (${t.max})</span>
                </td>
                <td class="score-max">${t.max}</td>
                <td>
                  <span id="pct-${t.key}" style="font-size:0.85rem;font-weight:600;color:${color}">
                    ${val > 0 ? pct + '%' : '—'}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderTPATSection() {
  const s = state.studentData.scores;
  const tpats = [
    { key: 'tpat1', name: 'TPAT1 วิชาเฉพาะแพทย์ (กสพท)', max: 300, desc: 'จำเป็นสำหรับแพทย์ ทันตแพทย์ เภสัชบางที่ สัตวแพทย์บางที่' },
    { key: 'tpat2', name: 'TPAT2 วิชาเฉพาะด้านศิลปกรรมศาสตร์', max: 100, desc: 'สำหรับสาขาศิลปะ ดนตรี นาฏศิลป์' },
    { key: 'tpat3', name: 'TPAT3 วิชาเฉพาะวิทยาศาสตร์ เทคโนโลยี วิศวกรรมศาสตร์', max: 100, desc: 'สำหรับวิศวกรรมศาสตร์ วิทยาศาสตร์ และเทคโนโลยี' },
    { key: 'tpat4', name: 'TPAT4 วิชาเฉพาะสถาปัตยกรรมศาสตร์', max: 100, desc: 'สำหรับสถาปัตยกรรมศาสตร์และออกแบบ' },
    { key: 'tpat5', name: 'TPAT5 วิชาเฉพาะครุศาสตร์/ศึกษาศาสตร์', max: 100, desc: 'สำหรับคณะครุศาสตร์/ศึกษาศาสตร์' }
  ];

  return `
    <div class="card">
      <div class="score-section-title">🎯 TPAT - Thai Professional Aptitude Test</div>
      <div class="warning-box mb-3" style="margin:16px 16px 0">
        <span>⚠️</span>
        <span>สอบเฉพาะ TPAT ที่ตรงกับสาขาที่ต้องการเท่านั้น ไม่จำเป็นต้องสอบทุกวิชา</span>
      </div>
      <table class="score-table">
        <thead><tr><th>วิชา</th><th>คะแนนที่ได้</th><th>เต็ม</th><th>%</th></tr></thead>
        <tbody>
          ${tpats.map(t => {
            const val = parseFloat(s[t.key]) || 0;
            const pct = val > 0 ? Math.round(val / t.max * 100) : 0;
            const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--text-muted)';
            return `
              <tr>
                <td>
                  <div style="font-weight:600;font-size:0.88rem">${t.name}</div>
                  <div style="font-size:0.72rem;color:var(--text-muted)">${t.desc}</div>
                </td>
                <td>
                  <input type="number" class="score-input" id="score-${t.key}"
                    value="${s[t.key] || ''}" min="0" max="${t.max}" step="0.5"
                    placeholder="—" oninput="onScoreInput('${t.key}', this.value, ${t.max})">
                  <span id="err-${t.key}" class="score-error hidden">⚠️ เกินคะแนนเต็ม (${t.max})</span>
                </td>
                <td class="score-max">${t.max}</td>
                <td>
                  <span id="pct-${t.key}" style="font-size:0.85rem;font-weight:600;color:${color}">
                    ${val > 0 ? pct + '%' : '—'}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderALevelSection() {
  const s = state.studentData.scores;
  const groups = [
    {
      label: '📐 คณิตศาสตร์และวิทยาศาสตร์',
      subjects: [
        { key: 'amath1', name: 'คณิตศาสตร์ประยุกต์ 1 (พื้นฐาน+เพิ่มเติม)', max: 100 },
        { key: 'amath2', name: 'คณิตศาสตร์ประยุกต์ 2 (พื้นฐาน)', max: 100 },
        { key: 'ascience', name: 'วิทยาศาสตร์ประยุกต์', max: 100 },
        { key: 'aphy', name: 'ฟิสิกส์', max: 100 },
        { key: 'achem', name: 'เคมี', max: 100 },
        { key: 'abio', name: 'ชีววิทยา', max: 100 }
      ]
    },
    {
      label: '🌐 ภาษาและสังคมศาสตร์',
      subjects: [
        { key: 'athai', name: 'ภาษาไทย', max: 100 },
        { key: 'aeng', name: 'ภาษาอังกฤษ', max: 100 },
        { key: 'asocial', name: 'สังคมศาสตร์', max: 100 },
        { key: 'ahist', name: 'ประวัติศาสตร์', max: 100 }
      ]
    },
    {
      label: '🌍 ภาษาต่างประเทศ',
      subjects: [
        { key: 'afre', name: 'ภาษาฝรั่งเศส', max: 100 },
        { key: 'ager', name: 'ภาษาเยอรมัน', max: 100 },
        { key: 'ajpn', name: 'ภาษาญี่ปุ่น', max: 100 },
        { key: 'achn', name: 'ภาษาจีน', max: 100 },
        { key: 'akor', name: 'ภาษาเกาหลี', max: 100 }
      ]
    }
  ];

  return groups.map(g => `
    <div class="card mb-3">
      <div class="score-section-title">${g.label}</div>
      <table class="score-table">
        <thead><tr><th>วิชา</th><th>คะแนนที่ได้</th><th>เต็ม</th><th>%</th></tr></thead>
        <tbody>
          ${g.subjects.map(t => {
            const val = parseFloat(s[t.key]) || 0;
            const pct = val > 0 ? Math.round(val / t.max * 100) : 0;
            const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--text-muted)';
            return `
              <tr>
                <td style="font-size:0.88rem">${t.name}</td>
                <td>
                  <input type="number" class="score-input" id="score-${t.key}"
                    value="${s[t.key] || ''}" min="0" max="${t.max}" step="0.5"
                    placeholder="—" oninput="onScoreInput('${t.key}', this.value, ${t.max})">
                  <span id="err-${t.key}" class="score-error hidden">⚠️ เกินคะแนนเต็ม (${t.max})</span>
                </td>
                <td class="score-max">${t.max}</td>
                <td>
                  <span id="pct-${t.key}" style="font-size:0.85rem;font-weight:600;color:${color}">
                    ${val > 0 ? pct + '%' : '—'}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
}

function getAllTestSubjects() {
  const list = [];
  Object.values(TCAS_DATA.tests).forEach(cat => {
    Object.entries(cat.subjects).forEach(([key, info]) => {
      list.push({ key, name: info.name, max: info.maxScore, icon: info.icon, category: cat.name });
    });
  });
  return list;
}

const MOCK_TEST_FILE_MAX_BYTES = 900 * 1024; // ~900KB per file (localStorage-friendly)

function renderMockTestSection() {
  const container = document.getElementById('mocktest-content');
  if (!container) return;

  const tests = state.studentData.mockTests || [];
  const sorted = [...tests].sort((a, b) => b.date.localeCompare(a.date));

  container.innerHTML = `
    ${state.mockTestFormMode ? renderMockTestForm() : `
      <div class="mb-3">
        <button class="btn btn-primary btn-sm" onclick="openMockTestForm(null)">+ บันทึกผล Mock Test</button>
      </div>
    `}

    ${sorted.length === 0 && !state.mockTestFormMode ? `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="empty-state-icon">🧪</div>
            <div class="empty-state-title">ยังไม่มีผล Mock Test</div>
            <div class="empty-state-desc">บันทึกผลสอบจำลองแต่ละครั้งเพื่อดูพัฒนาการของคะแนนตามเวลา</div>
          </div>
        </div>
      </div>
    ` : `${renderMockTestTrend(sorted)}${(() => {
        const labelWidth = measureMockTestLabelWidth(sorted);
        const editingId = state.mockTestFormMode && state.mockTestFormMode !== 'new' ? state.mockTestFormMode : null;
        return sorted.filter(t => t.id !== editingId).map(t => renderMockTestCard(t, labelWidth)).join('');
      })()}`}
  `;
}

// Measures the widest "icon + subject name" among subjects actually used across
// all sessions, so every session's score table lines up its "คะแนนที่ได้" column
// at the same x-position (a plain <table> can't share column widths across
// separate table elements the way CSS Grid can, so this fills that gap).
function measureMockTestLabelWidth(tests) {
  const subjects = getAllTestSubjects();
  const usedKeys = new Set();
  tests.forEach(t => Object.entries(t.scores || {}).forEach(([k, v]) => {
    if (v !== '' && v != null) usedKeys.add(k);
  }));
  if (!usedKeys.size) return 160;

  const probe = document.createElement('td');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-size:0.85rem;padding:0;left:-9999px;';
  document.body.appendChild(probe);

  let max = 0;
  usedKeys.forEach(k => {
    const info = subjects.find(s => s.key === k);
    if (!info) return;
    probe.textContent = `${info.icon} ${info.name}`;
    const w = probe.getBoundingClientRect().width;
    if (w > max) max = w;
  });
  document.body.removeChild(probe);
  return Math.ceil(max) + 32; // + cell horizontal padding (16px each side)
}

function renderMockTestScoreTable(scores, labelWidth) {
  const subjects = getAllTestSubjects();
  const entries = Object.entries(scores || {}).filter(([k, v]) => v !== '' && v != null);
  if (!entries.length) return `<div style="color:var(--text-muted);font-size:0.85rem">ยังไม่มีคะแนนวิชาบันทึกไว้</div>`;

  const totalWidth = labelWidth + 110 + 70 + 70;
  return `
  <div style="overflow-x:auto">
    <table class="score-table mocktest-score-table" style="width:${totalWidth}px">
      <colgroup>
        <col style="width:${labelWidth}px"><col style="width:110px"><col style="width:70px"><col style="width:70px">
      </colgroup>
      <thead><tr><th>วิชา</th><th>คะแนนที่ได้</th><th>เต็ม</th><th>%</th></tr></thead>
      <tbody>
        ${entries.map(([k, v]) => {
          const info = subjects.find(s => s.key === k);
          if (!info) return '';
          const pct = Math.round(parseFloat(v) / info.max * 100);
          const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
          return `
          <tr>
            <td style="font-size:0.85rem">${info.icon} ${info.name}</td>
            <td class="score-max">${v}</td>
            <td class="score-max">${info.max}</td>
            <td style="font-weight:600;color:${color}">${pct}%</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
}

function renderMockTestTrend(tests) {
  if (!tests.length) return '';

  const subjects = getAllTestSubjects();
  const bySubject = {};
  tests.forEach(t => {
    Object.entries(t.scores || {}).forEach(([k, v]) => {
      if (v === '' || v == null) return;
      (bySubject[k] = bySubject[k] || []).push({ date: t.date, val: parseFloat(v) });
    });
  });

  const rows = Object.entries(bySubject)
    .map(([k, arr]) => {
      const info = subjects.find(s => s.key === k);
      if (!info) return null;
      const sorted = [...arr].sort((a, b) => a.date.localeCompare(b.date));
      const pcts = sorted.map(e => Math.round(e.val / info.max * 100));
      const first = pcts[0], latest = pcts[pcts.length - 1];
      const diff = latest - first;
      return { info, pcts, first, latest, diff };
    })
    .filter(Boolean);

  if (!rows.length) return '';

  return `
  <div class="card mb-3">
    <div class="card-header"><div class="card-title">📈 พัฒนาการรายวิชา</div></div>
    <div class="card-body">
      <div class="mocktest-trend-grid">
        ${rows.map(r => {
          let diffHTML;
          if (r.pcts.length >= 2) {
            const diffColor = r.diff > 0 ? 'var(--success)' : r.diff < 0 ? 'var(--danger)' : 'var(--text-muted)';
            const diffLabel = r.diff > 0 ? `+${r.diff}%` : r.diff < 0 ? `${r.diff}%` : 'ไม่เปลี่ยนแปลง';
            diffHTML = `<div class="mocktest-trend-diff" style="color:${diffColor}">${r.first}% → ${r.latest}% (${diffLabel})</div>`;
          } else {
            diffHTML = `<div class="mocktest-trend-diff" style="color:var(--text-muted)">สอบครั้งเดียว: ${r.first}%</div>`;
          }
          return `
            <div class="mocktest-trend-label">${r.info.icon} ${r.info.name}</div>
            ${renderMockTestTrendBars(r.pcts)}
            ${diffHTML}
          `;
        }).join('')}
      </div>
    </div>
  </div>`;
}

function renderMockTestTrendBars(pcts) {
  return `
  <div class="mocktest-trend-bars">
    ${pcts.map((p, i) => {
      let color;
      if (pcts.length === 1) {
        color = p >= 70 ? 'var(--success)' : p >= 50 ? 'var(--warning)' : 'var(--danger)';
      } else if (i === 0) {
        color = 'var(--text-muted)';
      } else if (i === pcts.length - 1) {
        color = p >= pcts[0] ? 'var(--success)' : 'var(--danger)';
      } else {
        color = 'var(--primary)';
      }
      return `
      <div class="mocktest-trend-bar-col" title="ครั้งที่ ${i + 1}: ${p}%">
        <div class="mocktest-trend-bar-value">${p}</div>
        <div class="mocktest-trend-bar-track">
          <div class="mocktest-trend-bar-fill" style="height:${p}%;background:${color}"></div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderMockTestCard(t, labelWidth) {
  return `
  <div class="card mb-3">
    <div class="card-header">
      <div class="card-title">${calThDateStr(t.date)}${t.source ? ` · ${t.source}` : ''}</div>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" onclick="openMockTestForm('${t.id}')" title="แก้ไข">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteMockTest('${t.id}')" title="ลบ">🗑️</button>
      </div>
    </div>
    <div class="card-body">
      ${renderMockTestScoreTable(t.scores, labelWidth)}
      ${(t.files || []).length ? `
        <div class="planner-ev-files mt-2">
          ${t.files.map(f => `
            <div class="planner-ev-file">
              ${f.dataUrl.startsWith('data:image') ? `<img src="${f.dataUrl}" class="planner-ev-file-thumb">` : `<span class="planner-ev-file-icon">📄</span>`}
              <span class="planner-ev-file-name">${f.name}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  </div>`;
}

function renderMockTestForm() {
  const d = state.mockTestDraft;
  const catGroups = [
    { label: '🧠 TGAT', cat: TCAS_DATA.tests.tgat },
    { label: '🎯 TPAT', cat: TCAS_DATA.tests.tpat },
    { label: '📚 A-Level', cat: TCAS_DATA.tests.alevel }
  ];

  return `
  <div class="card mb-3">
    <div class="card-header"><div class="card-title">${d.id ? '✏️ แก้ไขผล Mock Test' : '➕ บันทึกผล Mock Test ใหม่'}</div></div>
    <div class="card-body">
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
        <div class="form-group" style="flex:1;min-width:140px">
          <label class="form-label">วันที่สอบ</label>
          <input type="date" class="form-control" value="${d.date}" oninput="onMockTestDraftInput('date', this.value)">
        </div>
        <div class="form-group" style="flex:2;min-width:200px">
          <label class="form-label">แหล่งที่มา/สถาบัน (ไม่บังคับ)</label>
          <input type="text" class="form-control" list="mocktest-source-list" value="${(d.source || '').replace(/"/g, '&quot;')}" placeholder="เช่น สอบเอง, ติวเตอร์ ABC" oninput="onMockTestDraftInput('source', this.value)">
          <datalist id="mocktest-source-list">
            ${[...new Set((state.studentData.mockTests || []).map(t => t.source).filter(Boolean))].map(s => `<option value="${s.replace(/"/g, '&quot;')}">`).join('')}
          </datalist>
        </div>
      </div>

      ${catGroups.map(g => `
        <div class="criteria-section-title mb-1" style="margin-top:10px">${g.label}</div>
        <table class="score-table">
          <tbody>
            ${Object.entries(g.cat.subjects).map(([key, info]) => `
              <tr>
                <td style="font-size:0.82rem">${info.icon} ${info.name}</td>
                <td>
                  <input type="number" class="score-input" id="mock-score-${key}" value="${d.scores[key] || ''}" min="0" max="${info.maxScore}" step="0.5"
                    placeholder="—" oninput="onMockTestDraftScoreInput('${key}', this.value, ${info.maxScore})">
                  <span id="mock-err-${key}" class="score-error hidden">⚠️ เกินคะแนนเต็ม (${info.maxScore})</span>
                </td>
                <td class="score-max">${info.maxScore}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `).join('')}

      <div class="criteria-section-title mb-1" style="margin-top:10px">📎 แนบใบคะแนน/ใบประกาศ</div>
      <div class="planner-ev-files">
        ${d.files.map((f, idx) => `
          <div class="planner-ev-file">
            ${f.dataUrl.startsWith('data:image') ? `<img src="${f.dataUrl}" class="planner-ev-file-thumb">` : `<span class="planner-ev-file-icon">📄</span>`}
            <span class="planner-ev-file-name">${f.name}</span>
            <button type="button" class="planner-ev-file-remove" onclick="removeMockTestDraftFile(${idx})">✕</button>
          </div>
        `).join('')}
      </div>
      <label class="btn btn-outline btn-sm planner-ev-upload-btn">
        📎 แนบไฟล์
        <input type="file" accept="image/*,.pdf" style="display:none" onchange="onMockTestFileSelect(this)">
      </label>

      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-primary btn-sm" onclick="saveMockTestDraft()">บันทึก</button>
        <button class="btn btn-ghost btn-sm" onclick="cancelMockTestForm()">ยกเลิก</button>
      </div>
    </div>
  </div>`;
}

function openMockTestForm(id) {
  if (id) {
    const existing = state.studentData.mockTests.find(t => t.id === id);
    if (!existing) return;
    state.mockTestDraft = JSON.parse(JSON.stringify(existing));
    state.mockTestFormMode = id;
  } else {
    state.mockTestDraft = { id: null, date: studyLogYMD(new Date()), source: '', scores: {}, files: [] };
    state.mockTestFormMode = 'new';
  }
  renderMockTestSection();
}

function cancelMockTestForm() {
  state.mockTestDraft = null;
  state.mockTestFormMode = null;
  renderMockTestSection();
}

function onMockTestDraftInput(field, value) {
  if (!state.mockTestDraft) return;
  state.mockTestDraft[field] = value;
}

function onMockTestDraftScoreInput(key, value, max) {
  if (!state.mockTestDraft) return;
  const errEl = document.getElementById(`mock-err-${key}`);
  const inputEl = document.getElementById(`mock-score-${key}`);

  if (value === '' || value === null) {
    if (errEl) errEl.classList.add('hidden');
    if (inputEl) inputEl.classList.remove('error');
    state.mockTestDraft.scores[key] = '';
    return;
  }

  const val = parseFloat(value);
  if (isNaN(val) || val < 0 || val > max) {
    if (errEl) errEl.classList.remove('hidden');
    if (inputEl) inputEl.classList.add('error');
    return; // do not write an out-of-range value into the draft
  }

  if (errEl) errEl.classList.add('hidden');
  if (inputEl) inputEl.classList.remove('error');
  state.mockTestDraft.scores[key] = value;
}

function onMockTestFileSelect(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  if (file.size > MOCK_TEST_FILE_MAX_BYTES) {
    showToast('⚠️ ไฟล์ใหญ่เกินไป (สูงสุด ~900KB ต่อไฟล์)', 'error');
    inputEl.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.mockTestDraft.files.push({ name: file.name, dataUrl: reader.result });
    renderMockTestSection();
  };
  reader.readAsDataURL(file);
}

function removeMockTestDraftFile(idx) {
  state.mockTestDraft.files.splice(idx, 1);
  renderMockTestSection();
}

function saveMockTestDraft() {
  const d = state.mockTestDraft;
  if (!d.date) {
    showToast('⚠️ กรุณาระบุวันที่สอบ', 'error');
    return;
  }
  const hasAnyScore = Object.values(d.scores).some(v => v !== '' && v != null);
  if (!hasAnyScore) {
    showToast('⚠️ กรุณากรอกคะแนนอย่างน้อย 1 วิชา', 'error');
    return;
  }
  const subjects = getAllTestSubjects();
  const overMax = Object.entries(d.scores).find(([key, v]) => {
    if (v === '' || v == null) return false;
    const info = subjects.find(s => s.key === key);
    return info && parseFloat(v) > info.max;
  });
  if (overMax) {
    showToast('⚠️ มีคะแนนเกินคะแนนเต็ม กรุณาแก้ไขก่อนบันทึก', 'error');
    return;
  }
  if (d.id) {
    const existing = state.studentData.mockTests.find(t => t.id === d.id);
    Object.assign(existing, d);
  } else {
    d.id = 'mock-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    state.studentData.mockTests.push(d);
  }
  state.mockTestDraft = null;
  state.mockTestFormMode = null;
  debounceSave(200);
  renderMockTestSection();
}

function deleteMockTest(id) {
  if (!confirm('ต้องการลบผล Mock Test นี้ใช่หรือไม่?')) return;
  const list = state.studentData.mockTests;
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) return;
  list.splice(idx, 1);
  debounceSave(200);
  renderMockTestSection();
}

// ============================================================
// MISTAKE LOG (สมุดบันทึกข้อผิดพลาด)
// ============================================================
function renderMistakeLogPage() {
  renderMistakeLogSection();
}

function renderMistakeLogSection() {
  const container = document.getElementById('mistakelog-content');
  if (!container) return;

  const log = state.studentData.mistakeLog || [];
  const subjects = getAllTestSubjects();
  const filter = state.mistakeLogSubjectFilter;
  const filtered = (filter === 'all' ? log : log.filter(e => e.subject === filter))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  const editingId = state.mistakeLogFormMode && state.mistakeLogFormMode !== 'new' ? state.mistakeLogFormMode : null;

  const usedSubjectKeys = [...new Set(log.map(e => e.subject))];

  container.innerHTML = `
    <div class="mb-3" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-primary btn-sm" onclick="openMistakeLogForm(null)">+ บันทึกข้อผิดพลาด</button>
      ${usedSubjectKeys.length ? `
        <select class="form-control" style="width:auto" onchange="onMistakeLogFilterChange(this.value)">
          <option value="all" ${filter === 'all' ? 'selected' : ''}>ทุกวิชา</option>
          ${usedSubjectKeys.map(k => {
            const info = subjects.find(s => s.key === k);
            if (!info) return '';
            return `<option value="${k}" ${filter === k ? 'selected' : ''}>${info.icon} ${info.name}</option>`;
          }).join('')}
        </select>
      ` : ''}
    </div>

    ${state.mistakeLogFormMode ? renderMistakeLogForm() : ''}

    ${filtered.length === 0 ? `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="empty-state-icon">📕</div>
            <div class="empty-state-title">${log.length === 0 ? 'ยังไม่มีบันทึกข้อผิดพลาด' : 'ไม่มีรายการในวิชานี้'}</div>
            <div class="empty-state-desc">บันทึกข้อผิดพลาดที่เจอ พร้อมสาเหตุและเฉลยที่ถูกต้อง จะได้ไม่พลาดซ้ำ</div>
          </div>
        </div>
      </div>
    ` : filtered.filter(e => e.id !== editingId).map(renderMistakeLogCard).join('')}
  `;
}

function onMistakeLogFilterChange(value) {
  state.mistakeLogSubjectFilter = value;
  renderMistakeLogSection();
}

function renderMistakeLogCard(entry) {
  const subjects = getAllTestSubjects();
  const info = subjects.find(s => s.key === entry.subject);
  return `
  <div class="card mb-3">
    <div class="card-header">
      <div class="card-title">${calThDateStr(entry.date)}${info ? ` · ${info.icon} ${info.name}` : ''}</div>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" onclick="openMistakeLogForm('${entry.id}')" title="แก้ไข">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="deleteMistakeLog('${entry.id}')" title="ลบ">🗑️</button>
      </div>
    </div>
    <div class="card-body">
      ${entry.topic ? `<div class="mb-2"><strong>โจทย์/หัวข้อ:</strong> ${entry.topic}</div>` : ''}
      ${entry.reason ? `<div class="mb-2"><strong>สาเหตุที่ผิด:</strong> ${entry.reason}</div>` : ''}
      ${entry.correctAnswer ? `<div class="mb-2"><strong>เฉลยที่ถูกต้อง:</strong> ${entry.correctAnswer}</div>` : ''}
      ${(entry.files || []).length ? `
        <div class="planner-ev-files mt-2">
          ${entry.files.map(f => `
            <div class="planner-ev-file">
              ${f.dataUrl.startsWith('data:image') ? `<img src="${f.dataUrl}" class="planner-ev-file-thumb">` : `<span class="planner-ev-file-icon">📄</span>`}
              <span class="planner-ev-file-name">${f.name}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  </div>`;
}

function renderMistakeLogForm() {
  const d = state.mistakeLogDraft;
  const subjects = getAllTestSubjects();

  return `
  <div class="card mb-3">
    <div class="card-header"><div class="card-title">${d.id ? '✏️ แก้ไขบันทึกข้อผิดพลาด' : '➕ บันทึกข้อผิดพลาดใหม่'}</div></div>
    <div class="card-body">
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px">
        <div class="form-group" style="flex:1;min-width:140px">
          <label class="form-label">วันที่</label>
          <input type="date" class="form-control" value="${d.date}" oninput="onMistakeLogDraftInput('date', this.value)">
        </div>
        <div class="form-group" style="flex:2;min-width:200px">
          <label class="form-label">วิชา</label>
          <select class="form-control" onchange="onMistakeLogDraftInput('subject', this.value)">
            <option value="">— เลือกวิชา —</option>
            ${subjects.map(s => `<option value="${s.key}" ${d.subject === s.key ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group mb-2">
        <label class="form-label">โจทย์/หัวข้อที่ผิด</label>
        <input type="text" class="form-control" value="${(d.topic || '').replace(/"/g, '&quot;')}" placeholder="เช่น โจทย์อนุพันธ์ของฟังก์ชันประกอบ" oninput="onMistakeLogDraftInput('topic', this.value)">
      </div>
      <div class="form-group mb-2">
        <label class="form-label">สาเหตุที่ผิด</label>
        <textarea class="form-control" rows="2" placeholder="เช่น จำสูตรผิด, อ่านโจทย์ไม่ครบ" oninput="onMistakeLogDraftInput('reason', this.value)">${d.reason || ''}</textarea>
      </div>
      <div class="form-group mb-2">
        <label class="form-label">เฉลย/แนวคิดที่ถูกต้อง</label>
        <textarea class="form-control" rows="2" placeholder="อธิบายวิธีทำที่ถูกต้อง" oninput="onMistakeLogDraftInput('correctAnswer', this.value)">${d.correctAnswer || ''}</textarea>
      </div>

      <div class="criteria-section-title mb-1" style="margin-top:10px">📎 แนบรูปโจทย์</div>
      <div class="planner-ev-files">
        ${d.files.map((f, idx) => `
          <div class="planner-ev-file">
            ${f.dataUrl.startsWith('data:image') ? `<img src="${f.dataUrl}" class="planner-ev-file-thumb">` : `<span class="planner-ev-file-icon">📄</span>`}
            <span class="planner-ev-file-name">${f.name}</span>
            <button type="button" class="planner-ev-file-remove" onclick="removeMistakeLogDraftFile(${idx})">✕</button>
          </div>
        `).join('')}
      </div>
      <label class="btn btn-outline btn-sm planner-ev-upload-btn">
        📎 แนบไฟล์
        <input type="file" accept="image/*,.pdf" style="display:none" onchange="onMistakeLogFileSelect(this)">
      </label>

      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn btn-primary btn-sm" onclick="saveMistakeLogDraft()">บันทึก</button>
        <button class="btn btn-ghost btn-sm" onclick="cancelMistakeLogForm()">ยกเลิก</button>
      </div>
    </div>
  </div>`;
}

function openMistakeLogForm(id) {
  if (id) {
    const existing = state.studentData.mistakeLog.find(e => e.id === id);
    if (!existing) return;
    state.mistakeLogDraft = JSON.parse(JSON.stringify(existing));
    state.mistakeLogFormMode = id;
  } else {
    state.mistakeLogDraft = { id: null, date: studyLogYMD(new Date()), subject: '', topic: '', reason: '', correctAnswer: '', files: [] };
    state.mistakeLogFormMode = 'new';
  }
  renderMistakeLogSection();
}

function cancelMistakeLogForm() {
  state.mistakeLogDraft = null;
  state.mistakeLogFormMode = null;
  renderMistakeLogSection();
}

function onMistakeLogDraftInput(field, value) {
  if (!state.mistakeLogDraft) return;
  state.mistakeLogDraft[field] = value;
}

function onMistakeLogFileSelect(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  if (file.size > MOCK_TEST_FILE_MAX_BYTES) {
    showToast('⚠️ ไฟล์ใหญ่เกินไป (สูงสุด ~900KB ต่อไฟล์)', 'error');
    inputEl.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.mistakeLogDraft.files.push({ name: file.name, dataUrl: reader.result });
    renderMistakeLogSection();
  };
  reader.readAsDataURL(file);
}

function removeMistakeLogDraftFile(idx) {
  state.mistakeLogDraft.files.splice(idx, 1);
  renderMistakeLogSection();
}

function saveMistakeLogDraft() {
  const d = state.mistakeLogDraft;
  if (!d.date) {
    showToast('⚠️ กรุณาระบุวันที่', 'error');
    return;
  }
  if (!d.subject) {
    showToast('⚠️ กรุณาเลือกวิชา', 'error');
    return;
  }
  if (!d.topic.trim() && !d.reason.trim()) {
    showToast('⚠️ กรุณาระบุโจทย์/หัวข้อ หรือสาเหตุที่ผิดอย่างน้อย 1 อย่าง', 'error');
    return;
  }
  if (d.id) {
    const existing = state.studentData.mistakeLog.find(e => e.id === d.id);
    Object.assign(existing, d);
  } else {
    d.id = 'mistake-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    state.studentData.mistakeLog.push(d);
  }
  state.mistakeLogDraft = null;
  state.mistakeLogFormMode = null;
  debounceSave(200);
  renderMistakeLogSection();
}

function deleteMistakeLog(id) {
  if (!confirm('ต้องการลบบันทึกนี้ใช่หรือไม่?')) return;
  const list = state.studentData.mistakeLog;
  const idx = list.findIndex(e => e.id === id);
  if (idx === -1) return;
  list.splice(idx, 1);
  debounceSave(200);
  renderMistakeLogSection();
}

function onScoreInput(key, value, max) {
  const pctEl = document.getElementById(`pct-${key}`);
  const errEl = document.getElementById(`err-${key}`);
  const inputEl = document.getElementById(`score-${key}`);
  if (!pctEl) return;
  const val = parseFloat(value);
  if (isNaN(val) || value === '') {
    pctEl.textContent = '—';
    pctEl.style.color = 'var(--text-muted)';
    if (errEl) errEl.classList.add('hidden');
    if (inputEl) inputEl.classList.remove('error');
    state.studentData.scores[key] = '';
    debounceSave();
    return;
  }
  if (val < 0 || val > max) {
    pctEl.textContent = '!';
    pctEl.style.color = 'var(--danger)';
    if (errEl) errEl.classList.remove('hidden');
    if (inputEl) inputEl.classList.add('error');
    return;
  }
  if (errEl) errEl.classList.add('hidden');
  if (inputEl) inputEl.classList.remove('error');
  const pct = Math.round(val / max * 100);
  pctEl.textContent = pct + '%';
  pctEl.style.color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  state.studentData.scores[key] = value;
  debounceSave();
}

function initScoreInputs() {}

function saveScores() {
  // Block if any score or GPA input has an error
  const errorInputs = document.querySelectorAll('#scores-content .score-input.error');
  if (errorInputs.length > 0) {
    showToast('⚠️ กรุณาแก้ไขค่าที่เกินค่าสูงสุดก่อนบันทึก', 'error');
    errorInputs[0].focus();
    errorInputs[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // GPA — validate values before saving
  const gpaKeys = ['m401', 'm402', 'm411', 'm412', 'm421', 'm422', 'cumulative'];
  let gpaHasError = false;
  gpaKeys.forEach(k => {
    const el = document.getElementById(`gpa-${k}`);
    if (el && el.value !== '') {
      const val = parseFloat(el.value);
      if (!isNaN(val) && (val < 0 || val > 4)) {
        gpaHasError = true;
      }
    }
    if (el) state.studentData.gpa[k] = el.value;
  });

  if (gpaHasError) {
    showToast('⚠️ กรุณาแก้ไขเกรดเฉลี่ยที่เกิน 4.00 ก่อนบันทึก', 'error');
    return;
  }

  // Scores
  const scoreKeys = Object.keys(TCAS_DATA.tests.tgat.subjects)
    .concat(Object.keys(TCAS_DATA.tests.tpat.subjects))
    .concat(Object.keys(TCAS_DATA.tests.alevel.subjects));

  scoreKeys.forEach(k => {
    const el = document.getElementById(`score-${k}`);
    if (el) state.studentData.scores[k] = el.value;
  });

  saveData();
  showToast('✅ บันทึกคะแนนสอบแล้ว');
}

// ============================================================
// PORTFOLIO
// ============================================================
function renderPortfolio() {
  const container = document.getElementById('portfolio-content');
  if (!container) return;

  container.innerHTML = `
    <div class="tab-bar">
      <button class="tab-btn active" onclick="switchPortfolioTab(this,'camps')">⛺ ค่าย</button>
      <button class="tab-btn" onclick="switchPortfolioTab(this,'awards')">🏆 รางวัล</button>
      <button class="tab-btn" onclick="switchPortfolioTab(this,'competitions')">🥊 การแข่งขัน</button>
      <button class="tab-btn" onclick="switchPortfolioTab(this,'activities')">🎯 กิจกรรม</button>
      <button class="tab-btn" onclick="switchPortfolioTab(this,'volunteer')">💚 อาสาสมัคร</button>
    </div>

    <div id="port-tab-camps" class="tab-panel active">
      ${renderPortfolioList('camps', '⛺', 'ค่ายวิชาการและกิจกรรม', 'ยังไม่มีค่าย', 'showAddCampModal')}
    </div>
    <div id="port-tab-awards" class="tab-panel">
      ${renderPortfolioList('awards', '🏆', 'รางวัลที่ได้รับ', 'ยังไม่มีรางวัล', 'showAddAwardModal')}
    </div>
    <div id="port-tab-competitions" class="tab-panel">
      ${renderPortfolioList('competitions', '🥊', 'การแข่งขัน', 'ยังไม่มีการแข่งขัน', 'showAddCompModal')}
    </div>
    <div id="port-tab-activities" class="tab-panel">
      ${renderPortfolioList('activities', '🎯', 'กิจกรรมต่างๆ', 'ยังไม่มีกิจกรรม', 'showAddActivityModal')}
    </div>
    <div id="port-tab-volunteer" class="tab-panel">
      ${renderPortfolioList('volunteer', '💚', 'งานอาสาสมัคร', 'ยังไม่มีงานอาสา', 'showAddVolunteerModal')}
    </div>
  `;
}

function switchPortfolioTab(btn, tab) {
  const container = document.getElementById('portfolio-content');
  container?.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  container?.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`port-tab-${tab}`);
  if (panel) panel.classList.add('active');
}

function renderPortfolioList(type, defaultIcon, title, emptyMsg, addFnName) {
  const items = state.studentData.portfolio[type] || [];
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="icon">${defaultIcon}</span>${title} (${items.length})</div>
        <button class="btn btn-primary btn-sm" onclick="${addFnName}()">+ เพิ่ม</button>
      </div>
      <div class="card-body" id="port-list-${type}">
        ${items.length === 0 ? `
          <div class="empty-state" style="padding:32px 16px">
            <div class="empty-state-icon">${defaultIcon}</div>
            <div class="empty-state-title">${emptyMsg}</div>
            <div class="empty-state-desc">คลิก "เพิ่ม" เพื่อเพิ่มข้อมูล</div>
          </div>
        ` : items.map((item, idx) => renderPortfolioItem(type, item, idx, defaultIcon)).join('')}
      </div>
    </div>
  `;
}

function renderPortfolioItem(type, item, idx, defaultIcon) {
  const levelInfo = type === 'awards' || type === 'competitions'
    ? TCAS_DATA.awardLevels.find(l => l.id === item.level)
    : null;

  return `
    <div class="portfolio-item" id="port-item-${type}-${idx}">
      <div class="portfolio-item-icon" style="background:${levelInfo ? levelInfo.color + '20' : 'var(--surface-3)'}">
        ${item.icon || defaultIcon}
      </div>
      <div class="portfolio-item-info">
        <div class="portfolio-item-title">${item.name || item.title || 'ไม่ระบุชื่อ'}</div>
        <div class="portfolio-item-meta">
          ${item.year ? `<span>📅 ${item.year}</span>` : ''}
          ${levelInfo ? `<span class="badge" style="background:${levelInfo.color}20;color:${levelInfo.color}">${levelInfo.name}</span>` : ''}
          ${item.organizer ? `<span>🏛️ ${item.organizer}</span>` : ''}
          ${item.result ? `<span>🏅 ${item.result}</span>` : ''}
          ${item.hours ? `<span>⏰ ${item.hours} ชั่วโมง</span>` : ''}
        </div>
        ${item.description ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">${item.description}</div>` : ''}
      </div>
      <div class="portfolio-item-actions">
        <button class="btn btn-ghost btn-sm" onclick="removePortfolioItem('${type}', ${idx})" title="ลบ">🗑️</button>
      </div>
    </div>
  `;
}

function removePortfolioItem(type, idx) {
  if (!confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) return;
  state.studentData.portfolio[type].splice(idx, 1);
  saveData();
  renderPortfolio();
  showToast('🗑️ ลบรายการแล้ว');
}

// ---- Add Item Modals ----
function showAddCampModal() {
  showGenericAddModal('⛺ เพิ่มค่าย', `
    <div class="form-group">
      <label class="form-label">ชื่อค่าย <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" placeholder="เช่น ค่ายวิทยาศาสตร์ สสวท.">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ประเภทค่าย</label>
        <select class="form-control" id="add-icon">
          ${TCAS_DATA.campTypes.map(c => `<option value="${c.icon}">${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">ปีที่เข้าร่วม</label>
        <input type="text" class="form-control" id="add-year" placeholder="เช่น 2568">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">หน่วยงานผู้จัด</label>
      <input type="text" class="form-control" id="add-organizer" placeholder="เช่น สสวท., มหาวิทยาลัยจุฬา">
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียดเพิ่มเติม</label>
      <textarea class="form-control" id="add-description" placeholder="กิจกรรมที่ทำ ทักษะที่ได้รับ..."></textarea>
    </div>
  `, () => savePortfolioItem('camps', {
    name: getVal('add-name'),
    icon: getVal('add-icon'),
    year: getVal('add-year'),
    organizer: getVal('add-organizer'),
    description: getVal('add-description')
  }));
}

function showAddAwardModal() {
  showGenericAddModal('🏆 เพิ่มรางวัล', `
    <div class="form-group">
      <label class="form-label">ชื่อรางวัล <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" placeholder="เช่น รางวัลชนะเลิศการประกวดโครงงานวิทยาศาสตร์">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ระดับรางวัล <span class="required">*</span></label>
        <select class="form-control" id="add-level">
          ${TCAS_DATA.awardLevels.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">ลำดับที่ได้รับ</label>
        <input type="text" class="form-control" id="add-result" placeholder="เช่น รางวัลที่ 1, เหรียญทอง">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ปีที่ได้รับ</label>
        <input type="text" class="form-control" id="add-year" placeholder="เช่น 2568">
      </div>
      <div class="form-group">
        <label class="form-label">หน่วยงานผู้มอบ</label>
        <input type="text" class="form-control" id="add-organizer" placeholder="เช่น สสวท.">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียด</label>
      <textarea class="form-control" id="add-description" placeholder="รายละเอียดรางวัล..."></textarea>
    </div>
  `, () => savePortfolioItem('awards', {
    name: getVal('add-name'),
    icon: '🏆',
    level: getVal('add-level'),
    result: getVal('add-result'),
    year: getVal('add-year'),
    organizer: getVal('add-organizer'),
    description: getVal('add-description')
  }));
}

function showAddCompModal() {
  showGenericAddModal('🥊 เพิ่มการแข่งขัน', `
    <div class="form-group">
      <label class="form-label">ชื่อการแข่งขัน <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" placeholder="เช่น การแข่งขันคณิตศาสตร์โอลิมปิก">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ระดับ</label>
        <select class="form-control" id="add-level">
          ${TCAS_DATA.awardLevels.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">ผลการแข่งขัน</label>
        <input type="text" class="form-control" id="add-result" placeholder="เช่น เหรียญทอง, อันดับ 3">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ปี</label>
        <input type="text" class="form-control" id="add-year" placeholder="เช่น 2568">
      </div>
      <div class="form-group">
        <label class="form-label">ผู้จัด</label>
        <input type="text" class="form-control" id="add-organizer">
      </div>
    </div>
  `, () => savePortfolioItem('competitions', {
    name: getVal('add-name'),
    icon: '🥊',
    level: getVal('add-level'),
    result: getVal('add-result'),
    year: getVal('add-year'),
    organizer: getVal('add-organizer')
  }));
}

function showAddActivityModal() {
  showGenericAddModal('🎯 เพิ่มกิจกรรม', `
    <div class="form-group">
      <label class="form-label">ชื่อกิจกรรม <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" placeholder="เช่น ประธานสภานักเรียน, กิจกรรมชุมนุม">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ปี</label>
        <input type="text" class="form-control" id="add-year" placeholder="เช่น 2567-2568">
      </div>
      <div class="form-group">
        <label class="form-label">บทบาท</label>
        <input type="text" class="form-control" id="add-result" placeholder="เช่น ประธาน, สมาชิก">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียด</label>
      <textarea class="form-control" id="add-description"></textarea>
    </div>
  `, () => savePortfolioItem('activities', {
    name: getVal('add-name'),
    icon: '🎯',
    year: getVal('add-year'),
    result: getVal('add-result'),
    description: getVal('add-description')
  }));
}

function showAddVolunteerModal() {
  showGenericAddModal('💚 เพิ่มงานอาสาสมัคร', `
    <div class="form-group">
      <label class="form-label">ชื่อกิจกรรม <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" placeholder="เช่น ค่ายอาสาพัฒนาโรงเรียน">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">จำนวนชั่วโมง</label>
        <input type="number" class="form-control" id="add-hours" placeholder="เช่น 48">
      </div>
      <div class="form-group">
        <label class="form-label">ปี</label>
        <input type="text" class="form-control" id="add-year" placeholder="เช่น 2568">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">หน่วยงาน/องค์กร</label>
      <input type="text" class="form-control" id="add-organizer">
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียด</label>
      <textarea class="form-control" id="add-description"></textarea>
    </div>
  `, () => savePortfolioItem('volunteer', {
    name: getVal('add-name'),
    icon: '💚',
    hours: getVal('add-hours'),
    year: getVal('add-year'),
    organizer: getVal('add-organizer'),
    description: getVal('add-description')
  }));
}

function savePortfolioItem(type, item) {
  if (!item.name && !item.title) { showToast('⚠️ กรุณากรอกชื่อ'); return false; }
  if (!state.studentData.portfolio[type]) state.studentData.portfolio[type] = [];
  state.studentData.portfolio[type].push(item);
  saveData();
  closeModal();
  renderPortfolio();
  // Re-activate the correct tab
  const tabMap = { camps: 'camps', awards: 'awards', competitions: 'competitions', activities: 'activities', volunteer: 'volunteer' };
  const btn = document.querySelector(`[onclick*="switchPortfolioTab(this,'${tabMap[type]}')"]`);
  if (btn) switchPortfolioTab(btn, tabMap[type]);
  showToast('✅ เพิ่มข้อมูลแล้ว');
  return true;
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ---- Generic Modal ----
function showGenericAddModal(title, bodyHTML, onSave) {
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const saveBtn = document.getElementById('modal-save-btn');

  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHTML;
  saveBtn.onclick = () => { if (onSave() !== false) {} };
  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay')?.classList.remove('active');
}

// ============================================================
// UNIVERSITY SEARCH
// ============================================================
function renderUniversitySearch() {
  const container = document.getElementById('university-content');
  if (!container) return;

  const categories = ['all', ...new Set(TCAS_DATA.programs.map(p => p.category))].sort();
  const universities = ['all', ...TCAS_DATA.universities.map(u => u.id)];

  container.innerHTML = `
    <div class="tab-bar">
      <button class="tab-btn active" onclick="switchUniTab(this,'programs')">🎓 สาขา/หลักสูตร</button>
      <button class="tab-btn" onclick="switchUniTab(this,'universities')">🏛️ มหาวิทยาลัย</button>
      <button class="tab-btn" onclick="switchUniTab(this,'wishlist')">❤️ รายการที่สนใจ (${state.wishlist.length})</button>
    </div>

    <div id="uni-tab-programs" class="tab-panel active">
      <div class="search-bar">
        <div class="search-input-wrap">
          <span class="search-input-icon">🔍</span>
          <input type="text" class="search-input" id="prog-search"
            placeholder="ค้นหาสาขา คณะ หรือมหาวิทยาลัย..."
            value="${state.searchQuery}"
            oninput="state.searchQuery=this.value; renderProgramGrid()">
        </div>
        <select class="form-control" style="width:auto" id="prog-uni-filter"
          onchange="state.selectedUniversity=this.value; renderProgramGrid()">
          <option value="all">ทุกมหาวิทยาลัย</option>
          ${TCAS_DATA.universities.map(u =>
            `<option value="${u.id}" ${state.selectedUniversity === u.id ? 'selected' : ''}>${u.shortName} - ${u.name.substring(0, 20)}${u.name.length > 20 ? '...' : ''}</option>`
          ).join('')}
        </select>
      </div>
      <div class="filter-chips" id="cat-filter-chips">
        ${['all', ...new Set(TCAS_DATA.programs.map(p => p.category))].sort().map(cat => `
          <button class="filter-chip ${state.selectedCategory === cat ? 'active' : ''}"
            onclick="state.selectedCategory='${cat}'; document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active')); this.classList.add('active'); renderProgramGrid()">
            ${getCategoryIcon(cat)} ${cat === 'all' ? 'ทั้งหมด' : cat}
          </button>
        `).join('')}
      </div>
      <div id="program-grid" class="program-list"></div>
    </div>

    <div id="uni-tab-universities" class="tab-panel">
      ${renderUniversityList()}
    </div>

    <div id="uni-tab-wishlist" class="tab-panel">
      <div id="wishlist-content"></div>
    </div>
  `;

  renderProgramGrid();
}

function switchUniTab(btn, tab) {
  const container = document.getElementById('university-content');
  container?.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  container?.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`uni-tab-${tab}`);
  if (panel) panel.classList.add('active');
  if (tab === 'wishlist') renderWishlistContent();
}

function getCategoryIcon(cat) {
  const icons = {
    'all': '🌐', 'สาธารณสุข': '🏥', 'วิศวกรรม': '⚙️', 'วิทยาศาสตร์': '🔬',
    'สังคมศาสตร์': '🌏', 'มนุษยศาสตร์': '📖', 'บริหาร': '💼', 'ครุศาสตร์': '📚',
    'สถาปัตยกรรม': '🏛️', 'ศิลปะ': '🎨', 'เกษตร': '🌾'
  };
  return icons[cat] || '🎓';
}

function renderProgramGrid() {
  const grid = document.getElementById('program-grid');
  if (!grid) return;

  const q = state.searchQuery.toLowerCase();
  const cat = state.selectedCategory;
  const uni = state.selectedUniversity;
  const ROUND_SHORT = ['Portfolio', 'โควตา', 'Admission', 'รับตรง'];

  let filtered = TCAS_DATA.programs.filter(p => {
    const uniObj = getUniversityById(p.universityId);
    const matchQ = !q ||
      p.program.toLowerCase().includes(q) ||
      p.faculty.toLowerCase().includes(q) ||
      (uniObj && uniObj.name.toLowerCase().includes(q)) ||
      (uniObj && uniObj.shortName.toLowerCase().includes(q));
    const matchCat = cat === 'all' || p.category === cat;
    const matchUni = uni === 'all' || p.universityId === uni;
    return matchQ && matchCat && matchUni;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">ไม่พบสาขาที่ค้นหา</div><div class="empty-state-desc">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</div></div></div></div>`;
    return;
  }

  const hasScores = Object.values(state.studentData.scores).some(s => s !== '');

  grid.innerHTML = filtered.map(p => {
    const uni = getUniversityById(p.universityId);
    const inWishlist = state.wishlist.includes(p.id);
    const compClass = { 'สูงมาก': 'competition-vhigh', 'สูง': 'competition-high', 'ปานกลาง': 'competition-medium', 'ต่ำ': 'competition-low' }[p.competition] || 'competition-medium';
    const compIcon = { 'สูงมาก': '🔥', 'สูง': '📈', 'ปานกลาง': '⚖️', 'ต่ำ': '✅' }[p.competition] || '';
    const match = calculateMatchScore(p, state.studentData);

    return `
      <div class="program-row" style="--prow-color:${uni.color}" onclick="showProgramDetail('${p.id}')">
        <div class="program-row-main">
          <div class="program-row-title">
            <span class="program-row-badge" style="background:${uni.color}">${uni.shortName}</span>
            <span class="program-row-name">${p.program}</span>
          </div>
          <div class="program-row-sub">${p.faculty} · ${p.duration} · ${p.seats} ที่นั่ง</div>
        </div>
        <div class="program-row-rounds">
          ${p.rounds.map(r => `<span class="round-pill" style="--rc:${TCAS_DATA.rounds[r-1].color}">${ROUND_SHORT[r-1]}</span>`).join('')}
        </div>
        <div class="program-row-info">
          <span class="competition-badge ${compClass}">${compIcon} ${p.competition}</span>
          <span class="badge badge-gray" style="font-size:0.68rem">GPA ≥ ${p.minGPA}</span>
        </div>
        <div class="program-row-actions">
          ${hasScores ? `<span class="program-row-pct" style="color:${match.score >= 70 ? 'var(--success)' : match.score >= 45 ? 'var(--warning)' : 'var(--text-muted)'}">${match.score}%</span>` : ''}
          <button class="wishlist-btn ${inWishlist ? 'active' : ''}"
            onclick="event.stopPropagation(); toggleWishlist('${p.id}', this)"
            title="${inWishlist ? 'ลบออกจากรายการสนใจ' : 'เพิ่มรายการสนใจ'}">
            ${inWishlist ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderUniversityList() {
  return TCAS_DATA.universities.map(uni => {
    const programs = getProgramsByUniversity(uni.id);
    return `
      <div class="uni-list-item" onclick="filterByUniversity('${uni.id}')">
        <div class="uni-color-dot" style="background:${uni.color}">${uni.shortName}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:0.92rem">${uni.name}</div>
          <div style="font-size:0.78rem;color:var(--text-muted)">${uni.nameEn} · ${uni.location}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px">${programs.length} สาขา/หลักสูตร</div>
        </div>
        <div>
          <span class="badge badge-${uni.type.includes('รัฐ') ? 'primary' : 'gray'}">${uni.type}</span>
        </div>
      </div>
    `;
  }).join('');
}

function filterByUniversity(uniId) {
  state.selectedUniversity = uniId;
  state.selectedCategory = 'all';
  // Switch to programs tab
  const btn = document.querySelector('[onclick*="switchUniTab(this,\'programs\')"]');
  if (btn) switchUniTab(btn, 'programs');
  // Update select
  const sel = document.getElementById('prog-uni-filter');
  if (sel) sel.value = uniId;
  renderProgramGrid();
}

function toggleWishlist(programId, btn) {
  const idx = state.wishlist.indexOf(programId);
  if (idx >= 0) {
    state.wishlist.splice(idx, 1);
    if (btn) { btn.textContent = '🤍'; btn.classList.remove('active'); }
    showToast('ลบออกจากรายการสนใจแล้ว');
  } else {
    state.wishlist.push(programId);
    if (btn) { btn.textContent = '❤️'; btn.classList.add('active'); }
    showToast('❤️ เพิ่มรายการสนใจแล้ว');
  }
  localStorage.setItem('tcas70_wishlist', JSON.stringify(state.wishlist));
}

function renderWishlistContent() {
  const container = document.getElementById('wishlist-content');
  if (!container) return;

  if (!state.wishlist.length) {
    container.innerHTML = `<div class="card"><div class="card-body"><div class="empty-state"><div class="empty-state-icon">❤️</div><div class="empty-state-title">ยังไม่มีรายการที่สนใจ</div><div class="empty-state-desc">กด 🤍 ที่การ์ดสาขาเพื่อเพิ่มรายการสนใจ</div></div></div></div>`;
    return;
  }

  const programs = state.wishlist.map(id => TCAS_DATA.programs.find(p => p.id === id)).filter(Boolean);
  const ROUND_SHORT = ['Portfolio', 'โควตา', 'Admission', 'รับตรง'];
  const hasScores = Object.values(state.studentData.scores).some(s => s !== '');
  container.innerHTML = `
    <div class="program-list">
      ${programs.map(p => {
        const uni = getUniversityById(p.universityId);
        const match = calculateMatchScore(p, state.studentData);
        const compClass = { 'สูงมาก': 'competition-vhigh', 'สูง': 'competition-high', 'ปานกลาง': 'competition-medium', 'ต่ำ': 'competition-low' }[p.competition] || 'competition-medium';
        const compIcon = { 'สูงมาก': '🔥', 'สูง': '📈', 'ปานกลาง': '⚖️', 'ต่ำ': '✅' }[p.competition] || '';
        return `
          <div class="program-row" style="--prow-color:${uni.color}" onclick="showProgramDetail('${p.id}')">
            <div class="program-row-main">
              <div class="program-row-title">
                <span class="program-row-badge" style="background:${uni.color}">${uni.shortName}</span>
                <span class="program-row-name">${p.program}</span>
              </div>
              <div class="program-row-sub">${p.faculty} · ${p.duration} · ${p.seats} ที่นั่ง</div>
            </div>
            <div class="program-row-rounds">
              ${p.rounds.map(r => `<span class="round-pill" style="--rc:${TCAS_DATA.rounds[r-1].color}">${ROUND_SHORT[r-1]}</span>`).join('')}
            </div>
            <div class="program-row-info">
              <span class="competition-badge ${compClass}">${compIcon} ${p.competition}</span>
              <span class="badge badge-gray" style="font-size:0.68rem">GPA ≥ ${p.minGPA}</span>
            </div>
            <div class="program-row-actions">
              ${hasScores ? `<span class="program-row-pct" style="color:${match.score >= 70 ? 'var(--success)' : match.score >= 45 ? 'var(--warning)' : 'var(--text-muted)'}">${match.score}%</span>` : ''}
              <button class="wishlist-btn active" onclick="event.stopPropagation(); toggleWishlist('${p.id}', this); renderWishlistContent()">❤️</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ---- Program Detail Modal ----
function showProgramDetail(programId) {
  const program = TCAS_DATA.programs.find(p => p.id === programId);
  if (!program) return;

  const uni = getUniversityById(program.universityId);
  const match = calculateMatchScore(program, state.studentData);
  const criteria = program.criteria?.round3 || {};
  const totalWeight = Object.values(criteria).reduce((a, b) => a + b, 0);
  const inWishlist = state.wishlist.includes(programId);

  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const saveBtn = document.getElementById('modal-save-btn');

  modalTitle.innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:8px">
      <span style="width:24px;height:24px;border-radius:6px;background:${uni.color};display:inline-flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:white">${uni.shortName.slice(0,2)}</span>
      ${program.program}
    </span>
  `;

  const hasScores = Object.values(state.studentData.scores).some(s => s !== '');
  const pct = Math.min(match.score, 100);
  const matchColor = pct >= 70 ? 'var(--success)' : pct >= 45 ? 'var(--warning)' : 'var(--text-muted)';

  modalBody.innerHTML = `
    <div class="flex gap-3 mb-4 items-center">
      <div>
        <div style="font-size:1rem;font-weight:700;color:var(--text-primary)">${program.faculty}</div>
        <div style="font-size:0.85rem;color:var(--text-secondary)">${uni.name}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">
          ${program.duration} · ${program.seats} ที่นั่ง · ${program.category}
        </div>
      </div>
      ${hasScores ? `
        <div class="match-score-circle ${pct >= 70 ? 'match-high' : pct >= 45 ? 'match-medium' : 'match-low'}" style="margin-left:auto">
          <span>${pct}%</span>
          <span class="match-score-label">เหมาะสม</span>
        </div>
      ` : ''}
    </div>

    <div class="flex gap-2 mb-3 flex-wrap">
      ${program.rounds.map(r => `
        <span class="badge" style="background:${TCAS_DATA.rounds[r-1].color}20;color:${TCAS_DATA.rounds[r-1].color};font-size:0.78rem">
          รอบ ${r}: ${TCAS_DATA.rounds[r-1].nameEn}
        </span>
      `).join('')}
      <span class="badge badge-gray">GPA ขั้นต่ำ: ${program.minGPA}</span>
    </div>

    ${program.description ? `<p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:16px;line-height:1.7">${program.description}</p>` : ''}

    ${program.specialReq?.length ? `
      <div class="warning-box mb-3">
        <span>📌</span>
        <div>
          <strong>ข้อกำหนดพิเศษ:</strong>
          <div style="margin-top:4px">${program.specialReq.join(' · ')}</div>
        </div>
      </div>
    ` : ''}

    <div class="criteria-section">
      <div class="criteria-section-title">เกณฑ์คะแนน (รอบ 3 Admission)</div>
      <div class="warning-box mb-2" style="font-size:0.78rem">
        <span>⚠️</span>
        <div>เกณฑ์รอบ Admission ปีการศึกษา 2570 ยังไม่มีการประกาศอย่างเป็นทางการจากมหาวิทยาลัย ตัวเลขนี้เป็นค่าอ้างอิงเบื้องต้น จะปรับปรุงให้ตรงตามประกาศจริงเมื่อมหาวิทยาลัยเผยแพร่ (คาดว่าใกล้ พ.ค. 2570)</div>
      </div>
      ${Object.keys(criteria).length === 0 ? '<p style="color:var(--text-muted);font-size:0.85rem">ตรวจสอบเกณฑ์จากมหาวิทยาลัยโดยตรง</p>' : ''}
      ${Object.entries(criteria).map(([key, weight]) => {
        const testInfo = getTestInfo(key);
        const testName = testInfo ? testInfo.name : key.toUpperCase();
        const studentScore = parseFloat(state.studentData.scores[key]) || 0;
        const maxScore = testInfo ? testInfo.maxScore : 100;
        const pct = studentScore > 0 ? studentScore / maxScore * 100 : 0;
        const weightPct = totalWeight > 0 ? (weight / totalWeight * 100).toFixed(0) : 0;
        return `
          <div class="criteria-row">
            <div class="criteria-name">
              <div style="font-size:0.85rem">${testName}</div>
              ${studentScore > 0 ? `<div style="font-size:0.72rem;color:${pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'}">คุณได้: ${studentScore}/${maxScore} (${Math.round(pct)}%)</div>` : ''}
            </div>
            <div class="criteria-weight">${weight}%</div>
            <div class="criteria-bar-wrap">
              <div class="criteria-bar">
                <div class="criteria-bar-fill" style="width:${weightPct}%;background:var(--primary)"></div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    ${hasScores && match.issues.length > 0 ? `
      <div class="warning-box mt-3">
        <span>⚠️</span>
        <div>
          <strong>สิ่งที่ต้องปรับปรุง:</strong>
          <ul style="margin:4px 0 0;padding-left:16px;font-size:0.82rem">
            ${match.issues.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
      </div>
    ` : ''}
  `;

  saveBtn.textContent = inWishlist ? '❤️ ลบออก' : '🤍 เพิ่มสนใจ';
  saveBtn.onclick = () => {
    toggleWishlist(programId, null);
    saveBtn.textContent = state.wishlist.includes(programId) ? '❤️ ลบออก' : '🤍 เพิ่มสนใจ';
    renderProgramGrid();
  };

  overlay.classList.add('active');
}

// ============================================================
// GUIDE
// ============================================================
function renderGuide() {
  const container = document.getElementById('guide-content');
  if (!container) return;

  container.innerHTML = `
    <div class="info-box mb-4">
      <span>ℹ️</span>
      <span>TCAS70 คือระบบการคัดเลือกกลางบุคคลเข้าศึกษาในสถาบันอุดมศึกษา ปีการศึกษา 2570 โดย ทปอ. (สมาคมที่ประชุมอธิการบดีแห่งประเทศไทย)</span>
    </div>

    ${TCAS_DATA.rounds.map(round => `
      <div class="round-detail-card">
        <div class="round-detail-header">
          <div class="round-detail-num" style="background:${round.color}">${round.id}</div>
          <div class="round-detail-info">
            <div class="name">${round.name}</div>
            <div class="period">📅 ${round.period}</div>
          </div>
          <div style="margin-left:auto">
            <span class="badge" style="background:${round.color}20;color:${round.color}">${round.nameEn}</span>
          </div>
        </div>
        <div class="round-detail-body">
          <p>${round.description}</p>
          <div class="criteria-section-title mb-2">สิ่งที่ต้องเตรียม:</div>
          <ul class="req-list">
            ${round.requirements.map(r => `<li>${r}</li>`).join('')}
          </ul>
          ${round.notes ? `<div class="info-box mt-2"><span>💡</span><span>${round.notes}</span></div>` : ''}
        </div>
      </div>
    `).join('')}

    <div class="card mt-4">
      <div class="card-header"><div class="card-title">📚 ข้อสอบที่ใช้ในระบบ TCAS70</div></div>
      <div class="card-body">
        <div class="grid-3">
          <div>
            <div class="section-title" style="font-size:0.88rem">🧠 TGAT (Thai General Aptitude Test)</div>
            <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.8">
              <div>• <strong>TGAT1</strong> ภาษาอังกฤษ (100 คะแนน)</div>
              <div>• <strong>TGAT2</strong> การคิดวิเคราะห์ (100 คะแนน)</div>
              <div>• <strong>TGAT3</strong> สมรรถนะอนาคต (100 คะแนน)</div>
              <div style="margin-top:6px;color:var(--text-muted)">รวม 300 คะแนน</div>
            </div>
          </div>
          <div>
            <div class="section-title" style="font-size:0.88rem">🎯 TPAT (Thai Professional Aptitude Test)</div>
            <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.8">
              <div>• <strong>TPAT1</strong> วิชาเฉพาะแพทย์ กสพท (300 คะแนน)</div>
              <div>• <strong>TPAT2</strong> ศิลปกรรมศาสตร์ (100 คะแนน)</div>
              <div>• <strong>TPAT3</strong> วิทย์-เทคโน-วิศวะ (100 คะแนน)</div>
              <div>• <strong>TPAT4</strong> สถาปัตยกรรม (100 คะแนน)</div>
              <div>• <strong>TPAT5</strong> ครุศาสตร์/ศึกษาศาสตร์ (100 คะแนน)</div>
            </div>
          </div>
          <div>
            <div class="section-title" style="font-size:0.88rem">📚 A-Level (Academic Level)</div>
            <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.8">
              <div>• คณิตศาสตร์ 1/2, วิทยาศาสตร์</div>
              <div>• ฟิสิกส์, เคมี, ชีววิทยา</div>
              <div>• ภาษาไทย, สังคม, ประวัติศาสตร์</div>
              <div>• ภาษาอังกฤษ, ภาษาต่างประเทศ</div>
              <div style="margin-top:6px;color:var(--text-muted)">วิชาละ 100 คะแนน</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-3">
      <div class="card-header"><div class="card-title">📅 ปฏิทิน TCAS70 (ปีการศึกษา 2570)</div></div>
      <div class="card-body">
        <img src="images/tcas70-guide-summary-table.jpg" alt="ปฏิทิน TCAS70 สรุปภาพรวม 4 รอบ" class="cal-hero-img">
        <img src="images/tcas70-guide-tgat-tpat.jpg" alt="ปฏิทินการสมัครสอบและปฏิทินการสอบ TGAT/TPAT" class="cal-hero-img">
        <img src="images/tcas70-guide-alevel.jpg" alt="ปฏิทินการสมัครสอบและปฏิทินการสอบ A-Level" class="cal-hero-img">
        <div class="criteria-section-title mb-2 mt-3">ตารางสรุป</div>
        <table class="score-table">
          <thead><tr><th>กิจกรรม</th><th>ช่วงเวลา (โดยประมาณ)</th></tr></thead>
          <tbody>
            <tr><td>เปิดลงทะเบียน student.mytcas.com</td><td>15 กรกฎาคม 2569</td></tr>
            <tr><td>รอบ 1 Portfolio เปิดรับสมัคร</td><td>15 สิงหาคม 2569 เป็นต้นไป (ตามที่มหาวิทยาลัยกำหนด)</td></tr>
            <tr><td>สมัครสอบ TGAT/TPAT</td><td>4–12 พฤศจิกายน 2569</td></tr>
            <tr><td>สมัครสอบ A-Level</td><td>14–22 มกราคม 2570</td></tr>
            <tr><td>สอบ TGAT + TPAT2/3/4/5</td><td>30 มกราคม – 1 กุมภาพันธ์ 2570</td></tr>
            <tr><td>สอบ TPAT1 (กสพท)</td><td>13 กุมภาพันธ์ 2570</td></tr>
            <tr><td>สอบ A-Level</td><td>13–15 มีนาคม 2570</td></tr>
            <tr><td>รอบ 1 ประกาศผล/ยืนยันสิทธิ์</td><td>10–11 มีนาคม 2570</td></tr>
            <tr><td>รอบ 2 โควตา เปิดรับสมัคร</td><td>13 มีนาคม 2570 เป็นต้นไป</td></tr>
            <tr><td>ประกาศผลคะแนน A-Level</td><td>20 เมษายน 2570</td></tr>
            <tr><td>รอบ 2 ประกาศผล/ยืนยันสิทธิ์</td><td>3–4 พฤษภาคม 2570</td></tr>
            <tr><td>รอบ 3 Admission เปิดรับสมัคร</td><td>7–11 พฤษภาคม 2570</td></tr>
            <tr><td>รอบ 3 ประกาศผล/ยืนยันสิทธิ์</td><td>22–23 พฤษภาคม 2570</td></tr>
            <tr><td>รอบ 4 รับตรงอิสระ</td><td>29 พฤษภาคม – 15 มิถุนายน 2570</td></tr>
          </tbody>
        </table>
        <div class="info-box mt-3">
          <span>⚠️</span>
          <span>กำหนดการอาจเปลี่ยนแปลงได้ ติดตามข้อมูลล่าสุดที่ <strong>www.mytcas.com</strong></span>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// MY TCAS PLANNER
// ============================================================
function renderPlanner() {
  const container = document.getElementById('planner-content');
  if (!container) return;

  const sd = state.studentData;
  if (!sd.planner) sd.planner = { roundPlans: { round1:[], round2:[], round3:[], round4:[] }, completedEvents: {}, eventNotes: {}, selfNote: '' };
  if (!sd.planner.eventNotes) sd.planner.eventNotes = {};
  if (!sd.planner.roundPlans) sd.planner.roundPlans = { round1:[], round2:[], round3:[], round4:[] };
  ['round1','round2','round3','round4'].forEach(k => {
    if (!Array.isArray(sd.planner.roundPlans[k])) sd.planner.roundPlans[k] = [];
  });
  const planner = sd.planner;
  const prefs = getPreferences();

  container.innerHTML = `
    ${renderPlannerTargets(prefs)}
    ${renderPlannerPortfolio(prefs)}
    ${renderPlannerScoreGap(prefs)}
    ${renderPlannerCalendar(planner)}
    ${renderPlannerRounds(planner, prefs)}
    ${renderPlannerContacts()}
    ${renderPlannerNote(planner)}
  `;
}

function renderPlannerTargets(prefs) {
  if (!prefs.length) {
    return `
    <div class="card">
      <div class="card-header"><div class="card-title">🎯 เป้าหมายของฉัน</div></div>
      <div class="card-body">
        <div class="empty-state">
          <div class="empty-state-icon">🎓</div>
          <div class="empty-state-title">ยังไม่ได้เลือกคณะเป้าหมาย</div>
          <div class="empty-state-desc">ไปที่หน้าโปรไฟล์เพื่อเลือกคณะที่สนใจสูงสุด 10 อันดับ</div>
        </div>
        <button class="btn btn-primary btn-sm mt-2" onclick="navigate('profile')">ไปหน้าโปรไฟล์ →</button>
      </div>
    </div>`;
  }
  const rows = prefs.map((pid, i) => {
    const prog = TCAS_DATA.programs.find(p => p.id === pid);
    if (!prog) return '';
    const uni = getUniversityById(prog.universityId);
    return `
      <div class="pref-item">
        <div class="pref-rank" style="background:${i < 3 ? ['#F0A500','#94A3B8','#CD7F32'][i] : 'var(--surface-2)'};color:${i < 3 ? 'white' : 'var(--text-muted)'}">${i + 1}</div>
        <div class="pref-item-body">
          <div class="pref-item-header"><strong>${prog.program}</strong></div>
          <div style="font-size:0.8rem;color:var(--text-muted)">${uni.shortName} · ${prog.faculty}</div>
        </div>
      </div>`;
  }).join('');
  return `
  <div class="card">
    <div class="card-header">
      <div class="card-title">🎯 เป้าหมายของฉัน <span style="font-weight:400;font-size:0.78rem;color:var(--text-muted)">(${prefs.length} คณะ)</span></div>
      <button class="btn btn-outline btn-sm" onclick="navigate('profile')">แก้ไข</button>
    </div>
    <div class="card-body">
      <div class="pref-list">${rows}</div>
    </div>
  </div>`;
}

function renderPlannerPortfolio(prefs) {
  if (!prefs.length) return '';
  const eligible = prefs.filter(pid => {
    const p = TCAS_DATA.programs.find(x => x.id === pid);
    return p && Array.isArray(p.rounds) && p.rounds.includes(1);
  });
  if (!eligible.length) {
    return `
    <div class="card mt-3">
      <div class="card-header"><div class="card-title">📁 ความพร้อมรอบ Portfolio</div></div>
      <div class="card-body">
        <div class="empty-state">
          <div class="empty-state-icon">📁</div>
          <div class="empty-state-title">ไม่มีคณะเป้าหมายที่เปิดรอบ Portfolio</div>
          <div class="empty-state-desc">คณะทั้ง ${prefs.length} ที่คุณเลือกไม่มีคณะที่เปิดรับรอบ 1 Portfolio</div>
        </div>
      </div>
    </div>`;
  }

  const selectedId = state.plannerPortfolioTargetId && eligible.includes(state.plannerPortfolioTargetId) ? state.plannerPortfolioTargetId : eligible[0];
  const program = TCAS_DATA.programs.find(p => p.id === selectedId);
  const uni = getUniversityById(program.universityId);
  const selectedRank = prefs.indexOf(selectedId);

  const options = eligible.map(pid => {
    const p = TCAS_DATA.programs.find(x => x.id === pid);
    const rank = prefs.indexOf(pid);
    return `<option value="${pid}" ${pid === selectedId ? 'selected' : ''}>อันดับ ${rank + 1} — ${p.program} (${getUniversityById(p.universityId).shortName})</option>`;
  }).join('');

  const gpa = parseFloat(state.studentData.gpa.cumulative) || 0;
  const gpaPass = gpa > 0 && gpa >= program.minGPA;

  const portfolioSystemLabel = {
    tcasfolio: { text: 'รับเฉพาะผ่านระบบ TCASFolio', cls: 'badge-primary' },
    independent: { text: 'รับพอร์ตอิสระ (ไม่ผ่าน TCASFolio)', cls: 'badge-purple' },
    both: { text: 'รับทั้ง TCASFolio และพอร์ตอิสระ', cls: 'badge-success' },
    unconfirmed: { text: 'ยังไม่ยืนยัน — ตรวจสอบกับเว็บคณะ', cls: 'badge-gray' }
  }[uni.portfolioSystem || 'unconfirmed'];

  const portfolioCount = ['camps', 'activities', 'awards', 'competitions', 'volunteer']
    .reduce((sum, k) => sum + ((state.studentData.portfolio && state.studentData.portfolio[k]) || []).length, 0);

  return `
  <div class="card mt-3">
    <div class="card-header">
      <div class="card-title">📁 ความพร้อมรอบ Portfolio</div>
    </div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">ดูข้อมูลของคณะ</label>
        <select class="form-control" onchange="onPlannerPortfolioTargetChange(this.value)">${options}</select>
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);margin:10px 0">เทียบกับอันดับ ${selectedRank + 1}: <strong>${program.program}</strong> (${uni.shortName})</div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
        <span class="badge ${gpa > 0 ? (gpaPass ? 'badge-success' : 'badge-danger') : 'badge-gray'}">${gpa > 0 ? `GPAX ${gpa.toFixed(2)} ${gpaPass ? '✓ ผ่านเกณฑ์' : '✗ ต่ำกว่าเกณฑ์'} (ต้องการ ${program.minGPA.toFixed(2)})` : `ยังไม่กรอก GPAX (ต้องการ ${program.minGPA.toFixed(2)})`}</span>
        <span class="badge ${portfolioSystemLabel.cls}">${portfolioSystemLabel.text}</span>
      </div>

      ${program.specialReq.length ? `
        <div class="criteria-section-title mb-2">ข้อกำหนดพิเศษของคณะนี้</div>
        <ul class="plain-list">${program.specialReq.map(r => `<li>📌 ${r}</li>`).join('')}</ul>
      ` : ''}

      <div style="font-size:0.82rem;color:var(--text-muted);margin-top:10px">ผลงาน/กิจกรรมที่บันทึกไว้ในโปรไฟล์: <strong>${portfolioCount} รายการ</strong></div>
      ${portfolioCount === 0 ? `<button class="btn btn-outline btn-sm mt-2" onclick="navigate('portfolio')">ไปบันทึกผลงาน →</button>` : ''}
    </div>
  </div>`;
}

function onPlannerPortfolioTargetChange(programId) {
  state.plannerPortfolioTargetId = programId;
  renderPlanner();
}

function renderPlannerScoreGap(prefs) {
  if (!prefs.length) return '';
  const selectedId = state.plannerTargetId && prefs.includes(state.plannerTargetId) ? state.plannerTargetId : prefs[0];
  const selectedIdx = prefs.indexOf(selectedId);
  const program = TCAS_DATA.programs.find(p => p.id === selectedId);
  if (!program) return '';

  const match = calculateMatchScore(program, state.studentData);
  const uni = getUniversityById(program.universityId);
  const color = match.score >= 70 ? 'var(--success)' : match.score >= 45 ? 'var(--warning)' : 'var(--danger)';

  const options = prefs.map((pid, i) => {
    const p = TCAS_DATA.programs.find(x => x.id === pid);
    if (!p) return '';
    return `<option value="${pid}" ${pid === selectedId ? 'selected' : ''}>อันดับ ${i + 1} — ${p.program} (${getUniversityById(p.universityId).shortName})</option>`;
  }).join('');

  return `
  <div class="card mt-3">
    <div class="card-header">
      <div class="card-title">📊 คะแนนที่ต้องเตรียม</div>
    </div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">ดูข้อมูลของคณะ</label>
        <select class="form-control" onchange="onPlannerTargetChange(this.value)">${options}</select>
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);margin:10px 0">เทียบกับอันดับ ${selectedIdx + 1}: <strong>${program.program}</strong> (${uni.shortName})</div>
      <div class="warning-box mb-2" style="font-size:0.78rem">
        <span>⚠️</span>
        <div>เกณฑ์รอบ Admission ปีการศึกษา 2570 ยังไม่มีการประกาศอย่างเป็นทางการจากมหาวิทยาลัย ตัวเลขนี้เป็นค่าอ้างอิงเบื้องต้น จะปรับปรุงให้ตรงตามประกาศจริงเมื่อมหาวิทยาลัยเผยแพร่ (คาดว่าใกล้ พ.ค. 2570)</div>
      </div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="font-size:1.8rem;font-weight:800;color:${color}">${match.score}%</div>
        <div style="font-size:0.82rem;color:var(--text-muted)">ความพร้อมโดยประมาณ (รอบ Admission)</div>
      </div>
      ${match.details.length ? `<div class="criteria-section-title mb-2">มีคะแนนแล้ว</div><ul class="plain-list">${match.details.map(d => `<li>✅ ${d}</li>`).join('')}</ul>` : ''}
      ${match.issues.length ? `<div class="criteria-section-title mb-2 mt-2">ยังขาด</div><ul class="plain-list">${match.issues.map(d => `<li>⚠️ ${d}</li>`).join('')}</ul>` : ''}
      <button class="btn btn-outline btn-sm mt-2" onclick="navigate('scores')">ไปกรอกคะแนน →</button>
    </div>
  </div>`;
}

function onPlannerTargetChange(programId) {
  state.plannerTargetId = programId;
  renderPlanner();
}

// ---- Monthly calendar with per-event notes + attachments ----
const PLANNER_FILE_MAX_BYTES = 900 * 1024; // ~900KB per file (localStorage-friendly)

function renderPlannerCalendar(planner) {
  const groups = {};
  TCAS70_EVENTS.forEach(ev => {
    const s = new Date(ev.start + 'T00:00:00');
    const key = `${s.getFullYear()}-${String(s.getMonth()).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = { year: s.getFullYear(), month: s.getMonth(), events: [] };
    groups[key].events.push(ev);
  });
  const keys = Object.keys(groups).sort();
  const completed = planner.completedEvents || {};
  const notes = planner.eventNotes || {};

  const monthBlocks = keys.map(key => {
    const g = groups[key];
    const label = `${TH_MONTHS_LONG[g.month]} ${g.year + 543}`;
    const evRows = g.events.map(ev => renderPlannerEventRow(ev, !!completed[ev.id], notes[ev.id])).join('');
    return `
    <div class="planner-month-block">
      <div class="planner-month-label">${label}</div>
      ${evRows}
    </div>`;
  }).join('');

  return `
  <div class="card mt-3">
    <div class="card-header"><div class="card-title">🗓️ ภารกิจรายเดือนของฉัน</div></div>
    <div class="card-body">
      <div class="info-box mb-3"><span>ℹ️</span><span>ดึงกำหนดการจากปฏิทิน TCAS70 มาให้อัตโนมัติ ติ๊กเมื่อทำเสร็จแล้ว กดไอคอน 📝 เพื่อบันทึกรายละเอียดหรือแนบหลักฐาน</span></div>
      ${monthBlocks}
    </div>
  </div>`;
}

function renderPlannerEventRow(ev, done, noteData) {
  const expanded = state.plannerExpandedEvents.has(ev.id);
  const nd = noteData || { note: '', files: [] };
  const files = nd.files || [];
  const hasDetail = !!nd.note || files.length > 0;

  const detailPanel = expanded ? `
    <div class="planner-ev-detail">
      <textarea class="form-control" rows="2" placeholder="รายละเอียดเพิ่มเติม เช่น สมัครวิชา TPAT3/TPAT4, สนามสอบที่ไหน..."
        oninput="onPlannerEventNoteInput('${ev.id}', this.value)">${nd.note || ''}</textarea>
      <div class="planner-ev-files">
        ${files.map((f, i) => `
          <div class="planner-ev-file">
            ${f.dataUrl.startsWith('data:image') ? `<img src="${f.dataUrl}" class="planner-ev-file-thumb">` : `<span class="planner-ev-file-icon">📄</span>`}
            <span class="planner-ev-file-name">${f.name}</span>
            <button type="button" class="planner-ev-file-remove" onclick="removePlannerEventFile('${ev.id}', ${i})">✕</button>
          </div>`).join('')}
      </div>
      <label class="btn btn-outline btn-sm planner-ev-upload-btn">
        📎 แนบหลักฐาน (บัตรสอบ/ใบสมัคร)
        <input type="file" accept="image/*,application/pdf" style="display:none" onchange="onPlannerEventFileSelect('${ev.id}', this)">
      </label>
    </div>` : '';

  return `
    <div class="planner-ev-wrap">
      <label class="planner-ev-row${done ? ' done' : ''}">
        <input type="checkbox" ${done ? 'checked' : ''} onchange="togglePlannerEvent('${ev.id}')">
        <span class="planner-ev-icon">${ev.icon}</span>
        <span class="planner-ev-body">
          <span class="planner-ev-title">${ev.title}</span>
          <span class="planner-ev-date">📅 ${calThDateRangeWithDay(ev.start, ev.end)}</span>
        </span>
        <button type="button" class="planner-ev-note-btn${hasDetail ? ' has-detail' : ''}" onclick="event.preventDefault(); togglePlannerEventDetail('${ev.id}')" title="บันทึกรายละเอียด/แนบหลักฐาน">📝</button>
      </label>
      ${detailPanel}
    </div>`;
}

function togglePlannerEvent(eventId) {
  const ce = state.studentData.planner.completedEvents;
  ce[eventId] = !ce[eventId];
  debounceSave();
  renderPlanner();
}

function togglePlannerEventDetail(eventId) {
  if (state.plannerExpandedEvents.has(eventId)) {
    state.plannerExpandedEvents.delete(eventId);
  } else {
    state.plannerExpandedEvents.add(eventId);
  }
  renderPlanner();
}

function _getEventNoteEntry(eventId) {
  const en = state.studentData.planner.eventNotes;
  if (!en[eventId]) en[eventId] = { note: '', files: [] };
  return en[eventId];
}

function onPlannerEventNoteInput(eventId, value) {
  _getEventNoteEntry(eventId).note = value;
  debounceSave();
}

function onPlannerEventFileSelect(eventId, inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  if (file.size > PLANNER_FILE_MAX_BYTES) {
    showToast('⚠️ ไฟล์ใหญ่เกินไป (สูงสุด ~900KB ต่อไฟล์)', 'error');
    inputEl.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const entry = _getEventNoteEntry(eventId);
    entry.files.push({ name: file.name, dataUrl: reader.result });
    debounceSave(200);
    renderPlanner();
  };
  reader.readAsDataURL(file);
}

function removePlannerEventFile(eventId, fileIdx) {
  const entry = _getEventNoteEntry(eventId);
  entry.files.splice(fileIdx, 1);
  debounceSave(200);
  renderPlanner();
}

function renderPlannerRounds(planner, prefs) {
  const rp = planner.roundPlans || {};
  const rounds = [
    { key: 'round1', label: 'รอบ 1 Portfolio', color: '#6366F1' },
    { key: 'round2', label: 'รอบ 2 โควตา', color: '#10B981' },
    { key: 'round3', label: 'รอบ 3 Admission', color: '#F59E0B' },
    { key: 'round4', label: 'รอบ 4 รับตรงอิสระ', color: '#EF4444' },
  ];

  if (!prefs.length) {
    return `
    <div class="card mt-3">
      <div class="card-header"><div class="card-title">✅ รอบที่วางแผนจะสมัคร</div></div>
      <div class="card-body">
        <div class="empty-state">
          <div class="empty-state-icon">🎓</div>
          <div class="empty-state-title">ยังไม่ได้เลือกคณะเป้าหมาย</div>
          <div class="empty-state-desc">ไปที่หน้าโปรไฟล์เพื่อเลือกคณะที่สนใจก่อน จึงจะวางแผนรอบที่จะสมัครได้</div>
        </div>
        <button class="btn btn-primary btn-sm mt-2" onclick="navigate('profile')">ไปหน้าโปรไฟล์ →</button>
      </div>
    </div>`;
  }

  const progName = pid => {
    const p = TCAS_DATA.programs.find(x => x.id === pid);
    if (!p) return null;
    const rank = prefs.indexOf(pid);
    const uni = getUniversityById(p.universityId);
    return `${rank >= 0 ? `อันดับ ${rank + 1} — ` : ''}${p.program} (${uni.shortName})`;
  };

  return `
  <div class="card mt-3">
    <div class="card-header"><div class="card-title">✅ รอบที่วางแผนจะสมัคร</div></div>
    <div class="card-body">
      ${rounds.map(r => {
        const chosen = (rp[r.key] || []).filter(pid => TCAS_DATA.programs.find(p => p.id === pid));
        const available = prefs.filter(pid => !chosen.includes(pid));
        const chips = chosen.map(pid => `
          <div class="planner-round-chip">
            <span>${progName(pid)}</span>
            <button type="button" class="planner-round-chip-remove" onclick="onPlannerRoundRemove('${r.key}', '${pid}')">✕</button>
          </div>`).join('');
        const options = available.map(pid => `<option value="${pid}">${progName(pid)}</option>`).join('');
        return `
        <div class="form-group">
          <label class="form-label" style="color:${r.color}">${r.label}</label>
          ${chips ? `<div class="planner-round-chips">${chips}</div>` : ''}
          ${available.length ? `
            <select class="form-control" onchange="onPlannerRoundAdd('${r.key}', this.value); this.value='';">
              <option value="">+ เพิ่มคณะที่จะยื่นในรอบนี้</option>
              ${options}
            </select>` : `<div style="font-size:0.78rem;color:var(--text-muted)">เลือกครบทุกคณะเป้าหมายแล้ว</div>`}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function onPlannerRoundAdd(key, programId) {
  if (!programId) return;
  const arr = state.studentData.planner.roundPlans[key];
  if (!arr.includes(programId)) arr.push(programId);
  debounceSave(200);
  renderPlanner();
}

function onPlannerRoundRemove(key, programId) {
  const arr = state.studentData.planner.roundPlans[key];
  const idx = arr.indexOf(programId);
  if (idx !== -1) arr.splice(idx, 1);
  debounceSave(200);
  renderPlanner();
}

function renderPlannerContacts() {
  return `
  <div class="card mt-3">
    <div class="card-header"><div class="card-title">🤝 คนที่ช่วยฉันได้</div></div>
    <div class="card-body">
      <ul class="plain-list">
        <li>👩‍🏫 ครูแนะแนว ม.6 — อาจารย์สุจิรดา ศรีจารุธรรม (ห้องแนะแนว โรงเรียนโพธิสารพิทยากร)</li>
        <li>🏫 ครูหัวหน้าแผนการเรียน — สอบถามได้ตามแผนการเรียนที่สังกัด</li>
        <li>📱 TCAS70: Student Advisor for Potisarnpittayakorn School - แอปพลิเคชั่นที่ช่วยติดตามความพร้อม และวางแผนเส้นทางสู่มหาวิทยาลัยสำหรับเด็กโพธิสาร'69</li>
      </ul>
    </div>
  </div>`;
}

function renderPlannerNote(planner) {
  return `
  <div class="card mt-3 mb-4">
    <div class="card-header"><div class="card-title">📝 บันทึกถึงตัวเอง</div></div>
    <div class="card-body">
      <textarea class="form-control" rows="4" placeholder="เขียนอะไรก็ได้ถึงตัวเองในอนาคต..." oninput="onPlannerNoteInput(this.value)">${planner.selfNote || ''}</textarea>
    </div>
  </div>`;
}

function onPlannerNoteInput(value) {
  state.studentData.planner.selfNote = value;
  debounceSave();
}

// ============================================================
// STUDY LOG (ตารางอ่านหนังสือ) — weekly calendar grid
// ============================================================
const STUDY_TIME_BLOCKS = [
  { key: 'morning',   label: 'เช้า', range: '06:00–12:00' },
  { key: 'afternoon', label: 'บ่าย', range: '12:00–16:00' },
  { key: 'evening',   label: 'เย็น', range: '16:00–19:00' },
  { key: 'night',     label: 'ค่ำ',  range: '19:00–24:00' },
];

// Local YYYY-MM-DD (never use toISOString() here — it converts to UTC and
// shifts the date back a day in GMT+7, which is exactly the bug this caused).
function studyLogYMD(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function studyLogWeekStart(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=อาทิตย์..6=เสาร์
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); // เริ่มวันจันทร์
  return studyLogYMD(d);
}

function renderStudyLog() {
  const container = document.getElementById('studylog-content');
  if (!container) return;

  const sd = state.studentData;
  if (!sd.planner) sd.planner = {};
  if (!Array.isArray(sd.planner.studyLog)) sd.planner.studyLog = [];
  const log = sd.planner.studyLog;

  if (!state.studyLogWeekStart) state.studyLogWeekStart = studyLogWeekStart(studyLogYMD(new Date()));
  const weekStart = state.studyLogWeekStart;

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + i);
    days.push(studyLogYMD(d));
  }
  const weekEnd = days[6];
  const today = studyLogYMD(new Date());

  const subjects = [...new Set(log.map(e => e.subject).filter(Boolean))].sort();
  const entriesFor = (date, block) => log.filter(e => e.date === date && (e.block || 'morning') === block);

  container.innerHTML = `
    <datalist id="studylog-subject-list">${subjects.map(s => `<option value="${s}">`).join('')}</datalist>

    <div class="card">
      <div class="card-body studylog-week-nav-card">
        <div class="studylog-week-nav-row">
          <button class="btn btn-outline btn-sm studylog-nav-btn" onclick="studyLogNavWeek(-1)">‹</button>
          <div class="studylog-week-range">${calThDateRange(weekStart, weekEnd)}</div>
          <button class="btn btn-outline btn-sm studylog-nav-btn" onclick="studyLogNavWeek(1)">›</button>
        </div>
        <div class="studylog-week-tools-row">
          <button class="btn btn-ghost btn-sm" onclick="studyLogGoToday()">สัปดาห์นี้</button>
          <div class="studylog-jump-wrap">
            <span class="studylog-jump-label">ไปที่:</span>
            <input type="date" class="form-control studylog-jump-input" value="${weekStart}" onchange="studyLogJumpToDate(this.value)">
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-3">
      <div class="card-body" style="overflow-x:auto">
        <div class="studylog-grid">
          <div class="studylog-grid-corner"></div>
          ${STUDY_TIME_BLOCKS.map(block => `<div class="studylog-block-head">${block.label}<div class="studylog-block-range">${block.range}</div></div>`).join('')}
          ${days.map(d => {
            const dt = new Date(d + 'T00:00:00');
            const isToday = d === today;
            const dayEvents = getStudyLogDayEvents(d);
            return `
              <div class="studylog-day-label${isToday ? ' today' : ''}">
                <div>${TH_DAYS_SHORT[dt.getDay()]} ${dt.getDate()}/${dt.getMonth() + 1}</div>
                ${dayEvents.map(ev => `<div class="studylog-day-event" style="background:${ev.color}30;color:${ev.color}" title="${ev.title}">${ev.icon} ${ev.short || ev.title}</div>`).join('')}
              </div>
              ${STUDY_TIME_BLOCKS.map(block => renderStudyLogCell(d, block.key, entriesFor(d, block.key))).join('')}
            `;
          }).join('')}
        </div>
      </div>
    </div>

    ${renderStudyLogSummary(log)}
  `;
}

function renderStudyLogSummary(log) {
  if (!log.length) return '';

  const today = studyLogYMD(new Date());

  const bySubject = {};
  log.forEach(e => {
    if (!bySubject[e.subject]) bySubject[e.subject] = { done: [], planned: [] };
    (e.done ? bySubject[e.subject].done : bySubject[e.subject].planned).push(e);
  });
  const subjects = Object.keys(bySubject).sort();

  const itemsHTML = (entries, checkOverdue) => entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => {
      const overdue = checkOverdue && e.date < today;
      return `<li${overdue ? ' class="overdue"' : ''}>${e.topic || '(ไม่ระบุบท)'}<span class="studylog-summary-date">${calThDateStr(e.date)}${overdue ? ' · เลยกำหนด' : ''}</span></li>`;
    })
    .join('');

  return `
  <div class="card mt-3">
    <div class="card-header"><div class="card-title">📊 สรุปภาพรวมการอ่านหนังสือ</div></div>
    <div class="card-body">
      <div class="studylog-summary-grid">
        ${subjects.map(subj => {
          const { done, planned } = bySubject[subj];
          const total = done.length + planned.length;
          const pct = total ? Math.round(done.length / total * 100) : 0;
          const overdueCount = planned.filter(e => e.date < today).length;
          return `
          <div class="studylog-summary-card${overdueCount ? ' overdue' : ''}">
            <div class="studylog-summary-subject">${subj}${overdueCount ? `<span class="studylog-summary-overdue-badge">⚠️ เลยกำหนด ${overdueCount} บท</span>` : ''}</div>
            <div class="studylog-summary-progress">
              <div class="studylog-summary-progress-bar"><div style="width:${pct}%"></div></div>
              <span>${done.length}/${total}</span>
            </div>
            ${done.length ? `<div class="studylog-summary-section-title done">✅ ทบทวนแล้ว</div><ul class="studylog-summary-list">${itemsHTML(done, false)}</ul>` : ''}
            ${planned.length ? `<div class="studylog-summary-section-title${overdueCount ? ' overdue' : ''}">🗓️ อยู่ในแผน</div><ul class="studylog-summary-list">${itemsHTML(planned, true)}</ul>` : ''}
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

function getStudyLogDayEvents(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return TCAS70_EVENTS.filter(ev => {
    const s = new Date(ev.start + 'T00:00:00');
    const e = new Date(ev.end + 'T00:00:00');
    return d >= s && d <= e;
  });
}

function renderStudyLogCell(date, blockKey, entries) {
  const cellKey = date + '|' + blockKey;
  const isAdding = state.studyLogAddingCell === cellKey;

  const entriesHTML = entries.map(e => {
    if (state.studyLogEditingId === e.id) {
      return `
      <div class="studylog-add-form">
        <input type="text" class="form-control" id="studylog-edit-subject" list="studylog-subject-list" value="${e.subject.replace(/"/g, '&quot;')}" placeholder="วิชา">
        <input type="text" class="form-control" id="studylog-edit-topic" value="${(e.topic || '').replace(/"/g, '&quot;')}" placeholder="บท/เรื่อง (ไม่บังคับ)">
        <div style="display:flex;gap:4px">
          <input type="date" class="form-control" id="studylog-edit-date" value="${e.date}">
          <select class="form-control" id="studylog-edit-block">
            ${STUDY_TIME_BLOCKS.map(b => `<option value="${b.key}" ${b.key === (e.block || 'morning') ? 'selected' : ''}>${b.label}</option>`).join('')}
          </select>
        </div>
        <div style="display:flex;gap:4px;margin-top:2px">
          <button type="button" class="btn btn-primary btn-sm" onclick="saveEditStudyLogEntry('${e.id}')">บันทึก</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="cancelEditStudyLogEntry()">ยกเลิก</button>
        </div>
      </div>`;
    }
    return `
    <div class="studylog-entry${e.done ? ' done' : ''}">
      <input type="checkbox" ${e.done ? 'checked' : ''} onchange="toggleStudyLogEntry('${e.id}')">
      <span class="studylog-entry-text">${e.subject}${e.topic ? ' · ' + e.topic : ''}</span>
      <button type="button" class="studylog-entry-edit" onclick="startEditStudyLogEntry('${e.id}')" title="แก้ไข">✏️</button>
      <button type="button" class="studylog-entry-remove" onclick="removeStudyLogEntry('${e.id}')" title="ลบ">✕</button>
    </div>`;
  }).join('');

  const addUI = isAdding ? `
    <div class="studylog-add-form">
      <input type="text" class="form-control" id="studylog-cell-subject" list="studylog-subject-list" placeholder="วิชา">
      <input type="text" class="form-control" id="studylog-cell-topic" placeholder="บท/เรื่อง (ไม่บังคับ)">
      <div style="display:flex;gap:4px;margin-top:2px">
        <button type="button" class="btn btn-primary btn-sm" onclick="addStudyLogEntryInCell('${date}','${blockKey}')">บันทึก</button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="cancelStudyLogAdd()">ยกเลิก</button>
      </div>
    </div>
  ` : `<button type="button" class="studylog-add-trigger" onclick="startStudyLogAdd('${date}','${blockKey}')">+ เพิ่ม</button>`;

  return `<div class="studylog-cell">${entriesHTML}${addUI}</div>`;
}

function studyLogNavWeek(delta) {
  const d = new Date(state.studyLogWeekStart + 'T00:00:00');
  d.setDate(d.getDate() + delta * 7);
  state.studyLogWeekStart = studyLogYMD(d);
  state.studyLogAddingCell = null;
  renderStudyLog();
}

function studyLogGoToday() {
  state.studyLogWeekStart = studyLogWeekStart(studyLogYMD(new Date()));
  state.studyLogAddingCell = null;
  renderStudyLog();
}

function studyLogJumpToDate(dateStr) {
  if (!dateStr) return;
  state.studyLogWeekStart = studyLogWeekStart(dateStr);
  state.studyLogAddingCell = null;
  renderStudyLog();
}

function startStudyLogAdd(date, block) {
  state.studyLogAddingCell = date + '|' + block;
  renderStudyLog();
  const el = document.getElementById('studylog-cell-subject');
  if (el) el.focus();
}

function cancelStudyLogAdd() {
  state.studyLogAddingCell = null;
  renderStudyLog();
}

function addStudyLogEntryInCell(date, block) {
  const subjEl = document.getElementById('studylog-cell-subject');
  const topicEl = document.getElementById('studylog-cell-topic');
  const subject = subjEl.value.trim();
  const topic = topicEl.value.trim();
  if (!subject) {
    showToast('⚠️ กรุณาระบุวิชา', 'error');
    return;
  }
  state.studentData.planner.studyLog.push({
    id: 'sl-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    date, block, subject, topic, done: false
  });
  state.studyLogAddingCell = null;
  debounceSave(200);
  renderStudyLog();
}

function toggleStudyLogEntry(id) {
  const entry = state.studentData.planner.studyLog.find(e => e.id === id);
  if (!entry) return;
  entry.done = !entry.done;
  debounceSave(200);
  renderStudyLog();
}

function removeStudyLogEntry(id) {
  const log = state.studentData.planner.studyLog;
  const idx = log.findIndex(e => e.id === id);
  if (idx === -1) return;
  log.splice(idx, 1);
  debounceSave(200);
  renderStudyLog();
}

function startEditStudyLogEntry(id) {
  state.studyLogEditingId = id;
  state.studyLogAddingCell = null;
  renderStudyLog();
}

function cancelEditStudyLogEntry() {
  state.studyLogEditingId = null;
  renderStudyLog();
}

function saveEditStudyLogEntry(id) {
  const entry = state.studentData.planner.studyLog.find(e => e.id === id);
  if (!entry) return;
  const subject = document.getElementById('studylog-edit-subject').value.trim();
  const topic = document.getElementById('studylog-edit-topic').value.trim();
  const date = document.getElementById('studylog-edit-date').value;
  const block = document.getElementById('studylog-edit-block').value;
  if (!subject || !date) {
    showToast('⚠️ กรุณาระบุวันที่และวิชา', 'error');
    return;
  }
  entry.subject = subject;
  entry.topic = topic;
  entry.date = date;
  entry.block = block;
  state.studyLogEditingId = null;
  debounceSave(200);
  renderStudyLog();
}

// ============================================================
// RECOMMENDATIONS
// ============================================================
// ---- Historical min score (10 years 2561-2570) ----
// Returns an array[10] where index 0 = ปี 2561, index 9 = ปี 2570
// Uses real data from TCAS_HISTORICAL_STATS (mytcas.com) for years 65-69
// when available, blended with simulated values for earlier years.
function getHistoricalMinPct(program) {
  const levelCfg = {
    'สูงมาก': { base: 80, spread: 5, trend: 0.65 },
    'สูง':    { base: 66, spread: 6, trend: 0.55 },
    'ปานกลาง': { base: 52, spread: 7, trend: 0.45 },
    'ต่ำ':    { base: 38, spread: 8, trend: 0.38 }
  };
  const cfg = levelCfg[program.competition] || levelCfg['ปานกลาง'];
  let h = 0;
  for (const c of program.id) h = Math.imul(31, h) + c.charCodeAt(0) | 0;
  h = Math.abs(h);
  const base = Math.max(28, Math.min(90, cfg.base + ((h % (cfg.spread * 2 + 1)) - cfg.spread)));
  const simulated = Array.from({ length: 10 }, (_, i) => {
    const noise = (((h * (i * 7 + 13)) >>> 0) % 7) - 3;
    return Math.max(22, Math.min(95, Math.round(base + i * cfg.trend + noise)));
  });

  // Check for real historical data (TCAS65-69)
  const realData = (typeof TCAS_HISTORICAL_STATS !== 'undefined') && TCAS_HISTORICAL_STATS[program.id];
  if (!realData) return simulated;

  // Overlay real data: index mapping — 65→4, 66→5, 67→6, 68→7, 69→8
  const result = [...simulated];
  const yearToIdx = { 65: 4, 66: 5, 67: 6, 68: 7, 69: 8 };
  for (const [yrStr, data] of Object.entries(realData)) {
    const idx = yearToIdx[parseInt(yrStr)];
    if (idx !== undefined && data.min != null) {
      result[idx] = Math.round(data.min * 10) / 10;
    }
  }

  // Project ปี 2570 (index 9) from the most recent real years
  const realYrs = Object.keys(realData).map(Number).sort((a, b) => b - a);
  const latestYr = realYrs[0];
  if (latestYr === 69) {
    // Average of last 2 real years if both exist
    const prev = realYrs[1] && realData[realYrs[1]] ? realData[realYrs[1]].min : null;
    const last  = realData[69].min;
    result[9] = Math.round((prev != null ? (last * 0.6 + prev * 0.4) : last) * 10) / 10;
  } else if (latestYr >= 66 && realData[latestYr]) {
    result[9] = Math.round(realData[latestYr].min * 10) / 10;
  }

  return result;
}

// Returns true when real mytcas.com data exists for this program
function hasRealHistoricalData(programId) {
  return typeof TCAS_HISTORICAL_STATS !== 'undefined' && !!TCAS_HISTORICAL_STATS[programId];
}

// ---- Mini sparkline SVG ----
// labelStart / labelEnd: year labels shown at left / right (default 2561 / 2570)
function renderSparkline(pcts, studentPct, labelStart = '2561', labelEnd = '2570') {
  const W = 140, H = 40;
  const n = pcts.length;
  const allVals = studentPct > 0 ? [...pcts, studentPct] : pcts;
  const minV = Math.max(0, Math.min(...allVals) - 8);
  const maxV = Math.min(100, Math.max(...allVals) + 8);
  const scX = i => (4 + (i / (n - 1)) * (W - 8)).toFixed(1);
  const scY = v => (H - 5 - ((v - minV) / (maxV - minV)) * (H - 12)).toFixed(1);
  const pts = pcts.map((v, i) => `${scX(i)},${scY(v)}`).join(' ');
  const stuY = studentPct > 0 ? scY(studentPct) : null;
  const stuColor = studentPct > 0 ? (studentPct >= pcts[n - 1] ? '#10B981' : '#EF4444') : '#94A3B8';
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block;overflow:visible">
    <polyline points="${pts}" fill="none" stroke="#6366F1" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>
    ${pcts.map((v, i) => `<circle cx="${scX(i)}" cy="${scY(v)}" r="${i === n-1 ? 3.5 : 2}"
      fill="${i === n-1 ? '#6366F1' : 'rgba(99,102,241,0.45)'}"/>`).join('')}
    ${stuY !== null ? `
      <line x1="4" y1="${stuY}" x2="${W-4}" y2="${stuY}"
        stroke="${stuColor}" stroke-width="1.8" stroke-dasharray="5,3" opacity="0.9"/>
      <circle cx="${W-6}" cy="${stuY}" r="3.5" fill="${stuColor}"/>` : ''}
    <text x="4" y="${H}" font-size="8" fill="#94A3B8">${labelStart}</text>
    <text x="${W-18}" y="${H}" font-size="8" fill="#94A3B8">${labelEnd}</text>
  </svg>`;
}

// ---- All available categories for interest selector ----
const ALL_CATEGORIES = [
  { id: 'สาธารณสุข',    label: 'แพทย์/สาธารณสุข', icon: '🏥' },
  { id: 'วิศวกรรม',     label: 'วิศวกรรม',        icon: '⚙️' },
  { id: 'วิทยาศาสตร์',  label: 'วิทยาศาสตร์',     icon: '🔬' },
  { id: 'บริหาร',       label: 'บริหาร/บัญชี',    icon: '💼' },
  { id: 'สังคมศาสตร์',  label: 'นิติ/รัฐศาสตร์', icon: '⚖️' },
  { id: 'ครุศาสตร์',    label: 'ครุศาสตร์',       icon: '🎓' },
  { id: 'มนุษยศาสตร์',  label: 'มนุษยศาสตร์',    icon: '📚' },
  { id: 'สถาปัตยกรรม',  label: 'สถาปัตย์/ออกแบบ',icon: '🏛️' },
  { id: 'ศิลปะ',        label: 'ศิลปะ/ดนตรี',    icon: '🎨' },
  { id: 'เกษตร',        label: 'เกษตร',           icon: '🌱' },
  { id: 'เทคโนโลยี',    label: 'IT/เทคโนโลยี',   icon: '💻' },
];

function toggleInterest(catId) {
  if (!state.studentData.interests) state.studentData.interests = [];
  const idx = state.studentData.interests.indexOf(catId);
  if (idx >= 0) {
    state.studentData.interests.splice(idx, 1);
  } else {
    state.studentData.interests.push(catId);
  }
  saveData();
  renderRecommendations();
}

function renderRecommendations() {
  const container = document.getElementById('recommend-content');
  if (!container) return;

  const sd   = state.studentData;
  const gpa  = parseFloat(sd.gpa.cumulative) || 0;
  const round = state.recommendRound || 'all';

  // ---- Data completeness score ----
  const hasGPA     = gpa > 0;
  const hasTGAT    = parseFloat(sd.scores.tgat1) > 0 || parseFloat(sd.scores.tgat2) > 0 || parseFloat(sd.scores.tgat3) > 0;
  const hasAlevel  = Object.entries(sd.scores).some(([k,v]) => k.startsWith('a') && parseFloat(v) > 0);
  const hasProf    = !!(sd.profile.firstName);
  const hasPrefs   = (sd.preferences || []).length > 0;
  const hasPort    = Object.values(sd.portfolio || {}).some(arr => arr.length > 0);
  const dataScore  = [hasGPA, hasTGAT, hasAlevel, hasProf, hasPrefs, hasPort].filter(Boolean).length;
  const dataTotal  = 6;

  const ROUND_TABS = [
    { id:'all',    icon:'📊', label:'ภาพรวม',         color:'#1A3A6B' },
    { id:'round1', icon:'📁', label:'รอบ 1 Portfolio', color:'#6366F1' },
    { id:'round2', icon:'🏷️', label:'รอบ 2 โควตา',   color:'#10B981' },
    { id:'round3', icon:'🎯', label:'รอบ 3 Admission', color:'#F59E0B' },
    { id:'round4', icon:'🏛️', label:'รอบ 4 รับตรง',  color:'#EF4444' },
  ];

  // Build quick data status chips
  const dataChips = [
    { label:'GPA',      done:hasGPA,    page:'scores'    },
    { label:'TGAT',     done:hasTGAT,   page:'scores'    },
    { label:'A-Level',  done:hasAlevel, page:'scores'    },
    { label:'โปรไฟล์', done:hasProf,   page:'profile'   },
    { label:'10 อันดับ',done:hasPrefs,  page:'profile'   },
    { label:'Portfolio',done:hasPort,   page:'portfolio' },
  ];

  container.innerHTML = `
    <!-- Data Completeness Banner -->
    <div class="rec-data-banner mb-3">
      <div class="rec-data-banner-left">
        <div class="rec-data-banner-title">ความสมบูรณ์ของข้อมูล</div>
        <div class="rec-data-chips">
          ${dataChips.map(c => `
            <span class="rec-data-chip ${c.done ? 'done' : 'missing'}" onclick="navigate('${c.page}')" title="${c.done ? 'มีข้อมูลแล้ว' : 'คลิกเพื่อกรอก'}">
              ${c.done ? '✅' : '➕'} ${c.label}
            </span>`).join('')}
        </div>
      </div>
      <div class="rec-data-banner-right">
        <div class="rec-data-score">${dataScore}/${dataTotal}</div>
        <div class="rec-data-bar"><div class="rec-data-fill" style="width:${Math.round(dataScore/dataTotal*100)}%"></div></div>
        <div class="rec-data-hint">${dataScore < 3 ? 'ข้อมูลยิ่งมาก ผลยิ่งแม่นยำ' : dataScore < 6 ? 'ดีมาก! เพิ่มข้อมูลเพื่อผลที่แม่นยำขึ้น' : 'ข้อมูลครบ ✨'}</div>
      </div>
    </div>

    <div class="disclaimer-box mb-3">
      <div class="disclaimer-icon">ℹ️</div>
      <div class="disclaimer-body" style="font-size:0.8rem">
        <strong>ข้อสำคัญ:</strong> การประเมินนี้เป็นข้อมูลประกอบการตัดสินใจเท่านั้น
        ควรตรวจสอบเกณฑ์จริงจากมหาวิทยาลัยก่อนสมัคร
      </div>
    </div>

    <!-- Round Tabs -->
    <div class="round-tab-bar mb-4">
      ${ROUND_TABS.map(t => `
        <button class="round-tab-btn ${round === t.id ? 'active' : ''}"
          style="${round === t.id ? `--rtab-color:${t.color}` : ''}"
          onclick="switchRecommendRound('${t.id}')">
          ${t.icon} ${t.label}
        </button>`).join('')}
    </div>

    <div class="rec-gpa-badge mb-3">
      <span>GPA สะสม: <strong>${hasGPA ? gpa.toFixed(2) : 'ยังไม่กรอก'}</strong></span>
      ${!hasGPA ? `<button class="btn-link" onclick="navigate('scores')" style="font-size:0.78rem;margin-left:8px">+ กรอกเลย</button>` : ''}
    </div>

    <div id="round-content-area"></div>
  `;

  renderRoundContent(round);
}

function switchRecommendRound(round) {
  state.recommendRound = round;
  renderRecommendations();
}

function renderRoundContent(round) {
  const area = document.getElementById('round-content-area');
  if (!area) return;

  if (round === 'all')    { renderRoundAll(area); return; }
  if (round === 'round1') { renderRound1(area);   return; }
  if (round === 'round2') { renderRound2(area);   return; }
  if (round === 'round3') { renderRound3(area);   return; }
  if (round === 'round4') { renderRound4(area);   return; }
}

// ---- ROUND ALL: ภาพรวม (original behavior) ----
function renderRoundAll(area) {
  const interests = state.studentData.interests || [];
  const wishlist  = state.wishlist || [];
  const prefs     = getPreferences();

  function sortPriority(p, score) {
    const inPref    = prefs.includes(p.id);
    const liked     = wishlist.includes(p.id);
    const matched   = interests.length > 0 && interests.includes(p.category);
    if (inPref && matched) return 4000 + score;
    if (inPref)            return 3000 + score;
    if (liked && matched)  return 2500 + score;
    if (liked)             return 2000 + score;
    if (matched)           return 1000 + score;
    return score;
  }

  const allRecs = TCAS_DATA.programs
    .map(p => ({ program: p, result: calculateMatchScore(p, state.studentData) }))
    .sort((a, b) => sortPriority(b.program, b.result.score) - sortPriority(a.program, a.result.score));

  const top10 = allRecs.slice(0, 10);
  const hasFilters = interests.length > 0 || wishlist.length > 0 || prefs.length > 0;
  const modeLabel = prefs.length > 0 ? '🏆 จัดตาม: 10 อันดับที่สนใจ + คะแนน'
    : hasFilters ? '🎯 จัดตาม: สาขาที่สนใจ + คะแนน' : '📊 จัดตาม: คะแนนความเหมาะสม';

  area.innerHTML = `
    <div class="interest-selector-card mb-4">
      <div class="interest-selector-header">
        <span class="interest-selector-title">🔍 สาขาที่สนใจ</span>
        ${interests.length > 0 ? `<button class="btn-link text-danger" onclick="clearInterests()" style="font-size:0.78rem">✕ ล้างทั้งหมด</button>` : ''}
      </div>
      <div class="interest-chips">
        ${ALL_CATEGORIES.map(cat => {
          const active = interests.includes(cat.id);
          return `<button class="interest-chip ${active?'active':''}" onclick="toggleInterest('${cat.id}')">
            ${cat.icon} ${cat.label}${active ? '<span class="interest-chip-check">✓</span>' : ''}
          </button>`;
        }).join('')}
      </div>
      ${prefs.length > 0 ? `<div class="interest-wishlist-hint">🏆 มี ${prefs.length} อันดับที่บันทึกไว้ — จะถูกยกขึ้นด้านบน</div>` : ''}
    </div>

    <div class="rec-header mb-3">
      <span class="section-title" style="margin:0">🏆 10 อันดับที่เหมาะสม</span>
      <span class="badge" style="background:var(--surface-2);color:var(--text-secondary);font-size:0.72rem">${modeLabel}</span>
    </div>
    <div class="rec-ranking-list">
      ${top10.map((r, i) => renderRecRankCard(r.program, r.result, i+1, interests, wishlist)).join('')}
    </div>`;
}

// ---- ROUND 1: Portfolio ----
function renderRound1(area) {
  const sd = state.studentData;
  const port = sd.portfolio || {};
  const gpa  = parseFloat(sd.gpa.cumulative) || 0;
  const prefs = getPreferences();

  // Count portfolio items student has
  const portItems = [
    { key:'camps',        label:'ค่าย / โครงการพิเศษ',   count:(port.camps||[]).length,        icon:'⛺' },
    { key:'activities',   label:'กิจกรรมนอกหลักสูตร',     count:(port.activities||[]).length,   icon:'🎪' },
    { key:'awards',       label:'รางวัล / เกียรติบัตร',    count:(port.awards||[]).length,       icon:'🏆' },
    { key:'competitions', label:'การแข่งขัน / โอลิมปิก',  count:(port.competitions||[]).length, icon:'🥇' },
    { key:'volunteer',    label:'จิตอาสา / บำเพ็ญประโยชน์',count:(port.volunteer||[]).length,   icon:'🤝' },
  ];
  const totalCategories = portItems.filter(x => x.count > 0).length;
  const totalItems = portItems.reduce((s, x) => s + x.count, 0);

  const portLevel = totalCategories >= 4 ? { label:'พอร์ตแข็งแกร่ง ✅', color:'#10B981', score:3 }
    : totalCategories >= 2               ? { label:'พอร์ตพอใช้ ⚠️',    color:'#F59E0B', score:2 }
    : totalCategories >= 1               ? { label:'พอร์ตน้อย ⚠️',      color:'#F97316', score:1 }
    :                                      { label:'ยังไม่มีพอร์ต ❌',  color:'#EF4444', score:0 };

  // Programs accepting round 1, sorted by GPA match
  let r1Programs = TCAS_DATA.programs.filter(p => p.rounds.includes(1));

  // Prioritize preferences
  r1Programs.sort((a, b) => {
    const ai = prefs.indexOf(a.id), bi = prefs.indexOf(b.id);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return (parseFloat(a.minGPA)||0) - (parseFloat(b.minGPA)||0);
  });

  area.innerHTML = `
    <!-- Portfolio Summary -->
    <div class="round-assess-header" style="--rhc:#6366F1">
      <div class="round-assess-title">📁 สรุปพอร์ตโฟลิโอของคุณ</div>
      <div class="port-summary-grid">
        ${portItems.map(x => `
          <div class="port-summary-item ${x.count > 0 ? 'has-items' : 'no-items'}">
            <span class="port-item-icon">${x.icon}</span>
            <div class="port-item-label">${x.label}</div>
            <div class="port-item-count">${x.count > 0 ? `${x.count} รายการ` : '—'}</div>
          </div>`).join('')}
      </div>
      <div class="port-level-badge" style="color:${portLevel.color};border-color:${portLevel.color}40;background:${portLevel.color}10">
        ${portLevel.label} · รวม ${totalItems} รายการ ใน ${totalCategories} หมวด
      </div>
      ${totalItems === 0 ? `
        <div class="port-add-hint">
          <button class="btn btn-outline btn-sm" onclick="navigate('portfolio')">✏️ เพิ่มข้อมูลพอร์ตโฟลิโอ</button>
        </div>` : ''}
    </div>

    <div class="section-title mb-2">คณะที่รับรอบ 1 Portfolio (${r1Programs.length} สาขา)</div>

    ${prefs.filter(pid => r1Programs.find(p => p.id === pid)).length > 0 ? `
      <div class="pref-section-label">🏆 10 อันดับที่คุณสนใจ</div>` : ''}

    <div class="round-assess-list">
      ${r1Programs.map(p => renderRoundAssessCard(p, 'round1', gpa, portLevel.score, prefs)).join('')}
    </div>`;
}

// ---- ROUND 2: Quota ----
function renderRound2(area) {
  const sd  = state.studentData;
  const gpa = parseFloat(sd.gpa.cumulative) || 0;
  const prefs = getPreferences();

  let r2Programs = TCAS_DATA.programs.filter(p => p.rounds.includes(2));
  r2Programs.sort((a, b) => {
    const ai = prefs.indexOf(a.id), bi = prefs.indexOf(b.id);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    const aPassed = gpa >= (a.minGPA||0), bPassed = gpa >= (b.minGPA||0);
    if (aPassed !== bPassed) return bPassed ? 1 : -1;
    return (b.minGPA||0) - (a.minGPA||0);
  });

  const passed  = r2Programs.filter(p => gpa >= (p.minGPA||0)).length;
  const failed  = r2Programs.length - passed;

  area.innerHTML = `
    <div class="round-assess-header" style="--rhc:#10B981">
      <div class="round-assess-title">🏷️ ผลประเมินรอบ 2 โควตา</div>
      <div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap">
        <div class="quota-summary-chip quota-pass">✅ GPA ผ่านเกณฑ์ ${passed} สาขา</div>
        <div class="quota-summary-chip quota-fail">❌ GPA ต่ำกว่าเกณฑ์ ${failed} สาขา</div>
      </div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:6px">
        ⚠️ รอบ 2 อาจมีเงื่อนไขเพิ่มเติม เช่น โควตาพื้นที่ หรือคะแนนเฉพาะวิชา — ตรวจสอบจากมหาวิทยาลัยด้วย
      </div>
    </div>

    ${prefs.filter(pid => r2Programs.find(p => p.id === pid)).length > 0 ? `
      <div class="pref-section-label">🏆 10 อันดับที่คุณสนใจ</div>` : ''}

    <div class="round-assess-list">
      ${r2Programs.map(p => renderRoundAssessCard(p, 'round2', gpa, 0, prefs)).join('')}
    </div>`;
}

// ---- ROUND 3: Admission ----
function renderRound3(area) {
  const sd = state.studentData;
  const gpa = parseFloat(sd.gpa.cumulative) || 0;
  const prefs = getPreferences();
  const interests = sd.interests || [];
  const wishlist  = state.wishlist || [];

  let r3Programs = TCAS_DATA.programs.filter(p => p.rounds.includes(3));

  // Sort: preferences first, then by score
  const scored = r3Programs.map(p => ({
    p, pct: Math.min(calculateMatchScore(p, sd).score, 100)
  }));
  scored.sort((a, b) => {
    const ai = prefs.indexOf(a.p.id), bi = prefs.indexOf(b.p.id);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return b.pct - a.pct;
  });

  const hasPref = prefs.some(pid => r3Programs.find(p => p.id === pid));

  area.innerHTML = `
    <div class="round-assess-header" style="--rhc:#F59E0B">
      <div class="round-assess-title">🎯 ประเมินรอบ 3 Admission</div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">
        ใช้คะแนน TGAT / TPAT / A-Level ตามสัดส่วนที่แต่ละสาขากำหนด
        ${prefs.length > 0 ? ` · <strong>10 อันดับที่เลือกไว้จะแสดงก่อน</strong>` : ''}
      </div>
    </div>

    <!-- Interest filter -->
    <div class="interest-selector-card mb-3" style="padding:12px">
      <div class="interest-chips" style="margin-top:0">
        <button class="interest-chip ${!interests.length?'active':''}" onclick="clearInterests()">ทั้งหมด</button>
        ${ALL_CATEGORIES.map(cat => {
          const active = interests.includes(cat.id);
          return `<button class="interest-chip ${active?'active':''}" onclick="toggleInterestAndRefresh('${cat.id}')">
            ${cat.icon} ${cat.label}${active?'<span class="interest-chip-check">✓</span>':''}
          </button>`;
        }).join('')}
      </div>
    </div>

    ${hasPref ? `<div class="pref-section-label">🏆 10 อันดับที่คุณเลือกไว้</div>` : ''}

    <div class="round-assess-list">
      ${scored
        .filter(({p}) => !interests.length || interests.includes(p.category))
        .map(({p, pct}) => renderRound3Card(p, pct, prefs, wishlist))
        .join('')}
    </div>`;
}

function toggleInterestAndRefresh(catId) {
  toggleInterest(catId);
  if (state.currentPage === 'recommend') renderRecommendations();
}

// ---- ROUND 4: รับตรงอิสระ ----
function renderRound4(area) {
  const prefs = getPreferences();
  let r4Programs = TCAS_DATA.programs.filter(p => p.rounds.includes(4));

  r4Programs.sort((a, b) => {
    const ai = prefs.indexOf(a.id), bi = prefs.indexOf(b.id);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return 0;
  });

  area.innerHTML = `
    <div class="round-assess-header" style="--rhc:#EF4444">
      <div class="round-assess-title">🏛️ รอบ 4 รับตรงอิสระ</div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">
        มหาวิทยาลัยรับสมัครโดยตรง หลังจากรอบ 3 เสร็จสิ้น สำหรับที่นั่งที่เหลือ
      </div>
    </div>
    ${r4Programs.length === 0 ? `
      <div class="empty-state" style="padding:32px 0">
        <div class="empty-state-icon">🏛️</div>
        <div class="empty-state-title">ไม่พบสาขาที่รับรอบ 4 ในฐานข้อมูล</div>
        <div class="empty-state-desc">ตรวจสอบเพิ่มเติมจากเว็บไซต์มหาวิทยาลัยโดยตรง</div>
      </div>` : `
      <div class="round-assess-list">
        ${r4Programs.map(p => renderRoundAssessCard(p, 'round4', 0, 0, prefs)).join('')}
      </div>`}`;
}

// ---- Generic Round Assessment Card ----
function renderRoundAssessCard(program, round, gpa, portScore, prefs) {
  const uni = getUniversityById(program.universityId);
  const minGPA = parseFloat(program.minGPA) || 0;
  const inPref = prefs.includes(program.id);
  const prefRank = prefs.indexOf(program.id) + 1;

  let chance, chanceLabel, chanceColor;

  if (round === 'round1') {
    const gpaOk = gpa >= minGPA || gpa === 0;
    if (!gpaOk)            { chance='low';    chanceLabel='GPA ไม่ถึงเกณฑ์';  chanceColor='#EF4444'; }
    else if (portScore>=3) { chance='high';   chanceLabel='โอกาสสูง';           chanceColor='#10B981'; }
    else if (portScore>=1) { chance='medium'; chanceLabel='พอมีโอกาส';          chanceColor='#F59E0B'; }
    else                   { chance='low';    chanceLabel='ต้องเพิ่มพอร์ต';     chanceColor='#EF4444'; }
  } else if (round === 'round2') {
    const gpaOk = gpa >= minGPA || gpa === 0;
    const gap   = gpa - minGPA;
    if (gap >= 0.25)   { chance='high';   chanceLabel=`GPA เกินเกณฑ์ +${gap.toFixed(2)}`;  chanceColor='#10B981'; }
    else if (gpaOk)    { chance='medium'; chanceLabel=`GPA ผ่านเกณฑ์ (±ชายขอบ)`;           chanceColor='#F59E0B'; }
    else               { chance='low';    chanceLabel=`GPA ต่ำกว่าเกณฑ์ ${Math.abs(gap).toFixed(2)}`; chanceColor='#EF4444'; }
  } else {
    chance='info'; chanceLabel='ตรวจสอบเพิ่มเติม'; chanceColor='#94A3B8';
  }

  const specialReqs = (program.specialReq || []).join(' · ');

  return `
    <div class="round-assess-card ${inPref ? 'round-assess-card--pref' : ''} ${chance==='high' ? 'round-assess-card--high' : chance==='low' ? 'round-assess-card--low' : ''}">
      ${inPref ? `<div class="pref-rank-label" style="background:#6366F1">อันดับ ${prefRank}</div>` : ''}
      <div class="round-assess-card-header">
        <span class="pref-uni-tag" style="background:${uni.color};color:#fff;font-size:0.65rem;padding:1px 6px;border-radius:4px;font-weight:700;white-space:nowrap">${uni.shortName}</span>
        <div style="flex:1;min-width:0">
          <div class="round-assess-prog-name">${program.program}</div>
          <div class="round-assess-prog-sub">${program.faculty}</div>
        </div>
        <div class="round-chance-badge" style="color:${chanceColor};border-color:${chanceColor}40;background:${chanceColor}10">
          ${chanceLabel}
        </div>
      </div>
      <div class="round-assess-card-meta">
        <span>GPA ≥ ${minGPA > 0 ? minGPA.toFixed(2) : '—'}</span>
        ${gpa > 0 ? `<span style="color:${gpa >= minGPA ? '#10B981' : '#EF4444'}">GPA ของคุณ: <strong>${gpa.toFixed(2)}</strong></span>` : ''}
        ${specialReqs ? `<span style="color:var(--text-muted)">⚠️ ${specialReqs}</span>` : ''}
        <button class="btn-link" style="font-size:0.75rem;margin-left:auto" onclick="showProgramDetail('${program.id}')">รายละเอียด →</button>
      </div>
    </div>`;
}

// ---- Round 3 detailed score card ----
function renderRound3Card(program, pct, prefs, wishlist) {
  const uni = getUniversityById(program.universityId);
  const inPref = prefs.includes(program.id);
  const prefRank = prefs.indexOf(program.id) + 1;
  const isLiked  = wishlist.includes(program.id);
  const histPcts = getHistoricalMinPct(program);
  const recentMin = histPcts[histPcts.length - 1];
  const matchColor = pct >= 65 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';

  let chanceLabel, chanceColor;
  if (pct >= recentMin + 5)     { chanceLabel='✅ น่าจะผ่าน';   chanceColor='#10B981'; }
  else if (pct >= recentMin - 5) { chanceLabel='⚠️ ชายขอบ';      chanceColor='#F59E0B'; }
  else                           { chanceLabel='❌ ต่ำกว่าขั้นต่ำ'; chanceColor='#EF4444'; }

  // Score breakdown
  const criteria = program.criteria?.round3 || {};
  const sd = state.studentData.scores;
  const totalWeight = Object.values(criteria).reduce((a,b)=>a+b,0) || 1;

  const scoreBreakdown = Object.entries(criteria).map(([subj, weight]) => {
    const maxMap = {
      tgat1:100, tgat2:100, tgat3:100,
      tpat1:300, tpat2:100, tpat3:100, tpat4:100, tpat5:100,
      amath1:100, amath2:100, ascience:100, asocial:100, athai:100, aeng:100,
      aphy:100, achem:100, abio:100, ahist:100, afre:100, ager:100, ajpn:100, achn:100, akor:100
    };
    const nameMap = {
      tgat1:'TGAT1', tgat2:'TGAT2', tgat3:'TGAT3',
      tpat1:'TPAT1', tpat2:'TPAT2', tpat3:'TPAT3', tpat4:'TPAT4', tpat5:'TPAT5',
      amath1:'คณิต1', amath2:'คณิต2', ascience:'วิทย์', asocial:'สังคม', athai:'ไทย', aeng:'อังกฤษ',
      aphy:'ฟิสิกส์', achem:'เคมี', abio:'ชีวะ', ahist:'ประวัติ', afre:'ฝรั่งเศส', ager:'เยอรมัน',
      ajpn:'ญี่ปุ่น', achn:'จีน', akor:'เกาหลี'
    };
    const raw = parseFloat(sd[subj]) || 0;
    const max = maxMap[subj] || 100;
    const pctSubj = raw / max * 100;
    const contrib = (pctSubj * weight / totalWeight).toFixed(1);
    return { subj, name: nameMap[subj]||subj, weight, raw, max, pctSubj, contrib };
  });

  return `
    <div class="round3-card ${inPref ? 'round-assess-card--pref' : ''}">
      ${inPref ? `<div class="pref-rank-label" style="background:#F59E0B">อันดับ ${prefRank}</div>` : ''}
      ${isLiked && !inPref ? `<div class="pref-rank-label" style="background:#EC4899">❤️ กดใจ</div>` : ''}
      <div class="round-assess-card-header">
        <span class="pref-uni-tag" style="background:${uni.color};color:#fff;font-size:0.65rem;padding:1px 6px;border-radius:4px;font-weight:700;white-space:nowrap">${uni.shortName}</span>
        <div style="flex:1;min-width:0">
          <div class="round-assess-prog-name">${program.program}</div>
          <div class="round-assess-prog-sub">${program.faculty} · GPA ≥ ${program.minGPA}</div>
        </div>
        <div class="round-chance-badge" style="color:${chanceColor};border-color:${chanceColor}40;background:${chanceColor}10;font-size:0.7rem">
          ${chanceLabel}
        </div>
      </div>

      <!-- Score bar -->
      <div style="margin:8px 0 4px">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:3px">
          <span>ความเหมาะสม</span>
          <strong style="color:${matchColor}">${pct}% <span style="font-weight:400;color:var(--text-muted)">(เกณฑ์ ≈${recentMin}%)</span></strong>
        </div>
        <div class="match-bar" style="height:6px">
          <div class="match-bar-fill" style="width:${pct}%;background:${matchColor}"></div>
        </div>
      </div>

      <!-- Score breakdown (collapsible) -->
      ${scoreBreakdown.length > 0 ? `
        <details class="score-breakdown-details">
          <summary>ดูรายละเอียดคะแนน (${scoreBreakdown.length} วิชา)</summary>
          <div class="score-breakdown-grid">
            ${scoreBreakdown.map(s => `
              <div class="score-bd-item">
                <div class="score-bd-name">${s.name} <span style="color:var(--text-muted)">(${s.weight}%)</span></div>
                <div class="score-bd-val ${s.raw > 0 ? '' : 'no-score'}">
                  ${s.raw > 0 ? `${s.raw}/${s.max}` : '—'}
                </div>
                <div class="score-bd-contrib" style="color:${s.raw>0?'#6366F1':'var(--text-muted)'}">
                  ${s.raw > 0 ? `+${s.contrib}%` : '—'}
                </div>
              </div>`).join('')}
          </div>
        </details>` : ''}

      <div style="text-align:right;margin-top:4px">
        <button class="btn-link" style="font-size:0.75rem" onclick="showProgramDetail('${program.id}')">รายละเอียด →</button>
      </div>
    </div>`
}

function clearInterests() {
  state.studentData.interests = [];
  saveData();
  renderRecommendations();
}

function renderRecRankCard(program, result, rank, interests = [], wishlist = []) {
  const uni = getUniversityById(program.universityId);
  const pct = Math.min(result.score, 100);
  const histPcts = getHistoricalMinPct(program);
  const recentMin = histPcts[histPcts.length - 1];
  const isRealData = hasRealHistoricalData(program.id);
  const sparkSvg = renderSparkline(histPcts, pct, '2561', '2570');

  const matchColor = pct >= 65 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--text-muted)';
  const compColor = { 'สูงมาก': '#EF4444', 'สูง': '#F59E0B', 'ปานกลาง': '#10B981', 'ต่ำ': '#94A3B8' };

  let statusBadge;
  if (pct >= recentMin) {
    statusBadge = `<span class="status-chip status-pass">✅ น่าจะผ่าน</span>`;
  } else if (pct >= recentMin - 8) {
    statusBadge = `<span class="status-chip status-border">⚠️ ชายขอบ</span>`;
  } else {
    statusBadge = `<span class="status-chip status-fail">❌ ต่ำกว่าขั้นต่ำ</span>`;
  }

  // Sparkline title differs for real vs simulated data
  const sparkTitle = isRealData
    ? `คะแนนต่ำสุดจริง (mytcas.com) — 2569: <strong>${recentMin}%</strong> <span style="font-size:0.7rem;color:#10B981;font-weight:600">📊 จริง</span>`
    : `คะแนนต่ำสุดประมาณการ 10 ปี — ≈ <strong>${recentMin}%</strong> <span style="font-size:0.7rem;color:#94A3B8">ประมาณ</span>`;

  const rankColors = ['#F0A500','#94A3B8','#CD7F32','#64748B','#64748B','#64748B','#64748B','#64748B','#64748B','#64748B'];
  const isLiked   = wishlist.includes(program.id);
  const isMatched = interests.length > 0 && interests.includes(program.category);
  const cardHighlight = isLiked && isMatched ? 'rec-rank-card--top'
                      : isLiked              ? 'rec-rank-card--liked'
                      : isMatched            ? 'rec-rank-card--matched'
                      : '';

  const pinBadges = [
    isLiked   ? `<span class="rec-pin-badge rec-pin-heart">❤️ กดใจ</span>`    : '',
    isMatched ? `<span class="rec-pin-badge rec-pin-match">🎯 ตรงสาขา</span>` : '',
  ].filter(Boolean).join('');

  return `
    <div class="rec-rank-card ${cardHighlight}" onclick="showProgramDetail('${program.id}')">
      <div class="rec-rank-badge" style="background:${rankColors[rank-1] || '#64748B'}">
        <span class="rank-num">#${rank}</span>
      </div>
      <div class="rec-rank-main">
        <div class="rec-rank-header">
          <span class="rec-rank-uni-tag" style="background:${uni.color};color:#fff;border-color:${uni.color}">${uni.shortName}</span>
          <div class="rec-rank-name">${program.program}</div>
          ${pinBadges ? `<div class="rec-pin-badges">${pinBadges}</div>` : ''}
        </div>
        <div class="rec-rank-sub">${program.faculty} · ${program.duration} · GPA ≥ ${program.minGPA}</div>
        <div class="match-bar-wrap" style="margin-top:8px">
          <div class="match-bar-label" style="font-size:0.78rem">
            <span>ความเหมาะสม</span>
            <strong style="color:${matchColor}">${pct}%</strong>
          </div>
          <div class="match-bar" style="height:7px">
            <div class="match-bar-fill" style="width:${pct}%;background:${matchColor}"></div>
          </div>
        </div>
      </div>
      <div class="rec-rank-history">
        <div class="sparkline-title">${sparkTitle}</div>
        ${sparkSvg}
        <div class="sparkline-legend">
          <span style="color:#6366F1">●</span> ขั้นต่ำในอดีต &nbsp;
          <span style="color:${pct >= recentMin ? '#10B981' : '#EF4444'}">- -</span> คะแนนของคุณ
        </div>
      </div>
      <div class="rec-rank-meta">
        ${statusBadge}
        <span class="comp-chip" style="color:${compColor[program.competition] || '#94A3B8'}">${program.competition}</span>
        <div class="round-tags-mini">
          ${program.rounds.map(r => { const RN=['Portfolio','โควตา','Admission','รับตรง']; return `<span class="round-tag-xs" style="background:${TCAS_DATA.rounds[r-1].color}">${RN[r-1]}</span>`; }).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// EXPORT / PRINT SUMMARY
// ============================================================
function exportSummary() {
  const p = state.studentData.profile;
  const gpa = state.studentData.gpa;
  const scores = state.studentData.scores;
  const portfolio = state.studentData.portfolio;
  const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'นักเรียน';

  const { results: topRecs } = getTopRecommendations(5);

  const scoreRows = [
    { name: 'GPAX สะสม', val: gpa.cumulative, max: '4.00', unit: '' },
    { name: 'TGAT1 ภาษาอังกฤษ', val: scores.tgat1, max: 100, unit: 'คะแนน' },
    { name: 'TGAT2 การคิดวิเคราะห์', val: scores.tgat2, max: 100, unit: 'คะแนน' },
    { name: 'TGAT3 สมรรถนะ', val: scores.tgat3, max: 100, unit: 'คะแนน' },
    { name: 'TPAT1 วิชาเฉพาะแพทย์', val: scores.tpat1, max: 300, unit: 'คะแนน' },
    { name: 'A-Level คณิต 1', val: scores.amath1, max: 100, unit: 'คะแนน' },
    { name: 'A-Level ภาษาอังกฤษ', val: scores.aeng, max: 100, unit: 'คะแนน' },
    { name: 'A-Level ภาษาไทย', val: scores.athai, max: 100, unit: 'คะแนน' },
    { name: 'A-Level ฟิสิกส์', val: scores.aphy, max: 100, unit: 'คะแนน' },
    { name: 'A-Level เคมี', val: scores.achem, max: 100, unit: 'คะแนน' },
    { name: 'A-Level ชีววิทยา', val: scores.abio, max: 100, unit: 'คะแนน' },
    { name: 'A-Level สังคม', val: scores.asocial, max: 100, unit: 'คะแนน' },
  ].filter(r => r.val);

  const allAwards = [
    ...(portfolio.awards || []).map(a => ({ ...a, _type: 'รางวัล' })),
    ...(portfolio.competitions || []).map(a => ({ ...a, _type: 'การแข่งขัน' }))
  ];

  const printWin = window.open('', '_blank', 'width=900,height=700');
  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>รายงาน TCAS70 – ${name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Prompt', sans-serif; font-size: 13px; color: #0F172A; background: white; padding: 32px; }
        .header { background: linear-gradient(135deg, #1A3A6B, #2856A3); color: white; padding: 24px 28px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; }
        .header p { font-size: 0.82rem; opacity: 0.8; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 0.95rem; font-weight: 700; color: #1A3A6B; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        th { text-align: left; padding: 7px 10px; font-size: 0.75rem; color: #64748B; text-transform: uppercase; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
        td { padding: 8px 10px; font-size: 0.85rem; border-bottom: 1px solid #F1F5F9; }
        tr:last-child td { border-bottom: none; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 50px; font-size: 0.7rem; font-weight: 600; }
        .badge-high { background: #D1FAE5; color: #065F46; }
        .badge-medium { background: #FEF3C7; color: #92400E; }
        .badge-low { background: #F1F5F9; color: #64748B; }
        .score-bar { height: 5px; background: #EDF0F5; border-radius: 3px; overflow: hidden; display: inline-block; width: 80px; vertical-align: middle; margin-left: 8px; }
        .score-bar-fill { height: 100%; border-radius: 3px; background: #1A3A6B; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .info-item { margin-bottom: 6px; }
        .info-label { font-size: 0.72rem; color: #94A3B8; text-transform: uppercase; }
        .info-value { font-size: 0.88rem; font-weight: 500; }
        .rec-item { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 8px; }
        .rec-badge { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: white; flex-shrink: 0; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 0.72rem; color: #94A3B8; text-align: center; }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 รายงานข้อมูลนักเรียน TCAS70</h1>
        <p>โรงเรียนโพธิสารพิทยากร | ปีการศึกษา 2570 | สร้างเมื่อ ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div class="section">
        <div class="section-title">👤 ข้อมูลนักเรียน</div>
        <div class="grid2">
          <div>
            <div class="info-item"><div class="info-label">ชื่อ-นามสกุล</div><div class="info-value">${name || '—'}</div></div>
            <div class="info-item"><div class="info-label">รหัสนักเรียน</div><div class="info-value">${p.studentId || '—'}</div></div>
            <div class="info-item"><div class="info-label">ห้องเรียน</div><div class="info-value">${p.classRoom || '—'}</div></div>
          </div>
          <div>
            <div class="info-item"><div class="info-label">เป้าหมาย</div><div class="info-value">${p.target || '—'}</div></div>
            <div class="info-item"><div class="info-label">อีเมล</div><div class="info-value">${p.email || '—'}</div></div>
            <div class="info-item"><div class="info-label">โทรศัพท์</div><div class="info-value">${p.phone || '—'}</div></div>
          </div>
        </div>
      </div>

      ${scoreRows.length ? `
      <div class="section">
        <div class="section-title">📊 คะแนนสอบ</div>
        <table>
          <thead><tr><th>วิชา</th><th>คะแนน</th><th>เต็ม</th><th>%</th></tr></thead>
          <tbody>
            ${scoreRows.map(r => {
              const pct = r.max ? Math.round(parseFloat(r.val) / parseFloat(r.max) * 100) : null;
              return `<tr>
                <td>${r.name}</td>
                <td><strong>${r.val}</strong></td>
                <td style="color:#94A3B8">${r.max}</td>
                <td>${pct !== null ? `${pct}%<div class="score-bar"><div class="score-bar-fill" style="width:${pct}%"></div></div>` : '—'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${allAwards.length ? `
      <div class="section">
        <div class="section-title">🏆 รางวัลและการแข่งขัน</div>
        <table>
          <thead><tr><th>ชื่อ</th><th>ประเภท</th><th>ระดับ</th><th>ผล</th><th>ปี</th></tr></thead>
          <tbody>
            ${allAwards.map(a => {
              const lvl = TCAS_DATA.awardLevels.find(l => l.id === a.level);
              return `<tr>
                <td>${a.name}</td>
                <td>${a._type}</td>
                <td>${lvl ? lvl.name : '—'}</td>
                <td>${a.result || '—'}</td>
                <td>${a.year || '—'}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${(portfolio.camps?.length || portfolio.activities?.length || portfolio.volunteer?.length) ? `
      <div class="section">
        <div class="section-title">🎯 ค่าย กิจกรรม และอาสาสมัคร</div>
        <table>
          <thead><tr><th>ชื่อ</th><th>ประเภท</th><th>ปี</th><th>ผู้จัด</th></tr></thead>
          <tbody>
            ${[...(portfolio.camps||[]).map(i=>({...i,_t:'ค่าย'})), ...(portfolio.activities||[]).map(i=>({...i,_t:'กิจกรรม'})), ...(portfolio.volunteer||[]).map(i=>({...i,_t:'อาสา'}))].map(i => `<tr><td>${i.name||'—'}</td><td>${i._t}</td><td>${i.year||'—'}</td><td>${i.organizer||'—'}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${topRecs.length ? `
      <div class="section">
        <div class="section-title">🎯 คณะที่แนะนำ</div>
        ${topRecs.map(({ program, result }) => {
          const uni = getUniversityById(program.universityId);
          const pct = Math.min(result.score, 100);
          const cls = pct >= 65 ? 'badge-high' : pct >= 40 ? 'badge-medium' : 'badge-low';
          return `<div class="rec-item">
            <div class="rec-badge" style="background:${uni.color}">${uni.shortName.slice(0,2)}</div>
            <div style="flex:1">
              <div style="font-weight:600">${program.program}</div>
              <div style="font-size:0.78rem;color:#64748B">${program.faculty} · ${uni.name}</div>
            </div>
            <span class="badge ${cls}">${pct}% เหมาะสม</span>
          </div>`;
        }).join('')}
      </div>` : ''}

      <div class="footer">
        สร้างโดย TCAS70 Student Advisor | โรงเรียนโพธิสารพิทยากร | www.ps.ac.th | อ้างอิงข้อมูล www.mytcas.com
      </div>
      <script>window.onload = () => window.print();<\/script>
    </body>
    </html>
  `);
  printWin.document.close();
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' toast-error' : '');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ============================================================
// RESET DATA
// ============================================================
function confirmReset() {
  if (confirm('ล้างข้อมูลทั้งหมด? ข้อมูล GPA คะแนน ผลงาน และโปรไฟล์จะถูกลบออกจากอุปกรณ์นี้')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('tcas70_wishlist');
    location.reload();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  // Modal close
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Student chip click -> profile
  document.getElementById('student-chip')?.addEventListener('click', () => navigate('profile'));

  // Initialize app directly (no login needed)
  updateHeaderChip();
  navigate('dashboard');
});

// ============================================================
// TCAS70 CALENDAR
// ============================================================

const TH_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const TH_MONTHS_LONG  = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const TH_DAYS_SHORT   = ['อา','จ','อ','พ','พฤ','ศ','ส'];

const TCAS70_EVENTS = [
  { id:'reg-mytcas',      title:'ลงทะเบียน student.mytcas.com',  short:'ลงทะเบียน mytcas', category:'เตรียมตัว',
    subtitle:'สร้างบัญชีนักเรียนสำหรับสมัครสอบและ TCAS ทุกรอบ',
    type:'prep',         start:'2026-07-15', end:'2026-07-15', color:'#8B5CF6', icon:'🎓' },
  { id:'round1',          title:'รอบ 1 Portfolio',                short:'Portfolio', category:'รอบ TCAS',
    subtitle:'ยื่นแฟ้มสะสมผลงาน ผ่าน TCASFolio — สำหรับนักเรียนที่มีผลงานพิเศษ',
    type:'round1',       start:'2026-08-15', end:'2027-02-28', color:'#6366F1', icon:'📁' },
  { id:'reg-tgat-tpat',   title:'สมัครสอบ TGAT / TPAT',          short:'สมัคร TGAT/TPAT', category:'สมัคร',
    subtitle:'TGAT1-3 · TPAT2-5 · สมัครผ่าน student.mytcas.com',
    type:'registration', start:'2026-11-04', end:'2026-11-12', color:'#6366F1', icon:'📝' },
  { id:'reg-alevel',      title:'สมัครสอบ A-Level',               short:'สมัคร A-Level', category:'สมัคร',
    subtitle:'ทุกวิชา A-Level ผ่าน student.mytcas.com',
    type:'registration', start:'2027-01-14', end:'2027-01-22', color:'#6366F1', icon:'📝' },
  { id:'exam-tgat-tpat3', title:'สอบ TGAT + TPAT3',              short:'สอบ TGAT/TPAT3', category:'สอบ',
    subtitle:'TGAT ความถนัดทั่วไป · TPAT3 วิทย์-เทคโน-วิศวะ',
    type:'exam',         start:'2027-01-30', end:'2027-01-30', color:'#EF4444', icon:'✏️' },
  { id:'exam-tpat25',     title:'สอบ TPAT2 + TPAT5',             short:'สอบ TPAT2/5', category:'สอบ',
    subtitle:'TPAT2 ศิลปกรรม · TPAT5 ครุศาสตร์-ศึกษาศาสตร์',
    type:'exam',         start:'2027-01-31', end:'2027-01-31', color:'#EF4444', icon:'✏️' },
  { id:'exam-tpat4',      title:'สอบ TPAT4 สถาปัตยกรรม',         short:'สอบ TPAT4', category:'สอบ',
    subtitle:'80 ข้อ / 180 นาที',
    type:'exam',         start:'2027-02-01', end:'2027-02-01', color:'#EF4444', icon:'✏️' },
  { id:'exam-tpat1',      title:'สอบ TPAT1 กสพท (แพทย์)',         short:'สอบ TPAT1 กสพท', category:'สอบ',
    subtitle:'เชาวน์ปัญญา · จริยธรรม · ความคิดเชื่อมโยง',
    type:'exam',         start:'2027-02-13', end:'2027-02-13', color:'#DC2626', icon:'🏥' },
  { id:'exam-al1',        title:'A-Level วันที่ 1',               short:'A-Level วัน 1', category:'สอบ',
    subtitle:'ฟิสิกส์ · ชีววิทยา · สังคมศึกษา · ภาษาไทย',
    type:'exam',         start:'2027-03-13', end:'2027-03-13', color:'#F97316', icon:'✏️' },
  { id:'exam-al2',        title:'A-Level วันที่ 2',               short:'A-Level วัน 2', category:'สอบ',
    subtitle:'คณิตศาสตร์1 · เคมี · ภาษาอังกฤษ',
    type:'exam',         start:'2027-03-14', end:'2027-03-14', color:'#F97316', icon:'✏️' },
  { id:'exam-al3',        title:'A-Level วันที่ 3',               short:'A-Level วัน 3', category:'สอบ',
    subtitle:'คณิตศาสตร์2 · วิทยาศาสตร์ประยุกต์ · ภาษาต่างประเทศ',
    type:'exam',         start:'2027-03-15', end:'2027-03-15', color:'#F97316', icon:'✏️' },
  { id:'result-alevel',   title:'ประกาศผลคะแนน A-Level',          short:'ผล A-Level', category:'ผลคะแนน',
    subtitle:'ตรวจสอบผลที่ student.mytcas.com',
    type:'result',       start:'2027-04-20', end:'2027-04-20', color:'#F97316', icon:'📊' },
  { id:'round2',          title:'รอบ 2 โควตา',                    short:'โควตา', category:'รอบ TCAS',
    subtitle:'โควตาพื้นที่ / ประเภทนักเรียน ผ่าน student.mytcas.com',
    type:'round2',       start:'2027-03-13', end:'2027-04-30', color:'#10B981', icon:'🏷️' },
  { id:'round3',          title:'รอบ 3 Admission',                short:'Admission', category:'รอบ TCAS',
    subtitle:'ยื่นคะแนน TGAT/TPAT+A-Level — สูงสุด 10 อันดับ',
    type:'round3',       start:'2027-05-07', end:'2027-05-11', color:'#F59E0B', icon:'🎯' },
  { id:'round4',          title:'รอบ 4 รับตรงอิสระ',              short:'รับตรงอิสระ', category:'รอบ TCAS',
    subtitle:'รับตรงของแต่ละมหาวิทยาลัย — ตรวจสอบจากสถาบัน',
    type:'round4',       start:'2027-05-29', end:'2027-06-15', color:'#EF4444', icon:'🏛️' },
];

function calThDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${TH_MONTHS_SHORT[d.getMonth()]} ${(d.getFullYear()+543).toString().slice(-2)}`;
}
function calThDateRange(s, e) {
  if (s === e) return calThDateStr(s);
  const sd = new Date(s+'T00:00:00'), ed = new Date(e+'T00:00:00');
  if (sd.getMonth() === ed.getMonth() && sd.getFullYear() === ed.getFullYear())
    return `${sd.getDate()}–${ed.getDate()} ${TH_MONTHS_SHORT[sd.getMonth()]} ${(sd.getFullYear()+543).toString().slice(-2)}`;
  return `${calThDateStr(s)} – ${calThDateStr(e)}`;
}

// ---- Day-of-week helper (for Planner) ----
const TH_DAYS_FULL = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
function calThDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `วัน${TH_DAYS_FULL[d.getDay()]}`;
}
// Returns "13 มี.ค. 70 (ศ)" for single day, or a range with start/end day names
function calThDateRangeWithDay(s, e) {
  const sd = new Date(s+'T00:00:00');
  if (s === e) return `${calThDateStr(s)} (${TH_DAYS_SHORT[sd.getDay()]})`;
  const ed = new Date(e+'T00:00:00');
  const spanDays = Math.round((ed - sd) / 86400000);
  // Long spans (rounds/portfolio windows) — day-of-week isn't meaningful, just show the date range
  if (spanDays > 14) return calThDateRange(s, e);
  return `${calThDateStr(s)} (${TH_DAYS_SHORT[sd.getDay()]}) – ${calThDateStr(e)} (${TH_DAYS_SHORT[ed.getDay()]})`;
}

// ---- Calendar grid helpers ----
function buildMonthEvents(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  return TCAS70_EVENTS.filter(ev => {
    const s = new Date(ev.start + 'T00:00:00');
    const e = new Date(ev.end   + 'T00:00:00');
    return s <= lastDay && e >= firstDay;
  });
}

function calNavMonth(delta) {
  state.calendarMonth += delta;
  if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear++; }
  if (state.calendarMonth < 0)  { state.calendarMonth = 11; state.calendarYear--; }
  // Clamp to TCAS70 range: ก.ค. 2569 – มิ.ย. 2570
  if (state.calendarYear < 2026 || (state.calendarYear === 2026 && state.calendarMonth < 6)) {
    state.calendarYear = 2026; state.calendarMonth = 6;
  }
  if (state.calendarYear > 2027 || (state.calendarYear === 2027 && state.calendarMonth > 5)) {
    state.calendarYear = 2027; state.calendarMonth = 5;
  }
  renderCalendar();
}

// ---- Main render (calendar grid) ----
function renderCalendar() {
  const container = document.getElementById('calendar-content');
  if (!container) return;

  const today   = new Date(); today.setHours(0,0,0,0);
  const notifOK = ('Notification' in window) && Notification.permission === 'granted';
  const alerts  = getCalAlerts(today);

  const yr      = state.calendarYear;
  const mo      = state.calendarMonth;
  const isFirst = (yr === 2026 && mo === 6);
  const isLast  = (yr === 2027 && mo === 5);

  // Grid math
  const firstOfMonth = new Date(yr, mo, 1);
  const lastOfMonth  = new Date(yr, mo + 1, 0);
  const startDow     = firstOfMonth.getDay();   // 0 = อาทิตย์
  const totalDays    = lastOfMonth.getDate();

  // Build cell array (prev overflow + current month + next overflow)
  const cells = [];
  const prevLastDay = new Date(yr, mo, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) cells.push({ day: prevLastDay - i, type: 'prev' });
  for (let d = 1; d <= totalDays; d++)      cells.push({ day: d, type: 'cur' });
  const totalCells = Math.ceil(cells.length / 7) * 7;
  for (let d = 1; cells.length < totalCells; d++) cells.push({ day: d, type: 'next' });

  // Events active on a specific day of current month
  function getEventsForDay(day) {
    const d = new Date(yr, mo, day);
    return TCAS70_EVENTS.filter(ev => {
      const s = new Date(ev.start + 'T00:00:00');
      const e = new Date(ev.end   + 'T00:00:00');
      return d >= s && d <= e;
    });
  }

  // Is this the event's start day in the current month?
  function isStartDay(ev, day) {
    const s = new Date(ev.start + 'T00:00:00');
    return s.getFullYear() === yr && s.getMonth() === mo && s.getDate() === day;
  }

  // Upcoming events sorted by start date
  const upcoming = buildMonthEvents(yr, mo).sort((a,b) => new Date(a.start) - new Date(b.start));

  function dayStatus(ev) {
    const s  = new Date(ev.start+'T00:00:00');
    const e  = new Date(ev.end+'T00:00:00');
    const ds = Math.round((s-today)/86400000);
    const de = Math.round((e-today)/86400000);
    if (de < 0)  return { label:'เสร็จสิ้น',      cls:'cal-s-past' };
    if (ds <= 0) return { label:'กำลังดำเนินการ', cls:'cal-s-active' };
    if (ds <= 7) return { label:`อีก ${ds} วัน`,  cls:'cal-s-soon' };
    return              { label:`${ds} วัน`,       cls:'cal-s-future' };
  }

  // Render one day cell
  function cellHTML(cell) {
    const isCur   = cell.type === 'cur';
    const isToday = isCur && today.getFullYear() === yr && today.getMonth() === mo && today.getDate() === cell.day;
    let cls = 'tcal-cell';
    if (!isCur)  cls += ' other-month';
    if (isToday) cls += ' today';

    const dayNumHTML = isToday
      ? `<span class="tcal-today-dot">${cell.day}</span>`
      : `<div class="tcal-day-num">${cell.day}</div>`;

    let evBarsHTML = '';
    if (isCur) {
      const dayEvs = getEventsForDay(cell.day);
      const show   = dayEvs.slice(0, 2);
      const extra  = dayEvs.length - show.length;
      show.forEach(ev => {
        const start = isStartDay(ev, cell.day);
        const lbl   = start ? `${ev.icon} ${ev.short || ev.title}` : '';
        evBarsHTML += `<div class="tcal-ev-bar${start?'':' cont'}" style="background:${ev.color}" title="${ev.title}">${lbl}</div>`;
      });
      if (extra > 0) evBarsHTML += `<div class="tcal-more">+${extra}</div>`;
    }

    return `<div class="${cls}">${dayNumHTML}${evBarsHTML}</div>`;
  }

  container.innerHTML = `
    <div class="cal-notif-bar">
      ${notifOK
        ? `<span class="notif-ok-badge">🔔 เปิดแจ้งเตือนแล้ว</span>`
        : `<button class="btn btn-outline btn-sm" onclick="requestCalNotif()">🔔 เปิดการแจ้งเตือน</button>`}
    </div>

    <div id="cal-alerts">${alerts.map(renderCalAlertBanner).join('')}</div>

    <div class="tcal-nav">
      <button class="tcal-nav-btn" onclick="calNavMonth(-1)"${isFirst ? ' disabled' : ''}>‹</button>
      <div class="tcal-nav-center">
        <div class="tcal-nav-month">${TH_MONTHS_LONG[mo]}</div>
        <div class="tcal-nav-year">พ.ศ. ${yr + 543}</div>
      </div>
      <button class="tcal-nav-btn" onclick="calNavMonth(1)"${isLast ? ' disabled' : ''}>›</button>
    </div>

    <div class="tcal-grid">
      ${TH_DAYS_SHORT.map((d,i) => `<div class="tcal-dow${i===0||i===6?' weekend':''}">${d}</div>`).join('')}
      ${cells.map(cellHTML).join('')}
    </div>

    <div class="tcal-legend">
      ${[
        {color:'#8B5CF6', label:'เตรียมตัว'},
        {color:'#6366F1', label:'สมัคร / Portfolio'},
        {color:'#EF4444', label:'สอบ TGAT/TPAT'},
        {color:'#F97316', label:'A-Level'},
        {color:'#10B981', label:'โควตา'},
        {color:'#F59E0B', label:'Admission'},
      ].map(l=>`<div class="tcal-legend-item"><div class="tcal-legend-dot" style="background:${l.color}"></div>${l.label}</div>`).join('')}
    </div>

    <div class="tcal-upcoming-hdr">📋 กำหนดการเดือนนี้</div>
    ${upcoming.length === 0
      ? `<div class="tcal-upcoming-empty">ไม่มีกำหนดการในเดือนนี้</div>`
      : upcoming.map(ev => {
          const st = dayStatus(ev);
          return `<div class="tcal-upcoming-item" style="--ev-color:${ev.color}">
            <div class="tcal-ev-icon">${ev.icon}</div>
            <div class="tcal-ev-body">
              <div class="tcal-ev-title">${ev.title}</div>
              <div class="tcal-ev-sub">${ev.subtitle}</div>
              <div class="tcal-ev-date">📅 ${calThDateRange(ev.start, ev.end)}</div>
            </div>
            <div class="tcal-ev-status ${st.cls}">${st.label}</div>
          </div>`;
        }).join('')}

    <div class="tcal-links">
      <a href="https://student.mytcas.com" target="_blank" class="tcal-link-btn primary">🎓 สมัครสอบ / TCAS</a>
      <a href="https://www.mytcas.com" target="_blank" class="tcal-link-btn secondary">🌐 mytcas.com</a>
    </div>

    <div style="height:20px"></div>
  `;

  if (notifOK) sendCalBrowserAlerts(alerts);
}

function toggleCalSection(id) {
  const el  = document.getElementById(id);
  const arr = document.getElementById('arr-'+id);
  if (!el) return;
  const isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  if (arr) arr.style.transform = isOpen ? '' : 'rotate(180deg)';
}

// ---- Alerts / Notifications ----
function getCalAlerts(today) {
  const dismissed = JSON.parse(localStorage.getItem('tcas70-cal-dismissed')||'[]');
  const out = [];
  TCAS70_EVENTS.forEach(ev => {
    const s = new Date(ev.start+'T00:00:00'), e = new Date(ev.end+'T00:00:00');
    const ds = Math.round((s-today)/86400000), de = Math.round((e-today)/86400000);
    [7,2,1].forEach(d => { if (ds===d) { const k=`s-${ev.id}-${d}`; if(!dismissed.includes(k)) out.push({k,ev,type:'start',days:d}); } });
    if (ev.start!==ev.end) [7,3,1].forEach(d => { if (de===d) { const k=`e-${ev.id}-${d}`; if(!dismissed.includes(k)) out.push({k,ev,type:'end',days:d}); } });
  });
  return out;
}

function renderCalAlertBanner(a) {
  const msg = a.type==='start' ? `เริ่มในอีก <strong>${a.days} วัน</strong>` : `สิ้นสุดในอีก <strong>${a.days} วัน</strong>`;
  return `<div class="cal-alert" style="--alc:${a.ev.color}">
    <span class="cal-alert-icon">🔔</span>
    <div class="cal-alert-body"><strong>${a.ev.icon} ${a.ev.title}</strong><span>${msg}</span></div>
    <button class="cal-alert-dismiss" onclick="dismissCalAlert('${a.k}')">✕</button>
  </div>`;
}

function dismissCalAlert(k) {
  const d = JSON.parse(localStorage.getItem('tcas70-cal-dismissed')||'[]');
  d.push(k); localStorage.setItem('tcas70-cal-dismissed', JSON.stringify(d));
  const el = document.getElementById('cal-alerts');
  if (el) el.innerHTML = getCalAlerts(new Date()).map(renderCalAlertBanner).join('');
}

function sendCalBrowserAlerts(alerts) {
  alerts.forEach(a => {
    const k = `tcas70-bn-${a.k}`;
    if (!localStorage.getItem(k)) {
      const msg = a.type==='start' ? `เริ่มในอีก ${a.days} วัน` : `สิ้นสุดในอีก ${a.days} วัน`;
      new Notification(`🔔 ${a.ev.title}`, { body: msg, icon:'./images/icon-192.png' });
      localStorage.setItem(k,'1');
    }
  });
}

function requestCalNotif() {
  if (!('Notification' in window)) { alert('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน'); return; }
  Notification.requestPermission().then(p => {
    if (p==='granted') new Notification('✅ เปิดการแจ้งเตือน TCAS70 สำเร็จ',
      { body:'คุณจะได้รับแจ้งเตือนกำหนดการสำคัญล่วงหน้า', icon:'./images/icon-192.png' });
    renderCalendar();
  });
}

// ---- Exam Tables (expandable) ----
function calTGATTableHTML() {
  const rows = [
    ['TGAT ความถนัดทั่วไป (TGAT1 · TGAT2 · TGAT3)','200','180 นาที','54 วิ','4–12 พ.ย. 69','30 ม.ค. 70','#6366F1'],
    ['TPAT1 วิชาเฉพาะ กสพท\nเชาวน์ปัญญา / จริยธรรม / ความคิดเชื่อมโยง','45+55+บท','75+60+60 นาที','—','กสพท (แยก)','13 ก.พ. 70','#DC2626'],
    ['TPAT2 ความถนัดศิลปกรรมศาสตร์','150','180 นาที','1 นาที 12 วิ','4–12 พ.ย. 69','31 ม.ค. 70','#EF4444'],
    ['TPAT3 วิทยาศาสตร์-เทคโนโลยี-วิศวกรรม','70','180 นาที','2 นาที 34 วิ','4–12 พ.ย. 69','30 ม.ค. 70','#EF4444'],
    ['TPAT4 ความถนัดทางสถาปัตยกรรม','80','180 นาที','2 นาที 15 วิ','4–12 พ.ย. 69','1 ก.พ. 70','#EF4444'],
    ['TPAT5 ความถนัดครูศาสตร์-ศึกษาศาสตร์','100','180 นาที','1 นาที 48 วิ','4–12 พ.ย. 69','31 ม.ค. 70','#EF4444'],
  ];
  return `<div class="exam-tbl-wrap">
    <table class="exam-tbl">
      <thead><tr><th>รายวิชา</th><th>ข้อ</th><th>เวลา</th><th>เวลา/ข้อ</th><th>รับสมัคร</th><th>วันสอบ</th></tr></thead>
      <tbody>${rows.map(r=>`<tr style="border-left:3px solid ${r[6]}">
        <td style="white-space:pre-line;font-size:0.78rem">${r[0]}</td>
        <td style="text-align:center">${r[1]}</td><td style="text-align:center;white-space:nowrap">${r[2]}</td>
        <td style="text-align:center;font-size:0.72rem;white-space:nowrap">${r[3]}</td>
        <td style="text-align:center;font-size:0.72rem">${r[4]}</td>
        <td style="text-align:center;font-weight:700;color:${r[6]}">${r[5]}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;
}

function calALevelTableHTML() {
  const rows = [
    ['A-Level คณิตศาสตร์ 1','30','90 นาที','3 นาที','14 มี.ค. 70','#F97316'],
    ['A-Level คณิตศาสตร์ 2','30','90 นาที','3 นาที','15 มี.ค. 70','#F97316'],
    ['A-Level วิทยาศาสตร์ประยุกต์','30','90 นาที','3 นาที','15 มี.ค. 70','#F97316'],
    ['A-Level ฟิสิกส์','30','90 นาที','3 นาที','13 มี.ค. 70','#F97316'],
    ['A-Level เคมี','35','90 นาที','2 นาที 34 วิ','14 มี.ค. 70','#F97316'],
    ['A-Level ชีววิทยา','40','90 นาที','2 นาที 15 วิ','13 มี.ค. 70','#F97316'],
    ['A-Level สังคมศึกษา','50','90 นาที','1 นาที 48 วิ','13 มี.ค. 70','#F97316'],
    ['A-Level ภาษาไทย','50','90 นาที','1 นาที 48 วิ','13 มี.ค. 70','#F97316'],
    ['A-Level ภาษาอังกฤษ','80','90 นาที','1 นาที 7 วิ','14 มี.ค. 70','#F97316'],
    ['A-Level ภาษาต่างประเทศ (ฝ/เยอ/ญี่/เกา/จีน/บาลี/สเปน)','50','90 นาที','1 นาที 48 วิ','15 มี.ค. 70','#F97316'],
  ];
  return `<div class="exam-tbl-wrap">
    <table class="exam-tbl">
      <thead><tr><th>รายวิชา</th><th>ข้อ</th><th>เวลา</th><th>เวลา/ข้อ</th><th>วันสอบ</th></tr></thead>
      <tbody>${rows.map(r=>`<tr style="border-left:3px solid ${r[5]}">
        <td style="font-size:0.78rem">${r[0]}</td>
        <td style="text-align:center">${r[1]}</td><td style="text-align:center;white-space:nowrap">${r[2]}</td>
        <td style="text-align:center;font-size:0.72rem;white-space:nowrap">${r[3]}</td>
        <td style="text-align:center;font-weight:700;color:${r[5]}">${r[4]}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;
}
