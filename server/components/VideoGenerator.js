import fetch from 'node-fetch';

class VideoGenerator {
  constructor(outputDir) {
    this.outputDir = outputDir;
  }

  async generateVideo(parameters) {
    try {
      const response = await fetch("http://127.0.0.1:7860/deforum_api/batches", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...parameters, // Spread the parameters object here
        })
      });

      const jsonResponse = await response.json();
      console.log(jsonResponse); // Log the entire response
      
      // If you want to return some info or data to the caller
      return {
        message: "Check the console for the logged response.",
        info: "Operation completed successfully!"
      };
    } catch (error) {
      console.error('Error in VideoGenerator:', error);
      throw error; // Re-throw the error to handle it in the calling code
    }
  }
}

export default VideoGenerator;
