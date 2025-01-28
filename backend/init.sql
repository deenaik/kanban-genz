-- Drop database if exists (be careful with this in production!)
DROP DATABASE IF EXISTS kanban_db;

-- Create database
CREATE DATABASE kanban_db;

-- Connect to the database
\c kanban_db;

-- Create boards table first
CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create default board
INSERT INTO boards (name) VALUES ('Main Board');

-- Create tasks table with board_id reference
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    column_id VARCHAR(50) NOT NULL,
    column_order INTEGER NOT NULL,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some initial tasks for the default board
INSERT INTO tasks (content, column_id, column_order, board_id) VALUES
    ('First task', 'todo', 0, 1),
    ('Second task', 'todo', 1, 1),
    ('Sample in-progress task', 'inProgress', 0, 1),
    ('Sample completed task', 'done', 0, 1);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Make board_id NOT NULL after updating existing tasks
ALTER TABLE tasks ALTER COLUMN board_id SET NOT NULL; 