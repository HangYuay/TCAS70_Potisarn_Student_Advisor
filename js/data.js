// ============================================================
// TCAS70 Data - Universities, Faculties, and Admission Criteria
// Academic Year 2570 (2027)
// ============================================================

const TCAS_DATA = {
  // ---- TCAS Round Information ----
  rounds: [
    {
      id: 1,
      name: "รอบที่ 1 Portfolio",
      nameEn: "Portfolio",
      period: "15 ส.ค. 2569 – 28 ก.พ. 2570",
      color: "#6366F1",
      description: "การรับด้วยแฟ้มสะสมผลงาน สำหรับนักเรียนที่มีความสามารถพิเศษ ผลงาน และรางวัลโดดเด่น",
      requirements: ["GPAX (อาจกำหนด)", "Portfolio/แฟ้มสะสมผลงาน", "สัมภาษณ์", "ผลงาน/รางวัล"],
      notes: "ไม่ใช้คะแนน TGAT/TPAT/A-Level ในบางโครงการ"
    },
    {
      id: 2,
      name: "รอบที่ 2 โควตา",
      nameEn: "Quota",
      period: "13 มี.ค. – 30 เม.ย. 2570",
      color: "#10B981",
      description: "การรับแบบโควตา สำหรับนักเรียนในพื้นที่หรือตามคุณสมบัติที่มหาวิทยาลัยกำหนด",
      requirements: ["GPAX", "TGAT/TPAT (ตามที่กำหนด)", "A-Level (ตามที่กำหนด)", "โควตาพื้นที่/ประเภท"],
      notes: "อาจต้องมีเอกสารรับรองจากโรงเรียน"
    },
    {
      id: 3,
      name: "รอบที่ 3 Admission",
      nameEn: "Central Admission",
      period: "7–11 พ.ค. 2570",
      color: "#F59E0B",
      description: "การรับกลาง ใช้คะแนน TGAT/TPAT และ A-Level เป็นหลัก สมัครผ่านระบบ mytcas.com",
      requirements: ["GPAX", "TGAT", "TPAT (ตามสาขา)", "A-Level (ตามสาขา)"],
      notes: "สมัครได้สูงสุด 10 อันดับ ไม่เสียค่าสมัคร"
    },
    {
      id: 4,
      name: "รอบที่ 4 รับตรงอิสระ",
      nameEn: "Direct Admission",
      period: "29 พ.ค. – 15 มิ.ย. 2570",
      color: "#EF4444",
      description: "การรับตรงของแต่ละมหาวิทยาลัย เป็นรอบสุดท้ายสำหรับนักเรียนที่ยังไม่ได้ที่เรียน",
      requirements: ["ตามที่แต่ละมหาวิทยาลัยกำหนด"],
      notes: "เปิดรับในบางสาขาที่มีที่ว่างเหลือ"
    }
  ],

  // ---- Test Score Information ----
  tests: {
    tgat: {
      name: "TGAT",
      fullName: "Thai General Aptitude Test",
      subjects: {
        tgat1: { name: "TGAT1 ความถนัดสื่อสารภาษาอังกฤษ", maxScore: 100, icon: "🌐" },
        tgat2: { name: "TGAT2 การคิดอย่างมีเหตุผล", maxScore: 100, icon: "🧠" },
        tgat3: { name: "TGAT3 สมรรถนะการทำงานในโลกอนาคต", maxScore: 100, icon: "⚡" }
      }
    },
    tpat: {
      name: "TPAT",
      fullName: "Thai Professional Aptitude Test",
      subjects: {
        tpat1: { name: "TPAT1 วิชาเฉพาะแพทย์ (กสพท)", maxScore: 300, icon: "🏥" },
        tpat2: { name: "TPAT2 วิชาเฉพาะด้านศิลปกรรมศาสตร์", maxScore: 100, icon: "🎨" },
        tpat3: { name: "TPAT3 วิชาเฉพาะวิทยาศาสตร์ เทคโนโลยี วิศวกรรมศาสตร์", maxScore: 100, icon: "⚙️" },
        tpat4: { name: "TPAT4 วิชาเฉพาะสถาปัตยกรรมศาสตร์", maxScore: 100, icon: "🏛️" },
        tpat5: { name: "TPAT5 วิชาเฉพาะครุศาสตร์/ศึกษาศาสตร์", maxScore: 100, icon: "📚" }
      }
    },
    alevel: {
      name: "A-Level",
      fullName: "Academic Level",
      subjects: {
        amath1: { name: "คณิตศาสตร์ประยุกต์ 1 (พื้นฐาน+เพิ่มเติม)", maxScore: 100, icon: "📐" },
        amath2: { name: "คณิตศาสตร์ประยุกต์ 2 (พื้นฐาน)", maxScore: 100, icon: "📏" },
        ascience: { name: "วิทยาศาสตร์ประยุกต์", maxScore: 100, icon: "🔬" },
        asocial: { name: "สังคมศาสตร์", maxScore: 100, icon: "🌏" },
        athai: { name: "ภาษาไทย", maxScore: 100, icon: "🇹🇭" },
        aeng: { name: "ภาษาอังกฤษ", maxScore: 100, icon: "🇬🇧" },
        aphy: { name: "ฟิสิกส์", maxScore: 100, icon: "⚛️" },
        achem: { name: "เคมี", maxScore: 100, icon: "🧪" },
        abio: { name: "ชีววิทยา", maxScore: 100, icon: "🧬" },
        ahist: { name: "ประวัติศาสตร์", maxScore: 100, icon: "📜" },
        afre: { name: "ภาษาฝรั่งเศส", maxScore: 100, icon: "🇫🇷" },
        ager: { name: "ภาษาเยอรมัน", maxScore: 100, icon: "🇩🇪" },
        ajpn: { name: "ภาษาญี่ปุ่น", maxScore: 100, icon: "🇯🇵" },
        achn: { name: "ภาษาจีน", maxScore: 100, icon: "🇨🇳" },
        akor: { name: "ภาษาเกาหลี", maxScore: 100, icon: "🇰🇷" }
      }
    }
  },

  // ---- Universities ----
  universities: [
    {
      id: "cu",
      name: "จุฬาลงกรณ์มหาวิทยาลัย",
      nameEn: "Chulalongkorn University",
      shortName: "CU",
      color: "#D4007C",  // ชมพูจุฬา (Pantone 226 C)
      location: "กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.chula.ac.th",
      logo: "https://upload.wikimedia.org/wikipedia/th/7/70/Chulalongkorn_University_Logo.png",
      portfolioSystem: "tcasfolio",  // confirmed: CU accepts Round 1 portfolios only via ทปอ. TCASFolio (July 2026 announcement)
    },
    {
      id: "mu",
      name: "มหาวิทยาลัยมหิดล",
      nameEn: "Mahidol University",
      shortName: "MU",
      color: "#003087",  // น้ำเงินมหิดล (Royal Blue)
      location: "นครปฐม / กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.mahidol.ac.th",
      logo: "https://upload.wikimedia.org/wikipedia/th/7/77/Mahidol_University_Seal.png",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "tu",
      name: "มหาวิทยาลัยธรรมศาสตร์",
      nameEn: "Thammasat University",
      shortName: "TU",
      color: "#CC0000",  // แดงธรรมศาสตร์
      location: "ปทุมธานี / กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.tu.ac.th",
      logo: "https://upload.wikimedia.org/wikipedia/th/a/a7/TU_symbol.png",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "ku",
      name: "มหาวิทยาลัยเกษตรศาสตร์",
      nameEn: "Kasetsart University",
      shortName: "KU",
      color: "#1B7340",  // เขียวเกษตรศาสตร์
      location: "กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.ku.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "su",
      name: "มหาวิทยาลัยศิลปากร",
      nameEn: "Silpakorn University",
      shortName: "SU",
      color: "#5D1A84",  // ม่วงศิลปากร
      location: "กรุงเทพมหานคร / นครปฐม",
      type: "รัฐ",
      website: "www.su.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "cmu",
      name: "มหาวิทยาลัยเชียงใหม่",
      nameEn: "Chiang Mai University",
      shortName: "CMU",
      color: "#522D80",  // ม่วงเชียงใหม่ (CMU Purple)
      location: "เชียงใหม่",
      type: "รัฐ",
      website: "www.cmu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "kku",
      name: "มหาวิทยาลัยขอนแก่น",
      nameEn: "Khon Kaen University",
      shortName: "KKU",
      color: "#1A237E",  // น้ำเงินขอนแก่น
      location: "ขอนแก่น",
      type: "รัฐ",
      website: "www.kku.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "psu",
      name: "มหาวิทยาลัยสงขลานครินทร์",
      nameEn: "Prince of Songkla University",
      shortName: "PSU",
      color: "#003E7E",  // น้ำเงินสงขลานครินทร์
      location: "สงขลา / ปัตตานี / ภูเก็ต",
      type: "รัฐ",
      website: "www.psu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "swu",
      name: "มหาวิทยาลัยศรีนครินทรวิโรฒ",
      nameEn: "Srinakharinwirot University",
      shortName: "SWU",
      color: "#C62828",  // แดงชาดศรีนครินทรวิโรฒ
      location: "กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.swu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "kmutt",
      name: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี",
      nameEn: "KMUTT",
      shortName: "KMUTT",
      color: "#002868",  // น้ำเงิน มจธ
      location: "กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.kmutt.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "kmitl",
      name: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
      nameEn: "KMITL",
      shortName: "KMITL",
      color: "#003087",  // น้ำเงิน สจล
      location: "กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.kmitl.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "nu",
      name: "มหาวิทยาลัยนเรศวร",
      nameEn: "Naresuan University",
      shortName: "NU",
      color: "#1E7E34",  // เขียวนเรศวร
      location: "พิษณุโลก",
      type: "รัฐ",
      website: "www.nu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "bu",
      name: "มหาวิทยาลัยบูรพา",
      nameEn: "Burapha University",
      shortName: "BUU",
      color: "#1565C0",  // น้ำเงินบูรพา (Royal Blue)
      location: "ชลบุรี",
      type: "รัฐ",
      website: "www.buu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "ru",
      name: "มหาวิทยาลัยรามคำแหง",
      nameEn: "Ramkhamhaeng University",
      shortName: "RU",
      color: "#5D4037",  // น้ำตาลรามคำแหง (Brown-Gold)
      location: "กรุงเทพมหานคร",
      type: "รัฐ (ตลาดวิชา)",
      website: "www.ru.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "mfu",
      name: "มหาวิทยาลัยแม่ฟ้าหลวง",
      nameEn: "Mae Fah Luang University",
      shortName: "MFU",
      color: "#0D47A1",  // น้ำเงินแม่ฟ้าหลวง
      location: "เชียงราย",
      type: "รัฐ",
      website: "www.mfu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "kmutnb",
      name: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
      nameEn: "KMUTNB",
      shortName: "KMUTNB",
      color: "#B71C1C",  // แดง มจพ (Red)
      location: "กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.kmutnb.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "msu",
      name: "มหาวิทยาลัยมหาสารคาม",
      nameEn: "Mahasarakham University",
      shortName: "MSU",
      color: "#C47B00",  // ทองแสดมหาสารคาม (Gold)
      location: "มหาสารคาม",
      type: "รัฐ",
      website: "www.msu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "ubu",
      name: "มหาวิทยาลัยอุบลราชธานี",
      nameEn: "Ubon Ratchathani University",
      shortName: "UBU",
      color: "#33691E",  // เขียวอุบลราชธานี
      location: "อุบลราชธานี",
      type: "รัฐ",
      website: "www.ubu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "wu",
      name: "มหาวิทยาลัยวลัยลักษณ์",
      nameEn: "Walailak University",
      shortName: "WU",
      color: "#00695C",  // เขียว-น้ำเงินวลัยลักษณ์ (Teal)
      location: "นครศรีธรรมราช",
      type: "รัฐ",
      website: "www.wu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "rmutt",
      name: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี",
      nameEn: "RMUTT",
      shortName: "RMUTT",
      color: "#B71C1C",  // แดงราชมงคลธัญบุรี
      location: "ปทุมธานี",
      type: "รัฐ",
      website: "www.rmutt.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "rmutp",
      name: "มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร",
      nameEn: "RMUTP",
      shortName: "RMUTP",
      color: "#1565C0",  // น้ำเงินราชมงคลพระนคร
      location: "กรุงเทพมหานคร",
      type: "รัฐ",
      website: "www.rmutp.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "rsu",
      name: "มหาวิทยาลัยรังสิต",
      nameEn: "Rangsit University",
      shortName: "RSU",
      color: "#1565C0",  // น้ำเงินรังสิต
      location: "ปทุมธานี",
      type: "เอกชน",
      website: "www.rsu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "bu2",
      name: "มหาวิทยาลัยกรุงเทพ",
      nameEn: "Bangkok University",
      shortName: "BU",
      color: "#E64A19",  // ส้มมหาวิทยาลัยกรุงเทพ (Orange)
      location: "กรุงเทพมหานคร",
      type: "เอกชน",
      website: "www.bu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "spu",
      name: "มหาวิทยาลัยศรีปทุม",
      nameEn: "Sripatum University",
      shortName: "SPU",
      color: "#C62828",  // แดงศรีปทุม
      location: "กรุงเทพมหานคร",
      type: "เอกชน",
      website: "www.spu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "dpu",
      name: "มหาวิทยาลัยธุรกิจบัณฑิตย์",
      nameEn: "DPU",
      shortName: "DPU",
      color: "#003087",  // น้ำเงินธุรกิจบัณฑิตย์
      location: "กรุงเทพมหานคร",
      type: "เอกชน",
      website: "www.dpu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "abac",
      name: "มหาวิทยาลัยอัสสัมชัญ",
      nameEn: "Assumption University",
      shortName: "ABAC",
      color: "#1E40AF",  // น้ำเงิน-ทองอัสสัมชัญ
      location: "กรุงเทพมหานคร",
      type: "เอกชน",
      website: "www.au.edu",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "utcc",
      name: "มหาวิทยาลัยหอการค้าไทย",
      nameEn: "UTCC",
      shortName: "UTCC",
      color: "#E8A000",  // เหลือง-ทองหอการค้าไทย
      location: "กรุงเทพมหานคร",
      type: "เอกชน",
      website: "www.utcc.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "kku2",
      name: "มหาวิทยาลัยราชภัฏมหาสารคาม",
      nameEn: "Rajabhat Maha Sarakham",
      shortName: "RMS",
      color: "#7B1FA2",  // ม่วงราชภัฏมหาสารคาม
      location: "มหาสารคาม",
      type: "รัฐ (ราชภัฏ)",
      website: "www.rmu.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    },
    {
      id: "bru",
      name: "มหาวิทยาลัยราชภัฏบุรีรัมย์",
      nameEn: "Buriram Rajabhat University",
      shortName: "BRU",
      color: "#6A1B9A",  // ม่วงราชภัฏบุรีรัมย์
      location: "บุรีรัมย์",
      type: "รัฐ (ราชภัฏ)",
      website: "www.bru.ac.th",
      logo: "",
      portfolioSystem: "unconfirmed",  // 'tcasfolio' | 'independent' | 'both' | 'unconfirmed' — TCAS70 Round 1 portfolio submission policy
    }
  ],

  // ---- Programs/Faculties with TCAS70 Criteria ----
  programs: [
    // ===== จุฬาลงกรณ์มหาวิทยาลัย =====
    {
      id: "cu-med",
      universityId: "cu",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 274,
      rounds: [1, 2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "ผลิตแพทย์ผู้มีความรู้คู่คุณธรรม บริการสุขภาพแก่สังคม",
      criteria: {
        round3: {
          tpat1: 30,
          athai: 5, asocial: 5, aeng: 10,
          amath1: 10, aphy: 10, achem: 15, abio: 15
        }
      },
      specialReq: ["TPAT1 (กสพท)", "สัมภาษณ์", "ตรวจร่างกาย"]
    },
    {
      id: "cu-dent",
      universityId: "cu",
      faculty: "ทันตแพทยศาสตร์",
      program: "หลักสูตรทันตแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "ผลิตทันตแพทย์มืออาชีพ",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 5,
          tpat1: 35,
          amath1: 10, achem: 10, abio: 15, aphy: 10, aeng: 5
        }
      },
      specialReq: ["TPAT1 (กสพท)", "สัมภาษณ์"]
    },
    {
      id: "cu-eng-computer",
      universityId: "cu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูงมาก",
      description: "ออกแบบและพัฒนาระบบคอมพิวเตอร์ ซอฟต์แวร์ และปัญญาประดิษฐ์",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 20,
          amath1: 35, aphy: 20, aeng: 15
        }
      },
      specialReq: ["Portfolio (รอบ 1)"]
    },
    {
      id: "cu-eng-electric",
      universityId: "cu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมไฟฟ้า",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "ออกแบบระบบไฟฟ้าและอิเล็กทรอนิกส์",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 15,
          amath1: 35, aphy: 25, aeng: 15
        }
      },
      specialReq: []
    },
    {
      id: "cu-sci-math",
      universityId: "cu",
      faculty: "วิทยาศาสตร์",
      program: "คณิตศาสตร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "คณิตศาสตร์บริสุทธิ์และประยุกต์",
      criteria: {
        round3: {
          tgat2: 20,
          amath1: 50, aphy: 15, aeng: 15
        }
      },
      specialReq: []
    },
    {
      id: "cu-arts-thai",
      universityId: "cu",
      faculty: "อักษรศาสตร์",
      program: "ภาษาไทย",
      category: "มนุษยศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "ศึกษาภาษา วรรณคดี และวัฒนธรรมไทย",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 15,
          athai: 40, asocial: 10, aeng: 15
        }
      },
      specialReq: []
    },
    {
      id: "cu-arts-eng",
      universityId: "cu",
      faculty: "อักษรศาสตร์",
      program: "ภาษาอังกฤษ",
      category: "มนุษยศาสตร์",
      duration: "4 ปี",
      seats: 65,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "ทักษะภาษาอังกฤษระดับสูง วรรณคดีและการแปล",
      criteria: {
        round3: {
          tgat1: 35, tgat2: 15,
          aeng: 35, athai: 10, asocial: 5
        }
      },
      specialReq: []
    },
    {
      id: "cu-comm",
      universityId: "cu",
      faculty: "นิเทศศาสตร์",
      program: "นิเทศศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 180,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูงมาก",
      description: "สื่อสารมวลชน โฆษณา ประชาสัมพันธ์ ภาพยนตร์",
      criteria: {
        round3: {
          tgat1: 30, tgat2: 20,
          aeng: 25, athai: 15, asocial: 10
        }
      },
      specialReq: ["Portfolio (รอบ 1)"]
    },
    {
      id: "cu-econ",
      universityId: "cu",
      faculty: "เศรษฐศาสตร์",
      program: "เศรษฐศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 220,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "วิเคราะห์ระบบเศรษฐกิจ นโยบายสาธารณะ และการเงิน",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 30, aeng: 20, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "cu-law",
      universityId: "cu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 250,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "สูงมาก",
      description: "กฎหมายและกระบวนการยุติธรรม",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 30,
          athai: 20, asocial: 20, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "cu-arch",
      universityId: "cu",
      faculty: "สถาปัตยกรรมศาสตร์",
      program: "สถาปัตยกรรมศาสตร์",
      category: "สถาปัตยกรรม",
      duration: "5 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูงมาก",
      description: "ออกแบบอาคารและสภาพแวดล้อม",
      criteria: {
        round3: {
          tgat2: 20,
          tpat4: 40,
          amath1: 20, aeng: 10, aphy: 10
        }
      },
      specialReq: ["TPAT4 (สถาปัตยกรรม)", "Portfolio"]
    },

    // ===== มหาวิทยาลัยมหิดล =====
    {
      id: "mu-med-siriraj",
      universityId: "mu",
      faculty: "แพทยศาสตร์ศิริราชพยาบาล",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 292,  // TCAS70: Portfolio 90 (65+20+5) + กสพท 202, per Siriraj's own announcement (source: eduzones.com/2026/07/01/sieduit70)
      rounds: [1, 2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "โรงพยาบาลศิริราช มหาวิทยาลัยมหิดล",
      criteria: {
        round3: {
          tpat1: 30,
          athai: 5, asocial: 5, aeng: 10,
          amath1: 10, aphy: 10, achem: 15, abio: 15
        }
      },
      specialReq: ["TPAT1 (กสพท)", "สัมภาษณ์", "ตรวจร่างกาย"]
    },
    {
      id: "mu-pharma",
      universityId: "mu",
      faculty: "เภสัชศาสตร์",
      program: "หลักสูตรเภสัชศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 3.25,
      competition: "สูง",
      description: "การศึกษาด้านยาและเภสัชกรรม",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           amath1: 10, achem: 20, abio: 15, aeng: 5
        }
      },
      specialReq: []
    },
    {
      id: "mu-nursing",
      universityId: "mu",
      faculty: "พยาบาลศาสตร์",
      program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "บริบาลและดูแลสุขภาพผู้ป่วย",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           ascience: 20, abio: 20, achem: 10, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "mu-sci-biotech",
      universityId: "mu",
      faculty: "วิทยาศาสตร์",
      program: "เทคโนโลยีชีวภาพ",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ชีววิทยาเชิงประยุกต์ด้านการแพทย์และเกษตร",
      criteria: {
        round3: {
          tgat2: 15, tgat1: 10,
          amath1: 15, achem: 25, abio: 25, aphy: 10
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยธรรมศาสตร์ =====
    {
      id: "tu-law",
      universityId: "tu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 600,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "สูง",
      description: "กฎหมายและกระบวนการยุติธรรมแห่งธรรมศาสตร์",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 30,
          athai: 20, asocial: 20, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "tu-econ",
      universityId: "tu",
      faculty: "เศรษฐศาสตร์",
      program: "เศรษฐศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 300,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "สูง",
      description: "เศรษฐศาสตร์การเงิน นโยบายสาธารณะ",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 30, aeng: 20, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "tu-ba",
      universityId: "tu",
      faculty: "พาณิชยศาสตร์และการบัญชี",
      program: "บริหารธุรกิจ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 400,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "สูง",
      description: "การบริหารธุรกิจสมัยใหม่",
      criteria: {
        round3: {
          tgat1: 25, tgat2: 20,
          amath1: 25, aeng: 20, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "tu-acc",
      universityId: "tu",
      faculty: "พาณิชยศาสตร์และการบัญชี",
      program: "การบัญชี",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 200,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "บัญชีและการเงินองค์กร",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 35, aeng: 15, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "tu-poltec",
      universityId: "tu",
      faculty: "รัฐศาสตร์",
      program: "การเมืองการปกครอง",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 250,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "รัฐศาสตร์ การเมืองระหว่างประเทศ ความสัมพันธ์ระหว่างประเทศ",
      criteria: {
        round3: {
          tgat1: 25, tgat2: 25,
          athai: 15, asocial: 25, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "tu-eng-cs",
      universityId: "tu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "วิศวกรรมซอฟต์แวร์และระบบ",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 20,
          amath1: 35, aphy: 20, aeng: 15
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยเกษตรศาสตร์ =====
    {
      id: "ku-agri",
      universityId: "ku",
      faculty: "เกษตร",
      program: "เกษตรศาสตร์",
      category: "เกษตร",
      duration: "4 ปี",
      seats: 200,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "พัฒนาการเกษตรยั่งยืนและเทคโนโลยีการเกษตร",
      criteria: {
        round3: {
          tgat1: 15, tgat2: 15,
          amath1: 20, ascience: 25, abio: 15, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "ku-eng-comp",
      universityId: "ku",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "คอมพิวเตอร์ฮาร์ดแวร์และซอฟต์แวร์",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 20,
          amath1: 35, aphy: 20, aeng: 15
        }
      },
      specialReq: []
    },
    {
      id: "ku-vet",
      universityId: "ku",
      faculty: "สัตวแพทยศาสตร์",
      program: "สัตวแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 3.25,
      competition: "สูง",
      description: "การรักษาและดูแลสัตว์",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
          amath1: 15, achem: 20, abio: 25, aphy: 10, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "ku-econ",
      universityId: "ku",
      faculty: "เศรษฐศาสตร์",
      program: "เศรษฐศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "เศรษฐศาสตร์เกษตรและทรัพยากร",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 30, aeng: 20, asocial: 10
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยเชียงใหม่ =====
    {
      id: "cmu-med",
      universityId: "cmu",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 130,
      rounds: [2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "แพทยศาสตร์ มหาวิทยาลัยเชียงใหม่",
      criteria: {
        round3: {
          tpat1: 30,
          athai: 5, asocial: 5, aeng: 10,
          amath1: 10, aphy: 10, achem: 15, abio: 15
        }
      },
      specialReq: ["TPAT1 (กสพท)", "สัมภาษณ์"]
    },
    {
      id: "cmu-eng-cs",
      universityId: "cmu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 90,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "คอมพิวเตอร์และระบบอัจฉริยะ",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 20,
          amath1: 35, aphy: 20, aeng: 15
        }
      },
      specialReq: []
    },
    {
      id: "cmu-sci-datascience",
      universityId: "cmu",
      faculty: "วิทยาศาสตร์",
      program: "วิทยาการข้อมูล",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "Data Science และ AI",
      criteria: {
        round3: {
          tgat2: 20, tgat1: 10,
          amath1: 40, aphy: 15, aeng: 15
        }
      },
      specialReq: []
    },
    {
      id: "cmu-arts-japanese",
      universityId: "cmu",
      faculty: "มนุษยศาสตร์",
      program: "ภาษาญี่ปุ่น",
      category: "มนุษยศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ภาษาและวัฒนธรรมญี่ปุ่น",
      criteria: {
        round3: {
          tgat1: 30, tgat2: 15,
          ajpn: 35, aeng: 15, athai: 5
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยเชียงใหม่ (เพิ่มเติม) =====
    {
      id: "cmu-bus",
      universityId: "cmu",
      faculty: "บริหารธุรกิจ",
      program: "บริหารธุรกิจ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 200,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "บริหารธุรกิจ การตลาด การเงิน",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 25, aeng: 25, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "cmu-pharma",
      universityId: "cmu",
      faculty: "เภสัชศาสตร์",
      program: "เภสัชศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 3.25,
      competition: "สูง",
      description: "เภสัชศาสตร์คลินิกและเภสัชกรรมชุมชน",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           achem: 25, abio: 20, amath1: 10, aeng: 5
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยขอนแก่น =====
    {
      id: "kku-med",
      universityId: "kku",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 220,
      rounds: [2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "แพทย์เพื่อชุมชน ภาคตะวันออกเฉียงเหนือ",
      criteria: {
        round3: {
          tpat1: 30,
          athai: 5, asocial: 5, aeng: 10,
          amath1: 10, aphy: 10, achem: 15, abio: 15
        }
      },
      specialReq: ["TPAT1 (กสพท)"]
    },
    {
      id: "kku-eng",
      universityId: "kku",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมไฟฟ้า",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 120,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "วิศวกรรมไฟฟ้าและอิเล็กทรอนิกส์",
      criteria: {
        round3: {
          tgat2: 20,
          amath1: 35, aphy: 30, aeng: 15
        }
      },
      specialReq: []
    },
    {
      id: "kku-nurse",
      universityId: "kku",
      faculty: "พยาบาลศาสตร์",
      program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 150,
      rounds: [2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "พยาบาลวิชาชีพ",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           abio: 25, achem: 15, amath1: 10, aeng: 10
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยขอนแก่น (เพิ่มเติม) =====
    {
      id: "kku-law",
      universityId: "kku",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "นิติศาสตร์เพื่อสังคมอีสาน",
      criteria: {
        round3: {
          tgat1: 30, tgat2: 20,
          athai: 20, aeng: 20, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "kku-pharma",
      universityId: "kku",
      faculty: "เภสัชศาสตร์",
      program: "เภสัชศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 80,
      rounds: [2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "เภสัชศาสตร์ ม.ขอนแก่น เพื่อภาคอีสาน",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           achem: 25, abio: 20, amath1: 10, aeng: 5
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยสงขลานครินทร์ =====
    {
      id: "psu-med",
      universityId: "psu",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 180,
      rounds: [2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "แพทย์เพื่อภาคใต้",
      criteria: {
        round3: {
          tpat1: 30,
          athai: 5, asocial: 5, aeng: 10,
          amath1: 10, aphy: 10, achem: 15, abio: 15
        }
      },
      specialReq: ["TPAT1 (กสพท)"]
    },
    {
      id: "psu-eng-comp",
      universityId: "psu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 80,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "วิศวกรรมคอมพิวเตอร์และสารสนเทศ",
      criteria: {
        round3: {
          tgat2: 20,
          amath1: 35, aphy: 25, aeng: 20
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยสงขลานครินทร์ (เพิ่มเติม) =====
    {
      id: "psu-pharma",
      universityId: "psu",
      faculty: "เภสัชศาสตร์",
      program: "เภสัชศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 80,
      rounds: [2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "เภสัชกรภาคใต้ ด้านเภสัชกรรมคลินิก",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           achem: 25, abio: 20, amath1: 10, aeng: 5
        }
      },
      specialReq: []
    },
    {
      id: "psu-nurse",
      universityId: "psu",
      faculty: "พยาบาลศาสตร์",
      program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 120,
      rounds: [2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "พยาบาลวิชาชีพ ปฏิบัติงานในภาคใต้",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           abio: 25, achem: 15, amath1: 10, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "psu-it",
      universityId: "psu",
      faculty: "เทคโนโลยีและสื่อสารการศึกษา",
      program: "เทคโนโลยีสารสนเทศ",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "ระบบสารสนเทศและเทคโนโลยีดิจิทัล",
      criteria: {
        round3: {
          tgat2: 25,
          amath1: 35, aphy: 20, aeng: 20
        }
      },
      specialReq: []
    },
    {
      id: "psu-mgt",
      universityId: "psu",
      faculty: "วิทยาการจัดการ",
      program: "บริหารธุรกิจ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 150,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "บริหารธุรกิจ การตลาด การจัดการ",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 25, aeng: 25, asocial: 10
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยศิลปากร =====
    {
      id: "su-arch",
      universityId: "su",
      faculty: "สถาปัตยกรรมศาสตร์",
      program: "สถาปัตยกรรมศาสตร์",
      category: "สถาปัตยกรรม",
      duration: "5 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูงมาก",
      description: "ออกแบบและวางแผนสภาพแวดล้อม",
      criteria: {
        round3: {
          tgat2: 20,
          tpat4: 40,
          amath1: 20, aphy: 10, aeng: 10
        }
      },
      specialReq: ["TPAT4 (สถาปัตยกรรม)"]
    },
    {
      id: "su-thai-art",
      universityId: "su",
      faculty: "จิตรกรรมประติมากรรมและภาพพิมพ์",
      program: "ศิลปะไทย",
      category: "ศิลปะ",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "ศิลปะไทยดั้งเดิมและร่วมสมัย",
      criteria: {
        round3: {
          tgat1: 15, tgat2: 15,
          tpat2: 50,
          athai: 10, asocial: 10
        }
      },
      specialReq: ["TPAT2 (ศิลปะ)", "Portfolio"]
    },

    // ===== มหาวิทยาลัยศรีนครินทรวิโรฒ =====
    {
      id: "swu-med",
      universityId: "swu",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 64,
      rounds: [2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "แพทยศาสตร์ศรีนครินทรวิโรฒ",
      criteria: {
        round3: {
          tpat1: 30,
          athai: 5, asocial: 5, aeng: 10,
          amath1: 10, aphy: 10, achem: 15, abio: 15
        }
      },
      specialReq: ["TPAT1 (กสพท)"]
    },
    {
      id: "swu-edu",
      universityId: "swu",
      faculty: "ศึกษาศาสตร์",
      program: "การศึกษาปฐมวัย",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูปฐมวัยและการศึกษาเด็กเล็ก",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 15,
          tpat5: 30,
          athai: 15, aeng: 10, asocial: 10
        }
      },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },
    {
      id: "swu-comm",
      universityId: "swu",
      faculty: "วิทยาลัยนวัตกรรมสื่อสารสังคม",
      program: "นวัตกรรมสื่อสารสังคม",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "สื่อดิจิทัล ภาพยนตร์ การผลิตสื่อ",
      criteria: {
        round3: {
          tgat1: 30, tgat2: 20,
          aeng: 25, athai: 15, asocial: 10
        }
      },
      specialReq: ["Portfolio (รอบ 1)"]
    },

    // ===== KMUTT (มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี) =====
    // -- คณะวิศวกรรมศาสตร์ (11 สาขาวิชา) --
    {
      id: "kmutt-eng-chem",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมเคมี",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "กระบวนการเคมีอุตสาหกรรม ออกแบบโรงงาน",
      criteria: { round3: { tgat2: 15, amath1: 25, achem: 35, aphy: 15, aeng: 10 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-civil",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมโยธา",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ออกแบบก่อสร้างโครงสร้างพื้นฐาน สะพาน อาคาร",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 30, aeng: 20 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-comp",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ออกแบบระบบคอมพิวเตอร์ ฮาร์ดแวร์ ซอฟต์แวร์ ฝังตัว",
      criteria: { round3: { tgat2: 20, tpat3: 20, amath1: 25, aphy: 25, achem: 10 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-control",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมระบบควบคุมและเครื่องวัด",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ระบบอัตโนมัติ เซนเซอร์ ควบคุมกระบวนการผลิต",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 35, aeng: 15 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-elect",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมไฟฟ้า",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ระบบไฟฟ้ากำลัง อิเล็กทรอนิกส์กำลัง",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 35, aeng: 15 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-telecom",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมอิเล็กทรอนิกส์และโทรคมนาคม",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "อิเล็กทรอนิกส์ สัญญาณ การสื่อสารไร้สาย 5G",
      criteria: { round3: { tgat2: 15, amath1: 30, aphy: 35, aeng: 20 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-env",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมสิ่งแวดล้อม",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "บำบัดน้ำเสีย จัดการของเสีย สิ่งแวดล้อม",
      criteria: { round3: { tgat2: 15, amath1: 25, achem: 25, abio: 20, aphy: 15 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-mech",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมเครื่องกล",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ออกแบบและผลิตเครื่องจักรกล ยานยนต์ พลังงาน",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 35, aeng: 15 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-prod",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมการผลิต",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ระบบการผลิต การจัดการอุตสาหกรรม",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 30, aeng: 20 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-food",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมอาหาร",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "กระบวนการอาหาร บรรจุภัณฑ์ ความปลอดภัยอาหาร",
      criteria: { round3: { tgat2: 15, amath1: 20, achem: 30, abio: 25, aeng: 10 } },
      specialReq: []
    },
    {
      id: "kmutt-eng-bioeng",
      universityId: "kmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมชีววิทยา",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ชีววิทยาสังเคราะห์ เทคโนโลยีชีวภาพเชิงวิศวกรรม",
      criteria: { round3: { tgat2: 15, amath1: 20, achem: 25, abio: 30, aeng: 10 } },
      specialReq: []
    },
    // -- คณะวิทยาศาสตร์ --
    {
      id: "kmutt-sci-cs",
      universityId: "kmutt",
      faculty: "วิทยาศาสตร์",
      program: "วิทยาการคอมพิวเตอร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "Computer Science อัลกอริทึม AI การวิเคราะห์ข้อมูล",
      criteria: { round3: { tgat2: 25, amath1: 40, aphy: 20, aeng: 15 } },
      specialReq: []
    },
    {
      id: "kmutt-sci-biotech",
      universityId: "kmutt",
      faculty: "วิทยาศาสตร์",
      program: "เทคโนโลยีชีวภาพ",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "Biotechnology นวัตกรรมชีวภาพ พันธุวิศวกรรม",
      criteria: { round3: { tgat2: 15, amath1: 20, achem: 25, abio: 30, aeng: 10 } },
      specialReq: []
    },
    {
      id: "kmutt-sci-chem",
      universityId: "kmutt",
      faculty: "วิทยาศาสตร์",
      program: "เคมี",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "เคมีบริสุทธิ์และประยุกต์ สังเคราะห์สาร",
      criteria: { round3: { tgat2: 15, amath1: 20, achem: 40, aphy: 15, aeng: 10 } },
      specialReq: []
    },
    {
      id: "kmutt-sci-phys",
      universityId: "kmutt",
      faculty: "วิทยาศาสตร์",
      program: "ฟิสิกส์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ฟิสิกส์ทฤษฎีและประยุกต์ นาโนเทคโนโลยี",
      criteria: { round3: { tgat2: 15, amath1: 30, aphy: 40, aeng: 15 } },
      specialReq: []
    },
    // -- คณะเทคโนโลยีสารสนเทศ --
    {
      id: "kmutt-it",
      universityId: "kmutt",
      faculty: "เทคโนโลยีสารสนเทศ",
      program: "เทคโนโลยีสารสนเทศ",
      category: "เทคโนโลยี",
      duration: "4 ปี",
      seats: 17,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "ระบบสารสนเทศ ความมั่นคงไซเบอร์ ซอฟต์แวร์",
      criteria: { round3: { tgat2: 25, amath1: 40, aphy: 20, aeng: 15 } },
      specialReq: []
    },
    // -- คณะสถาปัตยกรรมศาสตร์และการออกแบบ --
    {
      id: "kmutt-arch-main",
      universityId: "kmutt",
      faculty: "สถาปัตยกรรมศาสตร์และการออกแบบ",
      program: "สถาปัตยกรรม",
      category: "สถาปัตยกรรม",
      duration: "5 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ออกแบบอาคาร สภาพแวดล้อม สถาปัตยกรรมยั่งยืน",
      criteria: { round3: { tgat2: 15, tpat4: 35, amath1: 20, aphy: 15, aeng: 15 } },
      specialReq: ["TPAT4 (สถาปัตยกรรม)", "แฟ้มผลงาน"]
    },
    {
      id: "kmutt-arch-ind",
      universityId: "kmutt",
      faculty: "สถาปัตยกรรมศาสตร์และการออกแบบ",
      program: "ออกแบบอุตสาหกรรม",
      category: "สถาปัตยกรรม",
      duration: "4 ปี",
      seats: 25,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "Industrial Design ออกแบบผลิตภัณฑ์และนวัตกรรม",
      criteria: { round3: { tgat2: 15, tpat4: 35, amath1: 20, aphy: 15, aeng: 15 } },
      specialReq: ["TPAT4 (สถาปัตยกรรม)", "แฟ้มผลงาน"]
    },
    {
      id: "kmutt-arch-comm",
      universityId: "kmutt",
      faculty: "สถาปัตยกรรมศาสตร์และการออกแบบ",
      program: "ออกแบบนิเทศศิลป์",
      category: "สถาปัตยกรรม",
      duration: "4 ปี",
      seats: 15,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "สื่อกราฟิก แอนิเมชัน ออกแบบสื่อดิจิทัล",
      criteria: { round3: { tgat1: 10, tgat2: 15, tpat2: 40, aeng: 20, athai: 15 } },
      specialReq: ["TPAT2 (ศิลปะ)", "แฟ้มผลงาน"]
    },
    // -- คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี --
    {
      id: "kmutt-edu-tech",
      universityId: "kmutt",
      faculty: "ครุศาสตร์อุตสาหกรรมและเทคโนโลยี",
      program: "ครุศาสตร์อุตสาหกรรม (วิศวกรรมเครื่องกล)",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 20,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูช่างอุตสาหกรรม เทคนิคศึกษา",
      criteria: { round3: { tgat2: 20, tpat5: 30, amath1: 25, aphy: 25 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },
    // -- สถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO) --
    {
      id: "kmutt-fibo",
      universityId: "kmutt",
      faculty: "สถาบันวิทยาการหุ่นยนต์ภาคสนาม (FIBO)",
      program: "หุ่นยนต์และระบบอัตโนมัติ",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 10,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "Robotics AI ระบบอัตโนมัติอุตสาหกรรม",
      criteria: { round3: { tgat2: 20, tpat3: 20, amath1: 30, aphy: 30 } },
      specialReq: []
    },
    // -- วิทยาลัยสหวิทยาการ --
    {
      id: "kmutt-interdis",
      universityId: "kmutt",
      faculty: "วิทยาลัยสหวิทยาการ",
      program: "นวัตกรรมและการออกแบบ",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 35,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "สหสาขา นวัตกรรม ความคิดสร้างสรรค์",
      criteria: { round3: { tgat1: 25, tgat2: 25, amath1: 25, aeng: 25 } },
      specialReq: []
    },

    // ===== KMITL =====
    {
      id: "kmitl-eng-comp",
      universityId: "kmitl",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 150,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "วิศวกรรมระบบฝังตัวและ IoT",
      criteria: {
        round3: {
          tgat2: 20,
          amath1: 35, aphy: 25, aeng: 20
        }
      },
      specialReq: []
    },
    {
      id: "kmitl-arch",
      universityId: "kmitl",
      faculty: "สถาปัตยกรรมศาสตร์",
      program: "สถาปัตยกรรม",
      category: "สถาปัตยกรรม",
      duration: "5 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "สูง",
      description: "สถาปัตยกรรมและการออกแบบพื้นที่",
      criteria: {
        round3: {
          tgat2: 15,
          tpat4: 40,
          amath1: 20, aphy: 15, aeng: 10
        }
      },
      specialReq: ["TPAT4 (สถาปัตยกรรม)"]
    },
    {
      id: "kmitl-sci-ai",
      universityId: "kmitl",
      faculty: "วิทยาศาสตร์",
      program: "ปัญญาประดิษฐ์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "AI Machine Learning และ Data Science",
      criteria: {
        round3: {
          tgat2: 25,
          amath1: 45, aphy: 15, aeng: 15
        }
      },
      specialReq: []
    },

    // ===== KMITL (เพิ่มเติม) =====
    {
      id: "kmitl-itm",
      universityId: "kmitl",
      faculty: "เทคโนโลยีสารสนเทศ",
      program: "เทคโนโลยีสารสนเทศ",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "IT และระบบสารสนเทศ",
      criteria: {
        round3: {
          tgat2: 25,
          amath1: 35, aphy: 20, aeng: 20
        }
      },
      specialReq: []
    },
    {
      id: "kmitl-design",
      universityId: "kmitl",
      faculty: "สถาปัตยกรรมศาสตร์",
      program: "การออกแบบอุตสาหกรรม",
      category: "สถาปัตยกรรม",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "ออกแบบผลิตภัณฑ์อุตสาหกรรม",
      criteria: {
        round3: {
          tgat2: 10,
          tpat4: 40,
          amath1: 20, aphy: 15, aeng: 15
        }
      },
      specialReq: ["TPAT4 (สถาปัตยกรรม)", "Portfolio"]
    },

    // ===== มหาวิทยาลัยนเรศวร =====
    {
      id: "nu-pharma",
      universityId: "nu",
      faculty: "เภสัชศาสตร์",
      program: "เภสัชศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "เภสัชศาสตร์ มหาวิทยาลัยนเรศวร",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           achem: 25, abio: 20, amath1: 10
        }
      },
      specialReq: []
    },
    {
      id: "nu-eng",
      universityId: "nu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมไฟฟ้าและคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 100,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "วิศวกรรมไฟฟ้าและอิเล็กทรอนิกส์",
      criteria: {
        round3: {
          tgat2: 20,
          amath1: 35, aphy: 30, aeng: 15
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยนเรศวร (เพิ่มเติม) =====
    {
      id: "nu-med",
      universityId: "nu",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 150,
      rounds: [2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "แพทยศาสตร์ มหาวิทยาลัยนเรศวร",
      criteria: {
        round3: {
          tpat1: 30,
          athai: 5, asocial: 5, aeng: 10,
          amath1: 10, aphy: 10, achem: 15, abio: 15
        }
      },
      specialReq: ["TPAT1 (กสพท)", "สัมภาษณ์"]
    },
    {
      id: "nu-nurse",
      universityId: "nu",
      faculty: "พยาบาลศาสตร์",
      program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 120,
      rounds: [2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "พยาบาลวิชาชีพเพื่อภาคเหนือตอนล่าง",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           abio: 25, achem: 15, amath1: 10, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "nu-biz",
      universityId: "nu",
      faculty: "บริหารธุรกิจ เศรษฐศาสตร์และการสื่อสาร",
      program: "บริหารธุรกิจ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 150,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "การบริหารธุรกิจสมัยใหม่",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 25, aeng: 25, asocial: 10
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยแม่ฟ้าหลวง =====
    {
      id: "mfu-cs",
      universityId: "mfu",
      faculty: "เทคโนโลยีสารสนเทศ",
      program: "วิทยาการคอมพิวเตอร์และนวัตกรรม",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "IT และนวัตกรรมดิจิทัล",
      criteria: {
        round3: {
          tgat2: 20,
          amath1: 40, aphy: 20, aeng: 20
        }
      },
      specialReq: []
    },
    {
      id: "mfu-law",
      universityId: "mfu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "นิติศาสตร์เพื่อการพัฒนาอนุภูมิภาค",
      criteria: {
        round3: {
          tgat1: 25, tgat2: 25,
          athai: 20, aeng: 20, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "mfu-cosmet",
      universityId: "mfu",
      faculty: "วิทยาศาสตร์เครื่องสำอาง",
      program: "วิทยาศาสตร์เครื่องสำอาง",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "เครื่องสำอางและความงาม เอกลักษณ์ของ MFU",
      criteria: {
        round3: {
          tgat1: 15, tgat2: 15,
          achem: 30, abio: 25, amath1: 15
        }
      },
      specialReq: []
    },

    // ===== มหาวิทยาลัยรามคำแหง (programs) =====
    {
      id: "ru-law",
      universityId: "ru",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 1000,
      rounds: [2, 3, 4],
      minGPA: 2.00,
      competition: "ต่ำ",
      description: "ระบบตลาดวิชา เรียนได้ทุกคน ไม่จำกัดอายุ",
      criteria: { round3: { tgat1: 25, tgat2: 35, athai: 20, asocial: 20 } },
      specialReq: []
    },
    {
      id: "ru-pol",
      universityId: "ru",
      faculty: "รัฐศาสตร์",
      program: "รัฐศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 800,
      rounds: [2, 3, 4],
      minGPA: 2.00,
      competition: "ต่ำ",
      description: "การเมือง ปกครอง และความสัมพันธ์ระหว่างประเทศ",
      criteria: { round3: { tgat1: 20, tgat2: 30, athai: 20, asocial: 30 } },
      specialReq: []
    },
    {
      id: "ru-ba",
      universityId: "ru",
      faculty: "บริหารธุรกิจ",
      program: "บริหารธุรกิจบัณฑิต",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 800,
      rounds: [2, 3, 4],
      minGPA: 2.00,
      competition: "ต่ำ",
      description: "บริหารธุรกิจ การตลาด การเงิน",
      criteria: { round3: { tgat1: 25, tgat2: 25, amath1: 25, aeng: 15, asocial: 10 } },
      specialReq: []
    },

    // ===== มหาวิทยาลัยศิลปากร (programs เพิ่มเติม) =====
    {
      id: "su-finearts",
      universityId: "su",
      faculty: "จิตรกรรม ประติมากรรมและภาพพิมพ์",
      program: "จิตรกรรม",
      category: "ศิลปะ",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "ศิลปะบริสุทธิ์ จิตรกรรมสมัยใหม่",
      criteria: { round3: { tgat1: 10, tgat2: 10, tpat2: 60, aeng: 10, athai: 10 } },
      specialReq: ["TPAT2 (ศิลปะ)", "แฟ้มผลงาน"]
    },
    {
      id: "su-music",
      universityId: "su",
      faculty: "ดุริยางคศาสตร์",
      program: "ดุริยางคศาสตร์ตะวันตก",
      category: "ศิลปะ",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "ดนตรีคลาสสิก แจ๊ส และร่วมสมัย",
      criteria: { round3: { tgat1: 10, tgat2: 10, tpat2: 60, aeng: 10, athai: 10 } },
      specialReq: ["TPAT2 (ศิลปะ)", "ทดสอบปฏิบัติ"]
    },
    {
      id: "su-thai-music",
      universityId: "su",
      faculty: "ดุริยางคศาสตร์",
      program: "ดุริยางคศาสตร์ไทย",
      category: "ศิลปะ",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "ดนตรีไทย วงปี่พาทย์ เครื่องสาย",
      criteria: { round3: { tgat1: 10, tgat2: 10, tpat2: 60, athai: 15, asocial: 5 } },
      specialReq: ["TPAT2 (ศิลปะ)", "ทดสอบปฏิบัติ"]
    },

    // ===== มหาวิทยาลัยศรีนครินทรวิโรฒ (programs เพิ่มเติม) =====
    {
      id: "swu-edu-special",
      universityId: "swu",
      faculty: "ศึกษาศาสตร์",
      program: "การศึกษาพิเศษ",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ครูการศึกษาพิเศษ เด็กที่มีความต้องการพิเศษ",
      criteria: { round3: { tgat1: 20, tgat2: 20, tpat5: 30, athai: 20, aeng: 10 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },
    {
      id: "swu-psych",
      universityId: "swu",
      faculty: "สังคมศาสตร์",
      program: "จิตวิทยา",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "จิตวิทยาการปรึกษา คลินิก และชุมชน",
      criteria: { round3: { tgat1: 20, tgat2: 25, ascience: 15, athai: 20, aeng: 20 } },
      specialReq: []
    },

    // ===== KMUTNB =====
    {
      id: "kmutnb-eng-ele",
      universityId: "kmutnb",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมไฟฟ้า",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "วิศวกรรมไฟฟ้าและระบบควบคุม",
      criteria: { round3: { tgat2: 20, amath1: 35, aphy: 25, aeng: 20 } },
      specialReq: []
    },
    {
      id: "kmutnb-eng-mech",
      universityId: "kmutnb",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมเครื่องกล",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "เครื่องยนต์ ระบบความร้อน การผลิต",
      criteria: { round3: { tgat2: 20, amath1: 30, aphy: 30, aeng: 20 } },
      specialReq: []
    },
    {
      id: "kmutnb-it",
      universityId: "kmutnb",
      faculty: "เทคโนโลยีสารสนเทศ",
      program: "วิทยาการคอมพิวเตอร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "AI, Data Science, Software Engineering",
      criteria: { round3: { tgat2: 20, amath1: 40, aphy: 20, aeng: 20 } },
      specialReq: []
    },

    // ===== มหาวิทยาลัยมหาสารคาม =====
    {
      id: "msu-med",
      universityId: "msu",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 48,
      rounds: [2, 3],
      minGPA: 3.25,
      competition: "สูง",
      description: "แพทยศาสตร์ มหาวิทยาลัยมหาสารคาม",
      criteria: { round3: { tpat1: 30, athai: 5, asocial: 5, aeng: 10, amath1: 10, aphy: 10, achem: 15, abio: 15 } },
      specialReq: ["TPAT1 (กสพท)"]
    },
    {
      id: "msu-pharma",
      universityId: "msu",
      faculty: "เภสัชศาสตร์",
      program: "หลักสูตรเภสัชศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "เภสัชกรรมชุมชนและอุตสาหกรรมยา",
      criteria: { round3: { tgat1: 10, tgat2: 10, achem: 20, abio: 20, aeng: 15 } },
      specialReq: []
    },
    {
      id: "msu-law",
      universityId: "msu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 150,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "กฎหมายและกระบวนการยุติธรรมอีสาน",
      criteria: { round3: { tgat1: 20, tgat2: 30, athai: 20, asocial: 20, aeng: 10 } },
      specialReq: []
    },
    {
      id: "msu-edu",
      universityId: "msu",
      faculty: "ศึกษาศาสตร์",
      program: "การสอนภาษาไทย",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูภาษาไทยระดับมัธยมศึกษา",
      criteria: { round3: { tgat1: 15, tgat2: 20, tpat5: 30, athai: 25, aeng: 10 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },

    // ===== มหาวิทยาลัยอุบลราชธานี =====
    {
      id: "ubu-pharma",
      universityId: "ubu",
      faculty: "เภสัชศาสตร์",
      program: "หลักสูตรเภสัชศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "เภสัชกรรมมหาวิทยาลัยอุบลราชธานี",
      criteria: { round3: { tgat1: 10, tgat2: 10, achem: 20, abio: 20, aeng: 15 } },
      specialReq: []
    },
    {
      id: "ubu-eng",
      universityId: "ubu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "วิศวกรรมซอฟต์แวร์และระบบฝังตัว",
      criteria: { round3: { tgat2: 20, amath1: 40, aphy: 20, aeng: 20 } },
      specialReq: []
    },
    {
      id: "ubu-law",
      universityId: "ubu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 120,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "นิติศาสตร์มหาวิทยาลัยอุบลราชธานี",
      criteria: { round3: { tgat1: 20, tgat2: 30, athai: 20, asocial: 20, aeng: 10 } },
      specialReq: []
    },

    // ===== มหาวิทยาลัยวลัยลักษณ์ =====
    {
      id: "wu-med",
      universityId: "wu",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 32,
      rounds: [2, 3],
      minGPA: 3.25,
      competition: "สูง",
      description: "แพทยศาสตร์ มหาวิทยาลัยวลัยลักษณ์ ภาคใต้",
      criteria: { round3: { tpat1: 30, athai: 5, asocial: 5, aeng: 10, amath1: 10, aphy: 10, achem: 15, abio: 15 } },
      specialReq: ["TPAT1 (กสพท)"]
    },
    {
      id: "wu-nursing",
      universityId: "wu",
      faculty: "พยาบาลศาสตร์",
      program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 80,
      rounds: [2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "พยาบาลวิชาชีพ ดูแลผู้ป่วยทุกช่วงวัย",
      criteria: { round3: { tgat1: 15, tgat2: 15, ascience: 20, abio: 20, aeng: 10 } },
      specialReq: []
    },
    {
      id: "wu-it",
      universityId: "wu",
      faculty: "สารสนเทศศาสตร์",
      program: "เทคโนโลยีสารสนเทศ",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "IT, Data Analytics, Cybersecurity",
      criteria: { round3: { tgat2: 20, amath1: 40, ascience: 20, aeng: 20 } },
      specialReq: []
    },

    // ===== RMUTT =====
    {
      id: "rmutt-eng-ind",
      universityId: "rmutt",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมอุตสาหการ",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 100,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "การผลิตและระบบอุตสาหกรรม",
      criteria: { round3: { tgat2: 20, amath1: 35, aphy: 25, aeng: 20 } },
      specialReq: []
    },
    {
      id: "rmutt-textile",
      universityId: "rmutt",
      faculty: "เทคโนโลยีคหกรรมศาสตร์",
      program: "ออกแบบแฟชั่นและนิตเวียร์",
      category: "ศิลปะ",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "ออกแบบแฟชั่น สิ่งทอ และเครื่องแต่งกาย",
      criteria: { round3: { tgat1: 15, tgat2: 15, tpat2: 40, aeng: 15, athai: 15 } },
      specialReq: ["TPAT2 (ศิลปะ)"]
    },
    {
      id: "rmutt-cs",
      universityId: "rmutt",
      faculty: "วิทยาศาสตร์และเทคโนโลยี",
      program: "วิทยาการคอมพิวเตอร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "การพัฒนาซอฟต์แวร์และระบบ",
      criteria: { round3: { tgat2: 20, amath1: 40, ascience: 20, aeng: 20 } },
      specialReq: []
    },

    // ===== RMUTP =====
    {
      id: "rmutp-bus",
      universityId: "rmutp",
      faculty: "บริหารธุรกิจ",
      program: "การตลาด",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 120,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "การตลาดดิจิทัลและการค้าออนไลน์",
      criteria: { round3: { tgat1: 25, tgat2: 20, amath1: 20, aeng: 20, asocial: 15 } },
      specialReq: []
    },
    {
      id: "rmutp-arch",
      universityId: "rmutp",
      faculty: "สถาปัตยกรรมศาสตร์",
      program: "สถาปัตยกรรมภายใน",
      category: "สถาปัตยกรรม",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ออกแบบตกแต่งภายในและพื้นที่อยู่อาศัย",
      criteria: { round3: { tgat2: 20, tpat4: 40, amath1: 20, aeng: 10, aphy: 10 } },
      specialReq: ["TPAT4 (สถาปัตยกรรม)"]
    },

    // ===== RMUTP (เพิ่มเติม) =====
    {
      id: "rmutp-cs",
      universityId: "rmutp",
      faculty: "เทคโนโลยีสารสนเทศและนวัตกรรม",
      program: "วิทยาการคอมพิวเตอร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.25,
      competition: "ต่ำ",
      description: "คอมพิวเตอร์และนวัตกรรมดิจิทัล",
      criteria: {
        round3: {
          tgat2: 25,
          amath1: 35, ascience: 20, aeng: 20
        }
      },
      specialReq: []
    },
    {
      id: "rmutp-eng-civil",
      universityId: "rmutp",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมโยธา",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.25,
      competition: "ต่ำ",
      description: "ออกแบบและก่อสร้างโครงสร้างพื้นฐาน",
      criteria: {
        round3: {
          tgat2: 20,
          amath1: 35, aphy: 30, aeng: 15
        }
      },
      specialReq: []
    },

    // ===== RSU (รังสิต) =====
    {
      id: "rsu-med",
      universityId: "rsu",
      faculty: "แพทยศาสตร์",
      program: "หลักสูตรแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 3.25,
      competition: "สูง",
      description: "มหาวิทยาลัยรังสิต ร่วมกับโรงพยาบาลราษฎร์บูรณะ",
      criteria: { round3: { tpat1: 30, athai: 5, asocial: 5, aeng: 10, amath1: 10, aphy: 10, achem: 15, abio: 15 } },
      specialReq: ["TPAT1 (กสพท)"]
    },
    {
      id: "rsu-pharma",
      universityId: "rsu",
      faculty: "เภสัชศาสตร์",
      program: "หลักสูตรเภสัชศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "ปานกลาง",
      description: "เภสัชกรรม มหาวิทยาลัยรังสิต",
      criteria: { round3: { tgat1: 10, tgat2: 10, achem: 20, abio: 20, aeng: 15 } },
      specialReq: []
    },
    {
      id: "rsu-design",
      universityId: "rsu",
      faculty: "ศิลปะและการออกแบบ",
      program: "ออกแบบดิจิทัล",
      category: "ศิลปะ",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "UI/UX, Motion Graphics, Digital Media",
      criteria: { round3: { tgat1: 15, tgat2: 15, tpat2: 40, aeng: 20, athai: 10 } },
      specialReq: ["Portfolio"]
    },
    {
      id: "rsu-comm",
      universityId: "rsu",
      faculty: "นิเทศศาสตร์",
      program: "ภาพยนตร์และสื่อดิจิทัล",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "ผลิตภาพยนตร์ สื่อใหม่ และดิจิทัลคอนเทนต์",
      criteria: { round3: { tgat1: 25, tgat2: 20, tpat2: 25, aeng: 20, athai: 10 } },
      specialReq: ["Portfolio"]
    },
    {
      id: "rsu-law",
      universityId: "rsu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 200,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "นิติศาสตร์ กฎหมายธุรกิจและระหว่างประเทศ",
      criteria: { round3: { tgat1: 20, tgat2: 30, athai: 20, asocial: 20, aeng: 10 } },
      specialReq: []
    },

    // ===== มหาวิทยาลัยกรุงเทพ (BU2) =====
    {
      id: "bu2-comm",
      universityId: "bu2",
      faculty: "นิเทศศาสตร์",
      program: "โฆษณาและการสื่อสารแบรนด์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "Creative Advertising และ Brand Communication",
      criteria: { round3: { tgat1: 30, tgat2: 20, tpat2: 20, aeng: 20, athai: 10 } },
      specialReq: ["Portfolio"]
    },
    {
      id: "bu2-film",
      universityId: "bu2",
      faculty: "นิเทศศาสตร์",
      program: "ภาพยนตร์",
      category: "ศิลปะ",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "กำกับ ถ่ายทำ ตัดต่อภาพยนตร์",
      criteria: { round3: { tgat1: 20, tgat2: 20, tpat2: 30, aeng: 20, athai: 10 } },
      specialReq: ["Portfolio"]
    },
    {
      id: "bu2-ba",
      universityId: "bu2",
      faculty: "บริหารธุรกิจ",
      program: "การเป็นผู้ประกอบการ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "Entrepreneurship และ Startup Ecosystem",
      criteria: { round3: { tgat1: 25, tgat2: 25, amath1: 20, aeng: 20, asocial: 10 } },
      specialReq: []
    },
    {
      id: "bu2-design",
      universityId: "bu2",
      faculty: "ศิลปกรรมศาสตร์",
      program: "ออกแบบนิเทศศิลป์",
      category: "ศิลปะ",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "Graphic Design, Illustration, Branding",
      criteria: { round3: { tgat1: 15, tgat2: 15, tpat2: 40, aeng: 20, athai: 10 } },
      specialReq: ["Portfolio"]
    },

    // ===== มหาวิทยาลัยศรีปทุม (SPU) =====
    {
      id: "spu-law",
      universityId: "spu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 200,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "กฎหมายธุรกิจ นิติวิทยาศาสตร์ และอาชญาวิทยา",
      criteria: { round3: { tgat1: 20, tgat2: 30, athai: 20, asocial: 20, aeng: 10 } },
      specialReq: []
    },
    {
      id: "spu-aviation",
      universityId: "spu",
      faculty: "ดิจิทัลมีเดีย",
      program: "การออกแบบเกม",
      category: "เทคโนโลยี",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "Game Design, Development และ Animation",
      criteria: { round3: { tgat2: 20, amath1: 30, ascience: 20, aeng: 20, tpat2: 10 } },
      specialReq: []
    },
    {
      id: "spu-acc",
      universityId: "spu",
      faculty: "บัญชี",
      program: "การบัญชี",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 150,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "บัญชีการเงิน ตรวจสอบบัญชี ภาษีอากร",
      criteria: { round3: { tgat1: 15, tgat2: 20, amath1: 40, aeng: 15, asocial: 10 } },
      specialReq: []
    },

    // ===== มหาวิทยาลัยธุรกิจบัณฑิตย์ (DPU) =====
    {
      id: "dpu-law",
      universityId: "dpu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 300,
      rounds: [1, 2, 3],
      minGPA: 2.00,
      competition: "ต่ำ",
      description: "กฎหมายธุรกิจและอาชญากรรมทางเทคโนโลยี",
      criteria: { round3: { tgat1: 20, tgat2: 30, athai: 20, asocial: 20, aeng: 10 } },
      specialReq: []
    },
    {
      id: "dpu-innovation",
      universityId: "dpu",
      faculty: "นวัตกรรมดิจิทัล",
      program: "เทคโนโลยีสารสนเทศ",
      category: "เทคโนโลยี",
      duration: "4 ปі",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "IoT, AI, Data Science, Cloud Computing",
      criteria: { round3: { tgat2: 20, amath1: 40, ascience: 20, aeng: 20 } },
      specialReq: []
    },
    {
      id: "dpu-ba",
      universityId: "dpu",
      faculty: "บริหารธุรกิจ",
      program: "การจัดการธุรกิจระหว่างประเทศ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 150,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "International Business Management",
      criteria: { round3: { tgat1: 25, tgat2: 20, amath1: 20, aeng: 25, asocial: 10 } },
      specialReq: []
    },

    // ===== ABAC =====
    {
      id: "abac-ba",
      universityId: "abac",
      faculty: "บริหารธุรกิจ",
      program: "บริหารธุรกิจ (International)",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 200,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "เรียนเป็นภาษาอังกฤษ บริหารธุรกิจระหว่างประเทศ",
      criteria: { round3: { tgat1: 30, tgat2: 20, amath1: 20, aeng: 25, asocial: 5 } },
      specialReq: []
    },
    {
      id: "abac-comm",
      universityId: "abac",
      faculty: "นิเทศศาสตร์",
      program: "สื่อสารองค์กร (International)",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "Corporate Communication ภาษาอังกฤษ",
      criteria: { round3: { tgat1: 35, tgat2: 20, aeng: 30, athai: 10, asocial: 5 } },
      specialReq: []
    },
    {
      id: "abac-law",
      universityId: "abac",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตร์ (International)",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "กฎหมายระหว่างประเทศและธุรกิจ",
      criteria: { round3: { tgat1: 25, tgat2: 25, aeng: 25, athai: 15, asocial: 10 } },
      specialReq: []
    },

    // ===== UTCC (หอการค้า) =====
    {
      id: "utcc-ba",
      universityId: "utcc",
      faculty: "บริหารธุรกิจ",
      program: "การตลาด",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 200,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "การตลาดสมัยใหม่ Digital Marketing",
      criteria: { round3: { tgat1: 25, tgat2: 20, amath1: 20, aeng: 20, asocial: 15 } },
      specialReq: []
    },
    {
      id: "utcc-econ",
      universityId: "utcc",
      faculty: "เศรษฐศาสตร์",
      program: "เศรษฐศาสตรบัณฑิต",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 150,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "เศรษฐศาสตร์ธุรกิจและการพาณิชย์",
      criteria: { round3: { tgat1: 20, tgat2: 20, amath1: 30, aeng: 20, asocial: 10 } },
      specialReq: []
    },
    {
      id: "utcc-acc",
      universityId: "utcc",
      faculty: "บัญชี",
      program: "การบัญชี",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 200,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "บัญชีการเงิน ตรวจสอบบัญชี และภาษีอากร",
      criteria: { round3: { tgat1: 15, tgat2: 20, amath1: 40, aeng: 15, asocial: 10 } },
      specialReq: []
    },
    {
      id: "utcc-tourism",
      universityId: "utcc",
      faculty: "การท่องเที่ยวและโรงแรม",
      program: "การจัดการการท่องเที่ยว",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "การท่องเที่ยว โรงแรม และการบิน",
      criteria: { round3: { tgat1: 30, tgat2: 20, aeng: 30, athai: 10, asocial: 10 } },
      specialReq: []
    },

    // ===== ราชภัฏมหาสารคาม =====
    {
      id: "kku2-edu",
      universityId: "kku2",
      faculty: "ครุศาสตร์",
      program: "การสอนคณิตศาสตร์",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูคณิตศาสตร์ระดับมัธยมศึกษา",
      criteria: { round3: { tgat1: 15, tgat2: 20, tpat5: 30, amath1: 25, aeng: 10 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },
    {
      id: "kku2-sc-edu",
      universityId: "kku2",
      faculty: "ครุศาสตร์",
      program: "การสอนวิทยาศาสตร์",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูวิทยาศาสตร์ระดับมัธยมศึกษา",
      criteria: { round3: { tgat1: 15, tgat2: 20, tpat5: 25, ascience: 25, aeng: 15 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },

    // ===== ราชภัฏมหาสารคาม (เพิ่มเติม) =====
    {
      id: "kku2-biz",
      universityId: "kku2",
      faculty: "บริหารธุรกิจ",
      program: "การบริหารธุรกิจ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 2.00,
      competition: "ต่ำ",
      description: "บริหารธุรกิจและการจัดการ",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 25, aeng: 25, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "kku2-sci",
      universityId: "kku2",
      faculty: "วิทยาศาสตร์และเทคโนโลยี",
      program: "วิทยาการคอมพิวเตอร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.00,
      competition: "ต่ำ",
      description: "คอมพิวเตอร์และเทคโนโลยีสารสนเทศ",
      criteria: {
        round3: {
          tgat2: 25,
          amath1: 40, ascience: 20, aeng: 15
        }
      },
      specialReq: []
    },

    // ===== ราชภัฏบุรีรัมย์ =====
    {
      id: "bru-edu",
      universityId: "bru",
      faculty: "ครุศาสตร์",
      program: "การศึกษาปฐมวัย",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูปฐมวัย พัฒนาการเด็กและการเรียนรู้",
      criteria: { round3: { tgat1: 15, tgat2: 20, tpat5: 30, athai: 20, aeng: 15 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },
    {
      id: "bru-cs",
      universityId: "bru",
      faculty: "วิทยาศาสตร์",
      program: "วิทยาการคอมพิวเตอร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 2.00,
      competition: "ต่ำ",
      description: "คอมพิวเตอร์และเทคโนโลยีสารสนเทศ",
      criteria: { round3: { tgat2: 20, amath1: 40, ascience: 20, aeng: 20 } },
      specialReq: []
    },

    // ===== มหาวิทยาลัยบูรพา =====
    {
      id: "bu-nurse",
      universityId: "bu",
      faculty: "พยาบาลศาสตร์",
      program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 100,
      rounds: [2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "พยาบาลวิชาชีพ ภาคตะวันออก",
      criteria: {
        round3: {
          tgat1: 10, tgat2: 10,
           abio: 25, achem: 15, amath1: 10, aeng: 10
        }
      },
      specialReq: []
    },
    {
      id: "bu-mgt",
      universityId: "bu",
      faculty: "การจัดการและการท่องเที่ยว",
      program: "การจัดการ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 120,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "การจัดการธุรกิจและการท่องเที่ยวภาคตะวันออก",
      criteria: {
        round3: {
          tgat1: 20, tgat2: 20,
          amath1: 25, aeng: 25, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "bu-logistics",
      universityId: "bu",
      faculty: "โลจิสติกส์",
      program: "การจัดการโลจิสติกส์",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "โลจิสติกส์ ซัพพลายเชน ท่าเรือและอุตสาหกรรม",
      criteria: {
        round3: {
          tgat1: 15, tgat2: 25,
          amath1: 30, aeng: 20, asocial: 10
        }
      },
      specialReq: []
    },
    {
      id: "bu-eng-ind",
      universityId: "bu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมอุตสาหการ",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 80,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "วิศวกรรมการผลิตและอุตสาหกรรม",
      criteria: {
        round3: {
          tgat2: 20,
          amath1: 35, aphy: 25, aeng: 20
        }
      },
      specialReq: []
    },
    {
      id: "bu-marine",
      universityId: "bu",
      faculty: "วิทยาศาสตร์ทางทะเล",
      program: "วิทยาศาสตร์ทางทะเล",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "ทรัพยากรทางทะเลและชายฝั่ง",
      criteria: { round3: { tgat1: 10, tgat2: 15, amath1: 20, ascience: 25, abio: 20, aeng: 10 } },
      specialReq: []
    },

    // ===== CMU เพิ่มเติม =====
    {
      id: "cmu-eng-civil",
      universityId: "cmu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมโยธา",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 20,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "โครงสร้างพื้นฐาน ถนน สะพาน ระบบน้ำ",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 30, aeng: 20 } },
      specialReq: []
    },
    {
      id: "cmu-eng-mech",
      universityId: "cmu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมเครื่องกล",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 10,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "เครื่องจักร ยานยนต์ พลังงาน เทอร์โมไดนามิกส์",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 35, aeng: 15 } },
      specialReq: []
    },
    {
      id: "cmu-eng-elec",
      universityId: "cmu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมไฟฟ้า",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 10,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ระบบไฟฟ้า อิเล็กทรอนิกส์ โทรคมนาคม",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 35, aeng: 15 } },
      specialReq: []
    },
    {
      id: "cmu-eng-ind",
      universityId: "cmu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมอุตสาหการ",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ระบบการผลิต โลจิสติกส์ คุณภาพ",
      criteria: { round3: { tgat2: 20, amath1: 35, aphy: 25, aeng: 20 } },
      specialReq: []
    },
    {
      id: "cmu-eng-robot",
      universityId: "cmu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมหุ่นยนต์และ AI",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 20,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "Robotics ปัญญาประดิษฐ์ ระบบควบคุม",
      criteria: { round3: { tgat2: 20, amath1: 35, aphy: 30, aeng: 15 } },
      specialReq: []
    },
    {
      id: "cmu-law",
      universityId: "cmu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "กฎหมายไทย กฎหมายเอกชน นิติบัญญัติ",
      criteria: { round3: { tgat1: 30, tgat2: 30, asocial: 25, athai: 15 } },
      specialReq: []
    },
    {
      id: "cmu-nursing",
      universityId: "cmu",
      faculty: "พยาบาลศาสตร์",
      program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "พยาบาลวิชาชีพ ภาคเหนือ มหาวิทยาลัยเชียงใหม่",
      criteria: { round3: { tgat1: 15, tgat2: 10, abio: 20, achem: 15, amath1: 10, aeng: 5 } },
      specialReq: []
    },
    {
      id: "cmu-edu",
      universityId: "cmu",
      faculty: "ศึกษาศาสตร์",
      program: "การสอนภาษาไทย",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูภาษาไทย การสอนระดับมัธยมศึกษา",
      criteria: { round3: { tgat1: 20, tgat2: 15, tpat5: 30, athai: 25, aeng: 10 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },
    {
      id: "cmu-sci-math",
      universityId: "cmu",
      faculty: "วิทยาศาสตร์",
      program: "คณิตศาสตร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "คณิตศาสตร์บริสุทธิ์และประยุกต์",
      criteria: { round3: { tgat2: 20, amath1: 55, aphy: 15, aeng: 10 } },
      specialReq: []
    },
    {
      id: "cmu-social",
      universityId: "cmu",
      faculty: "สังคมศาสตร์",
      program: "รัฐศาสตร์และรัฐประศาสนศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "การเมืองการปกครอง นโยบายสาธารณะ ภาคเหนือ",
      criteria: { round3: { tgat1: 25, tgat2: 25, asocial: 30, aeng: 20 } },
      specialReq: []
    },

    // ===== มหิดล เพิ่มเติม =====
    {
      id: "mu-dental",
      universityId: "mu",
      faculty: "ทันตแพทยศาสตร์",
      program: "หลักสูตรทันตแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "ทันตแพทย์วิชาชีพ มหิดล ศิริราช",
      criteria: { round3: { tpat1: 30, athai: 5, asocial: 5, aeng: 10, amath1: 10, aphy: 10, achem: 15, abio: 15 } },
      specialReq: ["TPAT1 (กสพท)", "สัมภาษณ์"]
    },
    {
      id: "mu-phys-therapy",
      universityId: "mu",
      faculty: "กายภาพบำบัด",
      program: "กายภาพบำบัด",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "บำบัดฟื้นฟูสมรรถภาพร่างกาย",
      criteria: { round3: { tgat1: 10, tgat2: 10, abio: 25, achem: 15, amath1: 10, aeng: 10 } },
      specialReq: []
    },
    {
      id: "mu-med-tech",
      universityId: "mu",
      faculty: "เทคนิคการแพทย์",
      program: "เทคนิคการแพทย์",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "วิเคราะห์ทางห้องปฏิบัติการ วินิจฉัยโรค",
      criteria: { round3: { tgat1: 10, tgat2: 10, abio: 25, achem: 20, amath1: 10, aeng: 5 } },
      specialReq: []
    },
    {
      id: "mu-eng-biomedical",
      universityId: "mu",
      faculty: "วิศวกรรมศาสตร์และเทคโนโลยี",
      program: "วิศวกรรมชีวการแพทย์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "อุปกรณ์การแพทย์ AI วินิจฉัยโรค",
      criteria: { round3: { tgat2: 15, amath1: 30, aphy: 25, achem: 15, abio: 15 } },
      specialReq: []
    },
    {
      id: "mu-public-health",
      universityId: "mu",
      faculty: "สาธารณสุขศาสตร์",
      program: "สาธารณสุขศาสตร์",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 100,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "สุขภาพชุมชน อนามัยสิ่งแวดล้อม ระบาดวิทยา",
      criteria: { round3: { tgat1: 15, tgat2: 15, abio: 20, achem: 15, amath1: 10, aeng: 5 } },
      specialReq: []
    },

    // ===== ธรรมศาสตร์ เพิ่มเติม =====
    {
      id: "tu-comm",
      universityId: "tu",
      faculty: "วารสารศาสตร์และสื่อสารมวลชน",
      program: "วารสารศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "สื่อมวลชน วารสาร ดิจิทัลมีเดีย",
      criteria: { round3: { tgat1: 10, tgat2: 15, amath2: 20, aeng: 25, asocial: 15, athai: 15 } },
      specialReq: []
    },
    {
      id: "tu-nursing",
      universityId: "tu",
      faculty: "พยาบาลศาสตร์",
      program: "หลักสูตรพยาบาลศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 3.00,
      competition: "สูง",
      description: "พยาบาลวิชาชีพ มหาวิทยาลัยธรรมศาสตร์",
      criteria: { round3: { tgat1: 15, tgat2: 10, abio: 20, achem: 15, amath1: 10, aeng: 5 } },
      specialReq: []
    },
    {
      id: "tu-arch",
      universityId: "tu",
      faculty: "สถาปัตยกรรมและการผังเมือง",
      program: "สถาปัตยกรรม",
      category: "สถาปัตยกรรม",
      duration: "5 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "สถาปัตยกรรมร่วมสมัย ผังเมือง",
      criteria: { round3: { tgat2: 15, tpat4: 35, amath1: 20, aphy: 15, aeng: 15 } },
      specialReq: ["TPAT4 (สถาปัตยกรรม)", "แฟ้มผลงาน"]
    },
    {
      id: "tu-sci-cs",
      universityId: "tu",
      faculty: "วิทยาศาสตร์และเทคโนโลยี",
      program: "วิทยาการคอมพิวเตอร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "Computer Science AI Data Science",
      criteria: { round3: { tgat2: 20, amath1: 45, aphy: 20, aeng: 15 } },
      specialReq: []
    },
    {
      id: "tu-soc-work",
      universityId: "tu",
      faculty: "สังคมสงเคราะห์ศาสตร์",
      program: "สังคมสงเคราะห์ศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ต่ำ",
      description: "งานสังคมสงเคราะห์ สวัสดิการสังคม",
      criteria: { round3: { tgat1: 25, tgat2: 25, asocial: 30, athai: 20 } },
      specialReq: []
    },

    // ===== เกษตรศาสตร์ เพิ่มเติม =====
    {
      id: "ku-sci-cs",
      universityId: "ku",
      faculty: "วิทยาศาสตร์",
      program: "วิทยาการคอมพิวเตอร์",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "Computer Science วิทยาการข้อมูล",
      criteria: { round3: { tgat2: 20, amath1: 45, aphy: 20, aeng: 15 } },
      specialReq: []
    },
    {
      id: "ku-eng-mech",
      universityId: "ku",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมเครื่องกล",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "เครื่องจักร ยานยนต์ เครื่องมือทางการเกษตร",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 35, aeng: 15 } },
      specialReq: []
    },
    {
      id: "ku-bus",
      universityId: "ku",
      faculty: "บริหารธุรกิจ",
      program: "บริหารธุรกิจ",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.50,
      competition: "ปานกลาง",
      description: "บริหาร การตลาด การเงิน ทรัพยากรมนุษย์",
      criteria: { round3: { tgat1: 20, tgat2: 20, amath1: 25, aeng: 20, asocial: 15 } },
      specialReq: []
    },
    {
      id: "ku-food-sci",
      universityId: "ku",
      faculty: "อุตสาหกรรมเกษตร",
      program: "วิทยาศาสตร์และเทคโนโลยีการอาหาร",
      category: "วิทยาศาสตร์",
      duration: "4 ปี",
      seats: 60,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "เทคโนโลยีอาหาร คุณภาพและความปลอดภัย",
      criteria: { round3: { tgat2: 15, amath1: 20, achem: 30, abio: 25, aeng: 10 } },
      specialReq: []
    },

    // ===== ขอนแก่น เพิ่มเติม =====
    {
      id: "kku-dent",
      universityId: "kku",
      faculty: "ทันตแพทยศาสตร์",
      program: "หลักสูตรทันตแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "ทันตแพทย์ ม.ขอนแก่น ภาคอีสาน",
      criteria: { round3: { tpat1: 30, athai: 5, asocial: 5, aeng: 10, amath1: 10, aphy: 10, achem: 15, abio: 15 } },
      specialReq: ["TPAT1 (กสพท)", "สัมภาษณ์"]
    },
    {
      id: "kku-arch",
      universityId: "kku",
      faculty: "สถาปัตยกรรมศาสตร์",
      program: "สถาปัตยกรรมศาสตร์",
      category: "สถาปัตยกรรม",
      duration: "5 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "สถาปัตยกรรม ผังเมือง ภาคอีสาน",
      criteria: { round3: { tgat2: 15, tpat4: 35, amath1: 20, aphy: 15, aeng: 15 } },
      specialReq: ["TPAT4 (สถาปัตยกรรม)"]
    },
    {
      id: "kku-econ",
      universityId: "kku",
      faculty: "เศรษฐศาสตร์",
      program: "เศรษฐศาสตร์",
      category: "บริหาร",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "เศรษฐศาสตร์พัฒนา นโยบายสาธารณะ",
      criteria: { round3: { tgat1: 20, tgat2: 20, amath1: 30, aeng: 15, asocial: 15 } },
      specialReq: []
    },
    {
      id: "kku-edu",
      universityId: "kku",
      faculty: "ศึกษาศาสตร์",
      program: "คณิตศาสตรศึกษา",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูคณิตศาสตร์ระดับมัธยมศึกษา",
      criteria: { round3: { tgat1: 15, tgat2: 15, tpat5: 30, amath1: 30, aeng: 10 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },
    {
      id: "kku-public-health",
      universityId: "kku",
      faculty: "สาธารณสุขศาสตร์",
      program: "สาธารณสุขศาสตร์",
      category: "สาธารณสุข",
      duration: "4 ปี",
      seats: 60,
      rounds: [2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "สุขภาพชุมชน อนามัยสิ่งแวดล้อม ระบาดวิทยา",
      criteria: { round3: { tgat1: 15, tgat2: 15, abio: 20, achem: 15, amath1: 10, aeng: 5 } },
      specialReq: []
    },

    // ===== ศิลปากร เพิ่มเติม =====
    {
      id: "su-deco",
      universityId: "su",
      faculty: "มัณฑนศิลป์",
      program: "ออกแบบตกแต่งภายใน",
      category: "สถาปัตยกรรม",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ออกแบบตกแต่งภายในอาคาร",
      criteria: { round3: { tgat2: 15, tpat4: 40, amath1: 15, aeng: 15, athai: 15 } },
      specialReq: ["TPAT4 (สถาปัตยกรรม)", "แฟ้มผลงาน"]
    },
    {
      id: "su-pharma",
      universityId: "su",
      faculty: "เภสัชศาสตร์",
      program: "เภสัชศาสตร์",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 3.25,
      competition: "สูง",
      description: "เภสัชกรรม เภสัชวิทยา ดูแลผู้ป่วย",
      criteria: { round3: { tgat2: 10, amath1: 15, achem: 25, abio: 20, aphy: 10 } },
      specialReq: []
    },

    // ===== นเรศวร เพิ่มเติม =====
    {
      id: "nu-dent",
      universityId: "nu",
      faculty: "ทันตแพทยศาสตร์",
      program: "หลักสูตรทันตแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 32,
      rounds: [1, 2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "ทันตแพทย์ภาคเหนือตอนล่าง",
      criteria: { round3: { tpat1: 30, athai: 5, asocial: 5, aeng: 10, amath1: 10, aphy: 10, achem: 15, abio: 15 } },
      specialReq: ["TPAT1 (กสพท)"]
    },
    {
      id: "nu-eng-cs",
      universityId: "nu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมคอมพิวเตอร์",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "ระบบคอมพิวเตอร์ ซอฟต์แวร์ เครือข่าย",
      criteria: { round3: { tgat2: 20, amath1: 35, aphy: 30, aeng: 15 } },
      specialReq: []
    },
    {
      id: "nu-arch",
      universityId: "nu",
      faculty: "สถาปัตยกรรมศาสตร์",
      program: "สถาปัตยกรรมศาสตร์",
      category: "สถาปัตยกรรม",
      duration: "5 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "สถาปัตยกรรม ภาคเหนือตอนล่าง",
      criteria: { round3: { tgat2: 15, tpat4: 35, amath1: 20, aphy: 15, aeng: 15 } },
      specialReq: ["TPAT4 (สถาปัตยกรรม)"]
    },
    {
      id: "nu-edu",
      universityId: "nu",
      faculty: "ศึกษาศาสตร์",
      program: "การศึกษาปฐมวัย",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 30,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครูปฐมวัย พัฒนาการเด็ก",
      criteria: { round3: { tgat1: 20, tgat2: 15, tpat5: 30, athai: 25, aeng: 10 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    },

    // ===== สงขลานครินทร์ เพิ่มเติม =====
    {
      id: "psu-dent",
      universityId: "psu",
      faculty: "ทันตแพทยศาสตร์",
      program: "หลักสูตรทันตแพทยศาสตรบัณฑิต",
      category: "สาธารณสุข",
      duration: "6 ปี",
      seats: 48,
      rounds: [1, 2, 3],
      minGPA: 3.50,
      competition: "สูงมาก",
      description: "ทันตแพทย์ภาคใต้ ม.สงขลานครินทร์",
      criteria: { round3: { tpat1: 30, athai: 5, asocial: 5, aeng: 10, amath1: 10, aphy: 10, achem: 15, abio: 15 } },
      specialReq: ["TPAT1 (กสพท)"]
    },
    {
      id: "psu-law",
      universityId: "psu",
      faculty: "นิติศาสตร์",
      program: "นิติศาสตร์",
      category: "สังคมศาสตร์",
      duration: "4 ปี",
      seats: 80,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "กฎหมายไทย กฎหมายมุสลิม ภาคใต้",
      criteria: { round3: { tgat1: 30, tgat2: 30, asocial: 25, athai: 15 } },
      specialReq: []
    },
    {
      id: "psu-eng-mech",
      universityId: "psu",
      faculty: "วิศวกรรมศาสตร์",
      program: "วิศวกรรมเครื่องกล",
      category: "วิศวกรรม",
      duration: "4 ปี",
      seats: 40,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ปานกลาง",
      description: "เครื่องจักรกล อุตสาหกรรม ยานยนต์",
      criteria: { round3: { tgat2: 15, amath1: 35, aphy: 35, aeng: 15 } },
      specialReq: []
    },
    {
      id: "psu-edu",
      universityId: "psu",
      faculty: "ศึกษาศาสตร์",
      program: "การบริหารการศึกษา",
      category: "ครุศาสตร์",
      duration: "4 ปี",
      seats: 50,
      rounds: [1, 2, 3],
      minGPA: 2.75,
      competition: "ต่ำ",
      description: "ครู นักบริหารการศึกษา ภาคใต้",
      criteria: { round3: { tgat1: 20, tgat2: 15, tpat5: 30, asocial: 20, athai: 15 } },
      specialReq: ["TPAT5 (ครุศาสตร์)"]
    }
  ],

  // ---- Camp Types for Portfolio ----
  campTypes: [
    { id: "science", name: "ค่ายวิทยาศาสตร์", icon: "🔬" },
    { id: "math", name: "ค่ายคณิตศาสตร์", icon: "📐" },
    { id: "computer", name: "ค่ายคอมพิวเตอร์/IT", icon: "💻" },
    { id: "medicine", name: "ค่ายแพทย์/สาธารณสุข", icon: "🏥" },
    { id: "engineering", name: "ค่ายวิศวกรรม", icon: "⚙️" },
    { id: "language", name: "ค่ายภาษา", icon: "🌐" },
    { id: "arts", name: "ค่ายศิลปะ/ดนตรี", icon: "🎨" },
    { id: "leadership", name: "ค่ายผู้นำ", icon: "👑" },
    { id: "environment", name: "ค่ายสิ่งแวดล้อม", icon: "🌿" },
    { id: "social", name: "ค่ายสังคม/รัฐศาสตร์", icon: "🏛️" },
    { id: "business", name: "ค่ายธุรกิจ/เศรษฐศาสตร์", icon: "💼" },
    { id: "other", name: "อื่นๆ", icon: "⭐" }
  ],

  // ---- Award Levels ----
  awardLevels: [
    { id: "school", name: "ระดับโรงเรียน", weight: 1, color: "#94A3B8" },
    { id: "district", name: "ระดับเขต/อำเภอ", weight: 2, color: "#60A5FA" },
    { id: "provincial", name: "ระดับจังหวัด", weight: 3, color: "#34D399" },
    { id: "regional", name: "ระดับภาค", weight: 5, color: "#FBBF24" },
    { id: "national", name: "ระดับประเทศ", weight: 10, color: "#F87171" },
    { id: "international", name: "ระดับนานาชาติ/โลก", weight: 15, color: "#A78BFA" }
  ]
};

// ---- Helper Functions ----
function getUniversityById(id) {
  return TCAS_DATA.universities.find(u => u.id === id);
}

function getProgramsByUniversity(universityId) {
  return TCAS_DATA.programs.filter(p => p.universityId === universityId);
}

function getProgramsByCategory(category) {
  return TCAS_DATA.programs.filter(p => p.category === category);
}

// ============================================================
// TCAS Historical Min/Max Scores (Source: mytcas.com/stat/)
// TCAS65–69 (ปีการศึกษา 2565–2569) ระบบ TGAT/TPAT/A-Level
// คะแนน = % normalized (0–100)
// ============================================================
const TCAS_HISTORICAL_STATS = {
  'bu-nurse': {
    65: { min: 56.32, max: 68.42 },
    66: { min: 48.82, max: 57.32 },
    69: { min: 53.35, max: 60.63 },
  },
  'cmu-bus': {
    65: { min: 41.19, max: 57.43 },
    66: { min: 39.19, max: 54.08 },
    69: { min: 51.23, max: 58.04 },
  },
  'cmu-eng-cs': {
    65: { min: 39.76, max: 43.6 },
    66: { min: 58.3, max: 61.96 },
    69: { min: 59.26, max: 65.45 },
  },
  'cmu-med': {
    65: { min: 61.67, max: 67.58 },
    66: { min: 63.5, max: 66.4 },
    69: { min: 57.17, max: 59.52 },
  },
  'cu-acc': {
    65: { min: 56.02, max: 79.15 },
    66: { min: 74.11, max: 90.67 },
    67: { min: 72.41, max: 91.68 },
    68: { min: 80.14, max: 94.85 },
    69: { min: 56.32, max: 77.26 },
  },
  'cu-arts-thai': {
    65: { min: 65.0, max: 77.38 },
    66: { min: 71.38, max: 82.38 },
    67: { min: 71.05, max: 80.4 },
    68: { min: 74.64, max: 85.58 },
    69: { min: 71.06, max: 74.62 },
  },
  'cu-econ': {
    65: { min: 52.52, max: 75.1 },
    66: { min: 57.62, max: 76.14 },
    69: { min: 59.73, max: 77.98 },
  },
  'cu-law': {
    65: { min: 54.9, max: 75.18 },
    66: { min: 71.86, max: 85.9 },
    69: { min: 68.65, max: 82.75 },
  },
  'dpu-law': {
    65: { min: 35.64, max: 56.0 },
    66: { min: 55.75, max: 88.25 },
    69: { min: 75.5, max: 75.5 },
  },
  'kku-eng': {
    65: { min: 32.18, max: 38.02 },
    66: { min: 40.07, max: 48.12 },
    67: { min: 39.93, max: 55.5 },
    68: { min: 44.14, max: 54.69 },
    69: { min: 37.68, max: 47.88 },
  },
  'kku-law': {
    65: { min: 37.31, max: 52.06 },
    66: { min: 49.56, max: 70.31 },
    67: { min: 39.46, max: 57.81 },
    68: { min: 45.64, max: 58.69 },
    69: { min: 52.75, max: 67.5 },
  },
  'kku-med': {
    65: { min: 43.39, max: 52.65 },
    66: { min: 53.56, max: 58.97 },
    67: { min: 54.62, max: 59.54 },
    68: { min: 59.0, max: 66.11 },
    69: { min: 54.17, max: 59.97 },
  },
  'kku-nurse': {
    65: { min: 35.35, max: 43.35 },
    66: { min: 40.01, max: 45.48 },
    67: { min: 41.98, max: 52.51 },
    68: { min: 41.95, max: 50.03 },
    69: { min: 37.73, max: 50.53 },
  },
  'kku-pharma': {
    65: { min: 46.76, max: 51.7 },
    66: { min: 50.18, max: 55.7 },
    67: { min: 52.93, max: 57.06 },
    68: { min: 57.49, max: 63.9 },
    69: { min: 53.31, max: 57.13 },
  },
  'kmitl-eng-comp': {
    65: { min: 63.59, max: 68.42 },
    66: { min: 64.38, max: 70.87 },
    69: { min: 62.29, max: 69.96 },
  },
  'kmutnb-cs': {
    65: { min: 19.26, max: 40.88 },
    66: { min: 44.94, max: 64.48 },
    69: { min: 43.74, max: 56.47 },
  },
  'kmutnb-eng': {
    65: { min: 22.53, max: 39.34 },
    66: { min: 37.83, max: 51.84 },
    69: { min: 34.48, max: 44.89 },
  },
  'kmutt-eng-cs': {
    65: { min: 59.43, max: 70.16 },
    66: { min: 77.54, max: 83.95 },
  },
  'kmutt-eng-mech': {
    65: { min: 48.43, max: 57.05 },
    66: { min: 72.03, max: 75.1 },
  },
  'ku-agri': {
    65: { min: 24.47, max: 49.69 },
    66: { min: 33.67, max: 45.21 },
    69: { min: 39.95, max: 51.63 },
  },
  'ku-econ': {
    65: { min: 33.2, max: 48.85 },
    66: { min: 33.44, max: 51.93 },
    68: { min: 50.04, max: 61.6 },
    69: { min: 49.01, max: 65.89 },
  },
  'ku-eng-comp': {
    65: { min: 35.48, max: 54.22 },
    66: { min: 46.14, max: 66.09 },
    69: { min: 37.93, max: 56.42 },
  },
  'ku-vet': {
    65: { min: 46.75, max: 54.19 },
    66: { min: 49.72, max: 58.96 },
    69: { min: 45.3, max: 55.49 },
  },
  'mfu-cs': {
    65: { min: 26.3, max: 44.14 },
    66: { min: 43.15, max: 62.33 },
  },
  'msu-med': {
    65: { min: 57.74, max: 60.86 },
    66: { min: 44.35, max: 55.49 },
    69: { min: 44.3, max: 54.62 },
  },
  'msu-pharma': {
    65: { min: 57.81, max: 60.92 },
    66: { min: 48.56, max: 58.85 },
  },
  'mu-med': {
    65: { min: 48.9, max: 58.51 },
    66: { min: 51.49, max: 61.18 },
    69: { min: 60.31, max: 66.96 },
  },
  'mu-nurse': {
    65: { min: 42.6, max: 58.73 },
    66: { min: 51.05, max: 59.06 },
    69: { min: 41.13, max: 54.58 },
  },
  'mu-pharma': {
    66: { min: 58.19, max: 64.99 },
  },
  'nu-nurse': {
    65: { min: 46.53, max: 57.48 },
    66: { min: 44.15, max: 53.77 },
    69: { min: 42.74, max: 54.31 },
  },
  'nu-pharma': {
    65: { min: 56.92, max: 60.36 },
    66: { min: 46.84, max: 58.93 },
    69: { min: 50.85, max: 57.97 },
  },
  'psu-eng-comp': {
    65: { min: 48.46, max: 56.07 },
    66: { min: 68.82, max: 76.63 },
    69: { min: 62.51, max: 67.69 },
  },
  'psu-med': {
    65: { min: 51.88, max: 58.38 },
    66: { min: 53.06, max: 59.79 },
    69: { min: 53.78, max: 61.4 },
  },
  'psu-nurse': {
    65: { min: 36.83, max: 42.87 },
    66: { min: 39.05, max: 44.71 },
    69: { min: 37.41, max: 45.09 },
  },
  'psu-pharma': {
    65: { min: 43.59, max: 56.4 },
    66: { min: 48.43, max: 55.43 },
    69: { min: 52.24, max: 59.74 },
  },
  'rsu-med': {
    65: { min: 41.72, max: 53.3 },
    66: { min: 50.77, max: 71.22 },
  },
  'ru-bus': {
    67: { min: 57.38, max: 74.92 },
  },
  'spu-law': {
    65: { min: 88.42, max: 95.58 },
    66: { min: 70.25, max: 94.83 },
    69: { min: 67.75, max: 91.75 },
  },
  'swu-edu': {
    65: { min: 43.03, max: 52.22 },
    66: { min: 66.86, max: 74.84 },
    69: { min: 61.3, max: 67.84 },
  },
  'swu-med': {
    69: { min: 44.11, max: 52.73 },
  },
  'tu-acc': {
    65: { min: 52.53, max: 68.67 },
    66: { min: 55.89, max: 74.26 },
    69: { min: 58.88, max: 71.12 },
  },
  'tu-bus': {
    65: { min: 50.0, max: 64.27 },
    66: { min: 51.31, max: 80.57 },
    69: { min: 53.25, max: 68.12 },
  },
  'tu-eng-cs': {
    65: { min: 45.8, max: 62.38 },
    66: { min: 70.98, max: 76.97 },
    69: { min: 43.07, max: 55.6 },
  },
  'tu-law': {
    65: { min: 71.64, max: 86.34 },
    66: { min: 70.5, max: 81.0 },
    69: { min: 59.74, max: 68.14 },
  },
  'tu-pol': {
    65: { min: 55.98, max: 65.34 },
    66: { min: 63.41, max: 76.7 },
    69: { min: 58.96, max: 76.05 },
  },
  'tu-poltec': {
    65: { min: 54.13, max: 62.44 },
    69: { min: 58.74, max: 78.98 },
  },
  'utcc-acc': {
    65: { min: 60.75, max: 98.0 },
    66: { min: 62.0, max: 99.25 },
    68: { min: 93.0, max: 93.0 },
  },
  'utcc-mkt': {
    65: { min: 59.25, max: 95.5 },
    66: { min: 53.5, max: 98.0 },
    68: { min: 33.25, max: 97.5 },
    69: { min: 49.75, max: 97.0 },
  },
  'wu-med': {
    65: { min: 43.08, max: 55.72 },
    66: { min: 62.26, max: 76.54 },
    69: { min: 66.9, max: 72.64 },
  },
  'wu-nurse': {
    65: { min: 46.94, max: 52.5 },
    66: { min: 31.09, max: 41.1 },
    69: { min: 40.79, max: 40.79 },
  },
};

function getAllCategories() {
  return [...new Set(TCAS_DATA.programs.map(p => p.category))];
}

// Calculate recommendation score for a program based on student data
function calculateMatchScore(program, studentData) {
  let score = 0;
  let maxScore = 0;
  let details = [];
  let issues = [];

  const scores = studentData.scores || {};
  const gpa = parseFloat(studentData.gpa?.cumulative) || 0;
  const portfolio = studentData.portfolio || {};

  // GPA Check
  if (gpa > 0) {
    if (gpa >= program.minGPA) {
      score += 20;
      details.push(`GPA ${gpa.toFixed(2)} ✓ (ต้องการ ${program.minGPA})`);
    } else {
      score += Math.max(0, 20 * (gpa / program.minGPA));
      issues.push(`GPA ${gpa.toFixed(2)} ต่ำกว่าเกณฑ์ (ต้องการ ${program.minGPA})`);
    }
    maxScore += 20;
  }

  // Test Score Check (use round 3 criteria as baseline)
  const criteria = program.criteria?.round3 || {};
  let totalWeight = Object.values(criteria).reduce((a, b) => a + b, 0);

  for (const [testKey, weight] of Object.entries(criteria)) {
    const testInfo = getTestInfo(testKey);
    if (!testInfo) continue;

    const maxTestScore = testInfo.maxScore;
    const studentScore = parseFloat(scores[testKey]) || 0;

    if (studentScore > 0) {
      const pct = studentScore / maxTestScore;
      score += pct * weight;
      details.push(`${testInfo.name}: ${studentScore}/${maxTestScore} (${Math.round(pct * 100)}%)`);
    } else {
      // Test not taken
      issues.push(`ยังไม่มีคะแนน ${testInfo.name}`);
    }
    maxScore += weight;
  }

  const matchPercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  // Portfolio bonus
  const awards = portfolio.awards || [];
  const nationalAwards = awards.filter(a => a.level === 'national' || a.level === 'international').length;
  const portfolioBonus = Math.min(nationalAwards * 5, 15);

  return {
    score: matchPercent + portfolioBonus,
    matchPercent,
    details,
    issues,
    portfolioBonus
  };
}

function getTestInfo(testKey) {
  for (const category of Object.values(TCAS_DATA.tests)) {
    if (category.subjects[testKey]) {
      return category.subjects[testKey];
    }
  }
  return null;
}
