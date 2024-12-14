const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');  // bcrypt for password hashing
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Micro_project', // Change this to your database name
});

db.connect(err => {
    if (err) {
        console.log('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL!');
    }
});

// Register Route (for new users)
app.post('/api/register', (req, res) => {
    const { username, email, password, role } = req.body;

    // Hash the password before saving to DB
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send({ error: 'Error hashing password' });
        }

        // Insert the new user into the database
        const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
        db.query(query, [username, email, hashedPassword, role], (err, result) => {
            if (err) {
                return res.status(500).send({ error: 'Error registering user' });
            }
            res.status(201).send({ message: 'User registered successfully' });
        });
    });
});

// Login Route (for existing users)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Query to check if the user exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        const user = results[0];

        // Check if the password matches the hashed password in the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(400).send({ error: 'Invalid password' });
            }

            // Send response with user data and role
            res.json({ user: { id: user.id, username: user.username, role: user.role } });
        });
    });
});

// Protected route for admins to create posts
app.post('/api/posts', (req, res) => {
    const { title, content, userId } = req.body;

    // Query to check if the user is an admin
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err || results.length === 0 || results[0].role !== 'admin') {
            return res.status(403).send({ error: 'Only admins can create posts' });
        }

        // Insert the post into the database
        const query = 'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)';
        db.query(query, [title, content, userId], (err, result) => {
            if (err) {
                return res.status(500).send({ error: 'Error creating post' });
            }
            res.status(201).send({ message: 'Post created successfully', postId: result.insertId });
        });
    });
});

// Get all posts (for all users, including admins)
app.get('/api/posts', (req, res) => {
    db.query('SELECT * FROM posts', (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Error fetching posts' });
        }
        res.json(results); // Send the posts as JSON to the frontend
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
