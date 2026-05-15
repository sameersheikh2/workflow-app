const PRIORITY_MAP = {
  5: { label: 'P5 · Critical', color: 'text-red-600 font-bold' },
  4: { label: 'P4 · High', color: 'text-orange-500 font-semibold' },
  3: { label: 'P3 · Medium', color: 'text-yellow-600' },
  2: { label: 'P2 · Low', color: 'text-blue-500' },
  1: { label: 'P1 · Minimal', color: 'text-gray-400' },
};

export function getPriorityColor(priority) {
  return PRIORITY_MAP[priority]?.color || 'text-gray-400';
}

export function getPriorityLabel(priority) {
  return PRIORITY_MAP[priority]?.label || `P${priority}`;
}
