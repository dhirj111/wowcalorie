const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path')
// Middleware order is important
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));
// Middleware in the correct order
app.use(cors());
app.use(express.json()); // Built-in middleware for parsing JSON
// app.use(express.urlencoded({ extended: true })); // Built-in middleware for parsing URL-encoded data
const sequelize = require('./util/database');
const userroute = require('./routes/userroute');
const Wowuser = require('./models/wowuser');
const Dish = require('./models/dishes');

// Define associations
Dish.belongsTo(Wowuser, { foreignKey: 'userId' });
Wowuser.hasMany(Dish, { foreignKey: 'userId' });
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