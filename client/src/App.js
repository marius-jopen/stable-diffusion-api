import React from 'react';
import ImagePromptForm from './components/ImagePromptForm';
import VideoPromptForm from './components/VideoPromptForm';
import BundestagPromptForm from './components/BundestagPromptForm';
import BundestagImagePromptForm from './components/BundestagImagePromptForm';
import BundestagForm from './components/BundestagForm';
import BundestagLooper from './components/BundestagLooper';

function App() {
  return (
    <div className="App">
      {/* <ImagePromptForm /> */}
      {/* <VideoPromptForm /> */}
      {/* <BundestagPromptForm/> */}
      {/* <BundestagImagePromptForm/> */}
      <BundestagForm/>
      <BundestagLooper/>
    </div>
  );
}

export default App;