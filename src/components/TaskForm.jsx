import { useState, useEffect } from "react";

const TaskForm = ({ isOpen, onClose, onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      dueDate: '',
      priority: 'low',
    });
  
    useEffect(() => {
      if (initialData && initialData._id) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
          priority: initialData.priority || 'low',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          priority: 'low',
        });
      }
    }, [initialData]);
  
    if (!isOpen) return null;
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ ...formData, _id: initialData._id });
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">{initialData._id ? 'Edit Task' : 'New Task'}</h2>
          <form onSubmit={handleSubmit}>
            <input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task Title"
              className="w-full p-2 mb-3 border rounded"
              required
            />
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              className="w-full p-2 mb-3 border rounded"
              rows="3"
            />
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full p-2 mb-3 border rounded"
            />
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full p-2 mb-3 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default TaskForm;