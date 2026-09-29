const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// הגדרת תבנית EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

// נתונים זמניים בזיכרון (עבור הדגמה ב-Serverless)
let issues = [
  { issue_number: 1, title: 'גיליון פתיחה - סייבר ובינה מלאכותית', cover_url: 'https://via.placeholder.com/200x280?text=Issue+1', pdf_url: '#', release_date: '2026-09-01' }
];

let policies = [
  { doc_num: 'DOC-2026-01', title: 'מדיניות אבטחת מידע לפיתוח קוד', author: 'צוות סייבר', updated_at: '2026-09-15', file_url: '#' }
];

let contents = [
  { id: 1, type: 'publications', title: 'סקירת טכנולוגיות ענן 2026', description: 'מאמר מעמיק על ארכיטקטורת ענן מאובטחת.', image_url: 'https://via.placeholder.com/300x180', created_at: '2026-09-20' }
];

// --- נתיבים (Routes) ---

// דף הבית
app.get('/', (req, res) => {
  const currentIssue = issues[issues.length - 1] || null;
  res.render('home', { currentIssue, latestCards: contents });
});

// ארכיון
app.get('/archive', (req, res) => {
  res.render('archive', { issues, currentPage: 1, totalPages: 1 });
});

// מסמכי מדיניות
app.get('/policy', (req, res) => {
  res.render('policy', { policies });
});

// פרסומים, אירועים, חדשנות
app.get('/:type(publications|events|innovation)', (req, res) => {
  const typeMap = { 'publications': 'פרסומים', 'events': 'אירועים', 'innovation': 'חדשנות' };
  const filtered = contents.filter(c => c.type === req.params.type);
  res.render('cards_page', { items: filtered, pageTitle: typeMap[req.params.type], type: req.params.type, currentPage: 1, totalPages: 1 });
});

// פרטי פריט
app.get('/item/:id', (req, res) => {
  const item = contents.find(c => c.id == req.params.id);
  if (!item) return res.status(404).send('התוכן לא נמצא');
  res.render('item_detail', { item });
});

// התחברות
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'Admin' && password === 'Admin') {
    res.cookie('auth', 'admin-logged-in', { httpOnly: true });
    res.redirect('/admin');
  } else {
    res.render('login', { error: 'שם משתמש או סיסמה שגויים' });
  }
});

// אדמין
app.get('/admin', (req, res) => {
  if (req.cookies.auth !== 'admin-logged-in') return res.redirect('/login');
  res.render('admin', { issues, policies, contents });
});

app.get('/logout', (req, res) => {
  res.clearCookie('auth');
  res.redirect('/');
});

module.exports.handler = serverless(app);