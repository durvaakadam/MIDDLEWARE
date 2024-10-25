const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to check if the user is authenticated
function checkAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

// Middleware to check for admin role
function isAdmin(req, res, next) {
    if (req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send('Access Denied: Admins Only');
    }
}

// Middleware to check for user role
function isUser(req, res, next) {
    if (req.session.user.role === 'user') {
        return next();
    } else {
        return res.status(403).send('Access Denied: Users Only');
    }
}

// Login route
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});

app.post('/login', (req, res) => {
    const { username, role } = req.body;

    if (role !== 'admin' && role !== 'user') {
        return res.status(400).send('Invalid role selected.');
    }

    // Set session with user details
    req.session.user = { username, role };

    // Redirect to the appropriate dashboard based on role
    if (role === 'admin') {
        res.redirect('/admin');
    } else {
        res.redirect('/user');
    }
});

// Admin dashboard route, accessible only by admins
app.get('/admin', checkAuth, isAdmin, (req, res) => {
    res.send('<h1>Welcome to the Admin Dashboard</h1><a href="/logout">Logout</a>');
});

// User dashboard route, accessible only by users
app.get('/user', checkAuth, isUser, (req, res) => {
    res.send('<h1>Welcome to the User Dashboard</h1><a href="/logout">Logout</a>');
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
