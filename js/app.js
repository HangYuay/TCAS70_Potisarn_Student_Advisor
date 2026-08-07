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
  prefUniFilter: '',       // university id filter inside preferences modal
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
      classNo: '',
      program: '',
      studyPlan: '',
      advisor1: '',
      advisor2: '',
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
    avatarData: '',     // base64 data URL of user photo
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
  // Sync mobile bottom nav items (studylog/mocktest/mistakelog are sub-pages of planner)
  const PLANNER_SUB_PAGES = new Set(['planner-hub', 'planner', 'studylog', 'mocktest', 'mistakelog']);
  document.querySelectorAll('.mobile-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page ||
      (PLANNER_SUB_PAGES.has(page) && el.dataset.page === 'planner'));
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
    case 'planner-hub': break;
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
  const prefs = state.studentData.preferences || [];

  const name = p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : 'นักเรียน';
  const cumGPA = parseFloat(gpa.cumulative) || 0;

  const tgat1 = parseFloat(scores.tgat1)||0, tgat2 = parseFloat(scores.tgat2)||0, tgat3 = parseFloat(scores.tgat3)||0;
  const tgatTotal = tgat1+tgat2+tgat3;
  const tpat1 = parseFloat(scores.tpat1)||0, tpat2 = parseFloat(scores.tpat2)||0,
        tpat3s = parseFloat(scores.tpat3)||0, tpat4 = parseFloat(scores.tpat4)||0, tpat5 = parseFloat(scores.tpat5)||0;
  const tpatAny = tpat1||tpat2||tpat3s||tpat4||tpat5;

  const aKeys = ['amath1','aeng','athai','ascience','achem','abio','aphy','asocial'];
  const aNames = ['คณิต 1','อังกฤษ','ไทย','วิทย์','เคมี','ชีวะ','ฟิสิกส์','สังคม'];
  const aVals = aKeys.map(k => parseFloat(scores[k])||0);
  const aCount = aVals.filter(v => v > 0).length;

  const totalItems = (portfolio.camps?.length||0)+(portfolio.activities?.length||0)+
    (portfolio.awards?.length||0)+(portfolio.competitions?.length||0)+(portfolio.volunteer?.length||0);

  // Overall readiness: 50% exam, 25% GPAX, 25% Portfolio
  const gpaReady = cumGPA > 0 ? cumGPA/4 : 0;
  const portReady = Math.min(totalItems/10, 1);
  const examPcts = [];
  if (tgatTotal > 0) examPcts.push(tgatTotal/300);
  if (tpat1 > 0) examPcts.push(tpat1/300);
  [tpat2,tpat3s,tpat4,tpat5].forEach(v => { if (v > 0) examPcts.push(v/100); });
  aVals.forEach(v => { if (v > 0) examPcts.push(v/100); });
  const examReady = examPcts.length ? examPcts.reduce((a,b)=>a+b,0)/examPcts.length : 0;
  const overall = 0.5*examReady + 0.25*gpaReady + 0.25*portReady;
  const overallPct = Math.round(overall*100);

  // Donut segments (circumference ≈ 226)
  const C = 226, GAP = 3;
  const totalArc = overall * C;
  const ec = 0.5*examReady, gc = 0.25*gpaReady, pc = 0.25*portReady;
  const tc = ec+gc+pc || 1;
  const nz = [ec,gc,pc].filter(v=>v>0).length;
  const usable = Math.max(totalArc - (nz>1?(nz-1)*GAP:0), 0);
  const eArc = usable*(ec/tc), gArc = usable*(gc/tc), pArc = usable*(pc/tc);
  let pos = 0;
  const seg = (arc, color) => {
    if (arc < 0.5) return '';
    const s = `<circle cx="42" cy="42" r="36" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="${arc.toFixed(1)} ${(C-arc).toFixed(1)}" stroke-linecap="round" stroke-dashoffset="${(C-pos).toFixed(1)}" transform="rotate(-90 42 42)"/>`;
    return s;
  };
  const s1 = seg(eArc,'#93C5FD'); pos += eArc + (eArc>0&&gArc>0?GAP:0);
  const s2 = seg(gArc,'#FFD166'); pos += gArc + (gArc>0&&pArc>0?GAP:0);
  const s3 = seg(pArc,'#F9A8D4');

  // Date string
  const now = new Date();
  const thDate = `${TH_DAYS_FULL[now.getDay()]}ที่ ${now.getDate()} ${TH_MONTHS_SHORT[now.getMonth()]} ${(now.getFullYear()+543).toString().slice(-2)}`;

  // Upcoming events (future/ongoing, max 6)
  const todayMid = new Date(); todayMid.setHours(0,0,0,0);
  const upcoming = TCAS70_EVENTS.filter(ev => new Date(ev.end+'T00:00:00') >= todayMid).slice(0,6);

  // Stat display helpers
  const tpatDisplay = tpat1>0
    ? `${tpat1}<span style="font-size:0.6rem;font-weight:400;opacity:0.6">/300</span>`
    : tpatAny>0
      ? `${Math.max(tpat2,tpat3s,tpat4,tpat5)}<span style="font-size:0.6rem;font-weight:400;opacity:0.6">/100</span>`
      : '<span style="opacity:0.45">—</span>';
  const aDisplay = aCount>0
    ? `${aCount}<span style="font-size:0.6rem;font-weight:400;opacity:0.6"> วิชา</span>`
    : '<span style="opacity:0.45">—</span>';

  // Round info helpers
  const roundNames4 = {1:'Portfolio',2:'โควตา',3:'Admission',4:'รับตรง'};
  const roundColors4 = {1:'#6366F1',2:'#10B981',3:'#F59E0B',4:'#EF4444'};
  // Readiness % by round type (reuse values computed above)
  const roundReadyPct = {
    1: Math.round(portReady * 100),
    2: Math.round(gpaReady * 100),
    3: Math.round(examReady * 100),
    4: Math.round(Math.min(examReady * 0.6 + gpaReady * 0.4, 1) * 100),
  };
  const buildRoundSlot = (prog, r) => {
    if (!prog.rounds?.includes(r)) {
      return `<div class="db-round-slot inactive"><div class="db-round-name" style="color:var(--text-muted)">${roundNames4[r]}</div><div class="db-round-na">ไม่รับ</div></div>`;
    }
    const src = prog.roundSources?.[r] || 'tcas69';
    const is69 = src === 'tcas69';
    const rp = roundReadyPct[r];
    const hasData = rp > 0;
    const rpColor = rp >= 70 ? '#10B981' : rp >= 50 ? '#F59E0B' : rp > 0 ? '#EF4444' : 'var(--text-muted)';
    return `<div class="db-round-slot active" style="border-color:${roundColors4[r]}30;background:${roundColors4[r]}0A">
      <div class="db-round-name" style="color:${roundColors4[r]}">${roundNames4[r]}</div>
      <div style="font-size:0.72rem;font-weight:700;color:${rpColor};margin:2px 0">${hasData?rp+'%':'—'}</div>
      <div class="db-round-src" style="color:${is69?'var(--text-muted)':'var(--success)'};font-size:0.5rem">${is69?'ref 69':'TCAS70'}</div>
    </div>`;
  };

  // Goal card builder
  const buildGoalCard = (pid, i) => {
    const prog = TCAS_DATA.programs.find(pr => pr.id === pid);
    if (!prog) return '';
    const uni = getUniversityById(prog.universityId);
    const hasFull = prog.programFull && prog.programFull !== prog.program;
    const rankBg = i < 3 ? ['#F0A500','#94A3B8','#CD7F32'][i] : 'var(--surface-3)';
    const rankColor = i < 3 ? 'white' : 'var(--text-muted)';
    return `<div class="db-goal-card">
      <div style="display:flex;align-items:flex-start;gap:8px">
        <div class="pref-rank" style="background:${rankBg};color:${rankColor};flex-shrink:0">${i+1}</div>
        <div style="flex:1;min-width:0">
          <div class="pref-item-header">
            <span class="pref-uni-tag" style="background:${uni.color}20;color:${uni.color}">${uni.shortName}</span>
            <span class="pref-prog-name">${prog.program}</span>
          </div>
          <div class="pref-item-sub">${prog.faculty}</div>
          ${hasFull?`<div class="pref-item-full">${prog.programFull}</div>`:''}
        </div>
      </div>
      <div class="db-rounds-grid">
        ${[1,2,3,4].map(r => buildRoundSlot(prog, r)).join('')}
      </div>
    </div>`;
  };

  const visibleGoals = prefs.slice(0,3).map((pid,i) => buildGoalCard(pid,i)).join('');
  const extraCount = prefs.length - 3;
  const extraGoals = extraCount > 0 ? prefs.slice(3).map((pid,i) => buildGoalCard(pid,i+3)).join('') : '';

  // Score bars
  const renderScoreBar = t => {
    const pct = Math.round(t.val/t.max*100);
    const bc = pct>=70?'var(--success)':pct>=50?'var(--warning)':'var(--danger)';
    return `<div style="display:flex;align-items:center;gap:8px;padding:3px 0">
      <div style="width:54px;font-size:0.7rem;color:var(--text-secondary);flex-shrink:0">${t.name}</div>
      <div style="flex:1;height:5px;background:var(--surface-3);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${bc};border-radius:3px"></div>
      </div>
      <div style="width:32px;text-align:right;font-size:0.72rem;font-weight:600;color:${bc}">${t.val}</div>
    </div>`;
  };
  const tgatBars = [{name:'TGAT1',val:tgat1,max:100},{name:'TGAT2',val:tgat2,max:100},{name:'TGAT3',val:tgat3,max:100}].filter(t=>t.val>0);
  const tpatBars = [{name:'TPAT1',val:tpat1,max:300},{name:'TPAT2',val:tpat2,max:100},{name:'TPAT3',val:tpat3s,max:100},{name:'TPAT4',val:tpat4,max:100},{name:'TPAT5',val:tpat5,max:100}].filter(t=>t.val>0);
  const aLevelBars = aVals.map((v,i)=>({name:aNames[i],val:v,max:100})).filter(t=>t.val>0);
  const hasTgatTpat = tgatBars.length > 0 || tpatBars.length > 0;

  // Study log weekly card
  const studyLog = Array.isArray(state.studentData.planner?.studyLog) ? state.studentData.planner.studyLog : [];
  const todayStr = studyLogYMD(new Date());
  const wkStartStr = studyLogWeekStart(todayStr);
  const wkDays = Array.from({length:7}, (_, i) => {
    const d = new Date(wkStartStr + 'T00:00:00'); d.setDate(d.getDate()+i); return studyLogYMD(d);
  });
  const tmrStr = (() => { const d = new Date(); d.setDate(d.getDate()+1); return studyLogYMD(d); })();
  const blkEmoji = { morning:'🌅', afternoon:'🌤', evening:'🌇', night:'🌙' };
  const blkLbl   = { morning:'เช้า', afternoon:'บ่าย', evening:'เย็น', night:'ค่ำ' };
  const subChipColor = s => {
    const pal = [
      ['rgba(26,58,107,0.12)','#1A3A6B'], ['rgba(109,40,217,0.12)','#6D28D9'],
      ['rgba(5,150,105,0.12)','#059669'],  ['rgba(217,119,6,0.12)','#D97706'],
      ['rgba(220,38,38,0.12)','#DC2626'],  ['rgba(29,78,216,0.12)','#1D4ED8'],
    ];
    return pal[(s||'').split('').reduce((a,c)=>a+c.charCodeAt(0),0) % pal.length];
  };
  const todayLogs = studyLog.filter(e => e.date === todayStr);
  const tmrLogs   = studyLog.filter(e => e.date === tmrStr);
  const wkLogs    = studyLog.filter(e => wkDays.includes(e.date));
  const wkDone    = wkLogs.filter(e => e.done).length;

  // GPAX semester count
  const gpaKeys6 = ['m401','m402','m411','m412','m421','m422'];
  const gpaFilledCount = gpaKeys6.filter(k => parseFloat(gpa[k]) > 0).length;
  const gpaAllFilled = gpaFilledCount === 6;

  // Required subjects — union across ALL selected programs (same source as "วิชาที่ต้องสอบ" on the scores page,
  // so the checklist and that widget always agree on what's actually required)
  const reqSubjsSet = new Set(Object.keys(getRequiredSubjects()));
  const reqTGATList   = [...reqSubjsSet].filter(s => s.startsWith('tgat'));
  const reqTPATList   = [...reqSubjsSet].filter(s => s.startsWith('tpat'));
  const reqALevelList = [...reqSubjsSet].filter(s => !s.startsWith('tgat') && !s.startsWith('tpat'));

  const filledOf = list => list.filter(s => parseFloat(scores[s]) > 0).length;
  const missingLbls = list => list.filter(s => !(parseFloat(scores[s]) > 0))
    .map(s => SCORE_LABEL[s] || s).join(', ');

  // TGAT: use program-required subjects; fallback all 3
  const tgatCheckList   = reqTGATList.length > 0 ? reqTGATList : ['tgat1','tgat2','tgat3'];
  const tgatCheckFilled = filledOf(tgatCheckList);
  const tgatCheckDone   = tgatCheckFilled === tgatCheckList.length;
  const tgatDetailMiss  = missingLbls(tgatCheckList);

  // TPAT: only if programs need it
  const tpatCheckFilled = filledOf(reqTPATList);
  const tpatCheckDone   = reqTPATList.length === 0 || tpatCheckFilled === reqTPATList.length;
  const tpatDetailMiss  = missingLbls(reqTPATList);

  // A-Level: use program-required subjects; fallback any > 0
  const aLevelCheckList   = reqALevelList.length > 0 ? reqALevelList : [];
  const aLevelCheckFilled = aLevelCheckList.length > 0 ? filledOf(aLevelCheckList) : aCount;
  const aLevelCheckTotal  = aLevelCheckList.length > 0 ? aLevelCheckList.length : null;
  const aLevelCheckDone   = aLevelCheckList.length > 0 ? aLevelCheckFilled === aLevelCheckList.length : aCount > 0;
  const aLevelDetailMiss  = aLevelCheckList.length > 0 ? missingLbls(aLevelCheckList) : '';

  // Checklist
  const checks = [
    { label:'กรอกข้อมูลส่วนตัว', done:!!(p.firstName), nav:'profile',
      detail: !p.firstName ? 'ยังไม่ได้กรอกชื่อ-นามสกุล' : '' },
    { label:`เลือกคณะเป้าหมาย (${prefs.length}/10)`, done:prefs.length>=10, nav:'profile',
      detail: prefs.length<10 ? `เลือกไปแล้ว ${prefs.length} คณะ ยังขาดอีก ${10-prefs.length} คณะ` : '' },
    { label:`กรอก GPAX (${gpaFilledCount}/6 เทอม)`, done:gpaAllFilled, nav:'scores',
      detail: gpaFilledCount===0 ? 'ยังไม่ได้กรอกเกรดแต่ละเทอม (ม.4–ม.6)' : `กรอกแล้ว ${gpaFilledCount}/6 เทอม ยังขาดอีก ${6-gpaFilledCount} เทอม` },
    { label:`กรอกคะแนน TGAT (${tgatCheckFilled}/${tgatCheckList.length})`, done:tgatCheckDone, nav:'scores',
      detail: tgatCheckDone ? '' : tgatCheckFilled===0 ? 'ยังไม่ได้กรอกคะแนน TGAT' : `ยังขาด: ${tgatDetailMiss}` },
    ...(reqTPATList.length > 0 ? [{
      label: `กรอกคะแนน TPAT (${tpatCheckFilled}/${reqTPATList.length})`, done:tpatCheckDone, nav:'scores',
      detail: tpatCheckDone ? '' : tpatCheckFilled===0 ? 'ยังไม่ได้กรอกคะแนน TPAT ที่จำเป็น' : `ยังขาด: ${tpatDetailMiss}`
    }] : []),
    { label: aLevelCheckTotal ? `กรอกคะแนน A-Level (${aLevelCheckFilled}/${aLevelCheckTotal})` : 'กรอกคะแนน A-Level',
      done: aLevelCheckDone, nav:'scores',
      detail: aLevelCheckDone ? '' : aLevelCheckList.length > 0 ? `ยังขาด: ${aLevelDetailMiss}` : 'ยังไม่ได้กรอกวิชา A-Level' },
    { label:'เพิ่มผลงาน Portfolio', done:totalItems>0, nav:'portfolio',
      detail: totalItems===0 ? 'ยังไม่มีผลงาน กิจกรรม หรือรางวัลในระบบ' : '' },
    { label:'ลงทะเบียน student.mytcas.com', done:false, pending:true, nav:'guide',
      detail: 'จำเป็นสำหรับการสมัครสอบและ TCAS ทุกรอบ' },
    { label:'สมัครสอบ TGAT / TPAT', done:false, pending:true, nav:'guide',
      detail: 'กำหนดสมัคร: 4–12 พ.ย. 2569' },
  ];

  const container = document.getElementById('dashboard-content');
  if (!container) return;

  container.innerHTML = `
    <!-- ① Hero -->
    <div class="db-hero">
      <div class="db-hero-greeting">${thDate}</div>
      <div class="db-hero-name">สวัสดี, ${name}! 👋</div>
      <div class="db-hero-year">TCAS70 · ปีการศึกษา 2570</div>
      <div class="db-hero-body">
        <div class="db-hero-ring-wrap">
          <svg width="88" height="88" viewBox="0 0 84 84">
            <circle cx="42" cy="42" r="36" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="7"/>
            ${s1}${s2}${s3}
            <text x="42" y="39" text-anchor="middle" font-size="15" font-weight="800" fill="white" font-family="Prompt,system-ui,sans-serif">${overallPct}%</text>
            <text x="42" y="52" text-anchor="middle" font-size="7" fill="rgba(255,255,255,0.5)" font-family="Prompt,system-ui,sans-serif">ความพร้อม</text>
          </svg>
          <div class="db-hero-legend">
            <div style="font-size:0.56rem;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:3px">สัดส่วน</div>
            <div class="db-hero-legend-row"><span class="db-hero-legend-dot" style="background:#93C5FD"></span><span>คะแนนสอบ</span><span class="db-hero-legend-pct" style="color:#93C5FD">50%</span></div>
            <div class="db-hero-legend-row"><span class="db-hero-legend-dot" style="background:#FFD166"></span><span>GPAX</span><span class="db-hero-legend-pct" style="color:#FFD166">25%</span></div>
            <div class="db-hero-legend-row"><span class="db-hero-legend-dot" style="background:#F9A8D4"></span><span>Portfolio</span><span class="db-hero-legend-pct" style="color:#F9A8D4">25%</span></div>
          </div>
        </div>
        <div class="db-hero-stats">
          <div class="db-stat-row"><span class="db-stat-dot" style="background:#FFD166"></span><span class="db-stat-label">GPAX</span><span class="db-stat-val" style="color:#FFD166">${cumGPA>0?cumGPA.toFixed(2)+'<span style="font-size:0.6rem;font-weight:400;opacity:0.6">/4.00</span>':'<span style="opacity:0.45">—</span>'}</span></div>
          <div class="db-stat-row"><span class="db-stat-dot" style="background:#93C5FD"></span><span class="db-stat-label">TGAT</span><span class="db-stat-val" style="color:#93C5FD">${tgatTotal>0?tgatTotal+'<span style="font-size:0.6rem;font-weight:400;opacity:0.6">/300</span>':'<span style="opacity:0.45">—</span>'}</span></div>
          <div class="db-stat-row"><span class="db-stat-dot" style="background:#C4B5FD"></span><span class="db-stat-label">TPAT</span><span class="db-stat-val" style="color:#C4B5FD">${tpatDisplay}</span></div>
          <div class="db-stat-row"><span class="db-stat-dot" style="background:#6EE7B7"></span><span class="db-stat-label">A-Level</span><span class="db-stat-val" style="color:#6EE7B7">${aDisplay}</span></div>
          <div class="db-stat-row"><span class="db-stat-dot" style="background:#F9A8D4"></span><span class="db-stat-label">Portfolio</span><span class="db-stat-val" style="color:#F9A8D4">${totalItems>0?totalItems+'<span style="font-size:0.6rem;font-weight:400;opacity:0.6"> รายการ</span>':'<span style="opacity:0.45">—</span>'}</span></div>
        </div>
      </div>
      <div class="db-hero-actions">
        <button class="btn-db-white" onclick="navigate('planner-hub')">🎯 แผน TCAS</button>
        <button class="btn-db-ghost" onclick="navigate('scores')">📊 กรอกคะแนน →</button>
      </div>
    </div>

    <!-- ② วันสำคัญ -->
    <div class="section-label" style="padding:0 16px;margin-top:18px">📅 วันสำคัญที่กำลังจะมาถึง <span class="section-label-more" onclick="navigate('calendar')">ดูทั้งหมด →</span></div>
    <div class="db-upcoming-scroll">
      ${upcoming.map(ev => {
        const s = new Date(ev.start+'T00:00:00');
        const ds = Math.round((s-todayMid)/86400000);
        const ongoing = ds < 0;
        const label = ongoing ? 'กำลังดำเนินการ' : ds===0 ? 'วันนี้' : `อีก ${ds} วัน`;
        const urgent = !ongoing && ds <= 7;
        const dateStr = calThDateStr(ev.start);
        return `<div class="db-event-chip" onclick="navigate('calendar')">
          <div class="db-event-countdown" style="color:${urgent?'#EF4444':ev.color}">${ev.icon} ${ongoing?'●':dateStr}</div>
          <div class="db-event-name">${ev.short||ev.title}</div>
          <div class="db-event-date">${label}</div>
        </div>`;
      }).join('')}
    </div>

    <!-- ③ เป้าหมายของฉัน -->
    <div class="section-label" style="padding:0 16px;margin-top:18px">
      🎯 เป้าหมายของฉัน
      <span style="font-weight:500;font-size:0.72rem;color:${prefs.length>=10?'var(--success)':'var(--warning)'};text-transform:none;letter-spacing:0">${prefs.length}/10${prefs.length<10?' (ไม่ครบ)':''}</span>
      <span class="section-label-more" onclick="navigate('profile')">แก้ไข →</span>
    </div>
    <div style="padding:0 16px">
      ${prefs.length===0
        ? `<div class="card"><div class="card-body"><div class="empty-state" style="padding:20px 0">
            <div class="empty-state-icon">🎓</div>
            <div class="empty-state-title">ยังไม่ได้เลือกคณะเป้าหมาย</div>
            <div class="empty-state-desc">เพื่อดูสถานะความพร้อมแต่ละรอบ</div>
            <button class="btn btn-primary btn-sm" onclick="navigate('profile')">เลือกคณะ →</button>
          </div></div></div>`
        : `${visibleGoals}
           ${extraCount>0?`<div id="db-goals-extra" style="display:none">${extraGoals}</div>`:''}
           ${extraCount>0?`<button class="btn btn-ghost btn-sm" id="db-goals-toggle" data-extra="${extraCount}"
             onclick="toggleDashGoals()" style="width:100%;margin-top:4px;border:1px dashed var(--border)">
             ดูเพิ่มเติม ${extraCount} คณะ ↓
           </button>`:''}`
      }
    </div>

    <!-- ④ ภาพรวมคะแนน -->
    <div id="db-score-section">
    ${hasTgatTpat||aLevelBars.length?`
    <div class="section-label" style="padding:0 16px;margin-top:18px">📊 ภาพรวมคะแนน <span class="section-label-more" onclick="navigate('scores')">ดูทั้งหมด →</span></div>
    <div class="db-score-grid" style="padding:0 16px">
      ${hasTgatTpat?`<div class="card" style="padding:12px 14px">
        <div style="font-size:0.7rem;font-weight:700;color:var(--text-muted);letter-spacing:0.05em;margin-bottom:6px">TGAT / TPAT</div>
        ${[...tgatBars,...tpatBars].map(renderScoreBar).join('')}
      </div>`:''}
      ${aLevelBars.length?`<div class="card" style="padding:12px 14px">
        <div style="font-size:0.7rem;font-weight:700;color:var(--text-muted);letter-spacing:0.05em;margin-bottom:6px">A-Level</div>
        ${aLevelBars.map(renderScoreBar).join('')}
      </div>`:''}
    </div>`:''}
    </div>

    <!-- ⑤ ตารางอ่านหนังสือสัปดาห์นี้ -->
    <div class="section-label" style="padding:0 16px;margin-top:18px">📖 ตารางอ่านหนังสือสัปดาห์นี้
      <span class="section-label-more" onclick="navigate('studylog')">ดูทั้งหมด →</span>
    </div>
    <div class="card" style="margin:0 16px">
      <div class="card-body" style="padding:12px 14px">
        ${studyLog.length === 0
          ? `<div class="empty-state" style="padding:10px 0">
               <div class="empty-state-icon">📚</div>
               <div class="empty-state-title" style="font-size:0.85rem">ยังไม่มีแผนการอ่านหนังสือ</div>
               <button class="btn btn-primary btn-sm" onclick="navigate('studylog')">เพิ่มตาราง →</button>
             </div>`
          : `<div class="db-study-days">
               ${wkDays.map(day => {
                 const dt = new Date(day + 'T00:00:00');
                 const dayEntries = studyLog.filter(e => e.date === day);
                 const hasDone = dayEntries.some(e => e.done);
                 const hasPlanned = dayEntries.some(e => !e.done && day >= todayStr);
                 let cls = 'db-study-day';
                 if (day === todayStr) cls += ' today';
                 else if (hasDone) cls += ' done';
                 else if (hasPlanned) cls += ' planned';
                 return `<div class="${cls}">
                   <div class="db-study-dot"></div>
                   <div class="db-study-lbl">${TH_DAYS_SHORT[dt.getDay()]}</div>
                 </div>`;
               }).join('')}
             </div>
             <div style="height:1px;background:var(--border);margin:8px 0"></div>
             <div style="margin-bottom:${tmrLogs.length?'8':'0'}px">
               <div class="db-study-row-lbl">📅 วันนี้</div>
               ${todayLogs.length
                 ? `<div class="db-study-chips">${todayLogs.map(e => {
                     const [bg,fg] = subChipColor(e.subject);
                     const blk = e.block||'morning';
                     return `<span class="db-study-chip" style="background:${bg};color:${fg}">${blkEmoji[blk]||'📖'} ${blkLbl[blk]||blk} · ${e.subject||'ไม่ระบุ'}</span>`;
                   }).join('')}</div>`
                 : `<div style="font-size:0.72rem;color:var(--text-muted)">ไม่มีแผนวันนี้</div>`}
             </div>
             ${tmrLogs.length ? `<div>
               <div class="db-study-row-lbl">🔜 พรุ่งนี้</div>
               <div class="db-study-chips">${tmrLogs.map(e => {
                 const [bg,fg] = subChipColor(e.subject);
                 const blk = e.block||'morning';
                 return `<span class="db-study-chip" style="background:${bg};color:${fg}">${blkEmoji[blk]||'📖'} ${blkLbl[blk]||blk} · ${e.subject||'ไม่ระบุ'}</span>`;
               }).join('')}</div>
             </div>` : ''}
             ${wkLogs.length ? `<div style="height:1px;background:var(--border);margin:8px 0"></div>
             <div class="db-study-week-row">
               <div style="font-size:0.68rem;font-weight:600;color:var(--text-secondary);flex-shrink:0;white-space:nowrap">สัปดาห์นี้</div>
               <div style="flex:1;height:5px;background:var(--surface-3);border-radius:3px;overflow:hidden">
                 <div style="height:100%;width:${Math.round(wkDone/wkLogs.length*100)}%;background:linear-gradient(90deg,#1A3A6B,#4A7ABF);border-radius:3px"></div>
               </div>
               <div style="font-size:0.68rem;font-weight:700;color:#1A3A6B;flex-shrink:0">${wkDone}/${wkLogs.length} เซสชัน</div>
             </div>` : ''}
           `
        }
      </div>
    </div>

    <!-- ⑥ สิ่งที่ต้องทำ -->
    <div class="section-label" style="padding:0 16px;margin-top:18px">✅ สิ่งที่ต้องทำ</div>
    <div class="card" style="margin:0 16px">
      <div class="card-body" style="padding:4px 16px">
        ${checks.map(c => {
          const bt = c.pending ? 'pending' : c.done ? 'done' : 'incomplete';
          const badgeLabel = bt==='done' ? 'ครบ' : bt==='pending' ? 'ค้าง' : 'ไม่ครบ';
          return `<div class="db-check-item" onclick="navigate('${c.nav}')" style="cursor:pointer">
          <div class="db-check-icon">${c.done?'✅':'⬜'}</div>
          <div style="flex:1;min-width:0">
            <div class="db-check-label" style="text-decoration:${c.done?'line-through':''};color:${c.done?'var(--text-muted)':'var(--text-primary)'}">${c.label}</div>
            ${!c.done&&c.detail?`<div style="font-size:0.68rem;color:var(--text-muted);margin-top:1px">${c.detail}</div>`:''}
          </div>
          <span class="db-check-badge ${bt}">${badgeLabel}</span>
        </div>`;
        }).join('')}
      </div>
    </div>

    <div style="height:24px"></div>
  `;
}

