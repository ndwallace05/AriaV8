import { Task } from '../types';

const TASKS_API_BASE_URL = 'https://tasks.googleapis.com/tasks/v1';

/**
 * Retrieves the ID of the user's primary (first) task list.
 * @param {string} accessToken The Google API access token.
 * @returns {Promise<string | null>} A promise that resolves to the task list ID, or null if not found.
 */
const getPrimaryTaskListId = async (accessToken: string): Promise<string | null> => {
    const response = await fetch(`${TASKS_API_BASE_URL}/users/@me/lists`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        console.error('Failed to fetch task lists');
        return null;
    }
    const data = await response.json();
    return data.items?.[0]?.id || null; // Return the first list ID
};

/**
 * Lists all tasks from the user's primary task list.
 * @param {string} accessToken The Google API access token.
 * @returns {Promise<Task[]>} A promise that resolves to a list of tasks.
 * @throws {Error} If the API request fails.
 */
export const listTasks = async (accessToken: string): Promise<Task[]> => {
    const taskListId = await getPrimaryTaskListId(accessToken);
    if (!taskListId) return [];

    const response = await fetch(`${TASKS_API_BASE_URL}/lists/${taskListId}/tasks`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        console.error('Failed to fetch tasks');
        throw new Error('Failed to fetch tasks');
    }

    const data = await response.json();
    if (!data.items) return [];

    return data.items.map((item: any): Task => ({
        id: item.id,
        title: item.title,
        completed: item.status === 'completed',
    }));
};

/**
 * Creates a new task in the user's primary task list.
 * @param {string} accessToken The Google API access token.
 * @param {string} title The title of the new task.
 * @returns {Promise<Task>} A promise that resolves to the newly created task.
 * @throws {Error} If a task list is not found or the API request fails.
 */
export const createTask = async (accessToken: string, title: string): Promise<Task> => {
    const taskListId = await getPrimaryTaskListId(accessToken);
    if (!taskListId) throw new Error('Could not find a task list to add the task to.');

    const response = await fetch(`${TASKS_API_BASE_URL}/lists/${taskListId}/tasks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
    });

    if (!response.ok) {
        console.error('Failed to create task:', await response.json());
        throw new Error('Failed to create task');
    }

    const data = await response.json();
    return {
        id: data.id,
        title: data.title,
        completed: data.status === 'completed',
    };
};

/**
 * Marks a task as complete.
 * @param {string} accessToken The Google API access token.
 * @param {string} taskId The ID of the task to complete.
 * @returns {Promise<Task>} A promise that resolves to the updated task.
 * @throws {Error} If a task list is not found or the API request fails.
 */
export const completeTask = async (accessToken: string, taskId: string): Promise<Task> => {
    const taskListId = await getPrimaryTaskListId(accessToken);
    if (!taskListId) throw new Error('Could not find a task list to update the task in.');
    
    const response = await fetch(`${TASKS_API_BASE_URL}/lists/${taskListId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: taskId,
            status: 'completed',
        }),
    });
    
    if (!response.ok) {
        console.error('Failed to complete task:', await response.json());
        throw new Error('Failed to complete task');
    }

    const data = await response.json();
    return {
        id: data.id,
        title: data.title,
        completed: data.status === 'completed',
    };
};
