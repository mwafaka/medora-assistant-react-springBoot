import { PencilIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/solid";

export default function PflegeMedicationCard({ medication, onEdit, onDelete, onTaken ,isHistory}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/40 backdrop-blur-xl rounded-3xl shadow-lg p-5 hover:scale-[1.03] transition-transform duration-200 border border-white/20">
      
      {/* Medication Info */}
      <div className="flex flex-col mb-4 sm:mb-0 space-y-1">
        <span className="text-lg font-semibold text-gray-900 tracking-tight">{medication.name}</span>
        <span className="text-gray-600 text-sm">
          Dosage: <span className="font-medium">{medication.dosage}</span> | Time: <span className="font-medium">{medication.scheduleTime}</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {/* Edit Button */}
      {isHistory&&<button
          onClick={() => onEdit(medication)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full font-semibold shadow-md hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all duration-200"
        >
          <PencilIcon className="w-5 h-5" />
          Edit
        </button>}  

        {/* Remove Button */}
       {isHistory &&   <button
          onClick={() => onDelete(medication.id)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full font-semibold shadow-md hover:from-red-500 hover:to-red-600 active:scale-95 transition-all duration-200"
        >
          <TrashIcon className="w-5 h-5" />
          Remove
        </button>
}
        {/* Taken Button */}
        {/* {onTaken && (
          <button
            onClick={() => onTaken(medication.id)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full font-semibold shadow-md hover:from-green-500 hover:to-green-600 active:scale-95 transition-all duration-200"
          >
            <CheckIcon className="w-5 h-5" />
            Taken
          </button>
        )} */}
      </div>
    </div>
  );
}
