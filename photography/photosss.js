const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const multer = require("multer");
const sharp = require("sharp");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "1234", // Replace with your MySQL password
  database: "photography",
});

// Set up multer for handling image uploads
const upload = multer({ storage: multer.memoryStorage() });

const compressImage = async (buffer) => {
  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  if (buffer.length > maxFileSize) {
    try {
      const compressedBuffer = await sharp(buffer)
        .resize({ width: 800 }) // You can adjust the width as needed
        .toBuffer();
      
      return compressedBuffer;
    } catch (error) {
      throw new Error("Failed to compress image");
    }
  }

  return buffer;
};

router.post("/photos/:sid", upload.array("images", 50), async (req, res) => {
  const sid = req.params.sid;
  const images = req.files;

  if (!sid || !images) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Check if the 'sid' exists in the 'stories' table
  const checkSidQuery = "SELECT sid FROM stories WHERE sid = ?";
  connection.query(checkSidQuery, [sid], async (checkSidErr, checkSidResults) => {
    if (checkSidErr) {
      console.error("Error checking sid in stories table: ", checkSidErr);
      return res.status(500).json({ error: "Failed to upload images" });
    }

    if (checkSidResults.length === 0) {
      return res.status(404).json({ error: "Story with the provided sid not found" });
    }

    // Prepare an array of objects for bulk insert with compressed images
    const compressedImageObjects = await Promise.all(images.map(async (image) => {
      const compressedBuffer = await compressImage(image.buffer);
      return {
        sid: sid,
        image: compressedBuffer,
      };
    }));

    // Insert compressed images into the 'photos' table
    const query = "INSERT INTO photos (sid, image) VALUES ?";
    connection.query(
      query,
      [compressedImageObjects.map((obj) => [obj.sid, obj.image])],
      (insertErr, result) => {
        if (insertErr) {
          console.error("Error inserting images: ", insertErr);
          return res.status(500).json({ error: "Failed to insert images" });
        }

        return res.json({ message: "Images uploaded successfully" });
      }
    );
  });
});
  
// GET endpoint to fetch all images associated with a sid (story ID)
router.get("/photos/:sid", (req, res) => {
  const sid = req.params.sid;

  if (!sid) {
    return res.status(400).json({ error: "Missing parameter: sid" });
  }

  // Fetch images from the 'photos' table
  const query = "SELECT id, sid, image FROM photos WHERE sid = ?";
  connection.query(query, [sid], (err, results) => {
    if (err) {
      console.error("Error fetching images: ", err);
      return res.status(500).json({ error: "Failed to fetch images" });
    }

    return res.json(results);
  });
});

// PUT endpoint to update images associated with a sid (story ID)
router.put("/photos/:sid", upload.array("images", 10), (req, res) => {
  const sid = req.params.sid;
  const images = req.files;

  if (!sid || !images) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  // Prepare an array of objects for bulk insert
  const imageObjects = images.map((image) => ({
    sid: sid,
    image: image.buffer, // The actual image binary data is stored in the 'buffer' property
  }));

  // Delete existing images associated with the sid
  const deleteQuery = "DELETE FROM photos WHERE sid = ?";
  connection.query(deleteQuery, [sid], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error("Error deleting existing images: ", deleteErr);
      return res.status(500).json({ error: "Failed to update images" });
    }

    // Insert new images into the 'photos' table
    const insertQuery = "INSERT INTO photos (sid, image) VALUES ?";
    connection.query(
      insertQuery,
      [imageObjects.map((obj) => [obj.sid, obj.image])],
      (insertErr, insertResult) => {
        if (insertErr) {
          console.error("Error inserting new images: ", insertErr);
          return res.status(500).json({ error: "Failed to update images" });
        }

        return res.json({ message: "Images updated successfully" });
      }
    );
  });
});

// DELETE endpoint to delete a specific image by its ID
router.delete("/photos/:id", (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "Missing parameter: id" });
  }

  // Delete the image from the 'photos' table
  const query = "DELETE FROM photos WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting image: ", err);
      return res.status(500).json({ error: "Failed to delete image" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Image not found" });
    }

    return res.json({ message: "Image deleted successfully" });
  });
});

module.exports = router;
