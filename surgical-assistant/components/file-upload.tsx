"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragging ? "border-gray-500 bg-gray-50" : "border-gray-300"
      } transition-colors duration-200`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-3 bg-gray-100 rounded-full">
          <Upload className="h-8 w-8 text-gray-500" />
        </div>

        {file ? (
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-900">Drag and drop your surgery video</p>
            <p className="text-xs text-gray-500">Or click to browse (MP4, MOV, AVI up to 500MB)</p>
          </>
        )}

        <input type="file" id="file-upload" className="sr-only" accept="video/*" onChange={handleFileChange} />
        <label
          htmlFor="file-upload"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
        >
          {file ? "Replace video" : "Select video"}
        </label>
      </div>
    </div>
  )
}
