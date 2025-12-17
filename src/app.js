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
      console.log('[Helper formatDate] Data recebida:', date);
      if (!date) return '—';
      return new Date(date).toLocaleDateString('pt-BR');
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');


app.get('/', (req, res) => {
  console.log('[GET /] Acessando home');
  res.render('home');
});

// ROTAS — BOOKS

app.get('/books', async (req, res) => {
  console.log('[GET /books] Listando livros');
  const books = await Book.findAll({
    include: [Author, Category, Publisher]
  });
  console.log('[GET /books] Livros encontrados:', books.length);
  res.render('books/list', { books });
});


app.get('/books/new', async (req, res) => {
  console.log('[GET /books/new] Formulário novo livro');
  const authors = await Author.findAll();
  const categories = await Category.findAll();
  const publishers = await Publisher.findAll();
  console.log('[GET /books/new] Dados carregados - Autores:', authors.length, 'Categorias:', categories.length, 'Editoras:', publishers.length);
  res.render('books/new', { authors, categories, publishers });
});

app.post('/books', async (req, res) => {
  console.log('[POST /books] Criando livro');
  console.log('[POST /books] Dados recebidos:', req.body);
  await Book.create(req.body);
  console.log('[POST /books] Livro criado com sucesso');
  res.redirect('/books');
});

app.get('/books/:id/edit', async (req, res) => {
  console.log('[GET /books/:id/edit] Editando livro ID:', req.params.id);
  const book = await Book.findByPk(req.params.id);
  const authors = await Author.findAll();
  const categories = await Category.findAll();
  const publishers = await Publisher.findAll();
  console.log('[GET /books/:id/edit] Livro encontrado:', book?.title);
  res.render('books/edit', { book, authors, categories, publishers });
});

app.put('/books/:id', async (req, res) => {
  console.log('[PUT /books/:id] Atualizando livro ID:', req.params.id);
  console.log('[PUT /books/:id] Novos dados:', req.body);
  await Book.update(req.body, { where: { id: req.params.id } });
  console.log('[PUT /books/:id] Livro atualizado com sucesso');
  res.redirect('/books');
});

app.delete('/books/:id', async (req, res) => {
  console.log('[DELETE /books/:id] Deletando livro ID:', req.params.id);
  await Book.destroy({ where: { id: req.params.id } });
  console.log('[DELETE /books/:id] Livro deletado com sucesso');
  res.redirect('/books');
});



// ROTAS — USERS

app.get('/users', async (req, res) => {
  console.log('[GET /users] Listando usuários');
  const users = await User.findAll({ raw: true });
  console.log('[GET /users] Usuários encontrados:', users.length);
  res.render('users/list', { users });
});

app.get('/users/new', (req, res) => {
  console.log('[GET /users/new] Formulário novo usuário');
  res.render('users/new');
});

app.post('/users', async (req, res) => {
  console.log('[POST /users] Criando usuário');
  console.log('[POST /users] Dados recebidos:', req.body);
  await User.create(req.body);
  console.log('[POST /users] Usuário criado com sucesso');
  res.redirect('/users');
});

app.get('/users/:id/edit', async (req, res) => {
  console.log('[GET /users/:id/edit] Editando usuário ID:', req.params.id);
  const user = await User.findByPk(req.params.id);
  console.log('[GET /users/:id/edit] Usuário encontrado:', user?.name);
  res.render('users/edit', { user });
});

app.put('/users/:id', async (req, res) => {
  console.log('[PUT /users/:id] Atualizando usuário ID:', req.params.id);
  console.log('[PUT /users/:id] Novos dados:', req.body);
  await User.update(req.body, { where: { id: req.params.id } });
  console.log('[PUT /users/:id] Usuário atualizado com sucesso');
  res.redirect('/users');
});

app.delete('/users/:id', async (req, res) => {
  console.log('[DELETE /users/:id] Deletando usuário ID:', req.params.id);
  await User.destroy({ where: { id: req.params.id } });
  console.log('[DELETE /users/:id] Usuário deletado com sucesso');
  res.redirect('/users');
});

// Histórico
app.get('/users/:id/history', async (req, res) => {
  console.log('[GET /users/:id/history] Histórico do usuário ID:', req.params.id);
  const user = await User.findByPk(req.params.id);
  if (!user) {
    console.log('[GET /users/:id/history] Usuário não encontrado');
    return res.status(404).send('Usuário não encontrado');
  }
  const loans = await Loan.findAll({ where: { userId: user.id } });
  console.log('[GET /users/:id/history] Empréstimos encontrados:', loans.length);
  res.render('users/history', { user, loans });
});


