"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut } from "lucide-react"

interface CameraZoomControlProps {
  videoRef: React.RefObject<HTMLVideoElement>
  onZoomChange?: (zoomLevel: number) => void
}

export function CameraZoomControl({ videoRef, onZoomChange }: CameraZoomControlProps) {
  const [zoomLevel, setZoomLevel] = useState<0.5 | 1>(1)

  const toggleZoom = () => {
    const newZoom = zoomLevel === 1 ? 0.5 : 1
    setZoomLevel(newZoom)

    // Apply zoom to video element
    if (videoRef.current) {
      videoRef.current.style.transform = newZoom === 0.5 ? "scale(0.5)" : "scale(1)"
      videoRef.current.style.transformOrigin = "center"
    }

    if (onZoomChange) {
      onZoomChange(newZoom)
    }
  }

  return (
    <Button
      onClick={toggleZoom}
      className="absolute left-16 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 p-0"
      aria-label={`Set zoom to ${zoomLevel === 1 ? "0.5x" : "1x"}`}
    >
      {zoomLevel === 1 ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
      <span className="ml-1 text-xs">{zoomLevel}x</span>
    </Button>
  )
}
