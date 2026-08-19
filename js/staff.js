function newStaff() {
  ["staffId", "staffNo", "staffFirst", "staffMiddle", "staffLast", "staffGender", "staffDob", "staffMaritalStatus", "staffNationality", "staffState", "staffLga", "staffReligion", "staffAddress", "staffPhone", "staffEmail", "staffEmploymentDate", "staffDesignation", "staffDepartment", "staffClassAssigned", "staffEmploymentType", "staffHighestQualification", "staffInstitution", "staffYearGraduated", "staffProfessionalCerts", "staffSalaryScale", "staffBankName", "staffAccountNumber", "staffAccountName", "staffTin", "staffNokName", "staffNokRelation", "staffNokAddress", "staffNokPhone", "staffCv", "staffAcademicCerts", "staffProfessionalCerts", "staffAppointmentLetter", "staffNationalId", "staffImagePath"].forEach((x) => {
    const el = document.getElementById(x);
    if (el) el.value = "";
  });
  generateStaffNo();
  const subjectSelect = document.getElementById("staffSubject");
  if (subjectSelect) {
    Array.from(subjectSelect.options).forEach(opt => opt.selected = false);
  }
  const preview = document.getElementById("staffImagePreview");
  if (preview) {
    preview.src = "";
    preview.style.display = "none";
  }
  const fileInput = document.getElementById("staffImageFile");
  if (fileInput) fileInput.value = "";
}

function generateStaffNo() {
  const next = String(db.staff.length + 1).padStart(3, "0");
  const staffNoEl = document.getElementById("staffNo");
  if (staffNoEl) staffNoEl.value = `MMS/STF/${next}`;
}

function saveStaff() {
  const get = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : "";
  };
  const selectedSubjects = Array.from(document.getElementById("staffSubject").selectedOptions).map(opt => opt.value);
  const data = {
    id: get("staffId") || id(),
    staffNo: get("staffNo"),
    firstName: get("staffFirst").trim(),
    middleName: get("staffMiddle").trim(),
    lastName: get("staffLast").trim(),
    gender: get("staffGender"),
    dob: get("staffDob"),
    maritalStatus: get("staffMaritalStatus"),
    nationality: get("staffNationality").trim(),
    state: get("staffState").trim(),
    lga: get("staffLga").trim(),
    religion: get("staffReligion").trim(),
    address: get("staffAddress").trim(),
    phone: get("staffPhone").trim(),
    email: get("staffEmail").trim(),
    employmentDate: get("staffEmploymentDate"),
    designation: get("staffDesignation").trim(),
    department: get("staffDepartment").trim(),
    classAssigned: get("staffClassAssigned"),
    employmentType: get("staffEmploymentType"),
    subjectIds: selectedSubjects,
    highestQualification: get("staffHighestQualification").trim(),
    institution: get("staffInstitution").trim(),
    yearGraduated: get("staffYearGraduated").trim(),
    professionalCerts: get("staffProfessionalCerts").trim(),
    salaryScale: get("staffSalaryScale").trim(),
    bankName: get("staffBankName").trim(),
    accountNumber: get("staffAccountNumber").trim(),
    accountName: get("staffAccountName").trim(),
    tin: get("staffTin").trim(),
    nokName: get("staffNokName").trim(),
    nokRelation: get("staffNokRelation").trim(),
    nokAddress: get("staffNokAddress").trim(),
    nokPhone: get("staffNokPhone").trim(),
    image: get("staffImagePath") || ""
  };

  const index = db.staff.findIndex((item) => item.id === data.id);
  const isStaffEdit = index >= 0;
  isStaffEdit ? db.staff.splice(index, 1, data) : db.staff.push(data);
  save();
  logActivity(isStaffEdit ? "Staff Edited" : "Staff Added", `${data.firstName} ${data.lastName} (${data.designation || data.role || 'Staff'})`);
  toast("Staff saved");
}

