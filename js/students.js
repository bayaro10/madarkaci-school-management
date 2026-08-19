function renderStudents() {
  const search = document.getElementById("studentSearch")?.value.toLowerCase() || "";
  const classId = document.getElementById("studentFilterClass")?.value || "";
  const tableEl = document.getElementById("studentTable");
  if (!tableEl) return;

  if (!classId) {
    tableEl.innerHTML = `<p class="hint" style="padding:30px;text-align:center;color:#888">Please select a class to view students.</p>`;
    return;
  }

  const rows = db.students
    .filter((s) => s.classId === classId)
    .filter((s) => `${s.regNo} ${fullName(s)} ${s.parentPhone}`.toLowerCase().includes(search))
    .map((s, idx) => [
      idx + 1,
      esc(s.regNo), esc(fullName(s)), esc(s.gender), esc(cls(s.classId).name), esc(s.parentPhone),
      `<button class="secondary no-print" onclick="editStudent('${s.id}')">Edit</button> <button class="secondary no-print" onclick="promoteStudent('${s.id}')">Promote</button>${hasPermission('reports') ? ` <button class="secondary no-print" onclick="printStudentIdCard('${s.id}')">🪪 ID Card</button>` : ""} ${hasPermission('reports') ? `<button class="secondary no-print" onclick="printAdmissionLetter('${s.id}')">📄 Admission Letter</button>` : ""} <button class="danger no-print" onclick="deleteStudent('${s.id}')">Delete</button>`
    ]);

  tableEl.innerHTML = table(["S/No", "Reg No", "Name", "Gender", "Class", "Parent Phone", "Action"], rows);
}

function newStudent() {
  ["studentId", "studentRegNo", "studentFirst", "studentMiddle", "studentLast", "studentDob", "studentPob", "studentNationality", "studentReligion", "studentLga", "studentState", "studentAddress", "studentEmail", "studentParent", "studentParentRelation", "studentParentOccupation", "studentPhone", "studentParentPhone", "studentAltPhone", "studentParentAddress", "studentParentEmail", "studentPrevSchool", "studentLastClass", "studentAdmissionDate", "studentBloodGroup", "studentGenotype", "studentAllergies", "studentMedicalConditions", "studentEmergencyContact", "studentBirthCert", "studentPrevResult", "studentTransferCert", "studentPhoto"].forEach((x) => {
    const el = document.getElementById(x);
    if (el) el.value = "";
  });
  const statusEl = document.getElementById("studentStatus");
  if (statusEl) statusEl.value = "Active";
  const previewEl = document.getElementById("studentPhotoPreview");
  if (previewEl) previewEl.innerHTML = "PHOTO";
}

function generateAdmissionNo() {
  const next = String(db.students.length + 1).padStart(3, "0");
  const yr = String(new Date().getFullYear()).slice(-2);
  const regNoEl = document.getElementById("studentRegNo");
  if (regNoEl) regNoEl.value = `MMS/${yr}/${next}`;
}

function saveStudent() {
  const data = {
    id: document.getElementById("studentId").value || id(),
    regNo: document.getElementById("studentRegNo").value.trim(),
    firstName: document.getElementById("studentFirst").value.trim(),
    middleName: document.getElementById("studentMiddle").value.trim(),
    lastName: document.getElementById("studentLast").value.trim(),
    gender: document.getElementById("studentGender").value,
    classId: document.getElementById("studentClass").value,
    dob: document.getElementById("studentDob").value,
    pob: document.getElementById("studentPob").value.trim(),
    nationality: document.getElementById("studentNationality").value.trim(),
    state: document.getElementById("studentState").value.trim(),
    lga: document.getElementById("studentLga").value.trim(),
    religion: document.getElementById("studentReligion").value.trim(),
    address: document.getElementById("studentAddress").value.trim(),
    contactPhone: document.getElementById("studentPhone").value.trim(),
    email: document.getElementById("studentEmail").value.trim(),
    parentName: document.getElementById("studentParent").value.trim(),
    parentRelation: document.getElementById("studentParentRelation").value.trim(),
    parentOccupation: document.getElementById("studentParentOccupation").value.trim(),
    parentPhone: document.getElementById("studentParentPhone").value.trim(),
    parentAltPhone: document.getElementById("studentAltPhone").value.trim(),
    parentAddress: document.getElementById("studentParentAddress").value.trim(),
    parentEmail: document.getElementById("studentParentEmail").value.trim(),
    prevSchool: document.getElementById("studentPrevSchool").value.trim(),
    lastClass: document.getElementById("studentLastClass").value.trim(),
    admissionDate: document.getElementById("studentAdmissionDate").value,
    status: document.getElementById("studentStatus").value,
    bloodGroup: document.getElementById("studentBloodGroup").value.trim(),
    genotype: document.getElementById("studentGenotype").value.trim(),
    allergies: document.getElementById("studentAllergies").value.trim(),
    medicalConditions: document.getElementById("studentMedicalConditions").value.trim(),
    emergencyContact: document.getElementById("studentEmergencyContact").value.trim(),
    photo: document.querySelector("#studentPhotoPreview img")?.src || null
  };

  if (!data.regNo || !data.firstName || !data.classId) {
    return toast("Admission no, first name, and class are required.");
  }

  const existing = db.students.findIndex((item) => item.id === data.id);
  const isEdit = existing >= 0;
  isEdit ? db.students.splice(existing, 1, data) : db.students.push(data);
  save();
  logActivity(isEdit ? "Student Edited" : "Student Added", `${data.firstName} ${data.lastName} (${data.regNo})`);
  toast("Student saved");
}

