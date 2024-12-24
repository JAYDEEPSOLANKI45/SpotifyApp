const express = require('express');
const app = express();
const session = require('express-session');
const dotenv = require('dotenv');
const axios = require('axios');
const qs = require('qs'); // To format data for x-www-form-urlencoded

dotenv.config();

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 3600 * 1000,
        httpOnly: true
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route to redirect user to Spotify authorization page with scopes
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email user-library-read playlist-read-private user-top-read'; // Add other scopes as needed
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + process.env.CLIENT_ID +
        '&scope=' + encodeURIComponent(scope) +
        '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_URL));
});

// Callback route to handle authorization code and exchange for access token
app.get('/', async (req, res) => {
    console.log("Authorization callback");
    req.session.authorizationCode = req.query.code;

    const data = qs.stringify({
        code: req.query.code,
        redirect_uri: process.env.REDIRECT_URL,
        grant_type: 'authorization_code'
    });
    console.log(data);

    const headers = {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')
    };

    try {
        const result = await axios.post("https://accounts.spotify.com/api/token", data, { headers });
        const accessToken = result.data.access_token;
        req.session.accessToken = accessToken;
        // res.redirect("/top-tracks");
        res.send("AuthCode & accessToken saved");
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }
        res.status(error.response.status).send(error.response.data);
    }
});

// Route to show account information
app.get('/account', async (req, res) => {
    const accessToken = req.session.accessToken;
    if (!accessToken) {
        return res.status(401).send('Access token not found. Please log in first.');
    }

    const headers = { 'Authorization': `Bearer ${accessToken}` };

    try {
        const response = await axios.get('https://api.spotify.com/v1/me', { headers });
        console.log('User Profile:', response.data);
        res.json(response.data); // Display user profile information as JSON
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }
        res.status(error.response.status).send(error.response.data);
    }
});

app.get('/top-tracks', async (req, res) => {
    const accessToken = req.session.accessToken;
    if (!accessToken) {
        return res.status(401).send('Access token not found. Please log in first.');
    }

    const headers = { 'Authorization': `Bearer ${accessToken}` };

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=5', { headers });
        console.log('Top 5 Tracks:', response.data.items);
        res.json(response.data.items); // Display top 5 tracks as JSON
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
            console.error('Data:', error.response.data);
        }
        res.status(error.response.status).send(error.response.data);
    }
});


app.listen(8080, () => {
    console.log('Listening on port 8080');
});
