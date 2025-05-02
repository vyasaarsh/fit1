"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Dumbbell, Calendar, Trophy, FolderPlus } from "lucide-react"
import { cn } from "@/lib/utils"

type Exercise = {
  id: string
  name: string
  target: string
  icon: string
  duration: string
  level: "beginner" | "intermediate" | "advanced"
  description: string
  imageUrl: string
}

type TabType = "sessions" | "challenges" | "for-you" | "your-workouts"

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("sessions")

  const [exercises] = useState<Exercise[]>([
    {
      id: "squats",
      name: "Squats",
      target: "Lower Body",
      icon: "🦵",
      duration: "3 min",
      level: "beginner",
      description: "A compound exercise that works multiple muscle groups in your lower body.",
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "pushups",
      name: "Push Ups",
      target: "Upper Body",
      icon: "💪",
      duration: "2 min",
      level: "intermediate",
      description: "A classic bodyweight exercise that strengthens your chest, shoulders, and arms.",
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "planks",
      name: "Planks",
      target: "Core",
      icon: "🧘‍♂️",
      duration: "1 min",
      level: "beginner",
      description: "An isometric core strength exercise that involves maintaining a position similar to a push-up.",
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
  ])

  const [challenges] = useState<Exercise[]>([
    {
      id: "belgrade",
      name: "Belgrade",
      target: "Full Body",
      icon: "🏋️",
      duration: "7 min",
      level: "intermediate",
      description: "A challenging full body workout inspired by Eastern European training methods.",
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "kyiv",
      name: "Kyiv",
      target: "Core",
      icon: "🧘‍♂️",
      duration: "5 min",
      level: "beginner",
      description: "Focus on your core with this beginner-friendly workout routine.",
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "johannesburg",
      name: "Johannesburg",
      target: "Lower Body",
      icon: "🦵",
      duration: "10 min",
      level: "advanced",
      description: "An intense lower body workout that will push your limits.",
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
  ])

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Training</h1>
        <p className="text-gray-400 mt-1">Start your fitness journey today</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-800 overflow-x-auto scrollbar-hide">
        <TabButton active={activeTab === "for-you"} onClick={() => setActiveTab("for-you")}>
          For You
        </TabButton>
        <TabButton active={activeTab === "sessions"} onClick={() => setActiveTab("sessions")}>
          Sessions
        </TabButton>
        <TabButton active={activeTab === "challenges"} onClick={() => setActiveTab("challenges")}>
          Challenges
        </TabButton>
        <TabButton active={activeTab === "your-workouts"} onClick={() => setActiveTab("your-workouts")}>
          Your Workouts
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "sessions" && (
        <>
          {/* Exercise Sessions Card */}
          <section className="mb-6">
            <div className="relative rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white p-6 flex items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Exercise Sessions</h2>
                <p className="text-sm mb-4">Individual exercises with real-time form tracking and feedback</p>
              </div>
              <div className="hidden md:block">
                <Dumbbell className="h-12 w-12 text-white/30" />
              </div>
            </div>
          </section>

          {/* Exercise List */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Available Exercises</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exercises.map((exercise) => (
                <Link href={`/dashboard/exercise/${exercise.id}`} key={exercise.id}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-5 h-full"
                  >
                    <div className="mb-4 h-40 overflow-hidden rounded-lg bg-gray-700 relative">
                      <Image
                        src={exercise.imageUrl || "/placeholder.svg"}
                        alt={exercise.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-500">
                        {exercise.level}
                      </div>
                    </div>
                    <h3 className="mb-1 text-lg font-medium">{exercise.name}</h3>
                    <p className="mb-3 text-sm text-gray-400">{exercise.target}</p>
                    <p className="mb-4 text-xs text-gray-400 line-clamp-2">{exercise.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{exercise.duration}</span>
                      <ArrowRight className="h-4 w-4 text-emerald-500" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-4">How It Works</h2>
            <div className="rounded-xl bg-gray-800/50 p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="mb-2 font-medium">Select Exercise</h3>
                  <p className="text-sm text-gray-400">
                    Choose from our collection of exercises designed for different fitness levels
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="mb-2 font-medium">Position Camera</h3>
                  <p className="text-sm text-gray-400">Set up your device camera to track your movements accurately</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="mb-2 font-medium">Get Feedback</h3>
                  <p className="text-sm text-gray-400">
                    Receive real-time feedback on your form and track your progress
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "challenges" && (
        <>
          {/* Challenges Header Card */}
          <section className="mb-6">
            <div className="relative rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white p-6 flex items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Weekly Challenges</h2>
                <p className="text-sm mb-4">Push yourself with our curated workout challenges</p>
              </div>
              <div className="hidden md:block">
                <Trophy className="h-12 w-12 text-white/30" />
              </div>
            </div>
          </section>

          {/* Challenges Grid */}
          <section className="mb-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <Link href={`/dashboard/challenge/${challenge.id}`} key={challenge.id}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 p-5"
                  >
                    <div className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Weekly Challenge
                    </div>
                    <div className="h-40 bg-gray-700 rounded-lg mb-4 relative">
                      <Image
                        src={challenge.imageUrl || "/placeholder.svg"}
                        alt={challenge.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{challenge.name}</h3>
                    <p className="mb-3 text-sm text-gray-400 line-clamp-2">{challenge.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{challenge.level}</span>
                      <span className="text-sm text-gray-400">{challenge.duration}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      {activeTab === "for-you" && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-6 flex justify-center">
            <Calendar className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="mb-4 text-2xl font-bold">Personalized Workouts Coming Soon</h2>
          <p className="mb-8 max-w-md text-center text-gray-400">
            We're working on creating personalized workout recommendations based on your fitness level and goals.
          </p>
        </div>
      )}

      {activeTab === "your-workouts" && (
        <>
          {/* Create Workout Card */}
          <section className="mb-6">
            <div className="rounded-xl bg-gray-800/50 p-6 flex items-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mr-4">
                <FolderPlus className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Your Workouts</h3>
                <p className="text-gray-400">Create a workout customized to your needs</p>
              </div>
              <button className="bg-emerald-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-emerald-600">
                Create Workout
              </button>
            </div>
          </section>

          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-6 flex justify-center">
              <FolderPlus className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="mb-4 text-2xl font-bold">No Custom Workouts Yet</h2>
            <p className="mb-8 max-w-md text-center text-gray-400">
              Create your first custom workout by clicking the "Create Workout" button above.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-2 px-1 whitespace-nowrap transition-colors",
        active ? "text-emerald-500 border-b-2 border-emerald-500 font-semibold" : "text-gray-400 hover:text-gray-300",
      )}
    >
      {children}
    </button>
  )
}
