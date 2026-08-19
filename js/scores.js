function gradeNgLabel(t) {
  t = Math.max(0, Math.min(100, Number(t || 0)));
  if (t >= 75) return "A1";
  if (t >= 70) return "B2";
  if (t >= 65) return "B3";
  if (t >= 60) return "C4";
  if (t >= 55) return "C5";
  if (t >= 50) return "C6";
  if (t >= 45) return "D7";
  if (t >= 40) return "E8";
  return "F9";
}

function previewScore() {
  const ca1El = document.getElementById("scoreCa1");
  const ca2El = document.getElementById("scoreCa2");
  const examEl = document.getElementById("scoreExam");
  if (!ca1El || !ca2El || !examEl) return;

  const ca1 = Math.min(20, Math.max(0, Number(ca1El.value || 0)));
  const ca2 = Math.min(20, Math.max(0, Number(ca2El.value || 0)));
  const exam = Math.min(60, Math.max(0, Number(examEl.value || 0)));
  const ca = ca1 + ca2;
  const total = ca + exam;
  const result = gradeFor(total);

  ca1El.value = ca1;
  ca2El.value = ca2;
  examEl.value = exam;

  const totalEl = document.getElementById("scoreTotal");
  const gradeEl = document.getElementById("scoreGrade");
  const remarkEl = document.getElementById("scoreRemark");
  if (totalEl) totalEl.value = total;
  if (gradeEl) gradeEl.value = result.grade;
  if (remarkEl) remarkEl.value = result.remark;
}

function saveScore() {
  previewScore();
  const studentId = document.getElementById("scoreStudent").value;
  const subjectId = document.getElementById("scoreSubject").value;
  const stu = student(studentId);
  if (!stu || !subjectId) return toast("Select student and subject.");

  const existing = db.scores.find((item) => item.studentId === stu.id && item.subjectId === subjectId);
  const ca1 = Number(document.getElementById("scoreCa1").value);
  const ca2 = Number(document.getElementById("scoreCa2").value);
  const psychomotor = Number(document.getElementById("scorePsychomotor").value);
  const affective = Number(document.getElementById("scoreAffective").value);

  const data = {
    id: existing?.id || id(),
    studentId: stu.id,
    subjectId: subjectId,
    ca1,
    ca2,
    ca: ca1 + ca2,
    exam: Number(document.getElementById("scoreExam").value),
    total: Number(document.getElementById("scoreTotal").value),
    grade: document.getElementById("scoreGrade").value,
    remark: document.getElementById("scoreRemark").value,
    approved: false,
    term: db.settings.term,
    session: db.settings.session,
    psychomotor,
    affective
  };

  existing ? Object.assign(existing, data) : db.scores.push(data);
  save();
  logActivity("Score Saved", `${fullName(stu)} — ${subject(subjectId).name} (${db.settings.term} ${db.settings.session})`);
  toast("Score saved");
}

function isClassApproved(classId, term, session) {
  if (!db.classApprovals) return false;
  return db.classApprovals.some(a => a.classId === classId && a.term === term && a.session === session && a.approved);
}

function approveClass(classId) {
  if (!db.classApprovals) db.classApprovals = [];
  const term = db.settings.term;
  const session = db.settings.session;
  const existing = db.classApprovals.find(a => a.classId === classId && a.term === term && a.session === session);
  const entry = { classId, term, session, approved: true, approvedBy: currentUser?.username || "admin", approvedAt: new Date().toISOString() };
  existing ? Object.assign(existing, entry) : db.classApprovals.push(entry);

  logActivity("Class Approved", `${cls(classId).name} — ${term} ${session}`);

  db.scores.filter(sc => {
    const stu = db.students.find(st => st.id === sc.studentId);
    return stu && stu.classId === classId && sc.term === term && sc.session === session;
  }).forEach(sc => sc.approved = true);

  save();
  toast("Class approved — report cards are now printable.");
  renderApprovalPanel();
}

function revokeClass(classId) {
  if (!db.classApprovals) db.classApprovals = [];
  const term = db.settings.term;
  const session = db.settings.session;
  const existing = db.classApprovals.find(a => a.classId === classId && a.term === term && a.session === session);
  if (existing) existing.approved = false;

  db.scores.filter(sc => {
    const stu = db.students.find(st => st.id === sc.studentId);
    return stu && stu.classId === classId && sc.term === term && sc.session === session;
  }).forEach(sc => sc.approved = false);

  save();
  toast("Approval revoked — scores returned for correction.");
  renderApprovalPanel();
}

