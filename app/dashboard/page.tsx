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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-6 bg-black text-white"
    >
      <header className="mb-8">
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-2xl font-bold text-red-500"
        >
          Training
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
        >
          Choose an exercise to begin your workout
        </motion.p>
      </header>

      <section className="mb-8">
        <motion.h2 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-lg font-semibold text-red-500"
        >
          Featured Exercises
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredExercises.map((exercise, index) => (
            <Link href={`/dashboard/exercise/${exercise.id}`} key={exercise.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 border border-gray-800"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-2xl">{exercise.icon}</span>
                  <span className={`rounded-full px-2 py-1 text-xs ${
                    exercise.level === "beginner" 
                      ? "bg-red-500/20 text-red-400" 
                      : exercise.level === "intermediate" 
                        ? "bg-red-600/20 text-red-500" 
                        : "bg-red-700/20 text-red-600"
                  }`}>
                    {exercise.level}
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-medium">{exercise.name}</h3>
                <p className="mb-4 text-sm text-gray-400">{exercise.target}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{exercise.duration}</span>
                  <motion.div whileHover={{ x: 3 }}>
                    <ArrowRight className="h-4 w-4 text-red-500" />
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <motion.h2 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4 text-lg font-semibold text-red-500"
        >
          Training Programs
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ 
            boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3)"
          }}
          className="rounded-xl bg-gradient-to-r from-red-900/30 to-red-800/30 p-5 border border-gray-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-lg font-medium">7-Day Challenge</h3>
              <p className="text-sm text-gray-400">Complete daily exercises for a full week</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Coming Soon
              </motion.button>
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
    </motion.div>
  )
}
