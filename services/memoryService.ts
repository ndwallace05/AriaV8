import { Memory } from '../types';

const MEMORY_KEY = 'aria_memory';

export const getMemories = (): Memory[] => {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse memories from localStorage", error);
    return [];
  }
};

export const saveMemory = (newMemory: Omit<Memory, 'id' | 'timestamp'>): Memory => {
  const memories = getMemories();
  const memory: Memory = {
    ...newMemory,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  };
  const updatedMemories = [...memories, memory];
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(updatedMemories));
  } catch (error) {
    console.error("Failed to save memory to localStorage", error);
  }
  return memory;
};

// Simple keyword-based search. Not perfect, but good enough for this context.
export const searchMemories = (query: string, memories: Memory[]): Memory[] => {
  if (!query || memories.length === 0) return [];
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (queryWords.length === 0) return [];
  
  const scoredMemories = memories.map(memory => {
    let score = 0;
    const memoryContent = memory.content.toLowerCase();
    for (const word of queryWords) {
      if (memoryContent.includes(word)) {
        score++;
      }
    }
    return { memory, score };
  });

  return scoredMemories
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.memory)
    .slice(0, 3); // Return top 3 matches
};