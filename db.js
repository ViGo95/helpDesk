const mysql = require('mysql')
const database = require('./config').database

const connection = mysql.createConnection({
    host: database.host,
    user: database.user,
    password: database.pass,
    database: database.db
})

module.exports = connection