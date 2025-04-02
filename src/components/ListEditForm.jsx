import { useState } from "react";

const ListEditForm = ({ isOpen, onClose, onSubmit, initialTitle }) => {
    const [title, setTitle] = useState(initialTitle || '');
  
    if (!isOpen) return null;
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(title);
      onClose();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Edit List</h2>
          <form onSubmit={handleSubmit}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="List Title"
              className="w-full p-2 mb-3 border rounded"
              required
            />
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

  export default ListEditForm