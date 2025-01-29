#! /bin/bash

# Install frontend dependencies 
cd frontend
npm install
cd ..

# restart postgres service using brew services and add wait time
brew services restart postgresql@17
sleep 10

# Install backend dependencies
cd backend
psql -U postgres -f init.sql
npm install
cd ..
