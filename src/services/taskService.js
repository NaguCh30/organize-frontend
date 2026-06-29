import request from "./api";

const taskService={

    getTasks:(goalId)=>
        request(`/goals/${goalId}/tasks`),

    getTask:(taskId)=>
        request(`/tasks/${taskId}`),

    getTasksByGoal: (goalId) =>
        request(`/goals/${goalId}/tasks`),

    createTask:(goalId,task)=>
        request(`/goals/${goalId}/tasks`,{
            method:"POST",
            body:JSON.stringify(task)
        }),

    updateTask:(taskId,task)=>
        request(`/tasks/${taskId}`,{
            method:"PUT",
            body:JSON.stringify(task)
        }),

    deleteTask:(taskId)=>
        request(`/tasks/${taskId}`,{
            method:"DELETE"
        })

};

export default taskService;