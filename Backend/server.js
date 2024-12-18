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

            // Send user data and role in the response
            res.json({ user: { id: user.id, username: user.username, role: user.role } });
        });
    });
});

// Route to create posts (no userId required anymore)
app.post('/api/posts', (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send({ error: 'Title and content are required' });
    }

    // Insert the post into the database
    const query = 'INSERT INTO posts (title, content) VALUES (?, ?)';
    db.query(query, [title, content], (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Error creating post' });
        }
        res.status(201).send({ message: 'Post created successfully', postId: result.insertId });
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

// Update an existing post
app.put('/api/posts/:id', (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id;

    // Validate input
    if (!title || !content) {
        return res.status(400).send({ error: 'Title and content are required' });
    }

    // Update the post in the database
    const query = 'UPDATE posts SET title = ?, content = ? WHERE id = ?';
    db.query(query, [title, content, postId], (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Error updating post' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'Post not found' });
        }
        res.status(200).send({ message: 'Post updated successfully' });
    });
});

// Fetch comments for a specific post
app.get('/api/posts/:postId/comments', (req, res) => {
    const { postId } = req.params;

    // Fetch comments from the database for this post
    db.query('SELECT * FROM comments WHERE post_id = ?', [postId], (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Error fetching comments' });
        }
        res.json(results); // Send the comments as JSON to the frontend
    });
});

// Add a comment for a specific post
app.post('/api/posts/:postId/comments', (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    // Logging received data for debugging
    console.log(`Received comment for postId ${postId}: ${content}`);

    // Validate that content is provided
    if (!content) {
        console.log('No content provided');
        return res.status(400).send({ error: 'Comment content is required' });
    }

    // Insert the comment into the database
    const query = 'INSERT INTO comments (post_id, content) VALUES (?, ?)';
    db.query(query, [postId, content], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send({ error: 'Error adding comment' });
        }
        console.log('Comment added successfully');
        res.status(201).send({ message: 'Comment added successfully' });
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
