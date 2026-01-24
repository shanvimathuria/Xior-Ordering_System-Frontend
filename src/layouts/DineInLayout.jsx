import { Outlet, useParams } from "react-router-dom";

export default function DineInLayout() {
	const { tableNumber } = useParams();

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow px-4 py-3">
				<div className="max-w-4xl mx-auto flex justify-between">
					<p className="font-semibold">Dine-In Menu</p>
					<p className="text-sm text-gray-500">Table {tableNumber}</p>
				</div>
			</header>
			<main className="max-w-4xl mx-auto px-4 py-6">
				<Outlet />
			</main>
		</div>
	);
}
