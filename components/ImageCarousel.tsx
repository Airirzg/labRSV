import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-bootstrap';
import Image from 'next/image';
import styles from '@/styles/ImageCarousel.module.css';

interface ImageCarouselProps {
  images: string[];
  altText?: string;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  height?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  altText = 'Equipment image',
  autoPlay = true,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  height = 400
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  useEffect(() => {
    // Filter out any empty or invalid URLs
    const validImages = images.filter(url => url && url.trim() !== '');
    
    // If no valid images, use a placeholder
    if (validImages.length === 0) {
      setImageUrls(['/images/placeholder-image.jpg']);
    } else {
      setImageUrls(validImages);
    }
  }, [images]);

  if (imageUrls.length === 0) {
    return <div className={styles.loadingContainer}>Loading images...</div>;
  }

  // If there's only one image, just display it without carousel controls
  if (imageUrls.length === 1) {
    return (
      <div className={styles.singleImageContainer} style={{ height: `${height}px` }}>
        <img
          src={imageUrls[0]}
          alt={altText}
          className={styles.carouselImage}
        />
      </div>
    );
  }

  return (
    <Carousel
      fade
      interval={autoPlay ? interval : null}
      controls={showControls && imageUrls.length > 1}
      indicators={showIndicators && imageUrls.length > 1}
      className={styles.carousel}
    >
      {imageUrls.map((imageUrl, index) => (
        <Carousel.Item key={index} className={styles.carouselItem}>
          <div className={styles.imageContainer} style={{ height: `${height}px` }}>
            <img
              src={imageUrl}
              alt={`${altText} ${index + 1}`}
              className={styles.carouselImage}
            />
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ImageCarousel;
