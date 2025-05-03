"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, X, LightbulbIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePoseDetection } from "@/hooks/use-pose-detection"
import { CameraSwitcher } from "@/components/camera-switcher"
import { BodyOutline } from "@/components/body-outline"

type CalibrationStatus = "waiting" | "calibrating" | "complete"
type PositioningState = "face-camera" | "move-back" | "move-closer" | "center" | "good"

export default function ExerciseCameraPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCamera = (searchParams.get("camera") as "user" | "environment") || "user"

  const exerciseId = params.id
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [showInstructions, setShowInstructions] = useState(true)
  const [calibrationStatus, setCalibrationStatus] = useState<CalibrationStatus>("waiting")
  const [detectedKeypoints, setDetectedKeypoints] = useState(0)
  const [countdownValue, setCountdownValue] = useState(3)
  const [showBodyOutline, setShowBodyOutline] = useState(false)
  const [facingMode, setFacingMode] = useState<"user" | "environment">(initialCamera)
  const [positioning, setPositioning] = useState<PositioningState>("face-camera")
  const [showCountingHelp, setShowCountingHelp] = useState(false)

  // Exercise data
  const exerciseData = {
    squats: { name: "Squats", totalReps: 5 },
    pushups: { name: "Push Ups", totalReps: 5 },
    planks: { name: "Planks", totalReps: 1 },
  }

  const currentExercise = exerciseData[exerciseId as keyof typeof exerciseData] || { name: "Exercise", totalReps: 5 }

  const { isModelLoading, startPoseDetection, stopPoseDetection, detectedPose, exerciseCount, exerciseTime } =
    usePoseDetection(videoRef, canvasRef, exerciseId, facingMode)

  useEffect(() => {
    if (calibrationStatus === "calibrating") {
      setShowBodyOutline(true)
      const visibleKeypoints = detectedPose?.keypoints?.filter((kp) => kp.score && kp.score > 0.5).length || 0
      setDetectedKeypoints(visibleKeypoints)

      if (visibleKeypoints >= 12) {
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
  }, [calibrationStatus, detectedPose])

  // Update positioning state based on pose detection
  useEffect(() => {
    if (calibrationStatus === "complete" && detectedPose) {
      const keypoints = detectedPose.keypoints
      const visibleKeypoints = keypoints.filter((kp) => kp.score && kp.score > 0.5).length

      if (visibleKeypoints < 10) {
        setPositioning("face-camera")
      } else {
        // Check if person is centered
        const nose = keypoints.find((kp) => kp.name === "nose")
        if (nose && videoRef.current) {
          const centerX = videoRef.current.videoWidth / 2
          const distanceFromCenter = Math.abs(nose.x - centerX)

          if (distanceFromCenter > videoRef.current.videoWidth * 0.3) {
            setPositioning("center")
          } else {
            setPositioning("good")
          }
        } else {
          setPositioning("face-camera")
        }
      }
    }
  }, [calibrationStatus, detectedPose])

  const handleStartCalibration = () => {
    setShowInstructions(false)
    startPoseDetection()
    setCalibrationStatus("calibrating")
  }

  const handleExitExercise = () => {
    stopPoseDetection()
    router.push("/dashboard")
  }

  const handleCameraSwitch = (newFacingMode: "user" | "environment") => {
    setFacingMode(newFacingMode)
    // Restart pose detection with new camera
    if (calibrationStatus !== "waiting") {
      stopPoseDetection()
      setTimeout(() => {
        startPoseDetection(newFacingMode)
      }, 500)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Reference image for the exercise
  const referenceImage = (
    <div className="absolute bottom-32 left-5 h-32 w-24 overflow-hidden rounded-lg bg-white">
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
            <div className="mb-2 text-sm text-gray-400">Detecting keypoints</div>
            <div className="flex justify-center space-x-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-4 rounded-full ${i < detectedKeypoints ? "bg-emerald-500" : "bg-gray-700"}`}
                />
              ))}
            </div>
          </div>

          {detectedKeypoints >= 12 && <div className="text-6xl font-bold text-white">{countdownValue}</div>}

          <div className="mt-4 text-center">
            <h3 className="text-2xl font-bold">
              {detectedKeypoints >= 12 ? "Hold still" : "Move back until your body fits the outline"}
            </h3>
            <p className="mt-2 text-gray-400">
              {detectedKeypoints >= 12 ? "Calibrating your pose" : "Make sure your entire body is visible"}
            </p>
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

      {/* Counting issues help button */}
      <button
        onClick={() => setShowCountingHelp(true)}
        className="absolute top-20 left-0 right-0 z-10 flex items-center justify-start gap-2 bg-blue-100/80 py-3 px-4 text-blue-900"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-900">
          <LightbulbIcon className="h-3 w-3" />
        </div>
        <span className="text-sm font-medium">Counting issues? Press here!</span>
      </button>

      {/* Camera Switcher */}
      {(calibrationStatus === "calibrating" || calibrationStatus === "complete") && (
        <CameraSwitcher videoRef={videoRef} onCameraSwitch={handleCameraSwitch} />
      )}

      <div className="relative flex-1">
        {/* Camera video feed */}
        <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay playsInline muted />

        {/* Canvas for drawing pose skeleton */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Body outline reference */}
        {(showBodyOutline || calibrationStatus === "complete") && <BodyOutline />}

        {/* Loading indicator */}
        {isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="loader"></div>
          </div>
        )}

        {/* Instructions modal */}
        {instructionsModal}

        {/* Calibration overlay */}
        {calibrationOverlay}

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

          {/* Positioning instructions */}
          <div className="absolute bottom-0 left-0 right-0 bg-blue-500 p-4 flex items-center">
            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                  stroke="#1E40AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 12V21" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 16H16" stroke="#1E40AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-xl font-bold text-white uppercase">Positioning:</div>
              <div className="text-4xl font-bold text-white uppercase">
                {positioning === "face-camera" && "FACE THE CAMERA"}
                {positioning === "move-back" && "MOVE BACK"}
                {positioning === "move-closer" && "MOVE CLOSER"}
                {positioning === "center" && "CENTER YOURSELF"}
                {positioning === "good" && "GOOD POSITION"}
              </div>
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
