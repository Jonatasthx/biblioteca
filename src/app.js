const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const db = require('./config/database');

// Models
const { Book, Author, Category, Publisher, User, Loan } = require('./models');


const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


// Handlebars
const hbs = exphbs.create({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
  helpers: {
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('pt-BR');
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.get('/', (req, res) => {
  res.render('home');
});

// ROTAS — BOOKS

app.get('/books', async (req, res) => {
  const books = await Book.findAll({
    include: [Author, Category, Publisher]
  });

  res.render('books/list', { books });
});


app.get('/books/new', async (req, res) => {
  const authors = await Author.findAll();
  const categories = await Category.findAll();
  const publishers = await Publisher.findAll();

  res.render('books/new', { authors, categories, publishers });
});

app.post('/books', async (req, res) => {
  await Book.create(req.body);
  res.redirect('/books');
});

app.get('/books/:id/edit', async (req, res) => {
  const book = await Book.findByPk(req.params.id);

  const authors = await Author.findAll();
  const categories = await Category.findAll();
  const publishers = await Publisher.findAll();

  res.render('books/edit', { book, authors, categories, publishers });
});

app.put('/books/:id', async (req, res) => {
  await Book.update(req.body, { where: { id: req.params.id } });
  res.redirect('/books');
});

app.delete('/books/:id', async (req, res) => {
  await Book.destroy({ where: { id: req.params.id } });
  res.redirect('/books');
});



// ROTAS — USERS

app.get('/users', async (req, res) => {
  const users = await User.findAll({ raw: true});
  res.render('users/list', { users });
});

app.get('/users/new', (req, res) => {
  res.render('users/new');
});

app.post('/users', async (req, res) => {
  await User.create(req.body);
  res.redirect('/users');
});

app.get('/users/:id/edit', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.render('users/edit', { user });
});

app.put('/users/:id', async (req, res) => {
  await User.update(req.body, { where: { id: req.params.id } });
  res.redirect('/users');
});

app.delete('/users/:id', async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.redirect('/users');
});

// Histórico
app.get('/users/:id/history', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).send('Usuário não encontrado');

  const loans = await Loan.findAll({ where: { userId: user.id } });

  res.render('users/history', { user, loans });
});


// ROTAS — LOANS
// LISTAR TODOS OS EMPRÉSTIMOS
app.get('/loans', async (req, res) => {
  const loans = await Loan.findAll({
    include: [User, Book]
  });

  res.render('loans/list', { loans });
});


// FORMULÁRIO DE NOVO EMPRÉSTIMO
app.get('/loans/new', async (req, res) => {
  const users = await User.findAll();
  const books = await Book.findAll();

  res.render('loans/new', { users, books });
});


// CRIAR EMPRÉSTIMO
app.post('/loans', async (req, res) => {
  await Loan.create({
    UserId: req.body.UserId,
    BookId: req.body.BookId,
    loanDate: req.body.loanDate || new Date(),
    returnDate: req.body.returnDate || null
  });

  res.redirect('/loans');
});


// FORMULÁRIO DE EDIÇÃO
app.get('/loans/:id/edit', async (req, res) => {
  const loan = await Loan.findByPk(req.params.id);
  const users = await User.findAll();
  const books = await Book.findAll();

  res.render('loans/edit', { loan, users, books });
});


// ATUALIZAR EMPRÉSTIMO
app.put('/loans/:id', async (req, res) => {
  await Loan.update(req.body, {
    where: { id: req.params.id }
  });

  res.redirect('/loans');
});


// DELETAR EMPRÉSTIMO
app.delete('/loans/:id', async (req, res) => {
  await Loan.destroy({
    where: { id: req.params.id }
  });

  res.redirect('/loans');
});


// CRUD — CATEGORIES


app.get('/categories', async (req, res) => {
  const categories = await Category.findAll();
  res.render('categories/list', { categories });
});

app.get('/categories/new', (req, res) => {
  res.render('categories/new');
});

app.post('/categories', async (req, res) => {
  await Category.create(req.body);
  res.redirect('/categories');
});

app.get('/categories/:id/edit', async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  res.render('categories/edit', { category });
});

app.put('/categories/:id', async (req, res) => {
  await Category.update(req.body, { where: { id: req.params.id } });
  res.redirect('/categories');
});

app.delete('/categories/:id', async (req, res) => {
  await Category.destroy({ where: { id: req.params.id } });
  res.redirect('/categories');
});


// CRUD — AUTHORS


app.get('/authors', async (req, res) => {
  const authors = await Author.findAll({ raw: true});
  res.render('authors/list', { authors });
});

app.get('/authors/new', (req, res) => {
  res.render('authors/new');
});

app.post('/authors', async (req, res) => {
  await Author.create(req.body);
  res.redirect('/authors');
});

app.get('/authors/:id/edit', async (req, res) => {
  const author = await Author.findByPk(req.params.id);
  res.render('authors/edit', { author });
});

app.put('/authors/:id', async (req, res) => {
  await Author.update(req.body, { where: { id: req.params.id } });
  res.redirect('/authors');
});

app.delete('/authors/:id', async (req, res) => {
  await Author.destroy({ where: { id: req.params.id } });
  res.redirect('/authors');
});


// CRUD — PUBLISHERS


app.get('/publishers', async (req, res) => {
  const publishers = await Publisher.findAll({ raw: true });
  res.render('publishers/list', { publishers });
});

app.get('/publishers/new', (req, res) => {
  res.render('publishers/new');
});

app.post('/publishers', async (req, res) => {
  await Publisher.create(req.body);
  res.redirect('/publishers');
});

app.get('/publishers/:id/edit', async (req, res) => {
  const publisher = await Publisher.findByPk(req.params.id);
  res.render('publishers/edit', { publisher });
});

app.put('/publishers/:id', async (req, res) => {
  await Publisher.update(req.body, { where: { id: req.params.id } });
  res.redirect('/publishers');
});

app.delete('/publishers/:id', async (req, res) => {
  await Publisher.destroy({ where: { id: req.params.id } });
  res.redirect('/publishers');
});


db.sync().then(() => {
  console.log('Banco sincronizado.');
  app.listen(PORT, () => {
    console.log(`     
 ⣀⣤⣤⣤⣀⠀⠀⠀⠀⠀⣀⣤⣤⣤⣀
⣼⣿⣿⣿⣿⣿⣷⡆⢰⣾⣿⣿⣿⣿⣿⣇
⣿⣿⣿⣿⣿⣿⣿⡇⢸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡇⢸⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡇⢸⣿⣿⣿⣿⣿⣿⣿    Bem vindo(a), mestre!
⠛⠛⠛⠿⠿⣿⣿⡇⢸⣿⣿⠿⠿⠛⠛⠛        
⠙⠓⠒⠶⠦⣄⡉⠃⠘⢉⣠⠴⠶⠒⠚⠋
⠀⠀⠀⠀⠀⠀⠀⠉⠃⠃⠉⠀⠀⠀⠀⠀
 
Servidor rodando em http://localhost:${PORT}`);
  });
});
