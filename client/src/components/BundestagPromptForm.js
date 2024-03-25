import React, { useState } from 'react';

export default function BundestagPromptsForm() {
  // Update initial state to include a negativePrompt field
  const [maxFrames, setMaxFrames] = useState('');
  const [prompts] = useState('');
  const [positivePrompts2, setPositivePrompts2] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const keyframe = Math.floor(parseInt(maxFrames, 10) / 4);
    const positivePrompts = "hyperdetailed photography, soft light, masterpiece, (film grain:1.3), (complex:1.2), (depth of field:1.4)"
    const negativePrompts = "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3), morbid, ugly, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, glitch, duplicate"

    const parameters = {
      deforum_settings: {
        "prompts": {
          "0": prompts + " " + positivePrompts + " --neg " + negativePrompts,
          [keyframe.toString()]: positivePrompts2 + " " + positivePrompts + " --neg " + negativePrompts  // Use the calculated keyframe
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
      <div>
        <label htmlFor="maxFrames">Prompts:</label>
        <input
          type="text"
          id="positivePrompts2"
          name="positivePrompts2"
          value={positivePrompts2}
          onChange={(e) => setPositivePrompts2(e.target.value)}
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
