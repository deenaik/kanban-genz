import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthContext';
import BoardsList from '../BoardsList';

// Mock fetch
global.fetch = jest.fn();

const mockBoards = [
  { id: '1', name: 'Board 1' },
  { id: '2', name: 'Board 2' }
];

const defaultProps = {
  activeBoard: '1',
  onBoardSelect: jest.fn(),
  onCreateBoard: jest.fn()
};

const renderBoardsList = (props = defaultProps) => {
  render(
    <AuthProvider>
      <ThemeProvider>
        <BoardsList {...props} />
      </ThemeProvider>
    </AuthProvider>
  );
};

describe('BoardsList Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBoards)
      })
    );
  });

  it('renders boards list', async () => {
    renderBoardsList();

    await waitFor(() => {
      expect(screen.getByText('Board 1')).toBeInTheDocument();
      expect(screen.getByText('Board 2')).toBeInTheDocument();
    });
  });

  it('handles board selection', async () => {
    renderBoardsList();

    await waitFor(() => {
      fireEvent.click(screen.getByText('Board 2'));
      expect(defaultProps.onBoardSelect).toHaveBeenCalledWith('2');
    });
  });

  it('shows create board form when button is clicked', async () => {
    renderBoardsList();

    await waitFor(() => {
      fireEvent.click(screen.getByText(/create new board/i));
      expect(screen.getByPlaceholderText(/enter board name/i)).toBeInTheDocument();
    });
  });

  it('handles board creation', async () => {
    renderBoardsList();

    await waitFor(() => {
      fireEvent.click(screen.getByText(/create new board/i));
    });

    const input = screen.getByPlaceholderText(/enter board name/i);
    fireEvent.change(input, { target: { value: 'New Board' } });
    fireEvent.click(screen.getByText('Create'));

    expect(defaultProps.onCreateBoard).toHaveBeenCalledWith({
      name: 'New Board'
    });
  });
}); 