// db.js
const mysql = require('mysql2');

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost', // Your MySQL host, usually 'localhost'
    user: 'root',      // Your MySQL username
    password: '',      // Your MySQL password
    database: 'Micro_project',  // Your database name (ensure 'blog' exists in MySQL)
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

module.exports = db;
