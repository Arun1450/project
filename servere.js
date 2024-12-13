const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Your database password
    database: 'college_portal', // Your database name
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to the database.');
    }
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(400).send('User not found');
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                return res.status(400).send('Invalid credentials');
            }

            const token = jwt.sign({ id: user.id, userType: user.userType }, 'your-secret-key', {
                expiresIn: '1h',
            });
            res.json({ token });
        });
    });
});

// Register endpoint
app.post('/register', (req, res) => {
    const { fullName, email, password, userType } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        db.query('INSERT INTO users (fullName, email, password, userType) VALUES (?, ?, ?, ?)', 
        [fullName, email, hash, userType], (err, result) => {
            if (err) throw err;
            res.send('User registered successfully');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
