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
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Training</h1>
        <p className="text-gray-400">Choose an exercise to begin your workout</p>
      </header>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Featured Exercises</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredExercises.map((exercise) => (
            <Link href={`/dashboard/exercise/${exercise.id}`} key={exercise.id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-2xl">{exercise.icon}</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-500">
                    {exercise.level}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-medium">{exercise.name}</h3>
                <p className="mb-4 text-sm text-gray-400">{exercise.target}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{exercise.duration}</span>
                  <ArrowRight className="h-4 w-4 text-emerald-500" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Training Programs</h2>
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-700/20 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-lg font-medium">7-Day Challenge</h3>
              <p className="text-sm text-gray-400">Complete daily exercises for a full week</p>
              <button className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium">Coming Soon</button>
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
        </div>
      </section>
    </div>
  )
}
