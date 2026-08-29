import React, { useState } from 'react';
import { ChatFeed, Message } from 'react-chat-ui';
// import 'react-chat-ui/ChatUI.css'; // Import the styles for the chat UI

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: 0, // User ID
            message: input,
        };

        // Update chat with user's message
        setMessages((prev) => [...prev, userMessage]);
        const userText = input;
        setInput('');

        // Call the Gemini API
        try {
            const response = await fetch('https://api.gemini.com/v1/chat/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer YOUR_API_KEY`, // Replace with your API key
                },
                body: JSON.stringify({ message: userText }),
            });

            const data = await response.json();
            const botResponse: Message = {
                id: 1, // Bot ID
                message: data.response, // Adjust according to the response structure
            };

            // Update chat with bot's message
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: 1, // Bot ID
                message: 'Error occurred. Please try again.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    return (
        <div className="flex flex-col h-96 w-96 bg-white shadow-md rounded-lg p-5">
            <h2 className="text-xl font-bold mb-4">Chatbot</h2>
            <div className="flex-grow overflow-y-auto">
                <ChatFeed messages={messages} showSenderName={false} />
            </div>
            <input
                type="text"
                className="border rounded-lg p-2 w-full"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                }}
            />
            <button
                className="bg-blue-500 text-white rounded-lg px-4 py-2 mt-2 w-full"
                onClick={sendMessage}
            >
                Send
            </button>
        </div>
    );
};

export default Chat;
