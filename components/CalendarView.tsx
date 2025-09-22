import React, { useState } from 'react';
import { CalendarEvent } from '../types';

const CalendarView: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const changeMonth = (amount: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isToday = (d: Date) => isSameDay(d, new Date());

  return (
    <div className="p-4 md:p-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 text-center sm:text-left">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex space-x-2">
          <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-white border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100">&lt;</button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 bg-white border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100">Today</button>
          <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-white border border-slate-300 rounded-md text-slate-600 hover:bg-slate-100">&gt;</button>
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
