import { useEffect, useState } from "react";

const API = "http://localhost:5000";

function App() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [viewRecords, setViewRecords] = useState([]);
  const [summary, setSummary] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentForm, setStudentForm] = useState({ name: "", rollNo: "", department: "" });

  const loadStudents = async () => {
    const res = await fetch(`${API}/students`);
    const data = await res.json();
    setStudents(data);
  };

  const loadAttendance = async () => {
    const res = await fetch(`${API}/attendance?date=${date}`);
    const data = await res.json();
    setViewRecords(data);
  };

  const loadSummary = async () => {
    const res = await fetch(`${API}/attendance/summary`);
    const data = await res.json();
    setSummary(data);
  };

  useEffect(() => {
    loadStudents();
    loadSummary();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [date]);

  const addStudent = async (e) => {
    e.preventDefault();

    await fetch(`${API}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentForm),
    });

    setStudentForm({ name: "", rollNo: "", department: "" });
    loadStudents();
  };

  const markAttendance = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const saveAttendance = async () => {
    const records = students.map((student) => ({
      studentId: student._id,
      status: attendance[student._id] || "Absent",
    }));

    await fetch(`${API}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, records }),
    });

    alert("Attendance saved successfully");
    setAttendance({});
    loadAttendance();
    loadSummary();
  };

  return (
    <div className="container">
      <h1>Student Attendance System</h1>

      <section className="card">
        <h2>Add Student</h2>
        <form onSubmit={addStudent} className="form-grid">
          <input
            placeholder="Student Name"
            value={studentForm.name}
            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
            required
          />
          <input
            placeholder="Roll No"
            value={studentForm.rollNo}
            onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
            required
          />
          <input
            placeholder="Department"
            value={studentForm.department}
            onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
            required
          />
          <button>Add</button>
        </form>
      </section>

      <section className="card">
        <h2>Mark Attendance</h2>
        <label>Date: </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Department</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.rollNo}</td>
                <td>{student.name}</td>
                <td>{student.department}</td>
                <td>
                  <button
                    className={attendance[student._id] === "Present" ? "present active" : "present"}
                    onClick={() => markAttendance(student._id, "Present")}
                  >
                    Present
                  </button>
                  <button
                    className={attendance[student._id] === "Absent" ? "absent active" : "absent"}
                    onClick={() => markAttendance(student._id, "Absent")}
                  >
                    Absent
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="save" onClick={saveAttendance}>Save Attendance</button>
      </section>

      <section className="card">
        <h2>View Attendance - {date}</h2>
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {viewRecords.map((record) => (
              <tr key={record._id}>
                <td>{record.studentId?.rollNo}</td>
                <td>{record.studentId?.name}</td>
                <td>{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Attendance Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item) => (
              <tr key={item.student._id}>
                <td>{item.student.rollNo}</td>
                <td>{item.student.name}</td>
                <td>{item.presentDays}</td>
                <td>{item.absentDays}</td>
                <td>{item.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
