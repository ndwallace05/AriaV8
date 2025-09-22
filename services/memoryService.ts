import { Memory } from '../types';

const MEMORY_KEY = 'aria_memory';

/**
 * Retrieves all stored memories from local storage.
 * @returns {Memory[]} A list of memories. Returns an empty array on error.
 */
export const getMemories = (): Memory[] => {
  try {
    const stored = localStorage.getItem(MEMORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse memories from localStorage", error);
    return [];
  }
};

/**
 * Saves a new memory to local storage.
 * It automatically adds an ID and timestamp.
 * @param {Omit<Memory, 'id' | 'timestamp'>} newMemory The memory object to save, without id or timestamp.
 * @returns {Memory} The full memory object that was saved.
 */
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

/**
 * Searches for memories based on a query string using simple keyword matching.
 * @param {string} query The search query.
 * @param {Memory[]} memories The list of memories to search through.
 * @returns {Memory[]} A list of the top 3 matching memories, sorted by relevance.
 */
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