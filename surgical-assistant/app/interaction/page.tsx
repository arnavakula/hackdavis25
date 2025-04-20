  "use client"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Switch } from "@/components/ui/switch"
  import { Label } from "@/components/ui/label"
  import { VideoPlayer } from "@/components/video-player"
  import { FeedbackLog } from "@/components/feedback-log"
  import { useVideoContext } from "@/app/context/VideoContext"
  import { useRef, useEffect, useState } from "react"
  import React from "react";

  export type FeedbackEntry = {
    type: "next_steps" | "question" | "answer";
    text: string;
    timestamp: string;
  };

  export default function InteractionPage() {
    type FeedbackOption = {
      type: 'next_steps' | 'question' | 'answer'
      text: string
      timestamp: string
    }

    const { file, disease, history } = useVideoContext()
    const videoRef = useRef<HTMLVideoElement>(null)

    const [feedback, setFeedback] = useState<FeedbackOption[]>([])
    console.log(feedback)

    

    //helper function for speaking
    const speak = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.pitch = 1
      utterance.rate = 1.25
      utterance.volume = 1
      speechSynthesis.speak(utterance)
    }

    const readNextSteps = async (e: React.FormEvent) => {
      e.preventDefault()
      const res = await fetch("http://localhost:8000/next_steps")
      const data = await res.json()
      speak(data.next_steps || 'no next steps available')
      console.log('next steps: ', data.next_steps)
    }

    //play for 5 seconds and then pause using ref
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
          
          // send frames to backend
          fetch("http://localhost:8000/frames", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ frames }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("result of route:", data)
              return fetch('http://localhost:8000/next_steps')
            })
            .then((res) => res.json())
            .then((data) => {
              //append feedback with next steps as such {type: 'next_steps', text: data.next_steps}
              const timestamp = videoRef.current?.currentTime || 0;
              const formattedTimestamp = new Date(timestamp * 1000).toISOString().substr(14, 5);
              setFeedback((prev: FeedbackOption[]) => [...prev, { type: 'next_steps', text: data.next_steps, timestamp: formattedTimestamp }])
              speak(data.next_steps || 'no next steps available');
            })
            .catch((err) => console.error("error with sending frames to backend + next steps:", err))
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
      
    console.log(file, disease, history)
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

            {/* Right Column - Doctor Input */}
          </div>
        </div>
      </main>
    )
  }

  // <div className="w-1/3 p-4 flex flex-col">
  //             <h2 className="text-lg font-medium text-gray-800 mb-4">Doctor Input</h2>

  //             <div className="flex items-center justify-end mb-4 space-x-2">
  //               <Label htmlFor="voice-feedback" className="text-sm text-gray-700">
  //                 Voice Feedback
  //               </Label>
  //               <Switch id="voice-feedback" />
  //             </div>

  //             <div className="flex-1 flex flex-col">
  //               <div className="flex-1 overflow-y-auto mb-4">{/* This space will show previous questions/answers */}</div>

  //               <div className="mt-auto">
  //                 <form className="flex items-end space-x-2">
  //                   <div className="flex-1">
  //                     <Label htmlFor="assistant-input" className="sr-only">
  //                       Ask the assistant
  //                     </Label>
  //                     <Input id="assistant-input" placeholder="Ask the assistant..." className="w-full" />
  //                   </div>
  //                   <Button onClick={(e) => readNextSteps(e)}>Send</Button>
  //                 </form>
  //               </div>
  //             </div>
  //           </div>