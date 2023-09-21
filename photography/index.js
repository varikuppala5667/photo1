const express = require('express');
const { createTables } = require("./connection"); // Import the createTables function from connection.js
const app = express();
const cors = require('cors');

const appointmentRoutes = require('./appoinment');  // Correct the filename to 'appointment.js'
const commentRoutes = require('./comment');
const contactusRoutes = require('./contactus');
const pricingRoutes = require('./pricing');
const storiesRoutes = require('./stories');
const photostories = require('./photosss');
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
    // No need to call createTables() here, as we will call it once before starting the server
    startServer();
  }
});

function startServer() {
  createTables(); // Call the createTables function here to create the tables before starting the server

  app.use(express.json());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  
  // Use the routes from the separate files
  app.use('/api/appointment', appointmentRoutes);  // Correct the route path to '/api/appointment'
  app.use('/api/comment', commentRoutes);
  app.use('/api/contactus', contactusRoutes);
  app.use('/api/pricing', pricingRoutes);
  app.use('/api/stories', storiesRoutes);
  app.use('/api/photos', photostories)

  const port = 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
