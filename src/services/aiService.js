import request from "./api";

const aiService = {

    assistant: (message, conversationId) =>
        request("/ai/assistant", {

            method: "POST",

            body: JSON.stringify({
                message,
                conversationId
            })

        }),

    getHistory: (conversationId) =>
        request(`/ai/history/${conversationId}`, {
            method: "GET"
        })

};

export default aiService;