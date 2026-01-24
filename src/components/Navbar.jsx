import { NavLink, useParams } from "react-router-dom";

export default function Navbar() {
	const { restaurantId = "demo" } = useParams();

	const linkClass = ({ isActive }) =>
		`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
			isActive ? "text-blue-700" : "text-gray-700 hover:text-blue-600"
		}`;

	return (
		<header className="bg-white shadow-sm">
			<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
				<NavLink to={`/${restaurantId}`} className="text-lg font-semibold">
					Restaurant
				</NavLink>

				<nav className="flex items-center space-x-2">
					<NavLink to={`/${restaurantId}/menu`} className={linkClass}>
						Menu
					</NavLink>
					<NavLink to={`/${restaurantId}/takeout`} className={linkClass}>
						Takeout
					</NavLink>
					<NavLink to={`/${restaurantId}/delivery`} className={linkClass}>
						Delivery
					</NavLink>
					<NavLink to={`/${restaurantId}/cart`} className={linkClass}>
						Cart
					</NavLink>
				</nav>
			</div>
		</header>
	);
}
