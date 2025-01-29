import React, { useState, useEffect } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import styled from 'styled-components';
import Column from './Column';
import AddTask from './AddTask';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BoardsList from './BoardsList';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  transition: background-color 0.2s ease;
  margin-left: ${props => props.$showPanel ? '300px' : '0'};
  transition: margin-left 0.3s ease;
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

const LogoutButton = styled.button`
  position: fixed;
  top: 20px;
  right: 80px;
  padding: 10px 20px;
  background: ${props => props.theme.colors.danger};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: ${props => props.theme.colors.dangerHover};
  }
`;

function KanbanBoard() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState({
    todo: { title: 'To Do', items: [] },
    inProgress: { title: 'In Progress', items: [] },
    done: { title: 'Done', items: [] }
  });
  const [activeBoard, setActiveBoard] = useState('1');
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    fetchTasksForBoard(activeBoard);
  }, [activeBoard]);

  const fetchTasksForBoard = async (boardId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/boards/${boardId}/tasks`);
      const data = await response.json();
      
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
    let movedItem;

    if (source.droppableId === destination.droppableId) {
      const column = tasks[source.droppableId];
      const items = Array.from(column.items);
      [movedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, movedItem);

      setTasks({
        ...tasks,
        [source.droppableId]: {
          ...column,
          items
        }
      });
    } else {
      const sourceColumn = tasks[source.droppableId];
      const destColumn = tasks[destination.droppableId];
      const sourceItems = Array.from(sourceColumn.items);
      const destItems = Array.from(destColumn.items);
      [movedItem] = sourceItems.splice(source.index, 1);
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

    try {
      await fetch(`http://localhost:8080/api/tasks/${result.draggableId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: movedItem.content,
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
          column_id: 'todo',
          column_order: tasks.todo.items.length,
          board_id: activeBoard
        }),
      });

      const newTask = await response.json();
      
      setTasks(prev => ({
        ...prev,
        todo: {
          ...prev.todo,
          items: [...prev.todo.items, {
            id: newTask.id.toString(),
            content: newTask.content
          }]
        }
      }));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleBoardSelect = (boardId) => {
    setActiveBoard(boardId);
  };

  const handleCreateBoard = async (newBoard) => {
    try {
      const response = await fetch('http://localhost:8080/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newBoard.name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create board');
      }

      const createdBoard = await response.json();
      setActiveBoard(createdBoard.id.toString());
    } catch (error) {
      console.error('Error creating board:', error);
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
    <>
      <BoardsList
        activeBoard={activeBoard}
        onBoardSelect={handleBoardSelect}
        onCreateBoard={handleCreateBoard}
      />
      <Container $showPanel={showPanel}>
        <ThemeToggle onClick={toggleTheme}>
          {theme.isDarkMode ? '🌞' : '🌙'}
        </ThemeToggle>
        <LogoutButton onClick={logout}>Logout</LogoutButton>
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
    </>
  );
}

export default KanbanBoard; 