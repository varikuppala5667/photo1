const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });



// Replace with your MySQL connection configuration
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "photography",
});
router.use(cors());



// API endpoint to get all pricing entries
router.get("/pricing", (req, res) => {
  const sql = "SELECT * FROM pricing";
  connection.query(sql, async (err, results) => {
    if (err) {
      console.error("Error fetching pricing data:", err);
      res.status(500).json({ error: "Error fetching pricing data" });
    } else {
      try {
        // Read the image files and convert them to base64
        for (const result of results) {
          const imagePath = result.image_path;
          if (imagePath) {
            const base64Image = await readFileAsBase64(imagePath);
            result.image = base64Image;
          }
        }
        res.json(results);
      } catch (error) {
        console.error("Error reading image:", error);
        res.status(500).json({ error: "Error fetching pricing data" });
      }
    }
  });
});

// Function to read a file and convert it to base64
const readFileAsBase64 = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, { encoding: "base64" }, (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};



// API endpoint to create a new pricing entry
router.post("/pricing", upload.single("image"), (req, res) => {
  const { title, subtitle, terms_and_conditions, price } = req.body;
  const imageFile = req.file; // Access the uploaded image file here

  if (!imageFile || !title || !subtitle || !terms_and_conditions || !price) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // If there's an image file uploaded, you can access its details from "req.file"
  // For example, you can get the file data using "req.file.buffer"

  const insertQuery = `INSERT INTO pricing (image, title, subtitle, terms_and_conditions, price)
  VALUES (?, ?, ?, ?, ?)`;

  // Assuming the file_path column is used to store the file path in the database
  connection.query(
    insertQuery,
    [imageFile.buffer, title, subtitle, terms_and_conditions, price],
    (err, results) => {
      if (err) {
        console.error("Error creating pricing entry:", err);
        res.status(500).json({ error: "Error creating pricing entry" });
      } else {
        res.status(201).json({ id: results.insertId, ...req.body });
      }
    }
  );
});


// API endpoint to update an existing pricing entry
router.put("/pricing/:id", (req, res) => {
  const id = req.params.id;
  const { image, title, subtitle, terms_and_conditions } = req.body;
  const sql =
    "UPDATE pricing SET image = ?, title = ?, subtitle = ?, terms_and_conditions = ? WHERE id = ?";
  connection.query(
    sql,
    [image, title, subtitle, terms_and_conditions, id],
    (err) => {
      if (err) {
        console.error("Error updating pricing entry:", err);
        res.status(500).json({ error: "Error updating pricing entry" });
      } else {
        res.json({ id, ...req.body });
      }
    }
  );
});

// API endpoint to delete a pricing entry
router.delete("/pricing/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM pricing WHERE id = ?";
  connection.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting pricing entry:", err);
      res.status(500).json({ error: "Error deleting pricing entry" });
    } else {
      res.json({ message: "Pricing entry deleted successfully" });
    }
  });
});


// API endpoint to get a single pricing entry by its ID
router.get("/pricings/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM pricing WHERE id = ?";
  connection.query(sql, [id], async (err, results) => {
    if (err) {
      console.error("Error fetching pricing data:", err);
      res.status(500).json({ error: "Error fetching pricing data" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Pricing entry not found" });
    } else {
      try {
        // Assuming image_path column is used to store the file path in the database
        const imagePath = results[0].image_path;
        if (imagePath) {
          const base64Image = await readFileAsBase64(imagePath);
          results[0].image = base64Image;
        }
        res.status(200).json(results[0]);
      } catch (error) {
        console.error("Error reading image:", error);
        res.status(500).json({ error: "Error fetching pricing data" });
      }
    }
  });
});

module.exports = router;
