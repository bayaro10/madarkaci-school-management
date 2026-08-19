function renderDashboard() {
  const dashboardContent = document.getElementById("dashboardContent");
  if (!dashboardContent) return;

  document.getElementById("schoolTitle").textContent = db.settings.schoolName;
  document.getElementById("sessionLabel").textContent = `${db.settings.session} | ${db.settings.term} | Days Open: ${db.settings.daysOpen}`;

  const role = currentUser?.role || "Guest";
  document.getElementById("dashboardTitle").textContent = `${role} Dashboard`;

  const content = dashboardContent;

  const banner = (gradient, initials, name, sub) => {
    return `<div class="dashboard-banner" style="background:${gradient}">
      <div class="banner-avatar">${initials}</div>
      <div class="banner-text">
        <div class="banner-title">${esc(name)}</div>
        <div class="banner-subtitle">${esc(sub)}</div>
      </div>
    </div>`;
  };

  const statCard = (icon, label, value, color) => {
    return `<div class="stat-card" style="border-top-color:${color}">
      <span class="stat-icon">${icon}</span>
      <div class="stat-value">${esc(value)}</div>
      <div class="stat-label">${esc(label)}</div>
    </div>`;
  };

  const navGrid = (items) => `<div class="nav-grid">${items.join("")}</div>`;

  const statRow = (cards) => `<div class="stat-row">${cards.join("")}</div>`;

  const panel = (title, body, span) => {
    return `<div class="panel${span ? " " + span : ""}" style="margin-bottom:0"><h3 style="margin-bottom:10px">${esc(title)}</h3>${body}</div>`;
  };

  const twoCol = (a, b) => `<div class="two-col">${a}${b}</div>`;

  const navBtn = (icon, label, sub, page) => {
    return `<div class="nav-card" onclick="showPage('${page}')">
      <span class="nav-icon">${icon}</span>
      <span class="nav-label">${esc(label)}</span>
      ${sub ? `<span class="nav-sub">${esc(sub)}</span>` : ""}
    </div>`;
  };

  // ── ADMINISTRATOR ────────────────────────────────────────
  if (hasPermission("users")) {
    const totalFeeBalance = db.fees.reduce((s, f) => s + Math.max(0, f.amountDue - f.amountPaid), 0);
    const approvedScores = db.scores.filter(sc => sc.approved).length;
    const recentStudentRows = db.students.slice(-5).reverse().map(s => [esc(s.regNo), esc(fullName(s)), esc(cls(s.classId).name)]);
    const recentLogs = (db.auditLog || []).slice(0, 6).map(l => {
      const d = new Date(l.timestamp);
      const ts = isNaN(d) ? "—" : `${d.toLocaleDateString()} ${d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`;
      return [esc(ts), esc(l.username), `<span style="font-weight:600;color:#1565c0">${esc(l.action)}</span>`];
    });

    content.innerHTML =
      banner("linear-gradient(135deg,#1565c0 0%,#1976d2 60%,#42a5f5 100%)", "⚙", `Welcome, ${esc(currentUser.username)}`, `${esc(db.settings.schoolName)} · ${esc(db.settings.term)}, ${esc(db.settings.session)}`) +
      statRow([
        statCard("👥", "Total Students", db.students.length, "#1565c0"),
        statCard("👨‍🏫", "Total Staff", db.staff.length, "#388e3c"),
        statCard("🏫", "Classes", db.classes.length, "#f9a825"),
        statCard("📚", "Subjects", db.subjects.length, "#7b1fa2"),
        statCard("✅", "Approved Scores", approvedScores, "#388e3c"),
        statCard("💰", "Fee Balance", money(totalFeeBalance), "#c62828"),
      ]) +
      `<h4 class="section-label">Quick Access</h4>` +
      navGrid([
        navBtn("👥","Students","Manage records","students"),
        navBtn("👨‍🏫","Staff","Manage staff","staff"),
        navBtn("🏫","Classes","Classes & sections","classes"),
        navBtn("📚","Subjects","Subject list","subjects"),
        navBtn("✍️","Scores","Enter & approve","scores"),
        navBtn("💳","Fees","Payments & balance","fees"),
        navBtn("📅","Attendance","Daily marking","attendance"),
        navBtn("📋","Reports","Print & download","reports"),
        navBtn("👤","Users","Login accounts","users"),
        navBtn("⚙️","Settings","School settings","settings"),
        navBtn("🗓","Calendar","Events & backup","tools"),
        navBtn("🔍","Activity Log","Audit trail","activity"),
      ]) +
      twoCol(
        panel("Recent Students", recentStudentRows.length ? table(["Reg No","Name","Class"], recentStudentRows) : "<p class='hint'>No students yet.</p>"),
        panel("Recent Activity", recentLogs.length ? table(["Time","User","Action"], recentLogs) : "<p class='hint'>No activity logged yet.</p>")
      );
    return;
  }

  // ── TEACHER ─────────────────────────────────────────────
  if (normalizeRole(role) === "teacher") {
    const staffId = currentUser?.staffId;
    const staffMember = staffId ? db.staff.find(s => s.id === staffId) : null;
    const mySubjects = staffId ? db.subjects.filter(s => s.teacherId === staffId) : [];
    const myClassIds = [...new Set(mySubjects.map(s => s.classId))];
    const myClasses = db.classes.filter(c => myClassIds.includes(c.id));
    const myScores = db.scores.filter(sc => mySubjects.some(s => s.id === sc.subjectId));
    const pending = myScores.filter(sc => !sc.approved).length;

    const subjectRows = mySubjects.map(s => [esc(s.name), esc(cls(s.classId).name)]);
    const classRows = myClasses.map(c => [esc(c.name), db.students.filter(s => s.classId === c.id).length + " students"]);

    content.innerHTML =
      banner("linear-gradient(135deg,#2e7d32 0%,#388e3c 60%,#66bb6a 100%)", "👩‍🏫", `Welcome, ${esc(staffMember ? fullName(staffMember) : currentUser.username)}`, `Teacher · ${esc(db.settings.term)}, ${esc(db.settings.session)}`) +
      statRow([
        statCard("📚", "My Subjects", mySubjects.length, "#2e7d32"),
        statCard("🏫", "My Classes", myClasses.length, "#1565c0"),
        statCard("✍️", "Scores Entered", myScores.length, "#f9a825"),
        statCard("⏳", "Pending Approval", pending, pending > 0 ? "#c62828" : "#388e3c"),
      ]) +
      `<h4 class="section-label">Quick Access</h4>` +
      navGrid([
        navBtn("✍️","Enter Scores","Record results","scores"),
        navBtn("📅","Attendance","Mark daily","attendance"),
        navBtn("📋","Reports","View & print","reports"),
      ]) +
      twoCol(
        panel("My Subjects", subjectRows.length ? table(["Subject","Class"], subjectRows) : "<p class='hint'>No subjects assigned yet.</p>"),
        panel("My Classes", classRows.length ? table(["Class","Students"], classRows) : "<p class='hint'>No classes assigned yet.</p>")
      );
    return;
  }

  // ── EXAM OFFICER ─────────────────────────────────────────
  if (normalizeRole(role) === "examofficer") {
    const totalScores = db.scores.length;
    const term = db.settings.term;
    const session = db.settings.session;
    const approvals = db.classApprovals || [];
    const approvedClasses = approvals.filter(a => a.term === term && a.session === session && a.approved).length;
    const pendingClasses = db.classes.length - approvedClasses;

    const classStatusRows = db.classes.map(c => {
      const approved = approvals.some(a => a.classId === c.id && a.term === term && a.session === session && a.approved);
      const stuCount = db.students.filter(s => s.classId === c.id).length;
      const scCount = db.scores.filter(sc => {
        const stu = db.students.find(st => st.id === sc.studentId);
        return stu && stu.classId === c.id && sc.term === term && sc.session === session;
      }).length;
      return [esc(c.name), stuCount, scCount, approved ? '<span class="pill">✓ Approved</span>' : '<span class="pill warn">Pending</span>'];
    });

    content.innerHTML =
      banner("linear-gradient(135deg,#6a1b9a 0%,#8e24aa 60%,#ba68c8 100%)", "🔍", `Exam Officer Dashboard`, `${esc(db.settings.schoolName)} · ${esc(term)}, ${esc(session)}`) +
      statRow([
        statCard("🏫", "Total Classes", db.classes.length, "#6a1b9a"),
        statCard("✅", "Approved Classes", approvedClasses, "#2e7d32"),
        statCard("⏳", "Pending Approval", pendingClasses, pendingClasses > 0 ? "#c62828" : "#388e3c"),
        statCard("📝", "Total Scores", totalScores, "#1565c0"),
      ]) +
      `<h4 class="section-label">Quick Access</h4>` +
      navGrid([
        navBtn("✍️","Scores","Enter & approve","scores"),
        navBtn("📋","Reports","Broadsheet & cards","reports"),
      ]) +
      panel("Class Approval Status — " + esc(term) + " " + esc(session),
        classStatusRows.length ? table(["Class","Students","Scores Entered","Status"], classStatusRows) : "<p class='hint'>No classes found.</p>");
    return;
  }

  // ── ACCOUNTANT ───────────────────────────────────────────
  if (normalizeRole(role) === "accountant") {
    const totalDue = db.fees.reduce((s, f) => s + (f.amountDue || 0), 0);
    const totalPaid = db.fees.reduce((s, f) => s + (f.amountPaid || 0), 0);
    const totalBalance = totalDue - totalPaid;
    const studentsWithBalance = db.fees.filter(f => f.amountDue > f.amountPaid).length;
    const recentFees = [...db.fees].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8).map(f => {
      const s = student(f.studentId);
      return [esc(s ? fullName(s) : "Unknown"), money(f.amountPaid), money(Math.max(0, f.amountDue - f.amountPaid)), esc(f.date || "—")];
    });

    content.innerHTML =
      banner("linear-gradient(135deg,#e65100 0%,#f57c00 60%,#ffb74d 100%)", "💳", `Accounts Dashboard`, `${esc(db.settings.schoolName)} · ${esc(db.settings.term)}, ${esc(db.settings.session)}`) +
      statRow([
        statCard("💰", "Total Expected", money(totalDue), "#e65100"),
        statCard("✅", "Total Collected", money(totalPaid), "#2e7d32"),
        statCard("🔴", "Outstanding Balance", money(totalBalance), "#c62828"),
        statCard("👥", "Students with Balance", studentsWithBalance, "#f9a825"),
      ]) +
      `<h4 class="section-label">Quick Access</h4>` +
      navGrid([
        navBtn("💳","Fee Management","Record payments","fees"),
        navBtn("🌐","Online Payments","Payment links","payments"),
        navBtn("📒","Cash Book","Income/expense log","cashbook"),
        navBtn("💸","Expenses","Record expenses","expenses"),
        navBtn("📥","Income","Record income","income"),
        navBtn("🧾","Payroll","Staff payments","payroll"),
        navBtn("📋","Reports","Financial reports","reports"),
      ]) +
      panel("Recent Fee Payments", recentFees.length ? table(["Student","Paid","Balance","Date"], recentFees) : "<p class='hint'>No fee records yet.</p>");
    return;
  }

  // ── STUDENT ──────────────────────────────────────────────
  if (normalizeRole(role) === "student") {
    const firstStudent = db.students[0];
    if (!firstStudent) {
      content.innerHTML = "<p class='hint' style='padding:40px'>No student record linked to this account.</p>";
      return;
    }
    const myStudentScores = db.scores.filter(sc => sc.studentId === firstStudent.id);
    const avg = myStudentScores.length ? (myStudentScores.reduce((s, sc) => s + sc.total, 0) / myStudentScores.length).toFixed(1) : "—";
    const presentDays = db.attendance.filter(a => a.studentId === firstStudent.id && a.status === "Present").length;
    const myFee = db.fees.find(f => f.studentId === firstStudent.id);
    const balance = myFee ? Math.max(0, myFee.amountDue - myFee.amountPaid) : 0;
    const recentScoreRows = myStudentScores.slice(-6).reverse().map(sc => [esc(subject(sc.subjectId).name), sc.ca, sc.exam, sc.total, `<span class="pill${sc.total < 40 ? " bad" : ""}">${esc(sc.grade)}</span>`]);

    content.innerHTML =
      banner("linear-gradient(135deg,#00695c 0%,#00897b 60%,#4db6ac 100%)", "🎓", `Welcome, ${esc(firstStudent.firstName)}`, `${esc(cls(firstStudent.classId).name)} · ${esc(db.settings.term)}, ${esc(db.settings.session)}`) +
      statRow([
        statCard("🏫", "My Class", esc(cls(firstStudent.classId).name), "#00695c"),
        statCard("📊", "My Average", avg, "#1565c0"),
        statCard("📅", "Days Present", presentDays, "#2e7d32"),
        statCard("💰", "Fee Balance", money(balance), balance > 0 ? "#c62828" : "#2e7d32"),
      ]) +
      `<h4 class="section-label">Quick Access</h4>` +
      navGrid([
        navBtn("🔍","Check Result","View full result","portals"),
        navBtn("📋","Reports","Print report card","reports"),
        navBtn("💳","Fee Status","View fee record","fees"),
      ]) +
      panel("My Recent Scores", recentScoreRows.length ? table(["Subject","CA","Exam","Total","Grade"], recentScoreRows) : "<p class='hint'>No scores recorded yet.</p>");
    return;
  }

  // ── PARENT ───────────────────────────────────────────────
  if (normalizeRole(role) === "parent") {
    const child = db.students[0];
    if (!child) {
      content.innerHTML = "<p class='hint' style='padding:40px'>No child record linked to this account.</p>";
      return;
    }
    const childScores = db.scores.filter(sc => sc.studentId === child.id);
    const avg = childScores.length ? (childScores.reduce((s, sc) => s + sc.total, 0) / childScores.length).toFixed(1) : "—";
    const presentDays = db.attendance.filter(a => a.studentId === child.id && a.status === "Present").length;
    const childFee = db.fees.find(f => f.studentId === child.id);
    const balance = childFee ? Math.max(0, childFee.amountDue - childFee.amountPaid) : 0;
    const scoreRows = childScores.slice(-6).reverse().map(sc => [esc(subject(sc.subjectId).name), sc.ca, sc.exam, sc.total, `<span class="pill${sc.total < 40 ? " bad" : ""}">${esc(sc.grade)}</span>`]);

    content.innerHTML =
      banner("linear-gradient(135deg,#283593 0%,#3949ab 60%,#7986cb 100%)", "👪", `Welcome, Parent`, `Child: ${esc(fullName(child))} · ${esc(cls(child.classId).name)}`) +
      statRow([
        statCard("🏫", "Child's Class", esc(cls(child.classId).name), "#283593"),
        statCard("📊", "Current Average", avg, "#1565c0"),
        statCard("📅", "Days Present", presentDays, "#2e7d32"),
        statCard("💰", "Fee Balance", money(balance), balance > 0 ? "#c62828" : "#2e7d32"),
      ]) +
      `<h4 class="section-label">Quick Access</h4>` +
      navGrid([
        navBtn("🔍","Check Result","View child's result","portals"),
        navBtn("💳","Fee Status","Fee details","fees"),
        navBtn("📅","Attendance","Attendance record","attendance"),
      ]) +
      panel("Child's Recent Scores", scoreRows.length ? table(["Subject","CA","Exam","Total","Grade"], scoreRows) : "<p class='hint'>No scores available yet.</p>");
    return;
  }

  content.innerHTML = `<p class='hint' style='padding:40px;text-align:center'>Please log in to access your dashboard.</p>`;
  if (currentUser) renderGenericDashboard();
}

