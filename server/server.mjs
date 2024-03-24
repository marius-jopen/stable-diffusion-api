import express from "express";
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json()); // For parsing application/json

// Serve the HTML Form at the root URL
app.get('/', (req, res) => {
  res.send('API is running. Use POST /generate-image to generate an image.');
});

// Handle the image generation
app.post('/generate-image', async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        "prompt": "girl",
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
