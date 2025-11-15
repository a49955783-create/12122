// عناصر أساسية
const introOverlay = document.getElementById("intro-overlay");
const opsNameInput = document.getElementById("opsName");
const opsCodeInput = document.getElementById("opsCode");
const opsDeputyNameInput = document.getElementById("opsDeputyName");
const opsDeputyCodeInput = document.getElementById("opsDeputyCode");

const leadersListEl = document.getElementById("leadersList");
const officersListEl = document.getElementById("officersList");
const ncosListEl = document.getElementById("ncosList");
const shiftManagerDisplayEl = document.getElementById("shiftManagerDisplay");

const addLeaderBtn = document.getElementById("addLeaderBtn");
const addOfficerBtn = document.getElementById("addOfficerBtn");
const setShiftManagerBtn = document.getElementById("setShiftManagerBtn");
const addNcoBtn = document.getElementById("addNcoBtn");

const unitsTableBody = document.getElementById("unitsTableBody");
const addUnitRowBtn = document.getElementById("addUnitRowBtn");

const setStartTimeBtn = document.getElementById("setStartTimeBtn");
const setEndTimeBtn = document.getElementById("setEndTimeBtn");

const finalResultEl = document.getElementById("finalResult");
const copyResultBtn = document.getElementById("copyResultBtn");

// OCR عناصر
const ocrUploadBtn = document.getElementById("ocrUploadBtn");
const ocrFileInput = document.getElementById("ocrFileInput");
const ocrDropzone = document.getElementById("ocrDropzone");
const ocrProgressFill = document.getElementById("ocrProgressFill");
const ocrProgressText = document.getElementById("ocrProgressText");
const ocrPreviewContainer = document.getElementById("ocrPreviewContainer");
const ocrPreviewImage = document.getElementById("ocrPreviewImage");

// مودال التعديل
const editModal = document.getElementById("editModal");
const closeEditModalBtn = document.getElementById("closeEditModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const saveEditBtn = document.getElementById("saveEditBtn");

const editCodeInput = document.getElementById("editCodeInput");
const editStatusSelect = document.getElementById("editStatusSelect");
const editLocationSelect = document.getElementById("editLocationSelect");
const editUnitAssignInput = document.getElementById("editUnitAssignInput");
const editVehicleTypeSelect = document.getElementById("editVehicleTypeSelect");
const editSpeedUnitOptions = document.getElementById("editSpeedUnitOptions");
const editSpeedSubtypeSelect = document.getElementById("editSpeedSubtypeSelect");

// Toast
const toastEl = document.getElementById("toast");

// بيانات في الذاكرة
let leaders = [];
let officers = [];
let ncos = [];
let shiftManager = null;
let units = []; // {id, code, status, location, assign, vehicleType, speedSubtype, partners:[]}
let startTime = "—";
let endTime = "—";
let currentEditUnitId = null;

// ====== توست ======
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
}

// ====== انترو ======
introOverlay.addEventListener("click", () => {
  introOverlay.style.display = "none";
});

// ====== توليد ID بسيط ======
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ====== إدارة الطاقم ======
function renderPillList(containerEl, items, type) {
  containerEl.innerHTML = "";
  items.forEach((item) => {
    const pill = document.createElement("div");
    pill.className = "pill";

    const span = document.createElement("span");
    span.textContent = item.label;

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.textContent = "حذف";
    delBtn.addEventListener("click", () => {
      if (type === "leader") {
        leaders = leaders.filter((x) => x.id !== item.id);
      } else if (type === "officer") {
        officers = officers.filter((x) => x.id !== item.id);
      } else if (type === "nco") {
        ncos = ncos.filter((x) => x.id !== item.id);
      }
      updateCrewUI();
      updateFinalResult();
      showToast("تم الحذف");
    });

    pill.appendChild(span);
    pill.appendChild(delBtn);
    containerEl.appendChild(pill);
  });
}

