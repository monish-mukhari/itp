import React from "react";
import { Widget, addResponseMessage } from "react-chat-widget";
import "react-chat-widget/lib/styles.css";

interface ChatbotProps {
  apiKey: string ;
}

const Chatbot: React.FC<ChatbotProps> = ({ apiKey }) => {
  const handleNewUserMessage = async (message: string) => {
    try {
      const response = await runGemini(message);
      addResponseMessage(response);
    } catch (error) {
      addResponseMessage("Oops, something went wrong. Please try again.");
      console.error("Error fetching response:", error);
    }
  };

  const runGemini = async (message: string): Promise<string> => {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: message }),
    });

    const data = await response.json();
    return data.reply || "Sorry, I didn't get that.";
  };

  return <Widget  handleNewUserMessage={handleNewUserMessage} title="Gemini Chatbot" />;
};

export default Chatbot;