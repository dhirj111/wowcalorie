const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Comment = sequelize.define('comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING(45),  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  dishId: {
    type: Sequelize.INTEGER,  // Matches table VARCHAR(45)
    allowNull: true  // Matches NULL constraint in table
  },
  comment: {
    type: Sequelize.STRING,  // Matches table VARCHAR(45)
    allowNull: true  // Matches NULL constraint in table
  }
}
);

module.exports = Comment