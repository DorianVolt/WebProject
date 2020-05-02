"use strict"
const Sqlite = require('../node_modules/better-sqlite3');

let db = new Sqlite('db.sqlite');
var fetch = require("node-fetch");

//Connexion
exports.login = function (name, password) {
    var user = db.prepare('SELECT id FROM user WHERE name=? AND password=?').get(name, password);
    if (user == undefined) {
        return -1;
    }
    if (user.id != undefined) {
        return user.id;
    }
    return -1;
}

//Inscription
exports.register = function (name, password) {
    db.prepare('INSERT INTO user VALUES (@id, @name, @password)').run({ id: null, name: name, password: password });
}

//Infos d'un profil
exports.printProfil = function (id) {
    var user = db.prepare('SELECT name FROM user WHERE id=?').get(id);
    return user.name;
}

//Check MDP(pas identique ou trop court)
exports.testMDP = function (MDP1, MDP2) {
    if (MDP1 == "" || MDP2 == "" || MDP1 != MDP2 || MDP1.length < 6) {
        return false;
    } else return true;
}

//Check identifiant
exports.doubleName = function (name) {
    var double;
    double = db.prepare('SELECT id FROM user WHERE name=?').get(name);
    return double == undefined
}

//Requête à l'API
exports.requestToApi = async function (page, gameName) {
    var apiUrl = "https://api.rawg.io/api/games?page_size=10&search=" + gameName + "&page=" + page;
    var repsonse = await fetch(apiUrl)
    var json = await repsonse.json();
    return json;
}

//Ajout Photo
exports.addPhoto =  function (link,userId) {
    //Supprime si jamais on veut la modifier et pas juste ajouter
    db.prepare('DELETE from profilePictures WHERE userId=?').run(userId)
    db.prepare('INSERT INTO profilePictures VALUES (@userId, @link)').run({ userId: userId, link: link});
}

//Recherche de photo
exports.getImageById = function (userId) {
    var image;
    image = db.prepare('SELECT link FROM profilePictures WHERE userId=?').get(userId);
    return image
}

//Ajoute un jeu à la liste d'un utilisateur
exports.addGame = function (gameId, gameName, uid) {
    //Supprime le charactère ":" du nom car il empêche l'insertion 
    var name = gameName.slice(1)
    db.prepare('DELETE from game WHERE userId=? AND name=? AND id=?').run(uid,name,gameId)
    db.prepare('INSERT INTO  game VALUES (@id,@name,@userId)').run({ id: gameId, name: name, userId: uid });
}

//Retourne tout les jeux d'un utilisateur
exports.getGamesById = function (userId) {
    var games = db.prepare('Select name from game where userId=?').all(userId)
    return games
}

//Supprime un jeu de la liste de l'utilisateur
exports.deleteGameById = function (gameName, userId) {
    var game = gameName.slice(1)
    db.prepare('DELETE from game WHERE userId=?AND name=?').run(userId, game);
}

//Ajout un favoris
exports.addFav = function(gameName,userId){
    var name = gameName.slice(1)
    db.prepare('DELETE from favorites WHERE userId=? AND gameName=?').run(userId,name)
    db.prepare('INSERT INTO  favorites VALUES (@userId,@name)').run({ userId: userId, name: name});
}

//Supprime un favoris
exports.deleteFav = function (gameName, userId) {
    var game = gameName.slice(1)
    db.prepare('DELETE from favorites WHERE userId=?AND gameName=?').run(userId, game);
}

//Retourne les favoris de l'utilisateur
exports.getFavById = function (userId) {
    var games = db.prepare('Select gameName from favorites where userId=?').all(userId)
    return games
}

//Retourne un user selon son nom
exports.getUserIdByName = function(name){
    var user = db.prepare('SELECT id FROM user WHERE name=?').get(name);
    return user
}

//Retourne tout les utilisateurs du site
exports.getUSERS = function() {
    var users = db.prepare('SELECT id,name FROM user').all()
    return users
}

//Suppression du compte

exports.deleteProfile = function(userId) {
    db.prepare('DELETE FROM user WHERE id=?').run(userId)
    db.prepare('DELETE FROM game WHERE userId=?').run(userId)
    db.prepare('DELETE FROM profilePictures WHERE userId=?').run(userId)
    db.prepare('DELETE FROM favorites WHERE userId=?').run(userId)
}
