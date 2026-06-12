-- Madarkaci Model School Database Management System
-- Database: SQLite-compatible SQL
-- Generated: 2026-06-04

PRAGMA foreign_keys = ON;

DROP VIEW IF EXISTS vw_ReportCards;
DROP VIEW IF EXISTS vw_ScoreSheets;
DROP TABLE IF EXISTS tbl_ExamResults;
DROP TABLE IF EXISTS tbl_Inventory;
DROP TABLE IF EXISTS tbl_Fees;
DROP TABLE IF EXISTS tbl_Scores;
DROP TABLE IF EXISTS tbl_StudentSubjects;
DROP TABLE IF EXISTS tbl_Subjects;
DROP TABLE IF EXISTS tbl_Students;
DROP TABLE IF EXISTS tbl_Classes;
DROP TABLE IF EXISTS tbl_Settings;
DROP TABLE IF EXISTS tbl_Users;

CREATE TABLE tbl_Users (
    UserID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT NOT NULL UNIQUE,
    Password TEXT NOT NULL,
    Role TEXT NOT NULL,
    FullName TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1,
    CreatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_Settings (
    SettingID INTEGER PRIMARY KEY AUTOINCREMENT,
    SchoolName TEXT NOT NULL DEFAULT 'Madarkaci Model School',
    SchoolAddress TEXT,
    SchoolPhone TEXT,
    SchoolEmail TEXT,
    CurrentSession TEXT NOT NULL,
    CurrentTerm TEXT NOT NULL CHECK (CurrentTerm IN ('First Term', 'Second Term', 'Third Term')),
    DaysOpen INTEGER NOT NULL DEFAULT 0,
    NextTermBegins TEXT,
    PrincipalName TEXT,
    DefaultTeacherComment TEXT,
    DefaultPrincipalComment TEXT,
    UpdatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_Classes (
    ClassID INTEGER PRIMARY KEY AUTOINCREMENT,
    ClassName TEXT NOT NULL UNIQUE,
    ClassTeacherID INTEGER,
    ClassSection TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (ClassTeacherID) REFERENCES tbl_Users(UserID)
);

CREATE TABLE tbl_Students (
    StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
    RegNo TEXT NOT NULL UNIQUE,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Gender TEXT NOT NULL CHECK (Gender IN ('Male', 'Female')),
    ClassID INTEGER NOT NULL,
    House TEXT,
    DateOfBirth TEXT,
    Religion TEXT,
    LGA TEXT,
    State TEXT,
    ParentName TEXT,
    ParentPhone TEXT,
    ParentAddress TEXT,
    MedicalFitness TEXT,
    AdmissionDate TEXT DEFAULT CURRENT_DATE,
    IsActive INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (ClassID) REFERENCES tbl_Classes(ClassID)
);

CREATE TABLE tbl_Subjects (
    SubjectID INTEGER PRIMARY KEY AUTOINCREMENT,
    SubjectName TEXT NOT NULL UNIQUE,
    SubjectCode TEXT,
    IsActive INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE tbl_StudentSubjects (
    StudentSubjectID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    SubjectID INTEGER NOT NULL,
    Session TEXT NOT NULL,
    Term TEXT NOT NULL CHECK (Term IN ('First Term', 'Second Term', 'Third Term')),
    UNIQUE (StudentID, SubjectID, Session, Term),
    FOREIGN KEY (StudentID) REFERENCES tbl_Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (SubjectID) REFERENCES tbl_Subjects(SubjectID)
);

CREATE TABLE tbl_Scores (
    ScoreID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    SubjectID INTEGER NOT NULL,
    ClassID INTEGER NOT NULL,
    Session TEXT NOT NULL,
    Term TEXT NOT NULL CHECK (Term IN ('First Term', 'Second Term', 'Third Term')),
    CA1 REAL NOT NULL DEFAULT 0 CHECK (CA1 BETWEEN 0 AND 20),
    CA2 REAL NOT NULL DEFAULT 0 CHECK (CA2 BETWEEN 0 AND 20),
    Exam REAL NOT NULL DEFAULT 0 CHECK (Exam BETWEEN 0 AND 60),
    Total REAL GENERATED ALWAYS AS (CA1 + CA2 + Exam) STORED,
    Grade TEXT GENERATED ALWAYS AS (
        CASE
            WHEN CA1 + CA2 + Exam >= 70 THEN 'A'
            WHEN CA1 + CA2 + Exam >= 60 THEN 'B'
            WHEN CA1 + CA2 + Exam >= 50 THEN 'C'
            WHEN CA1 + CA2 + Exam >= 45 THEN 'D'
            WHEN CA1 + CA2 + Exam >= 40 THEN 'E'
            ELSE 'F'
        END
    ) STORED,
    Remark TEXT GENERATED ALWAYS AS (
        CASE
            WHEN CA1 + CA2 + Exam >= 70 THEN 'Excellent'
            WHEN CA1 + CA2 + Exam >= 60 THEN 'Very Good'
            WHEN CA1 + CA2 + Exam >= 50 THEN 'Good'
            WHEN CA1 + CA2 + Exam >= 45 THEN 'Pass'
            WHEN CA1 + CA2 + Exam >= 40 THEN 'Fair'
            ELSE 'Fail'
        END
    ) STORED,
    EnteredBy INTEGER,
    EnteredAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (StudentID, SubjectID, Session, Term),
    FOREIGN KEY (StudentID) REFERENCES tbl_Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (SubjectID) REFERENCES tbl_Subjects(SubjectID),
    FOREIGN KEY (ClassID) REFERENCES tbl_Classes(ClassID),
    FOREIGN KEY (EnteredBy) REFERENCES tbl_Users(UserID)
);

CREATE TABLE tbl_Fees (
    FeeID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    Session TEXT NOT NULL,
    Term TEXT NOT NULL CHECK (Term IN ('First Term', 'Second Term', 'Third Term')),
    AmountDue REAL NOT NULL DEFAULT 0,
    AmountPaid REAL NOT NULL DEFAULT 0,
    Balance REAL GENERATED ALWAYS AS (AmountDue - AmountPaid) STORED,
    FeeRemark TEXT GENERATED ALWAYS AS (
        CASE
            WHEN AmountPaid >= AmountDue THEN 'Paid'
            WHEN AmountPaid > 0 THEN 'Part Payment'
            ELSE 'Not Paid'
        END
    ) STORED,
    PaymentDate TEXT,
    FOREIGN KEY (StudentID) REFERENCES tbl_Students(StudentID) ON DELETE CASCADE
);

CREATE TABLE tbl_Inventory (
    InventoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    ItemName TEXT NOT NULL,
    Category TEXT,
    Quantity INTEGER NOT NULL DEFAULT 0,
    UnitCost REAL NOT NULL DEFAULT 0,
    Location TEXT,
    LastUpdated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_ExamResults (
    ResultID INTEGER PRIMARY KEY AUTOINCREMENT,
    StudentID INTEGER NOT NULL,
    ClassID INTEGER NOT NULL,
    Session TEXT NOT NULL,
    Term TEXT NOT NULL CHECK (Term IN ('First Term', 'Second Term', 'Third Term')),
    Attendance INTEGER NOT NULL DEFAULT 0,
    TotalScore REAL NOT NULL DEFAULT 0,
    AverageScore REAL NOT NULL DEFAULT 0,
    OverallGrade TEXT,
    Position INTEGER,
    TeacherComment TEXT,
    PrincipalComment TEXT,
    Published INTEGER NOT NULL DEFAULT 0,
    GeneratedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (StudentID, Session, Term),
    FOREIGN KEY (StudentID) REFERENCES tbl_Students(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (ClassID) REFERENCES tbl_Classes(ClassID)
);

CREATE VIEW vw_ScoreSheets AS
SELECT
    c.ClassName,
    s.RegNo,
    s.FirstName || ' ' || s.LastName AS StudentName,
    sub.SubjectName,
    sc.Session,
    sc.Term,
    sc.CA1,
    sc.CA2,
    sc.Exam,
    sc.Total,
    sc.Grade,
    sc.Remark
FROM tbl_Scores sc
JOIN tbl_Students s ON s.StudentID = sc.StudentID
JOIN tbl_Classes c ON c.ClassID = sc.ClassID
JOIN tbl_Subjects sub ON sub.SubjectID = sc.SubjectID
ORDER BY c.ClassName, sub.SubjectName, s.LastName, s.FirstName;

CREATE VIEW vw_ReportCards AS
SELECT
    st.SchoolName,
    st.SchoolAddress,
    st.CurrentSession,
    st.CurrentTerm,
    c.ClassName,
    s.RegNo,
    s.FirstName || ' ' || s.LastName AS StudentName,
    s.Gender,
    er.Position,
    er.Attendance,
    er.TotalScore,
    er.AverageScore,
    er.OverallGrade,
    er.TeacherComment,
    er.PrincipalComment,
    COALESCE(f.FeeRemark, 'No Fee Record') AS SchoolFeesRemark,
    st.NextTermBegins
FROM tbl_ExamResults er
JOIN tbl_Students s ON s.StudentID = er.StudentID
JOIN tbl_Classes c ON c.ClassID = er.ClassID
CROSS JOIN (SELECT * FROM tbl_Settings ORDER BY SettingID DESC LIMIT 1) st
LEFT JOIN tbl_Fees f
    ON f.StudentID = er.StudentID
    AND f.Session = er.Session
    AND f.Term = er.Term;

-- Sample Login Users
INSERT INTO tbl_Users (Username, Password, Role, FullName) VALUES
('admin', 'admin123', 'Administrator', 'System Administrator'),
('teacher', 'teacher', 'Teacher, Accountant', 'Class Teacher'),
('exam_officer', 'exam123', 'Exam Officer', 'Exam Officer');

-- School Settings / Days Open Management
INSERT INTO tbl_Settings (
    SchoolName, SchoolAddress, SchoolPhone, SchoolEmail, CurrentSession, CurrentTerm,
    DaysOpen, NextTermBegins, PrincipalName, DefaultTeacherComment, DefaultPrincipalComment
) VALUES (
    'Madarkaci Model School',
    'NO. 103 ALIYU ROAD, MADARKACI, OPP. INSTITUTE OF CHILD HEALTH, A.B.U-TIH ZARIA - KADUNA STATE',
    '',
    'madarkacimodelschools@gmail.com',
    '2025/2026',
    'First Term',
    65,
    '2026-01-12',
    'Principal',
    'A good performance. Keep working harder.',
    'Approved. More effort is encouraged.'
);

-- Class Management
INSERT INTO tbl_Classes (ClassName, ClassTeacherID, ClassSection) VALUES
('Nursery 1', 2, 'Nursery'),
('Nursery 2', 2, 'Nursery'),
('Primary 1', 2, 'Primary'),
('Primary 2', 2, 'Primary'),
('Primary 3', 2, 'Primary'),
('JSS 1', 2, 'Junior Secondary'),
('JSS 2', 2, 'Junior Secondary'),
('JSS 3', 2, 'Junior Secondary'),
('SS 1', 2, 'Senior Secondary'),
('SS 2', 2, 'Senior Secondary'),
('SS 3', 2, 'Senior Secondary');

-- Subject Management
INSERT INTO tbl_Subjects (SubjectName, SubjectCode) VALUES
('Numeracy', 'NUM'),
('Literacy', 'LIT'),
('Islamic Religious Studies', 'IRS'),
('Hausa Language', 'HAU'),
('Further Mathematics', 'FMATH'),
('Agricultural Science', 'AGRIC'),
('Business Studies', 'BUS'),
('Economics', 'ECO'),
('Literature in English', 'LITENG'),
('Marketing', 'MKT'),
('Basic Technology', 'BTECH'),
('Arabic Language', 'ARB'),
('Vocational Studies', 'VOC'),
('Accounting', 'ACC'),
('Biology', 'BIO'),
('Basic Science', 'BSCI');

-- Sample Student Management Records
INSERT INTO tbl_Students (
    RegNo, FirstName, LastName, Gender, ClassID, House, DateOfBirth,
    Religion, LGA, State, ParentName, ParentPhone, ParentAddress, MedicalFitness
) VALUES
('MMS/2026/001', 'Aisha', 'Abdullahi', 'Female', 6, 'Red', '2013-05-12', 'Islam', 'Fagge', 'Kano', 'Malam Abdullahi', '08000000001', 'Madarkaci, Kano', 'Fit'),
('MMS/2026/002', 'Musa', 'Ibrahim', 'Male', 6, 'Blue', '2012-09-21', 'Islam', 'Fagge', 'Kano', 'Malam Ibrahim', '08000000002', 'Madarkaci, Kano', 'Fit'),
('MMS/2026/003', 'Fatima', 'Sani', 'Female', 6, 'Green', '2013-02-03', 'Islam', 'Gwale', 'Kano', 'Hajiya Sani', '08000000003', 'Madarkaci, Kano', 'Fit'),
-- Basic 4 Students (Primary 4 - ClassID 4)
('MMS/2026/004', 'Buhari', 'Zubairu', 'Male', 4, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/005', 'Kabir', 'Abdulaziz', 'Male', 4, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/006', 'Alamin', 'Yusuf Adam', 'Male', 4, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/007', 'Umar', 'Faruk Sufiyan', 'Male', 4, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/008', 'Hauwa’u', 'Isah', 'Female', 4, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/009', 'Muhamad', 'Lawal', 'Male', 4, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/010', 'Hauwa’u', 'Abdulganiyyu', 'Female', 4, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/011', 'Zainab', 'Mustapha', 'Female', 4, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
-- Basic 2 Students (Primary 2 - ClassID 2)
('MMS/2026/012', 'Aisha', 'Aliyu Ja’afar', 'Female', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/013', 'Abu-Sufyan', 'Abdulkarim', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/014', 'Hafsat', 'Hashim', 'Female', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/015', 'Abubakar', 'Sadiq Ibrahim', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/016', 'Ramlat', 'Yakubu Abubakar', 'Female', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/017', 'Abdulmalik', 'Aminu Gambo', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/018', 'Isah', 'Zakariyya', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/019', 'Abdulhalim', 'Aliyu Gibril', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/020', 'Safarau', 'Abdulkarim', 'Female', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/021', 'Yusuf', 'Khalil', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/022', 'Muhammed', 'Ismail Danbaba', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/023', 'Fatima', 'Yusuf Adam', 'Female', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/024', 'Abdullahi', 'Usman', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/025', 'Aisha', 'Hawal', 'Female', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/026', 'Adam', 'Abdulkadir', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/027', 'Ishaq', 'Abdurrahman', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/028', 'Hassana', 'Idris Musa', 'Female', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/029', 'Aliyu', 'Haidar Ishaq', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/030', 'Muhammed', 'Adnan Dalhat', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/031', 'Salamatu', 'Ilyasu Sani', 'Female', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/032', 'Abdullahi', 'Aminu', 'Male', 2, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
-- Basic 5 Students (Primary 5 - ClassID 5)
('MMS/2026/033', 'Ahmad', 'M. Sani', 'Male', 5, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/034', 'Abdulkadir', 'Mustapha', 'Male', 5, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/035', 'Khadija', 'Dauda Yusuf', 'Female', 5, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/036', 'Khadija', 'Abdulkadir', 'Female', 5, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
-- Basic 7 Students (JSS 1 - ClassID 6)
('MMS/2026/037', 'Abu sufyan', 'Iliyasu sani', 'Male', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/038', 'Ahmad', 'sadiq', 'Male', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/039', 'Umar', 'M Bello', 'Male', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/040', 'fatima', 'Ismail danbaba', 'Female', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/041', 'salbiyya', 'Abdulaziz', 'Female', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/042', 'Humaida', 'Ibrahim', 'Female', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/043', 'Nusaiba', 'Ibrahim', 'Female', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/044', 'khadija', 'shehu', 'Female', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/045', 'Aisha', 'Aliyu Jibril', 'Female', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/046', 'Amina', 'Yusuf Jibril', 'Female', 6, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
-- Basic 8 Students (JSS 2 - ClassID 7)
('MMS/2026/047', 'Abubakar', 'Abdulkadir', 'Male', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/048', 'Ahmad', 'Abubakar', 'Male', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/049', 'Bilal', 'Abubakar', 'Male', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/050', 'Khalid', 'Hashim', 'Male', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/051', 'fatima', 'Ibrahim Kusfa', 'Female', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/052', 'Maryam', 'D Yusuf', 'Female', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/053', 'firdausi', 'Lawal', 'Female', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/054', 'fatima', 'Isah', 'Female', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/055', 'Mabruka', 'Ahmad Nuhu', 'Female', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit'),
('MMS/2026/056', 'Ahmad', 'M Malik', 'Male', 7, NULL, NULL, 'Islam', NULL, NULL, NULL, NULL, NULL, 'Fit');

-- Assign Sample Subjects to Students
INSERT INTO tbl_StudentSubjects (StudentID, SubjectID, Session, Term)
SELECT s.StudentID, sub.SubjectID, '2025/2026', 'First Term'
FROM tbl_Students s
JOIN tbl_Subjects sub
WHERE s.ClassID = 6
  AND sub.SubjectName IN ('Numeracy', 'Literacy', 'Islamic Religious Studies', 'Hausa Language', 'Basic Science', 'Basic Technology');

-- Score Entry: CA1 20%, CA2 20%, Exam 60%
INSERT INTO tbl_Scores (StudentID, SubjectID, ClassID, Session, Term, CA1, CA2, Exam, EnteredBy)
SELECT s.StudentID, sub.SubjectID, s.ClassID, '2025/2026', 'First Term',
       CASE s.RegNo WHEN 'MMS/2026/001' THEN 18 WHEN 'MMS/2026/002' THEN 14 ELSE 16 END,
       CASE s.RegNo WHEN 'MMS/2026/001' THEN 17 WHEN 'MMS/2026/002' THEN 13 ELSE 15 END,
       CASE s.RegNo WHEN 'MMS/2026/001' THEN 52 WHEN 'MMS/2026/002' THEN 41 ELSE 46 END,
       3
FROM tbl_Students s
JOIN tbl_Subjects sub
WHERE s.ClassID = 6
  AND sub.SubjectName IN ('Numeracy', 'Literacy', 'Islamic Religious Studies', 'Hausa Language', 'Basic Science', 'Basic Technology');

INSERT INTO tbl_Fees (StudentID, Session, Term, AmountDue, AmountPaid, PaymentDate)
SELECT StudentID, '2025/2026', 'First Term', 25000, 25000, '2025-10-15'
FROM tbl_Students
WHERE RegNo = 'MMS/2026/001';

INSERT INTO tbl_Fees (StudentID, Session, Term, AmountDue, AmountPaid, PaymentDate)
SELECT StudentID, '2025/2026', 'First Term', 25000, 10000, '2025-10-20'
FROM tbl_Students
WHERE RegNo = 'MMS/2026/002';

INSERT INTO tbl_Inventory (ItemName, Category, Quantity, UnitCost, Location) VALUES
('Whiteboard Marker', 'Stationery', 25, 500, 'Store'),
('Exercise Books', 'Stationery', 300, 250, 'Store'),
('First Aid Box', 'Health', 2, 15000, 'Office');

-- Generate term result summaries.
INSERT INTO tbl_ExamResults (
    StudentID, ClassID, Session, Term, Attendance, TotalScore, AverageScore,
    OverallGrade, Position, TeacherComment, PrincipalComment, Published
)
WITH totals AS (
    SELECT
        StudentID,
        ClassID,
        Session,
        Term,
        SUM(Total) AS TotalScore,
        ROUND(AVG(Total), 2) AS AverageScore
    FROM tbl_Scores
    GROUP BY StudentID, ClassID, Session, Term
),
ranked AS (
    SELECT
        totals.*,
        RANK() OVER (PARTITION BY ClassID, Session, Term ORDER BY TotalScore DESC) AS Position
    FROM totals
)
SELECT
    StudentID,
    ClassID,
    Session,
    Term,
    60,
    TotalScore,
    AverageScore,
    CASE
        WHEN AverageScore >= 70 THEN 'A'
        WHEN AverageScore >= 60 THEN 'B'
        WHEN AverageScore >= 50 THEN 'C'
        WHEN AverageScore >= 45 THEN 'D'
        WHEN AverageScore >= 40 THEN 'E'
        ELSE 'F'
    END,
    Position,
    'A good performance. Keep working harder.',
    'Approved. More effort is encouraged.',
    1
FROM ranked;

-- New Term Processing:
-- 1. Update tbl_Settings CurrentTerm/CurrentSession/DaysOpen.
-- 2. Insert new tbl_StudentSubjects rows for the new term.
-- 3. Create new tbl_Fees rows for each active student.
-- 4. Do not delete historical tbl_Scores or tbl_ExamResults.

-- Clear Results / Fees / Inventory examples:
-- DELETE FROM tbl_Scores WHERE Session = '2025/2026' AND Term = 'First Term';
-- DELETE FROM tbl_ExamResults WHERE Session = '2025/2026' AND Term = 'First Term';
-- DELETE FROM tbl_Fees WHERE Session = '2025/2026' AND Term = 'First Term';
-- UPDATE tbl_Inventory SET Quantity = 0;
