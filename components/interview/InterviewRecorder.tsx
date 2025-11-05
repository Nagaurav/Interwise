"use client";
import { useState, useRef, useEffect } from "react";

interface InterviewRecorderProps {
  interviewId: string;
  onStart?: () => void;
  onStop?: (recording: Blob) => void;
  onError?: (error: string) => void;
}

const InterviewRecorder = ({
  interviewId,
  onStart,
  onStop,
  onError,
}: InterviewRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      
      // Set up video preview with error handling
      if (videoRef.current) {
        try {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (playError) {
          console.warn("Video play failed:", playError);
          // Try alternative approach for older browsers
          if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch(err => {
              console.error("Video play still failed:", err);
              if (onError) onError("Could not start video preview. Recording will still work.");
            });
          }
        }
      }

      // More robust codec selection
      let mimeType = "video/webm";
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
        mimeType = "video/webm;codecs=vp9,opus";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
        mimeType = "video/webm;codecs=vp8,opus";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
        mimeType = "video/webm;codecs=vp8";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        console.log('Data available:', { size: e.data.size, type: e.data.type });
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, chunks count:', chunksRef.current.length);
        
        if (chunksRef.current.length === 0) {
          console.warn('No video chunks recorded');
          if (onError) onError('No video data was recorded. Please try again.');
          return;
        }

        try {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          console.log('Video blob created:', { size: blob.size, type: blob.type });
          chunksRef.current = [];
          
          if (onStop) {
            console.log('Calling onStop with blob');
            onStop(blob);
          } else {
            console.warn('No onStop callback provided');
          }
        } catch (error) {
          console.error('Error creating video blob:', error);
          if (onError) onError('Failed to process recorded video. Please try again.');
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setHasPermission(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      if (onStart) onStart();
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setHasPermission(false);
      if (onError) onError("Could not access camera/microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      console.log('MediaRecorder state:', mediaRecorderRef.current.state);
      
      // Stop the media recorder first
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Clean up video element and stream after a short delay
      // to allow the onstop event to fire
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }, 100);
    } else {
      console.warn('MediaRecorder not active or not available');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-6 py-3 rounded-full ${
              isRecording 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-medium flex items-center gap-2 transition-colors`}
          >
            {isRecording ? (
              <>
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                Stop Recording
              </>
            ) : (
              <>
                <span className="w-3 h-3 bg-white rounded-full"></span>
                Start Recording
              </>
            )}
          </button>
          
          {isRecording && (
            <div className="bg-zinc-800 px-4 py-2 rounded-full text-white">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>
        
        {hasPermission === false && (
          <p className="text-red-500 text-sm">
            Camera/microphone access is required to record the interview.
          </p>
        )}
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="relative w-full max-w-3xl mx-auto bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className={`w-full ${!isRecording && !hasPermission ? 'h-64' : ''} object-cover`}
          muted
          playsInline
          onError={(e) => {
            console.error("Video element error:", e);
            if (onError) onError("Video display error. Please try refreshing the page.");
          }}
          onLoadStart={() => {
            // Clear any previous errors when loading starts
            setError(null);
          }}
        />
        {!isRecording && hasPermission !== false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
              <p>Camera is ready. Click "Start Recording" to begin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewRecorder;
