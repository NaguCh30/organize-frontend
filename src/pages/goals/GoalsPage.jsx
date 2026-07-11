import { useEffect, useState } from "react";
import goalService from "../../services/goalService";
import GoalCard from "../../components/goal/GoalCard";
import { Plus, Target, FolderHeart, AlertCircle } from "lucide-react";
import "./GoalsPage.css";

export default function GoalsPage() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadGoals();
    }, []);

    async function loadGoals() {
        try {
            setLoading(true);
            const data = await goalService.getGoals();
            setGoals(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function createGoal(e) {
        e.preventDefault();
        if (!title.trim()) return;
        setError("");

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
            console.error(e);
            setError(e.message || "Something went wrong. Could not create goal.");
        }
    }

    if (loading) {
        return (
            <div className="goals-loading">
                <div className="spinner"></div>
                <p>Loading your roadmap...</p>
            </div>
        );
    }

    return (
        <div className="goals-page fade">
            <div className="page-header-v2">
                <div>
                    <h1>My Goals</h1>
                    <p>Formulate milestones, group actions, and track overall progress.</p>
                </div>
                <button
                    className="primary-btn"
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={18} />
                    <span>Create Goal</span>
                </button>
            </div>

            {goals.length === 0 ? (
                <div className="card empty-goals-panel">
                    <FolderHeart size={48} className="empty-icon animate-bounce" />
                    <h3>No Goals Set Yet</h3>
                    <p>Begin your productivity path by mapping out your very first goal.</p>
                    <button
                        className="primary-btn"
                        onClick={() => setShowModal(true)}
                    >
                        <Plus size={16} />
                        <span>Add Your First Goal</span>
                    </button>
                </div>
            ) : (
                <div className="goals-grid-v2">
                    {goals.map(goal => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                        />
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay-v2" onClick={() => setShowModal(false)}>
                    <div className="modal-container-v2" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-v2">
                            <h2>Create New Goal</h2>
                            <button
                                className="modal-close-btn"
                                onClick={() => {
                                    setShowModal(false);
                                    setError("");
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={createGoal} className="modal-form-v2">
                            {error && (
                                <div className="modal-form-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label htmlFor="goal-title">Goal Name</label>
                                <input
                                    id="goal-title"
                                    type="text"
                                    placeholder="e.g. Learn React & Redux"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="goal-desc">Description</label>
                                <textarea
                                    id="goal-desc"
                                    rows="4"
                                    placeholder="Outline the details or definition of success for this goal..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions-v2">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() => {
                                        setShowModal(false);
                                        setTitle("");
                                        setDescription("");
                                        setError("");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={!title.trim()}
                                >
                                    Create Goal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}