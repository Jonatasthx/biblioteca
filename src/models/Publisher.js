const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Publisher = db.define('Publisher', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  foundedYear: DataTypes.INTEGER,
});

module.exports = Publisher;
