import React from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { Image } from '@/types/Image';
import TagManagement from './TagManagement';
import ImageMetadata from './ImageMetadata';
import ImageNavigation from './ImageNavigation';

interface SingleViewProps {
  currentImage: Image;
  imageSize: number;
  setImageSize: (size: number) => void;
  isImageFullScreen: boolean;
  setIsImageFullScreen: (isFullScreen: boolean) => void;
  selectedImages: number[];
  toggleImageSelection: (id: number) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  prevImage: () => void;
  nextImage: () => void;
}

const SingleView: React.FC<SingleViewProps> = ({
  currentImage,
  imageSize,
  setImageSize,
  isImageFullScreen,
  setIsImageFullScreen,
  selectedImages,
  toggleImageSelection,
  newTag,
  setNewTag,
  addTag,
  removeTag,
  prevImage,
  nextImage,
}) => {
  return (
    <>
      <div className="mb-4 relative">
        <div className={`relative ${isImageFullScreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
          <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => zoomIn()}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => zoomOut()}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => resetTransform()}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setIsImageFullScreen(!isImageFullScreen)}>
                    {isImageFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
                <TransformComponent>
                  <img 
                    src={currentImage.url} 
                    alt={`Wildlife image ${currentImage.id}`} 
                    style={{ width: `${imageSize}%`, height: 'auto' }}
                    className="mx-auto rounded-lg shadow-lg"
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
        <Checkbox
          checked={selectedImages.includes(currentImage.id)}
          onCheckedChange={() => toggleImageSelection(currentImage.id)}
          className="absolute top-2 left-2 z-10"
        />
      </div>
      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm">Image Size:</span>
        <Slider
          min={10}
          max={100}
          step={10}
          value={[imageSize]}
          onValueChange={(value) => setImageSize(value[0])}
          className="w-64"
        />
        <span className="text-sm">{imageSize}%</span>
      </div>

      <TagManagement
        image={currentImage}
        newTag={newTag}
        setNewTag={setNewTag}
        addTag={addTag}
        removeTag={removeTag}
      />

      <ImageMetadata image={currentImage} />

      <ImageNavigation prevImage={prevImage} nextImage={nextImage} />
    </>
  );
};

export default SingleView;