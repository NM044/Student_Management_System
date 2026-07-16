// ── localStorage-based DB ──────────────────────────────────────────────────
const get = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const set = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const nextId = (rows) => rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;

// ── USERS ──────────────────────────────────────────────────────────────────
export const getUsers = () => get("users");

export const registerUser = (data) => {
  const users = getUsers();
  if (users.find((u) => u.username === data.username)) return false;
  users.push({ id: nextId(users), ...data });
  set("users", users);
  return true;
};

export const loginUser = (username, password) =>
  getUsers().find((u) => u.username === username && u.password === password) || null;

// ── ASSIGNMENTS ────────────────────────────────────────────────────────────
export const getAssignments = () => get("assignments");

export const addAssignment = (data) => {
  const rows = getAssignments();
  rows.push({ id: nextId(rows), ...data });
  set("assignments", rows);
};

export const deleteAssignment = (id) =>
  set("assignments", getAssignments().filter((a) => a.id !== id));

// ── SUBMISSIONS ────────────────────────────────────────────────────────────
export const getSubmissions = () => get("submissions");

export const addSubmission = (data) => {
  const rows = getSubmissions();
  rows.push({ id: nextId(rows), ...data });
  set("submissions", rows);
};

// ── ATTENDANCE ─────────────────────────────────────────────────────────────
export const getAttendance = () => get("attendance");

export const saveAttendance = (records) => {
  let rows = getAttendance();
  records.forEach(({ username, date, status, course }) => {
    const idx = rows.findIndex(
      (r) => r.username === username && r.date === date && r.course === course
    );
    if (idx >= 0) rows[idx].status = status;
    else rows.push({ id: nextId(rows), username, date, status, course });
  });
  set("attendance", rows);
};

// ── MARKS ──────────────────────────────────────────────────────────────────
export const getMarks = () => get("marks");

export const addMark = (data) => {
  const rows = getMarks();
  rows.push({ id: nextId(rows), ...data });
  set("marks", rows);
};

export const deleteMark = (id) =>
  set("marks", getMarks().filter((m) => m.id !== id));
