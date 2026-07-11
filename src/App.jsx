import { RouterProvider } from "react-router-dom";
import router from "./router";
import WakeUpScreen from "./components/layout/WakeUpScreen";

export default function App() {
    return (
        <WakeUpScreen>
            <RouterProvider router={router} />
        </WakeUpScreen>
    );
}