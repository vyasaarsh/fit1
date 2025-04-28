"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BuildingIcon } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6 flex justify-center">
          <BuildingIcon className="h-16 w-16 text-gray-400" />
        </div>
        <h1 className="mb-4 text-2xl font-bold">Profile Coming Soon</h1>
        <p className="mb-8 max-w-md text-gray-400">
          The profile section is currently under development. Check back soon to track your progress and customize your
          settings.
        </p>
        <Button className="bg-emerald-500 hover:bg-emerald-600" disabled>
          Coming Soon
        </Button>
      </motion.div>
    </div>
  )
}
