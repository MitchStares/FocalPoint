import React, { useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onDoubleClick?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, onDoubleClick }) => {
  const [imageSrc, setImageSrc] = useState('data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
    };
  }, [src]);

  return <img src={imageSrc} alt={alt} className={className} onDoubleClick={onDoubleClick} />;
};

export default LazyImage;
