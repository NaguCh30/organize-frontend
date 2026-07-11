import { useNavigate } from "react-router-dom";
import { Target, CheckCircle2, PlayCircle, Circle, ArrowRight } from "lucide-react";
import "./GoalCard.css";

export default function GoalCard({ goal }) {
    const navigate = useNavigate();

    const getStatusIcon = (status) => {
        switch (status) {
            case "COMPLETED":
                return <CheckCircle2 size={16} className="goal-status-icon completed" />;
            case "IN_PROGRESS":
                return <PlayCircle size={16} className="goal-status-icon progress" />;
            default:
                return <Circle size={16} className="goal-status-icon pending" />;
        }
    };

    return (
        <div
            className={`goal-card-v2 ${goal.status.toLowerCase()}`}
            onClick={() => navigate(`/goals/${goal.id}`)}
        >
            <div className="goal-card-header">
                <div className="goal-card-title-group">
                    <Target size={18} className="goal-icon" />
                    <h3>{goal.title}</h3>
                </div>
                <span className={`status-badge-mini ${goal.status}`}>
                    {getStatusIcon(goal.status)}
                    <span>{goal.status.replace("_", " ")}</span>
                </span>
            </div>
            
            <p className="goal-card-desc">
                {goal.description || "No description available"}
            </p>
            
            <div className="goal-card-footer">
                <span className="view-detail-text">
                    View Details
                    <ArrowRight size={14} className="arrow-icon" />
                </span>
            </div>
        </div>
    );
}