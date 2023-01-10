const express = require('express');
const app = express();

const connectDB = require('./db/connect');
require('dotenv').config();
const notFound = require('./middleware/not-found');
const path = require('path');
const passport = require('passport');
const passportLocal = require('passport-local');
const expressSession = require('express-session');

const User = require('./models/User');
const Place = require('./models/Place');

app.use(express.json());

//Express session config
app.use(expressSession({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

//Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const LocalStrategy = passportLocal.Strategy;
passport.use(new LocalStrategy(User.authenticate()));

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
})

app.get('/signup', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/sign-up-page.html'));
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/login', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/login-page.html'));
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/getusers', async (req, res) => {
    try {
        const { email, username } = req.query;
        const users = await User.find({ email: email, username: username });

        res.status(200).json({ users });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.post('/signup', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const newUser = await User.register(new User({
            email: email,
            username: username
        }), password);

        passport.authenticate('local')(req, res, () => {
            res.redirect('/');
        });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/getplaces',
    failureRedirect: '/login'
}))

app.get('/logout', async (req, res) => {
    try {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/login');
        });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        console.log('authenticated');
        return next();
    }
    else {
        console.log('not authenticated')
        res.redirect('/login');
    }
}

app.get('/', isLoggedIn, async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/homepage.html'));
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/getplaces', isLoggedIn, async (req, res) => {
    try {
        const { experienceRating, expenseRating, placeName, cityName, countryName, } = req.query;
        const queryObject = {};

        if (experienceRating) {
            queryObject.experienceRating = parseInt(experienceRating);
        }

        if (expenseRating) {
            queryObject.expenseRating = parseInt(expenseRating);
        }

        if (placeName) {
            queryObject.placeName = { $regex: placeName, $options: 'i' };
        }

        if (cityName) {
            queryObject.cityName = { $regex: cityName, $options: 'i' };
        }

        if (countryName) {
            queryObject.countryName = { $regex: countryName, $options: 'i' };
        }

        queryObject.owner = req.user._id;

        const places = await Place.find(queryObject);
        res.status(200).json({ places });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/getplace/:id', isLoggedIn, async (req, res) => {
    try {
        const { id: placeID } = req.params;
        const place = await Place.findOne({ _id: placeID, owner: req.user._id });

        if (!place) {
            return res.status(404).json({ "error": "Place does not exist" });
        }

        res.status(200).json({ place });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/addplace', isLoggedIn, async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/add-place.html'))
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
});

app.post('/addplace', isLoggedIn, async (req, res) => {
    try {
        const { placeName, cityName, countryName, stateName, arrivalDate, experienceRating, expenseRating } = req.body;
        const placeToBeAdded = {
            placeName: placeName,
            cityName: cityName,
            countryName: countryName,
            stateName: stateName,
            arrivalDate: arrivalDate,
            experienceRating: experienceRating,
            expenseRating: expenseRating,
            owner: req.user._id
        }

        const place = await Place.create(placeToBeAdded);
        res.status(201).json({ place });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/editplace/:id', isLoggedIn, async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/edit-place.html'));
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.patch('/editplace/:id', isLoggedIn, async (req, res) => {
    try {
        const { id: placeID } = req.params;
        const place = await Place.findOneAndUpdate({ _id: placeID, owner: req.user._id }, req.body, {
            new: true,
            runValidators: true
        });

        if (!place) {
            return res.status(404).json({ "error": "Place does not exist" });
        }

        res.status(200).json({ place });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/viewplace/:id', isLoggedIn, async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/view-place.html'));
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.delete('/deleteplace/:id', isLoggedIn, async (req, res) => {
    try {
        const { id: placeID } = req.params;
        const placeToBeDeleted = await Place.findOneAndDelete({ _id: placeID, owner: req.user._id });

        if (!placeToBeDeleted) {
            return res.status(404).json({ "error": "Place does not exist" });
        }

        res.status(200).json({ placeToBeDeleted });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error)
    }
})

app.use(notFound);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server listening on Port ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
}

start();