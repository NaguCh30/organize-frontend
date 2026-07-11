import { useState, useEffect } from "react";
import { ServerCog, CheckCircle2, Sparkles, Target, Calendar } from "lucide-react";
import API_BASE_URL from "../../config/api";

const MIN_DISPLAY_MS = 1500; // always show for at least 1.5s

export default function WakeUpScreen({ children }) {
    const [backendAwake, setBackendAwake] = useState(false);
    const [minTimeDone, setMinTimeDone] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [dots, setDots] = useState("");

    // Minimum display timer
    useEffect(() => {
        const t = setTimeout(() => setMinTimeDone(true), MIN_DISPLAY_MS);
        return () => clearTimeout(t);
    }, []);

    // Animate dots
    useEffect(() => {
        const d = setInterval(() => setDots(p => p.length >= 3 ? "" : p + "."), 500);
        return () => clearInterval(d);
    }, []);

    // Ping the backend. 
    // IMPORTANT: Vite proxy returns a 502 (still truthy!) when backend is down.
    // We only consider the server "awake" if status is < 500 (e.g. 400 Bad Request = server is up).
    useEffect(() => {
        let interval;
        const checkHealth = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                // 502/503/504 = proxy error (backend still down), < 500 = backend is alive
                if (response.status < 500) {
                    setBackendAwake(true);
                    clearInterval(interval);
                }
            } catch {
                // Network error - still booting, keep pinging
            }
        };
        interval = setInterval(checkHealth, 3000);
        checkHealth();
        return () => clearInterval(interval);
    }, []);

    // Countdown timer
    useEffect(() => {
        if ((backendAwake && minTimeDone) || timeLeft <= 0) return;
        const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [backendAwake, minTimeDone, timeLeft]);

    // Hide once backend is up AND minimum time is done (or timer expires as fallback)
    if ((backendAwake && minTimeDone) || timeLeft <= 0) return children;

    const progress = Math.round(((60 - timeLeft) / 60) * 100);

    return (
        <div className="wakeup-root">
            <div className="wakeup-blob blob-1" />
            <div className="wakeup-blob blob-2" />
            <div className="wakeup-blob blob-3" />

            <div className="wakeup-card">
                <div className="wakeup-icon-wrap">
                    <div className="wakeup-ring" />
                    <ServerCog size={42} className="wakeup-server-icon" />
                </div>

                <div className="wakeup-brand">
                    <Sparkles size={14} className="wakeup-brand-spark" />
                    <span>Organize AI</span>
                </div>

                <h2 className="wakeup-title">Starting up{dots}</h2>
                <p className="wakeup-subtitle">
                    Backend is waking from sleep — this takes up to 60 seconds on the free tier.
                </p>

                <div className="wakeup-progress-track">
                    <div className="wakeup-progress-fill" style={{ width: `${progress}%` }} />
                </div>

                <div className="wakeup-timer">
                    <span className="wakeup-seconds">{timeLeft}</span>
                    <span className="wakeup-seconds-label">sec</span>
                </div>

                <div className="wakeup-hints">
                    <div className="wakeup-hint-pill"><Target size={12} /> Goal tracking</div>
                    <div className="wakeup-hint-pill"><Calendar size={12} /> Auto-scheduling</div>
                    <div className="wakeup-hint-pill"><CheckCircle2 size={12} /> AI assistant</div>
                </div>
            </div>
        </div>
    );
}
