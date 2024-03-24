// server.mjs

import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import ImageGenerator from './components/ImageGenerator.js'; // Existing ImageGenerator import
import VideoGenerator from './components/VideoGenerator.js'; // Import the VideoGenerator

const app = express();
const port = 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Output directories for images and videos
const imageOutputDir = path.join(__dirname, '..', 'output', 'txt2img');
const videoOutputDir = path.join(__dirname, '..', 'output', 'txt2vid');

// Instantiate both generators
const imageGenerator = new ImageGenerator(imageOutputDir);
const videoGenerator = new VideoGenerator(videoOutputDir); // Create an instance of VideoGenerator

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Existing route for image generation
app.post('/generate-image', async (req, res) => {
  try {
    const { imageUrl, info } = await imageGenerator.generateImage(req.body);
    res.json({ images: [imageUrl], info });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating or saving the image.' });
  }
});

// New route for video generation
app.post('/generate-video', async (req, res) => {
  try {
    const { videoUrl, info } = await videoGenerator.generateVideo(req.body);
    res.json({ videos: [videoUrl], info });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating or saving the video.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
