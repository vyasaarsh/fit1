"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Plus } from "lucide-react"

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState("forYou")

  return (
    <div className="container mx-auto px-4 py-6 bg-black text-white">
      {/* Welcome Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-red-500">WELCOME TO NUTRIFITFUEL</h1>
        <p className="text-gray-300">The fastest workout in the world is awaiting you. Come try it out!</p>
      </header>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab("forYou")}
          className={`px-4 py-2 font-medium ${activeTab === "forYou" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400"}`}
        >
          For You
        </button>
        <button
          onClick={() => setActiveTab("challenges")}
          className={`px-4 py-2 font-medium ${activeTab === "challenges" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400"}`}
        >
          Challenges
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 font-medium ${activeTab === "sessions" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400"}`}
        >
          Workout Sessions
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === "forYou" && (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">For You</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <Link href="#" className="p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
                  <div className="text-red-500 font-medium">Sessions</div>
                </Link>
                <Link href="#" className="p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
                  <div className="text-red-500 font-medium">Challenges</div>
                </Link>
                <Link href="#" className="p-4 rounded-lg bg-gray-900 hover:bg-gray-800 transition-colors">
                  <div className="text-red-500 font-medium">Your workouts</div>
                </Link>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <h2 className="text-xl font-semibold">Weekly challenge</h2>
              </div>
              <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
                <h3 className="font-medium text-lg mb-2">Belgrade</h3>
                <div className="flex justify-between text-gray-300">
                  <span>Intermediate 7:00</span>
                  <span>💬 Difficulty 💬 min</span>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === "challenges" && (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Challenges</h2>
              <p className="text-gray-300">Short and high intensity challenges. Compete with people from everywhere</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
                  <h3 className="font-medium text-lg">Kyiv</h3>
                </div>
                <div className="p-4 rounded-lg bg-gray-900 border border-gray-800">
                  <h3 className="font-medium text-lg">Johannesburg</h3>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Workout sessions</h2>
              <p className="text-gray-300">Full workouts adapted to different objectives and designed by experts</p>
            </section>
          </>
        )}

        {activeTab === "sessions" && (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Workout sessions</h2>
              <p className="text-gray-300">Full workouts adapted to different objectives and designed by experts</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Your workouts</h2>
              <p className="text-gray-300">Create a workout customized to your needs</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                <Plus size={16} />
                Create workout
              </button>
            </section>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around py-3">
        <Link href="#" className="text-center text-gray-300 hover:text-red-500 transition-colors">
          <div>The Club</div>
        </Link>
        <Link href="#" className="text-center text-red-500">
          <div>Train</div>
        </Link>
        <Link href="#" className="text-center text-gray-300 hover:text-red-500 transition-colors">
          <div>Profile</div>
        </Link>
      </div>
    </div>
  )
}
