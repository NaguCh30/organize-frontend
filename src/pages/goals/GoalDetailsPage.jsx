import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import goalService from "../../services/goalService";
import taskService from "../../services/taskService";

import Modal from "../../components/common/Modal";

import "./GoalDetailsPage.css";

export default function GoalDetailsPage() {

    
    const { goalId } = useParams();
    console.log("goalId:", goalId);
    const navigate = useNavigate();

    const [goal, setGoal] = useState(null);
    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);

    // Goal Modal
    const [showGoalModal, setShowGoalModal] = useState(false);

    // Create Task Modal
    const [showTaskModal, setShowTaskModal] = useState(false);

    // Edit Task Modal
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);

    // Delete Goal Modal
    const [showDeleteGoalModal, setShowDeleteGoalModal] = useState(false);

    // Delete Task Modal
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
            console.log("Goal:", goalData);
            const taskData = await taskService.getTasksByGoal(goalId);
            console.log("Tasks:", taskData);

            setGoal(goalData);
            setTasks(taskData);

            setGoalTitle(goalData.title);
            setGoalDescription(goalData.description);

        } catch (error) {
            console.error("Load Data Error:", error);
            console.error(error);

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
            <div className="goal-loading">
                Loading Goal...
            </div>
        );

    }

    if (!goal) {
        return (
            <div className="goal-loading">
                Goal not found.
            </div>
        );
    }

    return (

    <div className="goal-details fade">

        <div className="goal-banner card">

            <div className="goal-banner-content">

                <h1>{goal.title}</h1>

                <p>{goal.description || "No description provided."}</p>

            </div>

            <div className="goal-banner-right">

                <span className={`status-chip ${goal.status}`}>
                    {goal.status.replaceAll("_", " ")}
                </span>

            </div>

        </div>

        <div className="goal-actions">

            <button
                className="primary-btn"
                onClick={() => {

                    clearTaskForm();
                    setShowTaskModal(true);

                }}
            >
                Add Task
            </button>

            <button
                className="secondary-btn"
                onClick={() => setShowGoalModal(true)}
            >
                Edit Goal
            </button>

            <button
                className="danger-btn"
                onClick={() => setShowDeleteGoalModal(true)}
            >
                Delete Goal
            </button>

        </div>

        <div className="section-header">

            <h2>Tasks</h2>

            <span className="task-count">
                {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
            </span>

        </div>

        {

            tasks.length === 0 ? (

                <div className="card empty-state">

                    <h3>No Tasks Yet</h3>

                    <p>
                        Create your first task to start making progress toward this goal.
                    </p>

                </div>

            ) : (

                <div className="task-list">

                    {

                        tasks.map(task => (

                            <div
                                key={task.id}
                                className="task-card card"
                            >

                                <div className="task-info">

                                    <h3>{task.title}</h3>

                                    <p>
                                        {task.description || "No description provided."}
                                    </p>

                                    <div className="task-meta">

                                        <span className={`priority-chip ${task.priority}`}>
                                            {task.priority}
                                        </span>

                                        <span className={`status-chip ${task.status}`}>
                                            {task.status.replaceAll("_", " ")}
                                        </span>

                                        <span className="duration-chip">
                                            {task.estimatedDurationMinutes} mins
                                        </span>

                                    </div>

                                </div>

                                <div className="task-actions">

                                    <button
                                        className="secondary-btn"
                                        onClick={() => openEditTask(task)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="danger-btn"
                                        onClick={() => openDeleteTask(task)}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        ))

                    }

                </div>

            )

        }

                    {showGoalModal && (
                <Modal
                    title="Edit Goal"
                    onClose={() => setShowGoalModal(false)}
                    onConfirm={updateGoal}
                    confirmText="Save Changes"
                >
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={goalTitle}
                            onChange={(e) => setGoalTitle(e.target.value)}
                            placeholder="Goal title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
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
                        <label>Title</label>
                        <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Task title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            rows="4"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            placeholder="Task description"
                        />
                    </div>

                    <div className="form-group">
                        <label>Priority</label>

                        <select
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value)}
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Estimated Duration (minutes)</label>

                        <input
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
                        <label>Title</label>

                        <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            rows="4"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Priority</label>

                        <select
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value)}
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Status</label>

                        <select
                            value={taskStatus}
                            onChange={(e) => setTaskStatus(e.target.value)}
                        >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Estimated Duration (minutes)</label>

                        <input
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
                    confirmText="Delete Goal"
                    cancelText="Cancel"
                >
                    <p>
                        Are you sure you want to delete this goal?
                    </p>

                    <p className="warning-text">
                        All tasks belonging to this goal will also be removed.
                    </p>
                </Modal>
            )}

            {showDeleteTaskModal && (
                <Modal
                    title="Delete Task"
                    onClose={() => setShowDeleteTaskModal(false)}
                    onConfirm={deleteTask}
                    confirmText="Delete Task"
                    cancelText="Cancel"
                >
                    <p>
                        Are you sure you want to delete
                        <strong> {selectedTask?.title}</strong>?
                    </p>
                </Modal>
            )}

        </div>

    );

}