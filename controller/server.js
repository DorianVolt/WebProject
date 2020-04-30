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
app.use(session({ secret: "test", resave: false, saveUninitialized: true }));

app.engine('html', mustache());

app.set('view engine', 'html');
app.set('views', '../views');

//Inscription
app.post('/register', (req, res) => {
    var MDP = model.testMDP(req.body.password, req.body.passwordConfirm);
    var username = model.doubleName(req.body.username);
    if (!MDP || !username) {
        res.redirect('/register');
    } else {
        model.register(req.body.username, req.body.password);
        res.render('validation');
    }
})

//Page principale 
app.post('/', (req, res) => {
    if (req.session.authenticated == false) {
        req.session.authenticated = false;
        req.session.notauthenticated = true;
        res.redirect('/');
    } else res.redirect('/');
})


app.get('/', (req, res) => {
    var session = req.session
    res.render('index', session);
});

//Page d'inscription
app.get('/register', (req, res) => {
    res.render('register');
})

//Connexion
app.post('/login', (req, res) => {
    if (res.locals.authenticated == true) {
        res.redirect('/profil');
    } else {
        var id = model.login(req.body.name, req.body.password);
        req.session.pseudo = req.body.name;
        req.session.user = id;
        res.redirect('/profil');
    }

})

//Page profil
app.get('/profil', is_authenticated, (req, res) => {

    var name = model.printProfil(req.session.user);
    if (name == -1) {
        console.log('Authentication failed !')
        res.redirect('/')
    } else {
        var games = model.getGamesById(req.session.user)
        var authenticated = req.session.authenticated
        res.render('profil',{ pseudo: name, games ,authenticated});
    }
})
app.post('/profil', (req, res) => {
    res.redirect('/profil');
});

//Déconnexion
app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

//Middleware d'authentification
function is_authenticated(req, res, next) {
    if (req.session.user !== -1) {
        req.session.authenticated = true;
        req.session.notauthenticated = false;
        return next();
    }
    res.status(401).send('Authentication failed');
}

//Requête à l'API ------------------------------------------------------------------------------------------------------------------------------------------

var page;
var resultat;
var hasNext = true;
var hasPrev = false

//Page de jeu (recherche)
app.post('/game', async (req, res) => {
    page = 1
    resultat = req.body.research;
    req.params.research = resultat
    var result = await model.requestToApi(page, resultat)
    if (result.count == 0) {
        res.redirect('/')
    }
    else {
        result.authenticated = req.session.authenticated
        result.hasNext =hasNext
        result.hasPrev =hasPrev
        result.pseudo =  model.printProfil(req.session.user);
        res.render('../views/game', result)
    }
})




//Page de jeu 
app.get('/game', async (req, res) => {
    var result = await model.requestToApi(page, resultat)
    if (result.count == 0) {
        res.redirect('/')
    }
    else {
        //Navigation des pages
        if (page == 1) {
            hasPrev = false
        }
        if (page != 1) {
            hasPrev = true
        }
        if (result.count <= page * 10) {
            hasNext = false
        }
        if (page * 10 < result.count) {
            hasNext = true
        }
        result.authenticated = req.session.authenticated
        result.hasNext =hasNext
        result.hasPrev =hasPrev
        result.pseudo =  model.printProfil(req.session.user);
        res.render('../views/game', result )
    }
})

//Prochaine page
app.get('/next', async (req, res) => {
    page++
    res.redirect('/game')
})

//Page précedente
app.get('/previous', async (req, res) => {
    page--
    res.redirect('/game')
})

//Ajout d'un jeu dans la liste de l'utilisateur
app.post('/ajout/:id/:name', is_authenticated, (req, res) => {
    model.addGame(req.params.id, req.params.name, req.session.user)
})

//Delete un jeu de la liste
app.post('/delete/:name', is_authenticated, (req, res) => {
    model.deleteGameById(req.params.name, req.session.user)
    res.redirect('/profil')
})

app.listen(5000, () => console.log('The server is running at http://localhost:8000'));