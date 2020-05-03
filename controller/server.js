"use strict";

var mustache = require("../node_modules/mustache-express");

var model = require("./model");

var express = require("../node_modules/express");
var app = express();

var multer = require("../node_modules/multer");
var upload = multer();

var bodyParser = require("../node_modules/body-parser");
var session = require("../node_modules/express-session");
var cookieParser = require("../node_modules/cookie-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload.array());
app.use(cookieParser());
app.use(session({ secret: "test", resave: false, saveUninitialized: true }));

app.engine("html", mustache());

app.set("view engine", "html");
app.set("views", "../views");

//Inscription
app.post("/register", (req, res) => {
  var MDP = model.testMDP(req.body.password, req.body.passwordConfirm);
  var username = model.doubleName(req.body.username);
  if (!MDP || !username) {
    res.redirect("/error");
  } else {
    model.register(req.body.username, req.body.password);
    res.redirect("/validation");
  }
});

//Page principale
app.post("/", (req, res) => {
  if (req.session.authenticated == false) {
    req.session.authenticated = false;
    req.session.notauthenticated = true;
    res.redirect("/");
  } else res.redirect("/");
});

app.get("/", (req, res) => {
  var session = req.session;
  res.render("index", session);
});

app.get("/error", (req, res) => {
  res.render("error");
});

app.get("/validation", (req, res) => {
  res.render("validation");
});

app.get("/errorConnexion", (req, res) => {
  res.render("errorConnexion");
});

//Page d'inscription
app.get("/register", (req, res) => {
  res.render("register");
});

//Connexion
app.post("/login", (req, res) => {
  if (res.locals.authenticated == true) {
    res.redirect("/profil");
  } else {
    var id = model.login(req.body.name, req.body.password);
    req.session.pseudo = req.body.name;
    req.session.user = id;
    req.session.isAdmin = false;
    var adminId = model.getAdmins();
    if (id == adminId) {
      req.session.isAdmin = true;
    }
    res.redirect("/profil");
  }
});

//Page profil
app.get("/profil", is_authenticated, (req, res) => {
  var name = model.printProfil(req.session.user);
  if (name == -1) {
    console.log("Authentication failed !");
    res.redirect("/error");
  } else {
    var games = model.getGamesById(req.session.user);
    var authenticated = req.session.authenticated;
    var image = model.getImageById(req.session.user);
    var desc = model.getDescriptionById(req.session.user);
    var favorites = model.getFavById(req.session.user);
    var hasGame = games.length != 0;
    var hasFav = favorites.length != 0;
    res.render("profil", {
      pseudo: name,
      games,
      authenticated,
      image,
      favorites,
      hasGame,
      hasFav,
      desc,
    });
  }
});
app.post("/profil", is_authenticated, (req, res) => {
  res.redirect("/profil");
});

//Déconnexion
app.get("/logout", is_authenticated, (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

//Middleware d'authentification
function is_authenticated(req, res, next) {
  if (req.session.user !== -1) {
    req.session.authenticated = true;
    req.session.notauthenticated = false;
    return next();
  }
  res.redirect("/errorConnexion");
}

//Page d'ajout de photo de profil
app.get("/ajoutPhoto", (req, res) => {
  res.render("ajoutPhoto");
});

app.post("/ajoutPhoto", (req, res) => {
  model.addPhoto(req.body.lienImage, req.session.user);
  res.redirect("/profil");
});

//Suppression du compte
app.get("/deleteAccount", is_authenticated, (req, res) => {
  res.render("deleteAccount");
});

app.post("/deleteAccount", is_authenticated, (req, res) => {
  model.deleteProfile(req.session.user);
  req.session.destroy();
  res.redirect("/");
});

//Page d'ajout d'une biographie'
app.get("/ajoutDescription", (req, res) => {
  res.render("ajoutDescription");
});

app.post("/ajoutDescription", (req, res) => {
  model.addDescription(req.body.description, req.session.user);
  res.redirect("/profil");
});

//Bannissement d'un compte
app.post("/ban/:id", is_authenticated, (req, res) => {
  var id = req.params.id;
  model.deleteProfile(id);
  res.redirect("/users");
});

//Requête à l'API ------------------------------------------------------------------------------------------------------------------------------------------

var page;
var resultat;
var hasNext = true;
var hasPrev = false;

//Page de jeu (recherche)
app.post("/game", async (req, res) => {
  page = 1;
  resultat = req.body.research;
  req.params.research = resultat;
  var result = await model.requestToApi(page, resultat);
  if (result.count == 0) {
    res.redirect("/");
  } else {
    result.authenticated = req.session.authenticated;
    result.hasNext = hasNext;
    result.hasPrev = hasPrev;
    if (req.session.authenticated) {
      result.pseudo = model.printProfil(req.session.user);
    }
    res.render("game", result);
  }
});

//Page de jeu
app.get("/game", async (req, res) => {
  var result = await model.requestToApi(page, resultat);
  if (result.count == 0) {
    res.redirect("/");
  } else {
    //Navigation des pages
    if (page == 1) {
      hasPrev = false;
    }
    if (page != 1) {
      hasPrev = true;
    }
    if (result.count <= page * 10) {
      hasNext = false;
    }
    if (page * 10 < result.count) {
      hasNext = true;
    }
    result.authenticated = req.session.authenticated;
    result.hasNext = hasNext;
    result.hasPrev = hasPrev;
    //Transmet le pseudo au render uniquement si l'utilisateur est connecté
    if (req.session.authenticated) {
      result.pseudo = model.printProfil(req.session.user);
    }
    res.render("game", result);
  }
});

//Prochaine page
app.get("/next", async (req, res) => {
  page++;
  res.redirect("/game");
});

//Page précedente
app.get("/previous", async (req, res) => {
  page--;
  res.redirect("/game");
});

//Ajout d'un jeu dans la liste de l'utilisateur
app.post("/ajout/:id/:name", is_authenticated, (req, res) => {
  model.addGame(req.params.id, req.params.name, req.session.user);
});

//Delete un jeu de la liste
app.post("/delete/:name", is_authenticated, (req, res) => {
  model.deleteGameById(req.params.name, req.session.user);
  res.redirect("/profil");
});

//Ajout d'un jeu dans la liste des favoris de l'utilisateur
app.post("/ajoutFav/:name", is_authenticated, (req, res) => {
  model.addFav(req.params.name, req.session.user);
  res.redirect("/profil");
});

//Delete un jeu de la liste
app.post("/deleteFav/:name", is_authenticated, (req, res) => {
  model.deleteFav(req.params.name, req.session.user);
  res.redirect("/profil");
});

//Page profil via recherche
app.post("/userSearch", (req, res) => {
  var name = req.body.searchName;
  var idResearch = model.getUserIdByName(name);
  if (idResearch == undefined) {
    res.render("noSuchUser");
  } else {
    var userId = idResearch.id;
    var games = model.getGamesById(userId);
    var image = model.getImageById(userId);
    var favorites = model.getFavById(userId);
    var desc = model.getDescriptionById(userId);
    var commons = model.getCommons(userId, req.session.user);
    var hasCommons = commons.length != 0;
    var hasGame = games.length != 0;
    var hasFav = favorites.length != 0;
    var authenticated = req.session.authenticated;
    res.render("profilSearch", {
      pseudo: name,
      games,
      image,
      favorites,
      hasGame,
      hasFav,
      authenticated,
      desc,
      commons,
      hasCommons,
    });
  }
});

//Retourne la liste de sutilisateur pour une recherche plus simple
app.get("/users", (req, res) => {
  var users = model.getUSERS();
  var authenticated = req.session.authenticated;
  var sorted = false;
  var isAdmin = req.session.isAdmin;
  res.render("users", { users, authenticated, sorted, isAdmin });
});

//Trie les utilisateurs par affinité par rapport a l'utilisateur connecté
app.post("/sortByAffinity", (req, res) => {
  var users = model.getByAffinity(req.session.user);
  var authenticated = req.session.authenticated;
  var sorted = true;
  res.render("users", { users, authenticated, sorted });
});

app.get("/gameInfo/:slug", async (req, res) => {
  var gameName = req.params.slug;
  var result = await model.requestInfoToApi(gameName);
  result.authenticated = req.session.authenticated;
  if (req.session.authenticated) {
    result.pseudo = model.printProfil(req.session.user);
  }
  res.render("gameInfo", result);
});

//Page de jeu (suggérés)
app.post("/suggestedGames/:gameId", async (req, res) => {
  var result = await model.requestSuggestedToApi(req.params.gameId);
  if (result.count == 0) {
    res.redirect("/");
  } else {
    result.authenticated = req.session.authenticated;
    if (req.session.authenticated) {
      result.pseudo = model.printProfil(req.session.user);
    }
    res.render("game", result);
  }
});

//Page de jeu (populaire)
app.post("/popular", async (req, res) => {
  var result = await model.requestPopularToApi();
  if (result.count == 0) {
    res.redirect("/");
  } else {
    result.authenticated = req.session.authenticated;
    if (req.session.authenticated) {
      result.pseudo = model.printProfil(req.session.user);
    }
    res.render("game", result);
  }
});

app.listen(8000, () =>
  console.log("The server is running at http://localhost:8000")
);
