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
  const [challenges] = useState<Exercise[]>([
    {
      id: "belgrade",
      name: "Belgrade",
      target: "Full Body",
      icon: "🏋️",
      duration: "7 min",
      level: "intermediate",
    },
    {
      id: "kyiv",
      name: "Kyiv",
      target: "Core",
      icon: "🧘‍♂️",
      duration: "5 min",
      level: "beginner",
    },
    {
      id: "johannesburg",
      name: "Johannesburg",
      target: "Lower Body",
      icon: "🦵",
      duration: "10 min",
      level: "advanced",
    },
  ])

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Training</h1>
        <p className="text-gray-500 mt-1">Start your fitness journey today</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button className="pb-2 text-gray-500">For You</button>
        <button className="pb-2 text-gray-500">Sessions</button>
        <button className="pb-2 text-blue-600 border-b-2 border-blue-600 font-semibold">Challenges</button>
        <button className="pb-2 text-gray-500">Your Workouts</button>
      </div>

      {/* Workout Sessions Card */}
      <section className="mb-6">
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 flex items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Workout Sessions</h2>
            <p className="text-sm mb-4">Full workouts adapted to different objectives and designed by experts</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-orange-500 rounded-full p-3"
          >
            <ArrowRight className="h-6 w-6 text-white" />
          </motion.button>
        </div>
      </section>

      {/* Create Workout Card */}
      <section className="mb-6">
        <div className="rounded-2xl bg-white shadow-md p-6 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-blue-600">A</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Your Workouts</h3>
            <p className="text-2xl font-bold text-gray-900">Create a workout customized to your needs</p>
          </div>
          <button className="bg-orange-500 text-white rounded-full px-4 py-2 font-semibold">
            Create Workout
          </button>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Challenges</h2>
          <button className="bg-gray-200 rounded-full p-2">
            <ArrowRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <Link href={`/dashboard/challenge/${challenge.id}`} key={challenge.id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative rounded-2xl bg-white shadow-md p-5"
              >
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Weekly Challenge
                </div>
                <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{challenge.level}</span>
                  <span className="text-sm text-gray-500">{challenge.duration}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
