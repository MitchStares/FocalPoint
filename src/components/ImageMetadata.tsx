import React from 'react';
import { Image } from '@/types/Image';

interface ImageMetadataProps {
  image: Image;
}

const ImageMetadata: React.FC<ImageMetadataProps> = ({ image }) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Image Metadata:</h2>
      <div className="grid grid-cols-2 gap-2">
        <div>Date: {image.metadata.date}</div>
        <div>Time: {image.metadata.time}</div>
        <div>Location: {image.metadata.location}</div>
        <div>Camera: {image.metadata.camera}</div>
        <div>Lens: {image.metadata.lens}</div>
        <div>ISO: {image.metadata.iso}</div>
        <div>Aperture: {image.metadata.aperture}</div>
        <div>Shutter Speed: {image.metadata.shutterSpeed}</div>
      </div>
    </div>
  );
};

export default ImageMetadata;
