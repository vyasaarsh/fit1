"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Play, Clock, Target, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

type ExerciseInfo = {
  id: string
  name: string
  description: string
  targetMuscles: string[]
  difficulty: string
  imageUrl: string
  gifUrl: string
  instructions: string[]
  benefits: string[]
}

const exerciseData: Record<string, ExerciseInfo> = {
  squats: {
    id: "squats",
    name: "Squats",
    description: "A compound exercise that works multiple muscle groups in your lower body.",
    targetMuscles: ["Quadriceps", "Hamstrings", "Glutes", "Lower back"],
    difficulty: "Beginner",
    imageUrl: "/placeholder.svg?height=300&width=400",
    gifUrl: "/placeholder.svg?height=400&width=300",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Keep your back straight and chest up",
      "Lower your body as if sitting in a chair",
      "Keep knees in line with toes",
      "Lower until thighs are parallel to the ground",
      "Push through heels to return to starting position",
    ],
    benefits: [
      "Builds lower body strength",
      "Improves mobility and balance",
      "Increases core stability",
      "Burns calories efficiently",
    ],
  },
  pushups: {
    id: "pushups",
    name: "Push Ups",
    description: "A classic bodyweight exercise that strengthens your chest, shoulders, and arms.",
    targetMuscles: ["Chest", "Shoulders", "Triceps", "Core"],
    difficulty: "Intermediate",
    imageUrl: "/placeholder.svg?height=300&width=400",
    gifUrl: "/placeholder.svg?height=400&width=300",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulders",
      "Keep your body in a straight line from head to heels",
      "Lower your body until your chest nearly touches the floor",
      "Keep elbows at a 45-degree angle from your body",
      "Push back up to the starting position",
      "Keep core engaged throughout the movement",
    ],
    benefits: [
      "Builds upper body strength",
      "Improves core stability",
      "Enhances shoulder mobility",
      "Can be done anywhere with no equipment",
    ],
  },
  planks: {
    id: "planks",
    name: "Planks",
    description:
      "An isometric core strength exercise that involves maintaining a position similar to a push-up for the maximum possible time.",
    targetMuscles: ["Core", "Shoulders", "Back", "Glutes"],
    difficulty: "Beginner",
    imageUrl: "/placeholder.svg?height=300&width=400",
    gifUrl: "/placeholder.svg?height=400&width=300",
    instructions: [
      "Start in a forearm plank position",
      "Place forearms on the ground with elbows under shoulders",
      "Extend legs behind you with toes tucked",
      "Create a straight line from head to heels",
      "Engage your core and glutes",
      "Hold the position while breathing normally",
    ],
    benefits: [
      "Strengthens core muscles",
      "Improves posture",
      "Reduces lower back pain",
      "Increases overall stability",
    ],
  },
}

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const exerciseId = params.id
  const exercise = exerciseData[exerciseId]

  if (!exercise) {
    return <div>Exercise not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-6 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">{exercise.name}</h1>
      </header>

      <div className="mb-8 rounded-xl overflow-hidden bg-gray-800/50 relative">
        <Image
          src={exercise.imageUrl || "/placeholder.svg"}
          alt={exercise.name}
          width={400}
          height={300}
          className="h-48 w-full object-cover"
        />
      </div>

      {/* Exercise Info Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-800/50 p-3">
          <Clock className="h-5 w-5 text-emerald-500 mb-1" />
          <span className="text-xs text-gray-400">Duration</span>
          <span className="font-medium">3-5 min</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-800/50 p-3">
          <Target className="h-5 w-5 text-emerald-500 mb-1" />
          <span className="text-xs text-gray-400">Target</span>
          <span className="font-medium">{exercise.targetMuscles[0]}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg bg-gray-800/50 p-3">
          <BarChart3 className="h-5 w-5 text-emerald-500 mb-1" />
          <span className="text-xs text-gray-400">Level</span>
          <span className="font-medium">{exercise.difficulty}</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Description</h2>
        <p className="text-gray-400">{exercise.description}</p>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Instructions</h2>
        <ul className="list-disc pl-5 space-y-1">
          {exercise.instructions.map((instruction, index) => (
            <li key={index} className="text-gray-400">
              {instruction}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Target Muscles</h2>
        <div className="flex flex-wrap gap-2">
          {exercise.targetMuscles.map((muscle) => (
            <span key={muscle} className="rounded-full bg-gray-800 px-3 py-1 text-sm">
              {muscle}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Benefits</h2>
        <ul className="list-disc pl-5 space-y-1">
          {exercise.benefits.map((benefit, index) => (
            <li key={index} className="text-gray-400">
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <Button
          onClick={() => router.push(`/dashboard/exercise/${exerciseId}/start`)}
          className="w-full bg-emerald-500 py-6 text-lg hover:bg-emerald-600"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Exercise
        </Button>
      </motion.div>
    </div>
  )
}
