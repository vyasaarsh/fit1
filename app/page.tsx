// app/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <ThemeToggle />
      
      <div className="mb-8 flex items-center justify-center">
        <img 
          src="/nfflogo.png" 
          alt="NuitriFitFuel Logo" 
          className="max-w-[120px] w-full h-auto" 
        />
      </div>
      <h1 className="mb-4 text-4xl font-bold tracking-tight">NuitriFitFuel</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Train smarter with AI-powered pose detection to perfect your form and track your progress.
      </p>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-600/10"
        >
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </main>
  )
}
