"use strict";

const fs = require("fs");
const Sqlite = require("better-sqlite3");

let db = new Sqlite("db.sqlite");

//Recréé une base données de zéro (efface tout les utilsateurs sauvegardés)
var load = function (filename) {
  // db.prepare('DROP TABLE IF EXISTS user').run();
  // db.prepare('DROP TABLE IF EXISTS favorites').run();
  // db.prepare('DROP TABLE IF EXISTS game').run();
  // db.prepare('DROP TABLE IF EXISTS profilePictures').run();
  //db.prepare('DROP TABLE IF EXISTS admin').run();
  //db.prepare('DROP TABLE IF EXISTS descriptions').run();
  // db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();
  // db.prepare('CREATE TABLE game (id INTEGER, name TEXT, userId INTEGER)').run();
  // db.prepare('CREATE TABLE profilePictures (userId INTEGER PRIMARY KEY, link BLOB)').run();
  // db.prepare('CREATE TABLE favorites (userId INTEGER , gameName TEXT)').run();
  // db.prepare('CREATE TABLE admin (id INTEGER PRIMARY KEY AUTOINCREMENT)').run();
  //db.prepare('CREATE TABLE descriptions (userId INTEGER, desc TEXT)').run();
  //db.prepare('INSERT INTO admin VALUES(@id)').run({id:1})
};

load("db.sqlite");
