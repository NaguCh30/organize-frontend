import { useEffect, useRef, useState } from "react";

import aiService from "../../services/aiService";

import "./AIPage.css";

export default function AIPage() {

    const [messages, setMessages] = useState([]);

    const [prompt, setPrompt] = useState("");

    const [loading, setLoading] = useState(false);

    const [conversationStarted, setConversationStarted] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages, loading]);

    async function sendMessage() {

        if (!prompt.trim()) return;

        const userPrompt = prompt;

        setConversationStarted(true);

        setPrompt("");

        setMessages(prev => [

            ...prev,

            {

                sender: "user",

                text: userPrompt

            }

        ]);

        setLoading(true);

        try {

            const response = await aiService.assistant(userPrompt);

            setMessages(prev => [

                ...prev,

                {

                    sender: "ai",

                    text: response.aiMessage

                }

            ]);

        }

        catch (error) {

            setMessages(prev => [

                ...prev,

                {

                    sender: "ai",

                    text: error.message || "Something went wrong."

                }

            ]);

        }

        finally {

            setLoading(false);

        }

    }

    function useExample(text) {

        setPrompt(text);

    }

    return (
                <div className="ai-page">

            <div className="ai-header">

                <h1>Organize AI</h1>

                <p>

                    Your intelligent productivity assistant.

                </p>

            </div>

            {

                !conversationStarted ?

                (

                    <div className="ai-welcome">

                        <div className="welcome-content">

                            <h2>Welcome to Organize AI</h2>

                            <p>

                                Describe your goals, tasks, or productivity challenges
                                in natural language.

                                Organize AI will understand your request and help you
                                organize your work into actionable steps.

                            </p>

                            <div className="welcome-info">

                                <p>• Break down goals into tasks</p>

                                <p>• Improve existing tasks</p>

                                <p>• Help prioritize your work</p>

                                <p>• Plan your schedule more effectively</p>

                            </div>

                        </div>

                    </div>

                )

                :

                (

                    <div className="chat-container">

                        {

                            messages.map((message, index) => (

                                <div

                                    key={index}

                                    className={`message ${message.sender}`}

                                >

                                    <div className="message-bubble">

                                        {message.text}

                                    </div>

                                </div>

                            ))

                        }

                        {

                            loading &&

                            <div className="message ai">

                                <div className="message-bubble thinking">

                                    <span></span>

                                    <span></span>

                                    <span></span>

                                </div>

                            </div>

                        }

                        <div ref={messagesEndRef}></div>

                    </div>

                )

            }

                        <div className="chat-input">

                <textarea

                    rows="1"

                    placeholder="Describe a goal, task or productivity problem..."

                    value={prompt}

                    onChange={(e) => setPrompt(e.target.value)}

                    onKeyDown={(e) => {

                        if (

                            e.key === "Enter"

                            &&

                            !e.shiftKey

                        ) {

                            e.preventDefault();

                            if (!loading) {

                                sendMessage();

                            }

                        }

                    }}

                />

                <button

                    className="send-btn"

                    onClick={sendMessage}

                    disabled={loading}

                >

                    Send

                </button>

            </div>

        </div>

    );

}