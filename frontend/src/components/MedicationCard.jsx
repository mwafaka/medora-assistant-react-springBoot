import { useState } from "react";

export default function MedicationCard({
  medication,
  onTaken,
  onSkip,
  isHistory = false,
  takenAt,
  skipped,
  skipReason
}) {
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleClick = async (taken) => {
    if (loading || isHistory) return;
    setLoading(true);

    if (taken && onTaken) {
      await onTaken(medication.id);
    } else if (!taken && onSkip) {
      // Only opens modal, skip confirmed later
      onSkip(medication);
    }

    setIsRemoving(true);
    setTimeout(() => setIsRemoving(false), 400);
    setLoading(false);
  };

  return (
    <div
      className={`
        relative
        rounded-[32px]
        bg-white/70
        backdrop-blur-xl
        border border-black/[0.05]
        p-6
        space-y-4
        transition-all duration-400 ease-in-out
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.07)]
        ${isRemoving ? "opacity-0 translate-y-[-20px]" : "opacity-100 translate-y-0"}
        ${skipped ? "border-dashed border-red-300 opacity-70" : ""}
      `}
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          {medication.name} {skipped && <span className="text-red-500 font-bold">- Skipped</span>}
        </h2>
        <p className="text-base text-gray-500">{medication.dosage}</p>
        {skipped && skipReason && (
          <p className="text-sm text-red-600">Grund: {skipReason}</p>
        )}
      </div>

      {/* Time or taken info */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {isHistory ? (
          <>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Taken at {takenAt}
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            {medication.scheduleTime}
          </>
        )}
      </div>

      {/* Action buttons only for active medications */}
      {!isHistory && (
        <div className="flex gap-4 pt-4">
          <button
            onClick={() => handleClick(true)}
            disabled={loading}
            className="
              flex-3 rounded-2xl bg-green-600 text-white py-3 text-base font-semibold shadow-md
              transition hover:bg-green-700 active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2
            "
          >
            ✅ I took it
          </button>

          <button
            onClick={() => handleClick(false)}
            disabled={loading}
            className="
              flex-1 rounded-2xl bg-red-100 text-red-700 py-3 text-base font-semibold shadow-sm
              transition hover:bg-red-200 active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2
            "
          >
            ⚠️ Skip
          </button>
        </div>
      )}
    </div>
  );
}
