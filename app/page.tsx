import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FitnessCenterIcon } from "@/components/icons/fitness-center"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 flex items-center justify-center">
        <FitnessCenterIcon className="h-16 w-16 text-emerald-500" />
      </div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight">FitTrack</h1>
      <p className="mb-8 max-w-md text-gray-400">
        Train smarter with AI-powered pose detection to perfect your form and track your progress.
      </p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline" className="border-emerald-500 text-emerald-500 hover:bg-emerald-500/10">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </main>
  )
}
