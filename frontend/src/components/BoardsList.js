import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Panel = styled.div`
  position: fixed;
  left: ${props => props.$isOpen ? '0' : '-300px'};
  top: 0;
  bottom: 0;
  width: 300px;
  background: ${props => props.theme.colors.surface};
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
  transition: left 0.3s ease;
  z-index: 1000;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const UserSection = styled.div`
  padding: 16px;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  margin-bottom: 20px;
`;

const UserName = styled.h2`
  color: ${props => props.theme.colors.text};
  font-size: 18px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '👤';
  }
`;

const BoardsSection = styled.div`
  margin-bottom: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  cursor: pointer;
  color: ${props => props.theme.colors.text};
  font-weight: 600;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-radius: 8px;
  }
`;

const CollapseIcon = styled.span`
  transition: transform 0.3s ease;
  transform: ${props => props.$isOpen ? 'rotate(90deg)' : 'rotate(0)'};
`;

const BoardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  padding-left: 12px;
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const BoardItem = styled.div`
  padding: 12px;
  background: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.surfaceHover};
  color: ${props => props.$isActive ? 'white' : props.theme.colors.text};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(5px);
  }
`;

const CreateBoardButton = styled.button`
  padding: 12px;
  margin-left: 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 24px);

  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  left: ${props => props.$isOpen ? '300px' : '0'};
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  transition: left 0.3s ease;
  z-index: 1000;
`;

const Input = styled.input`
  padding: 8px 12px;
  margin-left: 12px;
  width: calc(100% - 24px);
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

function BoardsList({ activeBoard, onBoardSelect, onCreateBoard }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isBoardsOpen, setIsBoardsOpen] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [boards, setBoards] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/boards');
      const data = await response.json();
      
      const boardsArray = Array.isArray(data) ? data : [];
      setBoards(boardsArray.map(board => ({
        ...board,
        id: board.id.toString()
      })));
    } catch (error) {
      console.error('Error fetching boards:', error);
      setBoards([]);
    }
  };

  const handleCreateBoard = async () => {
    if (newBoardName.trim()) {
      try {
        const newBoard = {
          name: newBoardName.trim()
        };
        await onCreateBoard(newBoard);
        await fetchBoards();
        setNewBoardName('');
        setIsCreating(false);
      } catch (error) {
        console.error('Error creating board:', error);
      }
    }
  };

  return (
    <>
      <ToggleButton $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '◀' : '▶'}
      </ToggleButton>
      <Panel $isOpen={isOpen}>
        <UserSection>
          <UserName>{user?.name || 'Guest'}</UserName>
        </UserSection>

        <BoardsSection>
          <SectionHeader onClick={() => setIsBoardsOpen(!isBoardsOpen)}>
            📋 My Boards
            <CollapseIcon $isOpen={isBoardsOpen}>▶</CollapseIcon>
          </SectionHeader>
          
          <BoardList $isOpen={isBoardsOpen}>
            {Array.isArray(boards) && boards.map(board => (
              <BoardItem
                key={board.id}
                $isActive={activeBoard === board.id.toString()}
                onClick={() => onBoardSelect?.(board.id.toString())}
              >
                {board.name}
              </BoardItem>
            ))}
            
            {!isCreating ? (
              <CreateBoardButton onClick={() => setIsCreating(true)}>
                ✨ Create New Board
              </CreateBoardButton>
            ) : (
              <div>
                <Input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Enter board name..."
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
                />
                <ButtonGroup>
                  <Button onClick={handleCreateBoard}>Create</Button>
                  <Button $variant="cancel" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </ButtonGroup>
              </div>
            )}
          </BoardList>
        </BoardsSection>
      </Panel>
    </>
  );
}

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin: 10px 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 8px 16px;
  background: ${props => props.$variant === 'cancel' 
    ? props.theme.colors.cancel 
    : props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$variant === 'cancel'
      ? props.theme.colors.cancelHover
      : props.theme.colors.primaryHover};
  }
`;

export default BoardsList; 