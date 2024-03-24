import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('Generating image...');

    try {
      const response = await axios.post('/generate-image', { prompt });
      if (response.data && response.data.imageUrl) {
        setImageUrl(response.data.imageUrl);
        setMessage('Image generated and saved successfully!');
      } else {
        throw new Error('No image URL in response');
      }
    } catch (error) {
      console.error('Error generating or saving the image:', error);
      setMessage('Error generating or saving the image.');
    }
  };

  return (
    <div className="App">
      <h1>Image Generator</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter your prompt:
          <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />
        </label>
        <button type="submit">Generate Image</button>
      </form>
      <p>{message}</p>
      {imageUrl && <img src={imageUrl} alt="Generated" style={{ maxWidth: '500px' }} />}
    </div>
  );
}

export default App;
