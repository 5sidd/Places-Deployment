const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
    placeName: {
        type: String,
        required: [true, 'Please provide a place name']
    },
    cityName: {
        type: String,
        required: false,
        default: ''
    },
    countryName: {
        type: String,
        required: [true, 'Please provide a country name']
    },
    stateName: {
        type: String,
        required: false,
        default: ''
    },
    arrivalDate: {
        type: Date,
        required: [true, 'Please provide an arrival date']
    },
    experienceRating: {
        type: Number,
        required: [true, 'Please provide an experience rating']
    },
    expenseRating: {
        type: Number,
        required: [true, 'Please provide an expense rating']
    }
});

module.exports = mongoose.model('Place', PlaceSchema);