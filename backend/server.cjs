require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const axios = require('axios'); // Import axios for making HTTP requests
const app = express();
app.use(express.json());

// MongoDB connection using Cosmocloud secret
const connectToMongoDB = async () => {
    const uri = `mongodb+srv://${process.env.PUBLIC_KEY}:${process.env.PRIVATE_KEY}@cluster0.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;

    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        return client.db(process.env.DATABASE_NAME);  // Database name: ClipDB
    } catch (error) {
        console.error('MongoDB connection error', error);
        throw error;
    }
};

// Example route to fetch videos
app.get('/videos', async (req, res) => {
    try {
        const db = await connectToMongoDB();
        const videosCollection = db.collection('videos');
        const videos = await videosCollection.find().toArray();
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).send('Error fetching videos');
    }
});

// Example route to add a video
app.post('/videos', async (req, res) => {
    const newVideo = req.body; // Assuming the video data is sent in the request body
    try {
        const db = await connectToMongoDB();
        const videosCollection = db.collection('videos');
        const result = await videosCollection.insertOne(newVideo);
        res.status(201).json({ message: 'Video added successfully', id: result.insertedId });
    } catch (error) {
        console.error('Error adding video:', error);
        res.status(500).send('Error adding video');
    }
});

// New route to search videos using Atlas Search
app.post('/videos/search', async (req, res) => {
    const searchQuery = req.body; // Assuming the search query is sent in the request body
    try {
        const response = await axios.post(`https://free-ap-south-1.cosmocloud.io/development/api/videos/search`, searchQuery, {
            headers: {
                'Environment-ID': process.env.ENVIRONMENT_ID, // Add your Environment ID here
                'Content-Type': 'application/json',
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).send('Error searching videos');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
