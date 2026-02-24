// ConfirmModal.jsx
export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-20">
      
      {/* Modal container */}
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-slide-down">
        {/* Message */}
        <p className="text-center text-gray-900 text-lg font-medium mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full px-4 py-3 bg-red-500 text-white font-semibold rounded-2xl shadow hover:bg-red-600 transition"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 bg-gray-100 text-gray-800 font-semibold rounded-2xl shadow hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slide-down {
          0% { transform: translateY(-50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
