import React, { useState } from 'react';

export default function VideoPromptForm() {
  // Update initial state to include a negativePrompt field
  const [prompts, setPrompts] = useState([{ index: '0', prompt: '', negativePrompt: '' }]);
  const [maxFrames, setMaxFrames] = useState('');

  const handleAddPrompt = () => {
    // Include a negativePrompt field for new prompts
    setPrompts([...prompts, { index: '', prompt: '', negativePrompt: '' }]);
  };

  const handleRemovePrompt = (indexToRemove) => {
    setPrompts(prompts.filter((_, index) => index !== indexToRemove));
  };

  const handleChangePrompt = (index, field, value) => {
    const newPrompts = prompts.map((prompt, i) => {
      if (i === index) {
        return { ...prompt, [field]: value };
      }
      return prompt;
    });
    setPrompts(newPrompts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format prompts to include the negative prompt as specified
    const promptsObject = prompts.reduce((acc, { index, prompt, negativePrompt }) => {
      acc[index] = `${prompt} --neg ${negativePrompt}`;
      return acc;
    }, {});

    const parameters = {
      deforum_settings: {
        "prompts": promptsObject,
        "max_frames": parseInt(maxFrames, 10),
      }
    };

    try {
      const response = await fetch('/generate-video', {
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
      <h1>Generate Video</h1>
      {prompts.map((prompt, index) => (
        <div key={index}>
          <label>Frame Index:</label>
          <input
            type="text"
            value={prompt.index}
            onChange={(e) => handleChangePrompt(index, 'index', e.target.value)}
            required
          />
          <label>Prompt:</label>
          <input
            type="text"
            value={prompt.prompt}
            onChange={(e) => handleChangePrompt(index, 'prompt', e.target.value)}
          />
          <label>Negative Prompt:</label>
          <input
            type="text"
            value={prompt.negativePrompt}
            onChange={(e) => handleChangePrompt(index, 'negativePrompt', e.target.value)}
          />
          {index > 0 && (
            <button type="button" onClick={() => handleRemovePrompt(index)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={handleAddPrompt}>
        Add Prompt
      </button>
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
