"use client";

import { Button } from "@/components/ui/button";
import Image from 'next/image'



export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#f9fafb]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-vector/medical-healthcare-blue-color_1017-26807.jpg?semt=ais_hybrid&w=740')",
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-md border border-[#1f2937]/10 shadow-2xl p-10 space-y-8">
        <div className="text-center mx-auto">
          {/* <h1 className="text-4xl font-extrabold text-[#1f2937] tracking-tight">
            Synopta
          </h1> */}
          <Image
            className="mx-auto object-contain"
            src="/synopta.png"
            alt="Synopta logo"
            width={500}
            height={100}
            priority
          />
          <p className="mt-3 text-base text-[#4b5563]">
            Securely log in to begin real-time surgical guidance.
          </p>
        </div>

        <div className="pt-2">
          <a href="auth/login?returnTo=/upload">
            <Button
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold py-2.5 text-base shadow-lg transition duration-150 ease-in-out"
              type="button"
            >
              Log In with Auth0
            </Button>
          </a>
        </div>

        <div className="text-center text-xs text-[#6b7280] pt-4">
          Powered by <span className="font-medium text-[#1f2937]">Cerebras AI</span> • Precision meets clarity
        </div>
      </div>
    </main>
  );
}
