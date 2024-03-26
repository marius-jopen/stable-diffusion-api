import React, { useState, useEffect } from 'react';

function BundestagLooper() {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    setLoading(true); // Start loading
    fetch('http://localhost:4000/list-bundestag-images')
      .then(response => response.json())
      .then(data => {
        setImages(data);
        setLoading(false); // End loading
      })
      .catch(error => {
        console.error("Failed to load images", error);
        setLoading(false); // Ensure loading is false even on error
      });
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1000 / 15);

      return () => clearInterval(interval);
    }
  }, [images.length]);

  const currentImageUrl = images.length > 0 ? `http://localhost:4000/images/${encodeURIComponent(images[currentIndex])}` : '';

  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <div>
      {images.length > 0 ? (
        <img src={currentImageUrl} alt="Bundestag Gallery" style={{ maxWidth: '100%', maxHeight: '80vh' }} />
      ) : (
        <div>No images found</div> // Show message if no images are found
      )}
    </div>
  );
}

export default BundestagLooper;
