"use strict"
const Sqlite = require('../node_modules/better-sqlite3');

let db = new Sqlite('db.sqlite');

//connection
exports.login = function(name, password) {

    var user = db.prepare('SELECT id FROM user WHERE name=? AND password=?').get(name, password);
    if (user.id != undefined) {
        return user.id;
    }
    return -1;
}

//recuperer les infos d'un profil
exports.printProfil = function(id) {

    var user = db.prepare('SELECT name FROM user WHERE id=?').get(id);
    console.log(user.name);
    return user.name;
}