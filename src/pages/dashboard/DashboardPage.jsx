import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import goalService from "../../services/goalService";
import taskService from "../../services/taskService";
import useAuth from "../../hooks/useAuth";
import { Target, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Calendar, Clock, ArrowLeft, BookOpen, Tag, CheckSquare, ListTodo } from "lucide-react";
import "./dashboard.css";

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Core data states
    const [goals, setGoals] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [todayTasks, setTodayTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Drill-down states
    const [activeView, setActiveView] = useState("dashboard"); // "dashboard", "goal-details", "task-details"
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [navigationHistory, setNavigationHistory] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const goalsData = await goalService.getGoals();
            setGoals(goalsData || []);
            
            const tasksData = await taskService.getAllTasks();
            const loadedTasks = tasksData || [];
            setAllTasks(loadedTasks);
            
            const todayStr = new Date().toISOString().split("T")[0];
            const todayScheduled = loadedTasks.filter(task => {
                if (!task.scheduledStart) return false;
                return task.scheduledStart.split("T")[0] === todayStr;
            });
            setTodayTasks(todayScheduled);
        } catch (e) {
            console.error("Dashboard error load:", e);
        } finally {
            setLoading(false);
        }
    }

    const completed = goals.filter(g => g.status === "COMPLETED").length;
    const progressPercent = goals.length > 0 ? Math.round((completed / goals.length) * 100) : 0;

    // Filter tasks with no goal (orphan tasks)
    const goalIds = new Set(goals.map(g => g.id));
    const orphanTasks = allTasks.filter(task => !task.goalId || !goalIds.has(task.goalId));

    // Navigation helper: Push onto history stack
    const navigateTo = (view, goal = null, task = null) => {
        setNavigationHistory(prev => [...prev, { view: activeView, goal: selectedGoal, task: selectedTask }]);
        setActiveView(view);
        if (goal) setSelectedGoal(goal);
        if (task) setSelectedTask(task);
    };

    // Navigation helper: Pop from history stack
    const navigateBack = () => {
        if (navigationHistory.length > 0) {
            const last = navigationHistory[navigationHistory.length - 1];
            setActiveView(last.view);
            setSelectedGoal(last.goal);
            setSelectedTask(last.task);
            setNavigationHistory(prev => prev.slice(0, -1));
        } else {
            setActiveView("dashboard");
            setSelectedGoal(null);
            setSelectedTask(null);
        }
    };

    const toggleTaskCompletion = async (task) => {
        try {
            const newStatus = task.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";
            await taskService.updateTask(task.id, { ...task, status: newStatus });
            
            // Update local states
            setAllTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            setTodayTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
            if (activeView === "task-details" && selectedTask?.id === task.id) {
                setSelectedTask(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    // View 1: Task Details page
    if (activeView === "task-details" && selectedTask) {
        const startTime = selectedTask.scheduledStart ? selectedTask.scheduledStart.replace("T", " ").substring(0, 16) : null;
        const endTime = selectedTask.scheduledEnd ? selectedTask.scheduledEnd.replace("T", " ").substring(0, 16) : null;

        return (
            <div className="dashboard fade">
                <div className="detail-header">
                    <button className="back-btn" onClick={navigateBack}>
                        <ArrowLeft size={16} />
                        <span>Return</span>
                    </button>
                    <h1>Task Details</h1>
                </div>

                <div className="card detail-content-card">
                    <div className="detail-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2>{selectedTask.title}</h2>
                            <span className="goal-ref-tag">
                                <Tag size={14} />
                                <span>Goal: {selectedTask.goalTitle || "No Goal"}</span>
                            </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button 
                                className="primary-btn outline"
                                onClick={() => toggleTaskCompletion(selectedTask)}
                            >
                                <CheckCircle2 size={16} />
                                {selectedTask.status === "COMPLETED" ? "Reopen Task" : "Complete Task"}
                            </button>
                            <button 
                                className="primary-btn" 
                                onClick={() => navigate("/ai", { state: { prompt: `Help me modify my task: ${selectedTask.title}\n\nCurrent Description: ${selectedTask.description || 'None'}\n\n[Make your request here]` } })}
                            >
                                <Sparkles size={16} />
                                Modify with AI
                            </button>
                        </div>
                    </div>

                    <div className="details-metadata-grid">
                        <div className="meta-item">
                            <span className="meta-label">Status</span>
                            <span className={`status-chip ${selectedTask.status}`}>
                                {selectedTask.status?.replace("_", " ")}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Priority</span>
                            <span className={`priority-badge ${selectedTask.priority?.toLowerCase()}`}>
                                {selectedTask.priority}
                            </span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Duration</span>
                            <span className="meta-val-badge">
                                <Clock size={14} />
                                <span>{selectedTask.estimatedDurationMinutes || "None"} mins</span>
                            </span>
                        </div>
                    </div>

                    <div className="detail-description-section">
                        <h3>Description</h3>
                        <p className="desc-body">
                            {selectedTask.description || "No description provided."}
                        </p>
                    </div>

                    <div className="detail-schedule-section">
                        <h3>Schedule Status</h3>
                        {startTime ? (
                            <div className="schedule-meta-box">
                                <Calendar size={16} className="schedule-box-icon" />
                                <div>
                                    <p><strong>Starts:</strong> {startTime}</p>
                                    <p><strong>Ends:</strong> {endTime}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="schedule-empty-box">
                                <AlertCircle size={16} />
                                <p>This task is currently unscheduled. You can use Organize AI to schedule it dynamically!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // View 2: Goal Details page
    if (activeView === "goal-details" && selectedGoal) {
        const goalTasks = allTasks.filter(t => t.goalId === selectedGoal.id);
        const goalCompletedTasks = goalTasks.filter(t => t.status === "COMPLETED").length;
        const goalProgress = goalTasks.length > 0 ? Math.round((goalCompletedTasks / goalTasks.length) * 100) : 0;

        return (
            <div className="dashboard fade">
                <div className="detail-header">
                    <button className="back-btn" onClick={navigateBack}>
                        <ArrowLeft size={16} />
                        <span>Return to Dashboard</span>
                    </button>
                    <h1>Goal Details</h1>
                </div>

                <div className="goal-detail-layout">
                    {/* Left Column: Goal parameters */}
                    <div className="card goal-detail-main-card">
                        <div className="target-icon-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Target size={28} className="goal-svg" />
                                <span className={`status-chip ${selectedGoal.status}`}>
                                    {selectedGoal.status?.replace("_", " ")}
                                </span>
                            </div>
                            <button 
                                className="primary-btn" 
                                onClick={() => navigate("/ai", { state: { prompt: `Help me modify my goal: ${selectedGoal.title}\n\nCurrent Description: ${selectedGoal.description || 'None'}\n\n[Make your request here]` } })}
                            >
                                <Sparkles size={16} />
                                Modify with AI
                            </button>
                        </div>
                        <h2>{selectedGoal.title}</h2>
                        <p className="desc-body">{selectedGoal.description || "No goal description provided."}</p>
                        
                        <div className="divider"></div>

                        <h3>Goal Completion Rate</h3>
                        <div className="goal-progress-section">
                            <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${goalProgress}%` }}></div>
                            </div>
                            <span className="progress-value">{goalProgress}% ({goalCompletedTasks} of {goalTasks.length} tasks completed)</span>
                        </div>
                    </div>

                    {/* Right Column: Goal tasks */}
                    <div className="card goal-detail-tasks-card">
                        <div className="tasks-card-header">
                            <ListTodo size={18} />
                            <h2>Tasks under this Goal</h2>
                        </div>

                        <div className="detail-tasks-list">
                            {goalTasks.length === 0 ? (
                                <div className="detail-empty-tasks">
                                    <CheckSquare size={24} />
                                    <p>No tasks configured in this goal yet. Prompt Organize AI to schedule sub-tasks!</p>
                                </div>
                            ) : (
                                goalTasks.map(task => (
                                    <div 
                                        className="detail-task-item" 
                                        key={task.id}
                                        onClick={() => navigateTo("task-details", selectedGoal, task)}
                                    >
                                        <div className="task-meta-left">
                                            <h4>{task.title}</h4>
                                            <span className={`status-chip-sub ${task.status?.toLowerCase()}`}>
                                                {task.status?.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="task-meta-right">
                                            <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                            <ArrowRight size={16} className="drill-icon" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // View 3: Dashboard Central page
    return (
        <div className="dashboard fade">
            {/* Welcome banner card */}
            <div className="welcome-banner">
                <div className="welcome-text">
                    <h1>Welcome back, {user.username}!</h1>
                    <p>Track your goals, structure your schedule, and check-in with your AI assistant.</p>
                </div>
                <div className="welcome-action">
                    <button className="primary-btn" onClick={() => navigate("/ai")}>
                        <Sparkles size={18} />
                        <span>Consult Organize AI</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="dashboard-grid">
                <div className="card stat-card total">
                    <div className="stat-icon-wrapper">
                        <Target size={24} className="stat-icon" />
                    </div>
                    <div className="stat-info">
                        <h2>Total Goals</h2>
                        <h1>{goals.length}</h1>
                    </div>
                </div>

                <div className="card stat-card completed">
                    <div className="stat-icon-wrapper">
                        <CheckCircle2 size={24} className="stat-icon" />
                    </div>
                    <div className="stat-info">
                        <h2>Completed Goals</h2>
                        <h1>{completed}</h1>
                    </div>
                </div>

                <div className="card stat-card pending">
                    <div className="stat-icon-wrapper">
                        <AlertCircle size={24} className="stat-icon" />
                    </div>
                    <div className="stat-info">
                        <h2>Today's Tasks</h2>
                        <h1>{todayTasks.length}</h1>
                    </div>
                </div>
            </div>

            <div className="dashboard-cols">
                {/* Left side: Progress overview */}
                <div className="card progress-card">
                    <div className="trend-header">
                        <h2>Overall Progress</h2>
                        <span className="trend-badge">{progressPercent}%</span>
                    </div>
                    <p>Keep going! You've accomplished {completed} out of {goals.length} goals.</p>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <div className="dashboard-shortcuts">
                        <h3>Quick Navigation</h3>
                        <div className="shortcut-buttons">
                            <button className="primary-btn" onClick={() => navigate("/ai")}>
                                <Sparkles size={16} />
                                Ask AI Assistant
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right side: Today's Schedule Overview */}
                <div className="card today-schedule-card">
                    <div className="card-header">
                        <div className="card-header-title">
                            <Calendar size={18} className="header-icon" />
                            <h2>Today's Schedule</h2>
                        </div>
                    </div>

                    <div className="task-list">
                        {todayTasks.length === 0 ? (
                            <div className="empty-state-v2">
                                <Clock size={28} className="empty-icon" />
                                <p>No tasks scheduled for today. Ask Organize AI to organize your day!</p>
                            </div>
                        ) : (
                            todayTasks.map(task => {
                                const startTime = task.scheduledStart ? task.scheduledStart.split("T")[1]?.substring(0, 5) : "";
                                const endTime = task.scheduledEnd ? task.scheduledEnd.split("T")[1]?.substring(0, 5) : "";
                                return (
                                    <div 
                                        className="task-item-dash clickable" 
                                        key={task.id}
                                        onClick={() => navigateTo("task-details", null, task)}
                                    >
                                        <div className="task-time-col">
                                            <span className="time-val">{startTime || "--:--"}</span>
                                            <span className="time-dash">-</span>
                                            <span className="time-val">{endTime || "--:--"}</span>
                                        </div>
                                        <div className="task-detail-col">
                                            <h4>{task.title}</h4>
                                            <span className="goal-badge">{task.goalTitle}</span>
                                        </div>
                                        <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row grid: Goals List & Orphan Tasks List */}
            <div className="dashboard-bottom-grid">
                {/* Active Goals Panel */}
                <div className="card recent-goals-card">
                    <div className="card-header">
                        <h2>All Goals</h2>
                    </div>

                    <div className="goal-list">
                        {goals.length === 0 ? (
                            <div className="empty-goals-state">
                                <p>No goals created yet. Let's start organizing your roadmap!</p>
                            </div>
                        ) : (
                            goals.map(goal => (
                                <div
                                    className="goal-item"
                                    key={goal.id}
                                    title="View Goal Details"
                                    onClick={() => navigateTo("goal-details", goal)}
                                >
                                    <div className="goal-item-left">
                                        <h3>{goal.title}</h3>
                                        <p>{goal.description || "No description provided."}</p>
                                    </div>
                                    <div className="goal-item-right">
                                        <span className={`status-chip ${goal.status}`}>
                                            {goal.status.replace("_", " ")}
                                        </span>
                                        <ArrowRight size={16} className="drill-icon" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Orphan Tasks Panel */}
                <div className="card orphan-tasks-card">
                    <div className="card-header">
                        <h2>Tasks with no Goals</h2>
                    </div>

                    <div className="goal-list">
                        {orphanTasks.length === 0 ? (
                            <div className="empty-goals-state">
                                <p>No orphan tasks found. All tasks are linked to goals!</p>
                            </div>
                        ) : (
                            orphanTasks.map(task => (
                                <div
                                    className="goal-item"
                                    key={task.id}
                                    title="View Task Details"
                                    onClick={() => navigateTo("task-details", null, task)}
                                >
                                    <div className="goal-item-left">
                                        <h3>{task.title}</h3>
                                        <p>{task.description || "No description provided."}</p>
                                    </div>
                                    <div className="goal-item-right">
                                        <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                                            {task.priority}
                                        </span>
                                        <ArrowRight size={16} className="drill-icon" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}