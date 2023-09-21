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
// Save a new contact
router.post("/contact", (req, res) => {
  const { name, email, phonenumber, message } = req.body;

  if (!name || !email || !phonenumber || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const insertQuery = `
    INSERT INTO contact_us (name, email, phonenumber, message)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(insertQuery, [name, email, phonenumber, message], (err, result) => {
    if (err) {
      console.error("Error saving contact:", err);
      return res.status(500).json({ error: "Failed to save contact" });
    }

    res.status(201).json({ success: true, message: "Contact saved successfully" });
  });
});

// Get all contacts
router.get("/contacts", (req, res) => {
  const selectAllQuery = `
    SELECT * FROM contact_us
  `;

  connection.query(selectAllQuery, (err, results) => {
    if (err) {
      console.error("Error fetching contacts:", err);
      return res.status(500).json({ error: "Failed to fetch contacts" });
    }

    res.status(200).json(results);
  });
});

// Get contact by ID
router.get("/contact/:id", (req, res) => {
  const contactId = req.params.id;

  const selectContactQuery = `
    SELECT * FROM contact_us WHERE id = ?
  `;

  connection.query(selectContactQuery, [contactId], (err, result) => {
    if (err) {
      console.error("Error fetching contact:", err);
      return res.status(500).json({ error: "Failed to fetch contact" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json(result[0]);
  });
});

// Update contact by ID
router.put("/contact/:id", (req, res) => {
  const contactId = req.params.id;
  const { name, email, phonenumber, message } = req.body;

  if (!name || !email || !phonenumber || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const updateQuery = `
    UPDATE contact_us
    SET name = ?, email = ?, phonenumber = ?, message = ?
    WHERE id = ?
  `;

  connection.query(updateQuery, [name, email, phonenumber, message, contactId], (err, result) => {
    if (err) {
      console.error("Error updating contact:", err);
      return res.status(500).json({ error: "Failed to update contact" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({ message: "Contact updated successfully" });
  });
});

// Delete contact by ID
router.delete("/contact/:id", (req, res) => {
  const contactId = req.params.id;

  const deleteQuery = `
    DELETE FROM contact_us WHERE id = ?
  `;

  connection.query(deleteQuery, [contactId], (err, result) => {
    if (err) {
      console.error("Error deleting contact:", err);
      return res.status(500).json({ error: "Failed to delete contact" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  });
});

module.exports = router;
