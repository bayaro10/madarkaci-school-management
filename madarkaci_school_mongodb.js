// Madarkaci Model School Database Management System
// MongoDB setup and seed script for mongosh
// Usage: mongosh madarkaci_model_school outputs/madarkaci_school_mongodb.js

use("madarkaci_model_school");

db.users.drop();
db.settings.drop();
db.classes.drop();
db.students.drop();
db.subjects.drop();
db.studentSubjects.drop();
db.scores.drop();
db.fees.drop();
db.inventory.drop();
db.examResults.drop();

db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "password", "role", "isActive", "createdAt"],
      properties: {
        username: { bsonType: "string" },
        password: { bsonType: "string" },
        role: { bsonType: "string" },
        fullName: { bsonType: "string" },
        isActive: { bsonType: "bool" },
        createdAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("settings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["schoolName", "currentSession", "currentTerm", "daysOpen"],
      properties: {
        schoolName: { bsonType: "string" },
        schoolAddress: { bsonType: "string" },
        schoolEmail: { bsonType: "string" },
        schoolPhone: { bsonType: "string" },
        currentSession: { bsonType: "string" },
        currentTerm: { enum: ["First Term", "Second Term", "Third Term"] },
        daysOpen: { bsonType: "int" },
        nextTermBegins: { bsonType: ["date", "null"] },
        principalName: { bsonType: "string" },
        defaultTeacherComment: { bsonType: "string" },
        defaultPrincipalComment: { bsonType: "string" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection("classes");
db.createCollection("students", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["regNo", "firstName", "lastName", "classId", "isActive"],
      properties: {
        regNo: { bsonType: "string" },
        firstName: { bsonType: "string" },
        lastName: { bsonType: "string" },
        classId: { bsonType: "objectId" },
        gender: { enum: ["Male", "Female"] },
        isActive: { bsonType: "bool" }
      }
    }
  }
});
db.createCollection("subjects");
db.createCollection("studentSubjects");
db.createCollection("scores");
db.createCollection("fees");
db.createCollection("inventory");
db.createCollection("examResults");

db.users.createIndex({ username: 1 }, { unique: true });
db.classes.createIndex({ className: 1 }, { unique: true });
db.students.createIndex({ regNo: 1 }, { unique: true });
db.subjects.createIndex({ subjectName: 1 }, { unique: true });
db.studentSubjects.createIndex(
  { studentId: 1, subjectId: 1, session: 1, term: 1 },
  { unique: true }
);
db.scores.createIndex(
  { studentId: 1, subjectId: 1, session: 1, term: 1 },
  { unique: true }
);
db.examResults.createIndex(
  { studentId: 1, session: 1, term: 1 },
  { unique: true }
);
db.fees.createIndex({ studentId: 1, session: 1, term: 1 });

function gradeFor(total) {
  if (total >= 70) return { grade: "A", remark: "Excellent" };
  if (total >= 60) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Good" };
  if (total >= 45) return { grade: "D", remark: "Pass" };
  if (total >= 40) return { grade: "E", remark: "Fair" };
  return { grade: "F", remark: "Fail" };
}

function feeRemark(amountDue, amountPaid) {
  if (amountPaid >= amountDue) return "Paid";
  if (amountPaid > 0) return "Part Payment";
  return "Not Paid";
}

db.users.insertMany([
  {
    username: "admin",
    password: "admin123",
    role: "Administrator",
    fullName: "System Administrator",
    isActive: true,
    createdAt: new Date()
  },
  {
    username: "teacher",
    password: "teacher",
    role: "Teacher, Accountant",
    fullName: "Class Teacher",
    isActive: true,
    createdAt: new Date()
  },
  {
    username: "exam_officer",
    password: "exam123",
    role: "Exam Officer",
    fullName: "Exam Officer",
    isActive: true,
    createdAt: new Date()
  }
]);

db.settings.insertOne({
  schoolName: "Madarkaci Model School",
  schoolAddress: "NO. 103 ALIYU ROAD, MADARKACI, OPP. INSTITUTE OF CHILD HEALTH, A.B.U-TIH ZARIA - KADUNA STATE",
  schoolEmail: "madarkacimodelschools@gmail.com",
  schoolPhone: "",
  currentSession: "2025/2026",
  currentTerm: "First Term",
  daysOpen: NumberInt(65),
  nextTermBegins: ISODate("2026-01-12T00:00:00Z"),
  principalName: "Principal",
  defaultTeacherComment: "A good performance. Keep working harder.",
  defaultPrincipalComment: "Approved. More effort is encouraged.",
  updatedAt: new Date()
});

db.classes.insertMany([
  { className: "Nursery 1", classTeacher: "Teacher A", classSection: "Nursery", isActive: true },
  { className: "Nursery 2", classTeacher: "Teacher B", classSection: "Nursery", isActive: true },
  { className: "Primary 1", classTeacher: "Teacher C", classSection: "Primary", isActive: true },
  { className: "Primary 2", classTeacher: "Teacher D", classSection: "Primary", isActive: true },
  { className: "Primary 3", classTeacher: "Teacher E", classSection: "Primary", isActive: true },
  { className: "JSS 1", classTeacher: "Teacher F", classSection: "Junior Secondary", isActive: true },
  { className: "JSS 2", classTeacher: "Teacher G", classSection: "Junior Secondary", isActive: true },
  { className: "JSS 3", classTeacher: "Teacher H", classSection: "Junior Secondary", isActive: true },
  { className: "SS 1", classTeacher: "Teacher I", classSection: "Senior Secondary", isActive: true },
  { className: "SS 2", classTeacher: "Teacher J", classSection: "Senior Secondary", isActive: true },
  { className: "SS 3", classTeacher: "Teacher K", classSection: "Senior Secondary", isActive: true }
]);

db.subjects.insertMany([
  { subjectName: "Numeracy", subjectCode: "NUM", isActive: true },
  { subjectName: "Literacy", subjectCode: "LIT", isActive: true },
  { subjectName: "Islamic Religious Studies", subjectCode: "IRS", isActive: true },
  { subjectName: "Hausa Language", subjectCode: "HAU", isActive: true },
  { subjectName: "Further Mathematics", subjectCode: "FMATH", isActive: true },
  { subjectName: "Agricultural Science", subjectCode: "AGRIC", isActive: true },
  { subjectName: "Business Studies", subjectCode: "BUS", isActive: true },
  { subjectName: "Economics", subjectCode: "ECO", isActive: true },
  { subjectName: "Literature in English", subjectCode: "LITENG", isActive: true },
  { subjectName: "Marketing", subjectCode: "MKT", isActive: true },
  { subjectName: "Basic Technology", subjectCode: "BTECH", isActive: true },
  { subjectName: "Arabic Language", subjectCode: "ARB", isActive: true },
  { subjectName: "Vocational Studies", subjectCode: "VOC", isActive: true },
  { subjectName: "Accounting", subjectCode: "ACC", isActive: true },
  { subjectName: "Biology", subjectCode: "BIO", isActive: true },
  { subjectName: "Basic Science", subjectCode: "BSCI", isActive: true }
]);

const jss1 = db.classes.findOne({ className: "JSS 1" });

db.students.insertMany([
  {
    regNo: "MMS/2026/001",
    firstName: "Aisha",
    middleName: "",
    lastName: "Abdullahi",
    gender: "Female",
    classId: jss1._id,
    house: "Red",
    dateOfBirth: ISODate("2013-05-12T00:00:00Z"),
    religion: "Islam",
    lga: "Fagge",
    state: "Kano",
    parentName: "Malam Abdullahi",
    parentPhone: "08000000001",
    parentAddress: "Madarkaci, Kano",
    medicalFitness: "Fit",
    admissionDate: new Date(),
    isActive: true
  },
  {
    regNo: "MMS/2026/002",
    firstName: "Musa",
    middleName: "Ahmad",
    lastName: "Ibrahim",
    gender: "Male",
    classId: jss1._id,
    house: "Blue",
    dateOfBirth: ISODate("2012-09-21T00:00:00Z"),
    religion: "Islam",
    lga: "Fagge",
    state: "Kano",
    parentName: "Malam Ibrahim",
    parentPhone: "08000000002",
    parentAddress: "Madarkaci, Kano",
    medicalFitness: "Fit",
    admissionDate: new Date(),
    isActive: true
  },
  {
    regNo: "MMS/2026/003",
    firstName: "Fatima",
    middleName: "",
    lastName: "Sani",
    gender: "Female",
    classId: jss1._id,
    house: "Green",
    dateOfBirth: ISODate("2013-02-03T00:00:00Z"),
    religion: "Islam",
    lga: "Gwale",
    state: "Kano",
    parentName: "Hajiya Sani",
    parentPhone: "08000000003",
    parentAddress: "Madarkaci, Kano",
    medicalFitness: "Fit",
    admissionDate: new Date(),
    isActive: true
  }
]);

const activeSubjectNames = [
  "Numeracy",
  "Literacy",
  "Islamic Religious Studies",
  "Hausa Language",
  "Basic Science",
  "Basic Technology"
];
const assignedSubjects = db.subjects.find({ subjectName: { $in: activeSubjectNames } }).toArray();
const students = db.students.find({ classId: jss1._id }).toArray();

db.studentSubjects.insertMany(
  students.flatMap((student) =>
    assignedSubjects.map((subject) => ({
      studentId: student._id,
      subjectId: subject._id,
      session: "2025/2026",
      term: "First Term"
    }))
  )
);

const enteredBy = db.users.findOne({ username: "exam_officer" })._id;
const scoreRows = [];
students.forEach((student) => {
  assignedSubjects.forEach((subject) => {
    const marksByStudent = {
      "MMS/2026/001": { ca1: 18, ca2: 17, exam: 52 },
      "MMS/2026/002": { ca1: 14, ca2: 13, exam: 41 },
      "MMS/2026/003": { ca1: 16, ca2: 15, exam: 46 }
    };
    const marks = marksByStudent[student.regNo];
    const total = marks.ca1 + marks.ca2 + marks.exam;
    const grade = gradeFor(total);
    scoreRows.push({
      studentId: student._id,
      subjectId: subject._id,
      classId: student.classId,
      session: "2025/2026",
      term: "First Term",
      ca1: marks.ca1,
      ca2: marks.ca2,
      exam: marks.exam,
      total,
      grade: grade.grade,
      remark: grade.remark,
      enteredBy,
      enteredAt: new Date()
    });
  });
});
db.scores.insertMany(scoreRows);

db.fees.insertMany([
  {
    studentId: db.students.findOne({ regNo: "MMS/2026/001" })._id,
    session: "2025/2026",
    term: "First Term",
    amountDue: 25000,
    amountPaid: 25000,
    balance: 0,
    feeRemark: "Paid",
    paymentDate: ISODate("2025-10-15T00:00:00Z")
  },
  {
    studentId: db.students.findOne({ regNo: "MMS/2026/002" })._id,
    session: "2025/2026",
    term: "First Term",
    amountDue: 25000,
    amountPaid: 10000,
    balance: 15000,
    feeRemark: "Part Payment",
    paymentDate: ISODate("2025-10-20T00:00:00Z")
  }
]);

db.inventory.insertMany([
  { itemName: "Whiteboard Marker", category: "Stationery", quantity: 25, unitCost: 500, location: "Store", lastUpdated: new Date() },
  { itemName: "Exercise Books", category: "Stationery", quantity: 300, unitCost: 250, location: "Store", lastUpdated: new Date() },
  { itemName: "First Aid Box", category: "Health", quantity: 2, unitCost: 15000, location: "Office", lastUpdated: new Date() }
]);

const totals = db.scores.aggregate([
  {
    $group: {
      _id: {
        studentId: "$studentId",
        classId: "$classId",
        session: "$session",
        term: "$term"
      },
      totalScore: { $sum: "$total" },
      averageScore: { $avg: "$total" }
    }
  },
  { $sort: { "_id.classId": 1, totalScore: -1 } }
]).toArray();

const resultRows = totals.map((row, index) => {
  const roundedAverage = Math.round(row.averageScore * 100) / 100;
  return {
    studentId: row._id.studentId,
    classId: row._id.classId,
    session: row._id.session,
    term: row._id.term,
    attendance: 60,
    totalScore: row.totalScore,
    averageScore: roundedAverage,
    overallGrade: gradeFor(roundedAverage).grade,
    position: index + 1,
    teacherComment: "A good performance. Keep working harder.",
    principalComment: "Approved. More effort is encouraged.",
    published: true,
    generatedAt: new Date()
  };
});
db.examResults.insertMany(resultRows);

print("Madarkaci Model School MongoDB database created successfully.");
print("Database: madarkaci_model_school");
print("Collections: users, settings, classes, students, subjects, studentSubjects, scores, fees, inventory, examResults");
