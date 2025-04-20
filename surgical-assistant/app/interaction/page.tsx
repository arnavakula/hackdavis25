"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FeedbackLog } from "@/components/feedback-log"
import { useVideoContext } from "@/app/context/VideoContext"
import { useRef, useEffect, useState } from "react"
import React from "react"
import { start } from "repl"
import { format } from "path"

export type FeedbackEntry = {
  type: "next_steps" | "question" | "answer"
  text: string
  timestamp: string
}

export default function InteractionPage() {
  const { file } = useVideoContext()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.pitch = 1
    utterance.rate = 1.25
    utterance.volume = 1
    speechSynthesis.speak(utterance)
  }

  const startSpeechToText = (onResult: (text: string) => void) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("Transcript:", transcript)
      onResult(transcript)
    }

    recognition.onerror = (err: any) => {
      console.error("Speech recognition error", err)
    }

    recognition.start()
  }

  const askQuestion = () => {
    startSpeechToText((transcript: string) => {
      const norm = transcript.toLowerCase().trim()
      
      //trigger video start
      if (norm === 'start') {
        videoRef.current?.play()
        return
      }

      let timestamp = videoRef.current?.currentTime || 0
      let formattedTimestamp = new Date(timestamp * 1000).toISOString().substr(14, 5)

      setFeedback((prev) => [
        ...prev,
        { type: "question", text: transcript, timestamp: formattedTimestamp },
      ])

      //ping question
      fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: transcript }),
      })
        .then((res) => res.json())
        .then((data) => {
          speak(data.answer || "No answer available")

          let timestamp = videoRef.current?.currentTime || 0
          let formattedTimestamp = new Date(timestamp * 1000).toISOString().substr(14, 5)

          setFeedback((prev) => [
            ...prev,
            { type: "answer", text: data.answer, timestamp: formattedTimestamp },
          ])

          askQuestion()
        })
        .catch((err) => console.error("Error asking question:", err))

    })
  }

  const startQuestionLoop = () => {
    
  }

  useEffect(() => {
    if (!videoRef.current || !file) return

    const video = videoRef.current
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    const frames: string[] = []

    const captureFrame = () => {
      if (!videoRef.current || !context) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const frame = canvas.toDataURL("image/jpeg")
      frames.push(frame)
    }

    const handlePlay = () => {
      frames.length = 0
      const interval = setInterval(captureFrame, 250)

      const timeoutId = setTimeout(() => {
        clearInterval(interval)
        video.pause()
        console.log("# of frames: ", frames.length)
        console.log("timestamp: ", video.currentTime)

        fetch("http://localhost:8000/frames", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frames }),
        })
          .then((res) => res.json())
          .then(() => fetch("http://localhost:8000/next_steps"))
          .then((res) => res.json())
          .then((data) => {
            const timestamp = videoRef.current?.currentTime || 0
            const formattedTimestamp = new Date(timestamp * 1000).toISOString().substr(14, 5)

            setFeedback((prev) => [
              ...prev,
              { type: "next_steps", text: data.next_steps, timestamp: formattedTimestamp },
            ])
            speak(data.next_steps || "No next steps available")

            // 👇 Handle voice follow-up
            startSpeechToText((questionText: string) => {
              const handleFollowUp = async () => {
                try {
                  const qTime = videoRef.current?.currentTime || 0
                  const qTimestamp = new Date(qTime * 1000).toISOString().substr(14, 5)

                  setFeedback((prev) => [
                    ...prev,
                    { type: "question", text: questionText, timestamp: qTimestamp },
                  ])

                  const res = await fetch("http://localhost:8000/ask", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question: questionText }),
                  })

                  const data = await res.json()
                  speak(data.answer || "No answer available")

                  const aTime = videoRef.current?.currentTime || 0
                  const aTimestamp = new Date(aTime * 1000).toISOString().substr(14, 5)

                  setFeedback((prev) => [
                    ...prev,
                    { type: "answer", text: data.answer, timestamp: aTimestamp },
                  ])
                } catch (err) {
                  console.error("Error handling follow-up question:", err)
                }
              }

              handleFollowUp()
            })
          })
          .catch((err) =>
            console.error("Error sending frames or retrieving next steps:", err)
          )

        ;(video as any)._pauseTimeout = timeoutId
      }, 5000)

      ;(video as any)._pauseTimeout = timeoutId
    }

    video.addEventListener("play", handlePlay)
    video.play().catch(console.error)

    return () => {
      video.removeEventListener("play", handlePlay)
      clearTimeout((video as any)._pauseTimeout)
    }
  }, [file])

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-col h-screen">
        <header className="border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold text-gray-900">AI Surgery Assistant</h1>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-2/3 border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Surgery Video</h2>
            {file && (
              <video ref={videoRef} controls className="w-full max-w-3xl mt-4">
                <source src={URL.createObjectURL(file)} type={file.type} />
              </video>
            )}
          </div>

          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Live Feedback</h2>
            <FeedbackLog feedback={feedback} />
          </div>
        </div>
      </div>
    </main>
  )
}
