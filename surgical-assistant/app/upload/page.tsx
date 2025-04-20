"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { useState } from "react"
import { useVideoContext } from "@/app/context/VideoContext"
import { useRouter } from "next/navigation"

export default function UploadPage() {
  const router = useRouter()
  const { setVideoData } = useVideoContext()
  const [disease, setDisease] = useState("")
  const [history, setHistory] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const startWorkflow = async () => {
    if (!videoFile || !disease || !history) {
      alert("Please complete all fields and upload your video.")
      return
    }

    try {
      await fetch("http://localhost:8000/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disease, history }),
      })

      setVideoData({ file: videoFile, disease, history })
      router.push("/interaction")
    } catch (err) {
      console.error("Error sending data to backend:", err)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#f9fafb] px-4">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-vector/medical-healthcare-blue-color_1017-26807.jpg?semt=ais_hybrid&w=740')",
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* Upload card */}
      <div className="relative z-10 w-full max-w-6xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#878472]/20 p-10 space-y-10">
        <h1 className="text-3xl font-bold text-[#1f2937] text-center">
          Upload Surgery Case
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#1f2937]">
              Step 1: Upload Surgery Video
            </h2>
            <FileUpload file={videoFile} setFile={setVideoFile} />
          </div>

          {/* Form section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[#1f2937]">
              Step 2: Provide Surgery Details
            </h2>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="disease"
                  className="block text-sm font-medium text-[#4b5563]"
                >
                  Disease Being Treated
                </Label>
                <Input
                  id="disease"
                  placeholder="e.g., Coronary Artery Disease"
                  onChange={(e) => setDisease(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="patient-history"
                  className="block text-sm font-medium text-[#4b5563]"
                >
                  Patient History
                </Label>
                <Textarea
                  id="patient-history"
                  placeholder="Briefly summarize relevant patient history..."
                  className="mt-1 h-32"
                  onChange={(e) => setHistory(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={startWorkflow}
                  className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2.5 text-base shadow-md transition duration-150"
                >
                  Start Workflow
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-[#6b7280] pt-6">
          Secure data transfer • Powered by Cerebras AI
        </div>
      </div>
    </main>
  )
}
