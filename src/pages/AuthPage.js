import React, { useState } from "react";
import { GraduationCap, AlertCircle, CheckCircle } from "lucide-react";
import { loginUser, registerUser } from "../utils/db";

export default function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [msg, setMsg] = useState(null);
  const [lForm, setLForm] = useState({ username: "", password: "" });
  const [rForm, setRForm] = useState({
    role: "student", full_name: "", username: "", password: "",
    email: "", age: "", course: "", division: "",
  });

  const handleLogin = (e) => {
    e.preventDefault();
    const user = loginUser(lForm.username, lForm.password);
    if (user) onLogin(user);
    else setMsg({ type: "error", text: "Invalid username or password." });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!rForm.username || !rForm.password || !rForm.full_name) {
      setMsg({ type: "error", text: "Please fill all required fields." });
      return;
    }
    const ok = registerUser(rForm);
    if (ok) {
      setMsg({ type: "success", text: "Registered successfully! Please login." });
      setTab("login");
    } else {
      setMsg({ type: "error", text: "Username already exists." });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-left-icon">
          <GraduationCap size={36} color="#fff" />
        </div>
        <h1>EduManage</h1>
        <p>A complete student management system for teachers and students.</p>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>{tab === "login" ? "Welcome back" : "Create account"}</h2>
          <p className="sub">{tab === "login" ? "Sign in to your account" : "Register as a student or teacher"}</p>

          <div className="auth-tabs">
            <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setMsg(null); }}>Login</button>
            <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setMsg(null); }}>Register</button>
          </div>

          {msg && (
            <div className={`alert alert-${msg.type === "error" ? "error" : "success"}`}>
              {msg.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
              {msg.text}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input value={lForm.username} onChange={(e) => setLForm({ ...lForm, username: e.target.value })} placeholder="Enter your username" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={lForm.password} onChange={(e) => setLForm({ ...lForm, password: e.target.value })} placeholder="Enter your password" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Sign In</button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Register As</label>
                <select value={rForm.role} onChange={(e) => setRForm({ ...rForm, role: e.target.value })}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input value={rForm.full_name} onChange={(e) => setRForm({ ...rForm, full_name: e.target.value })} placeholder="Full name" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={rForm.email} onChange={(e) => setRForm({ ...rForm, email: e.target.value })} placeholder="Email address" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Username *</label>
                  <input value={rForm.username} onChange={(e) => setRForm({ ...rForm, username: e.target.value })} placeholder="Username" required />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" value={rForm.password} onChange={(e) => setRForm({ ...rForm, password: e.target.value })} placeholder="Password" required />
                </div>
              </div>
              {rForm.role === "student" && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Course</label>
                      <input value={rForm.course} onChange={(e) => setRForm({ ...rForm, course: e.target.value })} placeholder="e.g. CS, Math" />
                    </div>
                    <div className="form-group">
                      <label>Division</label>
                      <input value={rForm.division} onChange={(e) => setRForm({ ...rForm, division: e.target.value })} placeholder="e.g. A, B" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input type="number" value={rForm.age} onChange={(e) => setRForm({ ...rForm, age: e.target.value })} placeholder="Age" min="5" max="100" />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary btn-full">Create Account</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
