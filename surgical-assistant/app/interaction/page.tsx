"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FeedbackLog } from "@/components/feedback-log"
import { useVideoContext } from "@/app/context/VideoContext"
import { useRef, useEffect, useState } from "react"
import React from "react"
import Image from "next/image"
import { start } from "repl"
import { format } from "path"

export type FeedbackEntry = {
  type: "next_steps" | "question" | "answer"
  text: string
  timestamp: string
}

export default function InteractionPage() {
  const { file } = useVideoContext()
  const recognitionRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [isListening, setIsListening] = useState(false)


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
  
    // Cleanup existing instance if needed
    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }
  
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
  
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.continuous = false
  
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("Transcript:", transcript)
      onResult(transcript)
    }
  
    recognition.onerror = (err: any) => {
      console.error("Speech recognition error", err)
      setIsListening(false)
    }
  
    recognition.start()
  }

  const askQuestion = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    startSpeechToText((transcript: string) => {
      const norm = transcript.toLowerCase().trim()
      
      //trigger video start
      if (norm === 'start') {
        videoRef.current?.play()
        return
      }

      let timestamp = videoRef.current?.currentTime || 0
      let formattedTimestamp = new Date(timestamp * 1000).toISOString().substr(14, 5)

      transcript = transcript.charAt(0).toUpperCase() + transcript.slice(1)


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

          setTimeout(() => askQuestion(), 5000)
        })
        .catch((err) => console.error("Error asking question:", err))

    })
  }

  const startQuestionLoop = () => {
    askQuestion()
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
            // startSpeechToText((questionText: string) => {
            //   const handleFollowUp = async () => {
            //     try {
            //       const qTime = videoRef.current?.currentTime || 0
            //       const qTimestamp = new Date(qTime * 1000).toISOString().substr(14, 5)

            //       setFeedback((prev) => [
            //         ...prev,
            //         { type: "question", text: questionText, timestamp: qTimestamp },
            //       ])

            //       const res = await fetch("http://localhost:8000/ask", {
            //         method: "POST",
            //         headers: { "Content-Type": "application/json" },
            //         body: JSON.stringify({ question: questionText }),
            //       })

            //       const data = await res.json()
            //       speak(data.answer || "No answer available")

            //       const aTime = videoRef.current?.currentTime || 0
            //       const aTimestamp = new Date(aTime * 1000).toISOString().substr(14, 5)

            //       setFeedback((prev) => [
            //         ...prev,
            //         { type: "answer", text: data.answer, timestamp: aTimestamp },
            //       ])
            //     } catch (err) {
            //       console.error("Error handling follow-up question:", err)
            //     }
            //   }

            //   handleFollowUp()
            // })
            startQuestionLoop()
          })
          .catch((err) =>
            console.error("Error sending frames or retrieving next steps:", err)
          )

        ;(video as any)._pauseTimeout = timeoutId
      }, 8000)

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
    <main className="relative min-h-screen flex flex-col bg-[#f9fafb]">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.freepik.com/free-vector/medical-healthcare-blue-color_1017-26807.jpg?semt=ais_hybrid&w=740')",
        }}
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* App content */}
      <div className="relative z-10 flex flex-col h-screen">
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
          <Image
            className="object-contain"
            src="/short-synopta.png"
            alt="Synopta logo"
            width={200}
            height={100}
            priority={true}
          />
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Video */}
          <div className="w-2/3 border-r border-gray-200 p-4 overflow-y-auto bg-white/80 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#1f2937] mb-4">Surgery Video</h2>
            {file && (
              <video ref={videoRef} controls className="w-full max-w-3xl mt-4 shadow-md rounded-xl">
                <source src={URL.createObjectURL(file)} type={file.type} />
              </video>
            )}
          </div>

          {/* Right: Feedback + Listening */}
          <div className="w-1/3 p-4 flex flex-col bg-white/80 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#1f2937] mb-4">Live Feedback</h2>

            {/* Listening always visible */}
            <div className="sticky top-0 z-20 bg-white/90 py-2">
              {isListening && (
                <div className="mb-3 px-3 py-1 inline-block text-sm font-medium bg-green-100 text-green-800 rounded-full shadow-md animate-pulse">
                  🎙️ Listening for follow-up…
                </div>
              )}
            </div>

            {/* Scrollable feedback log */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              <FeedbackLog feedback={feedback} />
            </div>
          </div>
        </div>
      </div>
    </main>

  )
}
