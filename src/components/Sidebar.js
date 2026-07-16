import React from "react";
import { GraduationCap, User, LogOut } from "lucide-react";

export default function Sidebar({ user, menu, setMenu, navItems, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <GraduationCap size={20} color="#fff" />
          </div>
          <h2>EduManage</h2>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <User size={18} />
          </div>
          <div className="sidebar-user-info">
            <p>{user.full_name}</p>
            <span className={user.role === "student" ? "role-student" : "role-teacher"}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${menu === item.key ? "active" : ""}`}
            onClick={() => setMenu(item.key)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
}
