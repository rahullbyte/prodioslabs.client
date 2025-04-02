import { DndContext, PointerSensor } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast } from 'date-fns';

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 mb-2 rounded shadow-sm bg-white cursor-move hover:shadow-md transition-shadow
        ${isOverdue ? 'border-l-4 border-red-500' : 'border-l-4 border-gray-200'}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">{task.title}</h3>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(task)} className="text-blue-500 hover:text-blue-700">
            ✏️
          </button>
          <button onClick={() => onDelete(task._id)} className="text-red-500 hover:text-red-700">
            🗑️
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      {task.dueDate && (
        <p className={`text-xs mt-2 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
          Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
        </p>
      )}
      <span
        className={`inline-block px-2 py-1 mt-2 text-xs rounded-full ${
          task.priority === 'high'
            ? 'bg-red-100 text-red-800'
            : task.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}
      >
        {task.priority}
      </span>
    </div>
  );
};

export default TaskCard