const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Follows = sequelize.define('follows', {
  followerId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    // Optional: add foreign key references if needed
    // references: { model: "Users", key: "id" }
  },
  followedId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    // Optional: add foreign key references if needed
    // references: { model: "Users", key: "id" }
  },
}
);

module.exports = Follows;