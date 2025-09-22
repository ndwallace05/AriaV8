import { useEffect, useState, useCallback } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, ReceivedChatMessage } from 'livekit-client';
import { ChatMessage, UserProfile } from '../types';

export const useLiveKitAgent = (userProfile: UserProfile | null, accessToken: string | null) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isAgentReplying, setIsAgentReplying] = useState(false);

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

            newRoom.on(RoomEvent.ChatMessage, (msg: ReceivedChatMessage) => {
                setIsAgentReplying(false);
                setMessages(prev => [...prev, { role: 'model', content: msg.message }]);
            });

        } catch (error) {
            console.error("Failed to connect to LiveKit:", error);
        }
    }, [userProfile, accessToken]);

    useEffect(() => {
        connectToLiveKit();
        return () => {
            room?.disconnect();
        };
    }, [connectToLiveKit]);

    const sendChatMessage = useCallback(async (message: string) => {
        if (!room) return;
        setIsAgentReplying(true);
        await room.localParticipant.publishMessage(message);
        setMessages(prev => [...prev, { role: 'user', content: message }]);
    }, [room]);

    return { messages, isConnected, isAgentReplying, sendChatMessage };
};
