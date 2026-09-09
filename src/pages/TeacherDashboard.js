
import React, { useState } from "react";
import {
  LayoutDashboard, Users, ClipboardList, CalendarDays, BarChart2,
  CheckCircle2, XCircle, Trash2, Plus, Save,BookOpen,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import {
  getUsers, getAssignments, addAssignment, deleteAssignment,
  getAttendance, saveAttendance, getMarks, addMark, deleteMark,
  getSubmissions,
} from "../utils/db";

const NAV = [
  { key: "dashboard",   icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { key: "students",    icon: <Users size={16} />,           label: "Manage Students" },
  { key: "assignments", icon: <ClipboardList size={16} />,   label: "Assignments" },
  { key: "attendance",  icon: <CalendarDays size={16} />,    label: "Attendance" },
  { key: "marks",       icon: <BarChart2 size={16} />,       label: "Marks" },
];

const today = new Date().toISOString().split("T")[0];

export default function TeacherDashboard({ user, onLogout }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
const [selectedDivision, setSelectedDivision] = useState(null);
  const [menu, setMenu] = useState("dashboard");
  const [refresh, setRefresh] = useState(0);
  const reload = () => setRefresh((r) => r + 1);

  const students    = getUsers().filter((u) => u.role === "student");
  const assignments = getAssignments();
  const attendance  = getAttendance();
  const marks       = getMarks();
  const submissions = getSubmissions();
  const courses     = [...new Set(students.map((s) => s.course).filter(Boolean))];

  // assignment form
  const [aForm, setAForm] = useState({ title: "", description: "", course: "", due_date: today });
  const [aMsg, setAMsg]   = useState(null);

  // attendance
  const [selCourse, setSelCourse] = useState(courses[0] || "");
  const [attDate, setAttDate]     = useState(today);
  const [attMap, setAttMap]       = useState({});
  const [attMsg, setAttMsg]       = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const courseStudents = students.filter((s) => s.course === selCourse);

  const getAttStatus = (username) => {
    if (attMap[username]) return attMap[username];
    const ex = attendance.find((a) => a.username === username && a.date === attDate && a.course === selCourse);
    return ex ? ex.status : "Present";
  };
const AllPresent = () => {
  const allPresent = {};

  courseStudents.forEach((student) => {
    allPresent[student.username] = "Present";
  });

  setAttMap(allPresent);
};


const AllAbsent = () => {
  const allAbsent = {};

  courseStudents.forEach((student) => {
    allAbsent[student.username] = "Absent";
  });

  setAttMap(allAbsent);
};
  const handleSaveAtt = () => {
    saveAttendance(courseStudents.map((s) => ({ username: s.username, date: attDate, status: getAttStatus(s.username), course: selCourse })));
    setAttMsg("Attendance saved successfully!");
    setAttMap({});
    reload();
    setTimeout(() => setAttMsg(null), 3000);
  };

  // marks form
  const [mForm, setMForm] = useState({ student_username: students[0]?.username || "", subject: "", marks: "", total: "100", exam_type: "Quiz" });
  const [mMsg, setMMsg]   = useState(null);

  const handleAddMark = (e) => {
    e.preventDefault();
    if (!mForm.subject || !mForm.marks) { setMMsg({ type: "error", text: "Subject and marks are required." }); return; }
    addMark(mForm);
    setMMsg({ type: "success", text: "Marks added!" });
    setMForm({ ...mForm, subject: "", marks: "", total: "100" });
    reload();
    setTimeout(() => setMMsg(null), 3000);
  };

  const handlePostAssignment = (e) => {
    e.preventDefault();
    if (!aForm.title || !aForm.course) { setAMsg({ type: "error", text: "Title and course are required." }); return; }
    addAssignment({ ...aForm, created_by: user.full_name });
    setAMsg({ type: "success", text: "Assignment posted!" });
    setAForm({ title: "", description: "", course: "", due_date: today });
    reload();
    setTimeout(() => setAMsg(null), 3000);
  };

  return (
    <div className="layout">
      <Sidebar user={user} menu={menu} setMenu={setMenu} navItems={NAV} onLogout={onLogout} />
      <div className="main-content">

        {/* ── DASHBOARD ── */}
        {menu === "dashboard" && (
          <>
            <div className="page-header">
              <h1>Dashboard</h1>
              <p>Welcome, {user.full_name} — {today}</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon"><Users size={22} /></div><div className="stat-info"><h3>{students.length}</h3><p>Total Students</p></div></div>
              <div className="stat-card"><div className="stat-icon"><ClipboardList size={22} /></div><div className="stat-info"><h3>{assignments.length}</h3><p>Assignments</p></div></div>
              <div className="stat-card"><div className="stat-icon"><CalendarDays size={22} /></div><div className="stat-info"><h3>{attendance.filter((a) => a.date === today).length}</h3><p>Attendance Today</p></div></div>
              <div className="stat-card"><div className="stat-icon"><BarChart2 size={22} /></div><div className="stat-info"><h3>{marks.length}</h3><p>Marks Records</p></div></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="card">
                <div className="card-title"><Users size={16} /> Students by Course</div>
                {courses.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No students yet.</p> :
                  courses.map((course) => {
                    const count = students.filter((s) => s.course === course).length;
                    const pct = Math.round((count / students.length) * 100);
                    return (
                      <div key={course} style={{ marginBottom: 12 }}>
                        <div className="flex-between" style={{ marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{course}</span>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>{count} students</span>
                        </div>
                        <div className="progress-bar-wrap">
                          <div className="progress-bar high" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="card">
                <div className="card-title"><ClipboardList size={16} /> Recent Assignments</div>
                {assignments.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No assignments yet.</p> :
                  assignments.slice(-4).reverse().map((a) => {
                    const subCount = submissions.filter((s) => s.assignment_id === a.id).length;
                    return (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>{a.course} · Due {a.due_date}</div>
                        </div>
                        <span className="badge badge-blue">{subCount} submitted</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}

        {/* ── MANAGE STUDENTS ── */}
{menu === "students" && (
  <>
    <div className="page-header">

      <h1>Manage Students</h1>

      <p>{students.length} students registered</p>

    </div>


    {/* NO STUDENTS */}

    {students.length === 0 ? (

      <div className="card">

        <div className="empty-state">

          <Users size={40} />

          <p>No students registered yet.</p>

        </div>

      </div>

    ) : (

      <>
      
        {/* ===================== */}
        {/* COURSE LIST */}
        {/* ===================== */}

        {!selectedCourse && (

          <div className="card">

            <div className="card-title">

              Select Course

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px"
              }}
            >

              {[...new Set(
                students.map(
                  (s) => s.course || "No Course"
                )
              )].map((course) => {

                const courseStudents =
                  students.filter(
                    (s) =>
                      (s.course || "No Course") === course
                  );


                return (

                  <div
                    key={course}

                    onClick={() => {

                      setSelectedCourse(course);

                      setSelectedDivision(null);

                    }}

                    style={{
                      padding: "25px",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      cursor: "pointer",
                      textAlign: "center"
                    }}
                  >

                    <BookOpen size={28} />

                    <h3
                      style={{
                        marginTop: "10px"
                      }}
                    >

                      {course}

                    </h3>


                    <p>

                      👥 {courseStudents.length} Students

                    </p>

                  </div>

                );

              })}

            </div>

          </div>

        )}


        {/* ===================== */}
        {/* DIVISION LIST */}
        {/* ===================== */}

        {selectedCourse &&
          !selectedDivision && (

            <div className="card">

              <button

                className="btn btn-secondary"

                onClick={() => {

                  setSelectedCourse(null);

                }}

                style={{
                  marginBottom: "20px"
                }}

              >

                ← Back to Courses

              </button>


              <div className="card-title">

                {selectedCourse} - Divisions

              </div>


              <div
                style={{
                  display: "grid",

                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",

                  gap: "20px"
                }}
              >

                {[...new Set(

                  students

                    .filter(
                      (s) =>
                        (s.course || "No Course") ===
                        selectedCourse
                    )

                    .map(
                      (s) =>
                        s.division || "No Division"
                    )

                )].map((division) => {

                  const divisionStudents =

                    students.filter(

                      (s) =>

                        (s.course || "No Course") ===
                        selectedCourse &&

                        (s.division || "No Division") ===
                        division

                    );


                  return (

                    <div

                      key={division}

                      onClick={() => {

                        setSelectedDivision(
                          division
                        );

                      }}

                      style={{
                        padding: "25px",

                        border:
                          "1px solid #ddd",

                        borderRadius: "10px",

                        cursor: "pointer",

                        textAlign: "center"
                      }}
                    >

                      <Users size={28} />


                      <h3
                        style={{
                          marginTop: "10px"
                        }}
                      >

                        Division {division}

                      </h3>


                      <p>

                        👥 {divisionStudents.length}
                        {" "}
                        Students

                      </p>

                    </div>

                  );

                })}

              </div>

            </div>

          )}


        {/* ===================== */}
        {/* STUDENT LIST */}
        {/* ===================== */}

        {selectedCourse &&
          selectedDivision && (

            <div className="card">


              <button

                className="btn btn-secondary"

                onClick={() => {

                  setSelectedDivision(null);

                }}

                style={{
                  marginBottom: "20px"
                }}

              >

                ← Back to Divisions

              </button>


              <div className="card-title">

                {selectedCourse}

                {" → "}

                Division {selectedDivision}

              </div>


              <div className="table-wrap">

                <table>

                  <thead>

                    <tr>

                      <th>#</th>

                      <th>Name</th>

                      <th>Username</th>

                      <th>Age</th>

                      <th>Email</th>

                    </tr>

                  </thead>


                  <tbody>

                    {students

                      .filter(

                        (s) =>

                          (s.course || "No Course") ===
                          selectedCourse &&

                          (s.division || "No Division") ===
                          selectedDivision

                      )

                      .map((s, i) => (

                        <tr key={s.id}>

                          <td>{i + 1}</td>


                          <td>

                            <strong>

                              {s.full_name}

                            </strong>

                          </td>


                          <td>

                            <span
                              className="badge badge-gray"
                            >

                              @{s.username}

                            </span>

                          </td>


                          <td>

                            {s.age || "—"}

                          </td>


                          <td>

                            {s.email || "—"}

                          </td>


                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            </div>

          )}

      </>

    )}

  </>
)}
              {/* ── ASSIGNMENTS ── */}
{menu === "assignments" && (
  <>
    <div className="page-header">
      <h1>Assignments</h1>
      <p>Create and manage assignments</p>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: 20,
        alignItems: "start"
      }}
    >

      {/* CREATE ASSIGNMENT */}

      <div className="card">

        <div className="card-title">
          <Plus size={16} /> Create Assignment
        </div>

        {aMsg && (
          <div
            className={`alert alert-${
              aMsg.type === "error" ? "error" : "success"
            }`}
          >
            {aMsg.text}
          </div>
        )}

        <form onSubmit={handlePostAssignment}>

          <div className="form-group">
            <label>Title *</label>

            <input
              value={aForm.title}
              onChange={(e) =>
                setAForm({
                  ...aForm,
                  title: e.target.value
                })
              }
              placeholder="Assignment title"
            />
          </div>


          <div className="form-group">

            <label>Description</label>

            <textarea
              rows={3}
              value={aForm.description}
              onChange={(e) =>
                setAForm({
                  ...aForm,
                  description: e.target.value
                })
              }
              placeholder="Details..."
              style={{ resize: "vertical" }}
            />

          </div>


          <div className="form-row">

            <div className="form-group">

              <label>Course *</label>

              <input
                value={aForm.course}
                onChange={(e) =>
                  setAForm({
                    ...aForm,
                    course: e.target.value
                  })
                }
                placeholder="e.g. CS"
              />

            </div>


            <div className="form-group">

              <label>Due Date</label>

              <input
                type="date"
                value={aForm.due_date}
                onChange={(e) =>
                  setAForm({
                    ...aForm,
                    due_date: e.target.value
                  })
                }
              />

            </div>

          </div>


          <button
            type="submit"
            className="btn btn-primary btn-full"
          >
            <Plus size={15} /> Post Assignment
          </button>

        </form>

      </div>


      {/* ALL ASSIGNMENTS */}

      <div className="card">

        <div className="card-title">
          <ClipboardList size={16} />
          All Assignments ({assignments.length})
        </div>


        {assignments.length === 0 ? (

          <div className="empty-state">

            <ClipboardList size={40} />

            <p>No assignments yet.</p>

          </div>

        ) : (

          <div className="table-wrap">

            <table>


              {/* TABLE HEADING */}

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


              {/* TABLE BODY */}

              <tbody>

                {[...assignments]
                  .reverse()
                  .map((a) => {

                    const subCount =
                      submissions.filter(
                        (s) =>
                          s.assignment_id === a.id
                      ).length;


                    return (

                      <tr key={a.id}>


                        {/* TITLE */}

                        <td>

                          <strong>
                            {a.title}
                          </strong>

                          <br />

                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--muted)"
                            }}
                          >
                            {a.description}
                          </span>

                        </td>


                        {/* COURSE */}

                        <td>

                          <span className="badge badge-blue">

                            {a.course}

                          </span>

                        </td>


                        {/* DUE DATE */}

                        <td>

                          {a.due_date}

                        </td>


                        {/* SUBMISSIONS */}

                        <td>

                          <span className="badge badge-green">

                            {subCount}

                          </span>

                        </td>


                        {/* VIEW ANSWERS */}

                        <td>

                          <button
                            className="btn btn-primary btn-sm"

                            onClick={() => {

                              const assignmentSubmissions =
                                submissions.filter(
                                  (s) =>
                                    s.assignment_id === a.id
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
                                  .map((s) => {

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

                                  })

                                  .join("\n\n");


                              alert(result);

                            }}

                          >

                            <ClipboardList size={13} />

                            View Answers

                          </button>

                        </td>


                        {/* DELETE */}

                        <td>

                          <button
                            className="btn btn-danger btn-sm"

                            onClick={() => {

                              deleteAssignment(a.id);

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
      
        {/* ── ATTENDANCE ── */}
        {menu === "attendance" && (
          <>
            <div className="page-header">
              <h1>Mark Attendance</h1>
              <p>Record daily student attendance</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Course</label>
                <select value={selCourse} onChange={(e) => { setSelCourse(e.target.value); setAttMap({}); }}>
                  {courses.length === 0 ? <option>No courses</option> : courses.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Date</label>
                <input type="date" value={attDate} onChange={(e) => { setAttDate(e.target.value); setAttMap({}); }} />
              </div>
            </div>

            {attMsg && <div className="alert alert-success">{attMsg}</div>}
            <div style={{
  display: "flex",
  gap: "10px",
  marginBottom: "20px"
}}>

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

            {courseStudents.length === 0 ? (
              <div className="card"><div className="empty-state"><Users size={40} /><p>No students in this course.</p></div></div>
            ) : (
              <>
                <div className="attendance-grid">
                  {courseStudents.map((s) => {
                    const status = getAttStatus(s.username);
                    return (
                      <div key={s.username} className="attendance-row">
                        <div>
                          <div className="student-name">{s.full_name}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)" }}>@{s.username} · {s.course}</div>
                        </div>
                        <div className="att-toggle">
                          <button className={`att-btn present ${status === "Present" ? "active" : ""}`}
                            onClick={() => setAttMap({ ...attMap, [s.username]: "Present" })}>
                            <CheckCircle2 size={14} /> Present
                          </button>
                          <button className={`att-btn absent ${status === "Absent" ? "active" : ""}`}
                            onClick={() => setAttMap({ ...attMap, [s.username]: "Absent" })}>
                            <XCircle size={14} /> Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 18 }}>
                  <button className="btn btn-primary" onClick={handleSaveAtt}><Save size={15} /> Save Attendance</button>
                </div>
              </>
            )}

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
      marginBottom: "20px"
    }}
  >

    {students.map((student) => (

      <button
        key={student.username}
        className="btn btn-primary"
        onClick={() =>
          setSelectedStudent(student.username)
        }
      >

        {student.full_name}

      </button>

    ))}

  </div>


  {/* SELECTED STUDENT RECORD */}

  {selectedStudent ? (

    <>

      <h3 style={{ marginBottom: "15px" }}>

        {
          students.find(
            (s) => s.username === selectedStudent
          )?.full_name
        }

        {" "}Attendance History

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
                  a.username === selectedStudent
              )

              .reverse()

              .map((a, i) => (

                <tr key={i}>

                  <td>{i + 1}</td>

                  <td>{a.date}</td>

                  <td>{a.course}</td>

                  <td>

                    <span
                      className={`badge ${
                        a.status === "Present"
                          ? "badge-green"
                          : "badge-red"
                      }`}
                    >

                      {a.status}

                    </span>

                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </>

  ) : (

    <div className="empty-state">

      <Users size={40} />

      <p>
        Click on a student to view attendance record.
      </p>

    </div>

  )}

</div>
          </>
        )}

        {/* ── MARKS ── */}
        {menu === "marks" && (
          <>
            <div className="page-header">
              <h1>Marks Management</h1>
              <p>Add and view student marks</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 20, alignItems: "start" }}>
              <div className="card">
                <div className="card-title"><Plus size={16} /> Add Marks</div>
                {mMsg && <div className={`alert alert-${mMsg.type === "error" ? "error" : "success"}`}>{mMsg.text}</div>}
                {students.length === 0 ? <p style={{ color: "var(--muted)", fontSize: 13 }}>No students registered.</p> : (
                  <form onSubmit={handleAddMark}>
                    <div className="form-group">
                      <label>Student *</label>
                      <select value={mForm.student_username} onChange={(e) => setMForm({ ...mForm, student_username: e.target.value })}>
                        {students.map((s) => <option key={s.username} value={s.username}>{s.full_name} (@{s.username})</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Subject *</label><input value={mForm.subject} onChange={(e) => setMForm({ ...mForm, subject: e.target.value })} placeholder="e.g. Mathematics" /></div>
                    <div className="form-row">
                      <div className="form-group"><label>Marks *</label><input type="number" value={mForm.marks} onChange={(e) => setMForm({ ...mForm, marks: e.target.value })} placeholder="0" min="0" /></div>
                      <div className="form-group"><label>Total</label><input type="number" value={mForm.total} onChange={(e) => setMForm({ ...mForm, total: e.target.value })} min="1" /></div>
                    </div>
                    <div className="form-group">
                      <label>Exam Type</label>
                      <select value={mForm.exam_type} onChange={(e) => setMForm({ ...mForm, exam_type: e.target.value })}>
                        {["Quiz", "Mid Term", "Final", "Assignment", "Practical"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full"><Plus size={15} /> Add Marks</button>
                  </form>
                )}
              </div>

              <div className="card">
                <div className="card-title"><BarChart2 size={16} /> All Marks Records ({marks.length})</div>
                {marks.length === 0 ? (
                  <div className="empty-state"><BarChart2 size={40} /><p>No marks added yet.</p></div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Student</th><th>Subject</th><th>Exam Type</th><th>Marks</th><th>%</th><th>Grade</th><th>Action</th></tr></thead>
                      <tbody>
                        {[...marks].reverse().map((m) => {
                          const stu = students.find((s) => s.username === m.student_username);
                          const pct = Math.round((m.marks / m.total) * 100);
                          const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
                          const bc = pct >= 70 ? "badge-green" : pct >= 50 ? "badge-yellow" : "badge-red";
                          return (
                            <tr key={m.id}>
                              <td><strong>{stu?.full_name || m.student_username}</strong></td>
                              <td>{m.subject}</td>
                              <td><span className="badge badge-blue">{m.exam_type}</span></td>
                              <td>{m.marks}/{m.total}</td>
                              <td>{pct}%</td>
                              <td><span className={`badge ${bc}`}>{grade}</span></td>
                              <td>
                                <button className="btn btn-danger btn-sm" onClick={() => { deleteMark(m.id); reload(); }}>
                                  <Trash2 size={13} />
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

      </div>
    </div>
  );
}

