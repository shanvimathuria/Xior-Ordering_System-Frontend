import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function RestaurantLandingLayout() {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<Navbar />
			<main className="max-w-6xl mx-auto px-4 py-8">
				<Outlet />
			</main>
		</div>
	);
}
