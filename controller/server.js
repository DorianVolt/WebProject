"use strict"
var mustache = require('../node_modules/mustache-express');
var model = require('./model');

var express = require('../node_modules/express');
var app = express();
var multer = require('../node_modules/multer')
var upload = multer()
var bodyParser = require('../node_modules/body-parser');
var session = require('../node_modules/express-session');
var cookieParser = require('../node_modules/cookie-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({ secret: "jaiunmegaZOB", resave: false, saveUninitialized: true }));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', '../views');

var Users = [];

/* Retourne la page principale */
app.get('/', (req, res) => {
    res.render('index');
});

// retourne la mage d'inscription
app.get('/register', (req, res) => {
    res.render('register');
})

//connection 
app.post('/login', (req, res) => {
    var id = model.login(req.body.name, req.body.password);
    req.session.user = id;

    if (req.session.user !== "-1") {
        console.log("login recup : " + req.session.user);
        res.redirect('/profil');
    } else res.redirect('/');
})

// retourne la page profil
app.get('/profil', (req, res) => {

    console.log("recup id pour profil : " + req.session.user);
    var name = model.printProfil(req.session.user);
    console.log("recup du nom : " + name);
    res.render('profil', { pseudo: name });
})
app.post('/profil', is_authenticated, (req, res) => {

    res.redirect('/profil');
});

function is_authenticated(req, res, next) {
    if (req.session.user !== undefined) {
        res.locals.authenticated = true;
        return next();
    }
    res.status(401).send('Authentication required');
}

app.listen(3000, () => console.log('listening on http://localhost:3000'));