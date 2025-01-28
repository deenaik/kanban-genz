import React from 'react';
import styled from 'styled-components';
import { Droppable } from '@hello-pangea/dnd';
import Task from './Task';
import { useTheme } from '../context/ThemeContext';

const Container = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  width: 320px;
  padding: 16px;
  margin: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 180px);
`;

const Title = styled.h2`
  padding: 8px;
  margin: 0 0 12px 0;
  color: ${props => props.theme.colors.text};
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '${props => {
      switch(props.columnId) {
        case 'todo': return '📝';
        case 'inProgress': return '⚡';
        case 'done': return '✅';
        default: return '📋';
      }
    }}';
  }
`;

const TaskList = styled.div`
  padding: 8px;
  min-height: 100px;
  background: ${props => props.isDraggingOver 
    ? props.theme.colors.surfaceHover 
    : props.theme.colors.surface};
  border-radius: 12px;
  transition: background-color 0.2s ease;
  flex-grow: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.scrollbar};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.scrollbarHover};
  }
`;

function Column({ columnId, title, tasks, onUpdateTask, onDeleteTask }) {
  const { theme } = useTheme();

  return (
    <Container>
      <Title columnId={columnId}>{title}</Title>
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <TaskList
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {tasks.map((task, index) => (
              <Task 
                key={task.id} 
                task={task} 
                index={index}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </TaskList>
        )}
      </Droppable>
    </Container>
  );
}

export default Column; 