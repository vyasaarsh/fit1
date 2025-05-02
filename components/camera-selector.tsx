"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, RefreshCw } from "lucide-react"

interface CameraSelectorProps {
  onSelect: (facingMode: "user" | "environment") => void
}

export function CameraSelector({ onSelect }: CameraSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [hasFrontCamera, setHasFrontCamera] = useState(true)
  const [hasBackCamera, setHasBackCamera] = useState(true)

  useEffect(() => {
    // Check available cameras
    const checkCameras = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.log("enumerateDevices() not supported.")
          return
        }

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")

        // If we have multiple video devices, assume we have both front and back cameras
        // This is a simplification as we can't reliably detect which is which without testing
        if (videoDevices.length >= 2) {
          setHasFrontCamera(true)
          setHasBackCamera(true)
        } else if (videoDevices.length === 1) {
          // If only one camera, assume it's the front camera on phones/tablets
          setHasFrontCamera(true)
          setHasBackCamera(false)
        } else {
          setHasFrontCamera(false)
          setHasBackCamera(false)
        }
      } catch (err) {
        console.error("Error checking cameras:", err)
      }
    }

    checkCameras()
  }, [])

  const selectCamera = async (facingMode: "user" | "environment") => {
    setLoading(true)

    try {
      // Test if the selected camera is available by trying to access it
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      })

      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop())

      // Notify parent component of selection
      onSelect(facingMode)
    } catch (error) {
      console.error(`Error accessing ${facingMode} camera:`, error)
      // If front camera fails, try back camera and vice versa
      if (facingMode === "user" && hasBackCamera) {
        alert("Front camera not available. Switching to back camera.")
        onSelect("environment")
      } else if (facingMode === "environment" && hasFrontCamera) {
        alert("Back camera not available. Switching to front camera.")
        onSelect("user")
      } else {
        alert("No cameras available. Please check your camera permissions.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-4 text-lg font-medium">Select Camera</h3>

      <div className="flex gap-4">
        <Button
          onClick={() => selectCamera("user")}
          disabled={loading || !hasFrontCamera}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          {loading ? <RefreshCw className="h-8 w-8 animate-spin" /> : <Camera className="h-8 w-8" />}
          <span>Front Camera</span>
        </Button>

        <Button
          onClick={() => selectCamera("environment")}
          disabled={loading || !hasBackCamera}
          className="flex flex-col items-center gap-2 p-6 h-auto"
        >
          {loading ? (
            <RefreshCw className="h-8 w-8 animate-spin" />
          ) : (
            <Camera className="h-8 w-8 transform rotate-180" />
          )}
          <span>Back Camera</span>
        </Button>
      </div>
    </div>
  )
}