function toggleDashGoals() {
  const extra = document.getElementById('db-goals-extra');
  const btn = document.getElementById('db-goals-toggle');
  if (!extra||!btn) return;
  const isHidden = extra.style.display==='none';
  extra.style.display = isHidden?'':'none';
  const count = parseInt(btn.dataset.extra)||0;
  btn.textContent = isHidden?'ดูน้อยลง ↑':`ดูเพิ่มเติม ${count} คณะ ↓`;
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
      <div class="profile-avatar-large" onclick="editAvatar()" title="คลิกเพื่อเปลี่ยนรูป">
        <img src="${state.studentData.avatarData || 'images/student-avatar.svg'}" alt="นักเรียน" class="avatar-img">
        <div class="avatar-edit-overlay">📷</div>
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
          <div class="form-group">
            <label class="form-label">รหัสนักเรียน</label>
            <input type="text" class="form-control" id="prof-studentId" value="${p.studentId || ''}" placeholder="เช่น 12345" oninput="onProfileInput('studentId', this.value)">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title"><span class="icon">🏫</span>ข้อมูลการศึกษา</div></div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ห้องเรียน</label>
              <input type="text" class="form-control" id="prof-classRoom" value="${p.classRoom || ''}" placeholder="เช่น ม.6/1" oninput="onProfileInput('classRoom', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">เลขที่</label>
              <input type="number" class="form-control" id="prof-classNo" value="${p.classNo || ''}" placeholder="เช่น 15" min="1" max="50" oninput="onProfileInput('classNo', this.value)">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">โปรแกรม</label>
            ${buildDropdown('prof-program', [
              {value:'', label:'-- เลือกโปรแกรม --'},
              {value:'EP', label:'English Program [EP]'},
              {value:'IEP', label:'Intensive English Program [IEP]'},
              {value:'GP', label:'General Program [GP]'}
            ], p.program || '', val => onProfileInput('program', val))}
          </div>
          <div class="form-group">
            <label class="form-label">แผนการเรียน</label>
            ${buildDropdown('prof-studyPlan', [
              {value:'', label:'-- เลือกแผนการเรียน --'},
              ...['แผนการเรียนเตรียมแพทย์','แผนการเรียนเตรียมเภสัช-สหเวช','แผนการเรียนเตรียมวิศวะ','แผนการเรียนเตรียมสถาปัตย์','แผนการเรียนเตรียมวิทย์-คอม','แผนการเรียนเตรียมบริหาร-ธุรกิจ','แผนการเรียนเตรียมนิเทศ-มนุษย์','แผนการเรียนเตรียมศิลปกรรม'].map(v => ({value:v, label:v}))
            ], p.studyPlan || '', val => onProfileInput('studyPlan', val))}
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">ครูที่ปรึกษา 1</label>
              <input type="text" class="form-control" id="prof-advisor1" value="${p.advisor1 || ''}" placeholder="ชื่อครู" oninput="onProfileInput('advisor1', this.value)">
            </div>
            <div class="form-group">
              <label class="form-label">ครูที่ปรึกษา 2</label>
              <input type="text" class="form-control" id="prof-advisor2" value="${p.advisor2 || ''}" placeholder="ชื่อครู" oninput="onProfileInput('advisor2', this.value)">
            </div>
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
              <div class="pref-item-sub">${prog.faculty} · ${roundBadges}</div>
              <div class="pref-item-full">${prog.programFull}</div>
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
  state.prefUniFilter = '';
  const overlay = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalBody  = document.getElementById('modal-body');
  const saveBtn    = document.getElementById('modal-save-btn');
  const cancelBtn  = document.getElementById('modal-cancel-btn');

  modalTitle.innerHTML = `🎓 เลือกคณะที่สนใจ <span id="pref-modal-count" style="font-size:0.8rem;font-weight:400;color:var(--text-muted)">${getPreferences().length}/10</span>`;
  if (saveBtn)   saveBtn.style.display   = 'none';
  if (cancelBtn) cancelBtn.textContent   = 'ปิด';

  modalBody.innerHTML = `
    <div style="position:sticky;top:-24px;background:var(--surface);z-index:2;margin:-24px -24px 0 -24px;padding:24px 24px 12px">
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
      <div style="margin-top:10px">${uniDropdownHTML('pref-uni', state.prefUniFilter)}</div>
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
  document.querySelectorAll('#pref-cat-filter .filter-chip').forEach(btn => {
    const val = btn.textContent.trim() === 'ทั้งหมด' ? '' : btn.textContent.trim();
    btn.classList.toggle('active', val === cat);
  });
}

function setPrefUni(uniId) {
  state.prefUniFilter = uniId;
  renderPrefModalList();
}

// ---- Custom University Dropdown ----
/* ---- Generic Custom Dropdown (replaces native <select> everywhere) ---- */
const _dropdownOnChange = {};

function buildDropdown(id, options, currentVal, onChangeFn) {
  _dropdownOnChange[id] = onChangeFn || null;
  const current = options.find(o => String(o.value) === String(currentVal));
  const label = current ? (current.btnLabel ?? current.label) : (options[0]?.btnLabel ?? options[0]?.label ?? '');
  const items = options.map(o => {
    const safeBtn = o.btnLabel != null ? ` data-btn-label="${String(o.btnLabel).replace(/"/g,'&quot;')}"` : '';
    return `<div class="uni-dropdown-item${String(o.value) === String(currentVal) ? ' selected' : ''}"${safeBtn}
          onclick="pickDropdown(event,'${id}','${String(o.value).replace(/\\/g,'\\\\').replace(/'/g,'\\x27')}')">
      ${o.label}
    </div>`;
  }).join('');
  const safeVal = String(currentVal ?? options[0]?.value ?? '');
  return `<div class="uni-dropdown" id="${id}" data-value="${safeVal.replace(/"/g,'&quot;')}">
    <button type="button" class="uni-dropdown-btn" id="${id}-btn" onclick="toggleUniPicker('${id}')">${label}</button>
    <div class="uni-dropdown-list" id="${id}-list">${items}</div>
  </div>`;
}

function pickDropdown(e, id, val) {
  e.stopPropagation();
  const btnLabel = e.currentTarget.dataset.btnLabel;
  const label = (btnLabel != null && btnLabel !== '') ? btnLabel : e.currentTarget.textContent.trim();
  const btn = document.getElementById(id + '-btn');
  if (btn) btn.textContent = label;
  document.querySelectorAll(`#${id}-list .uni-dropdown-item`).forEach(el => el.classList.remove('selected'));
  e.currentTarget.classList.add('selected');
  document.getElementById(id + '-list')?.classList.remove('open');
  const container = document.getElementById(id);
  if (container) container.dataset.value = val;
  _dropdownOnChange[id]?.(val);
}

function uniDropdownHTML(id, selectedId) {
  const uniLabel = u => `${u.shortName} - ${u.name}`;
  const curLabel = selectedId
    ? (TCAS_DATA.universities.find(u => u.id === selectedId) ? uniLabel(TCAS_DATA.universities.find(u => u.id === selectedId)) : 'ทุกมหาวิทยาลัย')
    : 'ทุกมหาวิทยาลัย';
  return `<div class="uni-dropdown">
    <button class="uni-dropdown-btn" id="${id}-btn" onclick="toggleUniPicker('${id}')">${curLabel}</button>
    <div class="uni-dropdown-list" id="${id}-list">
      <div class="uni-dropdown-item ${!selectedId?'selected':''}" onclick="pickUni(event,'${id}','','ทุกมหาวิทยาลัย')">ทุกมหาวิทยาลัย</div>
      ${TCAS_DATA.universities.map(u =>
        `<div class="uni-dropdown-item ${selectedId===u.id?'selected':''}" onclick="pickUni(event,'${id}','${u.id}','${uniLabel(u).replace(/'/g,'&#39;')}')">${uniLabel(u)}</div>`
      ).join('')}
    </div>
  </div>`;
}

function toggleUniPicker(id) {
  const list = document.getElementById(id + '-list');
  if (!list) return;
  const isOpen = list.classList.contains('open');
  document.querySelectorAll('.uni-dropdown-list.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) {
    list.classList.add('open');
    setTimeout(() => list.querySelector('.selected')?.scrollIntoView({ block: 'nearest' }), 50);
  }
}

function pickUni(e, id, val, label) {
  e.stopPropagation();
  const btn = document.getElementById(id + '-btn');
  if (btn) btn.textContent = label;
  document.querySelectorAll(`#${id}-list .uni-dropdown-item`).forEach(el => el.classList.remove('selected'));
  e.currentTarget.classList.add('selected');
  document.getElementById(id + '-list')?.classList.remove('open');
  if (id === 'pref-uni') { setPrefUni(val); }
  else if (id === 'prog-uni') { state.selectedUniversity = val || 'all'; renderProgramGrid(); }
}

document.addEventListener('click', e => {
  if (!e.target.closest('.uni-dropdown')) {
    document.querySelectorAll('.uni-dropdown-list.open').forEach(el => el.classList.remove('open'));
  }
});

