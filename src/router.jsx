import { createBrowserRouter } from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import DashboardPage from "./pages/dashboard/DashboardPage";
import GoalsPage from "./pages/goals/GoalsPage";
import TasksPage from "./pages/tasks/TasksPage";
import SchedulePage from "./pages/schedule/SchedulePage";
import AiPage from "./pages/ai/AIPage";
import GoalDetailsPage from "./pages/goals/GoalDetailsPage";
import AboutPage from "./pages/about/AboutPage";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import Layout from "./components/layout/Layout";

const router = createBrowserRouter([
    {
        path: "/",
        element: <LoginPage />
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "/dashboard",
                element: <DashboardPage />
            },
            {
                path: "/goals",
                element: <GoalsPage />
            },
            {
                path: "/goals/:goalId",
                element: <GoalDetailsPage/>
            },
            {
                path: "/tasks",
                element: <TasksPage />
            },
            {
                path: "/schedule",
                element: <SchedulePage />
            },
            {
                path: "/ai",
                element: <AiPage />
            },
            {
                path: "/about",
                element: <AboutPage />
            }
        ]
    }
]);

export default router;