import React from 'react';
import { Image } from '@/types/Image';

interface ImageMetadataProps {
  image: Image;
}

const ImageMetadata: React.FC<ImageMetadataProps> = ({ image }) => {
  // Helper function to safely convert any value to a string
  const safeToString = (value: any): string => {
    if (value === null || value === undefined) return 'Unknown';
    return String(value);
  };

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Image Metadata:</h2>
      <div className="grid grid-cols-2 gap-2">
        <div>Date: {safeToString(image.metadata.date)}</div>
        <div>Time: {safeToString(image.metadata.time)}</div>
        <div>Location: {safeToString(image.metadata.location)}</div>
        <div>Camera: {safeToString(image.metadata.camera)}</div>
        <div>Lens: {safeToString(image.metadata.lens)}</div>
        <div>ISO: {safeToString(image.metadata.iso)}</div>
        <div>Aperture: {safeToString(image.metadata.aperture)}</div>
        <div>Shutter Speed: {safeToString(image.metadata.shutterSpeed)}</div>
        {image.metadata.width && <div>Width: {safeToString(image.metadata.width)}px</div>}
        {image.metadata.height && <div>Height: {safeToString(image.metadata.height)}px</div>}
      </div>
    </div>
  );
};

export default ImageMetadata;
