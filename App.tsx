import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import EmailView from './components/EmailView';
import TaskView from './components/TaskView';
import MemoryView from './components/MemoryView';
import ChatWindow from './components/ChatWindow';
import { View, ChatMessage, CalendarEvent, Email, Task, Memory } from './types';
import { getAriaResponse } from './services/geminiService';
import { getMemories, saveMemory } from './services/memoryService';
import { ICONS } from './constants';

// Mock data
const MOCK_EMAILS: Email[] = [
  { id: '1', sender: 'GitHub', subject: 'Your weekly digest', body: 'Here is your weekly digest from GitHub...', read: false },
  { id: '2', sender: 'Vercel', subject: 'Deployment successful', body: 'Your project has been deployed successfully.', read: true },
  { id: '3', sender: 'Slack', subject: 'New message from John', body: 'Hey, are we still on for lunch tomorrow?', read: false },
];

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team Standup', date: new Date(new Date().setDate(new Date().getDate() + 1)) },
  { id: '2', title: 'Design Review', date: new Date(new Date().setDate(new Date().getDate() + 2)) },
  { id: '3', title: 'Project Deadline', date: new Date(new Date().setDate(new Date().getDate() + 5)) },
];

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Finish report for Q2', completed: false },
  { id: '2', title: 'Review PR from Sarah', completed: false },
  { id: '3', title: 'Update documentation', completed: true },
];

const App: React.FC = () => {
  const [currentView, setView] = useState<View>(View.DASHBOARD);
  const [isChatOpen, setChatOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hi! I'm Aria, your personal AI assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    setMemories(getMemories());
  }, []);

  const handleSendMessage = async (message: string) => {
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: message }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const responseText = await getAriaResponse(newMessages, memories);
      
      try {
        const jsonMatch = responseText.match(/{.*}/s); 
        if (jsonMatch) {
            const responseObject = JSON.parse(jsonMatch[0]);
            if (responseObject.memory) {
              const newMemory = saveMemory({ content: responseObject.memory });
              setMemories(prev => [...prev, newMemory]);
              setMessages(prev => [...prev, { role: 'model', content: `Ok, I'll remember that: "${responseObject.memory}"` }]);
              setIsLoading(false);
              return;
            }
        }
      } catch (e) {
        // Not a valid JSON object, treat as a normal text response
      }

      setMessages(prev => [...prev, { role: 'model', content: responseText }]);

    } catch (error) {
      console.error("Failed to get response from Aria:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardView tasks={tasks} emails={emails} events={events} />;
      case View.CALENDAR:
        return <CalendarView events={events} />;
      case View.EMAIL:
        return <EmailView emails={emails} />;
      case View.TASKS:
        return <TaskView tasks={tasks} setTasks={setTasks} />;
      case View.MEMORY:
        return <MemoryView memories={memories} />;
      default:
        return <DashboardView tasks={tasks} emails={emails} events={events} />;
    }
  };

  const capitalize = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

  return (
    <div className="h-screen bg-slate-50 font-sans flex overflow-hidden">
      <Sidebar currentView={currentView} setView={setView} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white shadow-sm">
            <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
                {ICONS.hamburger}
            </button>
            <h1 className="text-lg font-bold text-slate-800">{capitalize(currentView)}</h1>
            <div className="w-6"></div>
        </header>
        <div className="flex-grow overflow-y-auto">
            {renderView()}
        </div>
      </main>
      
      <button
        onClick={() => setChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-sky-500 text-white p-4 rounded-full shadow-lg hover:bg-sky-600 transition-transform transform hover:scale-110 z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
      </button>

      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
