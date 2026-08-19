function saveAttendance() {
  const studentId = document.getElementById("attendanceStudent").value;
  if (!studentId) {
    return toast("Please select a student.");
  }

  const date = document.getElementById("attendanceDate").value || today;
  const status = document.getElementById("attendanceStatus").value;

  const existing = db.attendance.findIndex((a) => a.studentId === studentId && a.date === date);
  if (existing >= 0) {
    db.attendance[existing].status = status;
  } else {
    db.attendance.push({ id: id(), studentId: studentId, date: date, status: status });
  }

  save();
  toast("Attendance saved");
}

function renderAttendance() {
  const classId = document.getElementById("attendanceFilterClass")?.value || "";
  const tableEl = document.getElementById("attendanceTable");
  if (!tableEl) return;

  if (!classId) {
    tableEl.innerHTML = `<p class="hint" style="padding:30px;text-align:center;color:#888">Please select a class to view attendance.</p>`;
    return;
  }

  let filteredAttendance = db.attendance.slice().reverse();

  if (currentUser?.role === "Teacher" && currentUser?.staffId) {
    const assignedClasses = [...new Set(db.subjects.filter((s) => s.teacherId === currentUser.staffId).map((s) => s.classId))];
    filteredAttendance = db.attendance.filter((a) => {
      const s = db.students.find((st) => st.id === a.studentId);
      return s && assignedClasses.includes(s.classId);
    }).slice().reverse();
  }

  filteredAttendance = filteredAttendance.filter((a) => {
    const s = db.students.find((st) => st.id === a.studentId);
    return s && s.classId === classId;
  });

  const statusClass = (status) => {
    const lower = status.toLowerCase();
    if (lower === "present") return "status-present";
    if (lower === "absent") return "status-absent";
    if (lower === "late") return "status-late";
    return "";
  };

  tableEl.innerHTML = table(
    ["Date", "Student", "Class", "Status"],
    filteredAttendance.map((a) => {
      const s = student(a.studentId) || {};
      const statusBadge = `<span class="status-badge ${statusClass(a.status)}">${esc(a.status)}</span>`;
      return [esc(a.date), esc(fullName(s)), esc(cls(s.classId).name), statusBadge];
    })
  );
}
