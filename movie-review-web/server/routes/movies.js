const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load movie data from JSON file
const moviesDataPath = path.join(__dirname, '../data/movies.json');

// Get all movies
router.get('/', (req, res) => {
    fs.readFile(moviesDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load movies data.' });
        }
        const movies = JSON.parse(data);
        res.json(movies);
    });
});

// Add a review for a specific movie
router.post('/:title/review', (req, res) => {
    const movieTitle = req.params.title;
    const { review, rating } = req.body;

    fs.readFile(moviesDataPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load movies data.' });
        }
        const movies = JSON.parse(data);
        const movie = movies.find(m => m.title === movieTitle);

        if (!movie) {
            return res.status(404).json({ error: 'Movie not found.' });
        }

        // Add review and rating
        movie.reviews.push({ review, rating });
        fs.writeFile(moviesDataPath, JSON.stringify(movies, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to save review.' });
            }
            res.status(201).json({ message: 'Review added successfully!' });
        });
    });
});

module.exports = router;