import { CheckSquare, Target, ClipboardList, Calendar, Sparkles } from "lucide-react";
import "./AboutPage.css";

export default function AboutPage() {
    const steps = [
        {
            icon: <Target size={24} />,
            title: "1. Define Goals",
            desc: "Start by defining your project goals. Organize helps you manage the big picture milestones you want to hit."
        },
        {
            icon: <Sparkles className="ai-indigo-spark" size={24} />,
            title: "2. Generate AI Tasks",
            desc: "Don't know where to start? Just press the 'Modify with AI' button and ask Organize AI to instantly break your goal down into actionable, prioritized task checklists."
        },
        {
            icon: <Calendar size={24} />,
            title: "3. Auto-Schedule",
            desc: "Organize AI can automatically analyze your open tasks, look at your existing calendar dependencies, and schedule specific time blocks for each task without overlap."
        },
        {
            icon: <CheckSquare size={24} />,
            title: "4. Execute & Conquer",
            desc: "Use the seamless Dashboard quick-actions to check off completed tasks. Watch your progress bar fill up until your goals are fully conquered!"
        }
    ];

    return (
        <div className="about-page fade">
            <div className="about-hero card">
                <div className="hero-content">
                    <div className="hero-logo">
                        <CheckSquare size={38} className="logo-spark" />
                        <h1>About Organize</h1>
                    </div>
                    <p className="hero-sub">
                        A modern, glassmorphic scheduling platform designed to streamline your roadmap 
                        from broad ideas into hourly actions.
                    </p>
                </div>
            </div>

            <h2 className="guide-title">Quick-Start Guide</h2>
            
            <div className="guide-steps-grid">
                {steps.map((step, idx) => (
                    <div key={idx} className="card step-card">
                        <div className="step-icon-circle">
                            {step.icon}
                        </div>
                        <h3>{step.title}</h3>
                        <p>{step.desc}</p>
                    </div>
                ))}
            </div>

            <div className="about-features-card card">
                <h2>Productivity Philosophy</h2>
                <p>
                    Organize is an AI-first productivity platform built on the philosophy of <strong>Intentional Planning without the Friction</strong>. 
                    By utilizing our state-of-the-art AI Assistant, you are no longer burdened by the cognitive fatigue of breaking down broad, 
                    overwhelming achievements into bite-sized actionable checklists, or figuring out when to do them. Organize handles the planning and the scheduling, 
                    leaving you to do what you do best: executing the plan and getting things done.
                </p>
            </div>
        </div>
    );
}
