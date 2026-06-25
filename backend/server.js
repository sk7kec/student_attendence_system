const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URL = "mongodb://sahish24adr134_db_user:sahish@ac-sbxibon-shard-00-00.jsug45y.mongodb.net:27017,ac-sbxibon-shard-00-01.jsug45y.mongodb.net:27017,ac-sbxibon-shard-00-02.jsug45y.mongodb.net:27017/?ssl=true&replicaSet=atlas-m8pu5b-shard-0&authSource=admin&appName=moviedatabase";

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  department: { type: String, required: true },
});

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ["Present", "Absent"], required: true },
});

attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

app.get("/", (req, res) => {
  res.send("Student Attendance API is running");
});

app.post("/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/students", async (req, res) => {
  const students = await Student.find().sort({ rollNo: 1 });
  res.json(students);
});

app.post("/attendance", async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records)) {
      return res.status(400).json({ message: "date and records are required" });
    }

    const savedRecords = [];

    for (const record of records) {
      const saved = await Attendance.findOneAndUpdate(
        { studentId: record.studentId, date },
        { studentId: record.studentId, date, status: record.status },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      savedRecords.push(saved);
    }

    res.json({ message: "Attendance saved", records: savedRecords });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/attendance", async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};

    const attendance = await Attendance.find(filter)
      .populate("studentId")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/attendance/summary", async (req, res) => {
  const students = await Student.find().sort({ rollNo: 1 });
  const result = [];

  for (const student of students) {
    const total = await Attendance.countDocuments({ studentId: student._id });
    const present = await Attendance.countDocuments({ studentId: student._id, status: "Present" });
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    result.push({
      student,
      totalDays: total,
      presentDays: present,
      absentDays: total - present,
      percentage,
    });
  }

  res.json(result);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