function editStudent(studentId) {
  const s = student(studentId);
  if (!s) return;

  document.getElementById("studentId").value = s.id;
  document.getElementById("studentRegNo").value = s.regNo;
  document.getElementById("studentFirst").value = s.firstName;
  document.getElementById("studentMiddle").value = s.middleName || "";
  document.getElementById("studentLast").value = s.lastName;
  document.getElementById("studentGender").value = s.gender;
  document.getElementById("studentClass").value = s.classId;
  document.getElementById("studentDob").value = s.dob || "";
  document.getElementById("studentPob").value = s.pob || "";
  document.getElementById("studentNationality").value = s.nationality || "";
  document.getElementById("studentState").value = s.state || "";
  document.getElementById("studentLga").value = s.lga || "";
  document.getElementById("studentReligion").value = s.religion || "";
  document.getElementById("studentAddress").value = s.address || s.parentAddress || "";
  document.getElementById("studentPhone").value = s.contactPhone || "";
  document.getElementById("studentEmail").value = s.email || "";
  document.getElementById("studentParent").value = s.parentName || "";
  document.getElementById("studentParentRelation").value = s.parentRelation || "";
  document.getElementById("studentParentOccupation").value = s.parentOccupation || "";
  document.getElementById("studentParentPhone").value = s.parentPhone || "";
  document.getElementById("studentAltPhone").value = s.parentAltPhone || "";
  document.getElementById("studentParentAddress").value = s.parentAddress || "";
  document.getElementById("studentParentEmail").value = s.parentEmail || "";
  document.getElementById("studentPrevSchool").value = s.prevSchool || "";
  document.getElementById("studentLastClass").value = s.lastClass || "";
  document.getElementById("studentAdmissionDate").value = s.admissionDate || "";
  document.getElementById("studentStatus").value = s.status || "Active";
  document.getElementById("studentBloodGroup").value = s.bloodGroup || "";
  document.getElementById("studentGenotype").value = s.genotype || "";
  document.getElementById("studentAllergies").value = s.allergies || "";
  document.getElementById("studentMedicalConditions").value = s.medicalConditions || "";
  document.getElementById("studentEmergencyContact").value = s.emergencyContact || "";

  const previewEl = document.getElementById("studentPhotoPreview");
  if (previewEl) {
    previewEl.innerHTML = s.photo ? `<img src="${s.photo}" style="width:100%;height:100%;object-fit:cover">` : "PHOTO";
  }
}

function deleteStudent(studentId) {
  if (!confirm("Delete this student and related scores, fees, and attendance?")) return;
  const s = student(studentId);
  const name = s ? `${fullName(s)} (${s.regNo})` : studentId;

  db.students = db.students.filter((item) => item.id !== studentId);
  db.scores = db.scores.filter((item) => item.studentId !== studentId);
  db.fees = db.fees.filter((item) => item.studentId !== studentId);
  db.attendance = db.attendance.filter((item) => item.studentId !== studentId);

  save();
  logActivity("Student Deleted", name);
  toast("Student deleted");
}

function promoteStudent(studentId) {
  const s = student(studentId);
  if (!s) return;

  const fromClass = cls(s.classId).name;
  const index = db.classes.findIndex((item) => item.id === s.classId);

  if (index >= 0 && db.classes[index + 1]) {
    s.classId = db.classes[index + 1].id;
    save();
    logActivity("Student Promoted", `${fullName(s)} from ${fromClass} → ${cls(s.classId).name}`);
    toast(`Student promoted to ${cls(s.classId).name}`);
  } else {
    toast("No next class available for promotion.");
  }
}

