import React, { useState } from "react";
import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { loginUser, registerUser } from "../utils/db";

export default function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [msg, setMsg] = useState(null);

  const [lForm, setLForm] = useState({
    username: "",
    password: "",
  });

  const [rForm, setRForm] = useState({
    role: "student",
    full_name: "",
    username: "",
    password: "",
    email: "",
    age: "",
    course: "",
    division: "",
  });

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();

    const user = loginUser(
      lForm.username,
      lForm.password
    );

    if (user) {
      onLogin(user);
    } else {
      setMsg({
        type: "error",
        text: "Invalid username or password.",
      });
    }
  };

  // REGISTER
  const handleRegister = (e) => {
    e.preventDefault();

    if (
      !rForm.full_name ||
      !rForm.username ||
      !rForm.password
    ) {
      setMsg({
        type: "error",
        text: "Please fill all required fields.",
      });

      return;
    }

    const ok = registerUser(rForm);

    if (ok) {
      setMsg({
        type: "success",
        text: "Account created successfully! Please login.",
      });

      setTab("login");

      setLForm({
        username: rForm.username,
        password: "",
      });
    } else {
      setMsg({
        type: "error",
        text: "Username already exists.",
      });
    }
  };

  return (
    <div className="login-page">

      {/* ================= LEFT SIDE ================= */}

      <div className="login-left">

        <div className="brand-icon">
          <GraduationCap size={42} />
        </div>

        <div className="portal-text">
          STUDENT PORTAL
        </div>

        <h1>
          Student Management
          <br />
          System
        </h1>

        <p>
          A smart and secure platform designed to manage
          students, teachers, attendance, assignments and
          academic records in one place.
        </p>


        {/* STATS */}

        <div className="stats">

          <div className="stat-item">

            <Users size={30} />

            <div>
              <strong>50+</strong>
              <span>Students</span>
            </div>

          </div>


          <div className="stat-item">

            <BookOpen size={30} />

            <div>
              <strong>10+</strong>
              <span>Teachers</span>
            </div>

          </div>


          <div className="stat-item">

            <CheckCircle size={30} />

            <div>
              <strong>24/7</strong>
              <span>Access</span>
            </div>

          </div>

        </div>


        {/* FEATURES */}

        <div className="features">

          <div>
            <CheckCircle size={18} />
            Simple
          </div>

          <div>
            <CheckCircle size={18} />
            Secure
          </div>

          <div>
            <CheckCircle size={18} />
            Organized
          </div>

        </div>

      </div>


      {/* ================= RIGHT SIDE ================= */}

      <div className="login-right">

        <div className="login-card">

          <div className="mobile-logo">
            <GraduationCap size={35} />
          </div>


          <h2>
            {tab === "login"
              ? "Welcome back"
              : "Create Account"}
          </h2>


          <p className="login-subtitle">
            {tab === "login"
              ? "Enter your details to access your dashboard."
              : "Create your Student Management System account."}
          </p>


          {/* TABS */}

          <div className="login-tabs">

            <button
              className={
                tab === "login"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setTab("login");
                setMsg(null);
              }}
            >
              Sign In
            </button>


            <button
              className={
                tab === "register"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setTab("register");
                setMsg(null);
              }}
            >
              Register
            </button>

          </div>


          {/* MESSAGE */}

          {msg && (

            <div
              className={`message ${msg.type}`}
            >

              {msg.type === "error" ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle size={18} />
              )}

              {msg.text}

            </div>

          )}


          {/* ================= LOGIN ================= */}

          {tab === "login" && (

            <form onSubmit={handleLogin}>

              {/* USERNAME */}

              <div className="input-group">

                <label>
                  Username
                </label>

                <div className="input-box">

                  <User size={20} />

                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={lForm.username}
                    onChange={(e) =>
                      setLForm({
                        ...lForm,
                        username: e.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="input-group">

                <label>
                  Password
                </label>

                <div className="input-box">

                  <Lock size={20} />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={lForm.password}
                    onChange={(e) =>
                      setLForm({
                        ...lForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />


                  <button
                    type="button"
                    className="eye-button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}

                  </button>

                </div>

              </div>


              <button
                type="submit"
                className="signin-button"
              >
                Sign In to Dashboard
              </button>

            </form>

          )}


          {/* ================= REGISTER ================= */}

          {tab === "register" && (

            <form onSubmit={handleRegister}>


              <div className="input-group">

                <label>
                  Register As
                </label>

                <select
                  value={rForm.role}
                  onChange={(e) =>
                    setRForm({
                      ...rForm,
                      role: e.target.value,
                    })
                  }
                >

                  <option value="student">
                    Student
                  </option>

                  <option value="teacher">
                    Teacher
                  </option>

                </select>

              </div>


              <div className="two-inputs">

                <div className="input-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={rForm.full_name}
                    onChange={(e) =>
                      setRForm({
                        ...rForm,
                        full_name: e.target.value,
                      })
                    }
                    required
                  />

                </div>


                <div className="input-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Email"
                    value={rForm.email}
                    onChange={(e) =>
                      setRForm({
                        ...rForm,
                        email: e.target.value,
                      })
                    }
                  />

                </div>

              </div>


              <div className="two-inputs">

                <div className="input-group">

                  <label>
                    Username
                  </label>

                  <input
                    type="text"
                    placeholder="Username"
                    value={rForm.username}
                    onChange={(e) =>
                      setRForm({
                        ...rForm,
                        username: e.target.value,
                      })
                    }
                    required
                  />

                </div>


                <div className="input-group">

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Password"
                    value={rForm.password}
                    onChange={(e) =>
                      setRForm({
                        ...rForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>


              {/* STUDENT EXTRA FIELDS */}

              {rForm.role === "student" && (

                <>

                  <div className="two-inputs">

                    <div className="input-group">

                      <label>
                        Course
                      </label>

                      <input
                        type="text"
                        placeholder="Course"
                        value={rForm.course}
                        onChange={(e) =>
                          setRForm({
                            ...rForm,
                            course: e.target.value,
                          })
                        }
                      />

                    </div>


                    <div className="input-group">

                      <label>
                        Division
                      </label>

                      <input
                        type="text"
                        placeholder="Division"
                        value={rForm.division}
                        onChange={(e) =>
                          setRForm({
                            ...rForm,
                            division: e.target.value,
                          })
                        }
                      />

                    </div>

                  </div>


                  <div className="input-group">

                    <label>
                      Age
                    </label>

                    <input
                      type="number"
                      placeholder="Age"
                      value={rForm.age}
                      onChange={(e) =>
                        setRForm({
                          ...rForm,
                          age: e.target.value,
                        })
                      }
                    />

                  </div>

                </>

              )}


              <button
                type="submit"
                className="signin-button"
              >
                Create Account
              </button>

            </form>

          )}

        </div>

      </div>

    </div>
  );
}