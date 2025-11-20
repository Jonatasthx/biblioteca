const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');

const app = express();
const PORT = process.env.PORT || 3000;

// Configs
app.use(express.urlencoded({ extended: true })); // form body
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars setup
app.engine('handlebars', exphbs.create({
  defaultLayout: 'main',
  helpers: {
    formatDate: (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR');
    },
    isOverdue: (dueDate, returned) => {
      if (returned) return false;
      if (!dueDate) return false;
      const now = new Date();
      return new Date(dueDate) < now;
    },
  }
}).engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// ----------------------
// Dados em memória (para início rápido)
// Troque por banco quando quiser (SQLite, Mongo, PostgreSQL...)
// ----------------------
let books = [
  { id: uuidv4(), title: 'Dom Casmurro', author: 'Machado de Assis', total: 3, available: 3 },
  { id: uuidv4(), title: 'O Pequeno Príncipe', author: 'Antoine de Saint-Exupéry', total: 2, available: 2 }
];

let users = [
  { id: uuidv4(), name: 'Maria', email: 'maria@comunitaria.org' },
  { id: uuidv4(), name: 'João', email: 'joao@comunitaria.org' }
];

let loans = [
  // { id, userId, bookId, dateOut, dueDate, returned, dateReturned }
];

// ----------------------
// Rotas principais
// ----------------------
app.get('/', (req, res) => {
  res.redirect('/books');
});

// ----- BOOKS CRUD -----
app.get('/books', (req, res) => {
  res.render('books/list', { books });
});

app.get('/books/new', (req, res) => {
  res.render('books/form', { book: {} });
});

app.post('/books', (req, res) => {
  const { title, author, total } = req.body;
  const totalNum = parseInt(total, 10) || 1;
  const b = { id: uuidv4(), title, author, total: totalNum, available: totalNum };
  books.push(b);
  res.redirect('/books');
});

app.get('/books/:id/edit', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).send('Livro não encontrado');
  res.render('books/form', { book });
});

app.put('/books/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) return res.status(404).send('Livro não encontrado');
  const { title, author, total } = req.body;
  const totalNum = parseInt(total, 10) || book.total;
  // ajustar disponibilidade quando total muda
  const diff = totalNum - book.total;
  book.title = title;
  book.author = author;
  book.total = totalNum;
  book.available = Math.max(0, book.available + diff);
  res.redirect('/books');
});

app.delete('/books/:id', (req, res) => {
  // evitar deletar livro que está emprestado
  const hasLoanActive = loans.some(l => l.bookId === req.params.id && !l.returned);
  if (hasLoanActive) {
    return res.status(400).send('Não é possível excluir: existe empréstimo ativo deste livro.');
  }
  books = books.filter(b => b.id !== req.params.id);
  res.redirect('/books');
});

// ----- USERS CRUD -----
app.get('/users', (req, res) => {
  res.render('users/list', { users });
});

app.get('/users/new', (req, res) => {
  res.render('users/form', { user: {} });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body;
  users.push({ id: uuidv4(), name, email });
  res.redirect('/users');
});

app.get('/users/:id/edit', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).send('Usuário não encontrado');
  res.render('users/form', { user });
});

app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).send('Usuário não encontrado');
  const { name, email } = req.body;
  user.name = name;
  user.email = email;
  res.redirect('/users');
});

app.delete('/users/:id', (req, res) => {
  // evitar excluir usuário com empréstimo ativo
  const hasLoanActive = loans.some(l => l.userId === req.params.id && !l.returned);
  if (hasLoanActive) {
    return res.status(400).send('Não é possível excluir: usuário possui empréstimos ativos.');
  }
  users = users.filter(u => u.id !== req.params.id);
  res.redirect('/users');
});

// ----- LOANS / EMPRÉSTIMOS -----
app.get('/loans', (req, res) => {
  // enriquecer com infos de usuário e livro + status de atraso
  const enriched = loans.map(l => {
    const user = users.find(u => u.id === l.userId) || { name: '—' };
    const book = books.find(b => b.id === l.bookId) || { title: '—' };
    return { ...l, userName: user.name, bookTitle: book.title };
  });
  res.render('loans/list', { loans: enriched });
});

app.get('/loans/new', (req, res) => {
  // só permite emprestar quando existem livros disponíveis
  const availableBooks = books.filter(b => b.available > 0);
  res.render('loans/form', { users, books: availableBooks });
});

app.post('/loans', (req, res) => {
  const { userId, bookId, days } = req.body;
  const book = books.find(b => b.id === bookId);
  if (!book || book.available <= 0) return res.status(400).send('Livro indisponível');
  const daysNum = parseInt(days, 10) || 7;
  const dateOut = new Date();
  const dueDate = new Date(dateOut);
  dueDate.setDate(dueDate.getDate() + daysNum);
  const loan = { id: uuidv4(), userId, bookId, dateOut: dateOut.toISOString(), dueDate: dueDate.toISOString(), returned: false, dateReturned: null };
  loans.push(loan);
  book.available -= 1;
  res.redirect('/loans');
});

app.put('/loans/:id/return', (req, res) => {
  const loan = loans.find(l => l.id === req.params.id);
  if (!loan) return res.status(404).send('Empréstimo não encontrado');
  if (loan.returned) return res.redirect('/loans');
  loan.returned = true;
  loan.dateReturned = new Date().toISOString();
  const book = books.find(b => b.id === loan.bookId);
  if (book) book.available = Math.min(book.total, book.available + 1);
  res.redirect('/loans');
});

// Histórico por usuário
app.get('/users/:id/history', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).send('Usuário não encontrado');
  const userLoans = loans.filter(l => l.userId === req.params.id).map(l => {
    const book = books.find(b => b.id === l.bookId) || {};
    return { ...l, bookTitle: book.title };
  });
  res.render('users/history', { user, loans: userLoans });
});


// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});