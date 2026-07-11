import { Outlet, useEffect } from "react";
import Navbar from "./Navbar";

export default function Layout() {

    // Add 'has-sidebar' to body only while on authenticated pages
    // so the sidebar's 260px left offset doesn't bleed onto the login page
    useEffect(() => {
        document.body.classList.add("has-sidebar");
        return () => document.body.classList.remove("has-sidebar");
    }, []);

    return (
        <>
            <Navbar />
            <main className="app-container">
                <Outlet />
            </main>
        </>
    );
}