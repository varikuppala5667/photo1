const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

// Replace with your MySQL connection details
const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "1234", // Replace with your MySQL password
  database: "photography",
});


// Get all comments
router.get("/comments", (req, res) => {
  const getAllCommentsQuery = "SELECT * FROM comment";

  connection.query(getAllCommentsQuery, (err, results) => {
    if (err) {
      console.error("Error getting comments:", err);
      res.status(500).json({ error: "Error getting comments" });
    } else {
      res.json(results);
    }
  });
});

// Get comment by ID
router.get("/comments/:id", (req, res) => {
  const commentId = req.params.id;
  const getCommentByIdQuery = "SELECT * FROM comment WHERE id = ?";

  connection.query(getCommentByIdQuery, [commentId], (err, results) => {
    if (err) {
      console.error("Error getting comment:", err);
      res.status(500).json({ error: "Error getting comment" });
    } else if (results.length === 0) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      res.json(results[0]);
    }
  });
});

// Create a new comment
router.post("/save", (req, res) => {
  const { message, name, email, website } = req.body;
  const createCommentQuery =
    "INSERT INTO comment (message, name, email, website) VALUES (?, ?, ?, ?)";

  connection.query(createCommentQuery, [message, name, email, website], (err, results) => {
    if (err) {
      console.error("Error creating comment:", err);
      res.status(500).json({ error: "Error creating comment" });
    } else {
      res.status(201).json({ message: "Comment created successfully" });
    }
  });
});

// Update a comment by ID
router.put("/comments/:id", (req, res) => {
  const commentId = req.params.id;
  const { message, name, email, website } = req.body;
  const updateCommentQuery =
    "UPDATE comment SET message = ?, name = ?, email = ?, website = ? WHERE id = ?";

  connection.query(updateCommentQuery, [message, name, email, website, commentId], (err, results) => {
    if (err) {
      console.error("Error updating comment:", err);
      res.status(500).json({ error: "Error updating comment" });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      res.json({ message: "Comment updated successfully" });
    }
  });
});

// Delete a comment by ID
router.delete("/comments/:id", (req, res) => {
  const commentId = req.params.id;
  const deleteCommentQuery = "DELETE FROM comment WHERE id = ?";

  connection.query(deleteCommentQuery, [commentId], (err, results) => {
    if (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ error: "Error deleting comment" });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      res.json({ message: "Comment deleted successfully" });
    }
  });
});

module.exports = router;
