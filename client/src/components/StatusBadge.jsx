import { STATUS_COLORS } from '../utils/statusColors';

export default function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || 'bg-gray-200 text-gray-600';
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colors}`}>
      {status}
    </span>
  );
}
