import { useState } from "react";
import api from "../services/api";
import { useAdmin } from "../context/AdminContext";
import { useNavigate } from "react-router-dom";

export default function PinModal({ onClose }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { verify } = useAdmin();
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (pin.length < 4) return;

    try {
      setLoading(true);
      setError("");
      await api.post("/admin/verify-pin", { pin });

      verify();
      onClose();
      navigate("/settings");
    } catch {
      setError("Incorrect PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      
      <div className="relative w-96 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6 animate-scaleIn">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
        >
          ✕
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Caregiver Access
          </h2>
          <p className="text-sm text-gray-500">
            Enter your secure PIN to continue
          </p>
        </div>

        {/* PIN Input */}
        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError("");
          }}
          className="w-full text-center text-2xl tracking-widest py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
          placeholder="••••"
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center animate-pulse">
            {error}
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleVerify}
            disabled={pin.length < 4 || loading}
            className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
}