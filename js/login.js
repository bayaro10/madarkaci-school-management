const API_URL = "/api/db";
let db = null;

const seed = {
  settings: { schoolName: "Madarkaci Model Schools" },
  users: [
    { id: "u1", username: "admin", password: "admin123", role: "Administrator" },
    { id: "u2", username: "teacher", password: "teacher", role: "Teacher" },
    { id: "u3", username: "accountant", password: "account123", role: "Accountant" },
    { id: "u4", username: "parent", password: "parent123", role: "Parent" },
    { id: "u5", username: "student", password: "student123", role: "Student" },
    { id: "u6", username: "exam_officer", password: "exam123", role: "Exam Officer" }
  ],
  staff: [
    { id: "s1", staffNo: "MMS/STF/001", firstName: "Amina", middleName: "", lastName: "Yusuf", role: "Teacher" },
    { id: "s2", staffNo: "MMS/STF/002", firstName: "Kabiru", middleName: "Muhammad", lastName: "Sani", role: "Teacher" },
    { id: "s3", staffNo: "MMS/STF/003", firstName: "Maryam", middleName: "", lastName: "Ali", role: "Accountant" }
  ],
  students: [
    { id: "st1", regNo: "MMS/26/001", firstName: "Aisha", lastName: "Abdullahi", parentPhone: "08000000001" }
  ]
};

function fullName(s) { return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ").trim(); }

function toast(msg, isError) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.style.background = isError ? "#b91c1c" : "#1e293b";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2800);
}

function doLogin() {
  const role = document.getElementById("loginRole").value;
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) return toast("Please enter username and password.", true);

  const data = db || seed;
  let user = null;

  user = data.users.find(u =>
    u.username.toLowerCase() === username.toLowerCase() &&
    u.password === password &&
    u.role === role
  );

  if (!user && role === "Student") {
    const s = data.students.find(s => s.regNo.toLowerCase() === username.toLowerCase());
    if (s && password === "student123") user = { id: s.id, username: s.regNo, role: "Student", studentId: s.id };
  }

  if (!user && role === "Parent") {
    const s = data.students.find(s => s.parentPhone === username);
    if (s && password === "parent123") user = { id: s.id, username: s.parentPhone, role: "Parent", studentId: s.id };
  }

  if (!user && (role === "Teacher" || role === "Accountant" || role === "Exam Officer")) {
    const s = data.staff.find(s => s.staffNo.toLowerCase() === username.toLowerCase() && s.role === role);
    if (s) {
      const demos = { "Teacher": "teacher", "Accountant": "account123", "Exam Officer": "exam123" };
      if (password === demos[role]) user = { id: s.id, username: fullName(s), role, staffId: s.id };
    }
  }

  if (!user) return toast("Login failed. Check your credentials.", true);

  localStorage.setItem("mms_user", JSON.stringify(user));
  toast("Login successful! Redirecting...");
  setTimeout(() => { window.location.href = "madarkaci_school_management.html"; }, 1000);
}

function recoverPassword() {
  const username = document.getElementById("loginUsername").value.trim();
  if (!username) return toast("Enter your username first.", true);
  const data = db || seed;
  const user = data.users.find(u => u.username === username);
  toast(user ? "Password hint: " + user.password : "User not found.");
}

const urlParams = new URLSearchParams(window.location.search);
const preRole = urlParams.get("role");
if (preRole) { document.getElementById("loginRole").value = preRole; }

async function loadDB() {
  try {
    const res = await fetch(API_URL);
    if (res.ok) db = await res.json();
    else db = seed;
  } catch {
    db = seed;
  }
}

loadDB();
