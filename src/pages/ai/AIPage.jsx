import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import aiService from "../../services/aiService";
import { Sparkles, Send, User, HelpCircle, Lightbulb, Compass, Award, CheckSquare, Clock, Flame, AlertCircle, ArrowDownCircle, Hourglass, CheckCircle2, Rocket, Pin } from "lucide-react";
import "./AIPage.css";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function formatDateTime(isoString) {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;
        
        const partDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(date);
        const partMonth = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date);
        const partYear = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(date);
        const partTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
        
        return `${partDay} ${partMonth} ${partYear} • ${partTime}`;
    } catch(e) {
        return isoString;
    }
}

function formatMessageDates(text) {
    if (!text) return "";
    return text.replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?\b/g, (match) => {
        return formatDateTime(match);
    });
}

function parseMixedResponse(text) {
    if (!text) return [];
    
    // First, format all raw ISO dates in the text
    const formattedText = formatMessageDates(text);
    
    const blocks = [];
    const lines = formattedText.split('\n');
    
    let currentMd = [];
    let i = 0;
    while (i < lines.length) {
        let line = lines[i];
        
        if (line.trim().length > 0 && i + 3 < lines.length) {
            const schedLine = lines[i+1].trim();
            const prioLine = lines[i+2].trim();
            const statLine = lines[i+3].trim();
            
            const isSched = /^[-*+]\s*Scheduled:/i.test(schedLine);
            const isPrio = /^[-*+]\s*Priority:/i.test(prioLine);
            const isStat = /^[-*+]\s*Status:/i.test(statLine);

            if (isSched && isPrio && isStat) {
                if (currentMd.length > 0) {
                    blocks.push({ type: 'markdown', content: currentMd.join('\n') });
                    currentMd = [];
                }
                
                blocks.push({
                    type: 'task',
                    title: line.replace(/^[-*+]\s*/, '').replace(/^\*\*(.*?)\*\*$/, '$1').trim(),
                    scheduled: schedLine.replace(/^[-*+]\s*Scheduled:\s*/i, '').trim(),
                    priority: prioLine.replace(/^[-*+]\s*Priority:\s*/i, '').trim(),
                    status: statLine.replace(/^[-*+]\s*Status:\s*/i, '').trim()
                });
                
                i += 4;
                continue;
            }
        }
        
        currentMd.push(line);
        i++;
    }
    
    if (currentMd.length > 0) {
        blocks.push({ type: 'markdown', content: currentMd.join('\n') });
    }
    
    return blocks;
}

