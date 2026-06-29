import { useNavigate } from "react-router-dom";
import "./GoalCard.css";

export default function GoalCard({ goal }) {

    const navigate = useNavigate();

    return (
        <div
            className="goal-card"
            onClick={() => navigate(`/goals/${goal.id}`)}
        >

            <div className="goal-top">

                <h3>{goal.title}</h3>

                <span className={`status ${goal.status}`}>
                    {goal.status.replace("_", " ")}
                </span>

            </div>

            <p>
                {goal.description || "No description available"}
            </p>

        </div>
    );
}