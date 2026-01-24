import { useNavigate, useParams } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("adminLoggedIn", "true");
    navigate(`/${restaurantId}/admin/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] text-slate-700 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 p-8 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3rem] text-slate-400">Restaurant</p>
          <h1 className="text-2xl font-semibold text-slate-900">Evergreen Bistro</h1>
        </div>

        <div className="bg-[#f0ede6] text-slate-600 rounded-xl px-4 py-3 border border-slate-100/80">
          <p className="text-xs uppercase tracking-wide text-slate-500">Restaurant ID</p>
          <p className="text-lg font-semibold text-slate-800">{restaurantId}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">User ID</label>
            <input
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2AB0A3]/50 focus:border-[#2AB0A3] transition"
              placeholder="Enter admin user ID"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              required
              type="password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2AB0A3]/50 focus:border-[#2AB0A3] transition"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#2AB0A3] text-white py-3 font-semibold shadow-md shadow-[#2AB0A3]/20 hover:bg-[#249a8e] transition"
          >
            Login as Admin
          </button>
        </form>
      </div>
    </div>
  );
}
