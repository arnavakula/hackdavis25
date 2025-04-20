  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import Link from "next/link"

  export default function LoginPage() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
        <div className="w-full max-w-md space-y-8 p-8 border border-gray-200 rounded-lg shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">AI Surgery Assistant</h1>
            <p className="mt-2 text-gray-600">Log in to begin</p>
            
          </div>

          <form className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1"
                  placeholder="doctor@hospital.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Link href="/upload">
                <Button className="w-full" type="button">
                  Login
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    )
  }
