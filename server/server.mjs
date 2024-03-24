// Your main server file (e.g., server.js or app.js)

import express from "express";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import ImageGenerator from './components/ImageGenerator.js'; // Import the ImageGenerator

const app = express();
const port = 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'output', 'txt2img'); // Define the output directory

const imageGenerator = new ImageGenerator(outputDir); // Create an instance of ImageGenerator

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-image', async (req, res) => {
  try {
    // Pass the entire request body as parameters to the image generator
    const { imageUrl, info } = await imageGenerator.generateImage(req.body);
    res.json({ images: [imageUrl], info });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating or saving the image.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
