import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ICONS } from '../constants';

interface VoiceCommandButtonProps {
    onCommand: (command: string) => void;
    isProcessing: boolean;
}

/**
 * Renders a button that allows users to issue voice commands.
 * It uses the `useSpeechRecognition` hook to handle the speech-to-text functionality.
 * @param {VoiceCommandButtonProps} props The component props.
 * @param {(command: string) => void} props.onCommand The function to call when a voice command is transcribed.
 * @param {boolean} props.isProcessing Whether a command is currently being processed.
 * @returns {React.ReactElement | null} The rendered button or null if speech recognition is not supported.
 */
const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ onCommand, isProcessing }) => {
    const { isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition({
        onTranscriptChanged: onCommand
    });

    /**
     * Toggles the speech recognition listening state.
     */
    const handleClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };
    
    if (!hasRecognitionSupport) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isProcessing}
            className={`p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-sky-500 text-white hover:bg-sky-600'
            } disabled:bg-sky-300 disabled:cursor-not-allowed`}
            aria-label={isListening ? "Stop listening" : "Start voice command"}
        >
            {isProcessing ? (
                <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150 mx-0.5"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
                </div>
            ) : ICONS.microphone}
        </button>
    );
};

export default VoiceCommandButton;
