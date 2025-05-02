"use client"

import type React from "react"

import { useState } from "react"
import { CameraIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CameraSwitcherProps {
  videoRef: React.RefObject<HTMLVideoElement>
  onCameraSwitch?: (facingMode: "user" | "environment") => void
}

export function CameraSwitcher({ videoRef, onCameraSwitch }: CameraSwitcherProps) {
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [isLoading, setIsLoading] = useState(false)

  const switchCamera = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return

    setIsLoading(true)

    // Stop all tracks on the current stream
    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => track.stop())

    // Toggle facing mode
    const newFacingMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(newFacingMode)

    try {
      // Request new stream with toggled facing mode
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      })

      // Set the new stream as source for video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }

      // Notify parent component about camera switch
      if (onCameraSwitch) {
        onCameraSwitch(newFacingMode)
      }
    } catch (error) {
      console.error("Error switching camera:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={switchCamera}
      disabled={isLoading}
      className="absolute right-16 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 p-0"
      aria-label="Switch camera"
    >
      {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <CameraIcon className="h-5 w-5" />}
    </Button>
  )
}
