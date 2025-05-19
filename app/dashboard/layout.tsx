"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Dumbbell, Users, User } from "lucide-react"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Prevent hydration errors with navigation highlighting
  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    {
      name: "Training",
      path: "/dashboard",
      icon: <Dumbbell className="h-6 w-6" />,
    },
    {
      name: "Community",
      path: "/dashboard/community",
      icon: <Users className="h-6 w-6" />,
    },
    {
      name: "Profile",
      path: "/dashboard/profile",
      icon: <User className="h-6 w-6" />,
    },
  ]

  // Check if current page is a camera page
  const isCameraPage = pathname.includes("/camera")

  if (!mounted) return null

  return (
    <div className="flex min-h-screen flex-col">
      {/* Main content */}
      <main className="flex-1 pb-16">{children}</main>

      {/* Bottom navigation bar - hidden on camera pages */}
      {!isCameraPage && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-900/80 backdrop-blur-lg">
          <nav className="flex h-16 items-center justify-around">
            {navItems.map((item) => {
              const isActive = pathname === item.path

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative flex flex-col items-center justify-center px-3 py-2 ${
                    isActive ? "text-emerald-500" : "text-gray-400"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute -top-1 h-1 w-12 rounded-full bg-emerald-500"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {item.icon}
                  <span className="text-xs">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </div>
  )
}
