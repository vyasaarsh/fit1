"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Plus } from "lucide-react"

type Exercise = {
  id: string
  name: string
  target: string
  description: string
  duration: string
  level: string
}

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<"forYou" | "sessions" | "challenges" | "yourWorkouts">("sessions")

  const sessions: Exercise[] = [
    {
      id: "pro",
      name: "PRO",
      target: "LOWER BODY",
      description: "Fat burn addict • Gain muscle",
      duration: "35:00min",
      level: "Advanced"
    },
    {
      id: "fileBody",
      name: "FILE BODY",
      target: "Starting sweater",
      description: "Get fit",
      duration: "35:00min",
      level: "Intermediate"
    },
    {
      id: "fullBody",
      name: "FULL BODY",
      target: "Beginner intervals",
      description: "Get fit",
      duration: "20:00min",
      level: "Beginner"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 bg-black text-white min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-red-500 mb-2">WELCOME TO NUTRIFITFUEL</h1>
        <p className="text-gray-400">The fastest workout in the world is awaiting you. Come try it out!</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-800">
        <button 
          onClick={() => setActiveTab("forYou")}
          className={`pb-2 ${activeTab === "forYou" ? "text-red-500 border-b-2 border-red-500 font-semibold" : "text-gray-400"}`}
        >
          For You
        </button>
        <button 
          onClick={() => setActiveTab("sessions")}
          className={`pb-2 ${activeTab === "sessions" ? "text-red-500 border-b-2 border-red-500 font-semibold" : "text-gray-400"}`}
        >
          Sessions
        </button>
        <button 
          onClick={() => setActiveTab("challenges")}
          className={`pb-2 ${activeTab === "challenges" ? "text-red-500 border-b-2 border-red-500 font-semibold" : "text-gray-400"}`}
        >
          Challenges
        </button>
        <button 
          onClick={() => setActiveTab("yourWorkouts")}
          className={`pb-2 ${activeTab === "yourWorkouts" ? "text-red-500 border-b-2 border-red-500 font-semibold" : "text-gray-400"}`}
        >
          Your Workouts
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          {/* Workout Sessions */}
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ scale: 1.02 }}
              className="rounded-xl bg-gray-900 p-6 border border-gray-800"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-red-500 mb-1">{session.name}</h2>
                  <h3 className="text-lg font-semibold mb-2">{session.target}</h3>
                  <p className="text-gray-400 mb-3">{session.description}</p>
                  <span className="text-sm text-gray-300">{session.duration}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="bg-red-600 hover:bg-red-700 rounded-full p-3 transition-colors"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around py-3">
        <Link href="#" className="text-center text-gray-400 hover:text-red-500 transition-colors">
          <div>The Club</div>
        </Link>
        <Link href="#" className="text-center text-red-500">
          <div>Train</div>
        </Link>
        <Link href="#" className="text-center text-gray-400 hover:text-red-500 transition-colors">
          <div>Profile</div>
        </Link>
      </div>
    </div>
  )
}
