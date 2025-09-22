import React from 'react';
import { Memory } from '../types';
import { ICONS } from '../constants';

interface MemoryViewProps {
    memories: Memory[];
}

const MemoryView: React.FC<MemoryViewProps> = ({ memories }) => {
  const sortedMemories = [...memories].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Aria's Memory</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="space-y-4">
          {sortedMemories.length > 0 ? (
            sortedMemories.map(memory => (
              <div
                key={memory.id}
                className="flex items-start p-4 bg-slate-50 rounded-lg"
              >
                <div className="text-sky-500 mr-4 mt-1 flex-shrink-0">
                  {ICONS.brain}
                </div>
                <div className="flex-grow">
                  <p className="text-slate-800">
                    {memory.content}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                      Remembered on {new Date(memory.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-8">
              Aria hasn't learned anything about you yet. Try telling her something to remember!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryView;