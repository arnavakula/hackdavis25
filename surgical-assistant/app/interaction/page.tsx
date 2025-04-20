import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { VideoPlayer } from "@/components/video-player"
import { FeedbackLog } from "@/components/feedback-log"

export default function InteractionPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-col h-screen">
        <header className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">AI Surgery Assistant</h1>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Video Player */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Surgery Video</h2>
            <VideoPlayer />
          </div>

          {/* Center Column - Feedback Log */}
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Live Feedback</h2>
            <FeedbackLog />
          </div>

          {/* Right Column - Doctor Input */}
          <div className="w-1/3 p-4 flex flex-col">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Doctor Input</h2>

            <div className="flex items-center justify-end mb-4 space-x-2">
              <Label htmlFor="voice-feedback" className="text-sm text-gray-700">
                Voice Feedback
              </Label>
              <Switch id="voice-feedback" />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4">{/* This space will show previous questions/answers */}</div>

              <div className="mt-auto">
                <form className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="assistant-input" className="sr-only">
                      Ask the assistant
                    </Label>
                    <Input id="assistant-input" placeholder="Ask the assistant..." className="w-full" />
                  </div>
                  <Button type="submit">Send</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
