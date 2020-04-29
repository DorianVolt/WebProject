"use strict"

const fs = require('fs');
const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

var load = function (filename) {

    db.prepare('DROP TABLE IF EXISTS user').run();

    db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();

    var insert4 = db.prepare('INSERT INTO user VALUES (@id, @name, @password)');

    insert4.run({ id: 2, name: "zobi", password: "1" });
}

load('db.sqlite');