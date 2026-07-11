import { useEffect, useState } from "react";
import goalService from "../../services/goalService";
import taskService from "../../services/taskService";
import { Search, Filter, CheckCircle, Circle, Play, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./TasksPage.css";

export default function TasksPage() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    useEffect(() => {
        loadAllTasks();
    }, []);

    async function loadAllTasks() {
        try {
            setLoading(true);
            const goals = await goalService.getGoals();
            
            // Fetch tasks for each goal in parallel
            const tasksPromises = goals.map(async (goal) => {
                const goalTasks = await taskService.getTasksByGoal(goal.id);
                // Attach goal details (title, id) to each task
                return goalTasks.map(task => ({
                    ...task,
                    goalId: goal.id,
                    goalTitle: goal.title
                }));
            });

            const results = await Promise.all(tasksPromises);
            const mergedTasks = results.flat();
            
            // Sort tasks by priority (HIGH -> MEDIUM -> LOW) and status (IN_PROGRESS -> NOT_STARTED -> COMPLETED)
            const sorted = mergedTasks.sort((a, b) => {
                const statusOrder = { "IN_PROGRESS": 0, "NOT_STARTED": 1, "COMPLETED": 2 };
                const priorityOrder = { "HIGH": 0, "MEDIUM": 1, "LOW": 2 };
                
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

            setTasks(sorted);
        } catch (error) {
            console.error("Failed to load tasks:", error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleTaskStatus(task) {
        let newStatus = "COMPLETED";
        if (task.status === "COMPLETED") {
            newStatus = "NOT_STARTED";
        } else if (task.status === "NOT_STARTED") {
            newStatus = "IN_PROGRESS";
        } else if (task.status === "IN_PROGRESS") {
            newStatus = "COMPLETED";
        }

        try {
            // Optimistic update
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            
            await taskService.updateTask(task.id, {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: newStatus,
                estimatedDurationMinutes: task.estimatedDurationMinutes
            });
        } catch (error) {
            console.error("Failed to update status:", error);
            // Revert on error
            loadAllTasks();
        }
    }

    // Filter logic
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              task.goalTitle.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const pendingCount = tasks.filter(t => t.status !== "COMPLETED").length;
    const completedCount = tasks.filter(t => t.status === "COMPLETED").length;

    if (loading) {
        return (
            <div className="tasks-loading">
                <div className="spinner"></div>
                <p>Loading your tasks...</p>
            </div>
        );
    }

    return (
        <div className="tasks-page fade">
            <div className="tasks-header">
                <div>
                    <h1>My Tasks</h1>
                    <p>Manage and track actionable items across all your goals.</p>
                </div>
                <div className="tasks-summary-chips">
                    <span className="summary-chip pending">
                        <Clock size={14} />
                        <strong>{pendingCount} Pending</strong>
                    </span>
                    <span className="summary-chip completed">
                        <CheckCircle size={14} />
                        <strong>{completedCount} Done</strong>
                    </span>
                </div>
            </div>

            {/* Filter controls */}
            <div className="card filters-card">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks or goals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filters-selectors">
                    <div className="filter-group">
                        <Filter size={14} className="filter-icon" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="ALL">All Statuses</option>
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <Filter size={14} className="filter-icon" />
                        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                            <option value="ALL">All Priorities</option>
                            <option value="HIGH">High Priority</option>
                            <option value="MEDIUM">Medium Priority</option>
                            <option value="LOW">Low Priority</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Task list board */}
            <div className="tasks-list">
                {filteredTasks.length === 0 ? (
                    <div className="card empty-tasks">
                        <h3>No Tasks Found</h3>
                        <p>Adjust your search/filters or create new tasks on your active goals.</p>
                        <button className="primary-btn" onClick={() => navigate("/goals")}>
                            Go to Goals
                        </button>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <div key={task.id} className={`task-row card ${task.status === "COMPLETED" ? "completed" : ""}`}>
                            <div className="task-row-checkbox" onClick={() => toggleTaskStatus(task)} title="Toggle completion status">
                                {task.status === "COMPLETED" ? (
                                    <CheckCircle className="checkbox-icon checked" size={22} />
                                ) : task.status === "IN_PROGRESS" ? (
                                    <Play className="checkbox-icon progress" size={22} />
                                ) : (
                                    <Circle className="checkbox-icon" size={22} />
                                )}
                            </div>
                            
                            <div className="task-row-content">
                                <div className="task-row-title-row">
                                    <h3>{task.title}</h3>
                                    <span className={`priority-chip ${task.priority}`}>{task.priority}</span>
                                </div>
                                <p className="task-row-desc">{task.description || "No description provided."}</p>
                                
                                <div className="task-row-meta">
                                    <span className="meta-goal" onClick={() => navigate(`/goals/${task.goalId}`)} title="View Goal details">
                                        <ExternalLink size={12} />
                                        <span>Goal: {task.goalTitle}</span>
                                    </span>
                                    {task.estimatedDurationMinutes && (
                                        <span className="duration-chip">
                                            {task.estimatedDurationMinutes} mins
                                        </span>
                                    )}
                                    {task.status !== "NOT_STARTED" && (
                                        <span className={`status-chip-text ${task.status}`}>
                                            {task.status.replace("_", " ")}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}