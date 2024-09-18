'use client'

import { useState, useEffect } from 'react'
import { Progress } from "@/components/ui/progress"

// Custom hook to simulate image loading
const useImageLoading = (totalImages: number, loadingTime: number = 3000) => {
  const [loadedImages, setLoadedImages] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadedImages((prev) => {
        if (prev < totalImages) {
          return prev + 1
        }
        clearInterval(interval)
        return prev
      })
    }, loadingTime / totalImages)

    return () => clearInterval(interval)
  }, [totalImages, loadingTime])

  useEffect(() => {
    setProgress((loadedImages / totalImages) * 100)
  }, [loadedImages, totalImages])

  return { loadedImages, totalImages, progress }
}

export default function Component({ totalImages = 10, loadingTime = 3000 }) {
  const { loadedImages, progress } = useImageLoading(totalImages, loadingTime)

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold text-center text-primary">Loading Images</h2>
      <Progress value={progress} className="w-full" />
      <p className="text-center text-sm text-primary">
        Loaded {loadedImages} of {totalImages} images
      </p>
      <p className="text-center text-xs text-muted-foreground">
        {progress.toFixed(0)}% complete
      </p>
    </div>
  )
}