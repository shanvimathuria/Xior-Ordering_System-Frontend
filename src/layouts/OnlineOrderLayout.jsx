import { Outlet } from "react-router-dom";

export default function OnlineOrderLayout() {
	return (
		<div className="min-h-screen bg-white">
			<main className="max-w-5xl mx-auto px-4 py-6">
				<Outlet />
			</main>
		</div>
	);
}
