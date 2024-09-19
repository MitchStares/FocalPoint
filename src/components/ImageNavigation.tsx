import React from 'react';
import { Button } from "@/components/ui/button";

interface ImageNavigationProps {
  prevImage: () => void;
  nextImage: () => void;
}

const ImageNavigation: React.FC<ImageNavigationProps> = ({ prevImage, nextImage }) => {
  return (
    <div className="flex justify-between mb-4">
      <Button onClick={prevImage}>Previous Image</Button>
      <Button onClick={nextImage}>Next Image</Button>
    </div>
  );
};

export default ImageNavigation;
