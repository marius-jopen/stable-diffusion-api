// server.mjs

import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import ImageGenerator from './components/ImageGenerator.js'; // Existing ImageGenerator import
import VideoGenerator from './components/VideoGenerator.js'; // Import the VideoGenerator
import BundestagGenerator from './components/BundestagGenerator.js'; // Import the BundestagGenerator
import BundestagLooper from './components/BundestagLooper.js'; // Import the new component

const app = express();
const port = 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Output directories for images and videos
const imageOutputDir = path.join(__dirname, '..', 'output', 'txt2img');

// The correct path for the Bundestag output directory
const bundestagOutputDir = 'E:\\output\\sd-api';

// Instantiate both generators
const imageGenerator = new ImageGenerator(imageOutputDir);
const videoGenerator = new VideoGenerator(); // Create an instance of VideoGenerator
const bundestagGenerator = new BundestagGenerator(bundestagOutputDir); // Create an instance of BundestagGenerator


// Adjust the path to your actual base directory for the Bundestag images
const baseDir = 'E:\\output\\sd-api';
const bundestagLooper = new BundestagLooper(baseDir);

// Serve images dynamically from their path
app.get('/images/*', (req, res) => {
  const filePath = req.params[0].replace(/\\/g, '/'); // Ensure we use forward slashes
  const absolutePath = path.join(baseDir, filePath);
  res.sendFile(absolutePath, (err) => {
    if (err) {
      console.log(err);
      res.status(404).send('Image not found');
    }
  });
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Add a new route to serve the images
app.get('/list-bundestag-images', async (req, res) => {
  try {
    const images = await bundestagLooper.findAllPngImages();
    res.json(images);
  } catch (error) {
    console.error('Error listing Bundestag images:', error);
    res.status(500).json({ message: 'Error listing Bundestag images.' });
  }
});


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

// New route for bundestag generation
app.post('/generate-bundestag', async (req, res) => {
  try {
    const { btUrl, info } = await bundestagGenerator.generateBundestag(req.body);
    res.json({ bts: [btUrl], info });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating or saving the video.' });
  }
});

// New route for Bundestag image generation
app.post('/generate-bundestag-image', async (req, res) => {
  try {
    const { imageUrl, info } = await bundestagGenerator.generateImage(req.body);
    res.json({ images: [imageUrl], info });
  } catch (error) {
    console.error('Error in generate-bundestag-image:', error);
    res.status(500).json({ message: 'Error generating or saving the Bundestag image.' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
