const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Start Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
    }
};

startServer();