function editStaff(staffIdValue) {
  const s = db.staff.find((item) => item.id === staffIdValue);
  if (!s) return;

  document.getElementById("staffId").value = s.id;
  document.getElementById("staffNo").value = s.staffNo;
  document.getElementById("staffFirst").value = s.firstName;
  document.getElementById("staffMiddle").value = s.middleName || "";
  document.getElementById("staffLast").value = s.lastName;
  document.getElementById("staffRole").value = s.role;
  document.getElementById("staffGender").value = s.gender || "";
  document.getElementById("staffDob").value = s.dob || "";
  document.getElementById("staffMaritalStatus").value = s.maritalStatus || "";
  document.getElementById("staffNationality").value = s.nationality || "";
  document.getElementById("staffState").value = s.state || "";
  document.getElementById("staffLga").value = s.lga || "";
  document.getElementById("staffReligion").value = s.religion || "";
  document.getElementById("staffAddress").value = s.address || "";
  document.getElementById("staffPhone").value = s.phone || "";
  document.getElementById("staffEmail").value = s.email || "";
  document.getElementById("staffEmploymentDate").value = s.employmentDate || "";
  document.getElementById("staffDesignation").value = s.designation || "";
  document.getElementById("staffDepartment").value = s.department || "";
  document.getElementById("staffClassAssigned").value = s.classAssigned || "";
  document.getElementById("staffEmploymentType").value = s.employmentType || "";
  document.getElementById("staffHighestQualification").value = s.highestQualification || "";
  document.getElementById("staffInstitution").value = s.institution || "";
  document.getElementById("staffYearGraduated").value = s.yearGraduated || "";
  document.getElementById("staffProfessionalCerts").value = s.professionalCerts || "";
  document.getElementById("staffSalaryScale").value = s.salaryScale || "";
  document.getElementById("staffBankName").value = s.bankName || "";
  document.getElementById("staffAccountNumber").value = s.accountNumber || "";
  document.getElementById("staffAccountName").value = s.accountName || "";
  document.getElementById("staffTin").value = s.tin || "";
  document.getElementById("staffNokName").value = s.nokName || "";
  document.getElementById("staffNokRelation").value = s.nokRelation || "";
  document.getElementById("staffNokAddress").value = s.nokAddress || "";
  document.getElementById("staffNokPhone").value = s.nokPhone || "";

  const subjectSelect = document.getElementById("staffSubject");
  const sIds = s.subjectIds || (s.subjectId ? [s.subjectId] : []);
  if (subjectSelect) {
    Array.from(subjectSelect.options).forEach(opt => opt.selected = sIds.includes(opt.value));
  }

  const preview = document.getElementById("staffImagePreview");
  if (preview) {
    if (s.image) {
      preview.src = s.image;
      preview.style.display = "block";
    } else {
      preview.src = "";
      preview.style.display = "none";
    }
  }
}

function deleteStaff(staffIdValue) {
  if (db.classes.some((item) => item.teacherId === staffIdValue) || db.subjects.some((item) => item.teacherId === staffIdValue)) {
    return toast("Remove this staff member from assigned classes/subjects first.");
  }
  const sName = db.staff.find(x => x.id === staffIdValue);
  db.staff = db.staff.filter((item) => item.id !== staffIdValue);
  save();
  logActivity("Staff Deleted", sName ? `${fullName(sName)} (${sName.role})` : staffIdValue);
  toast("Staff deleted");
}

function renderStaff() {
  const tableEl = document.getElementById("staffTable");
  if (!tableEl) return;

  const search = (document.getElementById("staffSearch")?.value || "").toLowerCase();
  const filtered = db.staff.filter((s) => {
    if (!search) return true;
    const name = `${s.firstName} ${s.middleName || ""} ${s.lastName}`.toLowerCase();
    const staffNo = (s.staffNo || "").toLowerCase();
    return name.includes(search) || staffNo.includes(search);
  });

  tableEl.innerHTML = table(
    ["S/N", "Staff No", "Name", "Role", "Phone", "Subjects", "Action"],
    filtered.map((s, i) => {
      const sIds = s.subjectIds || (s.subjectId ? [s.subjectId] : []);
      const names = sIds.map(id => subject(id).name).filter(n => n !== "Unknown").join(", ");
      return [
        i + 1,
        esc(s.staffNo),
        esc(fullName(s)),
        esc(s.role),
        esc(s.phone),
        esc(names || "None"),
        `<button class="secondary no-print" onclick="editStaff('${s.id}')">Edit</button>${hasPermission('reports') ? ` <button class="secondary no-print" onclick="printStaffIdCard('${s.id}')">🪪 ID Card</button>` : ""} <button class="secondary no-print" onclick="printAppointmentLetter('${s.id}')">📄 Appointment Letter</button> <button class="danger no-print" onclick="deleteStaff('${s.id}')">Delete</button>`
      ];
    })
  );
}

