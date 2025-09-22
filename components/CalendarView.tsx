import React, { useState } from 'react';
import { CalendarEvent, View } from '../types';
import VoiceCommandButton from './VoiceCommandButton';
import { getAriaAction } from '../services/geminiService';
import { createCalendarEvent } from '../services/googleCalendarService';
import { ICONS } from '../constants';

interface CalendarViewProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  accessToken: string | null;
  requestApiAccess: () => void;
}

/**
 * Renders the calendar view, displaying events for the selected month.
 * It allows navigation between months and adding events via voice command.
 * @param {CalendarViewProps} props The component props.
 * @param {CalendarEvent[]} props.events The list of calendar events to display.
 * @param {React.Dispatch<React.SetStateAction<CalendarEvent[]>>} props.setEvents The function to update the events state.
 * @param {string | null} props.accessToken The Google API access token.
 * @param {() => void} props.requestApiAccess The function to call when API access is requested.
 * @returns {React.ReactElement} The rendered calendar view.
 */
const CalendarView: React.FC<CalendarViewProps> = ({ events, setEvents, accessToken, requestApiAccess }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startOfMonth.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  /**
   * Changes the current month being viewed.
   * @param {number} amount The number of months to change by (e.g., 1 for next, -1 for previous).
   */
  const changeMonth = (amount: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
  };

  /**
   * Checks if two dates are the same day, ignoring time.
   * @param {Date} d1 The first date.
   * @param {Date} d2 The second date.
   * @returns {boolean} True if the dates are the same day.
   */
  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  /**
   * Checks if a given date is today.
   * @param {Date} d The date to check.
   * @returns {boolean} True if the date is today.
   */
  const isToday = (d: Date) => isSameDay(d, new Date());
  
  /**
   * Handles the voice command to add a calendar event.
   * @param {string} command The transcribed voice command.
   */
  const handleVoiceCommand = async (command: string) => {
    if (!command) return;
    
    if (!accessToken) {
        alert("Please sync your Google Calendar from the Settings page to add events by voice.");
        return;
    }

    setIsProcessingVoice(true);
    try {
        const result = await getAriaAction(command, View.CALENDAR, {});
        if (result && result.action === 'ADD_EVENT' && result.payload.title && result.payload.date) {
            const newEventDetails = {
                title: result.payload.title,
                date: result.payload.date, // This should be in 'YYYY-MM-DD' format
            };
            const createdEvent = await createCalendarEvent(accessToken, newEventDetails);
            setEvents(prev => [...prev, createdEvent]);
        }
    } catch (error) {
        console.error("Error processing voice command for calendar:", error);
        alert("Sorry, I couldn't add the event to your Google Calendar.");
    } finally {
        setIsProcessingVoice(false);
    }
  };

  if (!accessToken) {
    return (
        <div className="p-4 md:p-8 flex flex-col h-full items-center justify-center text-center">
            <div className="max-w-md">
                <div className="text-sky-500 mx-auto w-16 h-16 mb-4">
                    {ICONS.calendar}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect Your Calendar</h2>
                <p className="text-slate-500 mb-6">To see and manage your events, please connect your Google Calendar in the settings.</p>
                <button 
                    onClick={requestApiAccess} 
                    className="px-6 py-3 rounded-lg bg-sky-500 text-white hover:bg-sky-600 font-semibold shadow-md"
                >
                    Connect Google Calendar
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center sm:text-left">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex space-x-2 items-center">
          <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-white border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100">&lt;</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 bg-white border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100">Today</button>
          <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-white border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100">&gt;</button>
          <VoiceCommandButton onCommand={handleVoiceCommand} isProcessing={isProcessingVoice} />
        </div>
      </div>

      <div className="grid grid-cols-7 text-center font-semibold text-slate-500 border-b border-slate-200 pb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 flex-grow gap-px bg-slate-200 border-l border-r border-b border-slate-200 rounded-b-lg overflow-hidden">
        {days.map((d, i) => {
          const eventsForDay = events.filter(e => isSameDay(e.date, d));
          return (
            <div key={i} className={`bg-white p-1 sm:p-2 flex flex-col ${d.getMonth() !== currentDate.getMonth() ? 'bg-slate-50' : ''}`}>
              <div className={`text-xs sm:text-sm font-semibold mb-1 self-end ${
                isToday(d) ? 'bg-sky-500 text-white rounded-full h-6 w-6 sm:h-7 sm:w-7 flex items-center justify-center' : 'text-slate-700'
              } ${d.getMonth() !== currentDate.getMonth() ? 'text-slate-400' : ''}`}>
                {d.getDate()}
              </div>
              <div className="space-y-1 overflow-y-auto">
                {eventsForDay.map(event => (
                  <div key={event.id} className="bg-sky-100 text-sky-800 text-xs p-1 rounded-md truncate">
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
