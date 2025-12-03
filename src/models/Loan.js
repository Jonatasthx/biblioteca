const { DataTypes } = require('sequelize');
const db = require('../config/database');

const User = require('./User');
const Book = require('./Book');

const Loan = db.define('Loan', {
  returned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});

User.hasMany(Loan);
Loan.belongsTo(User);

Book.hasMany(Loan);
Loan.belongsTo(Book);

module.exports = Loan;

