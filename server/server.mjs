import express from "express";
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Define __dirname since ES modules don't provide it by default

app.use(cors());
app.use(express.json()); // For parsing application/json

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public'))); // Assuming your 'index.html' is in a directory named 'public'

// Handle the image generation
app.post('/generate-image', async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        "prompt": req.body.prompt, // Use the prompt from the request body
        "negative_prompt": "CGI, Unreal, Airbrushed, Digital",
        "seed": -1,
        "steps": 20,
        "width": 1024,
        "height": 1024,
        "cfg_scale": 7,
        "sampler_name": "DPM++ 2M Karras",
        "n_iter": 1,
        "batch_size": 1,
      })
    });

    const data = await response.json();
    console.log(data);
    res.json(data); // Send the response from the API back to the client
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({message: 'Error generating or saving the image.'});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
