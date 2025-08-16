import React, { useState, useRef, useEffect } from 'react';

/**
 * Componente de imagem com lazy loading
 */
const LazyImage = ({
  src,
  alt,
  placeholder = '/placeholder.png',
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    let observer;
    
    if (imageRef && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.unobserve(imageRef);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(imageRef);
    } else {
      // Fallback para navegadores sem suporte
      setIsInView(true);
    }
    
    return () => {
      if (observer && observer.unobserve) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef]);

  useEffect(() => {
    if (isInView && src) {
      const imageLoader = new Image();
      imageLoader.src = src;
      imageLoader.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
    }
  }, [isInView, src]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-50'
      } ${className}`}
      loading="lazy"
      data-testid="lazy-image"
      {...props}
    />
  );
};

export default LazyImage;