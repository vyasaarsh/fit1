"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface DeviceAlignmentProps {
  onAligned?: () => void
}

export function DeviceAlignment({ onAligned }: DeviceAlignmentProps) {
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 })
  const [isAligned, setIsAligned] = useState(false)
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null)

  // Check if device orientation is available
  const [isOrientationAvailable, setIsOrientationAvailable] = useState(false)

  useEffect(() => {
    // Check if DeviceOrientationEvent is available
    const isAvailable = typeof window !== "undefined" && window.DeviceOrientationEvent !== undefined
    setIsOrientationAvailable(isAvailable)

    if (!isAvailable) return

    // Request permission for iOS devices (iOS 13+)
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission()
          setPermissionState(permission)

          if (permission === "granted") {
            window.addEventListener("deviceorientation", handleOrientation)
          }
        } catch (error) {
          console.error("Error requesting device orientation permission:", error)
        }
      } else {
        // Permission not required (non-iOS or older iOS)
        window.addEventListener("deviceorientation", handleOrientation)
      }
    }

    requestPermission()

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [])

  const handleOrientation = (event: DeviceOrientationEvent) => {
    // Beta is the front-to-back tilt in degrees, where front is positive
    // Gamma is the left-to-right tilt in degrees, where right is positive
    const { beta, gamma } = event

    if (beta !== null && gamma !== null) {
      setOrientation({ beta, gamma })

      // Check if device is aligned properly (roughly flat)
      // Beta should be close to 0 (flat) and gamma should be close to 0 (not tilted left/right)
      const isNowAligned = Math.abs(beta) < 10 && Math.abs(gamma) < 10

      if (isNowAligned !== isAligned) {
        setIsAligned(isNowAligned)
        if (isNowAligned && onAligned) {
          onAligned()
        }
      }
    }
  }

  // Calculate position of the indicator based on orientation
  const indicatorX = Math.min(Math.max((orientation.gamma || 0) * 2, -50), 50) // Scale and limit movement
  const indicatorWidth = Math.max(20 - Math.abs(orientation.gamma || 0), 5) // Shrink width as it moves away from center

  return (
    <div className="relative mb-8 mt-4 h-60 w-full rounded-xl bg-gray-800 flex flex-col items-center justify-center">
      {isOrientationAvailable ? (
        <>
          <div className="absolute left-1/2 top-1/2 h-4 w-40 -translate-x-1/2 -translate-y-1/2 bg-blue-500/50 rounded-lg" />

          <motion.div
            className="absolute top-1/2 h-4 -translate-y-1/2 bg-orange-500/80 rounded-lg"
            style={{
              width: `${indicatorWidth}px`,
              x: indicatorX,
              left: "calc(50% - 10px)", // Center the indicator
            }}
            animate={{ x: indicatorX, width: `${indicatorWidth}px` }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />

          <div className="absolute bottom-10 left-0 right-0 flex justify-between px-8">
            <div className="h-6 w-20 bg-gray-300/20 rounded-sm" />
            <div className="h-6 w-20 bg-gray-300/20 rounded-sm" />
          </div>

          <div className="absolute bottom-20 left-0 right-0 flex justify-center">
            <p className="text-center text-sm text-gray-400">
              {isAligned ? "Device aligned correctly!" : "Align the orange bar with the blue area"}
            </p>
          </div>

          {permissionState === "denied" && (
            <div className="absolute top-4 left-0 right-0 text-center">
              <p className="text-red-500 text-sm">Please enable device orientation access</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-4">
          <p className="text-gray-400 mb-2">Device orientation not available</p>
          <p className="text-sm text-gray-500">Please use a device with orientation sensors</p>
        </div>
      )}
    </div>
  )
}
