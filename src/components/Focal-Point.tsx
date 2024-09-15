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
import { Cloud, Filter, Tag, Download, Grid, Image as ImageIcon, LogIn, ZoomIn, ZoomOut, Maximize, Minimize, Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import CloudStorageDialog from './CloudStorageDialog'

// Updated mock data with real image URLs
const mockImages = [
  { id: 1, url: "https://i.imgur.com/RVTlNOj.jpg", tags: ["deer", "daytime"], metadata: { date: "2023-06-01", time: "14:30", location: "Forest Edge" } },
  { id: 2, url: "https://i.imgur.com/9JHhNGw.jpg", tags: ["bear", "nighttime"], metadata: { date: "2023-06-02", time: "02:15", location: "River Bank" } },
  { id: 3, url: "https://i.imgur.com/Yk3MNXt.jpg", tags: ["fox", "daytime"], metadata: { date: "2023-06-03", time: "10:45", location: "Meadow" } },
  { id: 4, url: "https://i.imgur.com/Qx8wWDQ.jpg", tags: ["raccoon", "nighttime"], metadata: { date: "2023-06-04", time: "23:20", location: "Campsite" } },
  { id: 5, url: "https://i.imgur.com/Ow4qPwP.jpg", tags: ["owl", "nighttime"], metadata: { date: "2023-06-05", time: "01:10", location: "Old Oak Tree" } },
  { id: 6, url: "https://i.imgur.com/JRhLVzR.jpg", tags: ["coyote", "daytime"], metadata: { date: "2023-06-06", time: "17:55", location: "Hiking Trail" } },
]

export function FocalPoint() {
  const [images, setImages] = useState(mockImages)
  const [filteredImages, setFilteredImages] = useState(mockImages)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [newTag, setNewTag] = useState("")
  const [filterTag, setFilterTag] = useState("")
  const [selectedImages, setSelectedImages] = useState<number[]>([])
  const [bulkTag, setBulkTag] = useState("")
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [cloudProvider, setCloudProvider] = useState<string | null>(null)
  const [connectionString, setConnectionString] = useState("")
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: [new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]],
    timeRange: ["00:00", "23:59"],
    locations: [] as string[],
    onlyTagged: false,
    onlyUntagged: false,
  })

  const currentImage = filteredImages[currentImageIndex] || null

  useEffect(() => {
    applyFilters()
  }, [filterTag, advancedFilters, images])

  const applyFilters = () => {
    const filtered = images.filter(img => {
      // Basic tag filter
      if (filterTag && !img.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))) {
        return false
      }
      
      // Advanced filters
      const imgDate = img.metadata.date
      const imgTime = img.metadata.time
      if (imgDate < advancedFilters.dateRange[0] || imgDate > advancedFilters.dateRange[1]) {
        return false
      }
      if (imgTime < advancedFilters.timeRange[0] || imgTime > advancedFilters.timeRange[1]) {
        return false
      }
      if (advancedFilters.locations.length > 0 && !advancedFilters.locations.includes(img.metadata.location)) {
        return false
      }
      if (advancedFilters.onlyTagged && img.tags.length === 0) {
        return false
      }
      if (advancedFilters.onlyUntagged && img.tags.length > 0) {
        return false
      }
      return true
    })
    setFilteredImages(filtered)
    setCurrentImageIndex(0)
  }

  const addTag = () => {
    if (currentImage && newTag && !currentImage.tags.includes(newTag)) {
      updateImageTags(currentImage.id, [...currentImage.tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (currentImage) {
      updateImageTags(currentImage.id, currentImage.tags.filter(tag => tag !== tagToRemove))
    }
  }

  const updateImageTags = (imageId: number, newTags: string[]) => {
    setImages(prevImages => prevImages.map(img => 
      img.id === imageId ? { ...img, tags: newTags } : img
    ))
  }

  const nextImage = () => {
    if (filteredImages.length > 0) {
      setCurrentImageIndex(prev => (prev + 1) % filteredImages.length)
    }
  }

  const prevImage = () => {
    if (filteredImages.length > 0) {
      setCurrentImageIndex(prev => (prev - 1 + filteredImages.length) % filteredImages.length)
    }
  }

  const toggleImageSelection = (imageId: number) => {
    setSelectedImages(prev => 
      prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
    )
  }

  const applyBulkTag = () => {
    if (bulkTag) {
      setImages(prevImages => prevImages.map(img => 
        selectedImages.includes(img.id) && !img.tags.includes(bulkTag)
          ? { ...img, tags: [...img.tags, bulkTag] }
          : img
      ))
      setBulkTag("")
      setSelectedImages([])
    }
  }

  const exportTagData = () => {
    const tagData = images.map(img => ({ id: img.id, tags: img.tags }))
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tagData))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", "wildlife_tags.json")
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const handleLogin = () => {
    // In a real application, you would validate credentials here
    if (username && password) {
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername("")
    setPassword("")
  }

  const handleCloudConnect = () => {
    // In a real application, you would use the connectionString to connect to the cloud provider
    console.log(`Connecting to ${cloudProvider} with connection string: ${connectionString}`)
    // Reset the form
    setCloudProvider(null)
    setConnectionString("")
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullScreen(false)
      }
    }
  }

  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Focal Point</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
          <CloudStorageDialog/>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                {isLoggedIn ? 'Logout' : 'Login'}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>{isLoggedIn ? 'Logout' : 'Login'}</DialogTitle>
                <DialogDescription>
                  {isLoggedIn ? 'Are you sure you want to logout?' : 'Enter your credentials to log in.'}
                </DialogDescription>
              </DialogHeader>
              {isLoggedIn ? (
                <Button onClick={handleLogout}>Logout</Button>
              ) : (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <Button onClick={handleLogin}>Login</Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
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
                      </div>
                      <TransformComponent>
                        <img 
                          src={currentImage.url} 
                          alt={`Wildlife image ${currentImageIndex + 1}`} 
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
                <Checkbox
                  checked={selectedImages.includes(currentImage.id)}
                  onCheckedChange={() => toggleImageSelection(currentImage.id)}
                  className="absolute top-2 left-2 z-10"
                />
              </div>

              <div className="flex gap-2 mb-4">
                <Input
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {filteredImages.map((image) => (
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

      <Button onClick={exportTagData} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Export Tag Data
      </Button>
    </div>
  )
}