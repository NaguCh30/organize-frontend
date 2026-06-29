import request from "./api";

const scheduleService = {

    getScheduledTasks: (date) =>
        request(`/schedule/schedule/tasks?date=${date}`),

    getUnscheduledTasks: () =>
        request("/schedule/tasks/unscheduled"),

    scheduleTask: (taskId, data) =>
        request(`/schedule/schedule/tasks/${taskId}`, {
            method: "PUT",
            body: JSON.stringify(data)
        }),

    forceScheduleTask: (taskId, data) =>
        request(`/schedule/schedule/tasks/${taskId}/force`, {
            method: "PUT",
            body: JSON.stringify(data)
        })

};

export default scheduleService;