-- Drop database if exists (be careful with this in production!)
DROP DATABASE IF EXISTS kanban_db;

-- Create database
CREATE DATABASE kanban_db;

-- Connect to the database
\c kanban_db;

-- Create table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    column_id VARCHAR(50) NOT NULL,
    column_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Insert some initial data
INSERT INTO tasks (content, column_id, column_order) VALUES
    ('First task', 'todo', 0),
    ('Second task', 'todo', 1),
    ('Sample in-progress task', 'inProgress', 0),
    ('Sample completed task', 'done', 0); 