"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

//Recréé une base données de zéro (efface tout les utilsateurs sauvegardés)
var load = function (filename) {

    db.prepare('DROP TABLE IF EXISTS user').run();

    db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();

    db.prepare('DROP TABLE IF EXISTS game').run();

    db.prepare('CREATE TABLE game (id INTEGER, name TEXT, userId INTEGER)').run();

    db.prepare('DROP TABLE IF EXISTS profilePictures').run();

    db.prepare('CREATE TABLE profilePictures (userId INTEGER PRIMARY KEY, link BLOB)').run();

}

load('db.sqlite');