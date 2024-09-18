'use client'

import { useState, useEffect } from 'react'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Cloud, Filter, Tag, Download, Grid, Image as ImageIcon, LogIn, ZoomIn, ZoomOut, Maximize, Minimize, Moon, Sun, Folder } from 'lucide-react'
import { useTheme } from "next-themes"
import CloudStorageDialog from './CloudStorageDialog'
import { LoginComponent } from './LoginComponent'
import { Slider } from "@/components/ui/slider"
import { Image } from '@/types/image';

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
        const newImages = await Promise.all(files.map(async (file, index) => {
          const filePath = `${directory}/${file}`;
          console.log('Processing file:', filePath);
          try {
            const base64 = await window.electron.readFile(filePath);
            const metadata = await window.electron.getImageMetadata(filePath);
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
            return null;
          }
        }));
        const validImages = newImages.filter(img => img !== null);
        setImages(validImages);
        setFilteredImages(validImages);
      }
    } catch (error) {
      console.error('Error in loadLocalImages:', error);
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
          <CloudStorageDialog />
          <LoginComponent />
        </div>
      </div>
      
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            placeholder="Filter by tag"
            className="w-40"
          />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Date Range</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      type="date"
                      value={advancedFilters.dateRange[0]}
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, dateRange: [e.target.value, prev.dateRange[1]]}))}
                    />
                    <Input
                      type="date"
                      value={advancedFilters.dateRange[1]}
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, dateRange: [prev.dateRange[0], e.target.value]}))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Time Range</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input
                      type="time"
                      value={advancedFilters.timeRange[0]}
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, timeRange: [e.target.value, prev.timeRange[1]]}))}
                    />
                    <Input
                      type="time"
                      value={advancedFilters.timeRange[1]}
                      onChange={(e) => setAdvancedFilters(prev => ({...prev, timeRange: [prev.timeRange[0], e.target.value]}))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Locations</Label>
                  <div className="col-span-3">
                    {Array.from(new Set(images.map(img => img.metadata.location))).map(location => (
                      <div key={location} className="flex items-center space-x-2">
                        <Checkbox
                          id={location}
                          checked={advancedFilters.locations.includes(location)}
                          onCheckedChange={(checked) => {
                            setAdvancedFilters(prev => ({
                              ...prev,
                              locations: checked
                                ? [...prev.locations, location]
                                : prev.locations.filter(l => l !== location)
                            }))
                          }}
                        />
                        <label htmlFor={location}>{location}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Only Tagged</Label>
                  <Switch
                    checked={advancedFilters.onlyTagged}
                    onCheckedChange={(checked) => setAdvancedFilters(prev => ({...prev, onlyTagged: checked}))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Only Untagged</Label>
                  <Switch
                    checked={advancedFilters.onlyUntagged}
                    onCheckedChange={(checked) => setAdvancedFilters(prev => ({...prev, onlyUntagged: checked}))}
                  />
                </div>
              </div>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </DialogContent>
          </Dialog>
        </div>
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
                            alt={`Wildlife image ${currentImageIndex + 1}`} 
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
              <div className="flex gap-2 mb-4">
                <Input
                  id="newTagInput"
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter new tag"
                  className="flex-grow"
                />
                <Button onClick={addTag}>Add Tag</Button>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Current Tags:</h2>
                <div className="flex flex-wrap gap-2">
                  {currentImage.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2 text-red-500">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Image Metadata:</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div>Date: {currentImage.metadata.date}</div>
                  <div>Time: {currentImage.metadata.time}</div>
                  <div>Location: {currentImage.metadata.location}</div>
                  <div>Camera: {currentImage.metadata.camera}</div>
                  <div>Lens: {currentImage.metadata.lens}</div>
                  <div>ISO: {currentImage.metadata.iso}</div>
                  <div>Aperture: {currentImage.metadata.aperture}</div>
                  <div>Shutter Speed: {currentImage.metadata.shutterSpeed}</div>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <Button onClick={prevImage}>Previous Image</Button>
                <Button onClick={nextImage}>Next Image</Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl font-semibold">No images found</p>
              <p className="text-muted-foreground">Try adjusting your filters or adding new images.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="grid">
          {filteredImages.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {filteredImages
                  .slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage)
                  .map((image) => (
                    <div key={image.id} className="relative">
                      <img 
                        src={image.url} 
                        alt={`Wildlife image ${image.id}`} 
                        className="w-full h-auto rounded-lg shadow-lg"
                      />
                      <Checkbox
                        checked={selectedImages.includes(image.id)}
                        onCheckedChange={() => toggleImageSelection(image.id)}
                        className="absolute top-2 left-2"
                      />
                      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                        {image.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="flex justify-between items-center mt-4">
                <Button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span>Page {currentPage} of {Math.ceil(filteredImages.length / imagesPerPage)}</span>
                <Button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredImages.length / imagesPerPage)))}
                  disabled={currentPage === Math.ceil(filteredImages.length / imagesPerPage)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-xl font-semibold">No images found</p>
              <p className="text-muted-foreground">Try adjusting your filters or adding new images.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          value={bulkTag}
          onChange={(e) => setBulkTag(e.target.value)}
          placeholder="Bulk tag"
          className="flex-grow"
        />
        <Button onClick={applyBulkTag} disabled={selectedImages.length === 0}>
          <Tag className="mr-2 h-4 w-4" />
          Apply to Selected ({selectedImages.length})
        </Button>
      </div>

      <Button onClick={loadLocalImages} className="w-full mb-4">
        <Folder className="mr-2 h-4 w-4" />
        Load Local Images
      </Button>

      <Button onClick={exportTagData} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Export Tag Data
      </Button>
    </div>
  )
}