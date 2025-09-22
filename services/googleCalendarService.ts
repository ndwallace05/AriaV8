import { CalendarEvent } from '../types';

const CALENDAR_API_BASE_URL = 'https://www.googleapis.com/calendar/v3';

// Fetches events from now until 1 year from now
export const listCalendarEvents = async (accessToken: string): Promise<CalendarEvent[]> => {
    const timeMin = new Date().toISOString();
    const timeMax = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

    const response = await fetch(`${CALENDAR_API_BASE_URL}/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&showDeleted=false&singleEvents=true&maxResults=250&orderBy=startTime`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        console.error('Failed to fetch calendar events:', response);
        throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    if (!data.items) {
        return [];
    }

    return data.items.map((item: any): CalendarEvent => {
        const dateString = item.start.dateTime || item.start.date;
        // if it's a date-only string (all-day event), append time to avoid timezone issues.
        const eventDate = item.start.date ? new Date(dateString + 'T00:00:00') : new Date(dateString);
        return {
            id: item.id,
            title: item.summary,
            date: eventDate,
        };
    });
};

export const createCalendarEvent = async (accessToken: string, event: { title: string, date: string }): Promise<CalendarEvent> => {
    // The date from Gemini is 'YYYY-MM-DD'. This is suitable for an all-day event.
    const eventResource = {
        'summary': event.title,
        'start': {
            'date': event.date,
        },
        'end': {
            'date': event.date,
        },
    };

    const response = await fetch(`${CALENDAR_API_BASE_URL}/calendars/primary/events`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventResource),
    });

    if (!response.ok) {
        console.error('Failed to create calendar event:', response);
        throw new Error('Failed to create calendar event');
    }

    const data = await response.json();
    const dateString = data.start.date;
    return {
        id: data.id,
        title: data.summary,
        // Append time to avoid timezone issues on parsing
        date: new Date(dateString + 'T00:00:00'),
    };
};
