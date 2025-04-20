"use client";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md space-y-8 p-8 border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">AI Surgery Assistant</h1>
          <p className="mt-2 text-gray-600">Log in with your account to begin.</p>
        </div>

        <div className="pt-4">
          <a href="auth/login?returnTo=/upload">
            <Button className="w-full" type="button">
              Login :{')'}
            </Button>
          </a>
        </div>
      </div>
    </main>
  );
}
