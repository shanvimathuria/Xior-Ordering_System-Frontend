const sampleItems = [
	{ name: "Margherita Pizza", price: "₹299" },
	{ name: "Paneer Tikka", price: "₹249" },
	{ name: "Veg Burger", price: "₹199" },
];

export default function Menu() {
	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-bold">Menu</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{sampleItems.map((item) => (
					<div
						key={item.name}
						className="bg-white border rounded-lg p-4 shadow-sm flex justify-between"
					>
						<div>
							<p className="font-semibold">{item.name}</p>
							<p className="text-sm text-gray-600">Delicious and fresh.</p>
						</div>
						<span className="font-semibold">{item.price}</span>
					</div>
				))}
			</div>
		</div>
	);
}
