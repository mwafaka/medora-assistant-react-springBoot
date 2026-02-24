import { useEffect, useState } from "react";
import {
  getSeniors,
  getMedications,
  saveMedication,
  deleteMedication,
  getNotifications,
  logMedication,
  getTodayLogs,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import PflegeMedicationCard from "./PflegeMedicationCard";
import ConfirmModal from "./ConfirmModal";
import PinModal from "./PinModal";
import { useAdmin } from "../context/AdminContext";
const emptyMed = { id: null, name: "", dosage: "", scheduleTime: "" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [seniors, setSeniors] = useState([]);
  const [selectedSenior, setSelectedSenior] = useState(null);
  const [medForm, setMedForm] = useState(emptyMed);
  const [takenMedications, setTakenMedications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [acknowledged, setAcknowledged] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [medToDelete, setMedToDelete] = useState(null);

  const todayKey = new Date().toISOString().split("T")[0];
  const { verified } = useAdmin();
  const [pinOpen, setPinOpen] = useState(false);
  // Load seniors
  useEffect(() => {
    const loadSeniors = async () => {
      const res = await getSeniors();
      setSeniors(res.data);
    };
    loadSeniors();
  }, []);

  // Daily reset of skipped meds
  useEffect(() => {
    if (!selectedSenior) return;
    const savedDate = localStorage.getItem(`skipDate_${selectedSenior.id}`);
    if (savedDate !== todayKey) {
      localStorage.setItem(`skipDate_${selectedSenior.id}`, todayKey);
      localStorage.setItem(
        `skippedMeds_${selectedSenior.id}`,
        JSON.stringify([]),
      );
    }
  }, [selectedSenior, todayKey]);

  // Load acknowledged notifications from localStorage
  useEffect(() => {
    if (!selectedSenior) return;
    const stored = JSON.parse(
      localStorage.getItem(`acknowledged_${selectedSenior.id}`) || "[]",
    );
    setAcknowledged(stored);
  }, [selectedSenior]);

  // Select senior and load medications & logs
  const handleSelectSenior = async (senior) => {
    const [medsRes, logsRes] = await Promise.all([
      getMedications(senior.id),
      getTodayLogs(senior.id),
    ]);

    const backendLogs = logsRes.data.map((log) => ({
      ...log.medication,
      taken: log.taken,
      skipped: false,
      skipReason: "",
      takenAt: log.date,
    }));

    const localSkipped = JSON.parse(
      localStorage.getItem(`skippedMeds_${senior.id}`) || "[]",
    );

    const mergedLogs = [
      ...backendLogs,
      ...localSkipped.filter((ls) => !backendLogs.some((b) => b.id === ls.id)),
    ];

    setSelectedSenior({ ...senior, medications: medsRes.data });
    setTakenMedications(mergedLogs);
    setMedForm(emptyMed);
  };

  // Load notifications after senior selection
  useEffect(() => {
    if (!selectedSenior) return;

    const loadNotifications = async () => {
      try {
        const res = await getNotifications(selectedSenior.id);
        const filtered = res.data.filter((n) => !acknowledged.includes(n.id));
        setNotifications(filtered);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [selectedSenior, acknowledged]);

  const markLocalRead = (id) => {
    setAcknowledged((prev) => {
      const updated = [...prev, id];
      if (selectedSenior) {
        localStorage.setItem(
          `acknowledged_${selectedSenior.id}`,
          JSON.stringify(updated),
        );
      }
      return updated;
    });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDismiss = (id) => markLocalRead(id);

  const handleMedicationSubmit = async (e) => {
    e.preventDefault();
    if (!medForm.name || !selectedSenior) return;
    await saveMedication({ ...medForm, senior: { id: selectedSenior.id } });
    const res = await getMedications(selectedSenior.id);
    setSelectedSenior({ ...selectedSenior, medications: res.data });
    setMedForm(emptyMed);
  };

  const handleDeleteClick = (medId) => {
    setMedToDelete(medId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!medToDelete || !selectedSenior) return;

    await deleteMedication(medToDelete);
    const res = await getMedications(selectedSenior.id);
    setSelectedSenior({ ...selectedSenior, medications: res.data });

    const existing = JSON.parse(
      localStorage.getItem(`skippedMeds_${selectedSenior.id}`) || "[]",
    );
    localStorage.setItem(
      `skippedMeds_${selectedSenior.id}`,
      JSON.stringify(existing.filter((m) => m.id !== medToDelete)),
    );

    setTakenMedications((prev) => prev.filter((m) => m.id !== medToDelete));
    if (medForm.id === medToDelete) setMedForm(emptyMed);

    setConfirmOpen(false);
    setMedToDelete(null);
  };

  const takenOnly = takenMedications.filter((m) => m.taken && !m.skipped);
  const skippedOnly = takenMedications.filter((m) => m.skipped);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="sticky top-6 z-30 px-6">
          <div className="rounded-3xl px-8 py-6 bg-white/70 backdrop-blur-2xl border border-white/40 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left Section */}
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
                Caregiver Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Senior activity & medication tracking
              </p>
            </div>

            {/* Right Section Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.02] transition"
              >
                Home
              </button>

              <button
                onClick={() =>
                  verified ? navigate("/settings") : setPinOpen(true)
                }
                className="px-5 py-2.5 rounded-full bg-gray-900 text-white font-medium shadow-md hover:bg-black hover:scale-[1.02] transition flex items-center gap-2"
              >
                <span className="text-sm">⚙</span>
                Settings
              </button>
            </div>
          </div>
        </header>

        {/* Seniors */}
        <div className="grid md:grid-cols-2 gap-6">
          {seniors.map((s) => {
            const isSelected = selectedSenior?.id === s.id;

            return (
              <div
                key={s.id}
                onClick={() => handleSelectSenior(s)}
                className={`
          group relative p-7 rounded-3xl cursor-pointer transition-all duration-300
          border
          ${
            isSelected
              ? "bg-white shadow-2xl scale-[1.03] border-emerald-400"
              : "bg-white/60 backdrop-blur-xl border-white/40 hover:shadow-xl hover:-translate-y-1"
          }
        `}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 text-emerald-500 text-sm font-medium">
                    ● Active
                  </div>
                )}

                {/* Name */}
                <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-3">
                  {s.name}
                </h3>

                {/* Info Section */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400">📞</span>
                    <span>{s.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-gray-400">👨‍👩‍👧</span>
                    <span>{s.familyPhone}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Senior */}
        {selectedSenior && (
          <div className="mt-8 p-6 rounded-3xl bg-white/50 backdrop-blur-md shadow-xl space-y-6">
            <h2 className="text-2xl font-bold">
              {selectedSenior.name}'s Medications
            </h2>

            {/* Form */}
            <form onSubmit={handleMedicationSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                {["name", "dosage", "scheduleTime"].map((field) => (
                  <input
                    key={field}
                    type={field === "scheduleTime" ? "time" : "text"}
                    placeholder={field}
                    value={medForm[field]}
                    onChange={(e) =>
                      setMedForm({ ...medForm, [field]: e.target.value })
                    }
                    className="px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-emerald-400 transition"
                  />
                ))}
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-6 py-2 rounded-full shadow"
              >
                {medForm.id ? "Update Medication" : "Add Medication"}
              </button>
            </form>

            {/* Medication List */}
            <div className="space-y-4">
              {selectedSenior.medications?.map((med) => (
                <PflegeMedicationCard
                  key={med.id}
                  medication={med}
                  onEdit={() => setMedForm(med)}
                  onDelete={() => handleDeleteClick(med.id)}
                  onTaken={(taken) => {
                    const updatedEntry = {
                      ...med,
                      taken,
                      takenAt: new Date().toISOString(),
                      skipped: !taken,
                      skipReason: !taken ? "Skipped by caregiver" : "",
                    };

                    setTakenMedications((prev) => [
                      ...prev.filter((m) => m.id !== med.id),
                      updatedEntry,
                    ]);

                    setNotifications((prev) =>
                      prev.filter((n) => n.medication?.id !== med.id),
                    );

                    if (!taken) {
                      const existing = JSON.parse(
                        localStorage.getItem(
                          `skippedMeds_${selectedSenior.id}`,
                        ) || "[]",
                      );
                      localStorage.setItem(
                        `skippedMeds_${selectedSenior.id}`,
                        JSON.stringify([
                          ...existing.filter((m) => m.id !== med.id),
                          updatedEntry,
                        ]),
                      );
                    }
                  }}
                  isHistory
                />
              ))}
            </div>

            {/* Taken & Skipped */}
            {takenOnly.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-green-600">
                  Taken Today
                </h3>
                {takenOnly.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl shadow bg-green-50"
                  >
                    <PflegeMedicationCard medication={m} isHistory={false} />
                    <p className="text-sm text-gray-500 mt-2">
                      Taken at: {new Date(m.takenAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </section>
            )}

            {skippedOnly.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-red-600 ">
                  Skipped Today
                </h3>
                {skippedOnly.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 m-2 rounded-2xl shadow bg-red-50 border border-red-200"
                  >
                    <PflegeMedicationCard medication={m} isHistory={false} />
                    <p className="text-sm text-gray-500 mt-2">
                      Reason: {m.skipReason || "No reason provided"}
                    </p>
                  </div>
                ))}
              </section>
            )}

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                {notifications.slice(0, 1).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between bg-red-600 text-white p-4 rounded-2xl shadow-lg mb-2 border-l-4 border-red-800 animate-pulse cursor-pointer"
                    onClick={() => handleDismiss(n.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-bold">⚠️</span>
                      <p className="font-semibold">{n.message}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markLocalRead(n.id);
                      }}
                      className="bg-white text-red-600 px-3 py-1 rounded-full font-semibold hover:bg-gray-100 transition"
                    >
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {confirmOpen && (
          <ConfirmModal
            message="Delete this medication?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmOpen(false)}
          />
        )}
        {pinOpen && <PinModal onClose={() => setPinOpen(false)} />}
      </div>
    </div>
  );
}
