"use client"

import { useState, useEffect, useRef, type MutableRefObject } from "react"
import * as tf from "@tensorflow/tfjs"

// Define types for our pose detection
type Keypoint = {
  x: number
  y: number
  score?: number
  name?: string
}

type Pose = {
  keypoints: Keypoint[]
  score?: number
}

type PoseDetectionState = {
  isModelLoading: boolean
  detectedPose: Pose | null
  exerciseCount: number
  exerciseTime: number
  startPoseDetection: (facingMode?: "user" | "environment") => Promise<void>
  stopPoseDetection: () => void
}

// Keypoint names in the order they appear in MoveNet output
const KEYPOINT_NAMES = [
  "nose",
  "left_eye",
  "right_eye",
  "left_ear",
  "right_ear",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
]

export function usePoseDetection(
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  exerciseType: string,
  initialFacingMode: "user" | "environment" = "user",
): PoseDetectionState {
  const [model, setModel] = useState<tf.GraphModel | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [detectedPose, setDetectedPose] = useState<Pose | null>(null)
  const [exerciseCount, setExerciseCount] = useState(0)
  const [exerciseTime, setExerciseTime] = useState(0)
  const [currentFacingMode, setCurrentFacingMode] = useState<"user" | "environment">(initialFacingMode)

  const requestAnimationRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const lastExerciseStateRef = useRef<string>("unknown") // For tracking exercise state (up/down)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize TensorFlow and load MoveNet model
  async function loadModel() {
    setIsModelLoading(true)

    try {
      // Make sure TensorFlow.js is properly initialized
      await tf.ready()

      // Set the backend to WebGL for better performance
      await tf.setBackend("webgl")

      // Load MoveNet model directly
      const movenetModel = await tf.loadGraphModel(
        "https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4",
        { fromTFHub: true },
      )

      setModel(movenetModel)
      setIsModelLoading(false)

      console.log("MoveNet model loaded successfully")
    } catch (error) {
      console.error("Error loading MoveNet model:", error)
      setIsModelLoading(false)
    }
  }

  // Function to start camera feed
  async function setupCamera(facingMode: "user" | "environment" = currentFacingMode) {
    if (!videoRef.current) return

    try {
      // Try to get the specified camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCurrentFacingMode(facingMode)
        }
      } catch (error) {
        // If specified camera fails, try the other one
        console.log(`${facingMode} camera not available, trying alternative camera`)
        const alternateFacingMode = facingMode === "user" ? "environment" : "user"

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: alternateFacingMode },
            audio: false,
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            setCurrentFacingMode(alternateFacingMode)
          }
        } catch (fallbackError) {
          console.error("Both cameras failed:", fallbackError)
          // Try with no constraints as last resort
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        }
      }

      return new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => resolve())
                .catch((e) => {
                  console.error("Error playing video:", e)
                  resolve()
                })
            } else {
              resolve()
            }
          }
        } else {
          resolve()
        }
      })
    } catch (error) {
      console.error("Error setting up camera:", error)
    }
  }

  // Detect poses using MoveNet
  async function detectPose() {
    if (!model || !videoRef.current || !canvasRef.current || !isRunningRef.current) return

    try {
      // Prepare input for the model
      const video = videoRef.current

      // MoveNet requires a specific input size
      const imageTensor = tf.browser.fromPixels(video)
      const input = tf.image.resizeBilinear(imageTensor, [192, 192])
      const expandedInput = tf.expandDims(input, 0)

      // Run inference
      const output = model.predict(expandedInput) as tf.Tensor

      // Process the output to get keypoints
      const keypointsArray = await output.array()
      const keypoints = keypointsArray[0][0].map((keypoint: number[], i: number) => {
        // MoveNet returns keypoints as [y, x, score]
        return {
          y: keypoint[0] * video.height,
          x: keypoint[1] * video.width,
          score: keypoint[2],
          name: KEYPOINT_NAMES[i],
        }
      })

      const pose: Pose = { keypoints }
      setDetectedPose(pose)

      // Draw the pose
      drawPose(pose)

      // Process exercise based on pose
      processExercise(pose)

      // Clean up tensors to prevent memory leaks
      imageTensor.dispose()
      input.dispose()
      expandedInput.dispose()
      output.dispose()
    } catch (error) {
      console.error("Error during pose detection:", error)
    }

    // Continue detection loop
    requestAnimationRef.current = requestAnimationFrame(detectPose)
  }

  // Process exercise based on detected pose
  function processExercise(pose: Pose) {
    if (!pose.keypoints || pose.keypoints.length < 17) return

    // Different logic based on exercise type
    switch (exerciseType) {
      case "squats":
        detectSquats(pose)
        break
      case "pushups":
        detectPushups(pose)
        break
      case "planks":
        detectPlanks(pose)
        break
    }
  }

  // Detect squat movement
  function detectSquats(pose: Pose) {
    const keypoints = pose.keypoints

    // Get relevant keypoints
    const leftHip = keypoints.find((kp) => kp.name === "left_hip")
    const leftKnee = keypoints.find((kp) => kp.name === "left_knee")
    const leftAnkle = keypoints.find((kp) => kp.name === "left_ankle")
    const rightHip = keypoints.find((kp) => kp.name === "right_hip")
    const rightKnee = keypoints.find((kp) => kp.name === "right_knee")
    const rightAnkle = keypoints.find((kp) => kp.name === "right_ankle")

    // Check if we have enough keypoints with good confidence
    if (
      leftHip &&
      leftKnee &&
      leftAnkle &&
      rightHip &&
      rightKnee &&
      rightAnkle &&
      leftHip.score &&
      leftKnee.score &&
      leftAnkle.score &&
      rightHip.score &&
      rightKnee.score &&
      rightAnkle.score &&
      leftHip.score > 0.5 &&
      leftKnee.score > 0.5 &&
      leftAnkle.score > 0.5 &&
      rightHip.score > 0.5 &&
      rightKnee.score > 0.5 &&
      rightAnkle.score > 0.5
    ) {
      // Calculate knee angles for both legs
      const leftAngle = calculateAngle([leftHip.x, leftHip.y], [leftKnee.x, leftKnee.y], [leftAnkle.x, leftAnkle.y])

      const rightAngle = calculateAngle(
        [rightHip.x, rightHip.y],
        [rightKnee.x, rightKnee.y],
        [rightAnkle.x, rightAnkle.y],
      )

      // Average both angles for better accuracy
      const avgAngle = (leftAngle + rightAngle) / 2

      // Detect squat based on knee angle
      // Lower threshold for "down" position
      if (avgAngle < 100 && lastExerciseStateRef.current === "up") {
        // User is in squat position
        lastExerciseStateRef.current = "down"
        console.log("Squat down detected", avgAngle)
      }
      // Higher threshold for "up" position to avoid false positives
      else if (avgAngle > 150 && lastExerciseStateRef.current === "down") {
        // User has come back up - count the rep
        lastExerciseStateRef.current = "up"
        setExerciseCount((prev) => prev + 1)
        console.log("Squat up detected - counting rep", avgAngle)
      } else if (lastExerciseStateRef.current === "unknown") {
        // Initial state - determine if user is standing or squatting
        if (avgAngle > 150) {
          lastExerciseStateRef.current = "up"
          console.log("Initial position: standing", avgAngle)
        } else if (avgAngle < 100) {
          lastExerciseStateRef.current = "down"
          console.log("Initial position: squatting", avgAngle)
        }
      }
    }
  }

  // Detect pushup movement
  function detectPushups(pose: Pose) {
    const keypoints = pose.keypoints

    // Get relevant keypoints
    const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder")
    const leftElbow = keypoints.find((kp) => kp.name === "left_elbow")
    const leftWrist = keypoints.find((kp) => kp.name === "left_wrist")

    if (leftShoulder && leftElbow && leftWrist && leftShoulder.score && leftElbow.score && leftWrist.score > 0.5) {
      // Calculate elbow angle
      const angle = calculateAngle(
        [leftShoulder.x, leftShoulder.y],
        [leftElbow.x, leftElbow.y],
        [leftWrist.x, leftWrist.y],
      )

      // Detect pushup based on elbow angle
      if (angle < 90 && lastExerciseStateRef.current === "up") {
        // User is in down position
        lastExerciseStateRef.current = "down"
      } else if (angle > 160 && lastExerciseStateRef.current === "down") {
        // User has pushed back up - count the rep
        lastExerciseStateRef.current = "up"
        setExerciseCount((prev) => prev + 1)
      } else if (lastExerciseStateRef.current === "unknown" && angle > 160) {
        // Initial state - user is in up position
        lastExerciseStateRef.current = "up"
      }
    }
  }

  // Detect plank position and duration
  function detectPlanks(pose: Pose) {
    const keypoints = pose.keypoints

    // Check if body is in plank position (flat back, supported by arms)
    const nose = keypoints.find((kp) => kp.name === "nose")
    const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder")
    const leftHip = keypoints.find((kp) => kp.name === "left_hip")
    const leftKnee = keypoints.find((kp) => kp.name === "left_knee")
    const leftAnkle = keypoints.find((kp) => kp.name === "left_ankle")

    if (
      nose &&
      leftShoulder &&
      leftHip &&
      leftKnee &&
      leftAnkle &&
      nose.score &&
      leftShoulder.score &&
      leftHip.score &&
      leftKnee.score &&
      leftAnkle.score > 0.5
    ) {
      // Check if body is roughly horizontal
      const hipToShoulderYDiff = Math.abs(leftHip.y - leftShoulder.y)

      if (hipToShoulderYDiff < 30) {
        // Body is in plank position
        if (lastExerciseStateRef.current !== "plank") {
          lastExerciseStateRef.current = "plank"
          // Start counting or continue counting
        }
      } else {
        if (lastExerciseStateRef.current === "plank") {
          lastExerciseStateRef.current = "unknown"
          // User stopped plank - could update UI
        }
      }
    }
  }

  // Helper function to calculate angle between three points
  function calculateAngle(p1: [number, number], p2: [number, number], p3: [number, number]): number {
    const radians = Math.atan2(p3[1] - p2[1], p3[0] - p2[0]) - Math.atan2(p1[1] - p2[1], p1[0] - p2[0])
    let angle = Math.abs((radians * 180.0) / Math.PI)

    if (angle > 180.0) {
      angle = 360.0 - angle
    }

    return angle
  }

  // Draw pose on canvas
  function drawPose(pose: Pose) {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx || !canvasRef.current) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Set canvas dimensions to match video
    if (videoRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
    }

    // Draw keypoints
    if (pose.keypoints) {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score && keypoint.score > 0.5) {
          ctx.beginPath()
          ctx.arc(keypoint.x, keypoint.y, 8, 0, 2 * Math.PI)
          ctx.fillStyle = "#10b981" // Green color
          ctx.fill()
        }
      })

      // Draw skeleton connections
      drawSkeleton(ctx, pose.keypoints)
    }
  }

  // Draw skeleton connections between keypoints
  function drawSkeleton(ctx: CanvasRenderingContext2D, keypoints: Keypoint[]) {
    // Define connections between keypoints for full body
    const connections = [
      ["nose", "left_eye"],
      ["nose", "right_eye"],
      ["left_eye", "left_ear"],
      ["right_eye", "right_ear"],
      ["nose", "left_shoulder"],
      ["nose", "right_shoulder"],
      ["left_shoulder", "left_elbow"],
      ["right_shoulder", "right_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_elbow", "right_wrist"],
      ["left_shoulder", "right_shoulder"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
      ["left_hip", "right_hip"],
      ["left_hip", "left_knee"],
      ["right_hip", "right_knee"],
      ["left_knee", "left_ankle"],
      ["right_knee", "right_ankle"],
    ]

    // Draw each connection
    connections.forEach(([startPoint, endPoint]) => {
      const start = keypoints.find((kp) => kp.name === startPoint)
      const end = keypoints.find((kp) => kp.name === endPoint)

      if (start && end && start.score && end.score && start.score > 0.5 && end.score > 0.5) {
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.lineWidth = 4
        ctx.strokeStyle = "#10b981" // Green color
        ctx.stroke()
      }
    })
  }

  // Start pose detection process
  async function startPoseDetection(facingMode?: "user" | "environment") {
    if (!model) {
      await loadModel()
    }

    await setupCamera(facingMode || currentFacingMode)

    if (videoRef.current && canvasRef.current) {
      // Set canvas size initially
      canvasRef.current.width = videoRef.current.videoWidth || 640
      canvasRef.current.height = videoRef.current.videoHeight || 480

      // Start detection loop
      isRunningRef.current = true
      requestAnimationRef.current = requestAnimationFrame(detectPose)

      // Start exercise timer
      timerRef.current = setInterval(() => {
        if (isRunningRef.current) {
          setExerciseTime((prev) => prev + 1)
        }
      }, 1000)
    }
  }

  // Stop pose detection and clean up
  function stopPoseDetection() {
    isRunningRef.current = false

    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current)
      requestAnimationRef.current = null
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Stop camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Clean up on component unmount
  useEffect(() => {
    loadModel()

    return () => {
      stopPoseDetection()
      // Clean up model if needed
      if (model) {
        // No explicit cleanup needed for TF.js models
      }
    }
  }, [])

  return {
    isModelLoading,
    detectedPose,
    exerciseCount,
    exerciseTime,
    startPoseDetection,
    stopPoseDetection,
  }
}
