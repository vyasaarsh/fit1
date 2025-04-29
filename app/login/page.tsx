"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard") // Redirect after login
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-black text-white">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Image
            src="/nfflogo.png"
            alt="NutriFitFuel Logo"
            className="max-w-[120px] w-full h-auto"
          />
          <h1 className="text-2xl font-bold">Log in to NutriFitFuel</h1>
          <p className="text-sm text-gray-400">
            Enter your email and password to access your account.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              required
              className="bg-neutral-900 border border-red-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              className="bg-neutral-900 border border-red-600 text-white"
            />
          </div>

          <Button
            type="submit"
            className={cn("w-full bg-red-600 hover:bg-red-700")}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="text-center text-sm text-gray-400">
          <Link href="/forgot-password" className="text-red-500 hover:underline">
            Forgot your password?
          </Link>
        </div>

        <div className="text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-red-500 hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
