import { Outlet } from "react-router-dom";

export default function DeskLayout() {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow px-4 py-3">
				<div className="max-w-5xl mx-auto flex justify-between">
					<p className="font-semibold">Front Desk</p>
					<p className="text-sm text-gray-500">Order handling</p>
				</div>
			</header>
			<main className="max-w-5xl mx-auto px-4 py-6">
				<Outlet />
			</main>
		</div>
	);
}