function renderGenericDashboard() {
  const content = document.getElementById("dashboardContent");
  if (!content) return;

  const role = currentUser?.role || "User";
  const perms = getCurrentPermissions();
  content.innerHTML =
    banner("linear-gradient(135deg,#1565c0 0%,#1976d2 60%,#42a5f5 100%)", "👤", `Welcome, ${esc(role)}`, `${esc(db.settings.schoolName)} · ${esc(db.settings.term)}, ${esc(db.settings.session)}`) +
    `<h4 class="section-label">Your Permissions</h4>` +
    `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">${perms.map(p => `<span class="pill">${esc(p)}</span>`).join("")}</div>`;
}

function getCurrentPermissions() {
  const role = currentUser?.role;
  if (!role || !db.roles) return [];
  const roleDef = db.roles.find((r) => r.name === role);
  return roleDef ? roleDef.permissions : [];
}

function studentSummaryForPortal() {
  const firstStudent = db.students[0];
  if (!firstStudent) return { student: null, total: 0, average: 0, balance: 0, present: 0 };
  const scores = db.scores.filter((score) => score.studentId === firstStudent.id);
  const total = scores.reduce((sum, score) => sum + score.total, 0);
  const average = scores.length ? total / scores.length : 0;
  const fee = db.fees.find((item) => item.studentId === firstStudent.id);
  const balance = fee ? Math.max(0, fee.amountDue - fee.amountPaid) : 0;
  const present = db.attendance.filter((item) => item.studentId === firstStudent.id && item.status === "Present").length;
  return { student: firstStudent, total, average, balance, present };
}

function roleActionButton(label, target) {
  return `<button class="secondary" onclick="showPage('${target}')">${label}</button>`;
}

function renderRolePanels() {}
