// --- 1. IMPORTS ---
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- 2. SETUP & CONFIGURATION ---
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-very-secret-key-for-jobconnect'; 

// --- 3. DATABASE CONNECTION ---
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'abhi', // IMPORTANT: Change this to your MySQL password
    database: 'jobconnect'
}).promise();

// Middleware to authenticate the JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
}


// --- 4. API ROUTES (ENDPOINTS) ---

// ## USER: REGISTER ##
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        await db.query(query, [name, email, password, role]);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// ## USER: LOGIN ##
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful!', token: token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// ## JOBS: POST A NEW JOB (PROTECTED) ##
app.post('/jobs', authenticateToken, async (req, res) => {
    try {
        const { title, description } = req.body;
        const { userId, name: companyName } = req.user;
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required.' });
        }
        const query = 'INSERT INTO jobs (title, description, company_name, user_id) VALUES (?, ?, ?, ?)';
        await db.query(query, [title, description, companyName, userId]);
        res.status(201).json({ message: 'Job posted successfully!' });
    } catch (error) {
        console.error('Post Job Error:', error);
        res.status(500).json({ message: 'Server error while posting job.' });
    }
});

// ## JOBS: GET ALL JOBS (PUBLIC) ##
app.get('/jobs', async (req, res) => {
    try {
        const query = 'SELECT title, description, company_name, created_at FROM jobs ORDER BY created_at DESC';
        const [jobs] = await db.query(query);
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Get Jobs Error:', error);
        res.status(500).json({ message: 'Server error while fetching jobs.' });
    }
});

// ## REVIEWS: GET REVIEWS WITH PAGINATION (PUBLIC) ##
app.get('/reviews', async (req, res) => {
    try {
        const companyName = req.query.company;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Default to 10 reviews per page
        const offset = (page - 1) * limit;

        let countQuery = 'SELECT COUNT(*) as total FROM reviews';
        let dataQuery = 'SELECT company_name, job_title, rating, pros FROM reviews ORDER BY rating DESC, company_name ASC LIMIT ? OFFSET ?';
        let countParams = [];
        let dataParams = [limit, offset];

        if (companyName) {
            countQuery = 'SELECT COUNT(*) as total FROM reviews WHERE company_name LIKE ?';
            dataQuery = 'SELECT company_name, job_title, rating, pros FROM reviews WHERE company_name LIKE ? ORDER BY rating DESC LIMIT ? OFFSET ?';
            countParams = [`%${companyName}%`];
            dataParams = [`%${companyName}%`, limit, offset];
        }

        // Get the total count of reviews that match the query
        const [countResult] = await db.query(countQuery, countParams);
        const totalCount = countResult[0].total;
        
        // Get the reviews for the current page
        const [reviews] = await db.query(dataQuery, dataParams);

        // Send back the reviews for the page, the total count, and current page info
        res.status(200).json({
            reviews: reviews,
            totalReviews: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page
        });

    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ message: 'Server error while fetching reviews.' });
    }
});


// --- 5. START THE SERVER ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

