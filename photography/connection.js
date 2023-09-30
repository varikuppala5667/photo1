const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "1234", // Replace with your MySQL password
  database: "photography",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL");
    createTables();
  }
});

function createTables() {

  
  const createAppointmentTableQuery = `
  CREATE TABLE IF NOT EXISTS appointment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_no VARCHAR(255) NOT NULL,
    photosession VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    reference VARCHAR(255),
    message TEXT 
  )
`;

  const createCONTACTUSTableQuery = `
CREATE TABLE IF NOT EXISTS contact_us (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phonenumber VARCHAR(255) NOT NULL,
  message TEXT 
)
`;

  const createCommentTableQuery = `
CREATE TABLE IF NOT EXISTS comment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT ,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255)
)
`;

const createPricingTableQuery = `
CREATE TABLE IF NOT EXISTS pricing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image LONGBLOB,
  title TEXT NOT NULL,
  price INT,
  subtitle VARCHAR(255) NOT NULL,
  terms_and_conditions TEXT NOT NULL
)
`;

const createStoriesTableQuery = `
CREATE TABLE IF NOT EXISTS stories (
  sid INT AUTO_INCREMENT PRIMARY KEY,
  album LONGBLOB,
  Date DATE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NOT NULL
)
`;

const createPhotosTableQuery = `
CREATE TABLE IF NOT EXISTS photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sid INT,
  image LONGBLOB, -- Rename 'images' to 'image' for a single image entry
  FOREIGN KEY (sid) REFERENCES stories(sid) ON DELETE CASCADE
)
`;
const createImagesTableQuery = `
CREATE TABLE IF NOT EXISTS images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_data LONGBLOB NOT NULL
);
`;

  connection.query(createAppointmentTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating appointment table:", err);
    } else {
      console.log("Appointment table created successfully");
    }
  });

  connection.query(createCONTACTUSTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating contact_us table:", err);
    } else {
      console.log("Contact_us table created successfully");
    }
  });

  connection.query(createCommentTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating comment table:", err);
    } else {
      console.log("Comment table created successfully");
    }
  });

  connection.query(createPricingTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating pricing table:", err);
    } else {
      console.log("Pricing table created successfully");
    }
  });

  connection.query(createStoriesTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating stories table:", err);
    } else {
      console.log("Stories table created successfully");
    }
  });

  connection.query(createPhotosTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating photos table:", err);
    } else {
      console.log("Photos table created successfully");
    }
  });


  connection.query(createImagesTableQuery, (err, results) => {
    if (err) {
      console.error("Error creating photos table:", err);
    } else {
      console.log("Photos table created successfully");
    }
  });
}

process.on("SIGINT", () => {
  connection.end((err) => {
    if (err) {
      console.error("Error closing MySQL connection:", err);
    } else {
      console.log("MySQL connection closed");
      process.exit(0);
    }
  });
});
module.exports = {  createTables };