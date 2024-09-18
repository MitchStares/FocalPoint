'use client'

import { useEffect, useState } from 'react'
import { Progress } from "@/components/ui/progress"

interface ImageLoadingProgressProps {
  totalImages: number;
  loadedImages: number;
}

export default function ImageLoadingProgress({ totalImages, loadedImages }: ImageLoadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress((loadedImages / totalImages) * 100)
  }, [loadedImages, totalImages])

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
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