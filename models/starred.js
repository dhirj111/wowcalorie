const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Starred = sequelize.define('starred', {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    // Optional: add foreign key references if needed
    // references: { model: "Users", key: "id" }
  },
  dishId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    // Optional: add foreign key references if needed
    // references: { model: "Users", key: "id" }
  },
}
);

module.exports = Starred;