const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Book = db.define('Book', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  available: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },

  AuthorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  CategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  PublisherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  year: DataTypes.INTEGER
});

module.exports = Book;

