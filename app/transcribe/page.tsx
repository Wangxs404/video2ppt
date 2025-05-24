import RealtimeTranscriber from "../components/realtime-transcriber";
import { Suspense } from "react";

export default function TranscribePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Real-time Audio Transcription</h1>
      <Suspense fallback={<div className="text-center">Loading Transcriber...</div>}>
        <RealtimeTranscriber />
      </Suspense>
    </div>
  );
} 