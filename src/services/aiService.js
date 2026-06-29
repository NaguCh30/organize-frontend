import request from "./api";

const aiService = {

    assistant: (message) =>
        request("/ai/assistant", {

            method: "POST",

            body: JSON.stringify({
                message
            })

        })

};

export default aiService;