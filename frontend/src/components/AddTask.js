import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const AddTaskContainer = styled.div`
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Form = styled.form`
  display: flex;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 12px 16px;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s ease;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.2);
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: ${props => props.theme.colors.cancel};
    cursor: not-allowed;
    transform: none;
  }
`;

function AddTask({ onAddTask }) {
  const { theme } = useTheme();
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onAddTask(content.trim());
      setContent('');
    }
  };

  return (
    <AddTaskContainer>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="✨ Add a new task..."
        />
        <Button type="submit" disabled={!content.trim()}>
          🚀 Add Task
        </Button>
      </Form>
    </AddTaskContainer>
  );
}

export default AddTask; 