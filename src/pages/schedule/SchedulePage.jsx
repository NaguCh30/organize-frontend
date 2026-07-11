import { useEffect, useState } from "react";
import scheduleService from "../../services/scheduleService";
import Modal from "../../components/common/Modal";
import { Calendar, Clock, AlertTriangle, PlayCircle, PlusCircle, AlertCircle, Sparkles } from "lucide-react";
import "./SchedulePage.css";

export default function SchedulePage() {
    const today = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(today);
    
    const [scheduledTasks, setScheduledTasks] = useState([]);
    const [unscheduledTasks, setUnscheduledTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modals visibility states
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showConflictModal, setShowConflictModal] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);
    const [scheduledStart, setScheduledStart] = useState("");
    const [scheduledEnd, setScheduledEnd] = useState("");
    const [conflicts, setConflicts] = useState([]);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    async function loadData() {
        try {
            setLoading(true);
            const scheduled = await scheduleService.getScheduledTasks(selectedDate);
            const unscheduled = await scheduleService.getUnscheduledTasks();
            setScheduledTasks(scheduled);
            setUnscheduledTasks(unscheduled);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    function openScheduleModal(task) {
        setSelectedTask(task);
        // Default start/end input with selected date + business hours
        const defaultStart = `${selectedDate}T09:00`;
        const defaultEnd = `${selectedDate}T10:00`;
        setScheduledStart(defaultStart);
        setScheduledEnd(defaultEnd);
        setShowScheduleModal(true);
    }

    async function scheduleTask() {
        try {
            const result = await scheduleService.scheduleTask(selectedTask.id, {
                scheduledStart,
                scheduledEnd
            });

            if (result.success) {
                setShowScheduleModal(false);
                setSelectedTask(null);
                await loadData();
            } else {
                setConflicts(result.conflictingTasks);
                setShowScheduleModal(false);
                setShowConflictModal(true);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function forceSchedule() {
        try {
            await scheduleService.forceScheduleTask(selectedTask.id, {
                scheduledStart,
                scheduledEnd
            });
            setShowConflictModal(false);
            setSelectedTask(null);
            setConflicts([]);
            await loadData();
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) {
        return (
            <div className="schedule-loading">
                <div className="spinner"></div>
                <p>Loading timeline schedule...</p>
            </div>
        );
    }

    return (
        <div className="schedule-page fade">
            <div className="schedule-header">
                <div className="header-left">
                    <div className="title-row">
                        <Calendar className="title-icon" size={24} />
                        <h1>My Schedule</h1>
                    </div>
                    <p>Organize your day and assign specific time blocks to your goals' tasks.</p>
                </div>
                
                <div className="picker-container">
                    <span className="picker-label">Active Date</span>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)} 
                        className="date-picker-v2"
                    />
                </div>
            </div>

            <div className="schedule-split-layout">
                {/* Scheduled Daily Agenda/Timeline */}
                <div className="schedule-column agenda">
                    <div className="col-header">
                        <h2>Daily Agenda</h2>
                        <span className="count-tag">{scheduledTasks.length} Planned</span>
                    </div>

                    <div className="agenda-timeline">
                        {scheduledTasks.length === 0 ? (
                            <div className="card empty-schedule-state">
                                <Clock size={36} className="empty-sched-icon" />
                                <h3>Agenda is Empty</h3>
                                <p>Nothing scheduled for this day. Select a task on the right to assign a slot!</p>
                            </div>
                        ) : (
                            <div className="timeline-list">
                                {scheduledTasks.map(task => {
                                    const startStr = new Date(task.scheduledStart).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    });
                                    const endStr = new Date(task.scheduledEnd).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    });

                                    return (
                                        <div key={task.id} className="timeline-item card">
                                            <div className="time-indicator">
                                                <span className="time-tag start">{startStr}</span>
                                                <div className="time-connector"></div>
                                                <span className="time-tag end">{endStr}</span>
                                            </div>
                                            
                                            <div className="timeline-item-content">
                                                <div className="item-main">
                                                    <h3>{task.title}</h3>
                                                    <span className="parent-goal-badge">
                                                        Goal: {task.goalTitle}
                                                    </span>
                                                </div>
                                                <span className={`priority-chip ${task.priority}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Unscheduled Backlog pool */}
                <div className="schedule-column backlog">
                    <div className="col-header">
                        <h2>Unscheduled Backlog</h2>
                        <span className="count-tag count-unsched">{unscheduledTasks.length} Pending</span>
                    </div>

                    <div className="backlog-container">
                        {unscheduledTasks.length === 0 ? (
                            <div className="card empty-schedule-state everything-scheduled">
                                <Sparkles size={36} className="empty-sched-icon glow-green" />
                                <h3>Outstanding Work Cleared</h3>
                                <p>Wonderful! All creation tasks have been allocated to the schedule timeline.</p>
                            </div>
                        ) : (
                            <div className="backlog-list">
                                {unscheduledTasks.map(task => (
                                    <div key={task.id} className="backlog-item card">
                                        <div className="backlog-info">
                                            <h3>{task.title}</h3>
                                            <p className="goal-ref">Goal: {task.goalTitle}</p>
                                            
                                            <div className="backlog-meta">
                                                <span className={`priority-chip ${task.priority}`}>
                                                    {task.priority}
                                                </span>
                                                <span className="duration-pill">
                                                    {task.estimatedDurationMinutes} mins
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            className="primary-btn size-sm" 
                                            onClick={() => openScheduleModal(task)}
                                        >
                                            <PlusCircle size={14} />
                                            <span>Schedule</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule time dialog */}
            {showScheduleModal && (
                <Modal
                    title={`Schedule Task`}
                    onClose={() => {
                        setSelectedTask(null);
                        setShowScheduleModal(false);
                    }}
                    onConfirm={scheduleTask}
                    confirmText="Save Time Block"
                >
                    <div className="schedule-dialog-info">
                        <strong>Task:</strong> {selectedTask?.title}
                        <br />
                        <strong>Duration:</strong> {selectedTask?.estimatedDurationMinutes} minutes required
                    </div>

                    <div className="form-group">
                        <label htmlFor="sched-start">Scheduled Start</label>
                        <input
                            id="sched-start"
                            type="datetime-local"
                            value={scheduledStart}
                            onChange={(e) => setScheduledStart(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sched-end">Scheduled End</label>
                        <input
                            id="sched-end"
                            type="datetime-local"
                            value={scheduledEnd}
                            onChange={(e) => setScheduledEnd(e.target.value)}
                            required
                        />
                    </div>
                </Modal>
            )}

            {/* Conflicts Warning Dialog */}
            {showConflictModal && (
                <Modal
                    title="Conflict Alert"
                    onClose={() => {
                        setSelectedTask(null);
                        setConflicts([]);
                        setShowConflictModal(false);
                    }}
                    onConfirm={forceSchedule}
                    confirmText="Override & Force Schedule"
                    cancelText="Change Time"
                >
                    <div className="conflict-alert-body">
                        <div className="conflict-header-row">
                            <AlertTriangle size={32} className="alert-yellow animate-pulse" />
                            <h3>Time Conflict Discovered</h3>
                        </div>
                        <p>The time block you selected overlaps with the following scheduled items:</p>
                        
                        <div className="conflict-timeline-list">
                            {conflicts.map(task => {
                                const startStr = new Date(task.scheduledStart).toLocaleString([], {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                });
                                const endStr = new Date(task.scheduledEnd).toLocaleString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                });

                                return (
                                    <div key={task.id} className="conflict-item-card">
                                        <strong>{task.title}</strong>
                                        <span>{startStr} - {endStr}</span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <p className="override-warning">
                            Forcing this schedule will overlap with these tasks. Choose Override to confirm, or Close to choice adjusting.
                        </p>
                    </div>
                </Modal>
            )}
        </div>
    );
}