const mysql = require("mysql2");
const { dbConfig } = require('./config');

const connection = mysql.createConnection(dbConfig);

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the DB:', err.stack);
    return;
  }
  console.log('Connected to the DB');
});

module.exports = connection;
