"use strict"


/* Serveur pour le site de recettes */
var express = require('express');
var mustache = require('mustache-express');

var app = express();
const cookieSession = require('cookie-session');
app.use(cookieSession({
    secret: 'mot-de-passe-du-cookie',
}));
app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

/* Retourne la page principale */
app.get('/', (req, res) => {
    res.render('index');
});

// retourne la mage d'inscription
app.get('/inscriptiion', (req, res) => {
    res.render('register');
})


// retourne la page profil
app.get('/profil', (req, res) => {
    res.render('profil');
})
/*app.post('/create', is_authenticated, (req, res) => {
    var id = model.create(post_data_to_recipe(req));
    res.redirect('/profil/' + id);
});

// page liste des jeux 
app.get('/games', (req, res) => {
    res.render('games');
})
app.post('/create', is_authenticated, (req, res) => {
    var id = model.create(post_data_to_recipe(req));
    res.redirect('/games/' + id);
});*/

app.listen(3000, () => console.log('listening on http://localhost:3000'));