function renderApprovalPanel() {
  const panel = document.getElementById("approvalPanel");
  const tableEl = document.getElementById("approvalTable");
  const labelEl = document.getElementById("approvalTermLabel");
  if (!panel || !tableEl) return;

  const term = db.settings.term;
  const session = db.settings.session;
  if (labelEl) labelEl.textContent = `${term} — ${session}`;

  const role = currentUser?.role;
  if (role !== "Exam Officer" && role !== "Administrator") {
    panel.classList.add("hide");
    return;
  }
  panel.classList.remove("hide");

  const btnApproveAll = document.getElementById("btnApproveAll");
  if (btnApproveAll) btnApproveAll.style.display = (role === "Administrator") ? "" : "none";

  const rows = db.classes.map(c => {
    const students = db.students.filter(s => s.classId === c.id);
    const classScores = db.scores.filter(sc => {
      const stu = db.students.find(st => st.id === sc.studentId);
      return stu && stu.classId === c.id && sc.term === term && sc.session === session;
    });
    const expectedScores = students.length * db.subjects.filter(s => s.classId === c.id).length;
    const approved = isClassApproved(c.id, term, session);
    const statusBadge = approved
      ? `<span class="pill" style="background:#1b5e20;color:#fff">✓ Approved</span>`
      : classScores.length === 0
        ? `<span class="pill warn">No Scores</span>`
        : `<span class="pill bad">Pending</span>`;
    const actions = approved
      ? `<button class="danger no-print" style="padding:3px 10px;font-size:.8em" onclick="revokeClass('${c.id}')">Revoke</button>`
      : classScores.length > 0
        ? `<button class="primary no-print" style="padding:3px 10px;font-size:.8em" onclick="approveClass('${c.id}')">Approve</button>`
        : `—`;
    return `<tr><td>${esc(c.name)}</td><td>${students.length}</td><td>${classScores.length} / ${expectedScores || "—"}</td><td>${statusBadge}</td><td>${actions}</td></tr>`;
  }).join("");

  tableEl.innerHTML = `<table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#f0f4f9">
      <th style="text-align:left;padding:7px 10px;border-bottom:2px solid #c8d8ea">Class</th>
      <th style="padding:7px 10px;border-bottom:2px solid #c8d8ea">Students</th>
      <th style="padding:7px 10px;border-bottom:2px solid #c8d8ea">Scores Entered</th>
      <th style="padding:7px 10px;border-bottom:2px solid #c8d8ea">Status</th>
      <th style="padding:7px 10px;border-bottom:2px solid #c8d8ea">Action</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function publishResults() {
  if (!confirm("Approve ALL classes for " + db.settings.term + " " + db.settings.session + "?")) return;
  if (!db.classApprovals) db.classApprovals = [];
  const term = db.settings.term;
  const session = db.settings.session;

  db.classes.forEach(c => {
    const existing = db.classApprovals.find(a => a.classId === c.id && a.term === term && a.session === session);
    const entry = { classId: c.id, term, session, approved: true, approvedBy: currentUser?.username || "admin", approvedAt: new Date().toISOString() };
    existing ? Object.assign(existing, entry) : db.classApprovals.push(entry);
  });

  db.scores.filter(sc => sc.term === term && sc.session === session).forEach(sc => sc.approved = true);
  db.published = true;

  save();
  logActivity("All Classes Approved", `${term} ${session} — results published`);
  toast("All classes approved and results published.");
  renderApprovalPanel();
}

function setScoreMode(mode) {
  const isBulk = mode === "bulk";
  const singlePanel = document.getElementById("singleEntryPanel");
  const bulkPanel = document.getElementById("bulkEntryPanel");
  const btnSingle = document.getElementById("btnSingleEntry");
  const btnBulk = document.getElementById("btnBulkEntry");

  if (singlePanel) singlePanel.classList.toggle("hide", isBulk);
  if (bulkPanel) bulkPanel.classList.toggle("hide", !isBulk);
  if (btnSingle) btnSingle.className = isBulk ? "secondary" : "primary";
  if (btnBulk) btnBulk.className = isBulk ? "primary" : "secondary";

  if (isBulk) {
    populateBulkSelects();
    loadBulkEntry();
  }
}

function populateBulkSelects() {
  const classEl = document.getElementById("bulkClass");
  const subjEl = document.getElementById("bulkSubject");
  if (!classEl || !subjEl) return;

  let classes = db.classes;
  if (currentUser?.role === "Teacher" && currentUser?.staffId) {
    const teacherClassIds = [...new Set(db.subjects.filter(s => s.teacherId === currentUser.staffId).map(s => s.classId))];
    classes = db.classes.filter(c => teacherClassIds.includes(c.id));
  }
  classEl.innerHTML = classes.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");

  const updateSubjects = () => {
    const cId = classEl.value;
    let subjects = db.subjects.filter(s => s.classId === cId);
    if (currentUser?.role === "Teacher" && currentUser?.staffId) {
      subjects = subjects.filter(s => s.teacherId === currentUser.staffId);
    }
    subjEl.innerHTML = subjects.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("");
    if (subjects.length) {
      subjEl.value = subjects[0].id;
    }
    loadBulkEntry();
  };

  classEl.removeEventListener("change", classEl._subjectUpdater);
  classEl._subjectUpdater = updateSubjects;
  classEl.addEventListener("change", updateSubjects);
  updateSubjects();
}

function loadBulkEntry() {
  const classId = document.getElementById("bulkClass")?.value;
  const subjectId = document.getElementById("bulkSubject")?.value;
  const container = document.getElementById("bulkEntryTable");
  const title = document.getElementById("bulkTableTitle");
  if (!classId || !subjectId || !container) return;

  const students = db.students.filter(st => st.classId === classId);
  const subj = db.subjects.find(s => s.id === subjectId);
  if (title) title.textContent = `${subj ? esc(subj.name) : ""} — ${esc(cls(classId).name)}`;

  if (!students.length) {
    container.innerHTML = `<p class="hint">No students in this class.</p>`;
    return;
  }

  const rows = students.map((st, idx) => {
    const existing = db.scores.find(sc => sc.studentId === st.id && sc.subjectId === subjectId);
    const ca1 = existing?.ca1 ?? (existing ? Math.round((existing.ca || 0) / 2) : "");
    const ca2 = existing?.ca2 ?? (existing ? (existing.ca || 0) - Math.round((existing.ca || 0) / 2) : "");
    const exam = existing?.exam ?? "";
    const tot = existing?.total ?? "";
    const grd = existing ? gradeNgLabel(existing.total) : "";
    const bg = idx % 2 === 0 ? "#fff" : "#f5f8fc";
    return `<tr style="background:${bg}" data-student-id="${st.id}">
      <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px">${idx + 1}</td>
      <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px;white-space:nowrap">${esc(st.regNo)}</td>
      <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px;font-weight:600">${esc(fullName(st))}</td>
      <td style="padding:3px;border:1px solid #ddd"><input type="number" min="0" max="20" value="${ca1}" placeholder="0" style="width:52px;text-align:center;border:1px solid #ccc;border-radius:4px;padding:3px" class="bulk-ca1" oninput="updateBulkRow(this)"></td>
      <td style="padding:3px;border:1px solid #ddd"><input type="number" min="0" max="20" value="${ca2}" placeholder="0" style="width:52px;text-align:center;border:1px solid #ccc;border-radius:4px;padding:3px" class="bulk-ca2" oninput="updateBulkRow(this)"></td>
      <td style="padding:3px;border:1px solid #ddd"><input type="number" min="0" max="60" value="${exam}" placeholder="0" style="width:52px;text-align:center;border:1px solid #ccc;border-radius:4px;padding:3px" class="bulk-exam" oninput="updateBulkRow(this)"></td>
      <td style="padding:5px 8px;border:1px solid #ddd;text-align:center;font-weight:800;font-size:12px" class="bulk-total">${tot}</td>
      <td style="padding:5px 8px;border:1px solid #ddd;text-align:center;font-weight:700;font-size:12px" class="bulk-grade">${grd}</td>
    </tr>`;
  }).join("");

  container.innerHTML = `<table class="bulk-table">
    <thead>
      <tr style="background:#1565c0;color:#fff">
        <th style="padding:6px 8px;border:1px solid #0d47a1;text-align:center">#</th>
        <th style="padding:6px 8px;border:1px solid #0d47a1;text-align:left">Reg No</th>
        <th style="padding:6px 8px;border:1px solid #0d47a1;text-align:left">Student Name</th>
        <th style="padding:6px 8px;border:1px solid #0d47a1;text-align:center">CA1 /20</th>
        <th style="padding:6px 8px;border:1px solid #0d47a1;text-align:center">CA2 /20</th>
        <th style="padding:6px 8px;border:1px solid #0d47a1;text-align:center">Exam /60</th>
        <th style="padding:6px 8px;border:1px solid #0d47a1;text-align:center">Total</th>
        <th style="padding:6px 8px;border:1px solid #0d47a1;text-align:center">Grade</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function updateBulkRow(input) {
  const row = input.closest("tr");
  if (!row) return;

  const ca1 = Math.min(20, Math.max(0, Number(row.querySelector(".bulk-ca1").value) || 0));
  const ca2 = Math.min(20, Math.max(0, Number(row.querySelector(".bulk-ca2").value) || 0));
  const exam = Math.min(60, Math.max(0, Number(row.querySelector(".bulk-exam").value) || 0));
  const tot = ca1 + ca2 + exam;

  const totalEl = row.querySelector(".bulk-total");
  const gradeEl = row.querySelector(".bulk-grade");
  if (totalEl) totalEl.textContent = tot;
  if (gradeEl) gradeEl.textContent = tot > 0 ? gradeNgLabel(tot) : "";
}

function saveBulkScores() {
  const subjectId = document.getElementById("bulkSubject")?.value;
  if (!subjectId) return toast("Select a subject first.");

  const rows = document.querySelectorAll("#bulkEntryTable tbody tr");
  let saved = 0;

  rows.forEach(row => {
    const studentId = row.dataset.studentId;
    const ca1 = Math.min(20, Math.max(0, Number(row.querySelector(".bulk-ca1").value) || 0));
    const ca2 = Math.min(20, Math.max(0, Number(row.querySelector(".bulk-ca2").value) || 0));
    const exam = Math.min(60, Math.max(0, Number(row.querySelector(".bulk-exam").value) || 0));

    if (ca1 === 0 && ca2 === 0 && exam === 0) return;

    const total = ca1 + ca2 + exam;
    const g = gradeFor(total);
    const existing = db.scores.find(sc => sc.studentId === studentId && sc.subjectId === subjectId);
    const data = {
      id: existing?.id || id(),
      studentId,
      subjectId,
      ca1,
      ca2,
      ca: ca1 + ca2,
      exam,
      total,
      grade: g.grade,
      remark: g.remark,
      approved: false,
      term: db.settings.term,
      session: db.settings.session
    };
    existing ? Object.assign(existing, data) : db.scores.push(data);
    saved++;
  });

  if (!saved) return toast("No scores to save (all fields empty).");
  save();
  loadBulkEntry();
  toast(`${saved} score${saved > 1 ? "s" : ""} saved successfully.`);
}

function rankedStudents(classId) {
  return db.students
    .filter((s) => !classId || s.classId === classId)
    .map((s) => {
      const scores = db.scores.filter((score) => score.studentId === s.id);
      const total = scores.reduce((sum, score) => sum + score.total, 0);
      const avg = scores.length ? total / scores.length : 0;
      return { ...s, total, avg, grade: gradeFor(avg).grade };
    })
    .sort((a, b) => b.total - a.total)
    .map((s, index) => ({ ...s, position: index + 1 }));
}

function renderScores() {
  previewScore();
  let targetClassId = document.getElementById("scoreFilterClass")?.value || "";

  if (!targetClassId && currentUser?.role === "Teacher" && currentUser?.staffId) {
    const assignedClasses = [...new Set(db.subjects.filter((s) => s.teacherId === currentUser.staffId).map((s) => s.classId))];
    targetClassId = assignedClasses.length === 1 ? assignedClasses[0] : "";
  }

  const tableEl = document.getElementById("scoreTable");
  if (!tableEl) return;

  if (!targetClassId) {
    tableEl.innerHTML = `<p class="hint" style="padding:30px;text-align:center;color:#888">Please select a class to view scores.</p>`;
    renderApprovalPanel();
    return;
  }

  tableEl.innerHTML = table(
    ["Position", "Reg No", "Name", "Class", "Total", "Average", "Grade"],
    rankedStudents(targetClassId).map((s) => [s.position, esc(s.regNo), esc(fullName(s)), esc(cls(s.classId).name), s.total, s.avg.toFixed(2), s.grade])
  );
  renderApprovalPanel();
}

function printScoreTable() {
  const tableEl = document.getElementById("scoreTable");
  if (!tableEl) return toast("No score data to print.");

  const classId = document.getElementById("scoreFilterClass")?.value || "";
  const className = classId ? cls(classId).name : "All Classes";

  const ranked = rankedStudents(classId);
  const rows = ranked.map((s, idx) => [
    idx + 1,
    esc(s.regNo),
    esc(fullName(s)),
    esc(cls(s.classId).name),
    s.total,
    s.avg.toFixed(2),
    s.grade,
    idx + 1
  ]);

  const tableHtml = table(["S/No", "Reg No", "Name", "Class", "Total", "Average", "Grade", "Position"], rows);

  const w = window.open("", "_blank", "width=900,height=700");
  w.document.write(`<!DOCTYPE html><html><head><title>Class Broadsheet — ${esc(className)}</title><style>
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
      <p>Class Broadsheet — ${esc(className)} | Session: ${esc(db.settings.session)} | Term: ${esc(db.settings.term)} | Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    ${tableHtml}
    <div class="footer">Printed from ${esc(db.settings.schoolName)} School Management System</div>
    <script>window.onload=()=>window.print();<\/script>
  </body></html>`);
}
