const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Loan = db.define('Loan', {
  loanDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  }
});

module.exports = Loan;


