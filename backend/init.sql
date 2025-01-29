-- Terminate existing connections to the database
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'kanban_db'
AND pid <> pg_backend_pid();

-- Drop and recreate database
DROP DATABASE IF EXISTS kanban_db;
CREATE DATABASE kanban_db;

-- Connect to the database
\c kanban_db;

-- Drop existing tables and functions if they exist
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS boards CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Create users table first (since it's referenced by boards)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create boards table
CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    column_id VARCHAR(50) NOT NULL,
    column_order INTEGER NOT NULL,
    board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
CREATE TRIGGER update_boards_updated_at
    BEFORE UPDATE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a test user (optional, comment out in production)
INSERT INTO users (name, email, password_hash) 
VALUES ('Test User', 'test@example.com', '$2b$10$rMB7PKb3R/8nxdX7pF5YC.1yg0VlSvqh3pv9mO5ZYV2pFQsGVxn6e')
ON CONFLICT (email) DO NOTHING;

-- Create default board for test user
WITH test_user AS (
    SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1
)
INSERT INTO boards (name, user_id)
SELECT 'Main Board', id FROM test_user
ON CONFLICT DO NOTHING;

-- Insert some initial tasks for the default board
WITH default_board AS (
    SELECT id FROM boards WHERE name = 'Main Board' LIMIT 1
)
INSERT INTO tasks (content, column_id, column_order, board_id)
SELECT 'First task', 'todo', 0, id FROM default_board
UNION ALL
SELECT 'Second task', 'todo', 1, id FROM default_board
UNION ALL
SELECT 'Sample in-progress task', 'inProgress', 0, id FROM default_board
UNION ALL
SELECT 'Sample completed task', 'done', 0, id FROM default_board
ON CONFLICT DO NOTHING; 