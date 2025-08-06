const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: ''
});

app.get('/api/employees', (req, res) => {
  const sql = `SELECT employee.*, departments.name as department
               FROM employee
               INNER JOIN departments ON employee.department_id = departments.id`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({error: err});
    res.json(results);
  });
});

app.post('/api/employees', (req, res) => {
  const { name, dob, phone, email, department_id } = req.body;
  if (!name || !dob || !phone || !email || !department_id) {
    return res.status(400).json({error: "All fields are required"});
  }
  const sql = `INSERT INTO employee (name, dob, phone, email, department_id)
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [name, dob, phone, email, department_id], (err, result) => {
    if (err) return res.status(500).json({error: err});
    res.json({message: "Employee added successfully"});
  });
});

// Update (edit) employee
app.put('/api/employees/:id', (req, res) => {
  const { name, dob, phone, email, department_id } = req.body;
  const { id } = req.params;
  if (!name || !dob || !phone || !email || !department_id) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const sql = `UPDATE employee
               SET name = ?, dob = ?, phone = ?, email = ?, department_id = ?
               WHERE id = ?`;
  db.query(sql, [name, dob, phone, email, department_id, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Employee updated successfully" });
  });
});

app.delete('/api/employees/:id', (req, res) => {
  const sql = "DELETE FROM employee WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({error: err});
    res.json({message: "Employee deleted"});
  });
});


app.get('/api/departments', (req, res) => {
  db.query("SELECT * FROM departments", (err, results) => {
    if (err) return res.status(500).json({error: err});
    res.json(results);
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");

});
