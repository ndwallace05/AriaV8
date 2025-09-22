import React, { useState, useEffect, useCallback } from 'react';
import { View, ChatMessage, Task, CalendarEvent, Email, Memory } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CalendarView from './components/CalendarView';
import EmailView from './components/EmailView';
import TaskView from './components/TaskView';
import MemoryView from './components/MemoryView';
import SettingsView from './components/SettingsView';
import ChatWindow from './components/ChatWindow';
import { ICONS } from './constants';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { listCalendarEvents } from './services/googleCalendarService';
import { listEmails } from './services/gmailService';
import { listTasks } from './services/googleTasksService';
import { getMemories, saveMemory } from './services/memoryService';
import { getAriaResponse } from './services/geminiService';

const App: React.FC = () => {
    const [view, setView] = useState<View>(View.DASHBOARD);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hi! I'm Aria, your personal AI assistant. How can I help you today?" }
    ]);
    const [isAriaLoading, setIsAriaLoading] = useState(false);

    // Data states
    const [tasks, setTasks] = useState<Task[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [memories, setMemories] = useState<Memory[]>(getMemories());

    const { isLoggedIn, accessToken, userProfile, login, logout, isApiReady } = useGoogleAuth();

    const fetchData = useCallback(async () => {
        if (isLoggedIn && accessToken) {
            try {
                const [calendarData, emailData, taskData] = await Promise.all([
                    listCalendarEvents(accessToken),
                    listEmails(accessToken),
                    listTasks(accessToken)
                ]);
                setEvents(calendarData);
                setEmails(emailData);
                setTasks(taskData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
                // Handle token expiration or other auth errors by logging out
                if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
                    logout();
                }
            }
        }
    }, [isLoggedIn, accessToken, logout]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSendMessage = async (message: string) => {
        const newUserMessage: ChatMessage = { role: 'user', content: message };
        const newHistory = [...chatMessages, newUserMessage];
        setChatMessages(newHistory);
        setIsAriaLoading(true);

        try {
            const responseText = await getAriaResponse(newHistory, memories);
            
            // Check if response is a memory command
            try {
                const jsonResponse = JSON.parse(responseText);
                if (jsonResponse.memory) {
                    const newMemory = saveMemory({ content: jsonResponse.memory });
                    setMemories(prev => [...prev, newMemory]);
                    setChatMessages(prev => [...prev, { role: 'model', content: `Okay, I'll remember that: "${jsonResponse.memory}"` }]);
                } else {
                    throw new Error("Not a memory object");
                }
            } catch (e) {
                // Not a JSON memory object, treat as regular text
                setChatMessages(prev => [...prev, { role: 'model', content: responseText }]);
            }

        } catch (error) {
            console.error("Error getting Aria's response:", error);
            setChatMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setIsAriaLoading(false);
        }
    };
    
    const requestApiAccess = () => {
        setView(View.SETTINGS);
    };

    const renderView = () => {
        switch (view) {
            case View.DASHBOARD: return <DashboardView tasks={tasks} emails={emails} events={events} />;
            case View.CALENDAR: return <CalendarView events={events} setEvents={setEvents} accessToken={accessToken} requestApiAccess={requestApiAccess} />;
            case View.EMAIL: return <EmailView emails={emails} setEmails={setEmails} accessToken={accessToken} requestApiAccess={requestApiAccess} />;
            case View.TASKS: return <TaskView tasks={tasks} setTasks={setTasks} accessToken={accessToken} requestApiAccess={requestApiAccess} />;
            case View.MEMORY: return <MemoryView memories={memories} />;
            case View.SETTINGS: return <SettingsView isApiReady={isApiReady} isLoggedIn={isLoggedIn} userProfile={userProfile} login={login} logout={logout} />;
            default: return <DashboardView tasks={tasks} emails={emails} events={events} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userProfile={userProfile} />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="md:hidden flex justify-between items-center p-4 bg-white border-b border-slate-200">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
                        {ICONS.hamburger}
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">Aria</h1>
                    <div className="w-6"></div> {/* Placeholder for balance */}
                </header>

                <main className="flex-1 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
            
            <ChatWindow 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                messages={chatMessages} 
                onSendMessage={handleSendMessage} 
                isLoading={isAriaLoading} 
            />

            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-sky-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-sky-600 transition-transform hover:scale-110"
                    aria-label="Open Aria Assistant"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </button>
            )}
        </div>
    );
};

export default App;
