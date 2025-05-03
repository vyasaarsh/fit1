"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePoseDetection } from "../../../../hooks/use-pose-detection"
import { CameraSwitcher } from "../../../../components/camera-switcher"
import { BodyOutline } from "../../../../components/body-outline"

type CalibrationStatus = "waiting" | "calibrating" | "complete"

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
              setShowBodyOutline(false)
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

  // Display the reference image when exercise is active
  const referenceImage = (
    <div className="absolute bottom-5 right-5 h-32 w-24 overflow-hidden rounded-lg bg-white">
      <Image
        src="/placeholder.svg?height=200&width=120"
        alt="Reference pose"
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

  return (
    <div className="relative flex h-screen flex-col bg-black">
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleExitExercise}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

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
        {showBodyOutline && <BodyOutline />}

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

        {/* Reference image when exercise is active */}
        {calibrationStatus === "complete" && referenceImage}
      </div>

      {/* Exercise info bar */}
      {calibrationStatus === "complete" && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
          <div className="text-center">
            <div className="text-7xl font-bold">{exerciseCount}</div>
            <div className="text-xl">{exerciseId.charAt(0).toUpperCase() + exerciseId.slice(1)}</div>
            <div className="mt-2 text-4xl font-medium">
              {String(Math.floor(exerciseTime / 60)).padStart(2, "0")}:{String(exerciseTime % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
