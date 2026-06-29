import { useEffect, useState } from "react";

import scheduleService from "../../services/scheduleService";

import Modal from "../../components/common/Modal";

import "./SchedulePage.css";

export default function SchedulePage() {

    const today = new Date().toISOString().split("T")[0];

    const [selectedDate, setSelectedDate] = useState(today);

    const [scheduledTasks, setScheduledTasks] = useState([]);
    const [unscheduledTasks, setUnscheduledTasks] = useState([]);

    const [loading, setLoading] = useState(true);

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

        }

        catch (error) {

            console.error(error);

        }

        finally {

            setLoading(false);

        }

    }

    function openScheduleModal(task) {

        setSelectedTask(task);

        setScheduledStart("");

        setScheduledEnd("");

        setShowScheduleModal(true);

    }
        async function scheduleTask() {

        try {

            const result = await scheduleService.scheduleTask(

                selectedTask.id,

                {

                    scheduledStart,

                    scheduledEnd

                }

            );

            if (result.success) {

                setShowScheduleModal(false);

                setSelectedTask(null);

                await loadData();

            }

            else {

                setConflicts(result.conflictingTasks);

                setShowScheduleModal(false);

                setShowConflictModal(true);

            }

        }

        catch (error) {

            console.error(error);

        }

    }

    async function forceSchedule() {

        try {

            await scheduleService.forceScheduleTask(

                selectedTask.id,

                {

                    scheduledStart,

                    scheduledEnd

                }

            );

            setShowConflictModal(false);

            setSelectedTask(null);

            setConflicts([]);

            await loadData();

        }

        catch (error) {

            console.error(error);

        }

    }

    if (loading) {

        return (

            <div className="schedule-loading">

                Loading Schedule...

            </div>

        );

    }

    return (

        <div className="schedule-page fade">

            <div className="schedule-header">

                <div>

                    <h1>Schedule</h1>

                    <p>

                        Organize your day and assign time slots to pending tasks.

                    </p>

                </div>

                <input

                    type="date"

                    value={selectedDate}

                    onChange={(e) => setSelectedDate(e.target.value)}

                    className="date-picker"

                />

            </div>

            <div className="schedule-section">

                <h2>Scheduled Tasks</h2>

                {

                    scheduledTasks.length === 0 ? (

                        <div className="card empty-state">

                            <h3>No Scheduled Tasks</h3>

                            <p>

                                Nothing is planned for this day.

                            </p>

                        </div>

                    ) : (

                        <div className="task-list">

                            {

                                scheduledTasks.map(task => (

                                    <div

                                        key={task.id}

                                        className="task-card card"

                                    >

                                        <div>

                                            <h3>{task.title}</h3>

                                            <p>{task.goalTitle}</p>

                                            <span>

                                                {

                                                    new Date(task.scheduledStart)

                                                        .toLocaleTimeString([], {

                                                            hour: "2-digit",

                                                            minute: "2-digit"

                                                        })

                                                }

                                                {" - "}

                                                {

                                                    new Date(task.scheduledEnd)

                                                        .toLocaleTimeString([], {

                                                            hour: "2-digit",

                                                            minute: "2-digit"

                                                        })

                                                }

                                            </span>

                                        </div>

                                        <span className={`priority-chip ${task.priority}`}>

                                            {task.priority}

                                        </span>

                                    </div>

                                ))

                            }

                        </div>

                    )

                }

            </div>

                        <div className="schedule-section">

                <h2>Unscheduled Tasks</h2>

                {

                    unscheduledTasks.length === 0 ? (

                        <div className="card empty-state">

                            <h3>Everything is Scheduled</h3>

                            <p>
                                Great! There are no unscheduled tasks.
                            </p>

                        </div>

                    ) : (

                        <div className="task-list">

                            {

                                unscheduledTasks.map(task => (

                                    <div
                                        key={task.id}
                                        className="task-card card"
                                    >

                                        <div className="task-info">

                                            <h3>{task.title}</h3>

                                            <p>{task.goalTitle}</p>

                                            <div className="task-meta">

                                                <span className={`priority-chip ${task.priority}`}>
                                                    {task.priority}
                                                </span>

                                                <span className="duration-chip">
                                                    {task.estimatedDurationMinutes} mins
                                                </span>

                                            </div>

                                        </div>

                                        <button
                                            className="primary-btn"
                                            onClick={() => openScheduleModal(task)}
                                        >
                                            Schedule
                                        </button>

                                    </div>

                                ))

                            }

                        </div>

                    )

                }

            </div>

            {

                showScheduleModal &&

                <Modal

                    title={`Schedule "${selectedTask?.title}"`}

                    onClose={() => setShowScheduleModal(false)}

                    onConfirm={scheduleTask}

                    confirmText="Schedule"

                >

                    <div className="form-group">

                        <label>Start</label>

                        <input

                            type="datetime-local"

                            value={scheduledStart}

                            onChange={(e) => setScheduledStart(e.target.value)}

                        />

                    </div>

                    <div className="form-group">

                        <label>End</label>

                        <input

                            type="datetime-local"

                            value={scheduledEnd}

                            onChange={(e) => setScheduledEnd(e.target.value)}

                        />

                    </div>

                </Modal>

            }

            {

                showConflictModal &&

                <Modal

                    title="Schedule Conflict"

                    onClose={() => setShowConflictModal(false)}

                    onConfirm={forceSchedule}

                    confirmText="Force Schedule"

                >

                    <p>

                        The selected time conflicts with the following tasks.

                    </p>

                    <div className="conflict-list">

                        {

                            conflicts.map(task => (

                                <div
                                    key={task.id}
                                    className="conflict-card"
                                >

                                    <strong>

                                        {task.title}

                                    </strong>

                                    <p>

                                        {

                                            new Date(task.scheduledStart)

                                                .toLocaleString()

                                        }

                                    </p>

                                    <p>

                                        {

                                            new Date(task.scheduledEnd)

                                                .toLocaleString()

                                        }

                                    </p>

                                </div>

                            ))

                        }

                    </div>

                </Modal>

            }

        </div>

    );

}