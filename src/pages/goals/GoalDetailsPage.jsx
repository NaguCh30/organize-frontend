import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import goalService from "../../services/goalService";
import taskService from "../../services/taskService";
import Modal from "../../components/common/Modal";
import { 
    ArrowLeft, 
    PlusCircle, 
    Edit3, 
    Trash2, 
    Clock, 
    AlertTriangle, 
    LayoutList,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import "./GoalDetailsPage.css";

export default function GoalDetailsPage() {
    const { goalId } = useParams();
    const navigate = useNavigate();

    const [goal, setGoal] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals visibility States
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);
    const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);

    // Goal Form
    const [goalTitle, setGoalTitle] = useState("");
    const [goalDescription, setGoalDescription] = useState("");

    // Task Form
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskPriority, setTaskPriority] = useState("MEDIUM");
    const [estimatedDuration, setEstimatedDuration] = useState(30);
    const [taskStatus, setTaskStatus] = useState("NOT_STARTED");

    useEffect(() => {
        loadData();
    }, [goalId]);

    async function loadData() {
        try {
            setLoading(true);
            const goalData = await goalService.getGoal(goalId);
            const taskData = await taskService.getTasksByGoal(goalId);
            setGoal(goalData);
            setTasks(taskData);
            setGoalTitle(goalData.title);
            setGoalDescription(goalData.description);
        } catch (error) {
            console.error("Load Data Error:", error);
        } finally {
            setLoading(false);
        }
    }

    async function updateGoal() {
        try {
            await goalService.updateGoal(goalId, {
                title: goalTitle,
                description: goalDescription
            });
            await loadData();
            setShowGoalModal(false);
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteGoal() {
        try {
            await goalService.deleteGoal(goalId);
            navigate("/goals");
        } catch (error) {
            console.error(error);
        }
    }

    async function createTask() {
        try {
            await taskService.createTask(goalId, {
                title: taskTitle,
                description: taskDescription,
                priority: taskPriority,
                estimatedDurationMinutes: Number(estimatedDuration)
            });
            clearTaskForm();
            loadData();
            setShowTaskModal(false);
        } catch (error) {
            console.error(error);
        }
    }

    function openEditTask(task) {
        setSelectedTask(task);
        setTaskTitle(task.title);
        setTaskDescription(task.description);
        setTaskPriority(task.priority);
        setEstimatedDuration(task.estimatedDurationMinutes);
        setTaskStatus(task.status);
        setShowEditTaskModal(true);
    }

    async function updateTask() {
        try {
            await taskService.updateTask(selectedTask.id, {
                title: taskTitle,
                description: taskDescription,
                priority: taskPriority,
                status: taskStatus,
                estimatedDurationMinutes: Number(estimatedDuration)
            });
            clearTaskForm();
            await loadData();
            setShowEditTaskModal(false);
        } catch (error) {
            console.error(error);
        }
    }

    function openDeleteTask(task) {
        setSelectedTask(task);
        setShowDeleteTaskModal(true);
    }

    async function deleteTask() {
        try {
            await taskService.deleteTask(selectedTask.id);
            setSelectedTask(null);
            await loadData();
            setShowDeleteTaskModal(false);
        } catch (error) {
            console.error(error);
        }
    }

    function clearTaskForm() {
        setTaskTitle("");
        setTaskDescription("");
        setTaskPriority("MEDIUM");
        setEstimatedDuration(30);
        setSelectedTask(null);
        setTaskStatus("NOT_STARTED");
    }

    if (loading) {
        return (
            <div className="goal-detail-loading">
                <div className="spinner"></div>
                <p>Loading goal information...</p>
            </div>
        );
    }

    if (!goal) {
        return (
            <div className="goal-detail-loading">
                <AlertCircle size={32} className="error-icon" />
                <p>Goal not found.</p>
                <button className="primary-btn" onClick={() => navigate("/goals")}>
                    Back to Goals
                </button>
            </div>
        );
    }

    return (
        <div className="goal-details fade">
            {/* Back action link */}
            <div className="back-nav">
                <button className="text-btn" onClick={() => navigate("/goals")}>
                    <ArrowLeft size={16} />
                    <span>Back to Goals</span>
                </button>
            </div>

            {/* Goal header banner */}
            <div className="goal-banner card">
                <div className="goal-banner-content">
                    <span className={`status-chip ${goal.status}`}>
                        {goal.status.replaceAll("_", " ")}
                    </span>
                    <h1>{goal.title}</h1>
                    <p>{goal.description || "No description provided."}</p>
                </div>
                <div className="goal-actions">
                    <button
                        className="primary-btn"
                        onClick={() => {
                            clearTaskForm();
                            setShowTaskModal(true);
                        }}
                    >
                        <PlusCircle size={16} />
                        <span>Add Task</span>
                    </button>
                    <button
                        className="secondary-btn"
                        onClick={() => setShowGoalModal(true)}
                    >
                        <Edit3 size={16} />
                        <span>Edit Goal</span>
                    </button>
                    <button
                        className="danger-btn"
                        onClick={() => setShowDeleteGoalModal(true)}
                    >
                        <Trash2 size={16} />
                        <span>Delete Goal</span>
                    </button>
                </div>
            </div>

            {/* Tasks section */}
            <div className="section-header-v2">
                <div className="tasks-title">
                    <LayoutList size={22} className="title-icon" />
                    <h2>Tasks</h2>
                </div>
                <span className="task-count-pill">
                    {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
                </span>
            </div>

            {tasks.length === 0 ? (
                <div className="card empty-tasks-state">
                    <AlertTriangle size={36} className="empty-tasks-icon" />
                    <h3>No Tasks Assigned Yet</h3>
                    <p>Build progress toward this milestone by creating task items below.</p>
                    <button
                        className="primary-btn"
                        onClick={() => {
                            clearTaskForm();
                            setShowTaskModal(true);
                        }}
                    >
                        <PlusCircle size={16} />
                        <span>Add Your First Task</span>
                    </button>
                </div>
            ) : (
                <div className="task-cards-list">
                    {tasks.map(task => (
                        <div key={task.id} className={`task-item-card card ${task.status.toLowerCase()}`}>
                            <div className="task-item-body">
                                <h3>{task.title}</h3>
                                <p>{task.description || "No description provided."}</p>
                                
                                <div className="task-item-meta">
                                    <span className={`priority-chip ${task.priority}`}>
                                        {task.priority} Priority
                                    </span>
                                    <span className={`status-chip ${task.status}`}>
                                        {task.status.replaceAll("_", " ")}
                                    </span>
                                    <span className="duration-chip">
                                        <Clock size={12} className="meta-icon" />
                                        <span>{task.estimatedDurationMinutes} mins</span>
                                    </span>
                                </div>
                            </div>
                            
                            <div className="task-item-actions">
                                <button
                                    className="secondary-btn"
                                    onClick={() => openEditTask(task)}
                                    title="Edit Task"
                                >
                                    <Edit3 size={15} />
                                    <span>Edit</span>
                                </button>
                                <button
                                    className="danger-btn"
                                    onClick={() => openDeleteTask(task)}
                                    title="Delete Task"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals definitions */}
            {showGoalModal && (
                <Modal
                    title="Edit Goal"
                    onClose={() => setShowGoalModal(false)}
                    onConfirm={updateGoal}
                    confirmText="Save Changes"
                >
                    <div className="form-group">
                        <label htmlFor="edit-goal-title">Goal Name</label>
                        <input
                            id="edit-goal-title"
                            type="text"
                            value={goalTitle}
                            onChange={(e) => setGoalTitle(e.target.value)}
                            placeholder="Goal title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-goal-desc">Description</label>
                        <textarea
                            id="edit-goal-desc"
                            rows="5"
                            value={goalDescription}
                            onChange={(e) => setGoalDescription(e.target.value)}
                            placeholder="Goal description"
                        />
                    </div>
                </Modal>
            )}

            {showTaskModal && (
                <Modal
                    title="Create Task"
                    onClose={() => {
                        clearTaskForm();
                        setShowTaskModal(false);
                    }}
                    onConfirm={createTask}
                    confirmText="Create Task"
                >
                    <div className="form-group">
                        <label htmlFor="create-task-title">Task Name</label>
                        <input
                            id="create-task-title"
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="e.g. Draft UI Wireframes"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="create-task-desc">Description</label>
                        <textarea
                            id="create-task-desc"
                            rows="4"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="What needs to be accomplished in this task..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="create-task-priority">Priority</label>
                        <select
                            id="create-task-priority"
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value)}
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="create-task-duration">Estimated Duration (minutes)</label>
                        <input
                            id="create-task-duration"
                            type="number"
                            min="1"
                            value={estimatedDuration}
                            onChange={(e) => setEstimatedDuration(e.target.value)}
                        />
                    </div>
                </Modal>
            )}

            {showEditTaskModal && (
                <Modal
                    title="Edit Task"
                    onClose={() => {
                        clearTaskForm();
                        setShowEditTaskModal(false);
                    }}
                    onConfirm={updateTask}
                    confirmText="Save Changes"
                >
                    <div className="form-group">
                        <label htmlFor="edit-task-title">Task Name</label>
                        <input
                            id="edit-task-title"
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-task-desc">Description</label>
                        <textarea
                            id="edit-task-desc"
                            rows="4"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-task-priority">Priority</label>
                        <select
                            id="edit-task-priority"
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value)}
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-task-status">Status</label>
                        <select
                            id="edit-task-status"
                            value={taskStatus}
                            onChange={(e) => setTaskStatus(e.target.value)}
                        >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-task-duration">Estimated Duration (minutes)</label>
                        <input
                            id="edit-task-duration"
                            type="number"
                            min="1"
                            value={estimatedDuration}
                            onChange={(e) => setEstimatedDuration(e.target.value)}
                        />
                    </div>
                </Modal>
            )}

            {showDeleteGoalModal && (
                <Modal
                    title="Delete Goal"
                    onClose={() => setShowDeleteGoalModal(false)}
                    onConfirm={deleteGoal}
                    confirmText="Yes, Delete Goal"
                    cancelText="Cancel"
                >
                    <div className="warning-content">
                        <AlertCircle size={28} className="warning-icon" />
                        <p>Are you sure you want to delete this goal?</p>
                        <p className="warning-note">All tasks belonging to this goal will be permanently removed.</p>
                    </div>
                </Modal>
            )}

            {showDeleteTaskModal && (
                <Modal
                    title="Delete Task"
                    onClose={() => setShowDeleteTaskModal(false)}
                    onConfirm={deleteTask}
                    confirmText="Yes, Delete Task"
                    cancelText="Cancel"
                >
                    <div className="warning-content">
                        <AlertCircle size={28} className="warning-icon" />
                        <p>Are you sure you want to delete "<strong>{selectedTask?.title}</strong>"?</p>
                    </div>
                </Modal>
            )}
        </div>
    );
}