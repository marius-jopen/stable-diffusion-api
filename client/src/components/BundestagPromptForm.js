import React, { useState } from 'react';

export default function BundestagPromptsForm() {
  // Update initial state to include a negativePrompt field
  const [maxFrames, setMaxFrames] = useState('');
  const [positivePrompts1] = useState('');
  const [negativePrompts1] = useState('');
  const [positivePrompts2, setPositivePrompts2] = useState('');
  const [negativePrompts2, setNegativePrompts2] = useState('');
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const keyframe = Math.floor(parseInt(maxFrames, 10) / 4);

    const parameters = {
      deforum_settings: {
        "prompts": {
          "0": positivePrompts1 + " --neg " + negativePrompts1,
          [keyframe.toString()]: positivePrompts2 + " --neg " + negativePrompts2  // Use the calculated keyframe
        },
        "max_frames": parseInt(maxFrames, 10),
      }
    };

    try {
      const response = await fetch('/generate-bundestag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });

      if (response.ok) {
        console.log("Video generated and saved successfully!");
      } else {
        console.log("Error generating or saving the video.");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Bundestag Video</h1>
      {/* <div>
        <label htmlFor="maxFrames">Positive Prompts 1:</label>
        <input
          type="text"
          id="positivePrompts1"
          name="positivePrompts1"
          value={positivePrompts1}
          onChange={(e) => setPositivePrompts1(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="maxFrames">Negative Prompts 1:</label>
        <input
          type="text"
          id="negativePrompts1"
          name="negativePrompts1"
          value={negativePrompts1}
          onChange={(e) => setNegativePrompts1(e.target.value)}
        />
      </div> */}
      <div>
        <label htmlFor="maxFrames">Positive Prompts 2:</label>
        <input
          type="text"
          id="positivePrompts2"
          name="positivePrompts2"
          value={positivePrompts2}
          onChange={(e) => setPositivePrompts2(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="maxFrames">Negative Prompts 2:</label>
        <input
          type="text"
          id="negativePrompts2"
          name="negativePrompts2"
          value={negativePrompts2}
          onChange={(e) => setNegativePrompts2(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="maxFrames">Max Frames:</label>
        <input
          type="number"
          id="maxFrames"
          name="maxFrames"
          value={maxFrames}
          onChange={(e) => setMaxFrames(e.target.value)}
          required
        />
      </div>
      <input type="submit" value="Generate Video" />
    </form>
  );
}
