import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CalendarDays,
  BarChart2,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Save,
  BookOpen,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
  getUsers,
  getAssignments,
  addAssignment,
  deleteAssignment,
  getAttendance,
  saveAttendance,
  getMarks,
  addMark,
  deleteMark,
  getSubmissions,
} from "../utils/db";


const NAV = [
  {
    key: "dashboard",
    icon: <LayoutDashboard size={16} />,
    label: "Dashboard",
  },
  {
    key: "students",
    icon: <Users size={16} />,
    label: "Manage Students",
  },
  {
    key: "assignments",
    icon: <ClipboardList size={16} />,
    label: "Assignments",
  },
  {
    key: "attendance",
    icon: <CalendarDays size={16} />,
    label: "Attendance",
  },
  {
    key: "marks",
    icon: <BarChart2 size={16} />,
    label: "Marks",
  },
];


const today = new Date().toISOString().split("T")[0];


export default function TeacherDashboard({ user, onLogout }) {

  // ==============================
  // STATES
  // ==============================

  const [menu, setMenu] = useState("dashboard");

  const [refresh, setRefresh] = useState(0);

  const [selectedCourse, setSelectedCourse] = useState("");

  const [selectedDivision, setSelectedDivision] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);


  const reload = () => {
    setRefresh((r) => r + 1);
  };


  // ==============================
  // DATA
  // ==============================

  const students = getUsers().filter(
    (u) => u.role === "student"
  );

  const assignments = getAssignments();

  const attendance = getAttendance();

  const marks = getMarks();

  const submissions = getSubmissions();


  const courses = [
    ...new Set(
      students
        .map((s) => s.course)
        .filter(Boolean)
    ),
  ];


  // ==============================
  // ASSIGNMENT FORM
  // ==============================

  const [aForm, setAForm] = useState({
    title: "",
    description: "",
    course: "",
    due_date: today,
  });


  const [aMsg, setAMsg] = useState(null);


  // ==============================
  // ATTENDANCE
  // ==============================

  const [selCourse, setSelCourse] = useState(
    courses[0] || ""
  );

  const [attDate, setAttDate] = useState(today);

  const [attMap, setAttMap] = useState({});

  const [attMsg, setAttMsg] = useState(null);


  const courseStudents = students.filter(
    (s) => s.course === selCourse
  );


  const getAttStatus = (username) => {

    if (attMap[username]) {
      return attMap[username];
    }


    const existing = attendance.find(
      (a) =>
        a.username === username &&
        a.date === attDate &&
        a.course === selCourse
    );


    return existing
      ? existing.status
      : "Present";

  };


  // ==============================
  // ALL PRESENT
  // ==============================

  const AllPresent = () => {

    const allPresent = {};

    courseStudents.forEach((student) => {

      allPresent[student.username] = "Present";

    });


    setAttMap(allPresent);

  };


  // ==============================
  // ALL ABSENT
  // ==============================

  const AllAbsent = () => {

    const allAbsent = {};

    courseStudents.forEach((student) => {

      allAbsent[student.username] = "Absent";

    });


    setAttMap(allAbsent);

  };


  // ==============================
  // SAVE ATTENDANCE
  // ==============================

  const handleSaveAtt = () => {

    saveAttendance(

      courseStudents.map((s) => ({

        username: s.username,

        date: attDate,

        status: getAttStatus(s.username),

        course: selCourse,

      }))

    );


    setAttMsg(
      "Attendance saved successfully!"
    );


    setAttMap({});

    reload();


    setTimeout(() => {

      setAttMsg(null);

    }, 3000);

  };


  // ==============================
  // MARKS FORM
  // ==============================

  const [mForm, setMForm] = useState({

    student_username:
      students[0]?.username || "",

    subject: "",

    marks: "",

    total: "100",

    exam_type: "Quiz",

  });


  const [mMsg, setMMsg] =
    useState(null);


  // ==============================
  // TOP PERFORMERS
  // ==============================

  const topPerformers = students

    .map((student) => {

      const studentMarks = marks.filter(

        (mark) =>
          mark.student_username ===
          student.username

      );


      if (studentMarks.length === 0) {

        return null;

      }


      const totalMarks =
        studentMarks.reduce(

          (sum, mark) =>
            sum + Number(mark.marks),

          0

        );


      const totalPossible =
        studentMarks.reduce(

          (sum, mark) =>
            sum + Number(mark.total),

          0

        );


      if (totalPossible === 0) {

        return null;

      }


      const percentage =
        Math.round(

          (totalMarks /
            totalPossible) *
            100

        );


      return {

        name: student.full_name,

        username: student.username,

        percentage: percentage,

        course: student.course,

      };

    })

    .filter(Boolean)

    .sort(
      (a, b) =>
        b.percentage -
        a.percentage
    )

    .slice(0, 3);


  // ==============================
  // ADD MARK
  // ==============================

  const handleAddMark = (e) => {

    e.preventDefault();


    if (
      !mForm.subject ||
      !mForm.marks ||
      !mForm.student_username
    ) {

      setMMsg({

        type: "error",

        text:
          "Student, subject and marks are required.",

      });

      return;

    }


    addMark(mForm);


    setMMsg({

      type: "success",

      text: "Marks added!",

    });


    setMForm({

      ...mForm,

      subject: "",

      marks: "",

      total: "100",

    });


    reload();


    setTimeout(() => {

      setMMsg(null);

    }, 3000);

  };


  // ==============================
  // POST ASSIGNMENT
  // ==============================

  const handlePostAssignment = (e) => {

    e.preventDefault();


    if (
      !aForm.title ||
      !aForm.course
    ) {

      setAMsg({

        type: "error",

        text:
          "Title and course are required.",

      });

      return;

    }


    addAssignment({

      ...aForm,

      created_by:
        user.full_name,

    });


    setAMsg({

      type: "success",

      text:
        "Assignment posted!",

    });


    setAForm({

      title: "",

      description: "",

      course: "",

      due_date: today,

    });


    reload();


    setTimeout(() => {

      setAMsg(null);

    }, 3000);

  };


  // ==============================
  // FILTERED STUDENTS
  // ==============================

  const filteredStudents =
    students.filter(

      (s) =>

        (!selectedCourse ||
          s.course === selectedCourse) &&

        (!selectedDivision ||
          s.division === selectedDivision)

    );


  // ==============================
  // RETURN
  // ==============================

  return (

    <div className="layout">

      <Sidebar

        user={user}

        menu={menu}

        setMenu={setMenu}

        navItems={NAV}

        onLogout={onLogout}

      />


      <div className="main-content">


        {/* ================================= */}
        {/* DASHBOARD */}
        {/* ================================= */}

        {menu === "dashboard" && (

          <>


            <div className="dashboard-header">

              <div>

                <h1>
                  Dashboard
                </h1>

                <p>

                  Welcome back,
                  {" "}
                  {user.full_name}
                  {" "}
                  — {today}

                </p>

              </div>


              <div className="dashboard-actions">

                <button
                  className="icon-btn"
                >
                  🔔
                </button>


                <button
                  className="icon-btn"
                >
                  👤
                </button>

              </div>

            </div>


            {/* STATISTICS */}

            <div className="dashboard-stats">


              {/* TOTAL STUDENTS */}

              <div className="dashboard-stat-card students-card">

                <div className="dashboard-icon students-icon">

                  <Users size={26} />

                </div>


                <div className="dashboard-stat-content">

                  <h2>
                    {students.length}
                  </h2>

                  <p>
                    Total Students
                  </p>

                </div>


                <div className="dashboard-arrow">

                  →

                </div>

              </div>


              {/* ASSIGNMENTS */}

              <div className="dashboard-stat-card assignments-card">

                <div className="dashboard-icon assignments-icon">

                  <ClipboardList size={26} />

                </div>


                <div className="dashboard-stat-content">

                  <h2>
                    {assignments.length}
                  </h2>

                  <p>
                    Assignments
                  </p>

                </div>


                <div className="dashboard-arrow">

                  →

                </div>

              </div>


              {/* ATTENDANCE */}

              <div className="dashboard-stat-card attendance-card">

                <div className="dashboard-icon attendance-icon">

                  <CalendarDays size={26} />

                </div>


                <div className="dashboard-stat-content">

                  <h2>

                    {
                      attendance.filter(
                        (a) =>
                          a.date === today
                      ).length
                    }

                  </h2>


                  <p>
                    Attendance Today
                  </p>

                </div>


                <div className="dashboard-arrow">

                  →

                </div>

              </div>


              {/* MARKS */}

              <div className="dashboard-stat-card marks-card">

                <div className="dashboard-icon marks-icon">

                  <BarChart2 size={26} />

                </div>


                <div className="dashboard-stat-content">

                  <h2>
                    {marks.length}
                  </h2>

                  <p>
                    Marks Records
                  </p>

                </div>


                <div className="dashboard-arrow">

                  →

                </div>

              </div>

            </div>


            {/* DASHBOARD CONTENT */}

            <div className="dashboard-content-grid">


              {/* STUDENTS BY COURSE */}

              <div className="dashboard-panel">

                <div className="dashboard-panel-title">

                  <div className="panel-title-left">

                    <Users size={21} />

                    <h2>
                      Students by Course
                    </h2>

                  </div>

                </div>


                {courses.length === 0 ? (

                  <div className="dashboard-empty">

                    <Users size={40} />

                    <p>
                      No students available.
                    </p>

                  </div>

                ) : (

                  <div className="course-list">

                    {courses.map(
                      (course) => {

                        const count =
                          students.filter(
                            (s) =>
                              s.course ===
                              course
                          ).length;


                        const percentage =
                          students.length > 0

                            ? Math.round(

                                (count /
                                  students.length) *
                                  100

                              )

                            : 0;


                        return (

                          <div

                            className="course-item"

                            key={course}

                          >

                            <div className="course-info">

                              <span className="course-name">

                                {course}

                              </span>


                              <span className="course-count">

                                {count} students

                              </span>

                            </div>


                            <div className="course-progress">

                              <div

                                className="course-progress-fill"

                                style={{

                                  width:
                                    `${percentage}%`,

                                }}

                              />

                            </div>

                          </div>

                        );

                      }
                    )}

                  </div>

                )}

              </div>


              {/* RECENT ASSIGNMENTS */}

              <div className="dashboard-panel">

                <div className="dashboard-panel-title">

                  <div className="panel-title-left">

                    <ClipboardList size={21} />

                    <h2>
                      Recent Assignments
                    </h2>

                  </div>


                  <button

                    className="view-all-btn"

                    onClick={() =>
                      setMenu(
                        "assignments"
                      )
                    }

                  >

                    View All →

                  </button>

                </div>


                {assignments.length === 0 ? (

                  <div className="dashboard-empty">

                    <ClipboardList size={40} />

                    <p>
                      No assignments available.
                    </p>

                  </div>

                ) : (

                  <div className="recent-assignment-list">

                    {[...assignments]

                      .reverse()

                      .slice(0, 4)

                      .map((a) => {

                        const subCount =
                          submissions.filter(

                            (s) =>
                              s.assignment_id ===
                              a.id

                          ).length;


                        return (

                          <div

                            className="recent-assignment-item"

                            key={a.id}

                          >

                            <div className="assignment-icon">

                              <ClipboardList size={22} />

                            </div>


                            <div className="assignment-info">

                              <h3>
                                {a.title}
                              </h3>

                              <p>

                                {a.course}

                                {" · Due "}

                                {a.due_date}

                              </p>

                            </div>


                            <div className="submission-badge">

                              {subCount} submitted

                            </div>

                          </div>

                        );

                      })}

                  </div>

                )}

              </div>

            </div>


            {/* TOP PERFORMERS */}

            <div className="card">

              <div

                className="card-title"

                style={{

                  display: "flex",

                  alignItems: "center",

                  gap: "10px",

                }}

              >

                🏆 Top Performers

              </div>


              {topPerformers.length === 0 ? (

                <div className="empty-state">

                  <p>
                    No marks available yet.
                  </p>

                </div>

              ) : (

                topPerformers.map(
                  (student, index) => {

                    const medals = [
                      "🥇",
                      "🥈",
                      "🥉",
                    ];


                    return (

                      <div

                        key={student.username}

                        style={{

                          display: "flex",

                          justifyContent:
                            "space-between",

                          alignItems:
                            "center",

                          padding:
                            "15px 0",

                          borderBottom:

                            index !==
                            topPerformers.length - 1

                              ? "1px solid var(--border)"

                              : "none",

                        }}

                      >

                        <div

                          style={{

                            display: "flex",

                            alignItems:
                              "center",

                            gap: "12px",

                          }}

                        >

                          <div
                            style={{
                              fontSize:
                                "24px",
                            }}
                          >

                            {medals[index]}

                          </div>


                          <div>

                            <div

                              style={{

                                fontWeight:
                                  "600",

                                fontSize:
                                  "15px",

                              }}

                            >

                              {student.name}

                            </div>


                            <div

                              style={{

                                fontSize:
                                  "12px",

                                color:
                                  "var(--muted)",

                                marginTop:
                                  "3px",

                              }}

                            >

                              {student.course}

                            </div>

                          </div>

                        </div>


                        <div

                          style={{

                            fontSize:
                              "16px",

                            fontWeight:
                              "700",

                            color:
                              "#2563eb",

                          }}

                        >

                          {student.percentage}%

                        </div>

                      </div>

                    );

                  }
                )

              )}

            </div>


          </>

        )}


        {/* ================================= */}
        {/* MANAGE STUDENTS */}
        {/* ================================= */}

        {menu === "students" && (

          <>


            <div className="page-header manage-header">

              <div>

                <h1>
                  Manage Students
                </h1>

                <p>
                  View, organize and manage
                  students by course and division
                </p>

              </div>

            </div>


            {/* STATISTICS */}

            <div className="student-stats-grid">


              {/* TOTAL STUDENTS */}

              <div className="student-stat-card students-card">

                <div className="stat-content">

                  <p>
                    Total Students
                  </p>

                  <h2>
                    {students.length}
                  </h2>

                  <span>
                    Registered Students
                  </span>

                </div>


                <div className="student-stat-icon blue-icon">

                  <Users size={30} />

                </div>

              </div>


              {/* TOTAL COURSES */}

              <div className="student-stat-card courses-card">

                <div className="stat-content">

                  <p>
                    Total Courses
                  </p>

                  <h2>

                    {

                      new Set(

                        students

                          .map(
                            (s) =>
                              s.course
                          )

                          .filter(Boolean)

                      ).size

                    }

                  </h2>


                  <span>
                    Available Courses
                  </span>

                </div>


                <div className="student-stat-icon purple-icon">

                  <BookOpen size={30} />

                </div>

              </div>


              {/* TOTAL DIVISIONS */}

              <div className="student-stat-card divisions-card">

                <div className="stat-content">

                  <p>
                    Total Divisions
                  </p>

                  <h2>

                    {

                      new Set(

                        students

                          .map(
                            (s) =>
                              s.division
                          )

                          .filter(Boolean)

                      ).size

                    }

                  </h2>


                  <span>
                    Student Divisions
                  </span>

                </div>


                <div className="student-stat-icon green-icon">

                  <Users size={30} />

                </div>

              </div>

            </div>


            {/* STUDENT DIRECTORY */}

            <div className="student-directory-card">


              <div className="directory-top">

                <div className="directory-title">

                  <div className="directory-icon">

                    <Users size={21} />

                  </div>


                  <div>

                    <h2>
                      Student Directory
                    </h2>

                    <p>
                      Find students using
                      course and division filters
                    </p>

                  </div>

                </div>


                <div className="directory-count">

                  {students.length} Students

                </div>

              </div>


              {/* FILTER */}

              <div className="filter-section">


                {/* COURSE */}

                <div className="filter-group">

                  <label>
                    Course
                  </label>


                  <select

                    value={selectedCourse}

                    onChange={(e) => {

                      setSelectedCourse(
                        e.target.value
                      );

                      setSelectedDivision("");

                    }}

                  >

                    <option value="">
                      All Courses
                    </option>


                    {courses.map(
                      (course) => (

                        <option

                          key={course}

                          value={course}

                        >

                          {course}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* DIVISION */}

                <div className="filter-group">

                  <label>
                    Division
                  </label>


                  <select

                    value={selectedDivision}

                    onChange={(e) =>
                      setSelectedDivision(
                        e.target.value
                      )
                    }

                  >

                    <option value="">
                      All Divisions
                    </option>


                    {[

                      ...new Set(

                        students

                          .filter(

                            (s) =>

                              !selectedCourse ||

                              s.course ===
                              selectedCourse

                          )

                          .map(
                            (s) =>
                              s.division
                          )

                          .filter(Boolean)

                      ),

                    ].map(
                      (division) => (

                        <option

                          key={division}

                          value={division}

                        >

                          Division {division}

                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* RESET */}

                <button

                  className="reset-filter-btn"

                  onClick={() => {

                    setSelectedCourse("");

                    setSelectedDivision("");

                  }}

                >

                  Reset Filters

                </button>

              </div>


              {/* RESULT */}

              <div className="student-result-info">

                <div>

                  Showing{" "}

                  <strong>

                    {filteredStudents.length}

                    {" "}Students

                  </strong>

                </div>


                <div className="active-filters">

                  {selectedCourse && (

                    <span className="course-filter-badge">

                      {selectedCourse}

                    </span>

                  )}


                  {selectedDivision && (

                    <span className="division-filter-badge">

                      Division {selectedDivision}

                    </span>

                  )}

                </div>

              </div>


              {/* TABLE */}

              {students.length === 0 ? (

                <div className="empty-state">

                  <Users size={45} />

                  <p>
                    No students registered yet.
                  </p>

                </div>

              ) : (

                <div className="student-table-container">

                  <table className="professional-student-table">

                    <thead>

                      <tr>

                        <th>#</th>

                        <th>
                          STUDENT NAME
                        </th>

                        <th>
                          USERNAME
                        </th>

                        <th>
                          COURSE
                        </th>

                        <th>
                          DIVISION
                        </th>

                        <th>
                          AGE
                        </th>

                        <th>
                          EMAIL
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredStudents.map(
                        (s, i) => (

                          <tr
                            key={
                              s.id ||
                              s.username
                            }
                          >

                            <td className="student-number">

                              {i + 1}

                            </td>


                            <td>

                              <div className="student-profile">

                                <div className="student-avatar">

                                  {s.full_name
                                    ?.charAt(0)
                                    ?.toUpperCase()}

                                </div>


                                <strong>

                                  {s.full_name}

                                </strong>

                              </div>

                            </td>


                            <td>

                              <span className="username-badge">

                                @{s.username}

                              </span>

                            </td>


                            <td>

                              <span className="course-badge">

                                {s.course || "—"}

                              </span>

                            </td>


                            <td>

                              <span className="division-badge">

                                Division{" "}

                                {s.division || "—"}

                              </span>

                            </td>


                            <td>

                              <span className="age-text">

                                {s.age || "—"}

                              </span>

                            </td>


                            <td className="email-text">

                              {s.email || "—"}

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>


                  {filteredStudents.length === 0 && (

                    <div className="no-results">

                      <Users size={40} />

                      <h3>
                        No Students Found
                      </h3>

                      <p>
                        Try changing your course
                        or division filter.
                      </p>

                    </div>

                  )}

                </div>

              )}

            </div>


          </>

        )}


        {/* ================================= */}
        {/* ASSIGNMENTS */}
        {/* ================================= */}

        {menu === "assignments" && (

          <>


            <div className="page-header">

              <h1>
                Assignments
              </h1>

              <p>
                Create and manage assignments
              </p>

            </div>


            <div

              style={{

                display: "grid",

                gridTemplateColumns:
                  "380px 1fr",

                gap: 20,

                alignItems: "start",

              }}

            >


              {/* CREATE ASSIGNMENT */}

              <div className="card">


                <div className="card-title">

                  <Plus size={16} />

                  Create Assignment

                </div>


                {aMsg && (

                  <div

                    className={`alert alert-${
                      aMsg.type === "error"
                        ? "error"
                        : "success"
                    }`}

                  >

                    {aMsg.text}

                  </div>

                )}


                <form
                  onSubmit={
                    handlePostAssignment
                  }
                >


                  <div className="form-group">

                    <label>
                      Title *
                    </label>


                    <input

                      value={aForm.title}

                      onChange={(e) =>
                        setAForm({

                          ...aForm,

                          title:
                            e.target.value,

                        })
                      }

                      placeholder="Assignment title"

                    />

                  </div>


                  <div className="form-group">

                    <label>
                      Description
                    </label>


                    <textarea

                      rows={3}

                      value={
                        aForm.description
                      }

                      onChange={(e) =>
                        setAForm({

                          ...aForm,

                          description:
                            e.target.value,

                        })
                      }

                      placeholder="Details..."

                      style={{
                        resize: "vertical",
                      }}

                    />

                  </div>


                  <div className="form-row">


                    <div className="form-group">

                      <label>
                        Course *
                      </label>


                      <input

                        value={
                          aForm.course
                        }

                        onChange={(e) =>
                          setAForm({

                            ...aForm,

                            course:
                              e.target.value,

                          })
                        }

                        placeholder="e.g. CS"

                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Due Date
                      </label>


                      <input

                        type="date"

                        value={
                          aForm.due_date
                        }

                        onChange={(e) =>
                          setAForm({

                            ...aForm,

                            due_date:
                              e.target.value,

                          })
                        }

                      />

                    </div>

                  </div>


                  <button

                    type="submit"

                    className="btn btn-primary btn-full"

                  >

                    <Plus size={15} />

                    Post Assignment

                  </button>

                </form>

              </div>


              {/* ALL ASSIGNMENTS */}

              <div className="card">

                <div className="card-title">

                  <ClipboardList size={16} />

                  All Assignments
                  {" "}
                  ({assignments.length})

                </div>


                {assignments.length === 0 ? (

                  <div className="empty-state">

                    <ClipboardList size={40} />

                    <p>
                      No assignments yet.
                    </p>

                  </div>

                ) : (

                  <div className="table-wrap">

                    <table>

                      <thead>

                        <tr>

                          <th>Title</th>

                          <th>Course</th>

                          <th>Due Date</th>

                          <th>Submissions</th>

                          <th>View Answers</th>

                          <th>Action</th>

                        </tr>

                      </thead>


                      <tbody>

                        {[...assignments]

                          .reverse()

                          .map((a) => {

                            const subCount =
                              submissions.filter(

                                (s) =>
                                  s.assignment_id ===
                                  a.id

                              ).length;


                            return (

                              <tr key={a.id}>


                                <td>

                                  <strong>

                                    {a.title}

                                  </strong>

                                  <br />

                                  <span

                                    style={{

                                      fontSize: 12,

                                      color:
                                        "var(--muted)",

                                    }}

                                  >

                                    {a.description}

                                  </span>

                                </td>


                                <td>

                                  <span className="badge badge-blue">

                                    {a.course}

                                  </span>

                                </td>


                                <td>

                                  {a.due_date}

                                </td>


                                <td>

                                  <span className="badge badge-green">

                                    {subCount}

                                  </span>

                                </td>


                                <td>

                                  <button

                                    className="btn btn-primary btn-sm"

                                    onClick={() => {

                                      const assignmentSubmissions =
                                        submissions.filter(

                                          (s) =>
                                            s.assignment_id ===
                                            a.id

                                        );


                                      if (
                                        assignmentSubmissions.length === 0
                                      ) {

                                        alert(
                                          "No student submissions yet!"
                                        );

                                        return;

                                      }


                                      const result =
                                        assignmentSubmissions

                                          .map(
                                            (s) => {

                                              const student =
                                                students.find(

                                                  (st) =>
                                                    st.username ===
                                                    s.student_username

                                                );


                                              return (

                                                "Student: " +

                                                (
                                                  student?.full_name ||

                                                  s.student_username
                                                ) +

                                                "\n\nAnswer:\n" +

                                                (
                                                  s.answer ||
                                                  "No answer"
                                                ) +

                                                "\n\n--------------------"

                                              );

                                            }
                                          )

                                          .join("\n\n");


                                      alert(result);

                                    }}

                                  >

                                    <ClipboardList size={13} />

                                    View Answers

                                  </button>

                                </td>


                                <td>

                                  <button

                                    className="btn btn-danger btn-sm"

                                    onClick={() => {

                                      deleteAssignment(
                                        a.id
                                      );

                                      reload();

                                    }}

                                  >

                                    <Trash2 size={13} />

                                    Delete

                                  </button>

                                </td>


                              </tr>

                            );

                          })}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>


          </>

        )}


        {/* ================================= */}
        {/* ATTENDANCE */}
        {/* ================================= */}

        {menu === "attendance" && (

          <>


            <div className="page-header">

              <h1>
                Mark Attendance
              </h1>

              <p>
                Record daily student attendance
              </p>

            </div>


            {/* COURSE AND DATE */}

            <div

              style={{

                display: "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap: 16,

                marginBottom: 20,

              }}

            >


              <div

                className="form-group"

                style={{
                  margin: 0,
                }}

              >

                <label>
                  Select Course
                </label>


                <select

                  value={selCourse}

                  onChange={(e) => {

                    setSelCourse(
                      e.target.value
                    );

                    setAttMap({});

                  }}

                >

                  {courses.length === 0 ? (

                    <option>
                      No courses
                    </option>

                  ) : (

                    courses.map(
                      (c) => (

                        <option
                          key={c}
                          value={c}
                        >

                          {c}

                        </option>

                      )
                    )

                  )}

                </select>

              </div>


              <div

                className="form-group"

                style={{
                  margin: 0,
                }}

              >

                <label>
                  Date
                </label>


                <input

                  type="date"

                  value={attDate}

                  onChange={(e) => {

                    setAttDate(
                      e.target.value
                    );

                    setAttMap({});

                  }}

                />

              </div>

            </div>


            {attMsg && (

              <div className="alert alert-success">

                {attMsg}

              </div>

            )}


            {/* ALL BUTTONS */}

            <div

              style={{

                display: "flex",

                gap: "10px",

                marginBottom: "20px",

              }}

            >

              <button

                className="btn btn-primary"

                onClick={AllPresent}

              >

                <CheckCircle2 size={15} />

                All Present

              </button>


              <button

                className="btn btn-danger"

                onClick={AllAbsent}

              >

                <XCircle size={15} />

                All Absent

              </button>

            </div>


            {/* STUDENTS */}

            {courseStudents.length === 0 ? (

              <div className="card">

                <div className="empty-state">

                  <Users size={40} />

                  <p>
                    No students in this course.
                  </p>

                </div>

              </div>

            ) : (

              <>


                <div className="attendance-grid">

                  {courseStudents.map(
                    (s) => {

                      const status =
                        getAttStatus(
                          s.username
                        );


                      return (

                        <div

                          key={s.username}

                          className="attendance-row"

                        >

                          <div>

                            <div className="student-name">

                              {s.full_name}

                            </div>


                            <div

                              style={{

                                fontSize: 12,

                                color:
                                  "var(--muted)",

                              }}

                            >

                              @{s.username}

                              {" · "}

                              {s.course}

                            </div>

                          </div>


                          <div className="att-toggle">


                            <button

                              className={`att-btn present ${
                                status === "Present"
                                  ? "active"
                                  : ""
                              }`}

                              onClick={() =>
                                setAttMap({

                                  ...attMap,

                                  [s.username]:
                                    "Present",

                                })
                              }

                            >

                              <CheckCircle2 size={14} />

                              Present

                            </button>


                            <button

                              className={`att-btn absent ${
                                status === "Absent"
                                  ? "active"
                                  : ""
                              }`}

                              onClick={() =>
                                setAttMap({

                                  ...attMap,

                                  [s.username]:
                                    "Absent",

                                })
                              }

                            >

                              <XCircle size={14} />

                              Absent

                            </button>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>


                <div
                  style={{
                    marginTop: 18,
                  }}
                >

                  <button

                    className="btn btn-primary"

                    onClick={handleSaveAtt}

                  >

                    <Save size={15} />

                    Save Attendance

                  </button>

                </div>


              </>

            )}


            {/* ATTENDANCE RECORDS */}

            <div className="card">


              <div className="card-title">

                <CalendarDays size={16} />

                Student Attendance Records

              </div>


              {/* STUDENT BUTTONS */}

              <div

                style={{

                  display: "flex",

                  gap: "10px",

                  flexWrap: "wrap",

                  marginBottom: "20px",

                }}

              >

                {students.map(
                  (student) => (

                    <button

                      key={student.username}

                      className="btn btn-primary"

                      onClick={() =>
                        setSelectedStudent(
                          student.username
                        )
                      }

                    >

                      {student.full_name}

                    </button>

                  )
                )}

              </div>


              {/* SELECTED STUDENT */}

              {selectedStudent ? (

                <>


                  <h3
                    style={{
                      marginBottom:
                        "15px",
                    }}
                  >

                    {

                      students.find(
                        (s) =>
                          s.username ===
                          selectedStudent
                      )?.full_name

                    }

                    {" "}

                    Attendance History

                  </h3>


                  <div className="table-wrap">

                    <table>

                      <thead>

                        <tr>

                          <th>#</th>

                          <th>Date</th>

                          <th>Course</th>

                          <th>Status</th>

                        </tr>

                      </thead>


                      <tbody>

                        {[...attendance]

                          .filter(
                            (a) =>
                              a.username ===
                              selectedStudent
                          )

                          .reverse()

                          .map(
                            (a, i) => (

                              <tr key={i}>

                                <td>
                                  {i + 1}
                                </td>

                                <td>
                                  {a.date}
                                </td>

                                <td>
                                  {a.course}
                                </td>

                                <td>

                                  <span

                                    className={`badge ${
                                      a.status ===
                                      "Present"

                                        ? "badge-green"

                                        : "badge-red"
                                    }`}

                                  >

                                    {a.status}

                                  </span>

                                </td>

                              </tr>

                            )
                          )}

                      </tbody>

                    </table>

                  </div>


                </>

              ) : (

                <div className="empty-state">

                  <Users size={40} />

                  <p>

                    Click on a student
                    to view attendance record.

                  </p>

                </div>

              )}

            </div>


          </>

        )}


        {/* ================================= */}
        {/* MARKS */}
        {/* ================================= */}

        {menu === "marks" && (

          <>


            <div className="page-header">

              <h1>
                Marks Management
              </h1>

              <p>
                Add and view student marks
              </p>

            </div>


            <div

              style={{

                display: "grid",

                gridTemplateColumns:
                  "380px 1fr",

                gap: 20,

                alignItems: "start",

              }}

            >


              {/* ADD MARKS */}

              <div className="card">


                <div className="card-title">

                  <Plus size={16} />

                  Add Marks

                </div>


                {mMsg && (

                  <div

                    className={`alert alert-${
                      mMsg.type === "error"
                        ? "error"
                        : "success"
                    }`}

                  >

                    {mMsg.text}

                  </div>

                )}


                {students.length === 0 ? (

                  <p

                    style={{

                      color:
                        "var(--muted)",

                      fontSize: 13,

                    }}

                  >

                    No students registered.

                  </p>

                ) : (

                  <form
                    onSubmit={handleAddMark}
                  >


                    <div className="form-group">

                      <label>
                        Student *
                      </label>


                      <select

                        value={
                          mForm.student_username
                        }

                        onChange={(e) =>
                          setMForm({

                            ...mForm,

                            student_username:
                              e.target.value,

                          })
                        }

                      >

                        {students.map(
                          (s) => (

                            <option

                              key={s.username}

                              value={s.username}

                            >

                              {s.full_name}

                              {" "}

                              (@{s.username})

                            </option>

                          )
                        )}

                      </select>

                    </div>


                    <div className="form-group">

                      <label>
                        Subject *
                      </label>


                      <input

                        value={
                          mForm.subject
                        }

                        onChange={(e) =>
                          setMForm({

                            ...mForm,

                            subject:
                              e.target.value,

                          })
                        }

                        placeholder="e.g. Mathematics"

                      />

                    </div>


                    <div className="form-row">


                      <div className="form-group">

                        <label>
                          Marks *
                        </label>


                        <input

                          type="number"

                          value={
                            mForm.marks
                          }

                          onChange={(e) =>
                            setMForm({

                              ...mForm,

                              marks:
                                e.target.value,

                            })
                          }

                          placeholder="0"

                          min="0"

                        />

                      </div>


                      <div className="form-group">

                        <label>
                          Total
                        </label>


                        <input

                          type="number"

                          value={
                            mForm.total
                          }

                          onChange={(e) =>
                            setMForm({

                              ...mForm,

                              total:
                                e.target.value,

                            })
                          }

                          min="1"

                        />

                      </div>

                    </div>


                    <div className="form-group">

                      <label>
                        Exam Type
                      </label>


                      <select

                        value={
                          mForm.exam_type
                        }

                        onChange={(e) =>
                          setMForm({

                            ...mForm,

                            exam_type:
                              e.target.value,

                          })
                        }

                      >

                        {[
                          "Quiz",
                          "Mid Term",
                          "Final",
                          "Assignment",
                          "Practical",
                        ].map(
                          (t) => (

                            <option key={t}>

                              {t}

                            </option>

                          )
                        )}

                      </select>

                    </div>


                    <button

                      type="submit"

                      className="btn btn-primary btn-full"

                    >

                      <Plus size={15} />

                      Add Marks

                    </button>


                  </form>

                )}

              </div>


              {/* MARKS RECORDS */}

              <div className="card">


                <div className="card-title">

                  <BarChart2 size={16} />

                  All Marks Records
                  {" "}
                  ({marks.length})

                </div>


                {marks.length === 0 ? (

                  <div className="empty-state">

                    <BarChart2 size={40} />

                    <p>
                      No marks added yet.
                    </p>

                  </div>

                ) : (

                  <div className="table-wrap">

                    <table>

                      <thead>

                        <tr>

                          <th>
                            Student
                          </th>

                          <th>
                            Subject
                          </th>

                          <th>
                            Exam Type
                          </th>

                          <th>
                            Marks
                          </th>

                          <th>
                            %
                          </th>

                          <th>
                            Grade
                          </th>

                          <th>
                            Action
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {[...marks]

                          .reverse()

                          .map(
                            (m) => {

                              const stu =
                                students.find(

                                  (s) =>
                                    s.username ===
                                    m.student_username

                                );


                              const pct =
                                Math.round(

                                  (
                                    Number(m.marks) /
                                    Number(m.total)
                                  ) *
                                  100

                                );


                              const grade =

                                pct >= 90
                                  ? "A+"

                                  : pct >= 80
                                  ? "A"

                                  : pct >= 70
                                  ? "B"

                                  : pct >= 60
                                  ? "C"

                                  : pct >= 50
                                  ? "D"

                                  : "F";


                              const bc =

                                pct >= 70
                                  ? "badge-green"

                                  : pct >= 50
                                  ? "badge-yellow"

                                  : "badge-red";


                              return (

                                <tr key={m.id}>


                                  <td>

                                    <strong>

                                      {stu?.full_name ||
                                        m.student_username}

                                    </strong>

                                  </td>


                                  <td>
                                    {m.subject}
                                  </td>


                                  <td>

                                    <span className="badge badge-blue">

                                      {m.exam_type}

                                    </span>

                                  </td>


                                  <td>

                                    {m.marks}/
                                    {m.total}

                                  </td>


                                  <td>
                                    {pct}%
                                  </td>


                                  <td>

                                    <span

                                      className={`badge ${bc}`}

                                    >

                                      {grade}

                                    </span>

                                  </td>


                                  <td>

                                    <button

                                      className="btn btn-danger btn-sm"

                                      onClick={() => {

                                        deleteMark(
                                          m.id
                                        );

                                        reload();

                                      }}

                                    >

                                      <Trash2 size={13} />

                                    </button>

                                  </td>


                                </tr>

                              );

                            }
                          )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>


          </>

        )}


      </div>

    </div>

  );

}