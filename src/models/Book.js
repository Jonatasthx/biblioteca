const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Book = db.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  year: DataTypes.INTEGER,
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = Book;
