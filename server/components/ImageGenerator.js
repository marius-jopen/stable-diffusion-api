import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

class ImageGenerator {
  constructor(outputDir) {
    this.outputDir = outputDir;
  }

  async generateImage(parameters) {
    try {
      const response = await fetch("http://127.0.0.1:7860/sdapi/v1/txt2img", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parameters, // Spread the parameters object here
        })
      });

      const jsonResponse = await response.json();
      const base64ImageData = jsonResponse.images[0];
      const imageData = Buffer.from(base64ImageData, 'base64');
      const timestamp = Date.now();
      const imageName = `image_${timestamp}.png`;
      const outputPath = path.join(this.outputDir, imageName);

      fs.writeFileSync(outputPath, imageData);
      console.log(`Image saved at: ${outputPath}`);
      const imageUrl = `/output/txt2img/${imageName}`;
      
      return {
        imageUrl,
        info: "Image generated and saved successfully!"
      };
    } catch (error) {
      console.error('Error in ImageGenerator:', error);
      throw error; // Re-throw the error to handle it in the calling code
    }
  }
}

export default ImageGenerator;
