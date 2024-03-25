import React from 'react';
import ImagePromptForm from './components/ImagePromptForm';
import VideoPromptForm from './components/VideoPromptForm';
import BundestagPromptForm from './components/BundestagPromptForm';

function App() {
  return (
    <div className="App">
      <ImagePromptForm />
      <VideoPromptForm />
      <BundestagPromptForm/>
    </div>
  );
}

export default App;