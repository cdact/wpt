import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = "http://localhost:5000/api";

function App() {
  // State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");
  const [editEmployee, setEditEmployee] = useState(null);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    phone: "",
    email: "",
    department_id: ""
  });
  const [errors, setErrors] = useState({});

  // Fetch employees and departments on mount
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  // Fetch departments from backend (HR, Engineering, Finance)
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${API_URL}/departments`);
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/employees`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Validate form fields
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    if (!/^\d{10,15}$/.test(form.phone)) errs.phone = "Phone must be 10-15 digits";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Email is invalid";
    if (!form.department_id) errs.department_id = "Please select a department";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle form change
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit - add or update
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let res;
      if (editEmployee) {
        // Update employee
        res = await fetch(`${API_URL}/employees/${editEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setMessage("Employee updated successfully");
          setEditEmployee(null);
        } else {
          setMessage("Failed to update employee");
        }
      } else {
        // Add employee
        res = await fetch(`${API_URL}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setMessage("Employee added successfully");
        } else {
          setMessage("Failed to add employee");
        }
      }

      await fetchEmployees();
      setForm({ name: "", dob: "", phone: "", email: "", department_id: "" });
      setErrors({});
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("An error occurred");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Edit employee - populate form
  const handleEdit = (employee) => {
    setEditEmployee(employee);
    setForm({
      name: employee.name,
      dob: employee.dob ? employee.dob.substring(0, 10) : "",
      phone: employee.phone,
      email: employee.email,
      department_id: employee.department_id + "", // string for select value
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditEmployee(null);
    setForm({ name: "", dob: "", phone: "", email: "", department_id: "" });
    setErrors({});
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const res = await fetch(`${API_URL}/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Employee deleted successfully");
        fetchEmployees();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to delete employee");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Employee Management</h2>
      {message && <div className="alert alert-success">{message}</div>}

      {/* Employee form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={form.name}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.name}</div>
          </div>

          <div className="col">
            <input
              type="date"
              name="dob"
              className={`form-control ${errors.dob ? "is-invalid" : ""}`}
              value={form.dob}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.dob}</div>
          </div>

          <div className="col">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              value={form.phone}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.phone}</div>
          </div>

          <div className="col">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={handleChange}
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>

          <div className="col">
            <select
              name="department_id"
              className={`form-control ${errors.department_id ? "is-invalid" : ""}`}
              value={form.department_id}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              {departments.map(d =>
                <option key={d.id} value={d.id}>{d.name}</option>
              )}
            </select>
            <div className="invalid-feedback">{errors.department_id}</div>
          </div>

          <div className="col-auto">
            {editEmployee ? (
              <>
                <button type="submit" className="btn btn-success">Update Employee</button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button type="submit" className="btn btn-primary">Add Employee</button>
            )}
          </div>
        </div>
      </form>

      {/* Employee Table */}
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Date of Birth</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Department</th>
            <th style={{ minWidth: "130px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr><td colSpan="6" className="text-center">No employees found</td></tr>
          ) : (
            employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.dob ? emp.dob.substring(0, 10) : ""}</td>
                <td>{emp.phone}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(emp)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(emp.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
  );
}

export default App;
