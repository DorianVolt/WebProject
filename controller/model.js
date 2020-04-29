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
    //console.log(name, password);
}

//Infos d'un profil
exports.printProfil = function (id) {
    var user = db.prepare('SELECT name FROM user WHERE id=?').get(id);
    //console.log(user.name);
    return user.name;
}

//Check MDP(pas identique)
exports.testMDP = function (MDP1, MDP2) {
    if (MDP1 == "" || MDP2 == "" || MDP1 != MDP2) {
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

//Ajoute un jeu à la liste d'un utilisateur
exports.addGame = function(gameId,gameName,uid){
    db.prepare('INSERT INTO game VALUES (@id,@name,@userId)').run({ id: gameId, name: gameName,userId :uid });
}

//Retourne tout les jeux d'un utilisateur
exports.getGamesById= function (userId){
    var games = db.prepare('Select name from game where userId=?').all(userId)
    console.log(games)
    return games

}