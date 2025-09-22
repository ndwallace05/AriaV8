import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ICONS } from '../constants';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

/**
 * Renders the chat window for interacting with the Aria assistant.
 * It displays messages, handles user input, and supports voice commands.
 * @param {ChatWindowProps} props The component props.
 * @param {boolean} props.isOpen Whether the chat window is open.
 * @param {() => void} props.onClose The function to call when the chat window is closed.
 * @param {ChatMessage[]} props.messages The list of chat messages to display.
 * @param {(message: string) => void} props.onSendMessage The function to call when a message is sent.
 * @param {boolean} props.isLoading Whether the assistant is currently processing a message.
 * @returns {React.ReactElement | null} The rendered chat window or null if it's closed.
 */
const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Callback for the speech recognition hook.
   * Updates the input field and sends the message when a transcript is finalized.
   * @param {string} transcript The finalized transcript from speech recognition.
   */
  const handleTranscriptChanged = (transcript: string) => {
    setInputValue(transcript);
    onSendMessage(transcript);
  };
  
  const { isListening, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition({ onTranscriptChanged: handleTranscriptChanged });

  /**
   * Scrolls the message list to the bottom.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  /**
   * Handles the submission of the message input form.
   * @param {React.FormEvent} e The form event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  /**
   * Toggles the speech recognition listening state.
   */
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-8 md:w-96 md:h-[500px] bg-white rounded-none md:rounded-2xl shadow-2xl flex flex-col border-slate-200 z-50">
      <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 md:rounded-t-2xl">
        <h2 className="text-lg font-semibold text-slate-800">Aria Assistant</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
          {ICONS.close}
        </button>
      </header>
      <main className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.role === 'user' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
           {isLoading && messages[messages.length - 1]?.role === 'user' && (
             <div className="flex justify-start">
               <div className="bg-slate-200 text-slate-800 px-4 py-2 rounded-2xl">
                 <div className="flex items-center space-x-1">
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
                 </div>
               </div>
             </div>
           )}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-grow px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400"
            disabled={isLoading || isListening}
          />
          {hasRecognitionSupport && (
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {ICONS.microphone}
            </button>
          )}
          <button
            type="submit"
            className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 disabled:bg-sky-300"
            disabled={isLoading || isListening}
          >
            {ICONS.send}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
