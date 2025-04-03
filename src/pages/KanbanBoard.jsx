import { useEffect, useState } from "react";
import axios from "axios";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import TaskForm from "../components/TaskForm";
import ListEditForm from "../components/ListEditForm";
import { BaseURL } from "../api/constants";
import SortableTaskCard from "../components/SortableTaskCard"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";


const KanbanBoard = ({ token }) => {
  const [board, setBoard] = useState(null);
  const [newListTitle, setNewListTitle] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isListEditModalOpen, setIsListEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingList, setEditingList] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line
  }, []);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BaseURL}/api/board`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoard(data);
    } catch (error) {
      console.error("Error fetching board:", error);
    } finally {
      setLoading(false);
    }
  };

  const addList = async () => {
    if (!newListTitle) return;
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${BaseURL}/api/board/list`,
        { title: newListTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoard({ ...board, lists: [...board.lists, data] });
      setNewListTitle("");
    } catch (error) {
      console.error("Error adding list:", error);
    } finally {
      setLoading(false);
    }
  };

  const editList = async (listId, newTitle) => {
    try {
      setLoading(true);
      await axios.put(
        `${BaseURL}/api/board/list/${listId}`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBoard({
        ...board,
        lists: board.lists.map((list) =>
          list._id === listId ? { ...list, title: newTitle } : list
        ),
      });
    } catch (error) {
      console.error("Error updating list:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (listId) => {
    try {
      setLoading(true);
      await axios.delete(`${BaseURL}/api/board/list/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoard({
        ...board,
        lists: board.lists.filter((list) => list._id !== listId),
      });
    } catch (error) {
      console.error("Error deleting list:", error);
    } finally {
      setLoading(false);
    }
  };

  const addOrEditTask = async (taskData) => {
    const listId = selectedListId;
    try {
      setLoading(true);
      if (taskData._id) {
        const { data } = await axios.put(
          `${BaseURL}/api/board/task/${taskData._id}`,
          { ...taskData, listId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedLists = board.lists.map((list) => {
          const hasTask = list.tasks.some((t) => t._id === data._id);

          if (list._id === listId) {
            if (hasTask) {
              return {
                ...list,
                tasks: list.tasks.map((t) => (t._id === data._id ? data : t)),
              };
            } else {
              return { ...list, tasks: [...list.tasks, data] };
            }
          } else if (hasTask) {
            return {
              ...list,
              tasks: list.tasks.filter((t) => t._id !== data._id),
            };
          }

          return list;
        });

        setBoard({ ...board, lists: updatedLists });
      } else {
        // Add new task
        const { data } = await axios.post(
          `${BaseURL}/api/board/task`,
          { ...taskData, listId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedLists = board.lists.map((list) =>
          list._id === listId ? { ...list, tasks: [...list.tasks, data] } : list
        );
        setBoard({ ...board, lists: updatedLists });
      }
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      await axios.delete(`${BaseURL}/api/board/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedLists = board.lists.map((list) => ({
        ...list,
        tasks: list.tasks.filter((t) => t._id !== taskId),
      }));
      setBoard({ ...board, lists: updatedLists });
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
  
    const activeTaskId = active.id;
    let sourceListId = null;
    let destinationListId = over.id;
  
    for (const list of board.lists) {
      if (list.tasks.some(task => task._id === activeTaskId)) {
        sourceListId = list._id;
        break;
      }
    }
  
    if (!board.lists.find(list => list._id === over.id)) {
      for (const list of board.lists) {
        if (list.tasks.some(task => task._id === over.id)) {
          destinationListId = list._id;
          break;
        }
      }
    }
  
    if (!sourceListId || !destinationListId || sourceListId === destinationListId) return;

    setBoard((prevBoard) => {
      const updatedLists = prevBoard.lists.map(list => {
        if (list._id === sourceListId) {
          return { ...list, tasks: list.tasks.filter(task => task._id !== activeTaskId) };
        }
        if (list._id === destinationListId) {
          return { ...list, tasks: [...list.tasks, active.data.current] };
        }
        return list;
      });
  
      return { ...prevBoard, lists: updatedLists };
    });
  };  

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
  
    if (!active || !over || active.id === over.id) return;
  
    const activeTaskId = active.id;
    let sourceListId = null;
    let destinationListId = over.id;
  
    for (const list of board.lists) {
      if (list.tasks.some(task => task._id === activeTaskId)) {
        sourceListId = list._id;
        break;
      }
    }
  
    for (const list of board.lists) {
      if (list._id === over.id || list.tasks.some(task => task._id === over.id)) {
        destinationListId = list._id;
        break;
      }
    }
  
    if (!sourceListId || !destinationListId || sourceListId === destinationListId) return;
  
    setBoard(prevBoard => {
      const updatedLists = prevBoard.lists.map(list => {
        if (list._id === sourceListId) {
          return { ...list, tasks: list.tasks.filter(task => task._id !== activeTaskId) };
        }
        if (list._id === destinationListId) {
          return { ...list, tasks: [...list.tasks, active.data.current] };
        }
        return list;
      });
  
      return { ...prevBoard, lists: updatedLists };
    });

    try {
      await axios.put(
        `${BaseURL}/api/board/task/${activeTaskId}`,
        { listId: destinationListId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error moving task:", error);
      fetchBoard();
    }
  };  
  

  if (!board) return <div className="p-4 text-center">Loading...</div>;

  let activeTask = null;
  if (activeId) {
    for (const list of board.lists) {
      const task = list.tasks.find((task) => task._id === activeId);
      if (task) {
        activeTask = task;
        break;
      }
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Kanban Board</h1>
        <div className="flex space-x-4">
          <input
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            placeholder="New List Title"
            className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addList}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add List"}
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {board.lists.map((list) => (
            <div
              key={list._id}
              id={list._id}
              className="bg-gray-100 p-4 rounded-lg w-80 shrink-0 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {list.title}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingList(list);
                      setIsListEditModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteList(list._id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <SortableContext
                items={list.tasks.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
              >
                {list.tasks.map((task) => (
                  <SortableTaskCard
                    key={task._id}
                    task={task}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setSelectedListId(list._id);
                      setIsTaskModalOpen(true);
                    }}
                    onDelete={deleteTask}
                  />
                ))}
              </SortableContext>
              <SortableContext items={list.tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
  {list.tasks.map(task => (
    <SortableTaskCard key={task._id} task={task} />
  ))}
</SortableContext>

              <button
                onClick={() => {
                  setSelectedListId(list._id);
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                }}
                disabled={loading}
                className="w-full mt-4 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                + Add Task
              </button>
            </div>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="p-3 mb-2 rounded shadow-md bg-white border-l-4 border-blue-500 opacity-80">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-800">
                  {activeTask.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {activeTask.description}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskForm
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={addOrEditTask}
        initialData={editingTask || {}}
      />

      <ListEditForm
        isOpen={isListEditModalOpen}
        onClose={() => {
          setIsListEditModalOpen(false);
          setEditingList(null);
        }}
        onSubmit={(newTitle) => editList(editingList._id, newTitle)}
        initialTitle={editingList?.title}
      />

      {loading && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-md shadow-md">
          Saving changes...
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
