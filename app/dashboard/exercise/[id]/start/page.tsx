"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeviceAlignment } from "@/components/device-alignment"

const exerciseGifs: Record<string, string> = {
  squats: "/placeholder.svg?height=500&width=300",
  pushups: "/placeholder.svg?height=500&width=300",
  planks: "/placeholder.svg?height=500&width=300",
}

export default function ExerciseStartPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const exerciseId = params.id
  const [currentStep, setCurrentStep] = useState(0)
  const [isDeviceAligned, setIsDeviceAligned] = useState(false)

  // Removed camera selection step
  const steps = [
    {
      title: "Exercise Demo",
      description: "Watch the demo and learn the proper form",
      content: (
        <div className="flex flex-col items-center">
          <div className="mb-6 rounded-xl bg-gray-100 p-4">
            <Image
              src={exerciseGifs[exerciseId] || "/placeholder.svg?height=500&width=300"}
              alt={`${exerciseId} demonstration`}
              width={300}
              height={500}
              className="rounded-lg"
            />
          </div>
        </div>
      ),
      buttonText: "Continue",
      canProceed: true,
    },
    {
      title: "Setup Your Space",
      description: "Find a clear area and ensure there's enough room",
      content: (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center text-emerald-500 mb-6">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <rect x="70" y="20" width="60" height="110" rx="10" fill="#1f2937" />
              <rect x="75" y="25" width="50" height="100" rx="5" fill="#111827" />
              <path />
              <rect x="75" y="25" width="50" height="100" rx="5" fill="#111827" />
              <path d="M60 140 L90 160 L140 160 L170 140" stroke="#10b981" strokeWidth="4" fill="none" />
              <path d="M90 160 L90 180" stroke="#10b981" strokeWidth="4" fill="none" />
              <path d="M140 160 L140 180" stroke="#10b981" strokeWidth="4" fill="none" />
            </svg>
          </div>
          <p className="text-center text-gray-400 mb-4">Place your phone on the floor tilted against the wall</p>
          <p className="text-center text-sm text-gray-500">
            Make sure your device is stable and has a clear view of your workout area
          </p>
        </div>
      ),
      buttonText: "Continue",
      canProceed: true,
    },
    {
      title: "Adjust Your Device",
      description: "Position your device for optimal tracking",
      content: (
        <div className="flex flex-col items-center">
          <DeviceAlignment onAligned={() => setIsDeviceAligned(true)} onSkip={() => setIsDeviceAligned(true)} />
          <p className="text-center text-gray-400">
            {isDeviceAligned
              ? "Device aligned correctly! You can proceed."
              : "Adjust your device until the orange bar is centered in the blue area"}
          </p>
        </div>
      ),
      buttonText: "Start Camera",
      canProceed: isDeviceAligned, // Now we can proceed when aligned or skipped
    },
  ]

  const currentStepContent = steps[currentStep]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Always use front camera (user)
      router.push(`/dashboard/exercise/${exerciseId}/camera?camera=user`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">How it works</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <main className="flex flex-1 flex-col p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col"
          >
            <div className="mb-6 text-center">
              <h2 className="mb-1 text-2xl font-bold">{currentStepContent.title}</h2>
              <p className="text-gray-400">{currentStepContent.description}</p>
            </div>

            <div className="flex-1">{currentStepContent.content}</div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto">
          <div className="mb-6 flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${index === currentStep ? "bg-emerald-500" : "bg-gray-700"}`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            className="w-full bg-emerald-500 py-6 text-lg hover:bg-emerald-600"
            disabled={!currentStepContent.canProceed}
          >
            {currentStepContent.buttonText}
          </Button>
        </div>
      </main>
    </div>
  )
}
