"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { FileUpload } from "@/components/file-upload"
import { useState } from "react"

export default function UploadPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white">
      <div className="w-full max-w-6xl p-6 border border-gray-200 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Upload Surgery Video</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">Video Upload</h2>
            <FileUpload />
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-800">Surgery Details</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="disease" className="block text-sm font-medium text-gray-700">
                  Disease being treated
                </Label>
                <Input id="disease" name="disease" className="mt-1" placeholder="e.g., Coronary Artery Disease" />
              </div>

              <div>
                <Label htmlFor="patient-history" className="block text-sm font-medium text-gray-700">
                  Patient history
                </Label>
                <Textarea
                  id="patient-history"
                  name="patient-history"
                  className="mt-1 h-32"
                  placeholder="Enter relevant patient history..."
                />
              </div>

              <div className="pt-4">
                <Link href="/interaction">
                  <Button className="w-full" type="button">
                    Start Workflow
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
