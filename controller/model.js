"use strict";
const Sqlite = require("../node_modules/better-sqlite3");

let db = new Sqlite("db.sqlite");
var fetch = require("node-fetch");

//Connexion
exports.login = function (name, password) {
  var user = db
    .prepare("SELECT id FROM user WHERE name=? AND password=?")
    .get(name, password);
  if (user == undefined) {
    return -1;
  }
  if (user.id != undefined) {
    return user.id;
  }
  return -1;
};

//Inscription
exports.register = function (name, password) {
  db.prepare("INSERT INTO user VALUES (@id, @name, @password)").run({
    id: null,
    name: name,
    password: password,
  });
};

//Infos d'un profil
exports.printProfil = function (id) {
  var user = db.prepare("SELECT name FROM user WHERE id=?").get(id);
  return user.name;
};

//Check MDP(pas identique ou trop court)
exports.testMDP = function (MDP1, MDP2) {
  if (MDP1 == "" || MDP2 == "" || MDP1 != MDP2 || MDP1.length < 6) {
    return false;
  } else return true;
};

//Check identifiant
exports.doubleName = function (name) {
  var double;
  double = db.prepare("SELECT id FROM user WHERE name=?").get(name);
  return double == undefined;
};

//Requête à l'API
exports.requestToApi = async function (page, gameName) {
  var apiUrl =
    "https://api.rawg.io/api/games?page_size=10&search=" +
    gameName +
    "&page=" +
    page;
  var repsonse = await fetch(apiUrl);
  var json = await repsonse.json();
  return json;
};

//Requête prescise à l'API
exports.requestInfoToApi = async function (gameName) {
  var apiUrl = "https://api.rawg.io/api/games/" + gameName;
  var repsonse = await fetch(apiUrl);
  var json = await repsonse.json();
  return json;
};

//Requête de jeu similiaire à l'API
https: exports.requestSuggestedToApi = async function (gameId) {
  var apiUrl =
    "https://api.rawg.io/api/games/" + gameId + "/suggested?page_size=25";
  var repsonse = await fetch(apiUrl);
  var json = await repsonse.json();
  return json;
};

//Requête de jeu populaires à l'API
exports.requestPopularToApi = async function () {
  var apiUrl =
    "https://api.rawg.io/api/games?dates=2020-01-01,2020-12-31&ordering=-added&page_size=25";
  var repsonse = await fetch(apiUrl);
  var json = await repsonse.json();
  return json;
};

//Ajout Photo
exports.addPhoto = function (link, userId) {
  //Supprime si jamais on veut la modifier et pas juste ajouter
  db.prepare("DELETE from profilePictures WHERE userId=?").run(userId);
  db.prepare("INSERT INTO profilePictures VALUES (@userId, @link)").run({
    userId: userId,
    link: link,
  });
};

//Recherche de photo
exports.getImageById = function (userId) {
  var image;
  image = db
    .prepare("SELECT link FROM profilePictures WHERE userId=?")
    .get(userId);
  return image;
};

//Ajoute un jeu à la liste d'un utilisateur
exports.addGame = function (gameId, gameName, uid) {
  var name = gameName;
  db.prepare("DELETE from game WHERE userId=? AND name=? AND id=?").run(
    uid,
    name,
    gameId
  );
  db.prepare("INSERT INTO  game VALUES (@id,@name,@userId)").run({
    id: gameId,
    name: name,
    userId: uid,
  });
};

//Retourne tout les jeux d'un utilisateur
exports.getGamesById = function (userId) {
  var games = db.prepare("Select name from game where userId=?").all(userId);
  return games;
};

//Supprime un jeu de la liste de l'utilisateur
exports.deleteGameById = function (gameName, userId) {
  var game = gameName;
  db.prepare("DELETE from game WHERE userId=?AND name=?").run(userId, game);
};

//Ajout un favoris
exports.addFav = function (gameName, userId) {
  var name = gameName;
  db.prepare("DELETE from favorites WHERE userId=? AND gameName=?").run(
    userId,
    name
  );
  db.prepare("INSERT INTO  favorites VALUES (@userId,@name)").run({
    userId: userId,
    name: name,
  });
};

//Supprime un favoris
exports.deleteFav = function (gameName, userId) {
  var game = gameName;
  db.prepare("DELETE from favorites WHERE userId=?AND gameName=?").run(
    userId,
    game
  );
};

//Retourne les favoris de l'utilisateur
exports.getFavById = function (userId) {
  var games = db
    .prepare("Select gameName from favorites where userId=?")
    .all(userId);
  return games;
};

