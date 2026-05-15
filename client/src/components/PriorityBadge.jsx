import { getPriorityLabel, getPriorityColor } from '../utils/priorityLabel';

export default function PriorityBadge({ priority }) {
  return (
    <span className={`text-xs ${getPriorityColor(priority)}`}>
      {getPriorityLabel(priority)}
    </span>
  );
}
