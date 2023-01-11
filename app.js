const express = require('express');
const app = express();

const connectDB = require('./db/connect');
require('dotenv').config();
const notFound = require('./middleware/not-found');
const path = require('path');

const Place = require('./models/Place');
app.use(express.json());

app.get('/', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/homepage.html'));
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/getplaces', async (req, res) => {
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

        const places = await Place.find(queryObject);
        res.status(200).json({ places });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/getplace/:id', async (req, res) => {
    try {
        const { id: placeID } = req.params;
        const place = await Place.findOne({ _id: placeID });

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

app.get('/addplace', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/add-place.html'))
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
});

app.post('/addplace', async (req, res) => {
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
        }

        const place = await Place.create(placeToBeAdded);
        res.status(201).json({ place });
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.get('/editplace/:id', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/edit-place.html'));
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.patch('/editplace/:id', async (req, res) => {
    try {
        const { id: placeID } = req.params;
        const place = await Place.findOneAndUpdate({ _id: placeID }, req.body, {
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

app.get('/viewplace/:id', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '/frontend/view-place.html'));
    }
    catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
})

app.delete('/deleteplace/:id', async (req, res) => {
    try {
        const { id: placeID } = req.params;
        const placeToBeDeleted = await Place.findOneAndDelete({ _id: placeID });

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