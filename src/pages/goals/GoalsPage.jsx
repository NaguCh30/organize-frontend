import { useEffect, useState } from "react";
import goalService from "../../services/goalService";
import GoalCard from "../../components/goal/GoalCard";
import "./GoalsPage.css";

export default function GoalsPage() {

    const [goals, setGoals] = useState([]);

    const [showModal, setShowModal] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        loadGoals();
    }, []);

    async function loadGoals() {
        try {
            const data = await goalService.getGoals();
            setGoals(data);
        } catch (e) {
            console.log(e);
        }
    }

    async function createGoal() {

        if (!title.trim()) return;

        try {

            await goalService.createGoal({
                title,
                description
            });

            setTitle("");
            setDescription("");

            setShowModal(false);

            loadGoals();

        } catch (e) {

            console.log(e);

        }

    }

    return (

        <div className="goals-page fade">

            <div className="page-header">

                <h1>Goals</h1>

                <button
                    className="primary-btn"
                    onClick={() => setShowModal(true)}
                >
                    Create Goal
                </button>

            </div>

            <div className="goal-grid">

                {
                    goals.length === 0 ?

                        <div className="card empty-card">

                            <h3>No Goals Yet</h3>

                            <p>Create your first goal to begin.</p>

                        </div>

                        :

                        goals.map(goal => (

                            <GoalCard
                                key={goal.id}
                                goal={goal}
                            />

                        ))
                }

            </div>

            {
                showModal &&

                <div className="modal-overlay">

                    <div className="modal">

                        <h2>Create Goal</h2>

                        <input
                            placeholder="Goal title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            rows="5"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <div className="modal-buttons">

                            <button
                                className="secondary-btn"
                                onClick={() => {

                                    setShowModal(false);

                                    setTitle("");

                                    setDescription("");

                                }}
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-btn"
                                onClick={createGoal}
                            >
                                Create
                            </button>

                        </div>

                    </div>

                </div>

            }

        </div>

    );

}