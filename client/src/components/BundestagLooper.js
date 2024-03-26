import React, { useState, useEffect } from 'react';

function BundestagLooper() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('http://localhost:4000/list-bundestag-images')
      .then(response => response.json())
      .then(data => {
        // Assuming the data is an array of file paths relative to the baseDir
        setImages(data);
      })
      .catch(error => console.error("Failed to load images", error));
  }, []);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Loop back to the first image
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => prevIndex === 0 ? images.length - 1 : prevIndex - 1); // Loop back to the last image
  };

  // Construct the URL for the current image to be displayed
  const currentImageUrl = images.length > 0 ? `http://localhost:4000/images/${encodeURIComponent(images[currentIndex].replace(/^E:\\output\\sd-api\\/, ''))}` : '';

  return (
    <div>
      {images.length > 0 && (
        <>
          <button onClick={prevImage}>Previous</button>
          <img src={currentImageUrl} alt="Bundestag Gallery" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
          <button onClick={nextImage}>Next</button>
        </>
      )}
    </div>
  );
}

export default BundestagLooper;