function showPromotionPanel() {
  const overlay = document.getElementById("promotionOverlay");
  const tableEl = document.getElementById("promotionMappingTable");
  if (!overlay || !tableEl) return;

  const classOpts = db.classes.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");

  const rows = db.classes.map(c => {
    const count = db.students.filter(s => s.classId === c.id && s.status !== "Graduated").length;
    return `<tr style="border-bottom:1px solid #f0f0f0">
      <td style="padding:9px 10px;font-weight:600">${esc(c.name)}</td>
      <td style="padding:9px 10px;color:#666;text-align:center">${count} student${count !== 1 ? "s" : ""}</td>
      <td style="padding:9px 10px;font-size:1.2em;color:#aaa;text-align:center">→</td>
      <td style="padding:9px 10px">
        <select data-from="${c.id}" style="width:100%;padding:5px 8px;border:1px solid #ccc;border-radius:5px">
          <option value="">— Stay in current class —</option>
          ${classOpts.replace(`value="${c.id}"`, `value="${c.id}" disabled`)}
          <option value="GRADUATED">🎓 Graduated (set inactive)</option>
        </select>
      </td>
    </tr>`;
  }).join("");

  tableEl.innerHTML = `<table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#f0f4f9">
      <th style="text-align:left;padding:8px 10px;font-size:.88em;color:#555">Current Class</th>
      <th style="padding:8px 10px;font-size:.88em;color:#555">Students</th>
      <th style="padding:8px 10px"></th>
      <th style="text-align:left;padding:8px 10px;font-size:.88em;color:#555">Promote To</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  overlay.classList.add("active");
}

function hidePromotionPanel() {
  const overlay = document.getElementById("promotionOverlay");
  if (overlay) overlay.classList.remove("active");
}

function runBulkPromotion() {
  const selects = document.querySelectorAll("#promotionMappingTable select[data-from]");
  const mapping = {};
  selects.forEach(sel => { if (sel.value) mapping[sel.dataset.from] = sel.value; });

  if (!Object.keys(mapping).length) return toast("No promotion mapping set — nothing to do.");

  const lines = Object.entries(mapping).map(([from, to]) => {
    const fromName = cls(from).name;
    const count = db.students.filter(s => s.classId === from && s.status !== "Graduated").length;
    return to === "GRADUATED"
      ? `• ${count} student(s) from ${fromName} → Graduated`
      : `• ${count} student(s) from ${fromName} → ${cls(to).name}`;
  }).join("\n");

  if (!confirm(`This will move students as follows:\n\n${lines}\n\nThis action cannot be undone. Continue?`)) return;

  let moved = 0, graduated = 0;
  db.students.forEach(s => {
    if (s.status === "Graduated") return;
    const target = mapping[s.classId];
    if (!target) return;
    if (target === "GRADUATED") { s.status = "Graduated"; s.classId = ""; graduated++; }
    else { s.classId = target; moved++; }
  });

  save();
  logActivity("Bulk Promotion", `${moved} students promoted, ${graduated} graduated — ${db.settings.term} ${db.settings.session}`);
  hidePromotionPanel();
  renderStudents();
  toast(`Promotion complete: ${moved} promoted, ${graduated} graduated.`);
}

function printStudentTable() {
  const tableEl = document.getElementById("studentTable");
  if (!tableEl) return toast("No student data to print.");
  const classId = document.getElementById("studentFilterClass")?.value || "";
  const className = classId ? cls(classId).name : "All Classes";

  const clone = tableEl.cloneNode(true);
  const headerCells = clone.querySelectorAll("thead tr th");
  headerCells.forEach((th, idx) => {
    if (idx === headerCells.length - 1) th.remove();
  });
  clone.querySelectorAll("tbody tr").forEach((tr) => {
    const cells = tr.querySelectorAll("td");
    if (cells.length) cells[cells.length - 1].remove();
  });

  const w = window.open("", "_blank", "width=900,height=700");
  w.document.write(`<!DOCTYPE html><html><head><title>Student List — ${esc(className)}</title><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 30px; color: #1a1a2e; }
    .print-header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #0d47a1; padding-bottom: 15px; }
    .print-header h2 { font-size: 20px; color: #0d47a1; margin-bottom: 5px; }
    .print-header p { font-size: 12px; color: #555; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
    th { background: #0d47a1; color: #fff; padding: 10px; text-align: left; font-weight: 600; }
    td { padding: 9px 10px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) { background: #f8fafc; }
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
    @media print {
      body { padding: 15px; }
      .no-print { display: none !important; }
    }
  </style></head><body>
    <div class="print-header">
      <h2>${esc(db.settings.schoolName)}</h2>
      <p>Student List — ${esc(className)} | Session: ${esc(db.settings.session)} | Term: ${esc(db.settings.term)} | Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    ${clone.outerHTML}
    <div class="footer">Printed from ${esc(db.settings.schoolName)} School Management System</div>
    <script>window.onload=()=>window.print();<\/script>
  </body></html>`);
}