async function uploadStaffImage(input, previewId, hiddenId) {
  const file = input.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.src = e.target.result;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append('image', file);
  formData.append('filename', 'staff-' + file.name);
  toast('Uploading staff image...');
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      const hiddenEl = document.getElementById(hiddenId);
      if (hiddenEl) hiddenEl.value = data.path;
      toast('Staff image uploaded!');
    } else {
      toast('Upload failed: ' + (data.error || 'unknown error'));
    }
  } catch (e) {
    toast('Upload error: ' + e.message);
  }
}

function printStaffIdCard(staffId) {
  const s = db.staff.find(x => x.id === staffId);
  if (!s) return toast("Staff not found");
  const photoHtml = s.photo ? `<img src="${s.photo}" style="width:100%;height:100%;object-fit:cover">` : "PHOTO";
  const front = `<div class="id-card">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
      <div style="display:flex;gap:7px;align-items:center">
        <img class="id-logo" src="assets/mms-logo.jpg" alt="logo">
        <div><strong style="font-size:11px">${esc(db.settings.schoolName)}</strong><br><span class="hint">Staff Identity Card</span></div>
      </div>
      <div class="photo">${photoHtml}</div>
    </div>
    <hr>
    <strong>${esc(fullName(s))}</strong><br>
    Staff No: ${esc(s.staffNo)}<br>
    Role: ${esc(s.role)}<br>
    Phone: ${esc(s.phone)}<br>
    <span class="badge">${esc(s.role)}</span>
  </div>`;
  printIdCardWindow([[front, idCardBack()]], `ID Card — ${fullName(s)}`);
}

