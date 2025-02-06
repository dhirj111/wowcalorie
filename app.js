const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs')
const https = require('https')
// const { v4: uuidv4 } = require('uuid');
// uuidv4();
const app = express();

// Middleware in the correct order
app.use(cors());
app.use(express.json()); // Built-in middleware for parsing JSON
// app.use(express.urlencoded({ extended: true })); // Built-in middleware for parsing URL-encoded data
const sequelize = require('./util/database');
const userroute = require('./routes/userroute');
// const demomodel = require('./models/demomodel');
app.use(userroute);
// Static file serving
app.use(express.static(path.join(__dirname, 'public')));



// Sync Sequelize models and start the server
sequelize
  .sync()
  .then(() => {
    app.listen(1000, () => {
      console.log('Server is running on http://localhost:1000');
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });