import { useState, useEffect, useRef, useCallback } from 'react';

// This is a browser-only API
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

/**
 * A custom hook to handle speech recognition using the Web Speech API.
 * It provides controls for starting and stopping listening, and reports the transcribed text.
 * @param {{ onTranscriptChanged: (transcript: string) => void }} props The hook's props.
 * @param {(transcript: string) => void} props.onTranscriptChanged Callback function when a transcript is finalized.
 * @returns {{
 *  isListening: boolean,
 *  startListening: () => void,
 *  stopListening: () => void,
 *  hasRecognitionSupport: boolean
 * }} An object containing speech recognition state and control functions.
 */
export const useSpeechRecognition = (
    { onTranscriptChanged }: { onTranscriptChanged: (transcript: string) => void }
) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null); // Using 'any' for SpeechRecognition to avoid browser-specific type issues

  useEffect(() => {
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false; // Only get final results
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscriptChanged(transcript);
      stopListening();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
        setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onTranscriptChanged]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Could not start speech recognition:", error);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!SpeechRecognition,
  };
};