function printAppointmentLetter(staffId) {
  const s = db.staff.find(x => x.id === staffId);
  if (!s) return toast("Staff not found");
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const employmentDate = s.employmentDate ? new Date(s.employmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : today;
  const dob = s.dob ? new Date(s.dob).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "N/A";

  const w = window.open("", "_blank", "width=800,height=900");
  w.document.write(`<!DOCTYPE html><html><head><title>Appointment Letter — ${fullName(s)}</title><style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
    .letter-container { max-width: 700px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px double #1a5f8a; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { width: 80px; height: 80px; object-fit: contain; margin-bottom: 10px; }
    .school-name { font-size: 22px; font-weight: bold; color: #1a5f8a; margin-bottom: 5px; }
    .school-details { font-size: 12px; color: #555; line-height: 1.5; }
    .date { text-align: right; margin-bottom: 25px; font-size: 13px; }
    .reference { font-weight: bold; margin-bottom: 20px; font-size: 13px; }
    .subject { font-weight: bold; margin-bottom: 20px; font-size: 14px; text-decoration: underline; text-align: center; color: #b71c1c; }
    .greeting { margin-bottom: 15px; font-size: 14px; }
    .body { margin-bottom: 25px; font-size: 13px; text-align: justify; }
    .staff-info { background: #f5f5f5; padding: 15px; border-left: 4px solid #1a5f8a; margin: 20px 0; }
    .staff-info table { width: 100%; border-collapse: collapse; }
    .staff-info td { padding: 6px 10px; font-size: 13px; }
    .staff-info td:first-child { font-weight: bold; width: 40%; }
    .closing { margin-top: 30px; }
    .signature { margin-top: 50px; text-align: center; }
    .signature-line { border-top: 1px solid #333; width: 200px; margin: 0 auto 5px; padding-top: 5px; font-size: 12px; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 10px; color: #777; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style></head><body>
    <div class="letter-container">
      <div class="header">
        <img src="assets/mms-logo.jpg" class="logo" alt="School Logo">
        <div class="school-name">${esc(db.settings.schoolName)}</div>
        <div class="school-details">
          ${esc(db.settings.address || "Madarkaci Model School")}<br>
          Email: ${esc(db.settings.email || "madarkacimodelschools@gmail.com")} | Tel: ${esc(db.settings.phone || "N/A")}<br>
          Session: ${esc(db.settings.session)} | Term: ${esc(db.settings.term)}
        </div>
      </div>
      
      <div class="date">${today}</div>
      
      <div class="reference">Ref: MMS/${esc(db.settings.session || "2025/2026").replace("/", "")}/APPT/${esc(s.staffNo || s.id)}</div>
      
      <div class="subject">LETTER OF APPOINTMENT</div>
      
      <div class="greeting">Dear ${esc(s.firstName)},</div>
      
      <div class="body">
        <p>We are pleased to offer you the appointment as <strong>${esc(s.designation || s.role)}</strong> at <strong>${esc(db.settings.schoolName)}</strong> with effect from <strong>${employmentDate}</strong>.</p>
        
        <p>This appointment is on a <strong>${esc(s.employmentType || "permanent")}</strong> basis. Your appointment details are as follows:</p>
        
        <div class="staff-info">
          <table>
            <tr><td>Staff Name:</td><td>${esc(fullName(s))}</td></tr>
            <tr><td>Staff ID:</td><td>${esc(s.staffNo || "Pending")}</td></tr>
            <tr><td>Designation:</td><td>${esc(s.designation || s.role || "N/A")}</td></tr>
            <tr><td>Department:</td><td>${esc(s.department || "N/A")}</td></tr>
            <tr><td>Class Assigned:</td><td>${esc(s.classAssigned || "N/A")}</td></tr>
            <tr><td>Employment Type:</td><td>${esc(s.employmentType || "N/A")}</td></tr>
            <tr><td>Date of Birth:</td><td>${dob}</td></tr>
            <tr><td>Phone Number:</td><td>${esc(s.phone || "N/A")}</td></tr>
            <tr><td>Email Address:</td><td>${esc(s.email || "N/A")}</td></tr>
            <tr><td>Residential Address:</td><td>${esc(s.address || "N/A")}</td></tr>
          </table>
        </div>
        
        <p>Please confirm your acceptance of this appointment by signing and returning a copy of this letter to the school administrative office within <strong>seven (7) days</strong> of receipt.</p>
        
        <p>We look forward to working with you and wish you a successful and rewarding career at <strong>${esc(db.settings.schoolName)}</strong>.</p>
      </div>
      
      <div class="closing">
        <p>Yours sincerely,</p>
        
        <div class="signature">
          <div class="signature-line">Proprietor</div>
          <div style="font-size: 11px; color: #666;">${esc(db.settings.schoolName)}</div>
        </div>
      </div>
      
      <div class="footer">
        This is a computer-generated appointment letter. For verification, contact the school administrative office.<br>
        ${esc(db.settings.schoolName)} | ${esc(db.settings.session)}
      </div>
    </div>
   </body></html>`);
}

function printStaffTable() {
  const tableEl = document.getElementById("staffTable");
  if (!tableEl) return toast("No staff data to print.");

  const clone = tableEl.cloneNode(true);
  const headerCells = clone.querySelectorAll("thead tr th");
  if (headerCells.length > 0) headerCells[headerCells.length - 1].remove();
  clone.querySelectorAll("tbody tr").forEach((tr) => {
    const cells = tr.querySelectorAll("td");
    if (cells.length) cells[cells.length - 1].remove();
  });

  const w = window.open("", "_blank", "width=900,height=700");
  w.document.write(`<!DOCTYPE html><html><head><title>Staff List</title><style>
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
      <p>Staff List | Session: ${esc(db.settings.session)} | Term: ${esc(db.settings.term)} | Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    ${clone.outerHTML}
    <div class="footer">Printed from ${esc(db.settings.schoolName)} School Management System</div>
    <script>window.onload=()=>window.print();<\/script>
  </body></html>`);
}
