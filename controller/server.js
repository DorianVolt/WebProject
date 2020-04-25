"use strict"

var mustache = require('../node_modules/mustache-express');

var model = require('./model');
var document = "../views"

var express = require('../node_modules/express');
var app = express();

var multer = require('../node_modules/multer')
var upload = multer()

var fetch = require("node-fetch");

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



// retourne la page d'inscription
app.get('/register', (req, res) => {
    res.render('register');
})

//inscription
app.post('/registered', (req, res) => {
    var MDP = model.testMDP(req.body.password, req.body.passwordConfirm);
    var username = model.doubleName(req.body.username);
    if (!MDP || !username) {
        res.redirect('/register');
    } else {
        model.register(req.body.username, req.body.password);
        res.render('validation');
    }
})

/* Retourne la page principale */
app.post('/', (req, res) => {
    if (req.session.authenticated == false) {
        req.session.authenticated = false;
        req.session.notauthenticated = true;
        res.redirect('/');
    } else res.redirect('/');
})


app.get('/', (req, res) => {

    res.render('index',req.session);
});

// retourne la mage d'inscription
app.get('/register', (req, res) => {
    res.render('register');
})

//connection 
app.post('/login', (req, res) => {
    if (res.locals.authenticated == true) {
        res.redirect('/profil');
    } else {
        var id = model.login(req.body.name, req.body.password);
        req.session.user = id;
        res.redirect('/profil');
    }

})

// retourne la page profil
app.get('/profil', is_authenticated, (req, res) => {
    console.log(req.session.user);
    var name = model.printProfil(req.session.user);
    if (name == -1) {
        console.log('Authentication failed !')
        res.redirect('/')
    } else {
        res.render('profil', { pseudo: name });
    }
})
app.post('/profil', (req, res) => {
    res.redirect('/profil');
});


function is_authenticated(req, res, next) {
    if (req.session.user !== -1) {
        req.session.authenticated = true;
        req.session.notauthenticated = false;
        return next();
    }
    res.status(401).send('Authentication failed');
}

//Request to the API ------------------------------------------------------------------------------------------------------------------------------------------

//retourne la page de jeu
app.get('/game', (req,res) =>{
    res.render('game')
})

app.post('/game',async (req,res) =>{
    const monVier = req.body.research;
    await requestToApi (monVier)
    res.redirect('/game')
})

async function requestToApi(gameName){
    const apiUrl = "https://api.rawg.io/api/games?page_size=5&search=" + gameName;
    const repsonse =  await fetch(apiUrl)
    const json = await  repsonse.json()
    console.log(json)
    return json;
}


app.listen(3000, () => console.log('The server is running at http://localhost:3000'));