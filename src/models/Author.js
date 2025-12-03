const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Author = db.define('Author', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nationality: DataTypes.STRING,
});

module.exports = Author;
