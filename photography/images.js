const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const multer = require("multer");
const connection = mysql.createConnection({
  host: "jdbc:mysql://database-1.ce8foznoiqpc.ap-south-1.rds.amazonaws.com:3306",
  user: "admin2", // Replace with your MySQL username
  password: "82tsHD0MwIF1JzSCi6sF", // Replace with your MySQL password
  database: "testingDb",
});

const upload = multer({ storage: multer.memoryStorage() });


router.post("/images", upload.single("image_data"), (req, res) => {
  const image = req.file.buffer;

  if (!image) {
    return res.status(400).json({ error: "No image data provided" });
  }

  // Check if the maximum limit of 4 rows is reached
  const checkQuery = "SELECT COUNT(*) AS rowCount FROM images";
  connection.query(checkQuery, (err, results) => {
    if (err) {
      console.error("Error checking row count:", err);
      return res.status(500).json({ error: "Error checking row count" });
    }

    const rowCount = results[0].rowCount;

    if (rowCount >= 4) {
      return res.status(400).json({ error: "Maximum limit of 4 rows reached" });
    }

    // If the limit is not reached, insert the new image data
    const insertQuery = "INSERT INTO images (image_data) VALUES (?)";
    connection.query(insertQuery, [image], (err, result) => {
      if (err) {
        console.error("Error uploading image:", err);
        return res.status(500).json({ error: "Failed to upload image" });
      }

      return res.status(201).json({ message: "Image uploaded successfully" });
    });
  });
});



router.get("/images", (req, res) => {
  // Fetch all images from the 'images' table
  const selectAllQuery = "SELECT id, image_data FROM images";
  connection.query(selectAllQuery, (err, results) => {
    if (err) {
      console.error("Error fetching images:", err);
      return res.status(500).json({ error: "Failed to fetch images" });
    }

    return res.status(200).json(results);
  });
});


router.delete('/images/:id', (req, res) => {
  const imageId = req.params.id;

  // Check if the image with the given ID exists in the 'images' table
  const selectImageQuery = 'SELECT id FROM images WHERE id = ?';
  connection.query(selectImageQuery, [imageId], (err, results) => {
    if (err) {
      console.error('Error checking image existence:', err);
      return res.status(500).json({ error: 'Failed to check image existence' });
    }

    // If no image is found with the given ID, return a 404 status
    if (results.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // If the image exists, delete it from the 'images' table
    const deleteImageQuery = 'DELETE FROM images WHERE id = ?';
    connection.query(deleteImageQuery, [imageId], (err) => {
      if (err) {
        console.error('Error deleting image:', err);
        return res.status(500).json({ error: 'Failed to delete image' });
      }

      // Return a success response
      return res.status(204).send(); // 204 No Content status indicates success with no response body
    });
  });
});


module.exports = router;
