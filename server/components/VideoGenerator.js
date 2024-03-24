import fetch from 'node-fetch';

class VideoGenerator {
  constructor(outputDir) {
    this.outputDir = outputDir;
  }

  async generateVideo(parameters) {
    try {
      // Dynamically set the batch_name or other parameters
      const currentTime = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      const batchName = `Video_${currentTime}`;

      // Override or add specific settings within deforum_settings
      const modifiedParameters = {
        ...parameters,
        deforum_settings: {
          ...parameters.deforum_settings,
          batch_name: batchName, // Override the batch_name with the server-generated one
          // Add or modify other parameters as needed
        },
      };

      const response = await fetch("http://127.0.0.1:7860/deforum_api/batches", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modifiedParameters)
      });

      const jsonResponse = await response.json();
      console.log(jsonResponse); // Log the entire response
      
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
