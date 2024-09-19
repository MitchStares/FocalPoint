import React, { memo } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Image } from '@/types/Image';
import LazyImage from './LazyImage';

interface GridItemProps {
  image: Image;
  selectedImages: number[];
  toggleImageSelection: (id: number) => void;
  handleImageDoubleClick: (id: number) => void;
}

const GridItem: React.FC<GridItemProps> = ({ image, selectedImages, toggleImageSelection, handleImageDoubleClick }) => {
  return (
    <div className="relative group">
      <LazyImage
        src={image.url}
        alt={`Wildlife image ${image.id}`}
        className="w-full h-40 object-cover rounded-lg shadow-md transition-transform duration-200 ease-in-out group-hover:scale-105"
        onDoubleClick={() => handleImageDoubleClick(image.id)}
      />
      <Checkbox
        checked={selectedImages.includes(image.id)}
        onCheckedChange={() => toggleImageSelection(image.id)}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      />
      <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {image.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1">
            {tag}
          </span>
        ))}
        {image.tags.length > 3 && (
          <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs font-semibold text-gray-700">
            +{image.tags.length - 3}
          </span>
        )}
      </div>
    </div>
  );
};

const MemoizedGridItem = memo(GridItem);

export default MemoizedGridItem;
