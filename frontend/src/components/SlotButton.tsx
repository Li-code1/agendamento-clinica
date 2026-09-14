interface SlotButtonProps {
  time: string;
  selected: boolean;
  onSelect: (time: string) => void;
}

export function SlotButton({ time, selected, onSelect }: SlotButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(time)}
      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
        selected
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
      }`}
    >
      {time}
    </button>
  );
}
