import React, { useState } from "react";
import {
  LayoutDashboard, CalendarDays, BarChart2, ClipboardList,
  CheckCircle2, XCircle, Clock, BookOpen,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { getAttendance, getMarks, getAssignments, getSubmissions, addSubmission } from "../utils/db";

const NAV = [
  { key: "dashboard",   icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { key: "attendance",  icon: <CalendarDays size={16} />,    label: "Attendance" },
  { key: "marks",       icon: <BarChart2 size={16} />,       label: "Marks & Results" },
  { key: "assignments", icon: <ClipboardList size={16} />,   label: "Assignments" },
];

export default function StudentDashboard({ user, onLogout }) {
  const [menu, setMenu] = useState("dashboard");

  const myAttendance  = getAttendance().filter((a) => a.username === user.username);
  const myMarks       = getMarks().filter((m) => m.student_username === user.username);
  const allAssignments = getAssignments().filter((a) => a.course === user.course);
  const mySubmissions = getSubmissions().filter((s) => s.student_username === user.username);

  const present = myAttendance.filter((a) => a.status === "Present").length;
  const attPct  = myAttendance.length ? Math.round((present / myAttendance.length) * 100) : 0;
  const pending = allAssignments.filter((a) => !mySubmissions.find((s) => s.assignment_id === a.id)).length;

  const handleSubmit = (aid) => {
    addSubmission({ assignment_id: aid, student_username: user.username, submitted_on: new Date().toISOString().split("T")[0], status: "Submitted" });
    window.location.reload();
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
              <p>Welcome back, {user.full_name}</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><CalendarDays size={22} /></div>
                <div className="stat-info"><h3>{attPct}%</h3><p>Attendance</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><BarChart2 size={22} /></div>
                <div className="stat-info"><h3>{myMarks.length}</h3><p>Marks Records</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><ClipboardList size={22} /></div>
                <div className="stat-info"><h3>{allAssignments.length}</h3><p>Assignments</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Clock size={22} /></div>
                <div className="stat-info"><h3>{pending}</h3><p>Pending</p></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="card">
                <div className="card-title"><CalendarDays size={16} /> Attendance Summary</div>
                <div style={{ marginBottom: 12 }}>
                  <div className="flex-between" style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>Overall Attendance</span>
                    <strong>{attPct}%</strong>
                  </div>
                  <div className="progress-bar-wrap">
                    <div className={`progress-bar ${attPct >= 75 ? "high" : attPct >= 50 ? "mid" : "low"}`} style={{ width: `${attPct}%` }} />
                  </div>
                </div>
                <div className="flex-gap" style={{ marginTop: 14 }}>
                  <span className="badge badge-green"><CheckCircle2 size={11} style={{ display: "inline", marginRight: 3 }} />Present: {present}</span>
                  <span className="badge badge-red"><XCircle size={11} style={{ display: "inline", marginRight: 3 }} />Absent: {myAttendance.length - present}</span>
                </div>
              </div>

              <div className="card">
                <div className="card-title"><BarChart2 size={16} /> Recent Marks</div>
                {myMarks.length === 0 ? (
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>No marks recorded yet.</p>
                ) : (
                  myMarks.slice(-4).map((m, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div className="flex-between" style={{ marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{m.subject}</span>
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>{m.marks}/{m.total}</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className={`progress-bar ${(m.marks / m.total) >= 0.75 ? "high" : (m.marks / m.total) >= 0.5 ? "mid" : "low"}`}
                          style={{ width: `${Math.round((m.marks / m.total) * 100)}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ── ATTENDANCE ── */}
        {menu === "attendance" && (
          <>
            <div className="page-header">
              <h1>Attendance</h1>
              <p>Your attendance records</p>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              <div className="stat-card"><div className="stat-icon"><CheckCircle2 size={22} /></div><div className="stat-info"><h3>{present}</h3><p>Present Days</p></div></div>
              <div className="stat-card"><div className="stat-icon"><XCircle size={22} /></div><div className="stat-info"><h3>{myAttendance.length - present}</h3><p>Absent Days</p></div></div>
              <div className="stat-card"><div className="stat-icon"><BarChart2 size={22} /></div><div className="stat-info"><h3>{attPct}%</h3><p>Percentage</p></div></div>
            </div>
            <div className="card">
              <div className="card-title"><CalendarDays size={16} /> Attendance Log</div>
              {myAttendance.length === 0 ? (
                <div className="empty-state"><CalendarDays size={40} /><p>No attendance records yet.</p></div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>#</th><th>Date</th><th>Course</th><th>Status</th></tr></thead>
                    <tbody>
                      {[...myAttendance].reverse().map((a, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{a.date}</td>
                          <td>{a.course}</td>
                          <td><span className={`badge ${a.status === "Present" ? "badge-green" : "badge-red"}`}>{a.status}</span></td>
                        </tr>
                      ))}
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
              <h1>Marks & Results</h1>
              <p>Your academic performance</p>
            </div>
            <div className="card">
              {myMarks.length === 0 ? (
                <div className="empty-state"><BarChart2 size={40} /><p>No marks recorded yet.</p></div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>#</th><th>Subject</th><th>Exam Type</th><th>Marks</th><th>Total</th><th>Percentage</th><th>Grade</th></tr></thead>
                    <tbody>
                      {myMarks.map((m, i) => {
                        const pct = Math.round((m.marks / m.total) * 100);
                        const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
                        const bc = pct >= 70 ? "badge-green" : pct >= 50 ? "badge-yellow" : "badge-red";
                        return (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td><strong>{m.subject}</strong></td>
                            <td><span className="badge badge-blue">{m.exam_type}</span></td>
                            <td>{m.marks}</td>
                            <td>{m.total}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div className="progress-bar-wrap" style={{ width: 80 }}>
                                  <div className={`progress-bar ${pct >= 75 ? "high" : pct >= 50 ? "mid" : "low"}`} style={{ width: `${pct}%` }} />
                                </div>
                                <span style={{ fontSize: 12 }}>{pct}%</span>
                              </div>
                            </td>
                            <td><span className={`badge ${bc}`}>{grade}</span></td>
                          </tr>
                        );
                      })}
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
              <h1>Assignments</h1>
              <p>Your course assignments</p>
            </div>
            {allAssignments.length === 0 ? (
              <div className="card"><div className="empty-state"><ClipboardList size={40} /><p>No assignments posted yet.</p></div></div>
            ) : (
              <div className="assignment-list">
                {allAssignments.map((a) => {
                  const submitted = mySubmissions.find((s) => s.assignment_id === a.id);
                  const overdue = !submitted && new Date(a.due_date) < new Date();
                  return (
                    <div key={a.id} className={`assignment-card ${submitted ? "submitted" : overdue ? "overdue" : ""}`}>
                      <div className="assignment-info">
                        <h4>{a.title}</h4>
                        <p>{a.description}</p>
                        <div className="assignment-meta">
                          <span className="badge badge-blue"><BookOpen size={10} style={{ display: "inline", marginRight: 3 }} />{a.course}</span>
                          <span className={`badge ${overdue && !submitted ? "badge-red" : "badge-yellow"}`}>Due: {a.due_date}</span>
                          {submitted && <span className="badge badge-green">Submitted on {submitted.submitted_on}</span>}
                          {overdue && !submitted && <span className="badge badge-red">Overdue</span>}
                        </div>
                      </div>
                      {!submitted && (
                        <button className="btn btn-success btn-sm" onClick={() => handleSubmit(a.id)}>
                          <CheckCircle2 size={14} /> Submit
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
