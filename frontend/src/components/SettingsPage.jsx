import { useEffect, useState } from "react";
import { getSeniors, saveSenior, deleteSenior } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [seniors, setSeniors] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    phone: "",
    familyPhone: ""
  });

  useEffect(() => {
    loadSeniors();
  }, []);

  const loadSeniors = async () => {
    const res = await getSeniors();
    setSeniors(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSenior(form);
    setForm({ id: null, name: "", phone: "", familyPhone: "" });
    loadSeniors();
  };

  const handleDelete = async (id) => {
    await deleteSenior(id);
    loadSeniors();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Senior Management
            </h1>
            <p className="text-gray-500 text-sm">
              Add, update or remove senior profiles
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-gray-800 text-white hover:bg-gray-900 transition shadow-sm"
          >
            ← Back
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-lg font-medium mb-6">
            {form.id ? "Update Senior" : "Add New Senior"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid md:grid-cols-2 gap-5">
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />

              <input
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
            </div>

            <input
              placeholder="Family Contact Phone"
              value={form.familyPhone}
              onChange={(e) =>
                setForm({ ...form, familyPhone: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
            />

            <button
              className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 transition shadow-md"
            >
              {form.id ? "Update Senior" : "Add Senior"}
            </button>
          </form>
        </div>

        {/* Seniors List */}
        <div className="space-y-4">

          {seniors.length === 0 && (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-500 shadow">
              No seniors added yet.
            </div>
          )}

          {seniors.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold">{s.name}</p>
                <p className="text-sm text-gray-500">{s.phone}</p>
                <p className="text-sm text-gray-400">
                  Family: {s.familyPhone}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setForm(s)}
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition shadow-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}