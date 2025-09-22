import React, { useState, useEffect } from 'react';
import { Email, View } from '../types';
import { ICONS } from '../constants';
import VoiceCommandButton from './VoiceCommandButton';
import { getAriaAction } from '../services/geminiService';
import { markEmailAsRead } from '../services/gmailService';

interface EmailViewProps {
  emails: Email[];
  setEmails: React.Dispatch<React.SetStateAction<Email[]>>;
  accessToken: string | null;
  requestApiAccess: () => void;
}

const EmailView: React.FC<EmailViewProps> = ({ emails, setEmails, accessToken, requestApiAccess }) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  useEffect(() => {
    if (emails.length > 0 && window.innerWidth >= 768) {
        const firstUnread = emails.find(e => !e.read);
        if (firstUnread) {
            handleSelectEmail(firstUnread);
        } else if (!selectedEmail) {
            setSelectedEmail(emails[0]);
        }
    }
  }, [emails]);

  const handleSelectEmail = (email: Email) => {
      setSelectedEmail(email);
      if (!email.read && accessToken) {
          markEmailAsRead(accessToken, email.id)
            .then(() => {
                setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
            })
            .catch(err => console.error("Failed to mark email as read on selection:", err));
      }
  };

  const findEmail = (sender: string, subject: string): Email | null => {
      const senderLower = sender.toLowerCase();
      const subjectLower = subject.toLowerCase();
      return emails.find(e => 
          e.sender.toLowerCase().includes(senderLower) && 
          e.subject.toLowerCase().includes(subjectLower)
      ) || null;
  };

  const handleVoiceCommand = async (command: string) => {
      if (!command || !accessToken) return;
      setIsProcessingVoice(true);
      try {
          const result = await getAriaAction(command, View.EMAIL, { emails });
          if (result && result.payload.sender && result.payload.subject) {
              const email = findEmail(result.payload.sender, result.payload.subject);
              if (email) {
                  if (result.action === 'MARK_READ' && !email.read) {
                      await markEmailAsRead(accessToken, email.id);
                      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
                  } else if (result.action === 'SELECT_EMAIL') {
                      handleSelectEmail(email);
                  }
              }
          }
      } catch (error) {
          console.error("Error processing voice command for email:", error);
          alert("Sorry, I couldn't perform that action on your email.");
      } finally {
          setIsProcessingVoice(false);
      }
  };

  if (!accessToken) {
    return (
        <div className="p-4 md:p-8 flex flex-col h-full items-center justify-center text-center">
            <div className="max-w-md">
                <div className="text-sky-500 mx-auto w-16 h-16 mb-4">{ICONS.email}</div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect Your Inbox</h2>
                <p className="text-slate-500 mb-6">To see and manage your emails, please connect your Google account in the settings.</p>
                <button 
                    onClick={requestApiAccess} 
                    className="px-6 py-3 rounded-lg bg-sky-500 text-white hover:bg-sky-600 font-semibold shadow-md"
                >
                    Connect Gmail
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Email List */}
      <div className={`w-full md:w-1/3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex-col ${selectedEmail && window.innerWidth < 768 ? 'hidden' : 'flex'}`}>
        <div className="flex items-center justify-between mb-4 px-2">
          <h1 className="text-2xl font-bold text-slate-800">Inbox</h1>
          <VoiceCommandButton onCommand={handleVoiceCommand} isProcessing={isProcessingVoice} />
        </div>
        <div className="overflow-y-auto flex-grow">
          {emails.map(email => (
            <div
              key={email.id}
              onClick={() => handleSelectEmail(email)}
              className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                selectedEmail?.id === email.id ? 'bg-sky-100' : 'hover:bg-slate-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className={`text-slate-800 ${!email.read ? 'font-bold' : 'font-semibold'}`}>{email.sender}</h3>
                {!email.read && <div className="w-2.5 h-2.5 bg-sky-500 rounded-full flex-shrink-0 ml-2"></div>}
              </div>
              <p className={`text-sm text-slate-600 truncate ${!email.read ? 'font-semibold text-slate-700' : ''}`}>{email.subject}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email Content */}
      <div className={`w-full md:w-2/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-col ${!selectedEmail && window.innerWidth < 768 ? 'hidden' : 'flex'}`}>
        {selectedEmail ? (
          <div className="h-full flex flex-col">
            <button className="md:hidden mb-4 flex items-center text-sky-600 font-semibold" onClick={() => setSelectedEmail(null)}>
                {ICONS.back}
                <span className="ml-2">Back to Inbox</span>
            </button>
            <div className="overflow-y-auto flex-grow">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedEmail.subject}</h2>
                <p className="text-slate-600 mb-6 border-b border-slate-200 pb-4">
                From: <span className="font-semibold">{selectedEmail.sender}</span>
                </p>
                <div className="prose prose-slate max-w-none">
                <p>{selectedEmail.body}</p>
                </div>
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
