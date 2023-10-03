const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const cors = require("cors");
const sharp = require("sharp");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const connection = mysql.createConnection({
  host: "database-1.ce8foznoiqpc.ap-south-1.rds.amazonaws.com",
  user: "admin2", // Replace with your MySQL username
  password: "82tsHD0MwIF1JzSCi6sF", // Replace with your MySQL password
  database: "testingDb",
});

router.use(cors());
// router.post("/stories", upload.single("album"), (req, res) => {
//   const { Date, title, subtitle } = req.body;
//   const albumFile = req.file; // Access the uploaded album file here

//   if (!albumFile || !Date || !title || !subtitle) {
//     return res.status(400).json({ error: "All fields are required, including the album file" });
//   }

//   // If there's an album file uploaded, you can access its details from "req.file"
//   // For example, you can get the file data using "req.file.buffer"

//   const insertQuery = `
//     INSERT INTO stories (album, Date, title, subtitle)
//     VALUES (?, ?, ?, ?)
//   `;

//   // Assuming the file_path column is used to store the file path in the database
//   connection.query(
//     insertQuery,
//     [albumFile.buffer, Date, title, subtitle],
//     (err, result) => {
//       if (err) {
//         console.error("Error saving story:", err);
//         return res.status(500).json({ error: "Failed to save story" });
//       }

//       res.status(201).json({ success: true, message: "Story saved successfully" });
//     }
//   );
// });



const compressImage = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "Album file is required" });
  }

  const { buffer, mimetype } = req.file;
  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  if (buffer.length > maxFileSize) {
    try {
      const compressedBuffer = await sharp(buffer)
        .resize({ width: 800 }) // You can adjust the width as needed
        .toBuffer();

      req.file.buffer = compressedBuffer;
      req.file.size = compressedBuffer.length;
      req.file.mimetype = mimetype;
    } catch (error) {
      return res.status(500).json({ error: "Failed to compress image" });
    }
  }

  next();
};

router.post("/stories", upload.single("album"), compressImage, (req, res) => {
  const { Date, title, subtitle } = req.body;
  const albumFile = req.file;

  if (!Date || !title || !subtitle) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check if there are already 5 stories in the database
  const countQuery = "SELECT COUNT(*) AS storyCount FROM stories";
  connection.query(countQuery, (countErr, countResult) => {
    if (countErr) {
      console.error("Error counting stories:", countErr);
      return res.status(500).json({ error: "Failed to check story count" });
    }

    const storyCount = countResult[0].storyCount;

    if (storyCount >= 5) {
      // If there are 5 or more stories, delete the oldest one
      const deleteQuery = "DELETE FROM stories ORDER BY Date LIMIT 1";
      connection.query(deleteQuery, (deleteErr, deleteResult) => {
        if (deleteErr) {
          console.error("Error deleting story:", deleteErr);
          return res.status(500).json({ error: "Failed to delete oldest story" });
        }

        // Insert the new story
        insertStory(res, albumFile.buffer, Date, title, subtitle);
      });
    } else {
      // If there are less than 5 stories, insert the new story directly
      insertStory(res, albumFile.buffer, Date, title, subtitle);
    }
  });
});

function insertStory(res, album, Date, title, subtitle) {
  const insertQuery = `
    INSERT INTO stories (album, Date, title, subtitle)
    VALUES (?, ?, ?, ?)
  `;

  connection.query(
    insertQuery,
    [album, Date, title, subtitle],
    (err, result) => {
      if (err) {
        console.error("Error saving story:", err);
        return res.status(500).json({ error: "Failed to save story" });
      }

      res.status(201).json({ success: true, message: "Story saved successfully" });
    }
  );
}



// router.get("/stories", (req, res) => {
//   const sql = "SELECT * FROM stories";
//   connection.query(sql, (err, results) => {
//     if (err) {
//       console.error("Error fetching stories:", err);
//       res.status(500).json({ error: "Error fetching stories" });
//     } else {
//       res.status(200).json(results);
//     }
//   });
// });



// API endpoint to get all pricing entries
router.get("/stories", (req, res) => {
  const sql = "SELECT * FROM stories";
  connection.query(sql, async (err, results) => {
    if (err) {
      console.error("Error fetching stories data:", err);
      res.status(500).json({ error: "Error fetching stories data" });
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
        res.status(500).json({ error: "Error fetching stories data" });
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










// API endpoint to get a single story by its sid
router.get("/stories/:sid", (req, res) => {
  const sid = req.params.sid;
  const sql = "SELECT * FROM stories WHERE sid = ?";
  connection.query(sql, [sid], (err, results) => {
    if (err) {
      console.error("Error fetching story:", err);
      res.status(500).json({ error: "Error fetching story" });
    } else if (results.length === 0) {
      res.status(404).json({ error: "Story not found" });
    } else {
      res.status(200).json(results[0]);
    }
  });
});

// API endpoint to update an existing story entry
router.put("/stories/:sid", (req, res) => {
  const sid = req.params.sid;
  const { album, Date, title, subtitle } = req.body;
  const sql =
    "UPDATE stories SET album = ?, Date = ?, title = ?, subtitle = ? WHERE sid = ?";
  connection.query(sql, [album, Date, title, subtitle, sid], (err) => {
    if (err) {
      console.error("Error updating story entry:", err);
      res.status(500).json({ error: "Error updating story entry" });
    } else {
      res.json({ sid, ...req.body });
    }
  });
});

// API endpoint to delete a story entry
router.delete("/stories/:sid", (req, res) => {
  const sid = req.params.sid;
  const sql = "DELETE FROM stories WHERE sid = ?";
  connection.query(sql, [sid], (err, results) => {
    if (err) {
      console.error("Error deleting story:", err);
      res.status(500).json({ error: "Error deleting story" });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: "Story not found" });
    } else {
      res.status(200).json({ message: "Story deleted successfully" });
    }
  });
});



module.exports = router;
