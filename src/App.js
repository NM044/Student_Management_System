import React, { useState } from "react";
import AuthPage from "./pages/AuthPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("current_user");
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (u) => {
    sessionStorage.setItem("current_user", JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("current_user");
    setUser(null);
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;
  if (user.role === "student") return <StudentDashboard user={user} onLogout={handleLogout} />;
  return <TeacherDashboard user={user} onLogout={handleLogout} />;
}
