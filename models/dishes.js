const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Dish = sequelize.define('dish', {
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
  diet: {
    type: Sequelize.STRING(45),  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  glutenfree: {
    type: Sequelize.BOOLEAN,  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  difficulty: {
    type: Sequelize.STRING(45),  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  time: {
    type: Sequelize.INTEGER,  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  ingredients: {
    type: Sequelize.STRING(),  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  steps: {
    type: Sequelize.STRING(),  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  },
  imageUrl: {
    type: Sequelize.STRING(),  // Matches table definition
    allowNull: true  // Since `expense` is defined as NULL in table
  }
}
);

module.exports = Dish;