function updateCrewUI() {
  renderPillList(leadersListEl, leaders, "leader");
  renderPillList(officersListEl, officers, "officer");
  renderPillList(ncosListEl, ncos, "nco");

  if (shiftManager) {
    shiftManagerDisplayEl.textContent = `${shiftManager.name} ${shiftManager.code}`;
  } else {
    shiftManagerDisplayEl.textContent = "لا يوجد";
  }
}

// إضافة قيادة
addLeaderBtn.addEventListener("click", () => {
  const code = prompt("أدخل كود القيادة:");
  if (!code) return;
  leaders.push({ id: generateId(), label: code.trim() });
  updateCrewUI();
  updateFinalResult();
  showToast("تم إضافة قيادة");
});

// إضافة ضابط
addOfficerBtn.addEventListener("click", () => {
  const code = prompt("أدخل كود الضابط:");
  if (!code) return;
  officers.push({ id: generateId(), label: code.trim() });
  updateCrewUI();
  updateFinalResult();
  showToast("تم إضافة ضابط");
});

// مسؤول الفترة
setShiftManagerBtn.addEventListener("click", () => {
  const name = prompt("أدخل اسم مسؤول الفترة:");
  if (!name) return;
  const code = prompt("أدخل الكود:");
  if (!code) return;
  shiftManager = { name: name.trim(), code: code.trim() };
  updateCrewUI();
  updateFinalResult();
  showToast("تم تحديث مسؤول الفترة");
});

// ضباط الصف
addNcoBtn.addEventListener("click", () => {
  const code = prompt("أدخل كود ضابط الصف:");
  if (!code) return;
  ncos.push({ id: generateId(), label: code.trim() });
  updateCrewUI();
  updateFinalResult();
  showToast("تم إضافة ضابط صف");
});

// ====== توزيع الوحدات ======

function createEmptyUnitRow(code = "") {
  return {
    id: generateId(),
    code: code,
    status: "في الخدمة",
    location: "لا شي",
    assign: "",
    vehicleType: "لا شي",
    speedSubtype: "فايبكس",
    partners: []
  };
}

function renderUnitsTable() {
  unitsTableBody.innerHTML = "";

  units.forEach((unit) => {
    const tr = document.createElement("tr");

    // الكود
    const tdCode = document.createElement("td");
    const codeInput = document.createElement("input");
    codeInput.type = "text";
    codeInput.value = unit.code;
    codeInput.addEventListener("input", () => {
      unit.code = codeInput.value.trim();
      updateFinalResult();
    });
    tdCode.appendChild(codeInput);
    tr.appendChild(tdCode);

    // الحالة
    const tdStatus = document.createElement("td");
    const statusSelect = document.createElement("select");
    ["في الخدمة", "مشغول", "مشغول - اختبار", "مشغول - تدريب", "مشغول حالة موجه 10"].forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (unit.status === s) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusSelect.addEventListener("change", () => {
      unit.status = statusSelect.value;
      updateFinalResult();
    });
    tdStatus.appendChild(statusSelect);
    tr.appendChild(tdStatus);

    // الموقع
    const tdLocation = document.createElement("td");
    const locSelect = document.createElement("select");
    ["لا شي", "الشمال", "الوسط", "الشرق", "الجنوب", "ساندي", "بوليتو"].forEach((l) => {
      const opt = document.createElement("option");
      opt.value = l;
      opt.textContent = l;
      if (unit.location === l) opt.selected = true;
      locSelect.appendChild(opt);
    });
    locSelect.addEventListener("change", () => {
      unit.location = locSelect.value;
      updateFinalResult();
    });
    tdLocation.appendChild(locSelect);
    tr.appendChild(tdLocation);

    // توزيع الوحدات
    const tdAssign = document.createElement("td");
    const assignInput = document.createElement("input");
    assignInput.type = "text";
    assignInput.placeholder = "مثال: 145 | الشمال";
    assignInput.value = unit.assign || "";
    assignInput.addEventListener("input", () => {
      unit.assign = assignInput.value;
      updateFinalResult();
    });
    tdAssign.appendChild(assignInput);
    tr.appendChild(tdAssign);

    // نوع المركبة
    const tdVehicle = document.createElement("td");
    const vehicleSelect = document.createElement("select");
    ["لا شي", "وحدة عادية", "سبيد يونت", "دباب", "الهلي"].forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      if (unit.vehicleType === v) opt.selected = true;
      vehicleSelect.appendChild(opt);
    });
    vehicleSelect.addEventListener("change", () => {
      unit.vehicleType = vehicleSelect.value;
      updateFinalResult();
    });
    tdVehicle.appendChild(vehicleSelect);
    tr.appendChild(tdVehicle);

    // الإجراءات
    const tdActions = document.createElement("td");
    tdActions.style.whiteSpace = "nowrap";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-sm";
    editBtn.textContent = "تعديل";
    editBtn.addEventListener("click", () => openEditModal(unit.id));

    const partnerBtn = document.createElement("button");
    partnerBtn.type = "button";
    partnerBtn.className = "btn btn-sm";
    partnerBtn.textContent = "إضافة شريك";
    partnerBtn.style.marginInline = "4px";
    partnerBtn.addEventListener("click", () => {
      const partnerCode = prompt("أدخل كود الشريك:");
      if (!partnerCode) return;
      unit.partners.push(partnerCode.trim());
      updateFinalResult();
      showToast("تم إضافة شريك");
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-sm btn-danger";
    delBtn.textContent = "حذف";
    delBtn.addEventListener("click", () => {
      units = units.filter((u) => u.id !== unit.id);
      renderUnitsTable();
      updateFinalResult();
      showToast("تم حذف السطر");
    });

    tdActions.appendChild(editBtn);
    tdActions.appendChild(partnerBtn);
    tdActions.appendChild(delBtn);
    tr.appendChild(tdActions);

    unitsTableBody.appendChild(tr);
  });
}

