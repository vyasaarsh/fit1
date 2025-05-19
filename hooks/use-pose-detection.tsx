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
  debugInfo: string
  detectionStatus: "none" | "partial" | "good"
  forceDectection: () => void
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
  const [debugInfo, setDebugInfo] = useState("")
  const [detectionStatus, setDetectionStatus] = useState<"none" | "partial" | "good">("none")
  const [attemptCount, setAttemptCount] = useState(0)

  const requestAnimationRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)
  const lastExerciseStateRef = useRef<string>("unknown") // For tracking exercise state (up/down)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const confidenceThreshold = 0.1 // Even lower threshold for keypoint detection (was 0.2)
  const lastAngleRef = useRef<number>(0)
  const angleHistoryRef = useRef<number[]>([])
  const repInProgressRef = useRef(false)
  const detectionHistoryRef = useRef<number[]>([])

  // Force detection if needed
  const forceDectection = () => {
    setDetectionStatus("good")
    setDebugInfo("Detection forced by user")
  }

  // Initialize TensorFlow and load MoveNet model
  async function loadModel() {
    setIsModelLoading(true)
    setDebugInfo("Loading TensorFlow.js and MoveNet model...")

    try {
      // Make sure TensorFlow.js is properly initialized
      await tf.ready()

      // Set the backend to WebGL for better performance
      try {
        await tf.setBackend("webgl")
        console.log("Using WebGL backend")
        setDebugInfo("Using WebGL backend for better performance")
      } catch (e) {
        console.log("WebGL backend failed, falling back to CPU", e)
        await tf.setBackend("cpu")
        setDebugInfo("Using CPU backend (WebGL not available)")
      }

      console.log("TensorFlow.js initialized with backend:", tf.getBackend())
      setDebugInfo(`TensorFlow.js initialized with backend: ${tf.getBackend()}`)

      try {
        // Load MoveNet model (with a timeout)
        const modelPromise = tf.loadGraphModel("https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4", {
          fromTFHub: true,
        })

        // Add a timeout for model loading
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Model loading timed out after 20 seconds")), 20000),
        )

        // Race the model loading against the timeout
        const movenetModel = (await Promise.race([modelPromise, timeoutPromise])) as tf.GraphModel

        setModel(movenetModel)
        setIsModelLoading(false)
        setDebugInfo("MoveNet model loaded successfully")
        console.log("MoveNet model loaded successfully")
      } catch (error) {
        console.error("Error loading MoveNet model:", error)
        setIsModelLoading(false)
        setDebugInfo(`Error loading model: ${error}. Try reloading the page.`)
      }
    } catch (error) {
      console.error("Error initializing TensorFlow:", error)
      setIsModelLoading(false)
      setDebugInfo(`Error initializing TensorFlow: ${error}`)
    }
  }

  // Function to start camera feed
  async function setupCamera(facingMode: "user" | "environment" = currentFacingMode) {
    if (!videoRef.current) return

    try {
      // Try to get the specified camera
      try {
        console.log("Attempting to access camera with facing mode:", facingMode)
        setDebugInfo(`Accessing camera (${facingMode})...`)

        const constraints = {
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCurrentFacingMode(facingMode)
          console.log("Camera accessed successfully with facing mode:", facingMode)
          setDebugInfo(
            `Camera accessed (${facingMode}) at resolution: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
          )
        }
      } catch (error) {
        // If specified camera fails, try with no constraints as last resort
        console.log("Camera access failed, trying with basic constraints", error)
        setDebugInfo(`Camera access failed: ${error}. Trying with basic constraints...`)

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })

          if (videoRef.current) {
            videoRef.current.srcObject = stream
            console.log("Camera accessed with basic constraints")
            setDebugInfo("Camera accessed with basic constraints")
          }
        } catch (fallbackError) {
          console.error("All camera access attempts failed:", fallbackError)
          setDebugInfo(`CAMERA ACCESS FAILED: ${fallbackError}. Please check your camera permissions.`)
        }
      }

      return new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current
                .play()
                .then(() => {
                  console.log("Video playback started")
                  setDebugInfo(
                    `Video playback started at ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`,
                  )
                  resolve()
                })
                .catch((e) => {
                  console.error("Error playing video:", e)
                  setDebugInfo(`Error playing video: ${e}`)
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
      setDebugInfo(`Error setting up camera: ${error}`)
    }
  }

  // Detect poses using MoveNet
  async function detectPose() {
    if (!model || !videoRef.current || !canvasRef.current || !isRunningRef.current) return

    try {
      // Check if video is actually playing and has dimensions
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        setDebugInfo("Video dimensions are zero. Camera may not be initialized properly.")
        requestAnimationRef.current = requestAnimationFrame(detectPose)
        return
      }

      // Track detection attempts
      setAttemptCount((prev) => prev + 1)

      // Prepare input for the model
      const video = videoRef.current

      try {
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

        // Count visible keypoints
        const visibleKeypoints = keypoints.filter((kp) => kp.score && kp.score > confidenceThreshold).length

        // Add to detection history for stability
        detectionHistoryRef.current.push(visibleKeypoints)
        if (detectionHistoryRef.current.length > 10) {
          detectionHistoryRef.current.shift()
        }

        // Use average for more stability
        const avgVisibleKeypoints = Math.floor(
          detectionHistoryRef.current.reduce((sum, val) => sum + val, 0) / detectionHistoryRef.current.length,
        )

        // Update detection status
        if (avgVisibleKeypoints >= 10) {
          setDetectionStatus("good")
          setDebugInfo(`Detection good: ${avgVisibleKeypoints} keypoints visible`)
        } else if (avgVisibleKeypoints >= 5) {
          setDetectionStatus("partial")
          setDebugInfo(`Detection partial: ${avgVisibleKeypoints} keypoints visible`)
        } else {
          setDetectionStatus("none")
          setDebugInfo(
            `Detection poor: only ${avgVisibleKeypoints} keypoints visible. Try adjusting lighting or position.`,
          )
        }

        // Draw the pose
        drawPose(pose)

        // Process exercise based on pose if we have enough keypoints
        if (avgVisibleKeypoints >= 5) {
          processExercise(pose)
        }

        // Clean up tensors to prevent memory leaks
        imageTensor.dispose()
        input.dispose()
        expandedInput.dispose()
        output.dispose()
      } catch (error) {
        console.error("Error during pose inference:", error)
        setDebugInfo(`Error during pose inference: ${error}`)
      }
    } catch (error) {
      console.error("Error during pose detection:", error)
      setDebugInfo(`Error during pose detection: ${error}`)
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
    // Use either left or right leg, whichever has better visibility
    const useLeftLeg =
      leftHip?.score &&
      leftKnee?.score &&
      leftAnkle?.score &&
      leftHip.score > confidenceThreshold &&
      leftKnee.score > confidenceThreshold &&
      leftAnkle.score > confidenceThreshold

    const useRightLeg =
      rightHip?.score &&
      rightKnee?.score &&
      rightAnkle?.score &&
      rightHip.score > confidenceThreshold &&
      rightKnee.score > confidenceThreshold &&
      rightAnkle.score > confidenceThreshold

    if (useLeftLeg || useRightLeg) {
      let angle

      if (useLeftLeg) {
        angle = calculateAngle([leftHip!.x, leftHip!.y], [leftKnee!.x, leftKnee!.y], [leftAnkle!.x, leftAnkle!.y])
        setDebugInfo(`Left leg angle: ${angle.toFixed(1)}°, State: ${lastExerciseStateRef.current}`)
      } else {
        angle = calculateAngle([rightHip!.x, rightHip!.y], [rightKnee!.x, rightKnee!.y], [rightAnkle!.x, rightAnkle!.y])
        setDebugInfo(`Right leg angle: ${angle.toFixed(1)}°, State: ${lastExerciseStateRef.current}`)
      }

      // Add angle to history for smoothing
      angleHistoryRef.current.push(angle)
      if (angleHistoryRef.current.length > 5) {
        angleHistoryRef.current.shift()
      }

      // Calculate smoothed angle
      const smoothedAngle = angleHistoryRef.current.reduce((sum, val) => sum + val, 0) / angleHistoryRef.current.length

      // Detect squat based on knee angle with more lenient thresholds
      if (smoothedAngle < 120 && !repInProgressRef.current) {
        // User is starting a squat
        repInProgressRef.current = true
        lastExerciseStateRef.current = "down"
        setDebugInfo(`Squat started: ${smoothedAngle.toFixed(1)}°`)
      } else if (smoothedAngle > 150 && repInProgressRef.current) {
        // User has completed a squat
        repInProgressRef.current = false
        lastExerciseStateRef.current = "up"
        setExerciseCount((prev) => prev + 1)
        setDebugInfo(`Squat completed! Count: ${exerciseCount + 1}`)
      }

      lastAngleRef.current = angle
    } else {
      setDebugInfo("Leg keypoints not visible enough. Try adjusting your position or lighting.")
    }
  }

  // Detect pushup movement
  function detectPushups(pose: Pose) {
    const keypoints = pose.keypoints

    // Get relevant keypoints for both arms
    const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder")
    const leftElbow = keypoints.find((kp) => kp.name === "left_elbow")
    const leftWrist = keypoints.find((kp) => kp.name === "left_wrist")

    const rightShoulder = keypoints.find((kp) => kp.name === "right_shoulder")
    const rightElbow = keypoints.find((kp) => kp.name === "right_elbow")
    const rightWrist = keypoints.find((kp) => kp.name === "right_wrist")

    // Use either left or right arm, whichever has better visibility
    const useLeftArm =
      leftShoulder?.score &&
      leftElbow?.score &&
      leftWrist?.score &&
      leftShoulder.score > confidenceThreshold &&
      leftElbow.score > confidenceThreshold &&
      leftWrist.score > confidenceThreshold

    const useRightArm =
      rightShoulder?.score &&
      rightElbow?.score &&
      rightWrist?.score &&
      rightShoulder.score > confidenceThreshold &&
      rightElbow.score > confidenceThreshold &&
      rightWrist.score > confidenceThreshold

    if (useLeftArm || useRightArm) {
      let angle

      if (useLeftArm) {
        angle = calculateAngle(
          [leftShoulder!.x, leftShoulder!.y],
          [leftElbow!.x, leftElbow!.y],
          [leftWrist!.x, leftWrist!.y],
        )
        setDebugInfo(`Left arm angle: ${angle.toFixed(1)}°, State: ${lastExerciseStateRef.current}`)
      } else {
        angle = calculateAngle(
          [rightShoulder!.x, rightShoulder!.y],
          [rightElbow!.x, rightElbow!.y],
          [rightWrist!.x, rightWrist!.y],
        )
        setDebugInfo(`Right arm angle: ${angle.toFixed(1)}°, State: ${lastExerciseStateRef.current}`)
      }

      // Add angle to history for smoothing
      angleHistoryRef.current.push(angle)
      if (angleHistoryRef.current.length > 5) {
        angleHistoryRef.current.shift()
      }

      // Calculate smoothed angle
      const smoothedAngle = angleHistoryRef.current.reduce((sum, val) => sum + val, 0) / angleHistoryRef.current.length

      // Detect pushup with more lenient thresholds
      if (smoothedAngle < 100 && !repInProgressRef.current) {
        // User is starting a pushup (down position)
        repInProgressRef.current = true
        lastExerciseStateRef.current = "down"
        setDebugInfo(`Pushup started: ${smoothedAngle.toFixed(1)}°`)
      } else if (smoothedAngle > 140 && repInProgressRef.current) {
        // User has completed a pushup
        repInProgressRef.current = false
        lastExerciseStateRef.current = "up"
        setExerciseCount((prev) => prev + 1)
        setDebugInfo(`Pushup completed! Count: ${exerciseCount + 1}`)
      }

      lastAngleRef.current = angle
    } else {
      setDebugInfo("Arm keypoints not visible enough. Try adjusting your position or lighting.")
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

    const rightShoulder = keypoints.find((kp) => kp.name === "right_shoulder")
    const rightHip = keypoints.find((kp) => kp.name === "right_hip")

    // Check if we have enough keypoints
    const hasEnoughKeypoints =
      (leftShoulder?.score > confidenceThreshold || rightShoulder?.score > confidenceThreshold) &&
      (leftHip?.score > confidenceThreshold || rightHip?.score > confidenceThreshold)

    if (hasEnoughKeypoints) {
      // Use whichever side has better visibility
      const shoulder = leftShoulder?.score > rightShoulder?.score ? leftShoulder : rightShoulder
      const hip = leftHip?.score > rightHip?.score ? leftHip : rightHip

      // Check if body is roughly horizontal
      const hipToShoulderYDiff = Math.abs(hip!.y - shoulder!.y)
      const isHorizontal = hipToShoulderYDiff < 50

      setDebugInfo(`Plank detection: Y-diff=${hipToShoulderYDiff.toFixed(1)}, Horizontal=${isHorizontal}`)

      if (isHorizontal) {
        // Body is in plank position
        if (lastExerciseStateRef.current !== "plank") {
          lastExerciseStateRef.current = "plank"
          setDebugInfo("Plank position detected!")
        }

        // For planks, we count time instead of reps
        // The timer is already running, so we just need to update the UI
        if (exerciseCount === 0) {
          setExerciseCount(1) // Mark as started
        }
      } else {
        if (lastExerciseStateRef.current === "plank") {
          lastExerciseStateRef.current = "unknown"
          setDebugInfo("Plank position lost")
        }
      }
    } else {
      setDebugInfo("Not enough keypoints visible for plank detection")
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
    if (!ctx || !canvasRef.current || !videoRef.current) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Set canvas dimensions to match video
    if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
    } else {
      canvasRef.current.width = videoRef.current.offsetWidth
      canvasRef.current.height = videoRef.current.offsetHeight
    }

    // Draw keypoints
    if (pose.keypoints) {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score && keypoint.score > confidenceThreshold) {
          ctx.beginPath()
          ctx.arc(keypoint.x, keypoint.y, 8, 0, 2 * Math.PI)

          // Color code by confidence
          const alpha = Math.min(1, keypoint.score * 2)
          ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
          ctx.fill()

          // Add keypoint name for debugging
          ctx.fillStyle = "white"
          ctx.font = "12px Arial"
          ctx.fillText(keypoint.name || "", keypoint.x + 10, keypoint.y)

          // Add confidence score
          ctx.fillStyle = "yellow"
          ctx.font = "10px Arial"
          ctx.fillText(`${(keypoint.score * 100).toFixed(0)}%`, keypoint.x + 10, keypoint.y + 12)
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

      if (
        start &&
        end &&
        start.score &&
        end.score &&
        start.score > confidenceThreshold &&
        end.score > confidenceThreshold
      ) {
        // Calculate average confidence for this connection
        const avgConfidence = (start.score + end.score) / 2
        const alpha = Math.min(1, avgConfidence * 2)

        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.lineWidth = 4
        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`
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
      if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
      } else {
        canvasRef.current.width = videoRef.current.offsetWidth
        canvasRef.current.height = videoRef.current.offsetHeight
      }

      // Reset exercise state
      lastExerciseStateRef.current = "unknown"
      repInProgressRef.current = false
      angleHistoryRef.current = []
      detectionHistoryRef.current = []

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
    debugInfo,
    detectionStatus,
    forceDectection,
  }
}
