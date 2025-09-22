import { Email } from '../types';

const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';

/**
 * Fetches the 20 most recent emails from the user's inbox.
 * @param {string} accessToken The Google API access token.
 * @returns {Promise<Email[]>} A promise that resolves to a list of emails.
 * @throws {Error} If the API request fails.
 */
export const listEmails = async (accessToken: string): Promise<Email[]> => {
    // 1. Get list of message IDs
    const listResponse = await fetch(`${GMAIL_API_BASE_URL}/messages?maxResults=20`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!listResponse.ok) throw new Error('Failed to list Gmail messages');
    const { messages } = await listResponse.json();
    if (!messages) return [];

    // 2. Fetch details for each message
    const emailPromises = messages.map(async (message: { id: string }) => {
        const msgResponse = await fetch(`${GMAIL_API_BASE_URL}/messages/${message.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!msgResponse.ok) {
            console.error(`Failed to fetch email ${message.id}`);
            return null;
        }
        const data = await msgResponse.json();
        
        const senderHeader = data.payload.headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
        // Extract name from "Name <email@example.com>" format
        const sender = senderHeader.includes('<') ? senderHeader.split('<')[0].trim() : senderHeader;

        return {
            id: data.id,
            sender: sender,
            subject: data.payload.headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject',
            body: data.snippet,
            read: !data.labelIds.includes('UNREAD'),
        };
    });

    const emails = await Promise.all(emailPromises);
    return emails.filter((e): e is Email => e !== null);
};

/**
 * Marks a specific email as read by removing the 'UNREAD' label.
 * @param {string} accessToken The Google API access token.
 * @param {string} messageId The ID of the email message to mark as read.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 * @throws {Error} If the API request fails.
 */
export const markEmailAsRead = async (accessToken: string, messageId: string): Promise<void> => {
    const response = await fetch(`${GMAIL_API_BASE_URL}/messages/${messageId}/modify`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            removeLabelIds: ['UNREAD'],
        }),
    });

    if (!response.ok) {
        console.error('Failed to mark email as read:', response);
        throw new Error('Failed to mark email as read');
    }
};
