import { Outlet } from "react-router-dom";

export default function KitchenLayout() {
	return (
		<div className="min-h-screen bg-gray-900 text-white">
			<header className="px-4 py-3 bg-gray-800 shadow">
				<div className="max-w-5xl mx-auto flex justify-between">
					<p className="font-semibold">Kitchen Display</p>
					<p className="text-sm text-gray-300">Incoming tickets</p>
				</div>
			</header>
			<main className="max-w-5xl mx-auto px-4 py-6">
				<Outlet />
			</main>
		</div>
	);
}