addUnitRowBtn.addEventListener("click", () => {
  units.push(createEmptyUnitRow());
  renderUnitsTable();
  updateFinalResult();
  showToast("تم إضافة سطر جديد");
});

// ====== مودال التعديل ======

function openEditModal(unitId) {
  const unit = units.find((u) => u.id === unitId);
  if (!unit) return;
  currentEditUnitId = unitId;

  editCodeInput.value = unit.code;
  editStatusSelect.value = unit.status;
  editLocationSelect.value = unit.location;
  editUnitAssignInput.value = unit.assign || "";
  editVehicleTypeSelect.value = unit.vehicleType || "لا شي";
  editSpeedSubtypeSelect.value = unit.speedSubtype || "فايبكس";

  if (unit.vehicleType === "سبيد يونت") {
    editSpeedUnitOptions.style.display = "block";
  } else {
    editSpeedUnitOptions.style.display = "none";
  }

  editModal.style.display = "flex";
}

function closeEditModal() {
  currentEditUnitId = null;
  editModal.style.display = "none";
}

editVehicleTypeSelect.addEventListener("change", () => {
  if (editVehicleTypeSelect.value === "سبيد يونت") {
    editSpeedUnitOptions.style.display = "block";
  } else {
    editSpeedUnitOptions.style.display = "none";
  }
});

closeEditModalBtn.addEventListener("click", closeEditModal);
cancelEditBtn.addEventListener("click", closeEditModal);

saveEditBtn.addEventListener("click", () => {
  if (!currentEditUnitId) return;
  const unit = units.find((u) => u.id === currentEditUnitId);
  if (!unit) return;

  unit.code = editCodeInput.value.trim();
  unit.status = editStatusSelect.value;
  unit.location = editLocationSelect.value;
  unit.assign = editUnitAssignInput.value.trim();
  unit.vehicleType = editVehicleTypeSelect.value;
  unit.speedSubtype = editSpeedSubtypeSelect.value;

  renderUnitsTable();
  updateFinalResult();
  closeEditModal();
  showToast("تم حفظ التعديلات");
});

// ====== الوقت ======

