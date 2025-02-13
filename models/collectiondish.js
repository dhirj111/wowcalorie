const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Collectiondish = sequelize.define('collectiondish', {
  collectionId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  dishId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
}
);

module.exports = Collectiondish;