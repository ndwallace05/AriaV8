import React from 'react';
import { CalendarEvent, Email, Task } from '../types';
import { ICONS } from '../constants';

interface DashboardViewProps {
  tasks: Task[];
  emails: Email[];
  events: CalendarEvent[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ tasks, emails, events }) => {

  const unreadEmails = emails.filter(e => !e.read);
  const upcomingEvents = events.filter(e => e.date >= new Date()).sort((a,b) => a.date.getTime() - b.date.getTime()).slice(0, 3);
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Unread Emails */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
            {ICONS.email} <span className="ml-2">Unread Emails ({unreadEmails.length})</span>
          </h2>
          <div className="space-y-3">
            {unreadEmails.length > 0 ? unreadEmails.slice(0,3).map(email => (
              <div key={email.id} className="p-3 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-800 truncate">{email.subject}</p>
                <p className="text-sm text-slate-500">From: {email.sender}</p>
              </div>
            )) : <p className="text-slate-500">No unread emails.</p>}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
            {ICONS.calendar} <span className="ml-2">Upcoming Events</span>
          </h2>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
              <div key={event.id} className="p-3 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-800">{event.title}</p>
                <p className="text-sm text-slate-500">{event.date.toLocaleDateString()}</p>
              </div>
            )) : <p className="text-slate-500">No upcoming events.</p>}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center">
            {ICONS.tasks} <span className="ml-2">Pending Tasks</span>
          </h2>
          <div className="space-y-3">
            {pendingTasks.length > 0 ? pendingTasks.map(task => (
              <div key={task.id} className="p-3 bg-slate-50 rounded-lg flex items-center">
                <input type="checkbox" className="mr-3" readOnly checked={false} />
                <p className="text-slate-800">{task.title}</p>
              </div>
            )) : <p className="text-slate-500">No pending tasks.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;
