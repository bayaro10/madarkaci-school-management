# Madarkaci Model School MongoDB Guide

This package defines a MongoDB database named `madarkaci_model_school` for school administration, examination records, fees, inventory, and report cards.

## Main File

Use this setup script:

```bash
mongosh madarkaci_model_school outputs/madarkaci_school_mongodb.js
```

## Collections

| Collection | Purpose |
| --- | --- |
| `users` | Login accounts and roles |
| `settings` | School name, session, term, days open, comments |
| `students` | Student biodata and parent records |
| `classes` | Class names, sections, class teachers |
| `subjects` | Subject list |
| `studentSubjects` | Student-subject assignment per session and term |
| `scores` | CA1, CA2, exam, total, grade, remark |
| `fees` | Fee billing, payment, balance, fee remark |
| `inventory` | School inventory records |
| `examResults` | Attendance, total, average, position, comments |

## Login Users

| Username | Password | Role |
| --- | --- | --- |
| admin | admin123 | Administrator |
| teacher | teacher | Teacher, Accountant |
| exam_officer | exam123 | Exam Officer |

## Score Entry Rule

Scores are stored in `scores`:

| Field | Maximum |
| --- | ---: |
| `ca1` | 20 |
| `ca2` | 20 |
| `exam` | 60 |
| `total` | 100 |

The setup script calculates `total`, `grade`, and `remark`.

## Grade System

| Score | Grade | Remark |
| --- | --- | --- |
| 70-100 | A | Excellent |
| 60-69 | B | Very Good |
| 50-59 | C | Good |
| 45-49 | D | Pass |
| 40-44 | E | Fair |
| 0-39 | F | Fail |

## Score Sheet Aggregation

```javascript
db.scores.aggregate([
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  {
    $lookup: {
      from: "subjects",
      localField: "subjectId",
      foreignField: "_id",
      as: "subject"
    }
  },
  { $unwind: "$subject" },
  {
    $lookup: {
      from: "classes",
      localField: "classId",
      foreignField: "_id",
      as: "class"
    }
  },
  { $unwind: "$class" },
  {
    $match: {
      session: "2025/2026",
      term: "First Term",
      "class.className": "JSS 1"
    }
  },
  {
    $project: {
      _id: 0,
      className: "$class.className",
      regNo: "$student.regNo",
      studentName: { $concat: ["$student.firstName", " ", "$student.lastName"] },
      subjectName: "$subject.subjectName",
      ca1: 1,
      ca2: 1,
      exam: 1,
      total: 1,
      grade: 1,
      remark: 1
    }
  },
  { $sort: { subjectName: 1, studentName: 1 } }
]);
```

## Report Card Header Aggregation

```javascript
db.examResults.aggregate([
  {
    $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  {
    $lookup: {
      from: "classes",
      localField: "classId",
      foreignField: "_id",
      as: "class"
    }
  },
  { $unwind: "$class" },
  {
    $lookup: {
      from: "fees",
      let: { studentId: "$studentId", session: "$session", term: "$term" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$studentId", "$$studentId"] },
                { $eq: ["$session", "$$session"] },
                { $eq: ["$term", "$$term"] }
              ]
            }
          }
        }
      ],
      as: "fee"
    }
  },
  { $unwind: { path: "$fee", preserveNullAndEmptyArrays: true } },
  { $match: { "student.regNo": "MMS/2026/001", session: "2025/2026", term: "First Term" } },
  {
    $project: {
      _id: 0,
      schoolName: "Madarkaci Model School",
      studentName: { $concat: ["$student.firstName", " ", "$student.lastName"] },
      gender: "$student.gender",
      className: "$class.className",
      regNo: "$student.regNo",
      position: 1,
      attendance: 1,
      totalScore: 1,
      averageScore: 1,
      overallGrade: 1,
      teacherComment: 1,
      principalComment: 1,
      schoolFeesRemark: { $ifNull: ["$fee.feeRemark", "No Fee Record"] }
    }
  }
]);
```

## Subject Scores For Report Card

```javascript
const student = db.students.findOne({ regNo: "MMS/2026/001" });

db.scores.aggregate([
  { $match: { studentId: student._id, session: "2025/2026", term: "First Term" } },
  {
    $lookup: {
      from: "subjects",
      localField: "subjectId",
      foreignField: "_id",
      as: "subject"
    }
  },
  { $unwind: "$subject" },
  {
    $project: {
      _id: 0,
      subjectName: "$subject.subjectName",
      ca1: 1,
      ca2: 1,
      exam: 1,
      total: 1,
      grade: 1,
      remark: 1
    }
  },
  { $sort: { subjectName: 1 } }
]);
```

## Add A New Score

```javascript
function gradeFor(total) {
  if (total >= 70) return { grade: "A", remark: "Excellent" };
  if (total >= 60) return { grade: "B", remark: "Very Good" };
  if (total >= 50) return { grade: "C", remark: "Good" };
  if (total >= 45) return { grade: "D", remark: "Pass" };
  if (total >= 40) return { grade: "E", remark: "Fair" };
  return { grade: "F", remark: "Fail" };
}

const student = db.students.findOne({ regNo: "MMS/2026/001" });
const subject = db.subjects.findOne({ subjectName: "Biology" });
const user = db.users.findOne({ username: "exam_officer" });
const ca1 = 18;
const ca2 = 16;
const exam = 49;
const total = ca1 + ca2 + exam;
const result = gradeFor(total);

db.scores.insertOne({
  studentId: student._id,
  subjectId: subject._id,
  classId: student.classId,
  session: "2025/2026",
  term: "First Term",
  ca1,
  ca2,
  exam,
  total,
  grade: result.grade,
  remark: result.remark,
  enteredBy: user._id,
  enteredAt: new Date()
});
```

## New Term Processing

```javascript
db.settings.updateOne(
  {},
  {
    $set: {
      currentTerm: "Second Term",
      daysOpen: 0,
      nextTermBegins: null,
      updatedAt: new Date()
    }
  },
  { sort: { updatedAt: -1 } }
);
```

```javascript
const previousAssignments = db.studentSubjects
  .find({ session: "2025/2026", term: "First Term" })
  .toArray();

db.studentSubjects.insertMany(
  previousAssignments.map((item) => ({
    studentId: item.studentId,
    subjectId: item.subjectId,
    session: "2025/2026",
    term: "Second Term"
  })),
  { ordered: false }
);
```

```javascript
db.students.find({ isActive: true }).forEach((student) => {
  db.fees.insertOne({
    studentId: student._id,
    session: "2025/2026",
    term: "Second Term",
    amountDue: 25000,
    amountPaid: 0,
    balance: 25000,
    feeRemark: "Not Paid",
    paymentDate: null
  });
});
```

## Clear Records

Use only after backup.

```javascript
db.scores.deleteMany({ session: "2025/2026", term: "First Term" });
db.examResults.deleteMany({ session: "2025/2026", term: "First Term" });
db.fees.deleteMany({ session: "2025/2026", term: "First Term" });
db.inventory.updateMany({}, { $set: { quantity: 0, lastUpdated: new Date() } });
```
