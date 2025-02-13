var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');

var app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(require('express-session')({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user || user.password !== password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function(err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/home', function(req, res) {
  res.render('home', { user: req.user });
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/', function(req, res) {
  res.render('home', { user: req.user });
});

app.listen(3000, function() {
  console.log('App is listening on port 3000');
});
