const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Collections = sequelize.define('collections', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.INTEGER,  
    allowNull: false 
  },
  collectionName: {
    type: Sequelize.STRING,
    allowNull: false  // Matches NULL constraint in table
  }
}
);

module.exports = Collections;