// ROTAS — LOANS
// LISTAR TODOS OS EMPRÉSTIMOS
app.get('/loans', async (req, res) => {
  console.log('[GET /loans] Listando empréstimos');
  const loans = await Loan.findAll({
    include: [
      { model: User, attributes: ['id', 'name'] },
      { model: Book, attributes: ['id', 'title'] }
    ]
  });

  console.log('[GET /loans] Total de empréstimos:', loans.length);

  if (loans.length > 0) {
    const firstLoan = loans[0].get({ plain: true });
    console.log('[GET /loans] Primeiro empréstimo completo:', firstLoan);
    console.log('[GET /loans] User do primeiro empréstimo:', firstLoan.User);
    console.log('[GET /loans] Book do primeiro empréstimo:', firstLoan.Book);
  }

  // Formatar dados para o handlebars
  const loansFormatted = loans.map(loan => {
    const loanData = loan.get({ plain: true });

    return {
      id: loanData.id,
      userName: loanData.User?.name || 'N/A',
      bookTitle: loanData.Book?.title || 'N/A',
      dateOut: loanData.loanDate,
      dueDate: loanData.returnDate,
      returned: loanData.returnDate ? new Date(loanData.returnDate) <= new Date() : false
    };
  });

  console.log('[GET /loans] Empréstimos encontrados:', loansFormatted.length);
  res.render('loans/list', { loans: loansFormatted });
});


// FORMULÁRIO DE NOVO EMPRÉSTIMO
app.get('/loans/new', async (req, res) => {
  console.log('[GET /loans/new] Formulário novo empréstimo');
  const users = await User.findAll();
  const books = await Book.findAll();
  console.log('[GET /loans/new] Dados carregados - Usuários:', users.length, 'Livros:', books.length);
  res.render('loans/new', { users, books });
});


// CRIAR EMPRÉSTIMO
app.post('/loans', async (req, res) => {
  console.log('[POST /loans] Criando empréstimo');
  console.log('[POST /loans] Dados recebidos:', req.body);

  const { UserId, BookId, days } = req.body;

  if (!UserId || !BookId) {
    console.log('[POST /loans] ERRO: UserId ou BookId ausente');
    return res.status(400).send('Usuário ou livro não informado');
  }

  const loanDate = new Date();
  const returnDate = new Date();
  returnDate.setDate(loanDate.getDate() + (parseInt(days) || 7));

  await Loan.create({
    UserId,
    BookId,
    loanDate,
    returnDate
  });

  console.log('[POST /loans] Empréstimo criado com sucesso');
  res.redirect('/loans');
});



// REGISTRAR DEVOLUÇÃO
app.put('/loans/:id/return', async (req, res) => {
  console.log('[PUT /loans/:id/return] Registrando devolução do empréstimo ID:', req.params.id);
  await Loan.update(
    { returnDate: new Date() },
    { where: { id: req.params.id } }
  );
  console.log('[PUT /loans/:id/return] Devolução registrada com sucesso');
  res.redirect('/loans');
});


// FORMULÁRIO DE EDIÇÃO
app.get('/loans/:id/edit', async (req, res) => {
  console.log('[GET /loans/:id/edit] Editando empréstimo ID:', req.params.id);
  const loan = await Loan.findByPk(req.params.id);
  const users = await User.findAll();
  const books = await Book.findAll();
  console.log('[GET /loans/:id/edit] Empréstimo encontrado:', loan?.id);
  res.render('loans/edit', { loan, users, books });
});


// ATUALIZAR EMPRÉSTIMO
app.put('/loans/:id', async (req, res) => {
  console.log('[PUT /loans/:id] Atualizando empréstimo ID:', req.params.id);
  console.log('[PUT /loans/:id] Novos dados:', req.body);
  await Loan.update({
    UserId: req.body.userId,
    BookId: req.body.bookId,
    loanDate: req.body.loanDate,
    returnDate: req.body.returnDate
  }, {
    where: { id: req.params.id }
  });
  console.log('[PUT /loans/:id] Empréstimo atualizado com sucesso');
  res.redirect('/loans');
});


// DELETAR EMPRÉSTIMO
app.delete('/loans/:id', async (req, res) => {
  console.log('[DELETE /loans/:id] Deletando empréstimo ID:', req.params.id);
  await Loan.destroy({
    where: { id: req.params.id }
  });
  console.log('[DELETE /loans/:id] Empréstimo deletado com sucesso');
  res.redirect('/loans');
});


// CRUD — CATEGORIES


app.get('/categories', async (req, res) => {
  console.log('[GET /categories] Listando categorias');
  const categories = await Category.findAll();
  console.log('[GET /categories] Categorias encontradas:', categories.length);
  res.render('categories/list', { categories });
});

app.get('/categories/new', (req, res) => {
  console.log('[GET /categories/new] Formulário nova categoria');
  res.render('categories/new');
});