function renderPrefModalList() {
  const container = document.getElementById('pref-modal-list');
  if (!container) return;

  const prefs = getPreferences();
  const q   = (state.prefSearchQuery || '').toLowerCase();
  const cat = state.prefCatFilter || '';
  const uni = state.prefUniFilter || '';

  const programs = TCAS_DATA.programs.filter(p => {
    const uniObj = getUniversityById(p.universityId);
    const matchQ = !q ||
      p.program.toLowerCase().includes(q) ||
      p.faculty.toLowerCase().includes(q) ||
      p.programFull.toLowerCase().includes(q) ||
      uniObj.name.toLowerCase().includes(q) ||
      uniObj.shortName.toLowerCase().includes(q);
    const matchCat = !cat || p.category === cat;
    const matchUni = !uni || p.universityId === uni;
    return matchQ && matchCat && matchUni;
  });

  if (programs.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:24px 0"><div class="empty-state-icon">🔍</div><div>ไม่พบคณะที่ค้นหา</div></div>`;
    return;
  }

  const hasScores = Object.values(state.studentData.scores).some(s => s !== '');

  // Group by (universityId + faculty + program) — same as search page
  const groupMap = new Map();
  for (const p of programs) {
    const key = `${p.universityId}|${p.faculty}|${p.program}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(p);
  }

  container.innerHTML = Array.from(groupMap.values()).map(progs => {
    const p0 = progs[0];
    const uniObj = getUniversityById(p0.universityId);

    const rowsHTML = progs.map(p => {
      const inPref = prefs.includes(p.id);
      const rank   = prefs.indexOf(p.id) + 1;
      const full   = prefs.length >= 10 && !inPref;
      const match  = hasScores ? calculateMatchScore(p, state.studentData) : null;

      return `
        <div class="program-curriculum-row pref-pcr ${inPref ? 'pref-pcr--on' : ''} ${full ? 'pref-pcr--full' : ''}"
             onclick="${full ? '' : inPref ? `removePrefById('${p.id}')` : `addToPref('${p.id}')`}">
          <div class="pcr-main">
            <div class="pcr-name">${p.programFull}</div>
          </div>
          <div class="pcr-actions">
            ${match ? `<span class="program-row-pct" style="color:${match.score>=70?'var(--success)':match.score>=45?'var(--warning)':'var(--text-muted)'}">${match.score}%</span>` : ''}
            <div class="pref-modal-rank-badge ${inPref ? 'active' : ''}">
              ${inPref ? `<strong>${rank}</strong>` : `<span style="color:var(--text-muted);font-size:0.8rem">+</span>`}
            </div>
          </div>
        </div>`;
    }).join('');

    return `
      <div class="program-group" style="--prow-color:${uniObj.color}">
        <div class="program-group-header">
          <span class="program-row-badge" style="background:${uniObj.color}">${uniObj.shortName}</span>
          <div class="program-group-info">
            <div class="program-group-name">${p0.program}</div>
            <div class="program-group-faculty">${p0.faculty}</div>
          </div>
        </div>
        <div class="program-group-curricula">${rowsHTML}</div>
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
  const fields = ['firstName', 'lastName', 'studentId', 'classRoom', 'classNo', 'program', 'studyPlan', 'advisor1', 'advisor2', 'target'];
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

function getRequiredSubjects() {
  const prefs = state.studentData.preferences || [];
  const counts = {};
  prefs.forEach(entry => {
    // preferences may be stored as ID strings or as program objects
    const id = typeof entry === 'string' ? entry : entry.id;
    const prog = TCAS_DATA.programs.find(p => p.id === id);
    if (!prog) return;
    const criteria = TCAS_CATEGORY_CRITERIA[prog.category] || {};
    Object.keys(criteria).forEach(subj => {
      counts[subj] = (counts[subj] || 0) + 1;
    });
  });
  return counts;
}

function renderExamSummaryCard(req) {
  const keys = Object.keys(req);
  if (!keys.length) return '';

  const SHORT = {
    tgat1:'TGAT1', tgat2:'TGAT2', tgat3:'TGAT3',
    tpat1:'TPAT1', tpat2:'TPAT2', tpat3:'TPAT3', tpat4:'TPAT4', tpat5:'TPAT5',
    amath1:'คณิต 1', amath2:'คณิต 2', ascience:'วิทย์', aphy:'ฟิสิกส์',
    achem:'เคมี', abio:'ชีววิทยา', athai:'ภาษาไทย', aeng:'อังกฤษ',
    asocial:'สังคม', ahist:'ประวัติศาสตร์', afre:'ฝรั่งเศส', ager:'เยอรมัน',
    ajpn:'ญี่ปุ่น', achn:'จีน', akor:'เกาหลี'
  };

  const chip = (k, cls) =>
    `<span class="exam-chip exam-chip--${cls}">${SHORT[k] || k}<span class="exam-chip-n">${req[k]}</span></span>`;

  const tgatKeys  = ['tgat1','tgat2','tgat3'].filter(k => req[k]);
  const tpatKeys  = ['tpat1','tpat2','tpat3','tpat4','tpat5'].filter(k => req[k]);
  const aKeys     = ['amath1','amath2','ascience','aphy','achem','abio','athai','aeng','asocial','ahist','afre','ager','ajpn','achn','akor'].filter(k => req[k]);

  const group = (label, ks, cls) => !ks.length ? '' : `
    <div class="exam-chip-group">
      <div class="exam-chip-label">${label}</div>
      <div class="exam-chips">${ks.map(k => chip(k, cls)).join('')}</div>
    </div>`;

  const totalProgs = (state.studentData.preferences || []).length;

  return `
    <div class="exam-summary-card">
      <div class="exam-summary-head">
        <span>📋</span>
        <span class="exam-summary-title">วิชาที่ต้องสอบ</span>
        <span class="exam-summary-badge">${keys.length} วิชา · จาก ${totalProgs} หลักสูตรที่เลือก</span>
      </div>
      ${group('TGAT', tgatKeys, 'tgat')}
      ${group('TPAT', tpatKeys, 'tpat')}
      ${group('A-Level', aKeys, 'alevel')}
    </div>
  `;
}

function renderScores() {
  const container = document.getElementById('scores-content');
  if (!container) return;

  const req = getRequiredSubjects();

  container.innerHTML = `
    ${renderExamSummaryCard(req)}
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
      ${renderTGATSection(req)}
    </div>
    <div id="score-tab-tpat" class="tab-panel">
      ${renderTPATSection(req)}
    </div>
    <div id="score-tab-alevel" class="tab-panel">
      ${renderALevelSection(req)}
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
          <div class="form-hint" id="gpa-cumulative-hint">กรอกหรือแก้ไขได้ด้วยตนเอง</div>
        </div>
      </div>
    </div>
  `;
}

function autoCalcCumulative() {
  const gpa = state.studentData.gpa;
  const keys = ['m401', 'm402', 'm411', 'm412', 'm421', 'm422'];
  const vals = keys.map(k => parseFloat(gpa[k])).filter(v => !isNaN(v) && v >= 0 && v <= 4);
  if (vals.length === 0) return;
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  const result = (Math.round(avg * 100) / 100).toFixed(2);
  state.studentData.gpa.cumulative = result;
  const input = document.getElementById('gpa-cumulative');
  if (input) input.value = result;
  const hint = document.getElementById('gpa-cumulative-hint');
  if (hint) hint.textContent = 'คำนวณอัตโนมัติจาก GPA ที่บันทึก · แก้ไขได้ด้วยตนเอง';
  const display = document.getElementById('gpa-display-cumulative');
  if (display) display.textContent = result;
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
  if (key !== 'cumulative') autoCalcCumulative();
  debounceSave();
}

function updateGPADisplay(key, val) {
  // Legacy — keep for backward compat, redirect to onGPAInput
  onGPAInput(key, val);
}

function renderTGATSection(req = {}) {
  const s = state.studentData.scores;
  const hasReq = Object.keys(req).length > 0;
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
            const needed = req[t.key] > 0;
            const rowCls = needed ? 'score-row-highlight' : (hasReq ? 'score-row-dim' : '');
            const val = parseFloat(s[t.key]) || 0;
            const pct = val > 0 ? Math.round(val / t.max * 100) : 0;
            const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--text-muted)';
            return `
              <tr class="${rowCls}">
                <td>
                  <div style="font-weight:600;font-size:0.88rem">${t.name}${needed ? `<span class="score-need-badge">${req[t.key]} หลักสูตร</span>` : ''}</div>
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

function renderTPATSection(req = {}) {
  const s = state.studentData.scores;
  const hasReq = Object.keys(req).length > 0;
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
      <div class="info-box mb-3" style="margin:16px 16px 0">
        <span>ℹ️</span>
        <span>TPAT สอบวันที่ 30 ม.ค. – 1 ก.พ. 2570 &nbsp;·&nbsp; TPAT1 คะแนนเต็ม 300 คะแนน, TPAT2–5 คะแนนเต็ม 100 คะแนน &nbsp;·&nbsp; สอบเฉพาะวิชาที่ตรงกับสาขาที่ต้องการ ตรวจสอบกำหนดการล่าสุดที่ mytcas.com</span>
      </div>
      <table class="score-table">
        <thead><tr><th>วิชา</th><th>คะแนนที่ได้</th><th>เต็ม</th><th>%</th></tr></thead>
        <tbody>
          ${tpats.map(t => {
            const needed = req[t.key] > 0;
            const rowCls = needed ? 'score-row-highlight' : (hasReq ? 'score-row-dim' : '');
            const val = parseFloat(s[t.key]) || 0;
            const pct = val > 0 ? Math.round(val / t.max * 100) : 0;
            const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--text-muted)';
            return `
              <tr class="${rowCls}">
                <td>
                  <div style="font-weight:600;font-size:0.88rem">${t.name}${needed ? `<span class="score-need-badge">${req[t.key]} หลักสูตร</span>` : ''}</div>
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

function renderALevelSection(req = {}) {
  const s = state.studentData.scores;
  const hasReq = Object.keys(req).length > 0;
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

  const infoBox = `
    <div class="info-box mb-3">
      <span>ℹ️</span>
      <span>A-Level สอบวันที่ 13–15 มี.ค. 2570 &nbsp;·&nbsp; คะแนนแต่ละวิชาสูงสุด 100 คะแนน &nbsp;·&nbsp; สอบเฉพาะวิชาที่มหาวิทยาลัยกำหนด ตรวจสอบกำหนดการล่าสุดที่ mytcas.com</span>
    </div>`;

  return infoBox + groups.map(g => `
    <div class="card mb-3">
      <div class="score-section-title">${g.label}</div>
      <table class="score-table">
        <thead><tr><th>วิชา</th><th>คะแนนที่ได้</th><th>เต็ม</th><th>%</th></tr></thead>
        <tbody>
          ${g.subjects.map(t => {
            const needed = req[t.key] > 0;
            const rowCls = needed ? 'score-row-highlight' : (hasReq ? 'score-row-dim' : '');
            const val = parseFloat(s[t.key]) || 0;
            const pct = val > 0 ? Math.round(val / t.max * 100) : 0;
            const color = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--text-muted)';
            return `
              <tr class="${rowCls}">
                <td style="font-size:0.88rem">${t.name}${needed ? `<span class="score-need-badge">${req[t.key]} หลักสูตร</span>` : ''}</td>
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
      ${usedSubjectKeys.length ? buildDropdown('mistake-filter', [
          {value:'all', label:'ทุกวิชา'},
          ...usedSubjectKeys.map(k => {
            const info = subjects.find(s => s.key === k);
            return info ? {value:k, label:`${info.icon} ${info.name}`} : null;
          }).filter(Boolean)
        ], filter, val => onMistakeLogFilterChange(val)) : ''}
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
          ${buildDropdown('mistake-subject', [
            {value:'', label:'— เลือกวิชา —'},
            ...subjects.map(s => ({value:s.key, label:`${s.icon} ${s.name}`}))
          ], d.subject || '', val => onMistakeLogDraftInput('subject', val))}
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
  // Refresh dashboard in background so score section is current when user navigates back
  const dbContainer = document.getElementById('dashboard-content');
  if (dbContainer) renderDashboard();
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
      <button class="tab-btn" onclick="switchPortfolioTab(this,'awards')">🏆 การแข่งขัน&รางวัล</button>
      <button class="tab-btn" onclick="switchPortfolioTab(this,'activities')">🎯 กิจกรรม</button>
      <button class="tab-btn" onclick="switchPortfolioTab(this,'volunteer')">💚 อาสาสมัคร</button>
    </div>

    <div id="port-tab-camps" class="tab-panel active">
      ${renderPortfolioList('camps', '⛺', 'Open House และค่าย', 'ยังไม่มีค่าย', 'showAddCampModal')}
    </div>
    <div id="port-tab-awards" class="tab-panel">
      ${renderPortfolioList('awards', '🏆', 'รางวัลที่ได้รับ', 'ยังไม่มีรางวัล', 'showAddAwardModal')}
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

const THAI_MONTHS_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function formatDateThai(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${THAI_MONTHS_SHORT[m - 1]} ${y + 543}`;
}

function formatDateRangeThai(start, end) {
  if (!start) return '';
  if (!end || end === start) return formatDateThai(start);
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  if (sy === ey && sm === em) return `${sd}–${ed} ${THAI_MONTHS_SHORT[sm - 1]} ${sy + 543}`;
  if (sy === ey) return `${sd} ${THAI_MONTHS_SHORT[sm - 1]} – ${ed} ${THAI_MONTHS_SHORT[em - 1]} ${sy + 543}`;
  return `${formatDateThai(start)} – ${formatDateThai(end)}`;
}

// Convert Buddhist Era year-only string (e.g. "2568") to a CE ISO prefix for date input
function beYearToISOYear(beStr) {
  const n = parseInt(beStr);
  return isNaN(n) ? '' : String(n - 543);
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
          ${item.dateStart ? `<span>📅 ${formatDateRangeThai(item.dateStart, item.dateEnd)}</span>` : item.date ? `<span>📅 ${formatDateThai(item.date)}</span>` : item.year ? `<span>📅 ${item.year}</span>` : ''}
          ${levelInfo ? `<span class="badge" style="background:${levelInfo.color}20;color:${levelInfo.color}">${levelInfo.name}</span>` : ''}
          ${item.organizer ? `<span>🏛️ ${item.organizer}</span>` : ''}
          ${item.result ? `<span>🏅 ${item.result}</span>` : ''}
          ${item.hours ? `<span>⏰ ${item.hours} ชั่วโมง</span>` : ''}
          ${item.certificateData ? `<span class="cert-badge" onclick="viewCertificate('${type}', ${idx})">📄 ดูใบประกาศ</span>` : ''}
        </div>
        ${item.description ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;white-space:pre-wrap">${item.description}</div>` : ''}
        ${item.certificateName ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:4px">📄 ${item.certificateName}</div>` : ''}
        ${item.specialAward ? `<div class="camp-special-award">🏅 ${item.specialAward}</div>` : ''}
        ${item.awardData ? `
          <div class="cert-thumb-row" onclick="viewAwardPhoto('${type}', ${idx})">
            <img src="${item.awardData}" alt="รางวัล" class="cert-thumb-img">
          </div>
        ` : ''}
        ${item.certificateData ? `
          <div class="cert-thumb-row" onclick="viewAwardCert('${type}', ${idx})">
            <img src="${item.certificateData}" alt="ใบประกาศ" class="cert-thumb-img">
          </div>
        ` : ''}
        ${(item.activityPhotos || []).some(p => p) ? `
          <div class="camp-photos-row">
            ${(item.activityPhotos || []).map((p, pi) => p ? `<img src="${p}" class="camp-photo-thumb" onclick="viewCampPhoto('${type}', ${idx}, ${pi})">` : '').join('')}
          </div>
        ` : ''}
        ${(item.atmospherePhotos || []).some(p => p) ? `
          <div class="camp-photos-row">
            ${(item.atmospherePhotos || []).map((p, pi) => p ? `<img src="${p}" class="camp-photo-thumb" onclick="viewAwardAtmosphere('${type}', ${idx}, ${pi})">` : '').join('')}
          </div>
        ` : ''}
      </div>
      <div class="portfolio-item-actions">
        <button class="btn btn-ghost btn-sm" onclick="editPortfolioItem('${type}', ${idx})" title="แก้ไข">✏️</button>
        <button class="btn btn-ghost btn-sm" onclick="removePortfolioItem('${type}', ${idx})" title="ลบ">🗑️</button>
      </div>
    </div>
  `;
}

function editPortfolioItem(type, idx) {
  if (type === 'camps') showAddCampModal(idx);
  else if (type === 'awards') showAddAwardModal(idx);
  else if (type === 'activities') showAddActivityModal(idx);
  else if (type === 'volunteer') showAddVolunteerModal(idx);
}

function viewCertificate(type, idx) {
  const item = (state.studentData.portfolio[type] || [])[idx];
  if (!item?.certificateData) return;
  const win = window.open('', '_blank');
  if (!win) { showToast('⚠️ กรุณาอนุญาต Pop-up window'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>ใบประกาศ — ${item.name || ''}</title><style>body{margin:0;background:#111;display:flex;justify-content:center;padding:16px}img{max-width:100%;height:auto;border-radius:4px}</style></head><body><img src="${item.certificateData}" alt="ใบประกาศ"></body></html>`);
  win.document.close();
}

function handleCertUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    window._certData = e.target.result;
    const preview = document.getElementById('cert-preview');
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" alt="ใบประกาศ" class="cert-preview-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById('cert-upload-hint');
    if (hint) hint.textContent = '✅ อัพโหลดแล้ว · คลิกเพื่อเปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function handleAwardUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    window._awardData = e.target.result;
    const preview = document.getElementById('award-preview');
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" alt="รางวัล" class="cert-preview-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById('award-upload-hint');
    if (hint) hint.textContent = '✅ อัพโหลดแล้ว · คลิกเพื่อเปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function handleAwardCertUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    window._awardCertData = e.target.result;
    const preview = document.getElementById('award-cert-preview');
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" alt="ใบประกาศ" class="cert-preview-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById('award-cert-hint');
    if (hint) hint.textContent = '✅ อัพโหลดแล้ว · คลิกเพื่อเปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function handleAwardAtmosphereUpload(input, slotIdx) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    if (!window._awardPhotos) window._awardPhotos = [null, null, null];
    window._awardPhotos[slotIdx] = e.target.result;
    const preview = document.getElementById(`award-atm-preview-${slotIdx}`);
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" class="photo-slot-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById(`award-atm-hint-${slotIdx}`);
    if (hint) hint.textContent = '✅ เปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function viewAwardCert(type, idx) {
  const item = (state.studentData.portfolio[type] || [])[idx];
  if (!item?.certificateData) return;
  const win = window.open('', '_blank');
  if (!win) { showToast('⚠️ กรุณาอนุญาต Pop-up window'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>ใบประกาศ — ${item.name || ''}</title><style>body{margin:0;background:#111;display:flex;justify-content:center;padding:16px}img{max-width:100%;height:auto;border-radius:4px}</style></head><body><img src="${item.certificateData}" alt="ใบประกาศ"></body></html>`);
  win.document.close();
}

function viewAwardAtmosphere(type, idx, photoIdx) {
  const item = (state.studentData.portfolio[type] || [])[idx];
  const photo = item?.atmospherePhotos?.[photoIdx];
  if (!photo) return;
  const win = window.open('', '_blank');
  if (!win) { showToast('⚠️ กรุณาอนุญาต Pop-up window'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>บรรยากาศรับรางวัล — ${item.name || ''}</title><style>body{margin:0;background:#111;display:flex;justify-content:center;padding:16px}img{max-width:100%;height:auto;border-radius:4px}</style></head><body><img src="${photo}"></body></html>`);
  win.document.close();
}

function handleCampPhotoUpload(input, slotIdx) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    if (!window._campPhotos) window._campPhotos = [null, null, null];
    window._campPhotos[slotIdx] = e.target.result;
    const preview = document.getElementById(`camp-photo-preview-${slotIdx}`);
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" class="photo-slot-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById(`camp-photo-hint-${slotIdx}`);
    if (hint) hint.textContent = '✅ เปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function viewAwardPhoto(type, idx) {
  const item = (state.studentData.portfolio[type] || [])[idx];
  if (!item?.awardData) return;
  const win = window.open('', '_blank');
  if (!win) { showToast('⚠️ กรุณาอนุญาต Pop-up'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>รางวัล — ${item.name || ''}</title><style>body{margin:0;background:#111;display:flex;justify-content:center;padding:16px}img{max-width:100%;height:auto;border-radius:4px}</style></head><body><img src="${item.awardData}"></body></html>`);
  win.document.close();
}

function viewCampPhoto(type, idx, photoIdx) {
  const item = (state.studentData.portfolio[type] || [])[idx];
  const photo = item?.activityPhotos?.[photoIdx];
  if (!photo) return;
  const win = window.open('', '_blank');
  if (!win) { showToast('⚠️ กรุณาอนุญาต Pop-up'); return; }
  win.document.write(`<!DOCTYPE html><html><head><title>ภาพกิจกรรม</title><style>body{margin:0;background:#111;display:flex;justify-content:center;padding:16px}img{max-width:100%;height:auto;border-radius:4px}</style></head><body><img src="${photo}"></body></html>`);
  win.document.close();
}

function removePortfolioItem(type, idx) {
  if (!confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) return;
  state.studentData.portfolio[type].splice(idx, 1);
  saveData();
  renderPortfolio();
  showToast('🗑️ ลบรายการแล้ว');
}

// ---- Add Item Modals ----
function showAddCampModal(editIdx = null) {
  const existing = editIdx !== null ? (state.studentData.portfolio.camps[editIdx] || {}) : {};
  window._certData   = existing.certificateData || null;
  window._awardData  = existing.awardData || null;
  window._campPhotos = [...(existing.activityPhotos || [null, null, null])];

  const campTypeOptions = TCAS_DATA.campTypes.map(c => ({value: c.icon, label: `${c.icon} ${c.name}`}));

  const photoSlots = [0, 1, 2].map(i => {
    const hasPhoto = !!window._campPhotos[i];
    return `
      <div class="photo-upload-slot">
        <div id="camp-photo-preview-${i}" class="photo-slot-preview" style="${hasPhoto ? '' : 'display:none'}">
          ${hasPhoto ? `<img src="${window._campPhotos[i]}" class="photo-slot-img">` : ''}
        </div>
        <div class="photo-upload-zone-sm" onclick="document.getElementById('camp-photo-input-${i}').click()">
          <span>📸</span>
          <span id="camp-photo-hint-${i}">${hasPhoto ? '✅ เปลี่ยน' : 'อัพโหลด'}</span>
        </div>
        <input type="file" id="camp-photo-input-${i}" accept="image/*" style="display:none" onchange="handleCampPhotoUpload(this,${i})">
      </div>`;
  }).join('');

  showGenericAddModal(editIdx !== null ? '✏️ แก้ไขค่าย' : '⛺ เพิ่มค่าย', `
    <div class="form-group">
      <label class="form-label">ชื่อค่าย <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" value="${existing.name || ''}" placeholder="เช่น ค่ายวิทยาศาสตร์ สสวท.">
    </div>
    <div class="form-group">
      <label class="form-label">ประเภทค่าย</label>
      ${buildDropdown('add-icon', campTypeOptions, existing.icon || campTypeOptions[0]?.value || '')}
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">วันที่เริ่มต้น</label>
        <input type="date" class="form-control" id="add-date-start" value="${existing.dateStart || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">วันที่สิ้นสุด <span style="font-weight:400;color:var(--text-muted)">(ถ้ามี)</span></label>
        <input type="date" class="form-control" id="add-date-end" value="${existing.dateEnd || ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">หน่วยงานผู้จัด</label>
      <input type="text" class="form-control" id="add-organizer" value="${existing.organizer || ''}" placeholder="เช่น สสวท., มหาวิทยาลัยจุฬา">
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียดเพิ่มเติม</label>
      <textarea class="form-control" id="add-description" placeholder="กิจกรรมที่ทำ ทักษะที่ได้รับ...">${existing.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">🏅 รางวัลพิเศษที่ได้รับ</label>
      <input type="text" class="form-control" id="add-special-award" value="${existing.specialAward || ''}" placeholder="เช่น รางวัล Best Project, เหรียญทอง">
      <div id="award-preview" class="cert-preview" style="${existing.awardData ? '' : 'display:none'}">
        ${existing.awardData ? `<img src="${existing.awardData}" alt="รางวัล" class="cert-preview-img">` : ''}
      </div>
      <div class="cert-upload-zone" style="margin-top:8px" onclick="document.getElementById('award-file-input').click()">
        <span>📎</span>
        <span id="award-upload-hint">${existing.awardData ? '✅ มีไฟล์อยู่แล้ว · คลิกเพื่อเปลี่ยน' : 'อัพโหลดภาพรางวัล (ถ้ามี, ไม่เกิน 5MB)'}</span>
      </div>
      <input type="file" id="award-file-input" accept="image/*" style="display:none" onchange="handleAwardUpload(this)">
    </div>
    <div class="form-group">
      <label class="form-label">📸 ภาพกิจกรรม (สูงสุด 3 ภาพ)</label>
      <div class="photo-upload-grid">${photoSlots}</div>
    </div>
    <div class="form-group">
      <label class="form-label">📄 ใบประกาศนียบัตร / เอกสาร</label>
      <div id="cert-preview" class="cert-preview" style="${existing.certificateData ? '' : 'display:none'}">
        ${existing.certificateData ? `<img src="${existing.certificateData}" alt="ใบประกาศ" class="cert-preview-img">` : ''}
      </div>
      <div class="cert-upload-zone" onclick="document.getElementById('cert-file-input').click()">
        <span>📎</span>
        <span id="cert-upload-hint">${existing.certificateData ? '✅ มีไฟล์อยู่แล้ว · คลิกเพื่อเปลี่ยน' : 'คลิกเพื่ออัพโหลดภาพใบประกาศ (ไม่เกิน 5MB)'}</span>
      </div>
      <input type="file" id="cert-file-input" accept="image/*" style="display:none" onchange="handleCertUpload(this)">
    </div>
  `, () => savePortfolioItem('camps', {
    name: getVal('add-name'),
    icon: getVal('add-icon'),
    dateStart: getVal('add-date-start'),
    dateEnd: getVal('add-date-end'),
    organizer: getVal('add-organizer'),
    description: getVal('add-description'),
    specialAward: getVal('add-special-award'),
    awardData: window._awardData,
    activityPhotos: [...(window._campPhotos || [null, null, null])],
    certificateData: window._certData
  }, editIdx));
}

function showAddAwardModal(editIdx = null) {
  const existing = editIdx !== null ? (state.studentData.portfolio.awards[editIdx] || {}) : {};
  window._awardCertData = existing.certificateData || null;
  window._awardPhotos   = [...(existing.atmospherePhotos || [null, null, null])];

  const atmSlots = [0, 1, 2].map(i => {
    const hasPhoto = !!window._awardPhotos[i];
    return `
      <div class="photo-upload-slot">
        <div id="award-atm-preview-${i}" class="photo-slot-preview" style="${hasPhoto ? '' : 'display:none'}">
          ${hasPhoto ? `<img src="${window._awardPhotos[i]}" class="photo-slot-img">` : ''}
        </div>
        <div class="photo-upload-zone-sm" onclick="document.getElementById('award-atm-input-${i}').click()">
          <span>📸</span>
          <span id="award-atm-hint-${i}">${hasPhoto ? '✅ เปลี่ยน' : 'อัพโหลด'}</span>
        </div>
        <input type="file" id="award-atm-input-${i}" accept="image/*" style="display:none" onchange="handleAwardAtmosphereUpload(this,${i})">
      </div>`;
  }).join('');

  showGenericAddModal(editIdx !== null ? '✏️ แก้ไขรางวัล' : '🏆 เพิ่มรางวัล', `
    <div class="form-group">
      <label class="form-label">ชื่อรางวัล <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" value="${existing.name || ''}" placeholder="เช่น รางวัลชนะเลิศการประกวดโครงงานวิทยาศาสตร์">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">ระดับรางวัล <span class="required">*</span></label>
        ${buildDropdown('add-level', TCAS_DATA.awardLevels.map(l => ({value:l.id, label:l.name})), existing.level || TCAS_DATA.awardLevels[0]?.id || '')}
      </div>
      <div class="form-group">
        <label class="form-label">ลำดับที่ได้รับ</label>
        <input type="text" class="form-control" id="add-result" value="${existing.result || ''}" placeholder="เช่น รางวัลที่ 1, เหรียญทอง">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">วันเดือนปีที่ได้รับ</label>
        <input type="date" class="form-control" id="add-date" value="${existing.date || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">หน่วยงานผู้มอบ</label>
        <input type="text" class="form-control" id="add-organizer" value="${existing.organizer || ''}" placeholder="เช่น สสวท.">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียด</label>
      <textarea class="form-control" id="add-description" placeholder="รายละเอียดรางวัล...">${existing.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">📄 ใบประกาศนียบัตร</label>
      <div id="award-cert-preview" class="cert-preview" style="${existing.certificateData ? '' : 'display:none'}">
        ${existing.certificateData ? `<img src="${existing.certificateData}" alt="ใบประกาศ" class="cert-preview-img">` : ''}
      </div>
      <div class="cert-upload-zone" onclick="document.getElementById('award-cert-input').click()">
        <span>📎</span>
        <span id="award-cert-hint">${existing.certificateData ? '✅ มีไฟล์อยู่แล้ว · คลิกเพื่อเปลี่ยน' : 'คลิกเพื่ออัพโหลดภาพใบประกาศ (ไม่เกิน 5MB)'}</span>
      </div>
      <input type="file" id="award-cert-input" accept="image/*" style="display:none" onchange="handleAwardCertUpload(this)">
    </div>
    <div class="form-group">
      <label class="form-label">📸 บรรยากาศการรับรางวัล (สูงสุด 3 ภาพ)</label>
      <div class="photo-upload-grid">${atmSlots}</div>
    </div>
  `, () => savePortfolioItem('awards', {
    name: getVal('add-name'),
    icon: '🏆',
    level: getVal('add-level'),
    result: getVal('add-result'),
    date: getVal('add-date'),
    organizer: getVal('add-organizer'),
    description: getVal('add-description'),
    certificateData: window._awardCertData,
    atmospherePhotos: [...(window._awardPhotos || [null, null, null])]
  }, editIdx));
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
        ${buildDropdown('add-level', TCAS_DATA.awardLevels.map(l => ({value:l.id, label:l.name})), TCAS_DATA.awardLevels[0]?.id || '')}
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

function handleActCertUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    window._actCertData = e.target.result;
    const preview = document.getElementById('act-cert-preview');
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" alt="ใบประกาศ" class="cert-preview-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById('act-cert-hint');
    if (hint) hint.textContent = '✅ มีไฟล์อยู่แล้ว · คลิกเพื่อเปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function handleActPhotoUpload(input, slotIdx) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    if (!window._actPhotos) window._actPhotos = [null, null, null];
    window._actPhotos[slotIdx] = e.target.result;
    const preview = document.getElementById(`act-photo-preview-${slotIdx}`);
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" class="photo-slot-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById(`act-photo-hint-${slotIdx}`);
    if (hint) hint.textContent = '✅ เปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function handleVolCertUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    window._volCertData = e.target.result;
    const preview = document.getElementById('vol-cert-preview');
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" alt="ใบประกาศ" class="cert-preview-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById('vol-cert-hint');
    if (hint) hint.textContent = '✅ มีไฟล์อยู่แล้ว · คลิกเพื่อเปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function handleVolPhotoUpload(input, slotIdx) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ ไฟล์ต้องมีขนาดไม่เกิน 5MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    if (!window._volPhotos) window._volPhotos = [null, null, null];
    window._volPhotos[slotIdx] = e.target.result;
    const preview = document.getElementById(`vol-photo-preview-${slotIdx}`);
    if (preview) { preview.innerHTML = `<img src="${e.target.result}" class="photo-slot-img">`; preview.style.display = 'block'; }
    const hint = document.getElementById(`vol-photo-hint-${slotIdx}`);
    if (hint) hint.textContent = '✅ เปลี่ยน';
  };
  reader.readAsDataURL(file);
}

function showAddActivityModal(editIdx = null) {
  const existing = editIdx !== null ? (state.studentData.portfolio.activities[editIdx] || {}) : {};
  window._actCertData = existing.certificateData || null;
  window._actPhotos   = [...(existing.activityPhotos || [null, null, null])];

  const photoSlots = [0, 1, 2].map(i => {
    const hasPhoto = !!window._actPhotos[i];
    return `
      <div class="photo-upload-slot">
        <div id="act-photo-preview-${i}" class="photo-slot-preview" style="${hasPhoto ? '' : 'display:none'}">
          ${hasPhoto ? `<img src="${window._actPhotos[i]}" class="photo-slot-img">` : ''}
        </div>
        <div class="photo-upload-zone-sm" onclick="document.getElementById('act-photo-input-${i}').click()">
          <span>📸</span>
          <span id="act-photo-hint-${i}">${hasPhoto ? '✅ เปลี่ยน' : 'อัพโหลด'}</span>
        </div>
        <input type="file" id="act-photo-input-${i}" accept="image/*" style="display:none" onchange="handleActPhotoUpload(this,${i})">
      </div>`;
  }).join('');

  showGenericAddModal(editIdx !== null ? '✏️ แก้ไขกิจกรรม' : '🎯 เพิ่มกิจกรรม', `
    <div class="form-group">
      <label class="form-label">ชื่อกิจกรรม <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" value="${existing.name || ''}" placeholder="เช่น ประธานสภานักเรียน, กิจกรรมชุมนุม">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">วันเดือนปีที่เริ่ม</label>
        <input type="date" class="form-control" id="add-date-start" value="${existing.dateStart || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">วันเดือนปีที่สิ้นสุด</label>
        <input type="date" class="form-control" id="add-date-end" value="${existing.dateEnd || ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">บทบาท</label>
      <input type="text" class="form-control" id="add-result" value="${existing.result || ''}" placeholder="เช่น ประธาน, สมาชิก">
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียด</label>
      <textarea class="form-control" id="add-description" placeholder="รายละเอียดกิจกรรม...">${existing.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">ใบประกาศนียบัตรหรือรางวัลที่ได้รับ</label>
      <input type="text" class="form-control" id="add-cert-name" value="${existing.certificateName || ''}" placeholder="เช่น ใบประกาศนียบัตรเข้าร่วมกิจกรรม">
    </div>
    <div class="form-group">
      <label class="form-label">📄 อัพโหลดภาพใบประกาศนียบัตรหรือรางวัล</label>
      <div id="act-cert-preview" class="cert-preview" style="${existing.certificateData ? '' : 'display:none'}">
        ${existing.certificateData ? `<img src="${existing.certificateData}" alt="ใบประกาศ" class="cert-preview-img">` : ''}
      </div>
      <div class="cert-upload-zone" onclick="document.getElementById('act-cert-input').click()">
        <span>📎</span>
        <span id="act-cert-hint">${existing.certificateData ? '✅ มีไฟล์อยู่แล้ว · คลิกเพื่อเปลี่ยน' : 'คลิกเพื่ออัพโหลดภาพใบประกาศ (ไม่เกิน 5MB)'}</span>
      </div>
      <input type="file" id="act-cert-input" accept="image/*" style="display:none" onchange="handleActCertUpload(this)">
    </div>
    <div class="form-group">
      <label class="form-label">📸 ภาพกิจกรรม (สูงสุด 3 ภาพ)</label>
      <div class="photo-upload-grid">${photoSlots}</div>
    </div>
  `, () => savePortfolioItem('activities', {
    name: getVal('add-name'),
    icon: '🎯',
    dateStart: getVal('add-date-start'),
    dateEnd: getVal('add-date-end'),
    result: getVal('add-result'),
    description: getVal('add-description'),
    certificateName: getVal('add-cert-name'),
    certificateData: window._actCertData,
    activityPhotos: [...(window._actPhotos || [null, null, null])]
  }, editIdx));
}

function showAddVolunteerModal(editIdx = null) {
  const existing = editIdx !== null ? (state.studentData.portfolio.volunteer[editIdx] || {}) : {};
  window._volCertData = existing.certificateData || null;
  window._volPhotos   = [...(existing.activityPhotos || [null, null, null])];

  const photoSlots = [0, 1, 2].map(i => {
    const hasPhoto = !!window._volPhotos[i];
    return `
      <div class="photo-upload-slot">
        <div id="vol-photo-preview-${i}" class="photo-slot-preview" style="${hasPhoto ? '' : 'display:none'}">
          ${hasPhoto ? `<img src="${window._volPhotos[i]}" class="photo-slot-img">` : ''}
        </div>
        <div class="photo-upload-zone-sm" onclick="document.getElementById('vol-photo-input-${i}').click()">
          <span>📸</span>
          <span id="vol-photo-hint-${i}">${hasPhoto ? '✅ เปลี่ยน' : 'อัพโหลด'}</span>
        </div>
        <input type="file" id="vol-photo-input-${i}" accept="image/*" style="display:none" onchange="handleVolPhotoUpload(this,${i})">
      </div>`;
  }).join('');

  showGenericAddModal(editIdx !== null ? '✏️ แก้ไขงานอาสาสมัคร' : '💚 เพิ่มงานอาสาสมัคร', `
    <div class="form-group">
      <label class="form-label">ชื่อกิจกรรม <span class="required">*</span></label>
      <input type="text" class="form-control" id="add-name" value="${existing.name || ''}" placeholder="เช่น ค่ายอาสาพัฒนาโรงเรียน">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">วันเดือนปีที่เริ่ม</label>
        <input type="date" class="form-control" id="add-date-start" value="${existing.dateStart || ''}">
      </div>
      <div class="form-group">
        <label class="form-label">วันเดือนปีที่สิ้นสุด</label>
        <input type="date" class="form-control" id="add-date-end" value="${existing.dateEnd || ''}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">จำนวนชั่วโมง</label>
        <input type="number" class="form-control" id="add-hours" value="${existing.hours || ''}" placeholder="เช่น 48">
      </div>
      <div class="form-group">
        <label class="form-label">หน่วยงาน/องค์กร</label>
        <input type="text" class="form-control" id="add-organizer" value="${existing.organizer || ''}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">รายละเอียด</label>
      <textarea class="form-control" id="add-description" placeholder="รายละเอียดกิจกรรม...">${existing.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">ใบประกาศนียบัตรที่ได้รับ</label>
      <input type="text" class="form-control" id="add-cert-name" value="${existing.certificateName || ''}" placeholder="เช่น ใบประกาศนียบัตรจิตอาสา">
    </div>
    <div class="form-group">
      <label class="form-label">📄 อัพโหลดภาพใบประกาศนียบัตร</label>
      <div id="vol-cert-preview" class="cert-preview" style="${existing.certificateData ? '' : 'display:none'}">
        ${existing.certificateData ? `<img src="${existing.certificateData}" alt="ใบประกาศ" class="cert-preview-img">` : ''}
      </div>
      <div class="cert-upload-zone" onclick="document.getElementById('vol-cert-input').click()">
        <span>📎</span>
        <span id="vol-cert-hint">${existing.certificateData ? '✅ มีไฟล์อยู่แล้ว · คลิกเพื่อเปลี่ยน' : 'คลิกเพื่ออัพโหลดภาพใบประกาศ (ไม่เกิน 5MB)'}</span>
      </div>
      <input type="file" id="vol-cert-input" accept="image/*" style="display:none" onchange="handleVolCertUpload(this)">
    </div>
    <div class="form-group">
      <label class="form-label">📸 ภาพกิจกรรม (สูงสุด 3 ภาพ)</label>
      <div class="photo-upload-grid">${photoSlots}</div>
    </div>
  `, () => savePortfolioItem('volunteer', {
    name: getVal('add-name'),
    icon: '💚',
    dateStart: getVal('add-date-start'),
    dateEnd: getVal('add-date-end'),
    hours: getVal('add-hours'),
    organizer: getVal('add-organizer'),
    description: getVal('add-description'),
    certificateName: getVal('add-cert-name'),
    certificateData: window._volCertData,
    activityPhotos: [...(window._volPhotos || [null, null, null])]
  }, editIdx));
}

function savePortfolioItem(type, item, editIdx = null) {
  if (!item.name && !item.title) { showToast('⚠️ กรุณากรอกชื่อ'); return false; }
  if (!state.studentData.portfolio[type]) state.studentData.portfolio[type] = [];
  if (editIdx !== null) {
    state.studentData.portfolio[type][editIdx] = item;
  } else {
    state.studentData.portfolio[type].push(item);
  }
  window._certData      = null;
  window._awardData     = null;
  window._campPhotos    = [null, null, null];
  window._awardCertData = null;
  window._awardPhotos   = [null, null, null];
  window._actCertData   = null;
  window._actPhotos     = [null, null, null];
  window._volCertData   = null;
  window._volPhotos     = [null, null, null];
  saveData();
  closeModal();
  renderPortfolio();
  const tabMap = { camps: 'camps', awards: 'awards', competitions: 'competitions', activities: 'activities', volunteer: 'volunteer' };
  const btn = document.querySelector(`[onclick*="switchPortfolioTab(this,'${tabMap[type]}')"]`);
  if (btn) switchPortfolioTab(btn, tabMap[type]);
  showToast(editIdx !== null ? '✅ แก้ไขข้อมูลแล้ว' : '✅ เพิ่มข้อมูลแล้ว');
  return true;
}

function getVal(id) {
  const el = document.getElementById(id);
  if (!el) return '';
  if (el.classList.contains('uni-dropdown')) return el.dataset.value ?? '';
  return el.value != null ? el.value.trim() : '';
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
        <div style="min-width:200px">${uniDropdownHTML('prog-uni', state.selectedUniversity === 'all' ? '' : state.selectedUniversity)}</div>
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
      p.programFull.toLowerCase().includes(q) ||
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

  // Group by (universityId + faculty + program name)
  const groupMap = new Map();
  for (const p of filtered) {
    const key = `${p.universityId}|${p.faculty}|${p.program}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(p);
  }

  grid.innerHTML = Array.from(groupMap.values()).map(progs => {
    const p0 = progs[0];
    const uniObj = getUniversityById(p0.universityId);

    const curriculaHTML = progs.map(p => {
      const inWishlist = state.wishlist.includes(p.id);
      const match = calculateMatchScore(p, state.studentData);
      return `
        <div class="program-curriculum-row" onclick="showProgramDetail('${p.id}')">
          <div class="pcr-main">
            <div class="pcr-name">${p.programFull}</div>
            <div class="pcr-sub">
              <span>${p.seats} ที่นั่ง</span>
              ${p.rounds.map(r => `<span class="round-pill" style="--rc:${TCAS_DATA.rounds[r-1].color}">${ROUND_SHORT[r-1]}</span>`).join('')}
            </div>
          </div>
          <div class="pcr-actions">
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

    return `
      <div class="program-group" style="--prow-color:${uniObj.color}">
        <div class="program-group-header">
          <span class="program-row-badge" style="background:${uniObj.color}">${uniObj.shortName}</span>
          <div class="program-group-info">
            <div class="program-group-name">${p0.program}</div>
            <div class="program-group-faculty">${p0.faculty}</div>
          </div>
        </div>
        <div class="program-group-curricula">
          ${curriculaHTML}
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
  // Update custom dropdown button label
  const dropBtn = document.getElementById('prog-uni-btn');
  if (dropBtn) {
    const u = TCAS_DATA.universities.find(u => u.id === uniId);
    dropBtn.textContent = u ? `${u.shortName} - ${u.name}` : 'ทุกมหาวิทยาลัย';
  }
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
        return `
          <div class="program-row" style="--prow-color:${uni.color}" onclick="showProgramDetail('${p.id}')">
            <div class="program-row-main">
              <div class="program-row-title">
                <span class="program-row-badge" style="background:${uni.color}">${uni.shortName}</span>
                <div>
                  <div class="program-row-name">${p.program}</div>
                  <div class="program-row-full">${p.programFull}</div>
                </div>
              </div>
              <div class="program-row-sub">${p.faculty} · ${p.seats} ที่นั่ง TCAS70</div>
            </div>
            <div class="program-row-rounds">
              ${p.rounds.map(r => `<span class="round-pill" style="--rc:${TCAS_DATA.rounds[r-1].color}">${ROUND_SHORT[r-1]}</span>`).join('')}
            </div>
            <div class="program-row-info">
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
// ============================================================
// PROGRAM DETAIL SHEET
// ============================================================

const PD_ROUND_COLORS = ['#F0A500','#E05A3A','#29AFB7','#00709A'];
const PD_ROUND_NAMES  = ['Portfolio','Quota','Admission','Direct Admission'];

function autoContrast(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return (0.299*r + 0.587*g + 0.114*b) > 0.5 ? '#1A1A2E' : '#ffffff';
}

function pdCriteriaRows(criteria, color) {
  const total = Object.values(criteria).reduce((a,b)=>a+b,0);
  if (!total) return '';
  return Object.entries(criteria).map(([key, w]) => {
    const info = getTestInfo(key);
    const name = info ? info.name : key.toUpperCase();
    const pct  = Math.round(w / total * 100);
    return `<div class="pd-cr-row">
      <span class="pd-cr-name">${name}</span>
      <div class="pd-cr-bar-wrap"><div class="pd-cr-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <span class="pd-cr-pct">${w}%</span>
    </div>`;
  }).join('');
}

function pdProjectRow(proj, color, isTcas69 = false) {
  const oldCriteria = typeof proj.criteria === 'object' ? proj.criteria : {};
  const criteriaText = typeof proj.criteria === 'string' ? proj.criteria : (proj.criteriaText || '');
  const reqs = (proj.requirements || []).map(r =>
    `<li class="pd-req-item"><span class="pd-req-dot ok"></span>${r}</li>`).join('');

  let criteriaHTML = '';
  if (Object.keys(oldCriteria).length) {
    criteriaHTML = `<div class="pd-sl">เกณฑ์การพิจารณา</div>${pdCriteriaRows(oldCriteria, color)}`;
  } else if (criteriaText) {
    const formatted = criteriaText
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
    criteriaHTML = `<div class="pd-sl">เกณฑ์การพิจารณา</div>
      <div class="pd-criteria-text">${formatted}</div>`;
  }

  const linkHTML = proj.link
    ? `<a href="${proj.link}" target="_blank" rel="noopener" class="pd-ext-link">🔗 ข้อมูลเพิ่มเติมจากมหาวิทยาลัย</a>`
    : '';
  const deadlineHTML = proj.deadline
    ? `<div class="pd-deadline">📅 ปิดรับ: ${proj.deadline}</div>`
    : '';

  return `<div class="pd-proj-row" onclick="toggleDetailProject(this)">
    <div class="pd-proj-top">
      <span class="pd-proj-name">${proj.name}</span>
      <span class="pd-proj-seats">${isTcas69 || proj.seats === 0 ? 'รอ TCAS70 ประกาศ' : proj.seats + ' คน'}</span>
      <span class="pd-proj-arr">▾</span>
    </div>
    <div class="pd-proj-detail">
      ${reqs ? `<div class="pd-sl">คุณสมบัติ</div><ul class="pd-req-list">${reqs}</ul>` : ''}
      ${criteriaHTML}
      ${deadlineHTML}
      ${linkHTML}
    </div>
  </div>`;
}

function pdRoundPanel(program, r) {
  const src      = (program.roundSources  || {})[r] || 'tcas69';
  const isOpen   = (program.rounds        || []).includes(r);
  const perRound = (program.seatsPerRound || {})[r];
  const projects = (program.roundProjects || {})[r] || [];
  const criteria = program.criteria?.[`round${r}`] || {};
  const color    = PD_ROUND_COLORS[r-1];
  const rname    = PD_ROUND_NAMES[r-1];

  const labelRow = `<div class="pd-panel-label"><span class="pd-panel-dot" style="background:${color}"></span>รอบ ${r} · ${rname}</div>`;

  if (!isOpen) {
    const badge = src === 'tcas70'
      ? '<span class="pd-badge pd-badge-tcas70">✓ TCAS70</span>'
      : '<span class="pd-badge pd-badge-none">TCAS70</span>';
    return `${labelRow}<div class="pd-card">
      <div class="pd-card-head" style="border-bottom:3px solid ${color}">
        <div class="pd-round-num" style="background:${color}">${r}</div>
        <div class="pd-card-htxt"><div class="pd-card-htype">${rname}</div></div>
        ${badge}
      </div>
      <div class="pd-state-box"><div class="pd-state-icon">⊘</div><div class="pd-state-txt">ไม่เปิดรับสมัครในรอบนี้</div></div>
    </div>`;
  }

  const seats = perRound !== undefined ? perRound
    : (program.rounds.length > 0 ? Math.round(program.seats / program.rounds.length) : program.seats);
  const isEstimated = perRound === undefined;

  let body = '';
  if (src === 'tcas70') {
    if (projects.length > 0) {
      body = projects.map(p => pdProjectRow(p, color)).join('');
    } else if (Object.keys(criteria).length) {
      body = `<div style="padding:10px 13px">${pdCriteriaRows(criteria, color)}</div>`;
    } else {
      body = `<div class="pd-state-box"><div class="pd-state-txt" style="font-size:0.75rem">ดูรายละเอียดเพิ่มเติมจากมหาวิทยาลัยโดยตรง</div></div>`;
    }
  } else {
    let criteriaHTML = '';
    if (projects.length > 0) {
      criteriaHTML = projects.map(p => pdProjectRow(p, color, true)).join('');
    } else if (Object.keys(criteria).length) {
      criteriaHTML = `<div class="pd-proj-row" onclick="toggleDetailProject(this)" style="margin-top:4px">
          <div class="pd-proj-top">
            <span class="pd-proj-name">เกณฑ์รอบ ${r} (อ้างอิง TCAS69)</span>
            <span class="pd-proj-seats" style="color:var(--text-muted)">~${seats} คน</span>
            <span class="pd-proj-arr">▾</span>
          </div>
          <div class="pd-proj-detail">${pdCriteriaRows(criteria, color)}</div>
        </div>`;
    } else {
      criteriaHTML = `<div class="pd-state-box"><div class="pd-state-txt" style="font-size:0.75rem;color:var(--text-muted)">ยังไม่มีข้อมูลเกณฑ์ · ตรวจสอบจากมหาวิทยาลัยโดยตรง</div></div>`;
    }
    body = `<div class="pd-warn"><span style="flex-shrink:0;margin-top:1px">⚠</span><span>ข้อมูลด้านล่างอ้างอิงจาก TCAS69 · จะอัปเดตเมื่อ TCAS70 ประกาศ</span></div>${criteriaHTML}`;
  }

  const badge = src === 'tcas70'
    ? '<span class="pd-badge pd-badge-tcas70">✓ TCAS70</span>'
    : '<span class="pd-badge pd-badge-tcas69">⏱ TCAS69</span>';

  return `${labelRow}<div class="pd-card">
    <div class="pd-card-head" style="border-bottom:3px solid ${color}">
      <div class="pd-round-num" style="background:${color}">${r}</div>
      <div class="pd-card-htxt">
        <div class="pd-card-htype">${rname}</div>
        <div class="pd-card-htotal">${src === 'tcas69' ? 'รอประกาศจำนวนรับ TCAS70' : `รับ ${seats} คน${isEstimated ? ' (ประมาณการ)' : ''}`}</div>
      </div>
      ${badge}
    </div>
    ${body}
  </div>`;
}

function pdPillHTML(program, r, selected) {
  const src    = (program.roundSources  || {})[r] || 'tcas69';
  const isOpen = (program.rounds        || []).includes(r);
  const perR   = (program.seatsPerRound || {})[r];

  let num, sta;
  if (!isOpen) {
    num = '—'; sta = 'ไม่เปิดรับสมัคร';
  } else if (src === 'tcas70') {
    num = perR !== undefined ? perR : program.seats;
    sta = 'ประกาศ TCAS70 แล้ว';
  } else {
    num = '?';
    sta = 'อ้างอิง TCAS69';
  }

  return `<div class="pd-pill${selected?' sel':''}" data-r="${r}" onclick="switchDetailRound(${r})">
    <div class="pd-pill-lbl">รอบ ${r}</div>
    <div class="pd-pill-num">${num}</div>
    <div class="pd-pill-sta">${sta}</div>
  </div>`;
}

function showProgramDetail(programId) {
  const program = TCAS_DATA.programs.find(p => p.id === programId);
  if (!program) return;
  const uni = getUniversityById(program.universityId);

  // Topbar
  const txtColor = autoContrast(uni.color || '#1A3A6B');
  document.getElementById('prog-detail-uni').innerHTML = `
    <div class="pd-uni-badge" style="background:${uni.color};color:${txtColor}">${uni.shortName.slice(0,3)}</div>
    <span class="pd-uni-name">${uni.name}</span>`;

  // Summary: total seats (already = sum of seatsPerRound after data update) + source label
  const hasTcas70 = [1,2,3,4].some(r => (program.roundSources||{})[r] === 'tcas70');
  const totalSeats = program.seats;
  const srcLabel   = hasTcas70 ? 'mytcas.com TCAS70' : 'อ้างอิง TCAS69';

  // Language type tag from last character of program ID
  const typeCode = program.id.slice(-1);
  const TYPE_MAP = { A: ['ภาษาไทย ปกติ', '#1D4ED8', '#EFF6FF', '#BFDBFE'],
                     E: ['นานาชาติ',       '#15803D', '#F0FDF4', '#BBF7D0'],
                     P: ['ภาษาไทย พิเศษ', '#7C3AED', '#F5F3FF', '#DDD6FE'] };
  const typeInfo = TYPE_MAP[typeCode];
  const typeTagHTML = typeInfo
    ? `<span class="pd-type-tag" style="background:${typeInfo[2]};border-color:${typeInfo[3]};color:${typeInfo[1]}">${typeInfo[0]}</span>`
    : '';

  // Match score badge
  const match = calculateMatchScore(program, state.studentData);
  const hasScores = Object.values(state.studentData.scores).some(s => s !== '');
  const matchHTML = hasScores
    ? `<div class="match-score-circle ${match.score>=70?'match-high':match.score>=45?'match-medium':'match-low'}" style="margin-left:auto;flex-shrink:0">
        <span>${Math.min(match.score,100)}%</span>
        <span class="match-score-label">เหมาะสม</span>
      </div>` : '';

  const scroll = document.getElementById('prog-detail-scroll');
  scroll.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:4px">
      <div style="flex:1;min-width:0">
        <div class="pd-bc">${program.faculty} · ${program.program}</div>
        <div class="pd-name">${program.programFull}</div>
        ${typeTagHTML}
        <div class="pd-sub">${program.duration} ปี · ${program.category}</div>
      </div>
      ${matchHTML}
    </div>

    <div class="pd-summary-card">
      <div class="pd-sc-left">
        <div class="pd-sc-lbl">จำนวนรับ TCAS70</div>
        <div class="pd-sc-num">${totalSeats}</div>
        <div class="pd-sc-unit">ที่นั่ง</div>
        <div class="pd-sc-src">${srcLabel}</div>
      </div>
      <div class="pd-sc-div"></div>
      <div class="pd-sc-right">
        ${[1,2,3,4].map(r => pdPillHTML(program, r, r===1)).join('')}
      </div>
    </div>

    <div id="pd-panels">
      ${[1,2,3,4].map(r => `<div class="pd-panel${r===1?' on':''}" id="pd-p${r}">${pdRoundPanel(program,r)}</div>`).join('')}
    </div>
  `;

  scroll.scrollTop = 0;
  document.getElementById('prog-detail-sheet').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProgramDetail() {
  document.getElementById('prog-detail-sheet').classList.remove('open');
  document.body.style.overflow = '';
}

function switchDetailRound(n) {
  [1,2,3,4].forEach(i => {
    document.querySelector(`.pd-pill[data-r="${i}"]`)?.classList.toggle('sel', i===n);
    document.getElementById('pd-p'+i)?.classList.toggle('on', i===n);
  });
}

function toggleDetailProject(row) {
  const d = row.querySelector('.pd-proj-detail');
  const a = row.querySelector('.pd-proj-arr');
  const open = d.style.display === 'block';
  d.style.display = open ? 'none' : 'block';
  if (a) a.classList.toggle('open', !open);
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

function buildProgramOption(pid, rank) {
  const p = TCAS_DATA.programs.find(x => x.id === pid);
  if (!p) return null;
  const uni = getUniversityById(p.universityId);
  const rankStr = rank >= 0 ? `อันดับ ${rank + 1} — ` : '';
  const btnLabel = `${rankStr}${p.program} (${uni.shortName})`;
  const hasFull = p.programFull && p.programFull !== p.program;
  const label = `<div style="line-height:1.6">
    <div style="font-weight:600;font-size:0.85rem">${rankStr}${p.program}</div>
    <div style="font-size:0.75rem;opacity:0.72">${p.faculty} · ${uni.shortName}</div>
    ${hasFull ? `<div style="font-size:0.71rem;opacity:0.6">${p.programFull}</div>` : ''}
  </div>`;
  return {value: pid, label, btnLabel};
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
  const buildRow = (pid, i) => {
    const prog = TCAS_DATA.programs.find(p => p.id === pid);
    if (!prog) return '';
    const uni = getUniversityById(prog.universityId);
    const hasFull = prog.programFull && prog.programFull !== prog.program;
    return `
      <div class="pref-item">
        <div class="pref-rank" style="background:${i < 3 ? ['#F0A500','#94A3B8','#CD7F32'][i] : 'var(--surface-2)'};color:${i < 3 ? 'white' : 'var(--text-muted)'}">${i + 1}</div>
        <div class="pref-item-body">
          <div class="pref-item-header">
            <span class="pref-uni-tag" style="background:${uni.color}20;color:${uni.color}">${uni.shortName}</span>
            <span class="pref-prog-name">${prog.program}</span>
          </div>
          <div class="pref-item-sub">${prog.faculty}</div>
          ${hasFull ? `<div class="pref-item-full">${prog.programFull}</div>` : ''}
        </div>
      </div>`;
  };
  const visibleRows = prefs.slice(0, 3).map((pid, i) => buildRow(pid, i)).join('');
  const extraCount = prefs.length - 3;
  const extraRows = extraCount > 0 ? prefs.slice(3).map((pid, i) => buildRow(pid, i + 3)).join('') : '';
  return `
  <div class="card">
    <div class="card-header">
      <div class="card-title">🎯 เป้าหมายของฉัน <span style="font-weight:400;font-size:0.78rem;color:var(--text-muted)">(${prefs.length} คณะ)</span></div>
      <button class="btn btn-outline btn-sm" onclick="navigate('profile')">แก้ไข</button>
    </div>
    <div class="card-body">
      <div class="pref-list">
        ${visibleRows}
        ${extraCount > 0 ? `<div id="planner-targets-extra" style="display:none">${extraRows}</div>` : ''}
      </div>
      ${extraCount > 0 ? `
        <button class="btn btn-ghost btn-sm" id="planner-targets-toggle" data-extra="${extraCount}"
          onclick="togglePlannerTargets()"
          style="width:100%;margin-top:8px;border:1px dashed var(--border)">
          ดูเพิ่มเติม ${extraCount} คณะ ↓
        </button>` : ''}
    </div>
  </div>`;
}

function togglePlannerTargets() {
  const extra = document.getElementById('planner-targets-extra');
  const btn = document.getElementById('planner-targets-toggle');
  if (!extra || !btn) return;
  const isHidden = extra.style.display === 'none';
  extra.style.display = isHidden ? '' : 'none';
  const count = parseInt(btn.dataset.extra) || 0;
  btn.textContent = isHidden ? 'ดูน้อยลง ↑' : `ดูเพิ่มเติม ${count} คณะ ↓`;
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

  const portfolioOptions = eligible.map(pid => buildProgramOption(pid, prefs.indexOf(pid))).filter(Boolean);

  const gpa = parseFloat(state.studentData.gpa.cumulative) || 0;
  const minGPA = parseFloat(program.minGPA) || 0;
  const gpaPass = gpa > 0 && (minGPA === 0 || gpa >= minGPA);

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
        ${buildDropdown('planner-portfolio-target', portfolioOptions, selectedId, val => onPlannerPortfolioTargetChange(val))}
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);margin:10px 0">เทียบกับอันดับ ${selectedRank + 1}: <strong>${program.program}</strong> (${uni.shortName})</div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">
        ${gpa > 0 ? `<span class="badge ${gpaPass ? 'badge-success' : 'badge-gray'}">GPAX ${gpa.toFixed(2)} ${minGPA > 0 ? (gpaPass ? `✓ (ต้องการ ${minGPA.toFixed(2)})` : `— เกณฑ์ ${minGPA.toFixed(2)}`) : ''}</span>` : ''}
        <span class="badge ${portfolioSystemLabel.cls}">${portfolioSystemLabel.text}</span>
      </div>

      ${(program.specialReq || []).length ? `
        <div class="criteria-section-title mb-2">ข้อกำหนดพิเศษของคณะนี้</div>
        <ul class="plain-list">${(program.specialReq || []).map(r => `<li>📌 ${r}</li>`).join('')}</ul>
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

  const uni = getUniversityById(program.universityId);
  const studentScores = state.studentData.scores || {};
  const ws = calculateWeightedScore(program, studentScores);

  // Historical cutoff (most recent year)
  const hist = TCAS_HISTORICAL_STATS[program.id];
  let cutoff = null;
  if (hist) {
    const lastYear = Object.keys(hist).sort().pop();
    cutoff = hist[lastYear]?.min ?? null;
  }
  const targetScore = cutoff ?? 70; // fallback target if no history

  // Requirement for missing subjects
  let req = null;
  if (!ws.noData && !ws.complete && ws.missingSubjs?.length > 0) {
    req = calcPartialRequirement(ws, targetScore);
  }
  // When no scores at all, needed pct = targetScore (weights sum to 100)
  const allMissingReqPct = ws.noData ? targetScore : null;

  const scoreGapOptions = prefs.map((pid, i) => buildProgramOption(pid, i)).filter(Boolean);

  // Score summary header
  let scoreSummary = '';
  if (ws.complete) {
    const sc = ws.score;
    const tier = cutoff != null ? getAssessmentTier(sc, cutoff) : null;
    const diff = cutoff != null ? sc - cutoff : null;
    const headColor = tier?.color || 'var(--primary)';
    scoreSummary = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="font-size:1.8rem;font-weight:800;color:${headColor}">${sc.toFixed(1)}%</div>
        <div>
          <div style="font-size:0.82rem;color:var(--text-muted)">คะแนนรวมถ่วงน้ำหนัก (รอบ Admission)</div>
          ${tier ? `<div style="font-size:0.75rem;font-weight:700;color:${tier.color}">${tier.label}</div>` : ''}
          ${diff != null ? `<div style="font-size:0.75rem;color:${diff >= 0 ? '#059669' : '#DC2626'}">${diff >= 0 ? '+' : ''}${diff.toFixed(1)}% จากเกณฑ์ TCAS69</div>` : ''}
        </div>
      </div>`;
  } else if (!ws.noData) {
    const sc = ws.partialKnown;
    scoreSummary = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
        <div style="font-size:1.8rem;font-weight:800;color:#D97706">${sc.toFixed(1)}%*</div>
        <div>
          <div style="font-size:0.82rem;color:var(--text-muted)">คะแนนบางส่วน (ยังกรอกไม่ครบ)</div>
          ${cutoff != null ? `<div style="font-size:0.75rem;color:var(--text-muted)">เกณฑ์ผ่าน TCAS69: ${cutoff.toFixed(1)}%</div>` : ''}
          ${req?.alreadySufficient ? `<div style="font-size:0.75rem;font-weight:700;color:#059669">✓ คะแนนที่มีแล้วพอถึงเกณฑ์</div>` : ''}
        </div>
      </div>`;
  }

  // Subject breakdown grid
  const criteria = TCAS_CATEGORY_CRITERIA[program.category] || {};
  const entries = Object.entries(criteria);
  let breakdownHtml = '';
  if (entries.length > 0) {
    const rows = entries.map(([subj, weight]) => {
      const max = SCORE_MAX[subj] || 100;
      const raw = parseFloat(studentScores[subj]);
      const hasScore = !isNaN(raw) && raw > 0;
      const contrib = hasScore ? ((raw / max) * weight).toFixed(1) : null;

      let col3;
      if (hasScore) {
        col3 = `<div class="score-bd-contrib" style="color:#6366F1">+${contrib}%</div>`;
      } else if (req && !req.alreadySufficient) {
        const neededRaw = req.possible ? Math.ceil((req.requiredPct / 100) * max) : null;
        col3 = `<div class="score-bd-contrib" style="color:${req.possible ? 'var(--primary)' : '#DC2626'};font-size:0.68rem;white-space:nowrap">
          ${req.possible ? `ต้องได้ ≥ ${neededRaw}` : 'คะแนนไม่พอแม้เต็ม'}
        </div>`;
      } else if (allMissingReqPct != null) {
        const neededRaw = Math.ceil((allMissingReqPct / 100) * max);
        col3 = `<div class="score-bd-contrib" style="color:var(--primary);font-size:0.68rem;white-space:nowrap">ต้องได้ ≥ ${neededRaw}</div>`;
      } else {
        col3 = `<div class="score-bd-contrib" style="color:var(--text-muted)">—</div>`;
      }

      return `<div class="score-bd-item">
        <div class="score-bd-name">${SCORE_LABEL[subj] || subj} <span style="color:var(--text-muted)">${weight}%</span></div>
        <div class="score-bd-val ${hasScore ? '' : 'no-score'}">${hasScore ? `${raw}/${max}` : '—'}</div>
        ${col3}
      </div>`;
    }).join('');

    const colHeader = ws.noData || (req && !req.alreadySufficient)
      ? `<div style="color:var(--primary);font-weight:700">คะแนนขั้นต่ำ</div>`
      : ws.complete
        ? `<div style="color:#6366F1;font-weight:700">สมทบ</div>`
        : `<div style="color:var(--primary);font-weight:700">คะแนนขั้นต่ำ</div>`;

    breakdownHtml = `
      <div style="font-size:0.72rem;font-weight:600;color:var(--text-muted);margin:8px 0 2px">สัดส่วนวิชาที่ใช้ในรอบ Admission <span style="font-weight:400">(อ้างอิงเกณฑ์ทั่วไป TCAS69)</span></div>
      <div class="score-breakdown-grid" style="font-size:0.72rem">
        <div style="color:var(--text-muted);font-weight:600">วิชา</div>
        <div style="color:var(--text-muted);font-weight:600;text-align:right">คะแนนฉัน</div>
        ${colHeader}
        ${rows}
      </div>`;
  }

  return `
  <div class="card mt-3">
    <div class="card-header">
      <div class="card-title">📊 คะแนนที่ต้องเตรียม</div>
    </div>
    <div class="card-body">
      <div class="form-group">
        <label class="form-label">ดูข้อมูลของคณะ</label>
        ${buildDropdown('planner-score-target', scoreGapOptions, selectedId, val => onPlannerTargetChange(val))}
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);margin:10px 0">อันดับ ${selectedIdx + 1}: <strong>${program.program}</strong> · ${uni.shortName}</div>
      <div class="warning-box mb-2" style="font-size:0.78rem">
        <span>⚠️</span>
        <div>เกณฑ์รอบ Admission 2570 ยังไม่มีประกาศอย่างเป็นทางการ อ้างอิงจากเกณฑ์ทั่วไป TCAS69 จะอัปเดตเมื่อมหาวิทยาลัยเผยแพร่ (คาดใกล้ พ.ค. 2570)</div>
      </div>
      ${scoreSummary}
      ${breakdownHtml}
      <button class="btn btn-outline btn-sm mt-3" onclick="navigate('scores')">ไปกรอกคะแนน →</button>
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
        const roundDropOpts = [{value:'', label:'+ เพิ่มคณะที่จะยื่นในรอบนี้'}, ...available.map(pid => buildProgramOption(pid, prefs.indexOf(pid))).filter(Boolean)];
        return `
        <div class="form-group">
          <label class="form-label" style="color:${r.color}">${r.label}</label>
          ${chips ? `<div class="planner-round-chips">${chips}</div>` : ''}
          ${available.length
            ? buildDropdown(`planner-round-${r.key}`, roundDropOpts, '', val => { if(val) onPlannerRoundAdd(r.key, val); })
            : `<div style="font-size:0.78rem;color:var(--text-muted)">เลือกครบทุกคณะเป้าหมายแล้ว</div>`}
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
          ${buildDropdown('studylog-edit-block', STUDY_TIME_BLOCKS.map(b => ({value:b.key, label:b.label})), e.block || 'morning')}
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

// ---- ROUND ALL: ภาพรวม — แสดงหลักสูตรที่นักเรียนเลือกไว้ พร้อมประเมินทุกรอบ ----
function renderRoundAll(area) {
  const prefs = getPreferences();
  const sd    = state.studentData;
  const gpa   = parseFloat(sd.gpa.cumulative) || 0;
  const studentScores = sd.scores || {};
  const port  = sd.portfolio || {};

  // Compute portfolio strength score (0-3)
  const portKeys = ['camps','activities','awards','competitions','volunteer'];
  const portCats = portKeys.filter(k => (port[k]||[]).length > 0).length;
  const portScore = portCats >= 4 ? 3 : portCats >= 2 ? 2 : portCats >= 1 ? 1 : 0;

  if (prefs.length === 0) {
    area.innerHTML = `
      <div class="empty-state" style="padding:40px 0">
        <div class="empty-state-icon">🎓</div>
        <div class="empty-state-title">ยังไม่ได้เลือกหลักสูตรที่สนใจ</div>
        <div class="empty-state-desc">ไปที่หน้า <strong>โปรไฟล์ → 10 อันดับ</strong> เพื่อเลือกหลักสูตรที่ต้องการประเมินก่อนนะครับ</div>
        <button class="btn btn-primary btn-sm" style="margin-top:16px" onclick="navigate('profile')">ไปหน้าโปรไฟล์</button>
      </div>`;
    return;
  }

  const programs = prefs.map(id => TCAS_DATA.programs.find(p => p.id === id)).filter(Boolean);

  const ROUND_META = {
    1: { label:'รอบ 1 Portfolio', icon:'📁' },
    2: { label:'รอบ 2 โควตา',    icon:'🏷️' },
    3: { label:'รอบ 3 Admission', icon:'🎯' },
    4: { label:'รอบ 4 รับตรง',  icon:'🏛️' },
  };

  function quickAssess(prog, rnum) {
    const minGPA = parseFloat(prog.minGPA) || 0;
    if (rnum === 1) {
      const gpaOk = gpa >= minGPA || minGPA === 0;
      if (!gpaOk)           return { color:'#EF4444', label:'GPA ไม่ถึงเกณฑ์' };
      if (portScore >= 3)   return { color:'#10B981', label:'โอกาสสูง' };
      if (portScore >= 1)   return { color:'#F59E0B', label:'พอมีโอกาส' };
      return                       { color:'#EF4444', label:'ต้องเพิ่มพอร์ต' };
    }
    if (rnum === 2) {
      const gap = gpa - minGPA;
      if (minGPA === 0 || gap >= 0.25) return { color:'#10B981', label:'GPA ผ่านเกณฑ์' };
      if (gap >= 0)                    return { color:'#F59E0B', label:'GPA ผ่าน (ชายขอบ)' };
      return                                  { color:'#EF4444', label:`GPA ขาด ${Math.abs(gap).toFixed(2)}` };
    }
    if (rnum === 3) {
      const ws = calculateWeightedScore(prog, studentScores);
      if (ws.noData) return { color:'#94A3B8', label:'ยังไม่กรอกคะแนน' };
      const hist = TCAS_HISTORICAL_STATS[prog.id];
      if (!hist)    return { color:'#94A3B8', label:'ยังไม่มีข้อมูล' };
      const lastY  = Object.keys(hist).sort().pop();
      const tier   = getAssessmentTier(ws.score, hist[lastY].min);
      return { color: tier.color, label: tier.label };
    }
    return { color:'#6B7280', label:'รับตรงอิสระ' };
  }

  const ALL_ROUNDS = [1, 2, 3, 4];

  const cardsHtml = programs.map((prog, i) => {
    const uni      = getUniversityById(prog.universityId);
    const progRounds = new Set(prog.rounds || []);

    const roundPills = ALL_ROUNDS.map(rnum => {
      const meta = ROUND_META[rnum];
      if (!progRounds.has(rnum)) {
        return `<div class="prog-round-pill" style="border-color:var(--border);background:var(--surface-2);opacity:0.55">
          <span class="prog-round-label">${meta.icon} ${meta.label}</span>
          <span class="prog-round-chance" style="color:var(--text-muted)">ไม่เปิดรับสมัครรอบนี้</span>
        </div>`;
      }
      const assess = quickAssess(prog, rnum);
      return `<div class="prog-round-pill" style="border-color:${assess.color}40;background:${assess.color}0D">
        <span class="prog-round-label">${meta.icon} ${meta.label}</span>
        <span class="prog-round-chance" style="color:${assess.color}">${assess.label}</span>
      </div>`;
    }).join('');

    // Show: faculty / program / programFull (if different from program)
    const subLine = prog.programFull && prog.programFull !== prog.program
      ? `<div class="prog-overview-sub">${prog.faculty}</div>
         <div class="prog-overview-full">${prog.programFull}</div>`
      : `<div class="prog-overview-sub">${prog.faculty}</div>`;

    return `
      <div class="prog-overview-card">
        <div class="prog-overview-rank">${i + 1}</div>
        <div class="prog-overview-body">
          <div class="prog-overview-header">
            <span class="pref-uni-tag" style="background:${uni.color};color:#fff;font-size:0.65rem;padding:1px 7px;border-radius:4px;font-weight:700;white-space:nowrap;flex-shrink:0">${uni.shortName}</span>
            <div style="min-width:0;flex:1">
              <div class="prog-overview-name">${prog.program}</div>
              ${subLine}
            </div>
          </div>
          <div class="prog-overview-rounds">${roundPills}</div>
          <button class="prog-overview-detail-btn" style="align-self:flex-end;margin-top:6px" onclick="showProgramDetail('${prog.id}')">รายละเอียด →</button>
        </div>
      </div>`;
  }).join('');

  area.innerHTML = `
    <div class="round-assess-header" style="--rhc:var(--primary)">
      <div class="round-assess-title">📊 ภาพรวม ${programs.length} หลักสูตรที่เลือก</div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">
        ประเมินทุกรอบที่แต่ละหลักสูตรเปิดรับ · กดแต่ละรอบด้านบนเพื่อดูรายละเอียด
      </div>
    </div>
    <div class="prog-overview-list">${cardsHtml}</div>`;
}

// ---- ROUND 1: Portfolio ----
function renderRound1(area) {
  const sd   = state.studentData;
  const port = sd.portfolio || {};
  const gpa  = parseFloat(sd.gpa.cumulative) || 0;
  const prefs = getPreferences();

  const portItems = [
    { key:'camps',        label:'ค่าย / โครงการพิเศษ',    count:(port.camps||[]).length,        icon:'⛺' },
    { key:'activities',   label:'กิจกรรมนอกหลักสูตร',      count:(port.activities||[]).length,   icon:'🎪' },
    { key:'awards',       label:'รางวัล / เกียรติบัตร',     count:(port.awards||[]).length,       icon:'🏆' },
    { key:'competitions', label:'การแข่งขัน / โอลิมปิก',   count:(port.competitions||[]).length, icon:'🥇' },
    { key:'volunteer',    label:'จิตอาสา / บำเพ็ญประโยชน์', count:(port.volunteer||[]).length,   icon:'🤝' },
  ];
  const totalCategories = portItems.filter(x => x.count > 0).length;
  const totalItems      = portItems.reduce((s, x) => s + x.count, 0);
  const portLevel = totalCategories >= 4 ? { label:'พอร์ตแข็งแกร่ง ✅', color:'#10B981', score:3 }
    : totalCategories >= 2               ? { label:'พอร์ตพอใช้ ⚠️',     color:'#F59E0B', score:2 }
    : totalCategories >= 1               ? { label:'พอร์ตน้อย ⚠️',       color:'#F97316', score:1 }
    :                                      { label:'ยังไม่มีพอร์ต ❌',   color:'#EF4444', score:0 };

  const r1Set    = new Set(TCAS_DATA.programs.filter(p => p.rounds.includes(1)).map(p => p.id));
  const selected = prefs.filter(id => r1Set.has(id))
                        .map(id => TCAS_DATA.programs.find(p => p.id === id)).filter(Boolean);

  _r1ShownIds = selected.map(p => p.id);
  _r1SelectedCtx = selected;
  _r1Area = area;
  _r1PortScore = portLevel.score;

  const selectedHtml = selected.length > 0
    ? `<div class="round-assess-list">
         ${selected.map(p => renderRoundAssessCard(p, 'round1', gpa, portLevel.score, prefs)).join('')}
       </div>` : '';

  const emptyHtml = selected.length === 0
    ? `<div class="empty-state" style="padding:32px 0">
         <div class="empty-state-icon">📁</div>
         <div class="empty-state-title">หลักสูตรที่คุณเลือกไม่มีรอบ 1</div>
         <div class="empty-state-desc">หลักสูตรที่เลือกใน <strong>โปรไฟล์ → 10 อันดับ</strong> ไม่มีการเปิดรับรอบ 1 Portfolio<br>ลองดูรอบอื่น หรือเพิ่มหลักสูตรที่เปิดรอบ 1</div>
       </div>` : '';

  area.innerHTML = `
    <div class="round-assess-header" style="--rhc:#6366F1">
      <div class="round-assess-title">📁 ประเมินรอบ 1 Portfolio</div>
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
      ${totalItems === 0 ? `<div class="port-add-hint"><button class="btn btn-outline btn-sm" onclick="navigate('portfolio')">✏️ เพิ่มข้อมูลพอร์ตโฟลิโอ</button></div>` : ''}
      ${selected.length > 0 ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:8px">
        หลักสูตรที่เลือก <strong>${selected.length}</strong> หลักสูตรที่เปิดรับรอบ 1
      </div>` : ''}
    </div>

    ${emptyHtml}${selectedHtml}`;

  setupRoundBackToTop(area);
}

function expandR1Extra() {
  const gpa    = parseFloat(state.studentData.gpa.cumulative) || 0;
  const extras = getGpaRoundFallbacks(_r1ShownIds, _r1SelectedCtx, gpa, 1, 9999);
  const extraSection = document.getElementById('r1-extra-section');
  const expandWrap   = document.getElementById('r1-expand-wrap');
  if (!extraSection) return;
  if (extras.length === 0) {
    extraSection.innerHTML = `<div style="text-align:center;padding:24px 0;color:var(--text-muted);font-size:0.84rem">ไม่พบหลักสูตรแนะนำเพิ่มเติมที่ตรงเกณฑ์ GPAX ในขณะนี้</div>`;
  } else {
    const prefs = getPreferences();
    extraSection.innerHTML = `
      <div class="pref-section-label" style="margin-top:16px;border-left:3px solid var(--info);padding-left:8px;background:none">
        🔍 หลักสูตรแนะนำเพิ่มเติม
        <span style="font-weight:400;color:var(--text-muted);font-size:0.8rem">(${extras.length} หลักสูตร · GPAX ผ่านเกณฑ์ทั้งหมด)</span>
      </div>
      <div class="round-assess-list" style="margin-top:8px">
        ${extras.map(p => renderRoundAssessCard(p, 'round1', state.studentData.gpa.cumulative || 0, _r1PortScore, prefs)).join('')}
      </div>`;
  }
  expandWrap && (expandWrap.style.display = 'none');
}

// ---- ROUND 2: Quota ----
function renderRound2(area) {
  const sd  = state.studentData;
  const gpa = parseFloat(sd.gpa.cumulative) || 0;
  const prefs = getPreferences();

  const r2Set    = new Set(TCAS_DATA.programs.filter(p => p.rounds.includes(2)).map(p => p.id));
  const selected = prefs.filter(id => r2Set.has(id))
                        .map(id => TCAS_DATA.programs.find(p => p.id === id)).filter(Boolean);

  _r2ShownIds = selected.map(p => p.id);
  _r2SelectedCtx = selected;
  _r2Area = area;

  const passed = selected.filter(p => gpa >= (parseFloat(p.minGPA)||0)).length;
  const failed  = selected.length - passed;

  const selectedHtml = selected.length > 0
    ? `<div class="round-assess-list">
         ${selected.map(p => renderRoundAssessCard(p, 'round2', gpa, 0, prefs)).join('')}
       </div>` : '';

  const emptyHtml = selected.length === 0
    ? `<div class="empty-state" style="padding:32px 0">
         <div class="empty-state-icon">🏷️</div>
         <div class="empty-state-title">หลักสูตรที่คุณเลือกไม่มีรอบ 2</div>
         <div class="empty-state-desc">หลักสูตรที่เลือกใน <strong>โปรไฟล์ → 10 อันดับ</strong> ไม่มีการเปิดรับรอบ 2 โควตา<br>ลองดูรอบอื่น หรือเพิ่มหลักสูตรที่เปิดรอบ 2</div>
       </div>` : '';

  area.innerHTML = `
    <div class="round-assess-header" style="--rhc:#10B981">
      <div class="round-assess-title">🏷️ ประเมินรอบ 2 โควตา</div>
      ${selected.length > 0 ? `<div style="display:flex;gap:16px;margin-top:8px;flex-wrap:wrap">
        ${passed > 0 ? `<div class="quota-summary-chip quota-pass">✅ GPA ผ่านเกณฑ์ ${passed} สาขา</div>` : ''}
        ${failed > 0 ? `<div class="quota-summary-chip quota-fail">❌ GPA ต่ำกว่าเกณฑ์ ${failed} สาขา</div>` : ''}
      </div>` : ''}
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:6px">
        ${selected.length > 0 ? `หลักสูตรที่เลือก <strong>${selected.length}</strong> หลักสูตรที่เปิดรับรอบ 2` : ''}
        ${selected.length > 0 ? `· ⚠️ อาจมีเงื่อนไขโควตาพื้นที่เพิ่มเติม — ตรวจสอบจากมหาวิทยาลัยด้วย` : ''}
      </div>
    </div>

    ${emptyHtml}${selectedHtml}`;

  setupRoundBackToTop(area);
}

function expandR2Extra() {
  const gpa    = parseFloat(state.studentData.gpa.cumulative) || 0;
  const extras = getGpaRoundFallbacks(_r2ShownIds, _r2SelectedCtx, gpa, 2, 9999);
  const extraSection = document.getElementById('r2-extra-section');
  const expandWrap   = document.getElementById('r2-expand-wrap');
  if (!extraSection) return;
  if (extras.length === 0) {
    extraSection.innerHTML = `<div style="text-align:center;padding:24px 0;color:var(--text-muted);font-size:0.84rem">ไม่พบหลักสูตรแนะนำเพิ่มเติมที่ตรงเกณฑ์ GPAX ในขณะนี้</div>`;
  } else {
    const prefs = getPreferences();
    extraSection.innerHTML = `
      <div class="pref-section-label" style="margin-top:16px;border-left:3px solid var(--info);padding-left:8px;background:none">
        🔍 หลักสูตรแนะนำเพิ่มเติม
        <span style="font-weight:400;color:var(--text-muted);font-size:0.8rem">(${extras.length} หลักสูตร · GPAX ผ่านเกณฑ์ทั้งหมด)</span>
      </div>
      <div class="round-assess-list" style="margin-top:8px">
        ${extras.map(p => renderRoundAssessCard(p, 'round2', gpa, 0, prefs)).join('')}
      </div>`;
  }
  expandWrap && (expandWrap.style.display = 'none');
}

// Shared state for all round expand + back-to-top
let _roundObserver = null;
let _r1ShownIds = [], _r1SelectedCtx = [], _r1Area = null, _r1PortScore = 0;
let _r2ShownIds = [], _r2SelectedCtx = [], _r2Area = null;
let _r3ShownIds = [], _r3SelectedCtx = [], _r3Area = null;

// ---- ROUND 3: Admission — two-group assessment, always 10 programs total ----
function renderRound3(area) {
  const sd = state.studentData;
  const studentScores = sd.scores || {};

  // Student's own selections (filtered to R3-eligible programs, preserve order)
  const prefs    = getPreferences();
  const r3Set    = new Set(TCAS_DATA.programs.filter(p => p.rounds.includes(3)).map(p => p.id));
  const selected = prefs.filter(id => r3Set.has(id))
                        .map(id => TCAS_DATA.programs.find(p => p.id === id))
                        .filter(Boolean);

  // Store context (no fallbacks — only student's own selections)
  _r3ShownIds  = selected.map(p => p.id);
  _r3SelectedCtx = selected;
  _r3Area = area;

  const selectedHtml = selected.length > 0
    ? `<div class="round-assess-list">
         ${selected.map((p, i) => renderAssessmentCard(p, studentScores, i + 1, true)).join('')}
       </div>`
    : '';

  const emptyHtml = selected.length === 0
    ? `<div class="empty-state" style="padding:40px 0">
         <div class="empty-state-icon">🎯</div>
         <div class="empty-state-title">หลักสูตรที่คุณเลือกไม่มีรอบ 3</div>
         <div class="empty-state-desc">หลักสูตรที่เลือกใน <strong>โปรไฟล์ → 10 อันดับ</strong> ไม่มีการเปิดรับรอบ 3 Admission<br>ลองดูรอบอื่น หรือเพิ่มหลักสูตรที่เปิดรอบ 3</div>
       </div>`
    : '';

  area.innerHTML = `
    <div class="round-assess-header" style="--rhc:#F59E0B">
      <div class="round-assess-title">🎯 ประเมินโอกาส รอบ 3 Admission</div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">
        ${selected.length > 0 ? `หลักสูตรที่เลือก <strong>${selected.length}</strong> หลักสูตรที่เปิดรับรอบ 3 · ใช้คะแนน TGAT / TPAT / A-Level` : ''}
      </div>
    </div>

    ${selected.length > 0 ? `<div class="r3-disclaimer">
      ⚠️ <strong>คำเตือน:</strong> การประเมินนี้ใช้เกณฑ์น้ำหนักคะแนนทั่วไปของ TCAS69
      และข้อมูลผลคะแนนย้อนหลัง ไม่ใช่เกณฑ์อย่างเป็นทางการของแต่ละสถาบัน
      ผลที่แสดงเป็นเพียงการ<em>ประมาณการโอกาส</em> ไม่ใช่การรับประกันผล
    </div>` : ''}

    ${emptyHtml}${selectedHtml}`;

  setupRoundBackToTop(area);
}

function setupRoundBackToTop(area) {
  if (_roundObserver) { _roundObserver.disconnect(); _roundObserver = null; }
  document.getElementById('round-back-top')?.remove();
}

function expandR3Extra() {
  const studentScores = state.studentData.scores || {};
  const extras = getExtraRecommendations(_r3ShownIds, _r3SelectedCtx, studentScores);

  const extraSection = document.getElementById('r3-extra-section');
  const expandWrap   = document.getElementById('r3-expand-wrap');
  if (!extraSection) return;

  if (extras.length === 0) {
    extraSection.innerHTML = `
      <div style="text-align:center;padding:24px 0 8px;color:var(--text-muted);font-size:0.84rem">
        ไม่พบหลักสูตรแนะนำเพิ่มเติมที่ตรงเกณฑ์ในขณะนี้
      </div>`;
  } else {
    const startRank = _r3ShownIds.length + 1;
    extraSection.innerHTML = `
      <div class="pref-section-label" style="margin-top:16px;border-left:3px solid var(--info);padding-left:8px;background:none">
        🔍 หลักสูตรแนะนำเพิ่มเติม
        <span style="font-weight:400;color:var(--text-muted);font-size:0.8rem">(${extras.length} หลักสูตร · โอกาสปานกลางขึ้นไปเท่านั้น)</span>
      </div>
      <div class="round-assess-list" style="margin-top:8px">
        ${extras.map((p, i) => renderAssessmentCard(p, studentScores, startRank + i, false)).join('')}
      </div>`;
  }

  expandWrap && (expandWrap.style.display = 'none');
}

function toggleInterestAndRefresh(catId) {
  toggleInterest(catId);
  if (state.currentPage === 'recommend') renderRecommendations();
}

// ---- ROUND 4: รับตรงอิสระ ----
function renderRound4(area) {
  const prefs = getPreferences();
  const r4Set = new Set(TCAS_DATA.programs.filter(p => p.rounds.includes(4)).map(p => p.id));
  const selected = prefs.filter(id => r4Set.has(id))
                        .map(id => TCAS_DATA.programs.find(p => p.id === id)).filter(Boolean);

  area.innerHTML = `
    <div class="round-assess-header" style="--rhc:#EF4444">
      <div class="round-assess-title">🏛️ รอบ 4 รับตรงอิสระ</div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">
        มหาวิทยาลัยรับสมัครโดยตรง หลังจากรอบ 3 เสร็จสิ้น สำหรับที่นั่งที่เหลือ
        ${selected.length > 0 ? `· หลักสูตรที่เลือก <strong>${selected.length}</strong> หลักสูตรที่เปิดรับรอบ 4` : ''}
      </div>
    </div>
    ${selected.length === 0 ? `
      <div class="empty-state" style="padding:32px 0">
        <div class="empty-state-icon">🏛️</div>
        <div class="empty-state-title">หลักสูตรที่คุณเลือกไม่มีรอบ 4</div>
        <div class="empty-state-desc">หลักสูตรที่เลือกใน <strong>โปรไฟล์ → 10 อันดับ</strong> ไม่มีการเปิดรับรอบ 4 รับตรงอิสระ</div>
      </div>` : `
      <div class="round-assess-list">
        ${selected.map(p => renderRoundAssessCard(p, 'round4', 0, 0, prefs)).join('')}
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

// ---- Round 3 assessment card — probabilistic 5-tier system ----
function renderAssessmentCard(program, studentScores, rank, isStudentPick) {
  const uni      = getUniversityById(program.universityId);
  const ws       = calculateWeightedScore(program, studentScores);
  const hist     = TCAS_HISTORICAL_STATS[program.id];

  // Determine cutoff from most recent historical year
  let cutoff = null;
  if (hist) {
    const lastYear = Object.keys(hist).sort().pop();
    cutoff = hist[lastYear].min;
  }

  // Tier & display values
  let tier, scoreDisplay, cutoffDisplay, diffDisplay, diffColor, chartSvg;

  if (ws.noData) {
    // No scores entered at all
    tier         = null;
    scoreDisplay = '—';
    cutoffDisplay = cutoff != null ? cutoff.toFixed(1) + '%' : '—';
    diffDisplay  = '—';
    diffColor    = 'var(--text-muted)';
  } else if (ws.complete) {
    const sc = ws.score;
    tier         = cutoff != null ? getAssessmentTier(sc, cutoff) : null;
    scoreDisplay = sc.toFixed(1) + '%';
    cutoffDisplay = cutoff != null ? cutoff.toFixed(1) + '%' : '—';
    if (cutoff != null) {
      const d = sc - cutoff;
      diffDisplay = (d >= 0 ? '+' : '') + d.toFixed(1) + '%';
      diffColor   = d >= 0 ? '#059669' : '#DC2626';
    } else {
      diffDisplay = '—'; diffColor = 'var(--text-muted)';
    }
    chartSvg = hist ? buildSparklineSVG(program.id, sc, tier?.color || '#1A3A6B') : '';
  } else {
    // Partial scores
    const sc = ws.partialKnown;
    tier         = null;
    scoreDisplay = sc.toFixed(1) + '%*';
    cutoffDisplay = cutoff != null ? cutoff.toFixed(1) + '%' : '—';
    if (cutoff != null) {
      const d = sc - cutoff;
      diffDisplay = (d >= 0 ? '+' : '') + d.toFixed(1) + '%*';
      diffColor   = d >= 0 ? '#059669' : '#DC2626';
    } else {
      diffDisplay = '—'; diffColor = 'var(--text-muted)';
    }
    chartSvg = hist ? buildSparklineSVG(program.id, sc, '#1A3A6B') : '';
  }

  // Score comparison row cells
  const scoreCmp = `
    <div class="r3-score-cmp">
      <div class="r3-score-cell">
        <div class="r3-score-val">${scoreDisplay}</div>
        <div class="r3-score-lbl">คะแนนของฉัน</div>
      </div>
      <div class="r3-score-cell r3-score-cell--mid">
        <div class="r3-score-val">${cutoffDisplay}</div>
        <div class="r3-score-lbl">เกณฑ์ขั้นต่ำ TCAS69</div>
      </div>
      <div class="r3-score-cell">
        <div class="r3-score-val" style="color:${diffColor}">${diffDisplay}</div>
        <div class="r3-score-lbl">ส่วนต่าง</div>
      </div>
    </div>`;

  // Missing subjects row (partial)
  let partialNote = '';
  if (!ws.complete && !ws.noData && ws.missingSubjs?.length > 0) {
    const req = cutoff != null ? calcPartialRequirement(ws, cutoff) : null;
    const missList = ws.missingSubjs.map(m => m.label).join(', ');
    partialNote = `<div class="r3-partial-note">
      * ยังไม่มีคะแนน: ${missList}
      ${req && req.possible && !req.alreadySufficient
        ? `· ต้องทำได้ <strong style="color:var(--primary)">≥ ${req.requiredPct.toFixed(0)}%</strong> ในวิชาที่เหลือจึงจะถึงเกณฑ์`
        : req && !req.possible && !req.alreadySufficient
          ? `· คะแนนที่ทำแล้วยังไม่พอถึงเกณฑ์แม้ได้เต็มทุกวิชาที่เหลือ`
          : ''}
    </div>`;
  }

  // Score breakdown details (collapsible)
  const criteria = TCAS_CATEGORY_CRITERIA[program.category] || {};
  const bdEntries = Object.entries(criteria);
  let breakdownHtml = '';
  if (bdEntries.length > 0) {
    breakdownHtml = `<details class="score-breakdown-details">
      <summary>สัดส่วนคะแนน ${bdEntries.length} วิชา (อ้างอิงเกณฑ์ทั่วไป TCAS69)</summary>
      <div class="score-breakdown-grid">
        ${bdEntries.map(([subj, weight]) => {
          const max = SCORE_MAX[subj] || 100;
          const raw = parseFloat(studentScores[subj]);
          const hasScore = !isNaN(raw) && raw > 0;
          const contrib  = hasScore ? ((raw / max) * weight).toFixed(1) : null;
          return `<div class="score-bd-item">
            <div class="score-bd-name">${SCORE_LABEL[subj]||subj} <span style="color:var(--text-muted)">${weight}%</span></div>
            <div class="score-bd-val ${hasScore?'':'no-score'}">${hasScore ? raw+'/'+max : '—'}</div>
            <div class="score-bd-contrib" style="color:${hasScore?'#6366F1':'var(--text-muted)'}">${contrib ? '+'+contrib+'%' : '—'}</div>
          </div>`;
        }).join('')}
      </div>
    </details>`;
  }

  const tierBadge = tier
    ? `<div class="round-chance-badge" style="color:${tier.color};border-color:${tier.color}40;background:${tier.bg};font-size:0.72rem;font-weight:700">${tier.label}</div>`
    : ws.noData
      ? `<div class="round-chance-badge" style="color:var(--text-muted);border-color:var(--border);background:var(--surface-2);font-size:0.72rem">ยังไม่มีคะแนน</div>`
      : `<div class="round-chance-badge" style="color:#D97706;border-color:#D97706;background:#FEF3C7;font-size:0.72rem">คะแนนบางส่วน</div>`;

  const rankBadgeBg = isStudentPick ? 'var(--primary)' : 'var(--accent)';
  const rankIcon    = isStudentPick ? '' : '💡 ';

  return `
    <div class="round3-card ${isStudentPick ? 'round-assess-card--pref' : 'r3-card--rec'}">
      <div class="pref-rank-label" style="background:${rankBadgeBg}">${rankIcon}#${rank}</div>
      <div class="round-assess-card-header" style="align-items:flex-start">
        <span class="pref-uni-tag" style="background:${uni.color};color:#fff;font-size:0.65rem;padding:2px 7px;border-radius:4px;font-weight:700;white-space:nowrap;flex-shrink:0;margin-top:2px">${uni.shortName}</span>
        <div style="flex:1;min-width:0">
          <div class="r3-faculty-name">${program.faculty}</div>
          <div class="round-assess-prog-name" style="margin-top:2px">${program.program}</div>
          <div class="r3-prog-full">${program.programFull || ''}</div>
        </div>
        ${tierBadge}
      </div>

      ${scoreCmp}
      ${partialNote}

      ${chartSvg ? `<div class="r3-chart-wrap">${chartSvg}</div>` : ''}

      ${breakdownHtml}

      <div class="r3-card-footer">
        <span class="r3-criteria-badge">📋 อ้างอิงเกณฑ์ทั่วไป TCAS69</span>
        <button class="btn-link" style="font-size:0.75rem" onclick="showProgramDetail('${program.id}')">รายละเอียด →</button>
      </div>
    </div>`;
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
        <div class="rec-rank-sub">${program.faculty} · ${program.duration} ปี${program.minGPA > 0 ? ' · GPA ≥ ' + program.minGPA : ''}</div>
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
        ${program.competition ? `<span class="comp-chip" style="color:${compColor[program.competition] || '#94A3B8'}">${program.competition}</span>` : ''}
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
// ---- Print report helpers ----
function _reportRoundChance(prog, round, gpaVal, portScoreVal) {
  const minGPA = parseFloat(prog.minGPA) || 0;
  if (round === 1) {
    const gpaOk = gpaVal >= minGPA || gpaVal === 0;
    if (!gpaOk)              return { label:'GPA ไม่ถึงเกณฑ์',      bg:'#FEE2E2', tx:'#7F1D1D' };
    if (portScoreVal >= 3)   return { label:'โอกาสสูง',             bg:'#DCFCE7', tx:'#14532D' };
    if (portScoreVal >= 1)   return { label:'พอมีโอกาส',            bg:'#FEF3C7', tx:'#92400E' };
    return                          { label:'ต้องเพิ่มพอร์ต',        bg:'#FEE2E2', tx:'#7F1D1D' };
  }
  if (round === 2) {
    const gpaOk = gpaVal >= minGPA || gpaVal === 0;
    const gap = gpaVal - minGPA;
    if (gap >= 0.25) return { label:`GPA เกินเกณฑ์ +${gap.toFixed(2)}`, bg:'#DCFCE7', tx:'#14532D' };
    if (gpaOk)        return { label:'GPA ผ่านเกณฑ์ (±ชายขอบ)',       bg:'#FEF3C7', tx:'#92400E' };
    return                    { label:`GPA ต่ำกว่าเกณฑ์ ${Math.abs(gap).toFixed(2)}`, bg:'#FEE2E2', tx:'#7F1D1D' };
  }
  return { label:'ตรวจสอบเพิ่มเติม', bg:'#F1F5F9', tx:'#64748B' };
}

function _reportRound3Chance(prog, scores) {
  const hist   = TCAS_HISTORICAL_STATS[prog.id];
  const lastY  = hist ? Object.keys(hist).sort().pop() : null;
  const cutoff = lastY ? hist[lastY].min : null;
  const ws     = calculateWeightedScore(prog, scores);

  if (cutoff == null) return { crit:'ไม่มีข้อมูลเกณฑ์ TCAS69', badge:{ label:'ไม่มีข้อมูล', bg:'#F1F5F9', tx:'#64748B' }, high:false };
  if (ws.noData)       return { crit:`เกณฑ์ขั้นต่ำ ${cutoff.toFixed(1)}%`, badge:{ label:'ยังไม่กรอกคะแนน', bg:'#F1F5F9', tx:'#64748B' }, high:false };

  if (ws.complete) {
    const tier = getAssessmentTier(ws.score, cutoff);
    return { crit:`${cutoff.toFixed(1)}% / ${ws.score.toFixed(1)}%`, badge:{ label:tier.label, bg:tier.bg, tx:tier.textColor }, high:tier.tier<=2 };
  }
  const tier = getAssessmentTier(ws.partialKnown, cutoff);
  return { crit:`${cutoff.toFixed(1)}% / ${ws.partialKnown.toFixed(1)}%*`, badge:{ label:tier.label+' *', bg:tier.bg, tx:tier.textColor }, high:tier.tier<=2 };
}

function _reportGpaSparkline(trend) {
  if (trend.length < 2) return '';
  const w = 160, h = 34, pad = 4;
  const vals = trend.map(t => t.v);
  const minV = Math.min(...vals) - 0.1, maxV = Math.max(...vals) + 0.1;
  const range = Math.max(maxV - minV, 0.1);
  const stepX = (w - 2*pad) / (trend.length - 1);
  const pts = trend.map((t,i) => {
    const x = pad + i*stepX;
    const y = h - pad - ((t.v - minV) / range) * (h - 2*pad);
    return [x, y];
  });
  const last = pts[pts.length-1];
  return `<svg class="spark" width="100%" height="34" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline points="${pts.map(pt=>pt.map(n=>n.toFixed(1)).join(',')).join(' ')}" fill="none" stroke="#1A3A6B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.2" fill="#F0A500"/>
  </svg>`;
}

function exportSummary() {
  const sd = state.studentData;
  const p = sd.profile;
  const gpa = sd.gpa;
  const scores = sd.scores;
  const portfolio = sd.portfolio;
  const prefs = getPreferences();
  const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'นักเรียน';

  const PROGRAM_LABELS = { EP:'English Program (EP)', IEP:'Intensive English Program (IEP)', GP:'General Program (GP)' };
  const todayThai = new Date().toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' });

  // ---- readiness (same formula as dashboard hero) ----
  const cumGPA = parseFloat(gpa.cumulative) || 0;
  const tgat1 = parseFloat(scores.tgat1)||0, tgat2 = parseFloat(scores.tgat2)||0, tgat3 = parseFloat(scores.tgat3)||0;
  const tgatTotal = tgat1+tgat2+tgat3;
  const tpat1 = parseFloat(scores.tpat1)||0, tpat2 = parseFloat(scores.tpat2)||0,
        tpat3s = parseFloat(scores.tpat3)||0, tpat4 = parseFloat(scores.tpat4)||0, tpat5 = parseFloat(scores.tpat5)||0;
  const aKeys = ['amath1','aeng','athai','ascience','achem','abio','aphy','asocial'];
  const aLabels = { amath1:'คณิตศาสตร์ 1', aeng:'ภาษาอังกฤษ', athai:'ภาษาไทย', ascience:'วิทยาศาสตร์ประยุกต์', achem:'เคมี', abio:'ชีววิทยา', aphy:'ฟิสิกส์', asocial:'สังคมศึกษา' };
  const aVals = aKeys.map(k => parseFloat(scores[k])||0);

  const totalItems = (portfolio.camps?.length||0)+(portfolio.activities?.length||0)+
    (portfolio.awards?.length||0)+(portfolio.competitions?.length||0)+(portfolio.volunteer?.length||0);
  const portCats5 = ['camps','activities','awards','competitions','volunteer'].filter(k => (portfolio[k]||[]).length>0).length;
  const portScoreVal = portCats5>=4 ? 3 : portCats5>=2 ? 2 : portCats5>=1 ? 1 : 0;

  const gpaReady = cumGPA > 0 ? cumGPA/4 : 0;
  const portReady = Math.min(totalItems/10, 1);
  const examPcts = [];
  if (tgatTotal > 0) examPcts.push(tgatTotal/300);
  if (tpat1 > 0) examPcts.push(tpat1/300);
  [tpat2,tpat3s,tpat4,tpat5].forEach(v => { if (v > 0) examPcts.push(v/100); });
  aVals.forEach(v => { if (v > 0) examPcts.push(v/100); });
  const examReady = examPcts.length ? examPcts.reduce((a,b)=>a+b,0)/examPcts.length : 0;
  const overall = 0.5*examReady + 0.25*gpaReady + 0.25*portReady;
  const overallPct = Math.round(overall*100);

  // ---- GPA trend ----
  const gpaSemLabels = { m401:'ม.4/1', m402:'ม.4/2', m411:'ม.5/1', m412:'ม.5/2', m421:'ม.6/1', m422:'ม.6/2' };
  const gpaTrend = Object.keys(gpaSemLabels).map(k => ({ label:gpaSemLabels[k], v:parseFloat(gpa[k])||0 })).filter(x => x.v>0);
  let gpaTrendNote = '';
  if (gpaTrend.length >= 2) {
    const diff = gpaTrend[gpaTrend.length-1].v - gpaTrend[0].v;
    gpaTrendNote = diff > 0.03 ? `↑ เพิ่มขึ้นต่อเนื่อง ${gpaTrend.length} ภาคเรียน (${gpaTrend[0].label}–${gpaTrend[gpaTrend.length-1].label})`
      : diff < -0.03 ? `↓ ลดลงจาก ${gpaTrend[0].label} ถึง ${gpaTrend[gpaTrend.length-1].label}`
      : `→ ค่อนข้างคงที่ตลอด ${gpaTrend.length} ภาคเรียน`;
  }

  // ---- required subjects — union across ALL selected programs (same source as the scores-page "วิชาที่ต้องสอบ" widget) ----
  const reqSubjsSet = new Set(Object.keys(getRequiredSubjects()));
  const missingReq = [...reqSubjsSet].filter(s => !(parseFloat(scores[s])>0)).map(s => SCORE_LABEL[s] || s);

  // ---- best chance per selected program (for the "โอกาสสูง-สูงมาก" stat) ----
  const highChanceCount = prefs.filter(id => {
    const prog = TCAS_DATA.programs.find(pp => pp.id === id);
    if (!prog) return false;
    let high = false;
    if (prog.rounds?.includes(1)) high = high || _reportRoundChance(prog,1,cumGPA,portScoreVal).label === 'โอกาสสูง';
    if (prog.rounds?.includes(2)) high = high || _reportRoundChance(prog,2,cumGPA,portScoreVal).label.startsWith('GPA เกินเกณฑ์');
    if (prog.rounds?.includes(3)) high = high || _reportRound3Chance(prog, scores).high;
    return high;
  }).length;

  // ---- score category card builders ----
  const buildBar = (label, val, max, missing) => `
    <div class="subrow${missing ? ' missing' : ''}">
      <div class="n">${label}</div>
      <div class="bar">${missing ? '' : `<i style="width:${Math.min(Math.round(val/max*100),100)}%"></i>`}</div>
      <div class="pv">${missing ? 'ยังไม่กรอก' : `${val}/${max}`}</div>
    </div>`;

  const tgatAvgVals = [tgat1,tgat2,tgat3].filter(v=>v>0);
  const tgatAvg = tgatAvgVals.length ? Math.round(tgatAvgVals.reduce((a,b)=>a+b,0)/tgatAvgVals.length) : null;
  const tgatCard = `
    <div class="score-card">
      <div class="hd"><div class="tag" style="background:#2856A3">TGAT</div><div class="nm">General Aptitude Test</div><div class="avg">${tgatAvg!=null?tgatAvg+'%':'—'}</div></div>
      ${buildBar('TGAT1 ภาษาอังกฤษ', tgat1, 100, tgat1<=0)}
      ${buildBar('TGAT2 การคิดวิเคราะห์', tgat2, 100, tgat2<=0)}
      ${buildBar('TGAT3 สมรรถนะการทำงาน', tgat3, 100, tgat3<=0)}
    </div>`;

  const tpatExtra = [['TPAT2',tpat2],['TPAT3',tpat3s],['TPAT4',tpat4],['TPAT5',tpat5]].filter(([,v])=>v>0);
  const tpatAvgVals = [tpat1>0?tpat1/300*100:null, ...([tpat2,tpat3s,tpat4,tpat5].filter(v=>v>0))].filter(v=>v!=null);
  const tpatAvg = tpatAvgVals.length ? Math.round(tpatAvgVals.reduce((a,b)=>a+b,0)/tpatAvgVals.length) : null;
  const tpatCard = `
    <div class="score-card">
      <div class="hd"><div class="tag" style="background:#0F766E">TPAT</div><div class="nm">Professional Aptitude Test</div><div class="avg">${tpatAvg!=null?tpatAvg+'%':'—'}</div></div>
      ${buildBar('TPAT1 วิชาเฉพาะแพทย์', tpat1, 300, tpat1<=0)}
      ${tpatExtra.length ? tpatExtra.map(([lbl,v]) => buildBar(lbl, v, 100, false)).join('') : `<div class="subrow missing"><div class="n">TPAT2–5</div><div class="bar"></div><div class="pv">ไม่ได้กรอก</div></div>`}
    </div>`;

  const aFilled = aKeys.map((k,i) => ({ k, label:aLabels[k], v:aVals[i] })).filter(x => x.v>0);
  const aAvg = aFilled.length ? Math.round(aFilled.reduce((s,x)=>s+x.v,0)/aFilled.length) : null;
  const aCard = `
    <div class="score-card">
      <div class="hd"><div class="tag" style="background:#7C2D12">A-Level</div><div class="nm">Academic Level</div><div class="avg">${aAvg!=null?aAvg+'%':'—'}</div></div>
      ${aFilled.length ? aFilled.map(x => buildBar(x.label, x.v, 100, false)).join('') : `<div class="subrow missing"><div class="n">ยังไม่ได้กรอกคะแนน A-Level</div><div class="bar"></div><div class="pv"></div></div>`}
    </div>`;

  const gpaxCard = `
    <div class="score-card">
      <div class="hd"><div class="tag" style="background:#1A3A6B">GPAX</div><div class="nm">เกรดเฉลี่ยสะสม</div></div>
      <div class="gpax-big">
        <div class="num">${cumGPA>0?cumGPA.toFixed(2):'—'}<small>/4.00</small></div>
        ${_reportGpaSparkline(gpaTrend)}
      </div>
      ${gpaTrendNote ? `<div style="font-size:.6rem;color:var(--text-secondary);margin-top:3px">${gpaTrendNote}</div>` : ''}
    </div>`;

  // ---- portfolio condensed ----
  const awardsComp = [...(portfolio.awards||[]), ...(portfolio.competitions||[])];
  const campsList = portfolio.camps||[];
  const actVolList = [...(portfolio.activities||[]), ...(portfolio.volunteer||[])];
  const pfChipsSrc = [
    ...awardsComp.map(a => ({ icon:'🏆', name:a.name, level:a.level })),
    ...campsList.map(a => ({ icon:'⛺', name:a.name })),
    ...actVolList.map(a => ({ icon:'🤝', name:a.name })),
  ].slice(0,6);
  const levelChip = lvl => {
    const l = TCAS_DATA.awardLevels.find(x => x.id === lvl);
    if (!l) return '';
    return `<span class="lv" style="background:${l.color}22;color:${l.color}">${l.name.replace('ระดับ','')}</span>`;
  };
  const portfolioSection = totalItems > 0 ? `
      <div class="section">
        <div class="section-title"><span class="ic">🏆</span>Portfolio<span class="count">${totalItems} รายการ</span></div>
        <div class="pf-row">
          <div class="pf-count"><div class="v">${awardsComp.length}</div><div class="l">รางวัล/แข่งขัน</div></div>
          <div class="pf-count"><div class="v">${campsList.length}</div><div class="l">ค่าย</div></div>
          <div class="pf-count"><div class="v">${actVolList.length}</div><div class="l">กิจกรรม/อาสา</div></div>
          <div class="pf-chips">
            ${pfChipsSrc.map(c => `<div class="pf-chip">${c.icon} ${c.name || '—'} ${c.level ? levelChip(c.level) : ''}</div>`).join('')}
          </div>
        </div>
      </div>` : '';

  // ---- 4-round plan table ----
  const roundMeta = { 1:{ label:'1 · Portfolio', color:'#1A3A6B' }, 2:{ label:'2 · โควตา', color:'#2856A3' }, 3:{ label:'3 · Admission', color:'#F0A500' }, 4:{ label:'4 · รับตรงอิสระ', color:'#64748B' } };
  let roundRows = '';
  [1,2,3,4].forEach(r => {
    prefs.forEach((pid, idx) => {
      const prog = TCAS_DATA.programs.find(pp => pp.id === pid);
      if (!prog || !prog.rounds?.includes(r)) return;
      const uni = getUniversityById(prog.universityId);
      let crit, badge;
      if (r === 1) { badge = _reportRoundChance(prog,1,cumGPA,portScoreVal); crit = `GPA ≥ ${prog.minGPA?parseFloat(prog.minGPA).toFixed(2):'—'}`; }
      else if (r === 2) { badge = _reportRoundChance(prog,2,cumGPA,portScoreVal); crit = `GPA ≥ ${prog.minGPA?parseFloat(prog.minGPA).toFixed(2):'—'} / ${cumGPA>0?cumGPA.toFixed(2):'—'}`; }
      else if (r === 3) { const rc = _reportRound3Chance(prog, scores); badge = rc.badge; crit = rc.crit; }
      else { badge = { label:'ตรวจสอบเพิ่มเติม', bg:'#F1F5F9', tx:'#64748B' }; crit = 'เกณฑ์เฉพาะมหาวิทยาลัย'; }
      roundRows += `<tr>
        <td><span class="round-pill" style="background:${roundMeta[r].color}">${roundMeta[r].label}</span></td>
        <td>${idx+1}</td>
        <td><span class="uni-tag" style="background:${uni.color}">${uni.shortName}</span></td>
        <td>${prog.program} · ${uni.name}</td>
        <td>${crit}</td>
        <td><span class="chance-badge" style="background:${badge.bg};color:${badge.tx}">${badge.label}</span></td>
      </tr>`;
    });
  });
  const roundSection = prefs.length > 0
    ? `<table class="rt">
        <thead><tr><th style="width:16%">รอบ</th><th style="width:6%">#</th><th style="width:12%">มหาวิทยาลัย</th><th>คณะ / สาขา</th><th style="width:16%">เกณฑ์ / คะแนนฉัน</th><th style="width:16%">โอกาส</th></tr></thead>
        <tbody>${roundRows || `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:16px 0">คณะที่เลือกไว้ยังไม่เปิดรับในรอบใดเลย</td></tr>`}</tbody>
      </table>`
    : `<div style="text-align:center;color:var(--text-muted);font-size:.72rem;padding:20px 0">ยังไม่ได้เลือกคณะเป้าหมาย — ไปที่โปรไฟล์เพื่อเลือกได้สูงสุด 10 อันดับ</div>`;

  // ---- top matches (reuses the same ranking used across the app) ----
  const { results: topRecs, fromPrefs } = getTopRecommendations(3);
  const recSection = topRecs.length ? `
      <div class="section">
        <div class="section-title"><span class="ic">✨</span>คณะที่มีความเหมาะสมสูงสุด<span class="count">${fromPrefs ? 'จากคณะที่เลือกไว้' : `จาก ${TCAS_DATA.programs.length.toLocaleString()} หลักสูตร`}</span></div>
        ${topRecs.map(({ program, result }, i) => {
          const uni = getUniversityById(program.universityId);
          const pct = Math.min(result.score, 100);
          return `<div class="rec-row">
            <div class="rec-rank">${i+1}</div>
            <div class="rec-badge" style="background:${uni.color}">${uni.shortName}</div>
            <div class="rec-info"><div class="n">${program.program}</div><div class="f">${program.faculty} · ${uni.name}</div></div>
            <div class="rec-match">${pct}%</div>
          </div>`;
        }).join('')}
      </div>` : '';

  // ---- upcoming dates ----
  const todayMid = new Date(); todayMid.setHours(0,0,0,0);
  const upcoming = TCAS70_EVENTS.filter(ev => new Date(ev.end+'T00:00:00') >= todayMid).slice(0,4);
  const dateSection = upcoming.length ? `
      <div class="section">
        <div class="section-title"><span class="ic">📅</span>วันสำคัญที่ต้องเตรียมตัว</div>
        <div class="date-strip">
          ${upcoming.map(ev => {
            const s = new Date(ev.start+'T00:00:00');
            const ds = Math.round((s-todayMid)/86400000);
            const ongoing = ds < 0;
            const label = ongoing ? 'กำลังดำเนินการ' : ds===0 ? 'วันนี้' : `อีก ${ds} วัน`;
            return `<div class="date-card"><div class="d">${calThDateRange(ev.start, ev.end)}</div><div class="t">${ev.short||ev.title}</div><span class="badge">${label}</span></div>`;
          }).join('')}
        </div>
      </div>` : '';

  // ---- readiness stats + parent callout ----
  const missingReqNote = missingReq.length
    ? `${missingReq.length} วิชา<br><span style="font-weight:400">${missingReq.slice(0,2).join(', ')}${missingReq.length>2?' และอื่นๆ':''}</span>`
    : (reqSubjsSet.size ? 'ครบถ้วน' : '—');

  const calloutParts = [];
  if (gpaTrendNote) calloutParts.push(`GPAX ${gpaTrendNote.replace(/^[↑↓→]\s*/,'').toLowerCase()}`);
  calloutParts.push(`คะแนนสอบพร้อมอยู่ที่ ${Math.round(examReady*100)}%`);
  if (missingReq.length) calloutParts.push(`ยังขาดคะแนนที่จำเป็นอีก ${missingReq.length} วิชา (${missingReq.slice(0,3).join(', ')})`);
  else if (reqSubjsSet.size) calloutParts.push(`กรอกคะแนนที่จำเป็นสำหรับคณะที่เลือกไว้ครบแล้ว`);
  const calloutText = `💡 <b>สรุปสำหรับผู้ปกครอง:</b> ${calloutParts.join(' · ')} แนะนำติดตามความคืบหน้าอย่างต่อเนื่องและตรวจสอบวันสมัคร/สอบให้ตรงกำหนดเวลา`;

  const printWin = window.open('', '_blank', 'width=900,height=700');
  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <title>รายงาน TCAS70 – ${name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        :root{
          --primary:#1A3A6B; --primary-dark:#112850; --primary-light:#2856A3;
          --accent:#F0A500; --accent-light:#FFD166;
          --border:#E2E8F0; --border-light:#F1F5F9;
          --text-primary:#0F172A; --text-secondary:#475569; --text-muted:#94A3B8;
          --success:#10B981; --warning:#F59E0B; --danger:#EF4444;
          --radius:10px; --radius-sm:7px;
        }
        *{box-sizing:border-box;margin:0;padding:0}
        html{font-size:14px}
        body{font-family:'Prompt',sans-serif;color:var(--text-primary);background:#fff;-webkit-font-smoothing:antialiased;padding:14px 16px}
        .page{width:210mm;max-width:100%;margin:0 auto;padding:9mm 12mm}
        .page-break{page-break-before:always}

        .topbar{background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 60%,#3D6BB3 100%);
          color:#fff;border-radius:var(--radius);padding:12px 16px;position:relative;overflow:hidden}
        .topbar::after{content:'';position:absolute;right:-40px;top:-40px;width:150px;height:150px;border-radius:50%;
          background:radial-gradient(circle,rgba(240,165,0,.28),transparent 70%)}
        .topbar-top{display:flex;align-items:center;gap:9px}
        .topbar .logo{width:28px;height:28px;border-radius:7px;background:rgba(255,255,255,.16);color:#fff;
          display:flex;align-items:center;justify-content:center;font-size:.78rem;flex-shrink:0}
        .topbar .sch b{display:block;font-size:.72rem;font-weight:700}
        .topbar .sch span{font-size:.58rem;opacity:.8}
        .topbar .badge2{margin-left:auto;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.32);
          font-size:.6rem;font-weight:700;padding:4px 11px;border-radius:50px;white-space:nowrap}
        .topbar .title{margin-top:9px}
        .topbar .title b{display:block;font-size:.92rem;font-weight:800;line-height:1.25}
        .topbar .title span{display:block;font-size:.62rem;opacity:.85;margin-top:2px}
        .topbar-meta{display:flex;gap:22px;margin-top:10px;flex-wrap:wrap;position:relative}
        .topbar-meta div .l{font-size:.56rem;opacity:.7;text-transform:uppercase;letter-spacing:.03em}
        .topbar-meta div .v{font-size:.74rem;font-weight:700;margin-top:1px}

        .section{margin-top:10px;page-break-inside:avoid}
        .section-title{display:flex;align-items:center;gap:7px;font-size:.8rem;font-weight:700;color:var(--primary);
          border-bottom:1.5px solid var(--border);padding-bottom:6px;margin-bottom:9px}
        .section-title .ic{width:20px;height:20px;border-radius:6px;background:var(--primary);color:#fff;
          display:flex;align-items:center;justify-content:center;font-size:.66rem}
        .section-title .count{margin-left:auto;font-size:.62rem;color:var(--text-muted);font-weight:500}

        .ready-row{display:grid;grid-template-columns:110px 1fr;gap:14px;align-items:center}
        .gauge-box{display:flex;flex-direction:column;align-items:center;gap:2px}
        .gauge-box .lbl{font-size:.58rem;color:var(--text-muted);text-align:center}
        .ready-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
        .rstat{border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 10px;background:var(--border-light)}
        .rstat .l{font-size:.6rem;color:var(--text-muted);font-weight:600}
        .rstat .v{font-size:1.05rem;font-weight:800;color:var(--primary);margin-top:1px}
        .rstat .s{font-size:.6rem;color:var(--text-secondary)}
        .rstat.good .v{color:var(--success)}
        .rstat.warn .v{color:var(--warning)}

        .score-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .score-card{border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;page-break-inside:avoid}
        .score-card .hd{display:flex;align-items:center;gap:7px;margin-bottom:7px}
        .score-card .hd .tag{width:24px;height:24px;border-radius:6px;color:#fff;font-size:.62rem;font-weight:800;
          display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .score-card .hd .nm{font-size:.76rem;font-weight:700}
        .score-card .hd .avg{margin-left:auto;font-size:.9rem;font-weight:800;color:var(--primary)}
        .subrow{display:flex;align-items:center;gap:7px;padding:3px 0}
        .subrow .n{font-size:.66rem;color:var(--text-secondary);width:112px;flex-shrink:0}
        .subrow .bar{flex:1;height:5px;background:#EDF0F5;border-radius:3px;overflow:hidden}
        .subrow .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--primary),var(--primary-light));border-radius:3px}
        .subrow .pv{font-size:.66rem;font-weight:700;width:64px;text-align:right;flex-shrink:0}
        .subrow.missing .n,.subrow.missing .pv{color:var(--text-muted);font-weight:400}
        .gpax-big{display:flex;align-items:center;gap:14px}
        .gpax-big .num{font-size:1.6rem;font-weight:800;color:var(--primary)}
        .gpax-big .num small{font-size:.7rem;color:var(--text-muted);font-weight:500}
        .spark{flex:1}

        .pf-row{display:flex;gap:10px;align-items:stretch}
        .pf-count{border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 12px;text-align:center;flex-shrink:0;min-width:76px}
        .pf-count .v{font-size:1.1rem;font-weight:800;color:var(--primary)}
        .pf-count .l{font-size:.58rem;color:var(--text-muted)}
        .pf-chips{flex:1;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start}
        .pf-chip{border:1px solid var(--border);border-radius:50px;padding:4px 11px 4px 8px;font-size:.66rem;display:flex;align-items:center;gap:5px;background:#fff}
        .pf-chip .lv{font-size:.58rem;font-weight:700;padding:1px 6px;border-radius:50px}

        .tier-legend{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:8px}
        .tier-chip{font-size:.6rem;font-weight:700;padding:2px 9px;border-radius:50px}

        table{width:100%;border-collapse:collapse}
        .rt th{text-align:left;padding:6px 8px;font-size:.6rem;color:var(--text-muted);text-transform:uppercase;
          letter-spacing:.02em;background:var(--border-light);font-weight:700}
        .rt td{padding:6px 8px;font-size:.7rem;border-bottom:1px solid var(--border-light);vertical-align:middle}
        .rt tr{page-break-inside:avoid}
        .rt tr:last-child td{border-bottom:none}
        .round-pill{font-size:.58rem;font-weight:700;padding:2px 8px;border-radius:5px;color:#fff;white-space:nowrap}
        .uni-tag{font-size:.58rem;font-weight:700;color:#fff;padding:2px 6px;border-radius:4px;white-space:nowrap}
        .chance-badge{font-size:.6rem;font-weight:700;padding:2px 8px;border-radius:50px;white-space:nowrap}

        .rec-row{display:flex;align-items:center;gap:9px;padding:6px 9px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:6px;page-break-inside:avoid}
        .rec-rank{width:18px;height:18px;border-radius:5px;background:var(--accent);color:#fff;font-size:.6rem;font-weight:800;
          display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .rec-badge{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;
          font-size:.54rem;font-weight:800;color:#fff;flex-shrink:0}
        .rec-info{flex:1;min-width:0}
        .rec-info .n{font-size:.74rem;font-weight:700}
        .rec-info .f{font-size:.62rem;color:var(--text-muted)}
        .rec-match{font-size:.82rem;font-weight:800;color:var(--primary);flex-shrink:0}

        .date-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        .date-card{border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px 9px;page-break-inside:avoid}
        .date-card .d{font-size:.76rem;font-weight:800;color:var(--primary)}
        .date-card .t{font-size:.6rem;color:var(--text-secondary)}
        .date-card .badge{display:inline-block;margin-top:3px;font-size:.55rem;font-weight:700;padding:1px 6px;border-radius:50px;
          background:#FEF3C7;color:#92400E}

        .sign-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:6px}
        .sign-line{height:34px;border-bottom:1px dashed var(--border)}
        .sign-lbl{font-size:.62rem;color:var(--text-muted);margin-top:4px}

        .callout{border-radius:var(--radius);padding:11px 14px;font-size:.68rem;line-height:1.65;border:1px dashed var(--border);
          color:var(--text-secondary);background:var(--border-light)}
        .footer-note{margin-top:12px;padding-top:8px;border-top:1px solid var(--border);font-size:.6rem;color:var(--text-muted);
          text-align:center;line-height:1.5}

        @media print{
          body{padding:0}
          .page{padding:10mm 12mm}
        }
      </style>
    </head>
    <body>
      <div class="page">

        <div class="topbar">
          <div class="topbar-top">
            <div class="logo">🏫</div>
            <div class="sch"><b>โรงเรียนโพธิสารพิทยากร</b><span>Potisarnpittayakorn School</span></div>
            <div class="badge2">🎯 TCAS70 · ปีการศึกษา 2570</div>
          </div>
          <div class="title">
            <b>TCAS70: Student Advisor for Potisarnpittayakorn School</b>
            <span>แอปพลิเคชันแนะแนวการศึกษาต่อระดับอุดมศึกษา · สร้างเมื่อวันที่ ${todayThai}</span>
          </div>
          <div class="topbar-meta">
            <div><div class="l">ชื่อ-นามสกุล</div><div class="v">${name}</div></div>
            <div><div class="l">รหัสนักเรียน</div><div class="v">${p.studentId || '—'}</div></div>
            <div><div class="l">ชั้น / เลขที่</div><div class="v">${p.classRoom || '—'}${p.classNo ? ' · เลขที่ '+p.classNo : ''}</div></div>
            <div><div class="l">โปรแกรม</div><div class="v">${PROGRAM_LABELS[p.program] || p.program || '—'}</div></div>
          </div>
          <div class="topbar-meta" style="margin-top:8px">
            <div><div class="l">แผนการเรียน</div><div class="v">${p.studyPlan || '—'}</div></div>
            <div style="flex:2.4"><div class="l">เป้าหมายการศึกษา (ทั้งหมด)</div><div class="v">${p.target || '—'}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title"><span class="ic">🎯</span>ภาพรวมความพร้อม</div>
          <div class="ready-row">
            <div class="gauge-box">
              <svg width="96" height="96" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#EDF0F5" stroke-width="13"/>
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#g1)" stroke-width="13"
                        stroke-linecap="round" stroke-dasharray="314.16" stroke-dashoffset="${(314.16*(1-overall)).toFixed(1)}"
                        transform="rotate(-90 60 60)"/>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#1A3A6B"/><stop offset="100%" stop-color="#F0A500"/>
                </linearGradient></defs>
                <text x="60" y="57" text-anchor="middle" font-size="26" font-weight="800" fill="#0F172A" font-family="Prompt">${overallPct}%</text>
                <text x="60" y="76" text-anchor="middle" font-size="10" fill="#94A3B8" font-family="Prompt">ความพร้อม</text>
              </svg>
              <div class="lbl">คะแนนสอบ 50% · GPAX 25%<br>Portfolio 25%</div>
            </div>
            <div class="ready-stats">
              <div class="rstat ${prefs.length>=10?'good':'warn'}"><div class="l">คณะที่เลือกไว้</div><div class="v">${prefs.length} อันดับ</div><div class="s">${prefs.length>=10?'ครบ 10 อันดับ':'ยังไม่ครบ 10 อันดับ'}</div></div>
              <div class="rstat good"><div class="l">โอกาสสูง–สูงมาก</div><div class="v">${highChanceCount} / ${prefs.length||0}</div><div class="s">อ้างอิงเกณฑ์ TCAS69</div></div>
              <div class="rstat ${missingReq.length?'warn':'good'}"><div class="l">วิชาที่ยังไม่กรอก</div><div class="v">${missingReqNote}</div></div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title"><span class="ic">📊</span>คะแนนสอบ</div>
          <div class="score-grid">${gpaxCard}${tgatCard}${tpatCard}${aCard}</div>
        </div>

        ${portfolioSection}

        <div class="section">
          <div class="callout">${calloutText}</div>
        </div>
      </div>

      <div class="page page-break">
        <div class="section" style="margin-top:0">
          <div class="section-title"><span class="ic">🗂️</span>แผนการสมัคร TCAS70 · 4 รอบ<span class="count">${prefs.length} อันดับที่เลือกไว้</span></div>
          <div class="tier-legend">
            <span class="tier-chip" style="background:#D1FAE5;color:#065F46">โอกาสสูงมาก</span>
            <span class="tier-chip" style="background:#DCFCE7;color:#14532D">โอกาสสูง</span>
            <span class="tier-chip" style="background:#FEF3C7;color:#92400E">โอกาสปานกลาง</span>
            <span class="tier-chip" style="background:#FFEDD5;color:#7C2D12">โอกาสต่ำ</span>
            <span class="tier-chip" style="background:#FEE2E2;color:#7F1D1D">โอกาสต่ำมาก</span>
          </div>
          ${roundSection}
        </div>

        ${recSection}
        ${dateSection}

        <div class="section">
          <div class="section-title"><span class="ic">✍️</span>ลงชื่อรับทราบ</div>
          <div class="sign-row">
            <div><div class="sign-line"></div><div class="sign-lbl">ลายเซ็นนักเรียน</div></div>
            <div><div class="sign-line"></div><div class="sign-lbl">ลายเซ็นผู้ปกครอง / ที่ปรึกษา</div></div>
          </div>
        </div>

        <div class="footer-note">
          รายงานนี้สร้างโดยระบบ TCAS70 Student Advisor สำหรับโรงเรียนโพธิสารพิทยากร · ข้อมูลเกณฑ์อ้างอิงจาก TCAS69 (www.mytcas.com) เพื่อใช้ประกอบการวางแผนเบื้องต้น มิใช่เกณฑ์ทางการของ TCAS70
        </div>
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

// ============================================================
// VERSION NOTIFICATION & SUNDAY AUTO-UPDATE
// ============================================================

function checkVersionNotification() {
  const seenVersion = localStorage.getItem('tcas70_seen_version');
  if (seenVersion === APP_VERSION) return;

  // Find the latest changelog entry (first = newest)
  const latest = CHANGELOG[0];
  if (!latest || !latest.updates.length) return;

  const msg = latest.updates.slice(0, 2).join(' · ');
  const el  = document.getElementById('update-banner-msg');
  if (el) el.textContent = ' — ' + msg;
  document.getElementById('update-banner')?.classList.remove('hidden');
}

function dismissUpdateBanner() {
  localStorage.setItem('tcas70_seen_version', APP_VERSION);
  document.getElementById('update-banner')?.classList.add('hidden');
}

function checkSundayForceUpdate() {
  const now = new Date();
  if (now.getDay() !== 0 || now.getHours() < 11) return;

  // Build ISO string for "this Sunday 11:00"
  const thisSunday = new Date(now);
  thisSunday.setHours(11, 0, 0, 0);
  const key = 'tcas70_last_sunday_update';
  const last = localStorage.getItem(key);

  if (last && new Date(last) >= thisSunday) return; // already updated this week

  localStorage.setItem(key, now.toISOString());
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.update().then(() => {
        // After SW updates, reload to pick up new data
        setTimeout(() => window.location.reload(true), 800);
      });
    });
  } else {
    window.location.reload(true);
  }
}

// ============================================================
// VERSION LOG (rendered into About page)
// ============================================================

function renderVersionLog() {
  const body = document.getElementById('version-log-body');
  if (!body) return;

  body.innerHTML = CHANGELOG.map((entry, idx) => {
    const isLatest = idx === 0;
    const dateObj  = new Date(entry.date + 'T00:00:00');
    const dateStr  = dateObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    return `
      <div class="vlog-entry">
        <div class="vlog-header">
          <span class="vlog-version">v ${entry.version}</span>
          <span class="vlog-date">${dateStr}</span>
          ${isLatest ? '<span class="vlog-latest">ปัจจุบัน</span>' : ''}
        </div>
        <ul class="vlog-updates">
          ${entry.updates.map(u => `<li>${u}</li>`).join('')}
        </ul>
      </div>
      ${idx < CHANGELOG.length - 1 ? '<hr class="vlog-divider">' : ''}
    `;
  }).join('');
}

// ---- Avatar upload ----
function editAvatar() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('รูปภาพต้องมีขนาดไม่เกิน 5MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      state.studentData.avatarData = ev.target.result;
      saveData();
      updateAvatarDisplay();
      showToast('✅ เปลี่ยนรูปโปรไฟล์แล้ว');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function updateAvatarDisplay() {
  const src = state.studentData.avatarData || 'images/student-avatar.svg';
  const profileImg = document.querySelector('.profile-avatar-large .avatar-img');
  if (profileImg) profileImg.src = src;
  const headerAvatar = document.getElementById('student-avatar');
  if (headerAvatar) headerAvatar.innerHTML = `<img src="${src}" alt="avatar" class="avatar-img">`;
}

document.addEventListener('DOMContentLoaded', () => {
  // Nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.page);
      if (item.dataset.page === 'about') renderVersionLog();
    });
  });

  // Modal close
  document.getElementById('modal-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Student chip click -> profile
  document.getElementById('student-chip')?.addEventListener('click', () => navigate('profile'));

  // Initialize app
  updateHeaderChip();
  updateAvatarDisplay();
  navigate('dashboard');
  checkVersionNotification();
  checkSundayForceUpdate();
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
