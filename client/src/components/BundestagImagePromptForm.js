import React, { useState } from 'react';

export default function BundestagImagePromptForm() {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Parameters object includes both user-defined and fixed values
    const parameters = {
      prompt,
      negative_prompt: "",
      seed: -1,
      steps: 20,
      width: 1024,
      height: 1024,
      cfg_scale: 7,
      sampler_name: "DPM++ 2M Karras",
      n_iter: 1,
      batch_size: 1,
    };

    try {
      const response = await fetch('/generate-bundestag-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });

      if (response.ok) {
        // Handle success, maybe display the generated image or a success message
        console.log("Image generated and saved successfully!");
      } else {
        // Handle error
        console.log("Error generating or saving the image.");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>BundestagGenerate Image</h1>
      <div>
        <label htmlFor="prompt">Enter your prompt:</label>
        <input
          type="text"
          id="prompt"
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
      </div>
      <input type="submit" value="Generate Image" />
    </form>
  );
}