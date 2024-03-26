import React from 'react';
import ImagePromptForm from './components/ImagePromptForm';
import VideoPromptForm from './components/VideoPromptForm';
import BundestagPromptForm from './components/BundestagPromptForm';
import BundestagImagePromptForm from './components/BundestagImagePromptForm';

function App() {
  return (
    <div className="App">
      {/* <ImagePromptForm /> */}
      {/* <VideoPromptForm /> */}
      <BundestagPromptForm/>
      <BundestagImagePromptForm/>
    </div>
  );
}

export default App;