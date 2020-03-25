"use strict"

const fs = require('fs');
const Sqlite3 = require('sqlite3');

const dbname = 'main.db'

let db = new Sqlite3.Database(dbname, err => {
    if (err)
        throw err
    console.log('Database stated on ' + dbname)

    //db.run('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)')
    db.run('INSERT INTO user VALUES (@id, @name, @password)', [2, "zobi", "13"])
    db.get('SELECT name FROM user WHERE id=2', (err, data) => {
        if (err)
            throw err;
        console.log(data);
    })
})

