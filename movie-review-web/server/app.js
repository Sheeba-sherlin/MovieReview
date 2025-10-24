const express = require('express');
const bodyParser = require('body-parser');
const movieRoutes = require('./routes/movies');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// expose server/data as static so frontend fallback can fetch it
app.use('/server/data', express.static(path.join(__dirname, 'data')));

// Routes
app.use('/api/movies', movieRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});