# Kanban Board Application

A modern, responsive Kanban board application with dark mode support, built using React, Node.js, PostgreSQL, and styled-components.

## Features

- Drag and drop tasks between columns
- Create, edit, and delete tasks
- Real-time updates
- Dark/Light mode toggle
- Modern UI with smooth animations
- Responsive design
- PostgreSQL database persistence
- RESTful API backend

## Tech Stack

Frontend:
- React
- @hello-pangea/dnd (Drag and Drop)
- styled-components
- Context API for theme management

Backend:
- Node.js
- Express
- PostgreSQL
- cors
- dotenv

## Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL (v12+ recommended)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kanban-board
```
2. Setup the backend:
```bash
cd backend
npm install
```
3. Create a .env file in the backend directory:
```text
DB_USER=postgres
DB_HOST=localhost
DB_NAME=kanban_db
DB_PASSWORD=your_password
DB_PORT=5432
PORT=8080
```
4. Initialize the database:
```bash
psql -U postgres -f init.sql
```
5. Setup the frontend:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```
2. Start the frontend server:
```bash
cd frontend
npm start
```


The application will be available at http://localhost:3000

## API Endpoints

- GET /api/tasks - Get all tasks
- POST /api/tasks - Create a new task
- PUT /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task

## Features in Detail

### Task Management
- Create new tasks with the input field at the top
- Edit tasks by clicking the edit button
- Delete tasks using the delete button
- Drag and drop tasks between columns

### Theme Support
- Toggle between light and dark modes
- Smooth transitions between themes
- Consistent color scheme
- Accessible contrast ratios

### Column Organization
- "To Do" column for new tasks
- "In Progress" for ongoing tasks
- "Done" for completed tasks
- Visual feedback during drag operations

### UI/UX Features
- Emoji indicators for different columns
- Smooth animations and transitions
- Custom scrollbar styling
- Hover effects and micro-interactions
- Responsive layout

## Project Structure

- `backend/`: Contains the backend server code.
- `frontend/`: Contains the frontend application code.
- `public/`: Contains static assets.
- `src/`: Contains the main application code.
- `package.json`: Contains the project dependencies and scripts.


## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Troubleshooting

1. Database Connection Issues:
   - Verify PostgreSQL is running
   - Check credentials in .env file
   - Ensure database exists

2. Frontend Issues:
   - Clear browser cache
   - Check console for errors
   - Verify API endpoint URLs

3. Backend Issues:
   - Check server logs
   - Verify port availability
   - Ensure all dependencies are installed

## Future Enhancements

- User authentication
- Task categories/labels
- Due dates
- Task descriptions
- Activity logging
- Mobile app version
- Team collaboration features
- Task attachments
- Custom column creation
- Data export/import

## License

MIT License - feel free to use this project for your own purposes.