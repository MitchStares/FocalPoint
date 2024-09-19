'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Download, Grid, Image as ImageIcon, Maximize, Minimize, Moon, Sun, Folder } from 'lucide-react'
import { useTheme } from "next-themes"
import CloudStorageDialog from './CloudStorageDialog'
import { LoginComponent } from './LoginComponent'
import { Image } from '@/types/Image'
import ImageLoadingProgress from './Image-Loading-Progress'
import LazyImage from './LazyImage'
import FilterMenu from './FilterMenu'
import ImageMetadata from './ImageMetadata'
import TagManagement from './TagManagement'
import ImageNavigation from './ImageNavigation'
import BulkTagging from './BulkTagging'
import SingleView from './SingleView'
import GridView from './GridView'
import EXIF from 'exif-js-heic';

declare global {
  interface Window {
    electron: {
      openDirectory: () => Promise<string | undefined>;
      readDirectory: (path: string) => Promise<string[]>;
      readFile: (path: string) => Promise<string>;
      getImageMetadata: (path: string) => Promise<{
        date: string;
        time: string;
        location: string;
        camera: string;
        lens: string;
        iso: string;
        aperture: string;
        shutterSpeed: string;
        width: number;
        height: number;
      }>;
    }
  }
}


export function FocalPoint() {
  const [images, setImages] = useState<Image[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [bulkTag, setBulkTag] = useState("");
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: [new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]],
    timeRange: ["00:00", "23:59"],
    locations: [] as string[],
    onlyTagged: false,
    onlyUntagged: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 20;
  const [imageSize, setImageSize] = useState(100);
  const [isImageFullScreen, setIsImageFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalImagesToLoad, setTotalImagesToLoad] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);

  const currentImage = filteredImages[currentImageIndex] || null;

  const updateImageTags = (imageId: number, newTags: string[]) => {
    setImages(prevImages => prevImages.map(img => 
      img.id === imageId ? { ...img, tags: newTags } : img
    ));
    setFilteredImages(prevFiltered => {
      const updatedFiltered = prevFiltered.map(img => 
        img.id === imageId ? { ...img, tags: newTags } : img
      );
      return updatedFiltered;
    });
  };

  const addTag = () => {
    if (currentImage && newTag && !currentImage.tags.includes(newTag)) {
      const updatedTags = [...currentImage.tags, newTag];
      updateImageTags(currentImage.id, updatedTags);
      setNewTag("");
      setCurrentImageIndex(prevIndex => {
        const updatedIndex = filteredImages.findIndex(img => img.id === currentImage.id);
        return updatedIndex !== -1 ? updatedIndex : prevIndex;
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (currentImage) {
      const updatedTags = currentImage.tags.filter(tag => tag !== tagToRemove);
      updateImageTags(currentImage.id, updatedTags);
      setCurrentImageIndex(prevIndex => {
        const updatedIndex = filteredImages.findIndex(img => img.id === currentImage.id);
        return updatedIndex !== -1 ? updatedIndex : prevIndex;
      });
    }
  };

  const nextImage = () => {
    if (filteredImages.length > 0) {
      setCurrentImageIndex(prev => (prev + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (filteredImages.length > 0) {
      setCurrentImageIndex(prev => (prev - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  const toggleImageSelection = (imageId: number) => {
    setSelectedImages(prev => 
      prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
    );
  };

  const applyBulkTag = () => {
    if (bulkTag) {
      setImages(prevImages => prevImages.map(img => 
        selectedImages.includes(img.id) && !img.tags.includes(bulkTag)
          ? { ...img, tags: [...img.tags, bulkTag] }
          : img
      ));
      setBulkTag("");
      setSelectedImages([]);
    }
  };

  const exportTagData = () => {
    const tagData = images.map(img => ({ id: img.id, tags: img.tags }));
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tagData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "wildlife_tags.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isElectron = 'electron' in window;

  const handleImageUpload = async () => {
    if (isElectron) {
      await loadLocalImages();
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files) {
          await processUploadedFiles(Array.from(files));
        }
      };
      input.click();
    }
  };

  const loadLocalImages = async () => {
    try {
      const directory = await window.electron.openDirectory();
      console.log('Selected directory:', directory);
      if (directory) {
        setCurrentDirectory(directory);
        const files = await window.electron.readDirectory(directory);
        console.log('Files returned from readDirectory:', files);
        if (files.length === 0) {
          console.log('No image files found in the directory');
          return;
        }
        await processFiles(files, directory);
      }
    } catch (error) {
      console.error('Error in loadLocalImages:', error);
    }
  };

  const processUploadedFiles = async (files: File[]) => {
    setIsLoading(true);
    setTotalImagesToLoad(files.length);
    setLoadedImages(0);

    const newImages = await Promise.all(files.map(async (file, index) => {
      try {
        const base64 = await readFileAsBase64(file);
        const metadata = await getImageMetadata(file);
        setLoadedImages(prev => prev + 1);
        return {
          id: index + 1,
          url: base64,
          tags: [],
          metadata: {
            filename: file.name,
            ...metadata
          }
        };
      } catch (error) {
        console.error('Error processing file:', file.name, error);
        setLoadedImages(prev => prev + 1);
        return null;
      }
    }));

    const validImages = newImages.filter(img => img !== null) as Image[];
    setImages(validImages);
    setFilteredImages(validImages);
    setIsLoading(false);
  };

  const processFiles = async (files: string[], directory: string) => {
    setIsLoading(true);
    setTotalImagesToLoad(files.length);
    setLoadedImages(0);

    const newImages = await Promise.all(files.map(async (file, index) => {
      const filePath = `${directory}/${file}`;
      console.log('Processing file:', filePath);
      try {
        const base64 = await window.electron.readFile(filePath);
        const metadata = await window.electron.getImageMetadata(filePath);
        setLoadedImages(prev => prev + 1);
        return {
          id: index + 1,
          url: `data:image/jpeg;base64,${base64}`,
          tags: [],
          metadata: {
            filename: file,
            ...metadata
          }
        };
      } catch (error) {
        console.error('Error processing file:', filePath, error);
        setLoadedImages(prev => prev + 1);
        return null;
      }
    }));

    const validImages = newImages.filter(img => img !== null) as Image[];
    setImages(validImages);
    setFilteredImages(validImages);
    setIsLoading(false);
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getImageMetadata = async (file: File | string) => {
    if (isElectron) {
      // Electron version
      const filePath = file as string;
      return window.electron.getImageMetadata(filePath);
    } else {
      // Web version
      return new Promise((resolve) => {
        EXIF.getData(file as File, function(this: any) {
          const metadata = {
            date: EXIF.getTag(this, "DateTimeOriginal") || 'Unknown',
            time: EXIF.getTag(this, "DateTimeOriginal")?.split(' ')[1] || 'Unknown',
            location: EXIF.getTag(this, "GPSLatitude") && EXIF.getTag(this, "GPSLongitude")
              ? `${EXIF.getTag(this, "GPSLatitude")}, ${EXIF.getTag(this, "GPSLongitude")}`
              : 'Unknown',
            camera: EXIF.getTag(this, "Model") || 'Unknown',
            lens: EXIF.getTag(this, "LensModel") || 'Unknown',
            iso: EXIF.getTag(this, "ISOSpeedRatings") || 'Unknown',
            aperture: EXIF.getTag(this, "FNumber") || 'Unknown',
            shutterSpeed: EXIF.getTag(this, "ExposureTime") || 'Unknown',
            width: EXIF.getTag(this, "PixelXDimension") || 'Unknown',
            height: EXIF.getTag(this, "PixelYDimension") || 'Unknown',
          };
          resolve(metadata);
        });
      });
    }
  };

  const applyFilters = () => {
    const filtered = images.filter(image => {
      const imageDate = new Date(image.metadata.date);
      const imageTime = image.metadata.time;
      const [startDate, endDate] = advancedFilters.dateRange;
      const [startTime, endTime] = advancedFilters.timeRange;
      
      const dateInRange = imageDate >= new Date(startDate) && imageDate <= new Date(endDate);
      const timeInRange = imageTime >= startTime && imageTime <= endTime;
      const locationMatch = advancedFilters.locations.length === 0 || advancedFilters.locations.includes(image.metadata.location);
      const tagMatch = 
        (!advancedFilters.onlyTagged && !advancedFilters.onlyUntagged) ||
        (advancedFilters.onlyTagged && image.tags.length > 0) ||
        (advancedFilters.onlyUntagged && image.tags.length === 0);
      
      return dateInRange && timeInRange && locationMatch && tagMatch;
    });

    setFilteredImages(filtered);
    setCurrentImageIndex(0);
    setCurrentPage(1);
  };

  const handleImageDoubleClick = (imageId: number) => {
    const index = filteredImages.findIndex(img => img.id === imageId);
    if (index !== -1) {
      setCurrentImageIndex(index);
      setViewMode('single');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        nextImage();
      } else if (event.key === 'ArrowLeft') {
        prevImage();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        const tagInput = document.getElementById('newTagInput');
        if (tagInput) {
          (tagInput as HTMLInputElement).focus();
        }
      } else if (event.key === 'Enter' && document.activeElement?.id === 'newTagInput') {
        addTag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextImage, prevImage, addTag]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Focal Point</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={handleImageUpload}>
            <Folder className="mr-2 h-4 w-4" />
            {isElectron ? 'Load Local Images' : 'Upload Images'}
          </Button>
          <CloudStorageDialog />
          <LoginComponent />
        </div>
      </div>
      
      <div className="flex justify-between mb-4">
        <FilterMenu
          filterTag={filterTag}
          setFilterTag={setFilterTag}
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
          applyFilters={applyFilters}
          images={images}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode('single')}>
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullScreen}>
            {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'single' | 'grid')}>
        <TabsContent value="single">
          {currentImage ? (
            <SingleView
              currentImage={currentImage}
              imageSize={imageSize}
              setImageSize={setImageSize}
              isImageFullScreen={isImageFullScreen}
              setIsImageFullScreen={setIsImageFullScreen}
              selectedImages={selectedImages}
              toggleImageSelection={toggleImageSelection}
              newTag={newTag}
              setNewTag={setNewTag}
              addTag={addTag}
              removeTag={removeTag}
              prevImage={prevImage}
              nextImage={nextImage}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-xl font-semibold">No images found</p>
              <p className="text-muted-foreground">Try adjusting your filters or adding new images.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="grid">
          {filteredImages.length > 0 ? (
            <GridView
              filteredImages={filteredImages}
              selectedImages={selectedImages}
              toggleImageSelection={toggleImageSelection}
              handleImageDoubleClick={handleImageDoubleClick}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              imagesPerPage={imagesPerPage}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-xl font-semibold">No images found</p>
              <p className="text-muted-foreground">Try adjusting your filters or adding new images.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <BulkTagging
        bulkTag={bulkTag}
        setBulkTag={setBulkTag}
        applyBulkTag={applyBulkTag}
        selectedImagesCount={selectedImages.length}
      />

      <Button onClick={exportTagData} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Export Tag Data
      </Button>

      {isLoading && (
        <Dialog open={isLoading} onOpenChange={setIsLoading}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Loading Images</DialogTitle>
              <DialogDescription>Please wait while we load your images.</DialogDescription>
            </DialogHeader>
            <ImageLoadingProgress totalImages={totalImagesToLoad} loadedImages={loadedImages} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}