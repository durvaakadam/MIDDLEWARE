const express = require('express');
const session = require('express-session');
const path = require('path'); // Import path module
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure your views are in the 'views' directory

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
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send('Access Denied: Admins Only');
    }
}

// Middleware to check for user role
function isUser(req, res, next) {
    if (req.session.user && req.session.user.role === 'user') {
        return next();
    } else {
        return res.status(403).send('Access Denied: Users Only');
    }
}

// Login route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html')); // Adjust path if needed
});

app.post('/login', (req, res) => {
    const { username, role } = req.body;

    req.session.user = {
        username: username,
        role: role
    };

    if (role === 'admin') {
        res.redirect('/admin');
    } else {
        res.redirect('/user');
    }
});

// Admin dashboard route, accessible only by admins
app.get('/admin', checkAuth, isAdmin, (req, res) => {
    res.render('admin', { user: req.session.user }); // Pass user data to the EJS template
});

// User dashboard route, accessible only by users
app.get('/user', checkAuth, isUser, (req, res) => {
    res.render('user', { user: req.session.user }); // Pass user data to the EJS template
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/user');
        }
        res.redirect('/login');
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
