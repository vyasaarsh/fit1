"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, X, Play, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type ChallengeExercise = {
  name: string
  reps: string
  duration: number // in seconds
  completed: boolean
}

const challengeExercises: Record<string, ChallengeExercise[]> = {
  belgrade: [
    { name: "Squats", reps: "15 reps", duration: 45, completed: false },
    { name: "Push-ups", reps: "12 reps", duration: 40, completed: false },
    { name: "Lunges", reps: "10 reps each leg", duration: 50, completed: false },
    { name: "Plank", reps: "30 seconds", duration: 30, completed: false },
    { name: "Mountain Climbers", reps: "20 reps", duration: 35, completed: false },
  ],
  kyiv: [
    { name: "Crunches", reps: "15 reps", duration: 30, completed: false },
    { name: "Plank", reps: "20 seconds", duration: 20, completed: false },
    { name: "Russian Twists", reps: "12 reps", duration: 25, completed: false },
    { name: "Leg Raises", reps: "10 reps", duration: 30, completed: false },
  ],
  johannesburg: [
    { name: "Jump Squats", reps: "15 reps", duration: 40, completed: false },
    { name: "Lunges", reps: "12 reps each leg", duration: 50, completed: false },
    { name: "Glute Bridges", reps: "15 reps", duration: 35, completed: false },
    { name: "Wall Sit", reps: "45 seconds", duration: 45, completed: false },
    { name: "Calf Raises", reps: "20 reps", duration: 30, completed: false },
    { name: "Pistol Squats", reps: "8 reps each leg", duration: 60, completed: false },
  ],
}

export default function ChallengeStartPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const challengeId = params.id
  const [exercises, setExercises] = useState(challengeExercises[challengeId] || [])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const currentExercise = exercises[currentExerciseIndex]
  const isLastExercise = currentExerciseIndex === exercises.length - 1

  const startWorkout = () => {
    setIsActive(true)
    setTimer(currentExercise.duration)
  }

  const completeExercise = () => {
    const updatedExercises = [...exercises]
    updatedExercises[currentExerciseIndex].completed = true
    setExercises(updatedExercises)

    if (isLastExercise) {
      // Challenge completed
      setTimeout(() => {
        router.push(`/dashboard/challenge/${challengeId}`)
      }, 2000)
    } else {
      setIsResting(true)
      setTimer(10) // 10 seconds rest
      setTimeout(() => {
        setIsResting(false)
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setIsActive(false)
      }, 10000)
    }
  }

  const handleExitChallenge = () => {
    router.push(`/dashboard/challenge/${challengeId}`)
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">
          {challengeId.charAt(0).toUpperCase() + challengeId.slice(1)} Challenge
        </h1>
        <button
          onClick={handleExitChallenge}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <main className="flex flex-1 flex-col p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExerciseIndex + (isResting ? "-rest" : "")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col"
          >
            {isResting ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <h2 className="mb-4 text-2xl font-bold">Rest</h2>
                <div className="text-6xl font-bold text-emerald-500 mb-8">{timer}s</div>
                <p className="text-gray-400">Next exercise: {exercises[currentExerciseIndex + 1].name}</p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="mb-8 text-center">
                  <h2 className="mb-1 text-2xl font-bold">{currentExercise.name}</h2>
                  <p className="text-gray-400">{currentExercise.reps}</p>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  {isActive ? (
                    <div className="text-center">
                      <div className="text-8xl font-bold text-emerald-500 mb-8">{timer}s</div>
                      {timer <= 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-center"
                        >
                          <CheckCircle className="h-16 w-16 text-emerald-500" />
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mb-8 h-64 w-64 rounded-full bg-gray-800 flex items-center justify-center">
                        <Play className="h-24 w-24 text-emerald-500" />
                      </div>
                      <p className="text-gray-400">Press start when you're ready</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto">
          {/* Progress indicator */}
          <div className="mb-6 flex justify-center space-x-2">
            {exercises.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentExerciseIndex
                    ? "bg-emerald-500"
                    : index < currentExerciseIndex
                      ? "bg-emerald-700"
                      : "bg-gray-700"
                }`}
              />
            ))}
          </div>

          {!isResting && (
            <Button
              onClick={isActive ? completeExercise : startWorkout}
              disabled={timer <= 0 && isActive}
              className="w-full bg-emerald-500 py-6 text-lg hover:bg-emerald-600"
            >
              {isActive ? (timer <= 0 ? "Continue" : "Complete") : "Start"}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
