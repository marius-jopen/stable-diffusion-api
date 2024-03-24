// src/components/PromptForm.js
import React, { useState } from 'react';

export default function PromptForm() {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
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
      <label htmlFor="prompt">Enter your prompt:</label>
      <input
        type="text"
        id="prompt"
        name="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        required
      />
      <input type="submit" value="Generate Image" />
    </form>
  );
}
