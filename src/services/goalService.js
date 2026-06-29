import request from "./api";

const goalService = {

    getGoals: () =>
        request("/goals"),

    getGoal: (goalId) =>
        request(`/goals/${goalId}`),

    createGoal: (goal) =>
        request("/goals",{
            method:"POST",
            body:JSON.stringify(goal)
        }),

    updateGoal:(goalId,goal)=>
        request(`/goals/${goalId}`,{
            method:"PUT",
            body:JSON.stringify(goal)
        }),

    deleteGoal:(goalId)=>
        request(`/goals/${goalId}`,{
            method:"DELETE"
        })

};

export default goalService;