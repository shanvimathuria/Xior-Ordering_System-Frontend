export default function Landing() {
	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm uppercase tracking-wide text-blue-600">Welcome</p>
				<h1 className="text-3xl font-bold mt-2">Discover great food</h1>
				<p className="text-gray-600 mt-2">
					Order dine-in, takeout, or delivery from this restaurant demo.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{["Fast service", "Fresh ingredients", "Easy checkout"].map((item) => (
					<div
						key={item}
						className="bg-white rounded-lg shadow-sm border p-4 text-center"
					>
						<p className="font-semibold">{item}</p>
					</div>
				))}
			</div>
		</div>
	);
}
