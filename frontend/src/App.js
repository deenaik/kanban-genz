import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import styled from 'styled-components';
import Column from './components/Column';
import AddTask from './components/AddTask';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  transition: background-color 0.2s ease;
`;

const BoardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  flex-grow: 1;
`;

const ThemeToggle = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  &:hover {
    transform: scale(1.1);
  }
`;

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState({
    todo: {
      title: 'To Do',
      items: []
    },
    inProgress: {
      title: 'In Progress',
      items: []
    },
    done: {
      title: 'Done',
      items: []
    }
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tasks');
      const data = await response.json();
      
      // Transform the flat array into our column structure
      const transformedTasks = {
        todo: { title: 'To Do', items: [] },
        inProgress: { title: 'In Progress', items: [] },
        done: { title: 'Done', items: [] }
      };

      data.forEach(task => {
        transformedTasks[task.column_id].items.push({
          id: task.id.toString(),
          content: task.content
        });
      });

      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    let movedItem;  // Define movedItem at the top

    if (source.droppableId === destination.droppableId) {
      // Moving within the same column
      const column = tasks[source.droppableId];
      const items = Array.from(column.items);
      [movedItem] = items.splice(source.index, 1);  // Assign movedItem here
      items.splice(destination.index, 0, movedItem);

      setTasks({
        ...tasks,
        [source.droppableId]: {
          ...column,
          items
        }
      });
    } else {
      // Moving between columns
      const sourceColumn = tasks[source.droppableId];
      const destColumn = tasks[destination.droppableId];
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);
      [movedItem] = sourceItems.splice(source.index, 1);  // Assign movedItem here
      destItems.splice(destination.index, 0, movedItem);

      setTasks({
        ...tasks,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
    }

    // Update the backend
    try {
      await fetch(`http://localhost:8080/api/tasks/${result.draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: movedItem.content,  // Now movedItem is defined
          column_id: destination.droppableId,
          column_order: destination.index,
        }),
      });
    } catch (error) {
      console.error('Error updating task position:', error);
    }
  };

  const handleAddTask = async (content) => {
    try {
      const response = await fetch('http://localhost:8080/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          column_id: 'todo',  // New tasks always go to todo column
          column_order: tasks.todo.items.length  // Add to end of todo list
        }),
      });

      const newTask = await response.json();
      
      setTasks({
        ...tasks,
        todo: {
          ...tasks.todo,
          items: [...tasks.todo.items, {
            id: newTask.id.toString(),
            content: newTask.content
          }]
        }
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId, newContent) => {
    try {
      // Find the task and its column
      let taskColumn;
      let columnOrder;
      for (const [columnId, column] of Object.entries(tasks)) {
        const taskIndex = column.items.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          taskColumn = columnId;
          columnOrder = taskIndex;
          break;
        }
      }

      if (taskColumn === undefined) return;

      // Update backend
      const response = await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newContent,
          column_id: taskColumn,
          column_order: columnOrder
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update frontend state
      setTasks(prev => ({
        ...prev,
        [taskColumn]: {
          ...prev[taskColumn],
          items: prev[taskColumn].items.map(t =>
            t.id === taskId ? { ...t, content: newContent } : t
          )
        }
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      // Optionally, revert the UI change here
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Delete from backend
      await fetch(`http://localhost:8080/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      // Update frontend state
      setTasks(prev => {
        const newTasks = { ...prev };
        for (const columnId in newTasks) {
          newTasks[columnId] = {
            ...newTasks[columnId],
            items: newTasks[columnId].items.filter(t => t.id !== taskId)
          };
        }
        return newTasks;
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <Container>
      <ThemeToggle onClick={toggleTheme}>
        {theme.isDarkMode ? '🌞' : '🌙'}
      </ThemeToggle>
      <AddTask onAddTask={handleAddTask} />
      <BoardContainer>
        <DragDropContext onDragEnd={handleDragEnd}>
          {Object.entries(tasks).map(([columnId, column]) => (
            <Column
              key={columnId}
              columnId={columnId}
              title={column.title}
              tasks={column.items}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </DragDropContext>
      </BoardContainer>
    </Container>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App; 