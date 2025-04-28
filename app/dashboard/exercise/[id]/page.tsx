"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

type ExerciseInfo = {
  id: string
  name: string
  description: string
  targetMuscles: string[]
  difficulty: string
  imageUrl: string
  gifUrl: string
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
  },
  pushups: {
    id: "pushups",
    name: "Push Ups",
    description: "A classic bodyweight exercise that strengthens your chest, shoulders, and arms.",
    targetMuscles: ["Chest", "Shoulders", "Triceps", "Core"],
    difficulty: "Intermediate",
    imageUrl: "/placeholder.svg?height=300&width=400",
    gifUrl: "/placeholder.svg?height=400&width=300",
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

      <div className="mb-8 rounded-xl bg-gray-800/50 overflow-hidden">
        <Image
          src={exercise.imageUrl || "/placeholder.svg"}
          alt={exercise.name}
          width={400}
          height={300}
          className="h-48 w-full object-cover"
        />
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Description</h2>
        <p className="text-gray-400">{exercise.description}</p>
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

      <div className="mb-10">
        <h2 className="mb-2 text-lg font-semibold">Difficulty</h2>
        <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-500">
          {exercise.difficulty}
        </span>
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
