import React, { useState } from 'react';
import { Email } from '../types';

const EmailView: React.FC<{ emails: Email[] }> = ({ emails }) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(emails[0] || null);

  return (
    <div className="p-8 h-full flex gap-8">
      <div className="w-1/3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 px-2">Inbox</h1>
        <div className="overflow-y-auto flex-grow">
          {emails.map(email => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                selectedEmail?.id === email.id ? 'bg-sky-100' : 'hover:bg-slate-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className={`font-semibold text-slate-800 ${!email.read ? 'font-bold' : ''}`}>{email.sender}</h3>
                {!email.read && <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>}
              </div>
              <p className={`text-sm text-slate-600 truncate ${!email.read ? 'font-semibold text-slate-700' : ''}`}>{email.subject}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-y-auto">
        {selectedEmail ? (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedEmail.subject}</h2>
            <p className="text-slate-600 mb-6 border-b border-slate-200 pb-4">
              From: <span className="font-semibold">{selectedEmail.sender}</span>
            </p>
            <div className="prose prose-slate max-w-none">
              <p>{selectedEmail.body}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Select an email to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailView;
