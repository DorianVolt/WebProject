"use strict"


/* Serveur pour le site de recettes */
var express = require('express');
var mustache = require('mustache-express');

var model = require('./model');
var app = express();
const cookieSession = require('cookie-session');

app.use(cookieSession({
    secret: 'session',
    keys: ['MegaZob'],
    maxAge: 24 * 60 * 60 * 1000,
}));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

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
    var id = model.login(req.params.name, req.params.password);
    if (id == "-1") {
        res.session = true;
        res.redirect('/profil' + id);
    } else res.redirect('/');
})

// retourne la page profil
app.get('/profil/:id', (req, res) => {
    var name = model.printProfil(req.params.id)
    res.render('profil', { pseudo: name });
})
app.post('/profil', is_authenticated, (req, res) => {
    var id = model.create(post_data_to_recipe(req));
    res.redirect('/profil/' + id);
});

function is_authenticated(req, res, next) {
    if (req.session !== undefined) {
        res.locals.authenticated = true;
        return next();
    }
    res.status(401).send('Authentication required');
}

app.listen(3000, () => console.log('listening on http://localhost:3000'));