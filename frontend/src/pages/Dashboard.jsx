import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMedications,
  getNotifications,
  getTodayLogs,
  logMedicationTaken,
} from "../services/api";
import MedicationCard from "../components/MedicationCard";
// import NotificationItem from "../components/NotificationItem";

const SKIP_REASONS = [
  "Keine Beschwerden / Symptomfrei", // Feeling fine / no symptoms
  "Nebenwirkungen / Unverträglichkeit", // Side effects / intolerance
  "Medikament ausgegangen", // Ran out of medication
  "Vergessen", // Forgot to take it
  "Schwierigkeiten beim Schlucken", // Difficulty swallowing
  "Appetitlosigkeit / Übelkeit", // Loss of appetite / nausea
  // Other medical reasons
];

export default function Dashboard({ seniorId }) {
  const navigate = useNavigate();
  const [medications, setMedications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [takenMedications, setTakenMedications] = useState([]);

  const [showSkipModal, setShowSkipModal] = useState(false);
  const [medToSkip, setMedToSkip] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // const todayKey = new Date().toISOString().split("T")[0];
  const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // e.g. "2026-06-20"
};

const todayKey = getLocalDateKey();

  /* ===============================
     0️⃣ Daily Reset Check
  =============================== */
  useEffect(() => {
    const savedDate = localStorage.getItem(`skipDate_${seniorId}`);
    if (savedDate !== todayKey) {
      localStorage.setItem(`skipDate_${seniorId}`, todayKey);
      localStorage.setItem(`skippedMeds_${seniorId}`, JSON.stringify([]));
    }
  }, [seniorId, todayKey]);

  /* ===============================
     1️⃣ Load Medications
  =============================== */
  useEffect(() => {
    getMedications(seniorId)
      .then((res) => setMedications(res.data))
      .catch((err) => console.error("Error loading medications:", err));
  }, [seniorId]);

  /* ===============================
     2️⃣ Load Today Logs + Local Skipped
  =============================== */
  useEffect(() => {
    const loadTaken = async () => {
      try {
        const res = await getTodayLogs(seniorId);

        const uniqueLogs = Array.from(
          new Map(
            res.data.map((log) => [
              log.medication.id,
              {
                ...log.medication,
                takenAt: log.date,
                skipped: false,
                skipReason: "",
              },
            ]),
          ).values(),
        );

        const localSkipped = JSON.parse(
          localStorage.getItem(`skippedMeds_${seniorId}`) || "[]",
        );

        const merged = [
          ...uniqueLogs,
          ...localSkipped.filter(
            (ls) => !uniqueLogs.some((u) => u.id === ls.id),
          ),
        ];

        setTakenMedications(merged);
      } catch (err) {
        console.error("Error loading today logs:", err);
      }
    };

    loadTaken();
  }, [seniorId]);

  /* ===============================
     3️⃣ Load Notifications
  =============================== */
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await getNotifications(seniorId);

        const filtered = res.data.filter(
          (n) => !takenMedications.some((t) => t.id === n.medication?.id),
        );

        setNotifications(filtered);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [seniorId, takenMedications]);

  const markLocalRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  /* ===============================
     5️⃣ Handle TAKEN
  =============================== */
  const handleMedicationTaken = async (medicationId) => {
    const med = medications.find((m) => m.id === medicationId);
    if (!med) return;

    try {
      await logMedicationTaken(medicationId, true);
    } catch (err) {
      console.error("Error logging taken medication:", err);
      return;
    }

    localStorage.setItem(
      `skippedMeds_${seniorId}`,
      JSON.stringify(
        JSON.parse(
          localStorage.getItem(`skippedMeds_${seniorId}`) || "[]",
        ).filter((m) => m.id !== medicationId),
      ),
    );

    setTakenMedications((prev) => {
      if (prev.some((m) => m.id === med.id)) return prev;
      return [
        ...prev,
        {
          ...med,
          takenAt: new Date().toISOString(),
          skipped: false,
        },
      ];
    });

    setNotifications((prev) =>
      prev.filter((n) => n.medication?.id !== medicationId),
    );
  };

  /* ===============================
     6️⃣ Handle SKIPPED
  =============================== */
  const handleSkipMedication = (medication) => {
    setMedToSkip(medication);
    setShowSkipModal(true);
  };

  const confirmSkip = async () => {
    if (!selectedReason || !medToSkip) return;

    const reason =
      selectedReason === "Sonstiges" ? customReason : selectedReason;

    // ❌ REMOVE THIS LINE
    // await logMedicationTaken(medToSkip.id, false);

    const skippedEntry = {
      ...medToSkip,
      skipped: true,
      skipReason: reason,
      takenAt: new Date().toISOString(),
    };

    const existing = JSON.parse(
      localStorage.getItem(`skippedMeds_${seniorId}`) || "[]",
    );

    localStorage.setItem(
      `skippedMeds_${seniorId}`,
      JSON.stringify([
        ...existing.filter((m) => m.id !== medToSkip.id),
        skippedEntry,
      ]),
    );

    setTakenMedications((prev) => [
      ...prev.filter((m) => m.id !== medToSkip.id),
      skippedEntry,
    ]);

    setNotifications((prev) =>
      prev.filter((n) => n.medication?.id !== medToSkip.id),
    );

    setShowSkipModal(false);
    setMedToSkip(null);
    setSelectedReason("");
    setCustomReason("");
  };

  const takenOnly = useMemo(
    () => takenMedications.filter((m) => !m.skipped),
    [takenMedications],
  );

  const skippedOnly = useMemo(
    () => takenMedications.filter((m) => m.skipped),
    [takenMedications],
  );

  const getCategory = (value) => {
    if (!value) return "morgen";
    const hours = value.includes?.(":")
      ? Number(value.split(":")[0])
      : new Date(value).getHours();
    if (hours < 12) return "morgen";
    if (hours < 18) return "nachmittag";
    return "abend";
  };
  const getCategoryStyles = (category) => {
    switch (category) {
      case "morgen":
        return {
          container:
            "bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100 border border-yellow-200",
          title: "text-amber-700",
        };
      case "nachmittag":
        return {
          container:
            "bg-gradient-to-br from-orange-100 via-orange-200 to-pink-100 border border-orange-300",
          title: "text-orange-800",
        };
      case "abend":
        return {
          container:
            "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 border border-indigo-200",
          title: "text-indigo-700",
        };
      default:
        return {
          container: "",
          title: "",
        };
    }
  };

  const categorizedMedications = useMemo(() => {
    const categories = { morgen: [], nachmittag: [], abend: [] };
    const getMinutes = (value) => {
      if (!value) return Infinity;
      if (value.includes?.(":")) {
        const [h = 0, m = 0] = value.split(":").map(Number);
        return h * 60 + m;
      }
      const date = new Date(value);
      return date.getHours() * 60 + date.getMinutes();
    };
    medications.forEach((med) => {
      const category = getCategory(med.scheduleTime);
      categories[category].push(med);
    });
    Object.keys(categories).forEach((key) => {
      categories[key].sort(
        (a, b) => getMinutes(a.scheduleTime) - getMinutes(b.scheduleTime),
      );
    });
    return categories;
  }, [medications]);

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl px-6 py-5">
          {/* Title Section */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
              Senior Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of daily activity & medication
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.03] transition"
          >
            ← Home
          </button>
        </header>

        {["morgen", "nachmittag", "abend"].map((category) => {
          const meds = categorizedMedications[category].filter(
            (m) => !takenMedications.some((t) => t.id === m.id),
          );
          if (meds.length === 0) return null;
          const styles = getCategoryStyles(category);
          return (
            <div
              key={category}
              className={`space-y-4 p-6 rounded-2xl shadow-sm ${styles.container}`}
            >
              <h2
                className={`text-xl font-semibold capitalize ${styles.title}`}
              >
                {category} - Active
              </h2>

              {meds.map((m) => {
                const relatedNotifications = notifications.filter(
                  (n) => n.medication?.id === m.id,
                );
                const hasUnread = relatedNotifications.some((n) => !n.read);

                return (
                  <div
                    key={m.id}
                    className={`bg-white p-6 rounded shadow ${hasUnread ? "animate-pulseRed" : ""}`}
                  >
                    <MedicationCard
                      medication={m}
                      onTaken={handleMedicationTaken}
                      onSkip={handleSkipMedication}
                    />
                    {/* notification part  */}
                    {/* {relatedNotifications.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {relatedNotifications.map(n => (
                          <NotificationItem
                            key={n.id}
                            notification={n}
                            onRead={markLocalRead}
                          />
                        ))}
                      </div>
                    )} */}
                  </div>
                );
              })}
            </div>
          );
        })}

        {takenOnly.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-green-600">
              Taken Medications
            </h2>
            {takenOnly.map((m) => (
              <div key={m.id} className="p-5 rounded shadow bg-green-100">
                <MedicationCard
                  medication={m}
                  isHistory
                  takenAt={new Date(m.takenAt).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  skipped={false}
                />
              </div>
            ))}
          </div>
        )}

        {skippedOnly.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-red-600">
              Skipped Medications
            </h2>
            {skippedOnly.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded shadow bg-red-100 border border-red-300"
              >
                <MedicationCard
                  medication={m}
                  isHistory
                  // takenAt={m.takenAt}
                  skipped={true}
                  skipReason={m.skipReason}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showSkipModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 relative">
            <h2 className="text-2xl font-bold text-red-600 text-center tracking-wide">
              Warum wurde das Medikament übersprungen?
            </h2>

            <div className="space-y-4">
              {SKIP_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer border border-gray-200 bg-gray-50 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <input
                    type="radio"
                    name="skipReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="w-6 h-6 accent-red-500"
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {selectedReason === "Sonstiges" && (
              <input
                type="text"
                placeholder="Bitte eingeben..."
                className="w-full p-4 rounded-2xl border border-gray-300 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={() => {
                  setShowSkipModal(false);
                  setMedToSkip(null);
                  setSelectedReason("");
                  setCustomReason("");
                }}
                className="flex-1 py-4 bg-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-300 shadow-sm transition-all text-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmSkip}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-semibold hover:bg-red-600 shadow-md transition-all text-lg"
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulseRed {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          50% {
            box-shadow: 0 0 20px 10px rgba(255, 0, 0, 0.7);
          }
        }
        .animate-pulseRed {
          animation: pulseRed 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
