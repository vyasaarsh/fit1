"use client"

import { useState } from "react"
// Removed unsupported Next.js imports
import { motion } from "framer-motion"
import { ArrowRight, Clock, Filter } from "lucide-react"

type Exercise = {
  id: string
  name: string
  target: string
  icon: string
  duration: string
  level: "beginner" | "intermediate" | "advanced"
}

type Session = {
  id: string
  name: string
  category: string
  goal: string
  duration: string
  difficulty: number
  image: string
  isPro?: boolean
}

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<string>("sessions")
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

  const [sessions] = useState<Session[]>([
    {
      id: "fat-burn",
      name: "Fat burn addict",
      category: "LOWER BODY",
      goal: "Gain muscle",
      duration: "35:00min",
      difficulty: 3,
      image: "/workout1.jpg",
      isPro: true
    },
    {
      id: "starting-sweater",
      name: "Starting sweater",
      category: "FULL BODY",
      goal: "Get fit",
      duration: "35:00min",
      difficulty: 1,
      image: "/workout2.jpg"
    },
    {
      id: "beginner-intervals",
      name: "Beginner intervals",
      category: "FULL BODY",
      goal: "Get fit",
      duration: "30:00min",
      difficulty: 1,
      image: "/workout3.jpg"
    },
  ])

  const renderTabContent = () => {
    switch (activeTab) {
      case "challenges":
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id}
                onClick={() => window.location.href = `/dashboard/challenge/${challenge.id}`}
                className="cursor-pointer"
              >
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
              </div>
            ))}
          </div>
        )
      case "sessions":
        return (
          <div className="mt-4">
            <div className="flex justify-end mb-4">
              <button className="border border-gray-300 rounded-full px-4 py-2 flex items-center gap-2 text-gray-700">
                <Filter className="h-5 w-5" />
                <span className="font-medium">Filter</span>
              </button>
            </div>

            <div className="space-y-6">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => window.location.href = `/dashboard/session/${session.id}`}
                  className="cursor-pointer"
                >
                  <div className="flex bg-white rounded-2xl overflow-hidden shadow-md">
                    <div className="relative w-1/3 h-48">
                      <div className="bg-gray-200 h-full w-full">
                        {/* Placeholder for actual images */}
                        {session.isPro && (
                          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-md font-bold">
                            PRO
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col justify-between w-2/3">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">{session.category}</p>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{session.name}</h3>
                        
                        <div className="inline-block bg-blue-100 text-blue-600 rounded-full px-4 py-1 text-sm font-medium mb-3">
                          {session.goal}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600 font-medium">{session.duration}</span>
                        </div>
                        
                        <div className="flex gap-1">
                          {[1, 2, 3].map((dot) => (
                            <div 
                              key={dot}
                              className={`w-2 h-2 rounded-full ${dot <= session.difficulty ? 'bg-blue-600' : 'bg-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return <div className="text-center py-10 text-gray-500">Coming soon</div>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Training</h1>
        <p className="text-gray-500 mt-1">Start your fitness journey today</p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          className={`pb-2 ${activeTab === "forYou" 
            ? "text-blue-600 border-b-2 border-blue-600 font-semibold" 
            : "text-gray-500"}`}
          onClick={() => setActiveTab("forYou")}
        >
          For You
        </button>
        <button 
          className={`pb-2 ${activeTab === "sessions" 
            ? "text-blue-600 border-b-2 border-blue-600 font-semibold" 
            : "text-gray-500"}`}
          onClick={() => setActiveTab("sessions")}
        >
          Sessions
        </button>
        <button 
          className={`pb-2 ${activeTab === "challenges" 
            ? "text-blue-600 border-b-2 border-blue-600 font-semibold" 
            : "text-gray-500"}`}
          onClick={() => setActiveTab("challenges")}
        >
          Challenges
        </button>
        <button 
          className={`pb-2 ${activeTab === "yourWorkouts" 
            ? "text-blue-600 border-b-2 border-blue-600 font-semibold" 
            : "text-gray-500"}`}
          onClick={() => setActiveTab("yourWorkouts")}
        >
          Your Workouts
        </button>
      </div>

      {/* Workout Sessions Card (only shown on first tab) */}
      {activeTab === "forYou" && (
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
      )}

      {/* Create Workout Card (only shown on first tab) */}
      {activeTab === "forYou" && (
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
      )}

      {/* Tab Content */}
      <section className="mb-6">
        {renderTabContent()}
      </section>
    </div>
  )
}
