"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

type Exercise = {
  id: string
  name: string
  target: string
  icon: string
  duration: string
  level: "beginner" | "intermediate" | "advanced"
}

export default function TrainingPage() {
  const [featuredExercises] = useState<Exercise[]>([
    {
      id: "squats",
      name: "Squats",
      target: "Lower Body",
      icon: "🦵",
      duration: "3 min",
      level: "beginner",
    },
    {
      id: "pushups",
      name: "Push Ups",
      target: "Upper Body",
      icon: "💪",
      duration: "2 min",
      level: "intermediate",
    },
    {
      id: "planks",
      name: "Planks",
      target: "Core",
      icon: "🧘‍♂️",
      duration: "1 min",
      level: "beginner",
    },
  ])

  return (
    <div className="container mx-auto px-4 py-6 bg-black min-h-screen text-white">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">Training</h1>
        <p className="text-red-300">Choose an exercise to begin your workout</p>
      </header>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Featured Exercises</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredExercises.map((exercise) => (
            <Link href={`/dashboard/exercise/${exercise.id}`} key={exercise.id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-red-900 p-5 shadow-md"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-2xl">{exercise.icon}</span>
                  <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-500 capitalize">
                    {exercise.level}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-medium text-white">{exercise.name}</h3>
                <p className="mb-4 text-sm text-red-200">{exercise.target}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-300">{exercise.duration}</span>
                  <ArrowRight className="h-4 w-4 text-red-500" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Training Programs</h2>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl bg-gradient-to-r from-zinc-900 to-red-800 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-lg font-medium text-white">7-Day Challenge</h3>
              <p className="text-sm text-red-200">
                Complete daily exercises for a full week
              </p>
              <button className="mt-4 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition">
                Coming Soon
              </button>
            </div>
            <div className="hidden md:block">
              <Image
                src="/placeholder.svg?height=80&width=80"
                alt="7-day challenge"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