app.post('/categories', async (req, res) => {
  console.log('[POST /categories] Criando categoria');
  console.log('[POST /categories] Dados recebidos:', req.body);
  await Category.create(req.body);
  console.log('[POST /categories] Categoria criada com sucesso');
  res.redirect('/categories');
});

app.get('/categories/:id/edit', async (req, res) => {
  console.log('[GET /categories/:id/edit] Editando categoria ID:', req.params.id);
  const category = await Category.findByPk(req.params.id);
  console.log('[GET /categories/:id/edit] Categoria encontrada:', category?.name);
  res.render('categories/edit', { category });
});

app.put('/categories/:id', async (req, res) => {
  console.log('[PUT /categories/:id] Atualizando categoria ID:', req.params.id);
  console.log('[PUT /categories/:id] Novos dados:', req.body);
  await Category.update(req.body, { where: { id: req.params.id } });
  console.log('[PUT /categories/:id] Categoria atualizada com sucesso');
  res.redirect('/categories');
});

app.delete('/categories/:id', async (req, res) => {
  console.log('[DELETE /categories/:id] Deletando categoria ID:', req.params.id);
  await Category.destroy({ where: { id: req.params.id } });
  console.log('[DELETE /categories/:id] Categoria deletada com sucesso');
  res.redirect('/categories');
});


// CRUD — AUTHORS


app.get('/authors', async (req, res) => {
  console.log('[GET /authors] Listando autores');
  const authors = await Author.findAll({ raw: true });
  console.log('[GET /authors] Autores encontrados:', authors.length);
  res.render('authors/list', { authors });
});

app.get('/authors/new', (req, res) => {
  console.log('[GET /authors/new] Formulário novo autor');
  res.render('authors/new');
});

app.post('/authors', async (req, res) => {
  console.log('[POST /authors] Criando autor');
  console.log('[POST /authors] Dados recebidos:', req.body);
  await Author.create(req.body);
  console.log('[POST /authors] Autor criado com sucesso');
  res.redirect('/authors');
});

app.get('/authors/:id/edit', async (req, res) => {
  console.log('[GET /authors/:id/edit] Editando autor ID:', req.params.id);
  const author = await Author.findByPk(req.params.id);
  console.log('[GET /authors/:id/edit] Autor encontrado:', author?.name);
  res.render('authors/edit', { author });
});

app.put('/authors/:id', async (req, res) => {
  console.log('[PUT /authors/:id] Atualizando autor ID:', req.params.id);
  console.log('[PUT /authors/:id] Novos dados:', req.body);
  await Author.update(req.body, { where: { id: req.params.id } });
  console.log('[PUT /authors/:id] Autor atualizado com sucesso');
  res.redirect('/authors');
});

app.delete('/authors/:id', async (req, res) => {
  console.log('[DELETE /authors/:id] Deletando autor ID:', req.params.id);
  await Author.destroy({ where: { id: req.params.id } });
  console.log('[DELETE /authors/:id] Autor deletado com sucesso');
  res.redirect('/authors');
});


// CRUD — PUBLISHERS


app.get('/publishers', async (req, res) => {
  console.log('[GET /publishers] Listando editoras');
  const publishers = await Publisher.findAll({ raw: true });
  console.log('[GET /publishers] Editoras encontradas:', publishers.length);
  res.render('publishers/list', { publishers });
});

app.get('/publishers/new', (req, res) => {
  console.log('[GET /publishers/new] Formulário nova editora');
  res.render('publishers/new');
});

app.post('/publishers', async (req, res) => {
  console.log('[POST /publishers] Criando editora');
  console.log('[POST /publishers] Dados recebidos:', req.body);
  await Publisher.create(req.body);
  console.log('[POST /publishers] Editora criada com sucesso');
  res.redirect('/publishers');
});

app.get('/publishers/:id/edit', async (req, res) => {
  console.log('[GET /publishers/:id/edit] Editando editora ID:', req.params.id);
  const publisher = await Publisher.findByPk(req.params.id);
  console.log('[GET /publishers/:id/edit] Editora encontrada:', publisher?.name);
  res.render('publishers/edit', { publisher });
});

app.put('/publishers/:id', async (req, res) => {
  console.log('[PUT /publishers/:id] Atualizando editora ID:', req.params.id);
  console.log('[PUT /publishers/:id] Novos dados:', req.body);
  await Publisher.update(req.body, { where: { id: req.params.id } });
  console.log('[PUT /publishers/:id] Editora atualizada com sucesso');
  res.redirect('/publishers');
});

app.delete('/publishers/:id', async (req, res) => {
  console.log('[DELETE /publishers/:id] Deletando editora ID:', req.params.id);
  await Publisher.destroy({ where: { id: req.params.id } });
  console.log('[DELETE /publishers/:id] Editora deletada com sucesso');
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