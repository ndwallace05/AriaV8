import React, { useState } from 'react';
import { Task, View } from '../types';
import VoiceCommandButton from './VoiceCommandButton';
import { getAriaAction } from '../services/geminiService';
import { createTask, completeTask } from '../services/googleTasksService';
import { ICONS } from '../constants';

interface TaskViewProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    accessToken: string | null;
    requestApiAccess: () => void;
}

const TaskView: React.FC<TaskViewProps> = ({ tasks, setTasks, accessToken, requestApiAccess }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);
    const [isAddingTask, setIsAddingTask] = useState(false);

    const handleAddTask = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newTaskTitle.trim() || !accessToken) return;

        setIsAddingTask(true);
        try {
            const newTask = await createTask(accessToken, newTaskTitle);
            setTasks(prev => [...prev, newTask]);
            setNewTaskTitle('');
        } catch (error) {
            console.error("Error creating task:", error);
            alert("Sorry, I couldn't add the task.");
        } finally {
            setIsAddingTask(false);
        }
    };

    const handleCompleteTask = async (task: Task) => {
        if (!accessToken) return;
        
        // Optimistic UI update
        const originalTasks = tasks;
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
        
        try {
            await completeTask(accessToken, task.id);
        } catch (error) {
            console.error("Error completing task:", error);
            alert("Sorry, I couldn't complete the task. Reverting change.");
            // Revert on failure
            setTasks(originalTasks);
        }
    };

    const handleVoiceCommand = async (command: string) => {
        if (!command || !accessToken) return;
        
        setIsProcessingVoice(true);
        try {
            const contextData = { tasks };
            const result = await getAriaAction(command, View.TASKS, contextData);
            
            if (result && result.action === 'ADD_TASK' && result.payload.title) {
                const createdTask = await createTask(accessToken, result.payload.title);
                setTasks(prev => [...prev, createdTask]);
            } else if (result && result.action === 'COMPLETE_TASK' && result.payload.title) {
                const taskToComplete = tasks.find(t => t.title.toLowerCase().includes(result.payload.title.toLowerCase()) && !t.completed);
                if (taskToComplete) {
                    await handleCompleteTask(taskToComplete);
                } else {
                    alert(`Could not find a pending task with title: "${result.payload.title}"`);
                }
            }
        } catch (error) {
            console.error("Error processing voice command for tasks:", error);
            alert("Sorry, I couldn't perform that task action.");
        } finally {
            setIsProcessingVoice(false);
        }
    };

    if (!accessToken) {
        return (
            <div className="p-4 md:p-8 flex flex-col h-full items-center justify-center text-center">
                <div className="max-w-md">
                    <div className="text-sky-500 mx-auto w-16 h-16 mb-4">{ICONS.tasks}</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect Your Tasks</h2>
                    <p className="text-slate-500 mb-6">To see and manage your to-do list, please connect your Google Tasks in the settings.</p>
                    <button 
                        onClick={requestApiAccess} 
                        className="px-6 py-3 rounded-lg bg-sky-500 text-white hover:bg-sky-600 font-semibold shadow-md"
                    >
                        Connect Google Tasks
                    </button>
                </div>
            </div>
        );
    }
    
    const pendingTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="p-4 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Tasks</h1>
                <VoiceCommandButton onCommand={handleVoiceCommand} isProcessing={isProcessingVoice} />
            </div>

            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={handleAddTask} className="flex gap-3 mb-6">
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Add a new task..."
                            className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                            disabled={isAddingTask}
                        />
                        <button type="submit" className="px-5 py-2 bg-sky-500 text-white rounded-lg font-semibold hover:bg-sky-600 disabled:bg-sky-300" disabled={!newTaskTitle.trim() || isAddingTask}>
                            {isAddingTask ? 'Adding...' : 'Add'}
                        </button>
                    </form>

                    <div className="space-y-3">
                        {pendingTasks.map(task => (
                            <div key={task.id} className="flex items-center p-3 bg-slate-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleCompleteTask(task)}
                                    className="w-5 h-5 mr-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400"
                                />
                                <span className="text-slate-800">{task.title}</span>
                            </div>
                        ))}
                    </div>

                    {completedTasks.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-slate-600 mb-3 border-t border-slate-200 pt-4">Completed ({completedTasks.length})</h2>
                            <div className="space-y-3">
                                {completedTasks.map(task => (
                                    <div key={task.id} className="flex items-center p-3">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            readOnly
                                            className="w-5 h-5 mr-4 text-slate-400 rounded border-slate-300"
                                        />
                                        <span className="text-slate-500 line-through">{task.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {tasks.length === 0 && (
                        <p className="text-slate-500 text-center py-6">You have no tasks. Add one above to get started!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskView;
