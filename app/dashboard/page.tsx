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
    <div className="container mx-auto px-4 py-6 bg-black text-white">
      {/* Branding Header */}
      <header className="mb-8 flex items-center gap-4">
        <Image 
          src="/nfflogo.png"
          alt="NutriFitFuel Logo"
          width={48}
          height={48}
          className="h-12 w-auto"
        />
        <div>
          <h1 className="text-2xl font-bold">Training</h1>
          <p className="text-gray-400">Choose an exercise to begin your workout</p>
        </div>
      </header>

      {/* Featured Exercises */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-red-500">Featured Exercises</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredExercises.map((exercise) => (
            <Link href={`/dashboard/exercise/${exercise.id}`} key={exercise.id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 border border-gray-800"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-2xl">{exercise.icon}</span>
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    exercise.level === "beginner" 
                      ? "bg-red-500/20 text-red-500" 
                      : exercise.level === "intermediate" 
                        ? "bg-red-600/20 text-red-600" 
                        : "bg-red-700/20 text-red-700"
                  }`}>
                    {exercise.level}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-medium">{exercise.name}</h3>
                <p className="mb-4 text-sm text-gray-400">{exercise.target}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{exercise.duration}</span>
                  <ArrowRight className="h-4 w-4 text-red-500" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Training Programs */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-red-500">Training Programs</h2>
        <div className="rounded-xl bg-gradient-to-r from-red-900/30 to-red-700/30 p-5 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-lg font-medium">7-Day Challenge</h3>
              <p className="text-sm text-gray-400">Complete daily exercises for a full week</p>
              <button className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors">
                Coming Soon
              </button>
            </div>
            <div className="hidden md:block">
              <Image
                src="/nfflogo.png" // Consider creating a specific challenge image
                alt="7-day challenge"
                width={80}
                height={80}
                className="rounded-lg opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Powered by <span className="text-red-500">NutriFitFuel</span></p>
      </footer>
    </div>
  )
}
