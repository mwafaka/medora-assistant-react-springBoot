import { useNavigate } from "react-router-dom";

export default function RoleSelectorApp() {
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    if (selectedRole === "senior") {
      navigate("/senior");
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-sm space-y-10">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
            Welcome
          </h1>
          <p className="text-gray-500 text-base">
            Select your role to continue
          </p>
        </div>

        <div className="rounded-[32px] bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] p-6 space-y-4">

          <button
            onClick={() => handleRoleSelect("senior")}
            className="group w-full flex items-center justify-between p-5 rounded-2xl
                       bg-gradient-to-br from-blue-500 to-blue-600 text-white
                       shadow-lg active:scale-[0.97] transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">👴</div>
              <span className="text-lg font-medium">Senior</span>
            </div>
            <span className="text-white/70 group-hover:translate-x-1 transition">
              →
            </span>
          </button>

          <button
            onClick={() => handleRoleSelect("pflege")}
            className="group w-full flex items-center justify-between p-5 rounded-2xl
                       bg-gradient-to-br from-emerald-400 to-emerald-600 text-white
                       shadow-lg active:scale-[0.97] transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🩺</div>
              <span className="text-lg font-medium">Caregiver</span>
            </div>
            <span className="text-white/70 group-hover:translate-x-1 transition">
              →
            </span>
          </button>

        </div>

        <p className="text-center text-xs text-gray-400">
          Secure • Private • Change anytime
        </p>

      </div>
    </div>
  );
}