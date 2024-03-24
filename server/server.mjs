import express from "express";
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const port = 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.post('/generate-image', async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        "prompt": req.body.prompt,
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

    // Assuming the API returns a JSON object with the image data encoded in Base64
    const jsonResponse = await response.json();
    // Extract the Base64 image data. Adjust the path according to the actual response structure.
    // For example, if the response structure is { images: [base64ImageData] }
    const base64ImageData = jsonResponse.images[0];
    // Convert Base64 to binary
    const imageData = Buffer.from(base64ImageData, 'base64');
    const timestamp = Date.now();
    const imageName = `image_${timestamp}.png`;
    const outputPath = path.join(__dirname, '..', 'output', 'txt2img', imageName);

    fs.writeFile(outputPath, imageData, (err) => {
      if (err) {
        console.error('Error writing image file:', err);
        res.status(500).json({message: 'Error generating or saving the image.'});
      } else {
        console.log(`Image saved at: ${outputPath}`);
        const imageUrl = `/output/txt2img/${imageName}`;
        res.json({
          images: [imageUrl],
          parameters: {}, // This can be populated based on the response or request
          info: "Image generated and saved successfully!"
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({message: 'Error generating or saving the image.'});
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
