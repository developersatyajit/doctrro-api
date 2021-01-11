
const bluebird = require('bluebird');
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  debug: ['ComQueryPacket', 'RowDataPacket']
});

const db = bluebird.promisifyAll(connection);

// db.queryAsync("SELECT * FROM news").then(function(rows){
// 	console.log(rows);
// });

// open the MySQL connection
connection.connect(error => {
  if (error) {
    throw error;
  }
  console.log("Successfully connected to the database.");
});

module.exports = db;