function getTimeNowString() {
  const d = new Date();
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

setStartTimeBtn.addEventListener("click", () => {
  startTime = getTimeNowString();
  updateFinalResult();
  showToast("تم تسجيل وقت الاستلام");
});

setEndTimeBtn.addEventListener("click", () => {
  endTime = getTimeNowString();
  updateFinalResult();
  showToast("تم تسجيل وقت التسليم");
});

// ====== بناء النتيجة النهائية ======

function buildFinalResultText() {
  const opsName = opsNameInput.value.trim();
  const opsCode = opsCodeInput.value.trim();
  const depName = opsDeputyNameInput.value.trim();
  const depCode = opsDeputyCodeInput.value.trim();

  const opsLine =
    (opsName || opsCode)
      ? `اسم العمليات : ${opsName}${opsCode ? " | " + opsCode : ""}`
      : "اسم العمليات :";
  const depLine =
    (depName || depCode)
      ? `النائب مركز العمليات : ${depName}${depCode ? " | " + depCode : ""}`
      : "النائب مركز العمليات :";

  const leadersText = leaders.length
    ? leaders.map((l) => l.label).join(" - ")
    : "-";
  const officersText = officers.length
    ? officers.map((o) => o.label).join(" - ")
    : "-";
  const ncosText = ncos.length
    ? ncos.map((n) => n.label).join(" - ")
    : "-";
  const shiftText = shiftManager
    ? `${shiftManager.name} ${shiftManager.code}`
    : "-";

  // توزيع الوحدات حسب النوع
  const normalUnits = [];
  const speedUnits = [];
  const bikeUnits = [];
  const heliUnits = [];

  units.forEach((u) => {
    const code = u.code || "";
    const hasCode = code !== "";
    const locPart = u.location && u.location !== "لا شي" ? u.location : "";
    const statusPart =
      u.status && u.status !== "في الخدمة" ? u.status : "";
    const base = hasCode ? code : "";
    const joinParts = [];

    if (statusPart) joinParts.push(statusPart);
    if (locPart) joinParts.push(locPart);

    // + الشركاء
    const partnersStr = u.partners && u.partners.length
      ? " + " + u.partners.join(" + ")
      : "";

    // لو عنده assign مكتوب، نعتمده مباشرة
    let line = "";
    if (u.assign && u.assign.trim() !== "") {
      line = u.assign.trim();
    } else if (base) {
      if (joinParts.length > 0) {
        line = `${base}${partnersStr} | ${joinParts.join(" | ")}`;
      } else {
        line = `${base}${partnersStr}`;
      }
    }

    if (!line) return;

    // توزيع حسب نوع المركبة
    switch (u.vehicleType) {
      case "سبيد يونت": {
        const label =
          u.speedSubtype && u.speedSubtype !== "فايبكس"
            ? `${code} | ${u.speedSubtype}`
            : `${code} | فايبكس`;
        speedUnits.push(label);
        break;
      }
      case "دباب":
        bikeUnits.push(code);
        break;
      case "الهلي":
        // يوضع في "وحدات الهلي" فقط، وليس في توزيع الوحدات
        if (code) {
          const heliLine = locPart ? `${code} | ${locPart}` : code;
          heliUnits.push(heliLine);
        }
        break;
      case "لا شي":
      case "وحدة عادية":
      default:
        normalUnits.push(line);
        break;
    }
  });

  const normalText = normalUnits.length
    ? normalUnits.join("\n")
    : "-";
  const speedText = speedUnits.length
    ? speedUnits.join("\n")
    : "-";
  const bikeText = bikeUnits.length
    ? bikeUnits.join("\n")
    : "-";
  const heliText = heliUnits.length
    ? heliUnits.join("\n")
    : "-";

  const resultLines = [
    "📌 استلام العمليات",
    opsLine,
    depLine,
    "",
    "القيادات",
    leadersText,
    "",
    "الضباط",
    officersText,
    "",
    "مسؤول فترة",
    shiftText,
    "",
    "ضباط الصف",
    ncosText,
    "",
    "توزيع الوحدات",
    normalText,
    "",
    "وحدات سبيد يونت",
    speedText,
    "",
    "وحدات دباب",
    bikeText,
    "",
    "وحدات الهلي",
    heliText,
    "",
    `وقت الاستلام: ${startTime}`,
    `وقت التسليم: ${endTime}`,
    "",
    "تم التسليم إلى :"
  ];

  return resultLines.join("\n");
}

function updateFinalResult() {
  finalResultEl.textContent = buildFinalResultText();
}

// تحديث تلقائي عند التعديل في اسم العمليات / النائب
[opsNameInput, opsCodeInput, opsDeputyNameInput, opsDeputyCodeInput].forEach((el) => {
  el.addEventListener("input", () => {
    updateFinalResult();
  });
});

// ====== زر النسخ ======
copyResultBtn.addEventListener("click", () => {
  const text = finalResultEl.textContent;
  navigator.clipboard.writeText(text).then(
    () => showToast("تم نسخ النص"),
    () => showToast("تعذر نسخ النص")
  );
});

// ====== OCR: استخدام Tesseract إن وجد ======

function setOcrProgress(pct) {
  ocrProgressFill.style.width = `${pct}%`;
  ocrProgressText.textContent = `${pct}%`;
}

function extractCodesFromText(text) {
  // نجيب كل الأرقام (2–6 خانات) ونزيل التكرار
  const matches = text.match(/\b\d{2,6}\b/g) || [];
  const unique = [...new Set(matches)];
  return unique;
}

function distributeCodesToUnits(codes, mergeMode) {
  if (!codes.length) return;

  if (mergeMode === "replace") {
    units = [];
  }

  codes.forEach((c) => {
    units.push(createEmptyUnitRow(c));
  });

  renderUnitsTable();
  updateFinalResult();
}

async function runOcrOnImageFile(file) {
  if (!file) return;

  // معاينة الصورة
  const reader = new FileReader();
  reader.onload = (e) => {
    ocrPreviewImage.src = e.target.result;
    ocrPreviewContainer.style.display = "block";
  };
  reader.readAsDataURL(file);

  // تأكد من وجود Tesseract
  if (typeof Tesseract === "undefined") {
    showToast("مكتبة Tesseract غير متوفرة. سيتم إنشاء صفوف فارغة فقط.");
    // هنا نقدر نتصرف بأبسط شكل: نحط صفوف بعدد تقريبي (مثلاً 5)
    // لكن حسب طلبك، نكتفي بعدم التعطيل
    return;
  }

  try {
    setOcrProgress(10);
    const mergeMode = document.querySelector('input[name="mergeMode"]:checked')?.value || "replace";

    const { TesseractWorker } = Tesseract;
    const worker = new TesseractWorker();

    setOcrProgress(30);

    const result = await worker.recognize(file, "eng", {
      tessedit_char_whitelist: "0123456789",
    });

    setOcrProgress(80);

    const text = result.text || "";
    const codes = extractCodesFromText(text);

    distributeCodesToUnits(codes, mergeMode);

    setOcrProgress(100);
    setTimeout(() => setOcrProgress(0), 800);

    worker.terminate();

    showToast(`تم استخراج ${codes.length} كود وتوزيعها`);
  } catch (err) {
    console.error(err);
    showToast("حصل خطأ أثناء التحليل");
    setOcrProgress(0);
  }
}

// زر رفع ملف
ocrUploadBtn.addEventListener("click", () => {
  ocrFileInput.value = "";
  ocrFileInput.click();
});

ocrFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  runOcrOnImageFile(file);
});

// لصق صورة بـ Ctrl+V
document.addEventListener("paste", (e) => {
  if (!e.clipboardData) return;
  const items = e.clipboardData.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      if (file) {
        runOcrOnImageFile(file);
      }
    }
  }
});

// سحب وإفلات في الـ Dropzone
ocrDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

ocrDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file) return;
  runOcrOnImageFile(file);
});

// ====== تهيئة أولية ======

function init() {
  // نضيف سطر واحد افتراضي
  units.push(createEmptyUnitRow());
  renderUnitsTable();
  updateCrewUI();
  updateFinalResult();
  setOcrProgress(0);
}

init();
