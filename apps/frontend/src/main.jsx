import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import "./index.css";

function Router() {
	const [route, setRoute] = React.useState(window.location.pathname);
	React.useEffect(() => {
		const handler = () => setRoute(window.location.pathname);
		window.addEventListener("popstate", handler);
		return () => window.removeEventListener("popstate", handler);
	}, []);
	if (route === "/admin") return <AdminLogin />;
	if (route === "/reset-password") return <ResetPassword />;
	if (route === "/dashboard") return <Dashboard />;
	return <App />;
}

createRoot(document.getElementById("root")).render(<Router />);
