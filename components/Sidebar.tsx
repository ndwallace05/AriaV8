import React from 'react';
import { View } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: View.DASHBOARD, icon: ICONS.dashboard, label: 'Dashboard' },
    { view: View.CALENDAR, icon: ICONS.calendar, label: 'Calendar' },
    { view: View.EMAIL, icon: ICONS.email, label: 'Email' },
    { view: View.TASKS, icon: ICONS.tasks, label: 'Tasks' },
    { view: View.MEMORY, icon: ICONS.brain, label: 'Memory' },
  ];

  return (
    <div className="w-64 bg-white h-full p-4 flex flex-col border-r border-slate-200">
      <div className="flex items-center space-x-2 mb-10 px-2">
        <div className="bg-sky-500 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Aria</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => setView(item.view)}
                className={`w-full flex items-center space-x-3 p-3 my-1 rounded-lg text-left transition-all duration-200 ${
                  currentView === item.view
                    ? 'bg-sky-100 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="bg-slate-100 p-4 rounded-lg text-center">
        <p className="text-sm text-slate-600">Your Personal AI Assistant</p>
      </div>
    </div>
  );
};

export default Sidebar;