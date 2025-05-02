"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Play, Clock, Target, BarChart3, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type ChallengeInfo = {
  id: string
  name: string
  description: string
  level: string
  duration: string
  imageUrl: string
  exercises: {
    name: string
    reps: string
    completed?: boolean
  }[]
}

const challengeData: Record<string, ChallengeInfo> = {
  belgrade: {
    id: "belgrade",
    name: "Belgrade Challenge",
    description: "A challenging full body workout inspired by Eastern European training methods.",
    level: "Intermediate",
    duration: "7 min",
    imageUrl: "/placeholder.svg?height=300&width=400",
    exercises: [
      { name: "Squats", reps: "15 reps" },
      { name: "Push-ups", reps: "12 reps" },
      { name: "Lunges", reps: "10 reps each leg" },
      { name: "Plank", reps: "30 seconds" },
      { name: "Mountain Climbers", reps: "20 reps" },
    ],
  },
  kyiv: {
    id: "kyiv",
    name: "Kyiv Challenge",
    description: "Focus on your core with this beginner-friendly workout routine.",
    level: "Beginner",
    duration: "5 min",
    imageUrl: "/placeholder.svg?height=300&width=400",
    exercises: [
      { name: "Crunches", reps: "15 reps" },
      { name: "Plank", reps: "20 seconds" },
      { name: "Russian Twists", reps: "12 reps" },
      { name: "Leg Raises", reps: "10 reps" },
    ],
  },
  johannesburg: {
    id: "johannesburg",
    name: "Johannesburg Challenge",
    description: "An intense lower body workout that will push your limits.",
    level: "Advanced",
    duration: "10 min",
    imageUrl: "/placeholder.svg?height=300&width=400",
    exercises: [
      { name: "Jump Squats", reps: "15 reps" },
      { name: "Lunges", reps: "12 reps each leg" },
      { name: "Glute Bridges", reps: "15 reps" },
      { name: "Wall Sit", reps: "45 seconds" },
      { name: "Calf Raises", reps: "20 reps" },
      { name: "Pistol Squats", reps: "8 reps each leg" },
    ],
  },
}

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const challengeId = params.id
  const challenge = challengeData[challengeId]
  const [exercises, setExercises] = useState(challenge?.exercises || [])

  if (!challenge) {
    return <div>Challenge not found</div>
  }

  const toggleExerciseCompletion = (index: number) => {
    const updatedExercises = [...exercises]
    updatedExercises[index] = {
      ...updatedExercises[index],
      completed: !updatedExercises[index].completed,
    }
    setExercises(updatedExercises)
  }

  const completedCount = exercises.filter((ex) => ex.completed).length
  const totalExercises = exercises.length
  const progressPercentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{challenge.name}</h1>
      </header>

      <div className="mb-8 rounded-xl overflow-hidden bg-gray-800/50 relative">
        <Image
          src={challenge.imageUrl || "/placeholder.svg"}
          alt={challenge.name}
          width={400}
          height={300}
          className="h-48 w-full object-cover"
        />
      </div>

      {/* Challenge Info Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-800/50 p-3">
          <Clock className="h-5 w-5 text-emerald-500 mb-1" />
          <span className="text-xs text-gray-400">Duration</span>
          <span className="font-medium">{challenge.duration}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-800/50 p-3">
          <Target className="h-5 w-5 text-emerald-500 mb-1" />
          <span className="text-xs text-gray-400">Focus</span>
          <span className="font-medium">Full Body</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-800/50 p-3">
          <BarChart3 className="h-5 w-5 text-emerald-500 mb-1" />
          <span className="text-xs text-gray-400">Level</span>
          <span className="font-medium">{challenge.level}</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Description</h2>
        <p className="text-gray-400">{challenge.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Progress</h2>
          <span className="text-sm text-gray-400">
            {completedCount}/{totalExercises} completed
          </span>
        </div>
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Exercises</h2>
        <div className="space-y-3">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                exercise.completed ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-gray-800/50"
              }`}
              onClick={() => toggleExerciseCompletion(index)}
            >
              <div className="flex items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full mr-3 ${
                    exercise.completed ? "bg-emerald-500" : "bg-gray-700"
                  }`}
                >
                  {exercise.completed && <CheckCircle className="h-4 w-4 text-white" />}
                </div>
                <div>
                  <h3 className="font-medium">{exercise.name}</h3>
                  <p className="text-sm text-gray-400">{exercise.reps}</p>
                </div>
              </div>
              <button className="text-sm text-emerald-500">{exercise.completed ? "Completed" : "Mark Complete"}</button>
            </div>
          ))}
        </div>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <Button
          onClick={() => router.push(`/dashboard/challenge/${challengeId}/start`)}
          className="w-full bg-emerald-500 py-6 text-lg hover:bg-emerald-600"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Challenge
        </Button>
      </motion.div>
    </div>
  )
}
