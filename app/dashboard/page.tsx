"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const exercises = [
  { id: "1", title: "Chest", level: "Intermediate", duration: "45 mins" },
  { id: "2", title: "Legs", level: "Beginner", duration: "30 mins" },
  { id: "3", title: "Back", level: "Advanced", duration: "60 mins" },
  { id: "4", title: "Shoulders", level: "Intermediate", duration: "40 mins" },
];

export default function Training() {
  const router = useRouter();

  const handleExerciseClick = (id: string) => {
    router.push(`/training/${id}`);
  };

  return (
    <main className="p-6 bg-black min-h-screen text-white">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/nfflogo.png"
            alt="NutriFitFuel Logo"
            width={40}
            height={40}
          />
          <h1 className="text-2xl font-bold text-white">Training</h1>
        </div>
        <p className="text-red-200">Choose an exercise to begin your workout</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {exercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-black to-red-900 p-5"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleExerciseClick(exercise.id)}
          >
            <h2 className="text-xl font-semibold mb-2">{exercise.title}</h2>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium bg-red-500/20 text-red-500 px-2 py-1 rounded">
                {exercise.level}
              </span>
              <span className="text-sm text-red-200">{exercise.duration}</span>
            </div>
            <div className="absolute bottom-3 right-3">
              <ArrowRight className="text-red-500" />
            </div>
          </motion.div>
        ))}
      </section>

      <section className="mt-10 p-6 rounded-xl bg-gradient-to-r from-black to-red-900">
        <h3 className="text-lg font-bold text-white mb-2">Training Program</h3>
        <p className="text-red-200 mb-4">Explore your personalized program</p>
        <button className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded">
          Coming Soon
        </button>
      </section>

      <footer className="mt-12 text-center text-sm text-red-300">
        Powered by <span className="font-semibold text-red-500">NutriFitFuel</span>
      </footer>
    </main>
  );
}
