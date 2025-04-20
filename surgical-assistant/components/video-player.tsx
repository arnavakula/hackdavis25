"use client"

import { Play, Pause } from "lucide-react"
import { useState } from "react"

export function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
        

        <button
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-opacity"
          onClick={togglePlayback}
        >
          {isPlaying ? <Pause className="h-12 w-12 text-white" /> : <Play className="h-12 w-12 text-white" />}
        </button>
      </div>

      {/* Video Controls */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={togglePlayback}>
            {isPlaying ? <Pause className="h-5 w-5 text-gray-700" /> : <Play className="h-5 w-5 text-gray-700" />}
          </button>

          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-700" style={{ width: `${progress}%` }}></div>
          </div>

          <span className="text-xs text-gray-600">00:00 / 10:00</span>
        </div>
      </div>
    </div>
  )
}
