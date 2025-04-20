"use client";
import { createContext, useContext, useState } from 'react';

// set up basi structure for video context
interface VideoData {
    file: File | null;
    disease: string;
    history: string;
    setVideoData: (data: Partial<VideoData>) => void;
}

const VideoContext = createContext<VideoData | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [file, setFile] = useState<File | null>(null);
    const [disease, setDisease] = useState<string>('');
    const [history, setHistory] = useState<string>('');

    // set context values
    const setVideoData = (data: Partial<VideoData>) => {
        if (data.file) setFile(data.file);
        if (data.disease) setDisease(data.disease);
        if (data.history) setHistory(data.history);
    }

    return <VideoContext.Provider value={{ file, disease, history, setVideoData }}>
        {children}
    </VideoContext.Provider>;
};

export const useVideoContext = (): VideoData => {
    const context = useContext(VideoContext);
    if (!context) throw new Error('error with video context');
    return context;
}