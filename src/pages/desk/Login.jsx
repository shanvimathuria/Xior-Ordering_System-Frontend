export default function DeskLogin() {
	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-md w-80 space-y-4">
				<h1 className="text-xl font-bold text-center">Desk Login</h1>
				<input className="w-full border px-3 py-2 rounded" placeholder="Username" />
				<input
					type="password"
					className="w-full border px-3 py-2 rounded"
					placeholder="Password"
				/>
				<button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
					Sign in
				</button>
			</div>
		</div>
	);
}
