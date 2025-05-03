"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface DeviceAlignmentProps {
  onAligned?: () => void
}

export function DeviceAlignment({ onAligned }: DeviceAlignmentProps) {
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
  const [isAligned, setIsAligned] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [isOrientationAvailable, setIsOrientationAvailable] = useState(false);
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  // Check if device orientation is available on mount
  useEffect(() => {
    const isAvailable = typeof window !== "undefined" && "DeviceOrientationEvent" in window;
    setIsOrientationAvailable(isAvailable);

    if (!isAvailable) {
      console.log("Device orientation not available on this device.");
    }
  }, []);

  // Handle device orientation events
  const handleOrientation = (event: DeviceOrientationEvent) => {
    const { beta, gamma } = event;

    // Ensure beta and gamma are valid numbers
    if (beta !== null && gamma !== null) {
      setOrientation({ beta, gamma });

      // Check alignment: beta and gamma should be close to 0 for a flat device
      const isNowAligned = Math.abs(beta) < 10 && Math.abs(gamma) < 10;
      setIsAligned(isNowAligned);

      if (isNowAligned && onAligned) {
        onAligned();
      }
    } else {
      console.log("Orientation data not available:", { beta, gamma });
    }
  };

  // Request permission and set up orientation event listener
  const requestOrientationPermission = async () => {
    if (!isOrientationAvailable) return;

    setHasRequestedPermission(true);

    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        setPermissionState(permission);

        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          console.log("Device orientation permission denied.");
        }
      } catch (error) {
        console.error("Error requesting device orientation permission:", error);
        setPermissionState("denied");
      }
    } else {
      // For devices that don't require explicit permission (Android, older iOS)
      window.addEventListener("deviceorientation", handleOrientation, true);
      setPermissionState("granted");
    }
  };

  // Clean up event listener on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  // Calculate the position and width of the orange indicator
  const indicatorX = Math.min(Math.max((orientation.gamma || 0) * 2, -50), 50); // Scale gamma for movement
  const indicatorWidth = Math.max(20 - Math.abs(orientation.gamma || 0) * 0.3, 5); // Adjust width dynamically

  return (
    <div className="relative mb-8 mt-4 h-60 w-full rounded-xl bg-gray-800 flex flex-col items-center justify-center">
      {isOrientationAvailable ? (
        <>
          {/* Prompt user to grant permission if not yet requested */}
          {!hasRequestedPermission && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={requestOrientationPermission}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Enable Device Orientation
              </button>
            </div>
          )}

          {/* Show alignment UI only if permission is granted */}
          {permissionState === "granted" && (
            <>
              {/* Blue target area */}
              <div className="absolute left-1/2 top-1/2 h-4 w-40 -translate-x-1/2 -translate-y-1/2 bg-blue-500/50 rounded-lg" />

              {/* Orange indicator bar */}
              <motion.div
                className="absolute top-1/2 h-4 -translate-y-1/2 bg-orange-500 rounded-lg"
                style={{
                  left: "50%",
                  x: indicatorX,
                  width: indicatorWidth,
                }}
                animate={{ x: indicatorX, width: indicatorWidth }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />

              {/* Placeholder bars at the bottom */}
              <div className="absolute bottom-10 left-0 right-0 flex justify-between px-8">
                <div className="h-6 w-20 bg-gray-300/20 rounded-sm" />
                <div className="h-6 w-20 bg-gray-300/20 rounded-sm" />
              </div>

              {/* Alignment status message */}
              <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                <p className="text-center text-sm text-gray-400">
                  {isAligned ? "Device aligned correctly!" : "Align the orange bar with the blue area"}
                </p>
              </div>
            </>
          )}

          {/* Show permission denied message */}
          {permissionState === "denied" && (
            <div className="absolute top-4 left-0 right-0 text-center">
              <p className="text-red-500 text-sm">Please enable device orientation access in your device settings.</p>
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
  );
}
