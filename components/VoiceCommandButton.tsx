import React from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ICONS } from '../constants';

interface VoiceCommandButtonProps {
    onCommand: (command: string) => void;
    isProcessing: boolean;
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ onCommand, isProcessing }) => {
    const { isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition({
        onTranscriptChanged: onCommand
    });

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
