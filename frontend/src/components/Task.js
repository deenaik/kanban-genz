import React, { useState } from 'react';
import styled from 'styled-components';
import { Draggable } from '@hello-pangea/dnd';
import { useTheme } from '../context/ThemeContext';

const Container = styled.div`
  border: none;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
  background: ${props => props.$isDragging 
    ? props.theme.colors.surfaceHover 
    : props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  box-shadow: ${props => props.$isDragging 
    ? '0 8px 16px rgba(0,0,0,0.1)' 
    : '0 4px 8px rgba(0,0,0,0.05)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  }
`;

const Content = styled.div`
  flex-grow: 1;
  margin-right: 12px;
  font-size: 15px;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  margin-right: 12px;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => props.$variant === 'delete' ? `
    background: ${props.theme.colors.danger};
    color: white;
    &:hover {
      background: ${props.theme.colors.dangerHover};
    }
  ` : props.$variant === 'cancel' ? `
    background: ${props.theme.colors.cancel};
    color: white;
    &:hover {
      background: ${props.theme.colors.cancelHover};
    }
  ` : `
    background: ${props.theme.colors.primary};
    color: white;
    &:hover {
      background: ${props.theme.colors.primaryHover};
    }
  `}

  &:active {
    transform: scale(0.95);
  }
`;

// Emoji icons for buttons
const EditIcon = () => "✏️";
const DeleteIcon = () => "🗑️";
const SaveIcon = () => "💾";
const CancelIcon = () => "❌";

function Task({ task, index, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);
  const { theme } = useTheme();

  const handleSubmit = () => {
    if (editedContent.trim() && editedContent !== task.content) {
      onUpdate(task.id, editedContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedContent(task.content);
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Container
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          $isDragging={snapshot.isDragging}
        >
          {isEditing ? (
            <>
              <Input
                type="text"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyPress}
                autoFocus
                placeholder="What needs to be done?"
              />
              <ButtonGroup>
                <Button onClick={handleSubmit}>
                  <SaveIcon /> Save
                </Button>
                <Button 
                  $variant="cancel" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(task.content);
                  }}
                >
                  <CancelIcon /> Cancel
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <>
              <Content>{task.content}</Content>
              <ButtonGroup>
                <Button onClick={() => setIsEditing(true)}>
                  <EditIcon /> Edit
                </Button>
                <Button $variant="delete" onClick={() => onDelete(task.id)}>
                  <DeleteIcon /> Delete
                </Button>
              </ButtonGroup>
            </>
          )}
        </Container>
      )}
    </Draggable>
  );
}

export default Task; 