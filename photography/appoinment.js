const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const cors = require("cors");




const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "1234", // Replace with your MySQL password
  database: "photography",
});

router.use(cors());
// Save an appointment
router.post("/appointment", (req, res) => {
  const {
    name,
    email,
    location,
    contact_no,
    photosession,
    date,
    reference,
    message,
  } = req.body;

  // Check if the required fields are present
  if (!name || !email || !location || !contact_no || !photosession || !date || !reference || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const insertQuery = `INSERT INTO appointment (name, email, location, contact_no, photosession, date, reference, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  // ... rest of the code to save the appointment


  connection.query(
    insertQuery,
    [name, email, location, contact_no, photosession, date, reference, message],
    (err, result) => {
      if (err) {
        console.error("Error saving appointment:", err);
        res.status(500).json({ error: "Error saving appointment" });
      } else {
        res.status(201).json({ id: result.insertId });
      }
    }
  );
});

// Get all appointments
router.get("/appointments", (req, res) => {
  const selectQuery = "SELECT * FROM appointment";

  connection.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error fetching appointments:", err);
      res.status(500).json({ error: "Error fetching appointments" });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get an appointment by ID
router.get("/appointment/:id", (req, res) => {
  const { id } = req.params;
  const selectQuery = "SELECT * FROM appointment WHERE id = ?";

  connection.query(selectQuery, [id], (err, results) => {
    if (err) {
      console.error("Error fetching appointment:", err);
      res.status(500).json({ error: "Error fetching appointment" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Appointment not found" });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// Update an appointment by ID
router.put("/appointment/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    location,
    contact_no,
    photosession,
    date,
    reference,
    message,
  } = req.body;

  const updateQuery = `
    UPDATE appointment
    SET name = ?, email = ?, location = ?, contact_no = ?, photosession = ?, date = ?, reference = ?, message = ?
    WHERE id = ?
  `;

  connection.query(
    updateQuery,
    [
      name,
      email,
      location,
      contact_no,
      photosession,
      date,
      reference,
      message,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating appointment:", err);
        res.status(500).json({ error: "Error updating appointment" });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ error: "Appointment not found" });
      } else {
        res.status(200).json({ message: "Appointment updated successfully" });
      }
    }
  );
});

// Delete an appointment by ID
router.delete("/appointment/:id", (req, res) => {
  const { id } = req.params;
  const deleteQuery = "DELETE FROM appointment WHERE id = ?";

  connection.query(deleteQuery, [id], (err, result) => {
    if (err) {
      console.error("Error deleting appointment:", err);
      res.status(500).json({ error: "Error deleting appointment" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Appointment not found" });
    } else {
      res.status(200).json({ message: "Appointment deleted successfully" });
    }
  });
});

module.exports = router;