function EnhancedMessageContent({ text }) {
    const blocks = parseMixedResponse(text);

    return (
        <div className="enhanced-msg-content">
            {blocks.map((block, index) => {
                if (block.type === 'markdown') {
                    return (
                        <div key={index} className="md-render-container">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {block.content}
                            </ReactMarkdown>
                        </div>
                    );
                } else if (block.type === 'task') {
                    const prioClass = block.priority.toLowerCase();
                    const statClass = block.status.toLowerCase().replace('_', '-');
                    
                    let PrioIcon = AlertCircle;
                    if (prioClass === 'high') PrioIcon = Flame;
                    else if (prioClass === 'low') PrioIcon = ArrowDownCircle;

                    let StatIcon = Hourglass;
                    if (statClass === 'completed') StatIcon = CheckCircle2;
                    else if (statClass === 'in-progress') StatIcon = Rocket;

                    return (
                        <div key={index} className="ai-task-card animate-fade-in">
                            <div className="ai-card-title">
                                <Pin className="ai-card-icon pin-icon" size={16} />
                                <strong>{block.title}</strong>
                            </div>
                            <div className="ai-card-details">
                                <div className="ai-card-row sched-row">
                                    <Clock className="ai-card-icon" size={14} />
                                    <span>{formatDateTime(block.scheduled)}</span>
                                </div>
                                <div className="ai-card-badges">
                                    <span className={`badge badge-prio badge-${prioClass}`}>
                                        <PrioIcon size={12} className="badge-icon" />
                                        {block.priority.replace('_', ' ')} Priority
                                    </span>
                                    <span className={`badge badge-stat badge-${statClass}`}>
                                        <StatIcon size={12} className="badge-icon" />
                                        {block.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                }
                return null;
            })}
        </div>
    );
}

export default function AIPage() {
    const location = useLocation();
    const [conversationId, setConversationId] = useState(() => {
        const storedId = localStorage.getItem("organize_conversation_id");
        if (storedId) return storedId;
        const newId = crypto.randomUUID();
        localStorage.setItem("organize_conversation_id", newId);
        return newId;
    });

    const [messages, setMessages] = useState([]);
    const [prompt, setPrompt] = useState(location.state?.prompt || "");
    const [loading, setLoading] = useState(false);
    const [conversationStarted, setConversationStarted] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    useEffect(() => {
        let active = true;

        async function loadHistory() {
            if (!conversationId) return;
            setLoading(true);
            try {
                const history = await aiService.getHistory(conversationId);
                if (!active) return;

                const mappedMessages = [];
                for (const msg of history) {
                    if (msg.role === "user") {
                        mappedMessages.push({
                            sender: "user",
                            text: msg.content
                        });
                    } else if (msg.role === "assistant") {
                        try {
                            const parsed = JSON.parse(msg.content);
                            mappedMessages.push({
                                sender: "ai",
                                text: parsed.aiMessage || "Action completed successfully.",
                                action: parsed.action,
                                result: parsed.result
                            });
                        } catch (e) {
                            mappedMessages.push({
                                sender: "ai",
                                text: msg.content
                            });
                        }
                    }
                }

                if (mappedMessages.length > 0) {
                    setMessages(mappedMessages);
                    setConversationStarted(true);
                } else {
                    setMessages([]);
                    setConversationStarted(false);
                }
            } catch (err) {
                console.error("Failed to load conversation history:", err);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadHistory();

        return () => {
            active = false;
        };
    }, [conversationId]);

    async function sendMessage(textToSend) {
        const messageText = textToSend || prompt;
        if (!messageText.trim()) return;

        setConversationStarted(true);
        if (!textToSend) setPrompt("");

        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: messageText
            }
        ]);
        setLoading(true);

        try {
            const response = await aiService.assistant(messageText, conversationId);
            
            if (response.conversationId && response.conversationId !== conversationId) {
                setConversationId(response.conversationId);
                localStorage.setItem("organize_conversation_id", response.conversationId);
            }

            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: response.aiMessage || "Action completed successfully.",
                    action: response.action,
                    result: response.result
                }
            ]);
        } catch (error) {
            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: error.message || "Something went wrong. Could not contact the AI."
                }
            ]);
        } finally {
            setLoading(false);
        }
    }

    const suggestions = [
        {
            icon: <Lightbulb size={16} />,
            text: "List all my current goals and tasks",
            desc: "Review daily status"
        },
        {
            icon: <Compass size={16} />,
            text: "Create a new goal React App with a task Build Mockups",
            desc: "Test auto-scheduling and plan roadmaps"
        },
        {
            icon: <Award size={16} />,
            text: "Show my schedule conflicts or times",
            desc: "Inspect schedule timings"
        }
    ];

    return (
        <div className="ai-page fade">
            {/* Header info */}
            <div className="ai-header-v2">
                <div className="title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles className="ai-indigo-spark" size={24} />
                        <h1>Organize AI</h1>
                    </div>
                    {conversationStarted && (
                        <button
                            className="new-chat-btn"
                            onClick={() => {
                                const newId = crypto.randomUUID();
                                setConversationId(newId);
                                localStorage.setItem("organize_conversation_id", newId);
                                setMessages([]);
                                setConversationStarted(false);
                            }}
                        >
                            New Chat
                        </button>
                    )}
                </div>
                <p>Consult with your intelligent productivity assistant to manage goals and resolve blocks.</p>
            </div>

            {/* Chat Content Body */}
            <div className="ai-chat-body">
                {!conversationStarted ? (
                    <div className="ai-welcome-box">
                        <div className="welcome-glow-icon">
                            <Sparkles size={40} className="glow-icon-indigo" />
                        </div>
                        <h2>What would you like to achieve today?</h2>
                        <p>
                            Ask questions, request roadmaps, draft task structures, or ask for schedule 
                            planning help. Tap any template query below or write your own.
                        </p>

                        <div className="suggestions-grid">
                            {suggestions.map((s, i) => (
                                <div 
                                    key={i} 
                                    className="suggestion-pill"
                                    onClick={() => sendMessage(s.text)}
                                >
                                    <div className="pill-head">
                                        {s.icon}
                                        <span>{s.text}</span>
                                    </div>
                                    <span className="pill-desc">{s.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chat-history-container">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message-row ${msg.sender}`}>
                                <div className="avatar-circle">
                                    {msg.sender === "ai" ? <Sparkles size={16} /> : <User size={16} />}
                                </div>
                                <div className="chat-bubble-container">
                                    <div className="chat-bubble">
                                        {msg.sender === "ai" ? (
                                            <div className="ai-bubble-enhanced">
                                                <EnhancedMessageContent text={msg.text} />
                                            </div>
                                        ) : (
                                            <p>{msg.text}</p>
                                        )}
                                    </div>

                                    {/* Inline action feedback card */}
                                    {msg.sender === "ai" && msg.action === "CREATE_GOAL" && msg.result?.goal && (
                                        <div className="chat-action-card animate-slide-in">
                                            <div className="action-card-header">
                                                <Award size={18} className="success-icon" />
                                                <h4>Goal Created: {msg.result.goal.title}</h4>
                                            </div>
                                            {msg.result.goal.description && <p className="action-card-desc">{msg.result.goal.description}</p>}
                                            {msg.result.tasks && msg.result.tasks.length > 0 && (
                                                <div className="action-card-tasks">
                                                    <h5>Generated tasks (auto-scheduled):</h5>
                                                    <ul>
                                                        {msg.result.tasks.map((t, idx) => (
                                                            <li key={t.id || idx} className="action-task-item">
                                                                <span className="task-bullet"></span>
                                                                <span className="task-title-text">{t.title}</span>
                                                                {t.scheduledStart && (
                                                                    <span className="task-sched-time">
                                                                        📅 {formatDateTime(t.scheduledStart)}
                                                                    </span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.sender === "ai" && msg.action === "CREATE_TASK" && msg.result && (
                                        <div className="chat-action-card animate-slide-in">
                                            <div className="action-card-header">
                                                <CheckSquare size={18} className="success-icon" />
                                                <h4>Task Scheduled!</h4>
                                            </div>
                                            <div className="action-task-detail">
                                                <p className="task-title-main">{msg.result.title}</p>
                                                <div className="meta-info">
                                                    {msg.result.goalTitle && <span className="goal-tag">Goal: {msg.result.goalTitle}</span>}
                                                    {msg.result.priority && <span className={`priority-tag ${msg.result.priority.toLowerCase()}`}>{msg.result.priority}</span>}
                                                </div>
                                                {msg.result.scheduledStart && (
                                                    <p className="scheduled-slot">
                                                        📅 <strong>Time Link:</strong> {formatDateTime(msg.result.scheduledStart)} to {formatDateTime(msg.result.scheduledEnd)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {loading && (
                            <div className="chat-message-row ai">
                                <div className="avatar-circle">
                                    <Sparkles size={16} />
                                </div>
                                <div className="chat-bubble thinking-bubble">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef}></div>
                    </div>
                )}
            </div>

            {/* Chat Input Floating Row */}
            <div className="chat-floating-footer card">
                <textarea
                    rows="1"
                    placeholder="Message Organize AI..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (!loading) sendMessage();
                        }
                    }}
                />
                <button
                    className="avatar-circle send-btn-circle"
                    onClick={() => sendMessage()}
                    disabled={loading || !prompt.trim()}
                    title="Send message"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}