//Retourne un user selon son nom
exports.getUserIdByName = function (name) {
  var user = db.prepare("SELECT id FROM user WHERE name=?").get(name);
  return user;
};

//Retourne tout les utilisateurs du site
exports.getUSERS = function () {
  var users = db.prepare("SELECT id,name FROM user").all();
  return users;
};

//Retourne les admins du site
exports.getAdmins = function () {
  var admins = db.prepare("SELECT id FROM admin").get();
  return admins.id;
};

//Suppression du compte
exports.deleteProfile = function (userId) {
  db.prepare("DELETE FROM user WHERE id=?").run(userId);
  db.prepare("DELETE FROM game WHERE userId=?").run(userId);
  db.prepare("DELETE FROM profilePictures WHERE userId=?").run(userId);
  db.prepare("DELETE FROM favorites WHERE userId=?").run(userId);
};

//Trouve les utilisateurs ayant des jeux en commun avec la personne connectée
exports.getByAffinity = function (userId) {
  var users = db
    .prepare(
      "SELECT name FROM user WHERE id IN (SELECT userId FROM game WHERE name IN(SELECT name FROM game WHERE userId=?))GROUP BY id HAVING id<>?"
    )
    .all(userId, userId);
  return users;
};

//Trouve les jeux en commun avec un autre utilisateur
exports.getCommons = function (targetId, userId) {
  var users = db
    .prepare(
      "SELECT name FROM game WHERE  userId =? AND name IN(SELECT name FROM game WHERE userId=?)"
    )
    .all(targetId, userId);
  return users;
};

//Ajoute une description a la base de donnée
exports.addDescription = function (desc, userId) {
  db.prepare("DELETE from descriptions WHERE userId=?").run(userId);
  db.prepare("INSERT INTO descriptions VALUES (@userId, @desc)").run({
    userId: userId,
    desc: desc,
  });
};

//Retourne la description d'un utilisateur selon son id
exports.getDescriptionById = function (userId) {
  var desc;
  if (
    db.prepare("SELECT userId FROM descriptions WHERE userId=?").get(userId) !=
    undefined
  ) {
    desc = db
      .prepare("SELECT desc FROM descriptions WHERE userId=?")
      .get(userId).desc;
  }
  return desc;
};

//Ajoute un ami a la liste d'amis de l'utilisateur
exports.addFriends = function (userId, userName, friendName) {
  var alreadyRequestFriend = db
    .prepare("SELECT * FROM friends WHERE id=? AND friendName=?")
    .all(userId, friendName);
  if (alreadyRequestFriend.length == 0) {
    db.prepare(
      "INSERT INTO friends VALUES(@id,@userName,@friendName,@accepted)"
    ).run({
      id: userId,
      userName: userName,
      friendName: friendName,
      accepted: 0,
    });
  }
};

//Retourne tout les amis ayant accepter la demande
exports.getFriends = function (userId) {
  var friends = db
    .prepare("SELECT friendName FROM friends WHERE accepted=1 AND id=?")
    .all(userId);
  return friends;
};

//Retourne toutes les demandes
exports.getRequest = function (userName) {
  var requests = db.prepare("SELECT * FROM friends").all();
  var friends = db
    .prepare("SELECT userName FROM friends WHERE accepted=0 AND friendName=?")
    .all(userName);
  return friends;
};

//Accepter la demande d'un utilisateur
exports.acceptRequest = function (userId, friendName, userName) {
  var friendId = db.prepare("SELECT id from user WHERE name=?").get(friendName)
    .id;
  db.prepare(
    "DELETE  FROM friends WHERE id=@id AND friendName=@friendName"
  ).run({
    id: friendId,
    friendName: userName,
  });
  db.prepare(
    "INSERT INTO friends VALUES (@id,@userName,@friendName,@accepted)"
  ).run({
    id: friendId,
    userName: friendName,
    friendName: userName,
    accepted: 1,
  });

  db.prepare(
    "INSERT INTO friends VALUES (@id,@userName,@friendName,@accepted)"
  ).run({
    id: userId,
    userName: userName,
    friendName: friendName,
    accepted: 1,
  });
};

//Supprimer un utilisateur
exports.deleteFriends = function (userId, friendName, userName) {
  var friendId = db.prepare("SELECT id from user WHERE name=?").get(friendName)
    .id;
  db.prepare(
    "DELETE  FROM friends WHERE id=@id AND friendName=@friendName"
  ).run({
    id: friendId,
    friendName: userName,
  });
  db.prepare(
    "DELETE  FROM friends WHERE id=@id AND friendName=@friendName"
  ).run({
    id: userId,
    friendName: friendName,
  });
};
