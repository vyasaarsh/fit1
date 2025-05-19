"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, X, LightbulbIcon, CheckCircle, AlertTriangle, ZapIcon, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePoseDetection } from "@/hooks/use-pose-detection"
import { CameraZoomControl } from "@/components/camera-zoom-control"
import { BodyOutline } from "@/components/body-outline"

type CalibrationStatus = "waiting" | "calibrating" | "complete"
type AlignmentStatus = "not-aligned" | "aligning" | "aligned"

export default function ExerciseCameraPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Always use front camera (user)
  const initialCamera = "user"

  const exerciseId = params.id
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)

  const [showInstructions, setShowInstructions] = useState(true)
  const [calibrationStatus, setCalibrationStatus] = useState<CalibrationStatus>("waiting")
  const [detectedKeypoints, setDetectedKeypoints] = useState(0)
  const [countdownValue, setCountdownValue] = useState(3)
  const [showBodyOutline, setShowBodyOutline] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">(initialCamera)
  const [showCountingHelp, setShowCountingHelp] = useState(false)
  const [showManualStart, setShowManualStart] = useState(false)
  const [bodyAlignmentStatus, setBodyAlignmentStatus] = useState<AlignmentStatus>("not-aligned")
  const [alignmentTimer, setAlignmentTimer] = useState(0)
  const [showDebug, setShowDebug] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [calibrationRetries, setCalibrationRetries] = useState(0)

  // For auto-retry
  const calibrationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Exercise data
  const exerciseData = {
    squats: { name: "Squats", totalReps: 5 },
    pushups: { name: "Push Ups", totalReps: 5 },
    planks: { name: "Planks", totalReps: 1 },
  }

  const currentExercise = exerciseData[exerciseId as keyof typeof exerciseData] || { name: "Exercise", totalReps: 5 }

  const {
    isModelLoading,
    startPoseDetection,
    stopPoseDetection,
    detectedPose,
    exerciseCount,
    exerciseTime,
    debugInfo,
    detectionStatus,
    forceDectection,
  } = usePoseDetection(videoRef, canvasRef, exerciseId, facingMode)

  // Handle zoom change
  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom)

    // Adjust canvas to match video zoom
    if (canvasRef.current) {
      canvasRef.current.style.transform = newZoom === 0.5 ? "scale(0.5)" : "scale(1)"
      canvasRef.current.style.transformOrigin = "center"
    }
  }

  // Auto-retry if no detection occurs
  useEffect(() => {
    if (calibrationStatus === "calibrating" && !isModelLoading) {
      if (calibrationTimerRef.current) {
        clearTimeout(calibrationTimerRef.current)
      }

      calibrationTimerRef.current = setTimeout(() => {
        if (detectionStatus === "none" && calibrationRetries < 2) {
          // Try restarting detection
          stopPoseDetection()
          setTimeout(() => {
            startPoseDetection(facingMode)
            setCalibrationRetries((prev) => prev + 1)
          }, 500)
        }
      }, 10000) // Wait 10 seconds before auto-retry

      return () => {
        if (calibrationTimerRef.current) {
          clearTimeout(calibrationTimerRef.current)
        }
      }
    }
  }, [
    calibrationStatus,
    isModelLoading,
    detectionStatus,
    calibrationRetries,
    facingMode,
    startPoseDetection,
    stopPoseDetection,
  ])

  // Check if body is aligned with outline
  useEffect(() => {
    if (calibrationStatus === "calibrating" && videoRef.current && outlineRef.current) {
      // Show manual start button after 3 seconds (reduced from 5)
      const timer = setTimeout(() => {
        setShowManualStart(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [calibrationStatus])

  // Handle body alignment detection
  useEffect(() => {
    if (calibrationStatus === "calibrating" && bodyAlignmentStatus === "aligning") {
      const timer = setTimeout(() => {
        setAlignmentTimer((prev) => {
          const newValue = prev + 1
          if (newValue >= 2) {
            // 2 seconds of alignment
            setBodyAlignmentStatus("aligned")
            return 0
          }
          return newValue
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [calibrationStatus, bodyAlignmentStatus, alignmentTimer])

  // Auto-proceed when body is aligned or detection is good
  useEffect(() => {
    if ((bodyAlignmentStatus === "aligned" || detectionStatus === "good") && calibrationStatus === "calibrating") {
      // Auto-proceed to exercise
      setCalibrationStatus("complete")
    }
  }, [bodyAlignmentStatus, calibrationStatus, detectionStatus])

  // Update keypoint detection
  useEffect(() => {
    if (calibrationStatus === "calibrating") {
      setShowBodyOutline(true)
      const visibleKeypoints = detectedPose?.keypoints?.filter((kp) => kp.score && kp.score > 0.1).length || 0
      setDetectedKeypoints(visibleKeypoints)

      // If we detect at least 5 keypoints, consider the body as "aligning"
      if (visibleKeypoints >= 5 && bodyAlignmentStatus === "not-aligned") {
        setBodyAlignmentStatus("aligning")
      } else if (visibleKeypoints < 5 && bodyAlignmentStatus !== "not-aligned") {
        setBodyAlignmentStatus("not-aligned")
        setAlignmentTimer(0)
      }

      // Traditional keypoint-based progression (as backup)
      if (visibleKeypoints >= 8) {
        // Reduced from 10
        const timer = setTimeout(() => {
          setCountdownValue((prev) => {
            if (prev <= 1) {
              setCalibrationStatus("complete")
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearTimeout(timer)
      } else {
        setCountdownValue(3)
      }
    }
  }, [calibrationStatus, detectedPose, bodyAlignmentStatus])

  const handleStartCalibration = () => {
    setShowInstructions(false)
    startPoseDetection()
    setCalibrationStatus("calibrating")
  }

  const handleManualStart = () => {
    forceDectection()
    setCalibrationStatus("complete")
    setShowManualStart(false)
  }

  const handleExitExercise = () => {
    stopPoseDetection()
    router.push("/dashboard")
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Reference image for the exercise
  const referenceImage = (
    <div className="absolute bottom-32 right-5 h-32 w-24 overflow-hidden rounded-lg bg-white">
      <Image
        src={`/assets/${exerciseId}-demo.gif`}
        alt={`${exerciseId} reference`}
        width={120}
        height={200}
        className="h-full w-full object-cover"
      />
    </div>
  )

  // Instructions modal
  const instructionsModal = (
    <AnimatePresence>
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 p-6"
        >
          <div className="max-w-md rounded-2xl bg-gray-900 p-6 text-center">
            <div className="mb-6 flex justify-center">
              <Volume2 className="h-16 w-16 text-emerald-500" />
            </div>
            <h2 className="mb-4 text-2xl font-bold">Check your volume</h2>
            <p className="mb-8 text-gray-400">Make sure your volume is turned up so you can hear the instructions</p>

            <div className="mb-4 flex justify-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-700" />
              <div className="h-2 w-2 rounded-full bg-gray-700" />
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <div className="h-2 w-2 rounded-full bg-gray-700" />
              <div className="h-2 w-2 rounded-full bg-gray-700" />
            </div>

            <Button
              onClick={handleStartCalibration}
              className="w-full bg-white py-6 text-lg text-black hover:bg-gray-200"
            >
              Got it
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Calibration overlay
  const calibrationOverlay = (
    <AnimatePresence>
      {calibrationStatus === "calibrating" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-6"
        >
          <div className="mb-4 text-center">
            <div className="mb-2 text-sm text-gray-400">
              {bodyAlignmentStatus === "not-aligned" && "Stand in the red outline"}
              {bodyAlignmentStatus === "aligning" && "Hold position..."}
              {bodyAlignmentStatus === "aligned" && "Perfect! Starting exercise..."}
            </div>

            {/* Body alignment indicator */}
            <div className="flex justify-center items-center mb-4">
              {bodyAlignmentStatus === "not-aligned" && (
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
                  <span className="text-yellow-500 font-medium">Position your body in the outline</span>
                </div>
              )}
              {bodyAlignmentStatus === "aligning" && (
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mr-2"></div>
                  <span className="text-blue-500 font-medium">Hold still for {2 - alignmentTimer} more seconds</span>
                </div>
              )}
              {bodyAlignmentStatus === "aligned" && (
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-emerald-500 mr-2" />
                  <span className="text-emerald-500 font-medium">Body aligned! Starting exercise...</span>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-4 rounded-full ${i < detectedKeypoints ? "bg-emerald-500" : "bg-gray-700"}`}
                />
              ))}
            </div>
          </div>

          {detectedKeypoints >= 8 && <div className="text-6xl font-bold text-white">{countdownValue}</div>}

          <div className="mt-4 text-center">
            <h3 className="text-2xl font-bold">
              {detectedKeypoints >= 8 ? "Hold still" : "Move back until your body fits the outline"}
            </h3>
            <p className="mt-2 text-gray-400">
              {detectedKeypoints >= 8 ? "Calibrating your pose" : "Make sure your entire body is visible"}
            </p>
          </div>

          {/* Detection status indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                detectionStatus === "none"
                  ? "bg-red-500"
                  : detectionStatus === "partial"
                    ? "bg-yellow-500"
                    : "bg-green-500"
              } animate-pulse`}
            ></div>
            <span className="text-sm text-gray-300">
              {detectionStatus === "none"
                ? "No detection"
                : detectionStatus === "partial"
                  ? "Partial detection"
                  : "Good detection"}
            </span>
          </div>

          {/* Help buttons */}
          <div className="mt-6 flex flex-col gap-4 max-w-md w-full">
            {showManualStart && (
              <Button
                onClick={handleManualStart}
                className="w-full bg-emerald-500 hover:bg-emerald-600 animate-pulse"
                size="lg"
              >
                <ZapIcon className="mr-2 h-5 w-5" />
                Start Exercise Without Detection
              </Button>
            )}

            <Button
              onClick={() => setShowTroubleshooting(true)}
              className="bg-gray-700 hover:bg-gray-600"
              variant="outline"
            >
              <Info className="mr-2 h-5 w-5" />
              Troubleshooting Tips
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Troubleshooting modal
  const troubleshootingModal = (
    <AnimatePresence>
      {showTroubleshooting && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6"
        >
          <div className="max-w-md rounded-2xl bg-gray-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-center">Troubleshooting</h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-bold text-emerald-500 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    1
                  </span>
                  Lighting
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Make sure you're in a well-lit area. Avoid backlighting (don't stand in front of a window).
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-bold text-emerald-500 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    2
                  </span>
                  Distance
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Try the 0.5x zoom option and move 6-8 feet away from the camera so your entire body is visible.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-bold text-emerald-500 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    3
                  </span>
                  Clothing
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Wear contrasting clothes (different from your background). Avoid loose/baggy clothing.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-bold text-emerald-500 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    4
                  </span>
                  Background
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Use a clean, uncluttered background. Solid colored walls work best.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-bold text-emerald-500 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    5
                  </span>
                  Device Position
                </h3>
                <p className="text-sm text-gray-300 mt-1">
                  Place your device at waist height for best results. Try different angles.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowTroubleshooting(false)
                  handleManualStart()
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                Skip Detection
              </Button>
              <Button onClick={() => setShowTroubleshooting(false)} className="flex-1" variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Counting help modal
  const countingHelpModal = (
    <AnimatePresence>
      {showCountingHelp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute inset-x-4 top-20 z-20 rounded-xl bg-white p-4 text-black shadow-lg"
        >
          <h3 className="mb-2 text-lg font-bold">Counting Tips</h3>
          <p className="mb-3 text-sm">
            Make sure your entire body is visible and you're performing the full range of motion for each rep.
          </p>
          <ul className="mb-3 list-inside list-disc text-sm">
            <li>Stand with feet shoulder-width apart</li>
            <li>Keep your back straight</li>
            <li>Lower until thighs are parallel to ground</li>
            <li>Push through heels to return up</li>
          </ul>
          <Button
            onClick={() => setShowCountingHelp(false)}
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Got it
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Positioning guide
  const positioningGuide = (
    <div className="absolute inset-0 z-5 pointer-events-none">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-red-500/50 w-[60%] h-[80%] rounded-lg"></div>

      {/* Human silhouette for positioning */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20">
        <svg width="200" height="400" viewBox="0 0 200 400" fill="none">
          <path
            d="M100,80 C115,80 130,65 130,50 C130,35 115,20 100,20 C85,20 70,35 70,50 C70,65 85,80 100,80 Z"
            fill="white"
          />
          <path
            d="M100,80 L100,220 M100,120 L70,180 M100,120 L130,180 M100,220 L70,320 M100,220 L130,320"
            stroke="white"
            strokeWidth="10"
            opacity="0.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )

  // Debug overlay
  const debugOverlay = (
    <div className="absolute top-20 left-4 right-4 bg-black/70 p-2 rounded text-xs text-white z-20">
      <p>{debugInfo}</p>
      <p>Detected keypoints: {detectedKeypoints}/17</p>
      <p>Exercise count: {exerciseCount}</p>
      <p>Exercise time: {formatTime(exerciseTime)}</p>
      <p>Zoom level: {zoomLevel}x</p>
      <p>Detection status: {detectionStatus}</p>
      <p>Calibration retries: {calibrationRetries}</p>
    </div>
  )

  return (
    <div className="relative flex h-screen flex-col bg-black">
      {/* Status bar */}
      <div className="h-10 w-full bg-black flex items-center justify-center">
        <div className="w-64 h-4 rounded-full bg-black border border-gray-800">
          <div className="h-2 w-2 rounded-full bg-green-500 mx-auto my-1" />
        </div>
      </div>

      {/* Exercise name header */}
      <div className="w-full bg-black/50 backdrop-blur-sm p-4 border-b border-gray-800">
        <h1 className="text-4xl font-bold text-white">{currentExercise.name}</h1>
      </div>

      {/* Debug toggle */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="absolute top-4 left-4 z-30 bg-gray-800/80 rounded-full p-2"
      >
        <span className="text-xs">DEBUG</span>
      </button>

      {/* Show debug info if enabled */}
      {showDebug && debugOverlay}

      {/* Counting issues help button */}
      {calibrationStatus === "complete" && (
        <button
          onClick={() => setShowCountingHelp(true)}
          className="absolute top-20 left-0 right-0 z-10 flex items-center justify-start gap-2 bg-blue-100/80 py-3 px-4 text-blue-900"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-900">
            <LightbulbIcon className="h-3 w-3" />
          </div>
          <span className="text-sm font-medium">Counting issues? Press here!</span>
        </button>
      )}

      {/* Zoom control */}
      {(calibrationStatus === "calibrating" || calibrationStatus === "complete") && (
        <CameraZoomControl videoRef={videoRef} onZoomChange={handleZoomChange} />
      )}

      <div className="relative flex-1">
        {/* Camera video feed */}
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay playsInline muted />

        {/* Canvas for drawing pose skeleton */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Positioning guide */}
        {calibrationStatus === "calibrating" && positioningGuide}

        {/* Body outline reference */}
        <div ref={outlineRef}>{(showBodyOutline || calibrationStatus === "complete") && <BodyOutline />}</div>

        {/* Loading indicator */}
        {isModelLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="loader mb-4"></div>
            <p className="text-white text-center">
              Loading pose detection model
              <br />
              This may take a few moments...
            </p>
          </div>
        )}

        {/* Instructions modal */}
        {instructionsModal}

        {/* Calibration overlay */}
        {calibrationOverlay}

        {/* Troubleshooting modal */}
        {troubleshootingModal}

        {/* Counting help modal */}
        {countingHelpModal}

        {/* Reference image when exercise is active */}
        {calibrationStatus === "complete" && referenceImage}
      </div>

      {/* Exercise info bar */}
      {calibrationStatus === "complete" && (
        <>
          {/* Counter and timer */}
          <div className="absolute bottom-20 left-0 right-0 bg-gray-300/80 p-4 flex justify-between items-center">
            <div className="text-left">
              <div className="text-5xl font-bold text-navy-900">
                <span className="text-3xl">x</span>
                {exerciseCount}
                <span className="text-gray-600">/{currentExercise.totalReps}</span>
              </div>
              <div className="text-xl font-mono text-gray-600">0000</div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-navy-900">{formatTime(exerciseTime)}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-16 left-4 right-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(exerciseCount / currentExercise.totalReps) * 100}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Exit button */}
      <button
        onClick={handleExitExercise}
        className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
