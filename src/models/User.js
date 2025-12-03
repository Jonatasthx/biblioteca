const { DataTypes } = require('sequelize');
const db = require('../config/database');

const User = db.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: DataTypes.STRING,
});

module.exports = User;
