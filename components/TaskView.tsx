import React, { useState } from 'react';
import { Task } from '../types';

interface TaskViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskView: React.FC<TaskViewProps> = ({ tasks, setTasks }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Tasks</h1>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-sky-500 text-white hover:bg-sky-600 disabled:bg-sky-300"
            disabled={!newTaskTitle.trim()}
          >
            Add Task
          </button>
        </form>

        <div>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">Pending ({pendingTasks.length})</h2>
          <div className="space-y-2">
            {pendingTasks.map(task => (
              <div key={task.id} className="flex items-center p-3 bg-slate-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                  className="w-5 h-5 mr-3 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                />
                <span className="text-slate-800">{task.title}</span>
              </div>
            ))}
          </div>
        </div>

        {completedTasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Completed ({completedTasks.length})</h2>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center p-3 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-5 h-5 mr-3 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                  />
                  <span className="text-slate-500 line-through">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskView;
