import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-black text-white">
      <ThemeToggle />
      <div className="mb-8 flex items-center justify-center">
        <img src="/nfflogo.png" alt="NuitriFitFuel Logo" className="max-w-[120px] w-full h-auto" />
      </div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight">NuitriFitFuel</h1>
      <p className="mb-8 max-w-md text-gray-400">
        Train smarter with AI-powered pose detection to perfect your form and track your progress.
      </p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button asChild className="bg-red-500 hover:bg-red-600">
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-500/10"
        >
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </main>
  )
}
