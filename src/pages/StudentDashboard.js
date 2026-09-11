import React, { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BarChart2,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Trophy,
  Medal,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
  getAttendance,
  getMarks,
  getAssignments,
  getSubmissions,
  addSubmission,
} from "../utils/db";


const NAV = [
  {
    key: "dashboard",
    icon: <LayoutDashboard size={16} />,
    label: "Dashboard",
  },
  {
    key: "attendance",
    icon: <CalendarDays size={16} />,
    label: "Attendance",
  },
  {
    key: "marks",
    icon: <BarChart2 size={16} />,
    label: "Marks & Results",
  },
  {
    key: "assignments",
    icon: <ClipboardList size={16} />,
    label: "Assignments",
  },
];


export default function StudentDashboard({ user, onLogout }) {

  const [menu, setMenu] = useState("dashboard");

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  const [answer, setAnswer] =
    useState("");


  // ── STUDENT DATA ──

  const myAttendance =
    getAttendance().filter(
      (a) => a.username === user.username
    );


  const myMarks =
    getMarks().filter(
      (m) =>
        m.student_username === user.username
    );


  const allAssignments =
    getAssignments().filter(
      (a) =>
        a.course === user.course
    );


  const mySubmissions =
    getSubmissions().filter(
      (s) =>
        s.student_username === user.username
    );


  // ── ATTENDANCE CALCULATION ──

  const present =
    myAttendance.filter(
      (a) =>
        a.status === "Present"
    ).length;


  const attPct =
    myAttendance.length
      ? Math.round(
          (present / myAttendance.length) * 100
        )
      : 0;


  // ── PENDING ASSIGNMENTS ──

  const pending =
    allAssignments.filter(
      (a) =>
        !mySubmissions.find(
          (s) =>
            s.assignment_id === a.id
        )
    ).length;


  // ── TOP PERFORMERS DATA ──

  const allMarks =
    getMarks();


  const studentPerformance =
    {};


  allMarks.forEach(
    (mark) => {

      const username =
        mark.student_username;


      if (
        !studentPerformance[username]
      ) {

        studentPerformance[username] =
          {
            totalMarks: 0,
            totalPossible: 0,
          };

      }


      studentPerformance[
        username
      ].totalMarks +=
        Number(mark.marks);


      studentPerformance[
        username
      ].totalPossible +=
        Number(mark.total);

    }
  );


  const topPerformers =
    Object.entries(
      studentPerformance
    )
      .map(
        ([username, data]) => ({

          username,

          percentage:
            data.totalPossible > 0
              ? Math.round(
                  (
                    data.totalMarks /
                    data.totalPossible
                  ) * 100
                )
              : 0,

        })
      )

      .sort(
        (a, b) =>
          b.percentage -
          a.percentage
      )

      .slice(0, 3);


  // ── SUBMIT ASSIGNMENT ──

  const handleSubmit =
    (aid) => {

      if (
        !answer.trim()
      ) {

        alert(
          "Please write your answer before submitting!"
        );

        return;

      }


      addSubmission({

        assignment_id:
          aid,

        student_username:
          user.username,

        answer:
          answer,

        submitted_on:
          new Date()
            .toISOString()
            .split("T")[0],

        status:
          "Submitted",

      });


      alert(
        "Assignment submitted successfully!"
      );


      setAnswer("");

      setSelectedAssignment(
        null
      );


      window.location.reload();

    };


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


        {/* ── DASHBOARD ── */}

        {menu === "dashboard" && (

          <>


            <div className="page-header">

              <h1>
                Student Dashboard
              </h1>

              <p>
                Welcome back, {user.full_name}
                👋
              </p>

            </div>


            {/* ── STATISTICS ── */}

            <div className="stats-grid">


              <div className="stat-card">

                <div className="stat-icon">

                  <CalendarDays
                    size={22}
                  />

                </div>


                <div className="stat-info">

                  <h3>
                    {attPct}%
                  </h3>

                  <p>
                    Attendance
                  </p>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">

                  <BarChart2
                    size={22}
                  />

                </div>


                <div className="stat-info">

                  <h3>
                    {myMarks.length}
                  </h3>

                  <p>
                    Marks Records
                  </p>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">

                  <ClipboardList
                    size={22}
                  />

                </div>


                <div className="stat-info">

                  <h3>
                    {allAssignments.length}
                  </h3>

                  <p>
                    Assignments
                  </p>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">

                  <Clock
                    size={22}
                  />

                </div>


                <div className="stat-info">

                  <h3>
                    {pending}
                  </h3>

                  <p>
                    Pending
                  </p>

                </div>

              </div>


            </div>


            {/* ── ATTENDANCE + MARKS ── */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 20,
              }}
            >


              {/* ATTENDANCE SUMMARY */}

              <div className="card">

                <div className="card-title">

                  <CalendarDays
                    size={16}
                  />

                  Attendance Summary

                </div>


                <div
                  style={{
                    marginBottom: 12,
                  }}
                >


                  <div
                    className="flex-between"
                    style={{
                      marginBottom: 6,
                    }}
                  >

                    <span
                      style={{
                        fontSize: 13,
                        color:
                          "var(--muted)",
                      }}
                    >

                      Overall Attendance

                    </span>


                    <strong>

                      {attPct}%

                    </strong>


                  </div>


                  <div className="progress-bar-wrap">

                    <div
                      className={`progress-bar ${
                        attPct >= 75
                          ? "high"
                          : attPct >= 50
                          ? "mid"
                          : "low"
                      }`}

                      style={{
                        width:
                          `${attPct}%`,
                      }}
                    />

                  </div>


                </div>


                <div
                  className="flex-gap"
                  style={{
                    marginTop: 14,
                  }}
                >


                  <span className="badge badge-green">

                    <CheckCircle2
                      size={11}
                      style={{
                        display:
                          "inline",
                        marginRight: 3,
                      }}
                    />

                    Present:
                    {" "}
                    {present}

                  </span>


                  <span className="badge badge-red">

                    <XCircle
                      size={11}
                      style={{
                        display:
                          "inline",
                        marginRight: 3,
                      }}
                    />

                    Absent:
                    {" "}
                    {myAttendance.length -
                      present}

                  </span>


                </div>


              </div>


              {/* RECENT MARKS */}

              <div className="card">

                <div className="card-title">

                  <BarChart2
                    size={16}
                  />

                  Recent Marks

                </div>


                {myMarks.length === 0 ? (

                  <p
                    style={{
                      color:
                        "var(--muted)",
                      fontSize: 13,
                    }}
                  >

                    No marks recorded yet.

                  </p>

                ) : (

                  myMarks
                    .slice(-4)
                    .map(
                      (m, i) => (

                        <div
                          key={i}
                          style={{
                            marginBottom: 12,
                          }}
                        >


                          <div
                            className="flex-between"
                            style={{
                              marginBottom: 5,
                            }}
                          >

                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >

                              {m.subject}

                            </span>


                            <span
                              style={{
                                fontSize: 13,
                                color:
                                  "var(--muted)",
                              }}
                            >

                              {m.marks}
                              /
                              {m.total}

                            </span>


                          </div>


                          <div className="progress-bar-wrap">

                            <div
                              className={`progress-bar ${
                                (
                                  m.marks /
                                  m.total
                                ) >= 0.75
                                  ? "high"
                                  : (
                                      m.marks /
                                      m.total
                                    ) >= 0.5
                                  ? "mid"
                                  : "low"
                              }`}

                              style={{
                                width:
                                  `${Math.round(
                                    (
                                      m.marks /
                                      m.total
                                    ) *
                                      100
                                  )}%`,
                              }}
                            />

                          </div>


                        </div>

                      )
                    )

                )}


              </div>


            </div>


            {/* ── TOP PERFORMERS ── */}

            <div
              className="card"
              style={{
                marginTop: 20,
              }}
            >


              <div
                className="card-title"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >

                <Trophy
                  size={20}
                />

                Top Performers

              </div>


              <p
                style={{
                  color:
                    "var(--muted)",
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >

                Students with the highest
                overall academic performance

              </p>


              {topPerformers.length === 0 ? (

                <div className="empty-state">

                  <Trophy
                    size={40}
                  />

                  <p>
                    No marks available for
                    ranking yet.
                  </p>

                </div>

              ) : (

                <div
                  style={{
                    display: "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",

                    gap: 16,
                  }}
                >


                  {topPerformers.map(
                    (
                      student,
                      index
                    ) => {


                      const rankIcon =
                        index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : "🥉";


                      const isCurrentStudent =
                        student.username ===
                        user.username;


                      return (

                        <div
                          key={
                            student.username
                          }

                          style={{

                            padding: 20,

                            borderRadius: 14,

                            border:
                              isCurrentStudent
                                ? "2px solid #4f46e5"
                                : "1px solid var(--border)",

                            background:
                              isCurrentStudent
                                ? "#f5f3ff"
                                : "#fff",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "space-between",

                            boxShadow:
                              "0 4px 12px rgba(0,0,0,0.05)",

                          }}
                        >


                          <div
                            style={{

                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap: 12,

                            }}
                          >


                            <div
                              style={{
                                fontSize: 28,
                              }}
                            >

                              {rankIcon}

                            </div>


                            <div>


                              <div
                                style={{

                                  fontWeight: 700,

                                  fontSize: 15,

                                }}
                              >

                                @{
                                  student.username
                                }


                                {isCurrentStudent && (

                                  <span
                                    style={{

                                      marginLeft: 8,

                                      fontSize: 10,

                                      padding:
                                        "4px 8px",

                                      borderRadius:
                                        10,

                                      background:
                                        "#4f46e5",

                                      color:
                                        "white",

                                    }}
                                  >

                                    YOU

                                  </span>

                                )}


                              </div>


                              <div
                                style={{

                                  fontSize: 12,

                                  color:
                                    "var(--muted)",

                                  marginTop: 4,

                                }}
                              >

                                Rank #
                                {index + 1}

                              </div>


                            </div>


                          </div>


                          <div
                            style={{
                              textAlign:
                                "right",
                            }}
                          >


                            <div
                              style={{

                                fontSize: 22,

                                fontWeight: 700,

                                color:
                                  "#16a34a",

                              }}
                            >

                              {
                                student.percentage
                              }%

                            </div>


                            <div
                              style={{

                                fontSize: 11,

                                color:
                                  "var(--muted)",

                              }}
                            >

                              Performance

                            </div>


                          </div>


                        </div>

                      );

                    }
                  )}


                </div>

              )}


            </div>


          </>

        )}


        {/* ── ATTENDANCE ── */}

        {menu === "attendance" && (

          <>

            <div className="page-header">

              <h1>
                Attendance
              </h1>

              <p>
                Your attendance records
              </p>

            </div>


            <div
              className="stats-grid"
              style={{
                gridTemplateColumns:
                  "repeat(3,1fr)",
              }}
            >


              <div className="stat-card">

                <div className="stat-icon">

                  <CheckCircle2
                    size={22}
                  />

                </div>

                <div className="stat-info">

                  <h3>
                    {present}
                  </h3>

                  <p>
                    Present Days
                  </p>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">

                  <XCircle
                    size={22}
                  />

                </div>

                <div className="stat-info">

                  <h3>
                    {myAttendance.length -
                      present}
                  </h3>

                  <p>
                    Absent Days
                  </p>

                </div>

              </div>


              <div className="stat-card">

                <div className="stat-icon">

                  <BarChart2
                    size={22}
                  />

                </div>

                <div className="stat-info">

                  <h3>
                    {attPct}%
                  </h3>

                  <p>
                    Percentage
                  </p>

                </div>

              </div>


            </div>


            <div className="card">

              <div className="card-title">

                <CalendarDays
                  size={16}
                />

                Attendance Log

              </div>


              {myAttendance.length === 0 ? (

                <div className="empty-state">

                  <CalendarDays
                    size={40}
                  />

                  <p>
                    No attendance records yet.
                  </p>

                </div>

              ) : (

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

                      {[...myAttendance]
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

              )}


            </div>


          </>

        )}


        {/* ── MARKS ── */}

        {menu === "marks" && (

          <>

            <div className="page-header">

              <h1>
                Marks & Results
              </h1>

              <p>
                Your academic performance
              </p>

            </div>


            <div className="card">


              {myMarks.length === 0 ? (

                <div className="empty-state">

                  <BarChart2
                    size={40}
                  />

                  <p>
                    No marks recorded yet.
                  </p>

                </div>

              ) : (

                <div className="table-wrap">

                  <table>

                    <thead>

                      <tr>

                        <th>#</th>

                        <th>Subject</th>

                        <th>Exam Type</th>

                        <th>Marks</th>

                        <th>Total</th>

                        <th>Percentage</th>

                        <th>Grade</th>

                      </tr>

                    </thead>


                    <tbody>

                      {myMarks.map(
                        (m, i) => {

                          const pct =
                            Math.round(
                              (
                                m.marks /
                                m.total
                              ) * 100
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

                            <tr key={i}>

                              <td>
                                {i + 1}
                              </td>

                              <td>

                                <strong>
                                  {m.subject}
                                </strong>

                              </td>

                              <td>

                                <span className="badge badge-blue">

                                  {m.exam_type}

                                </span>

                              </td>

                              <td>
                                {m.marks}
                              </td>

                              <td>
                                {m.total}
                              </td>

                              <td>

                                <div
                                  style={{

                                    display:
                                      "flex",

                                    alignItems:
                                      "center",

                                    gap: 8,

                                  }}
                                >

                                  <div
                                    className="progress-bar-wrap"
                                    style={{
                                      width: 80,
                                    }}
                                  >

                                    <div
                                      className={`progress-bar ${
                                        pct >= 75
                                          ? "high"
                                          : pct >= 50
                                          ? "mid"
                                          : "low"
                                      }`}

                                      style={{
                                        width:
                                          `${pct}%`,
                                      }}
                                    />

                                  </div>


                                  <span
                                    style={{
                                      fontSize: 12,
                                    }}
                                  >

                                    {pct}%

                                  </span>

                                </div>

                              </td>


                              <td>

                                <span
                                  className={`badge ${bc}`}
                                >

                                  {grade}

                                </span>

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


          </>

        )}


        {/* ── ASSIGNMENTS ── */}

        {menu === "assignments" && (

          <>


            <div className="page-header">

              <h1>
                Assignments
              </h1>

              <p>
                Your course assignments
              </p>

            </div>


            {allAssignments.length === 0 ? (

              <div className="card">

                <div className="empty-state">

                  <ClipboardList
                    size={40}
                  />

                  <p>
                    No assignments posted yet.
                  </p>

                </div>

              </div>

            ) : (

              <div className="assignment-list">


                {allAssignments.map(
                  (a) => {

                    const submitted =
                      mySubmissions.find(
                        (s) =>
                          s.assignment_id ===
                          a.id
                      );


                    const overdue =
                      !submitted &&
                      new Date(
                        a.due_date
                      ) <
                      new Date();


                    return (

                      <div
                        key={a.id}

                        className={`assignment-card ${
                          submitted
                            ? "submitted"
                            : overdue
                            ? "overdue"
                            : ""
                        }`}
                      >


                        <div className="assignment-info">


                          <h4>
                            {a.title}
                          </h4>


                          <p>
                            {a.description}
                          </p>


                          {/* WRITE ANSWER */}

                          {selectedAssignment ===
                            a.id &&
                            !submitted && (

                              <div
                                style={{

                                  marginTop: 20,

                                  padding: 15,

                                  borderTop:
                                    "1px solid #ddd",

                                }}
                              >


                                <h4>
                                  Write Your Answer
                                </h4>


                                <textarea

                                  rows="6"

                                  value={answer}

                                  onChange={
                                    (e) =>
                                      setAnswer(
                                        e.target.value
                                      )
                                  }

                                  placeholder="Write your assignment answer here..."

                                  style={{

                                    width: "100%",

                                    marginTop: 10,

                                    padding: 12,

                                    borderRadius: 8,

                                    border:
                                      "1px solid #ccc",

                                    resize:
                                      "vertical",

                                  }}

                                />


                                <div
                                  style={{
                                    marginTop: 12,
                                  }}
                                >

                                  <button

                                    className="btn btn-primary"

                                    onClick={() =>
                                      handleSubmit(
                                        a.id
                                      )
                                    }
                                  >

                                    <CheckCircle2
                                      size={14}
                                    />

                                    Submit Assignment

                                  </button>

                                </div>


                              </div>

                            )}


                          {/* META */}

                          <div className="assignment-meta">


                            <span className="badge badge-blue">

                              <BookOpen
                                size={10}

                                style={{

                                  display:
                                    "inline",

                                  marginRight: 3,

                                }}
                              />

                              {a.course}

                            </span>


                            <span
                              className={`badge ${
                                overdue &&
                                !submitted
                                  ? "badge-red"
                                  : "badge-yellow"
                              }`}
                            >

                              Due:
                              {" "}
                              {a.due_date}

                            </span>


                            {submitted && (

                              <span className="badge badge-green">

                                Submitted on
                                {" "}
                                {
                                  submitted.submitted_on
                                }

                              </span>

                            )}


                            {overdue &&
                              !submitted && (

                                <span className="badge badge-red">

                                  Overdue

                                </span>

                              )}


                          </div>


                        </div>


                        {/* WRITE ANSWER BUTTON */}

                        {!submitted && (

                          <button

                            className="btn btn-primary btn-sm"

                            onClick={() => {

                              setSelectedAssignment(
                                a.id
                              );

                              setAnswer("");

                            }}
                          >

                            <ClipboardList
                              size={14}
                            />

                            Write Answer

                          </button>

                        )}


                      </div>

                    );

                  }
                )}


              </div>

            )}


          </>

        )}


      </div>


    </div>

  );

}