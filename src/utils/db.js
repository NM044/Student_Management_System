import { demoUsers } from "./seedData";

// ── LOCAL STORAGE HELPERS ─────────────────────────────────────

const get = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (error) {
    return [];
  }
};

const set = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const nextId = (rows) => {
  if (rows.length === 0) return 1;

  return Math.max(
    ...rows.map((row) => Number(row.id) || 0)
  ) + 1;
};


// ── INITIALIZE DATABASE ───────────────────────────────────────

export const initializeDatabase = () => {

  const databaseVersion = localStorage.getItem("databaseVersion");

  // New demo database version
  if (databaseVersion !== "2") {

    // Purane users ko replace karke naye 60 users load karega
    set("users", demoUsers);

    // Version save karega
    localStorage.setItem("databaseVersion", "2");

    console.log("New student data loaded successfully!");

  }

};

// ── USERS ─────────────────────────────────────────────────────

export const getUsers = () => {

  // Pehle database initialize hoga
  initializeDatabase();

  return get("users");

};


export const registerUser = (data) => {

  const users = getUsers();

  const existingUser = users.find(
    (user) => user.username === data.username
  );

  if (existingUser) {
    return false;
  }

  users.push({
    id: nextId(users),
    ...data
  });

  set("users", users);

  return true;

};


export const loginUser = (username, password) => {

  // IMPORTANT: Pehle users load honge
  const users = getUsers();

  const user = users.find(

    (user) =>

      user.username === username.trim() &&

      user.password === password.trim()

  );

  return user || null;

};


// ── ASSIGNMENTS ────────────────────────────────────────────────

export const getAssignments = () => {

  return get("assignments");

};


export const addAssignment = (data) => {

  const rows = getAssignments();

  rows.push({
    id: nextId(rows),
    ...data
  });

  set("assignments", rows);

};


export const deleteAssignment = (id) => {

  set(
    "assignments",
    getAssignments().filter(
      (assignment) => assignment.id !== id
    )
  );

};


// ── SUBMISSIONS ────────────────────────────────────────────────

export const getSubmissions = () => {

  return get("submissions");

};


export const addSubmission = (data) => {

  const rows = getSubmissions();

  rows.push({
    id: nextId(rows),
    ...data
  });

  set("submissions", rows);

};


// ── ATTENDANCE ─────────────────────────────────────────────────

export const getAttendance = () => {

  return get("attendance");

};


export const saveAttendance = (records) => {

  let rows = getAttendance();

  records.forEach(
    ({ username, date, status, course }) => {

      const index = rows.findIndex(

        (record) =>
          record.username === username &&
          record.date === date &&
          record.course === course

      );

      if (index >= 0) {

        rows[index].status = status;

      } else {

        rows.push({
          id: nextId(rows),
          username,
          date,
          status,
          course
        });

      }

    }
  );

  set("attendance", rows);

};


// ── MARKS ──────────────────────────────────────────────────────

export const getMarks = () => {

  return get("marks");

};


export const addMark = (data) => {

  const rows = getMarks();

  rows.push({
    id: nextId(rows),
    ...data
  });

  set("marks", rows);

};


export const deleteMark = (id) => {

  set(
    "marks",
    getMarks().filter(
      (mark) => mark.id !== id
    )
  );

};