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
  const [alignmentTimer, setAlignmentTimer] = useState<number | null>(null); // Timer for 3-second alignment
  const [countdown, setCountdown] = useState<number>(3); // Countdown display

  // Check if device orientation is available
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

    if (beta !== null && gamma !== null) {
      setOrientation({ beta, gamma });

      // Check alignment: we only care about gamma (left-right tilt) for this design
      const isNowAligned = Math.abs(gamma) < 5; // Orange line should be within the blue area
      setIsAligned(isNowAligned);
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
      window.addEventListener("deviceorientation", handleOrientation, true);
      setPermissionState("granted");
    }
  };

  // Clean up event listener on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      if (alignmentTimer) clearTimeout(alignmentTimer); // Clean up timer
    };
  }, [alignmentTimer]);

  // Handle the 3-second alignment timer
  useEffect(() => {
    if (isAligned) {
      // Start the countdown when aligned
      setCountdown(3); // Reset countdown to 3 seconds
      const timer = setTimeout(() => {
        if (isAligned && onAligned) {
          onAligned(); // Trigger the next step after 3 seconds
        }
      }, 3000);
      setAlignmentTimer(timer);

      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    } else {
      // Reset timer and countdown if alignment is lost
      if (alignmentTimer) clearTimeout(alignmentTimer);
      setAlignmentTimer(null);
      setCountdown(3);
    }
  }, [isAligned, onAligned]);

  // Calculate the position of the orange line based on gamma (left-right tilt)
  const lineX = Math.min(Math.max((orientation.gamma || 0) * 3, -150), 150); // Scale gamma for movement

  return (
    <div className="relative h-screen w-full bg-gray-900 flex flex-col items-center justify-center">
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
              {/* Background design with curved lines */}
              <div className="absolute inset-0 overflow-hidden">
                <svg className="w-full h-full">
                  <path
                    d="M0 0 Q 300 300, 600 0"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M0 600 Q 300 300, 600 600"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Instructions */}
              <div className="absolute top-20 left-0 right-0 text-center px-4">
                <h2 className="text-white text-lg font-semibold mb-2">Leveler</h2>
                <p className="text-gray-300 text-sm">
                  Place your device on the floor and adjust the orange bar to the blue area for 3 seconds
                </p>
              </div>

              {/* Blue target area */}
              <div className="absolute left-1/2 top-1/2 h-12 w-64 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-lg" />

              {/* Orange line */}
              <motion.div
                className="absolute top-1/2 h-1 w-64 -translate-y-1/2 bg-orange-500"
                style={{
                  left: "50%",
                  x: lineX,
                }}
                animate={{ x: lineX }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />

              {/* Countdown timer when aligned */}
              {isAligned && (
                <div className="absolute bottom-20 left-0 right-0 flex justify-center">
                  <p className="text-white text-lg font-semibold">
                    Aligning in {countdown}s
                  </p>
                </div>
              )}

              {/* Review Instructions button */}
              <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                <button className="text-blue-400 text-sm underline">
                  Review Instructions
                </button>
              </div>
            </>
          )}

          {/* Permission denied message */}
          {permissionState === "denied" && (
            <div className="absolute top-20 left-0 right-0 text-center">
              <p className="text-red-500 text-sm">
                Please enable device orientation access in your device settings.
              </p>
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
