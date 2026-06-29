import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";

import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/layout.css";
import "./styles/forms.css";
import "./styles/cards.css";
import "./styles/buttons.css";
import "./styles/animations.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);