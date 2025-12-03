console.log(">>> MODELS INDEX CARREGADO <<<");

const Book = require('./Book');
const Author = require('./Author');
const Category = require('./Category');
const Publisher = require('./Publisher');
const User = require('./User');
const Loan = require('./Loan');

Book.belongsTo(Author);
Book.belongsTo(Category);
Book.belongsTo(Publisher);

Author.hasMany(Book);
Category.hasMany(Book);
Publisher.hasMany(Book);

Loan.belongsTo(User);
Loan.belongsTo(Book);

User.hasMany(Loan);
Book.hasMany(Loan);

module.exports = {
  Book,
  Author,
  Category,
  Publisher,
  User,
  Loan
};

