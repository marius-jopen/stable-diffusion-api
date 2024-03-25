import React, { useState } from 'react';

export default function BundestagPromptsForm() {
  // Update initial state to include a negativePrompt field
  const [maxFrames, setMaxFrames] = useState('');
  const [prompts, setPrompts] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedPrompts = prompts.replace(/\n/g, ' ');

    const keyframe = Math.floor(parseInt(maxFrames, 10) / 4);

    const positivePrompts = "hyperdetailed photography, soft light, masterpiece, (film grain:1.3), (complex:1.2), (depth of field:1.4), detailed"
    const negativePrompts = "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3), morbid, ugly, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, glitch, duplicate"

    const parameters = {
      deforum_settings: {
        "prompts": {
          "0": formattedPrompts  + " " + positivePrompts + " --neg " + negativePrompts,
          [keyframe.toString()]: formattedPrompts  + " " + positivePrompts + " --neg " + negativePrompts  // Use the calculated keyframe
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
    <form onSubmit={handleSubmit} className='flex gap-4 flex-col'>
      <div className='flex gap-4 w-1/2'>
        <label htmlFor="maxFrames">
          Prompts:
          </label>
          <textarea
            className='w-full h-32 bg-white border rounded-xl'
            id="prompts"
            name="prompts"
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
          />
      </div>
      <div className='flex gap-4 w-1/2'>
        <label htmlFor="maxFrames">
          Max Frames:
        </label>
        <input
          className='w-32 bg-white border rounded-lg'
          type="number"
          id="maxFrames"
          name="maxFrames"
          value={maxFrames}
          onChange={(e) => setMaxFrames(e.target.value)}
          required
        />
      </div>
      <input className='cursor-pointer w-32 border rounded-lg bg-red-200' type="submit" value="Generate Video" />
    </form>
  );
}

