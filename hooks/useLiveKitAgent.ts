import { useEffect, useState, useCallback } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, ReceivedChatMessage } from 'livekit-client';
import { ChatMessage, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useLiveKitAgent = (userProfile: UserProfile | null, accessToken: string | null) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isAgentReplying, setIsAgentReplying] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isReconnecting, setIsReconnecting] = useState(false);

    const connectToLiveKit = useCallback(async () => {
        if (!userProfile || !accessToken) return;

        try {
            const resp = await fetch('http://localhost:5001/get_livekit_token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userProfile.email,
                    access_token: accessToken,
                }),
            });

            if (!resp.ok) {
                throw new Error(`Failed to get LiveKit token: ${await resp.text()}`);
            }

            const { token } = await resp.json();

            const newRoom = new Room();
            setRoom(newRoom);

            await newRoom.connect(import.meta.env.VITE_LIVEKIT_URL, token);
            setIsConnected(true);

            const handleChatMessage = (msg: ReceivedChatMessage) => {
                setIsAgentReplying(false);
                setMessages(prev => [...prev, { id: uuidv4(), role: 'model', content: msg.message, timestamp: Date.now() }]);
            };

            newRoom.on(RoomEvent.ChatMessage, handleChatMessage);

            // Store the handler to remove it later
            (newRoom as any)._chatMessageHandler = handleChatMessage;

        } catch (error) {
            console.error("Failed to connect to LiveKit:", error);
        }
    }, [userProfile, accessToken]);

    useEffect(() => {
        connectToLiveKit();
        return () => {
            if (room) {
                if ((room as any)._chatMessageHandler) {
                    room.off(RoomEvent.ChatMessage, (room as any)._chatMessageHandler);
                }
                room.disconnect();
            }
        };
    }, [connectToLiveKit]);

    const sendChatMessage = useCallback(async (message: string) => {
        if (!room) return;
        setIsAgentReplying(true);
        try {
            await room.localParticipant.publishMessage(message);
            setMessages(prev => [...prev, { id: uuidv4(), role: 'user', content: message, timestamp: Date.now() }]);
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => [
                ...prev,
                { id: uuidv4(), role: 'system', content: 'Failed to send message. Please try again.', timestamp: Date.now() }
            ]);
        }
    }, [room]);

    useEffect(() => {
        if (!room) return;

        const handleDisconnected = async () => {
            setIsConnected(false);
            setConnectionError('Connection lost. Attempting to reconnect...');
            setIsReconnecting(true);

            let attempts = 0;
            const maxAttempts = 5;
            const reconnect = async () => {
                attempts += 1;
                try {
                    await connectToLiveKit();
                    setIsConnected(true);
                    setConnectionError(null);
                    setIsReconnecting(false);
                } catch (err) {
                    if (attempts < maxAttempts) {
                        setTimeout(reconnect, 2000 * attempts); // Exponential backoff
                    } else {
                        setConnectionError('Unable to reconnect. Please refresh the page.');
                        setIsReconnecting(false);
                    }
                }
            };
            reconnect();
        };

        const handleConnectionError = (error: any) => {
            setConnectionError(`Connection error: ${error?.message || 'Unknown error'}`);
        };

        room.on(RoomEvent.Disconnected, handleDisconnected);
        room.on(RoomEvent.ConnectionError, handleConnectionError);

        return () => {
            room.off(RoomEvent.Disconnected, handleDisconnected);
            room.off(RoomEvent.ConnectionError, handleConnectionError);
        };
    }, [room, connectToLiveKit]);

    return { messages, isConnected, isAgentReplying, sendChatMessage, connectionError, isReconnecting };
};
