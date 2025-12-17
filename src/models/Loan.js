const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Loan = db.define('Loan', {
  loanDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  },

  BookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Books',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  }
});

module.exports = Loan;

