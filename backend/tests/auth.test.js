const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the database module
jest.mock('../utils/db', () => ({
  executeQuery: jest.fn(),
  checkDatabaseConnection: jest.fn().mockResolvedValue(true)
}));

// Use mock server instead of real server
const app = require('./mocks/server.mock');
const { executeQuery } = require('../utils/db');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock the database responses
      executeQuery
        .mockResolvedValueOnce({ rows: [] }) // Check if user exists
        .mockResolvedValueOnce({ 
          rows: [{
            id: 1,
            name: mockUser.name,
            email: mockUser.email
          }]
        }); // Insert user

      const response = await request(app)
        .post('/api/auth/signup')
        .send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe(mockUser.name);
    });

    it('should return error if email already exists', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock database response for existing user
      executeQuery.mockResolvedValueOnce({ 
        rows: [{ id: 1, email: mockUser.email }] 
      });

      const response = await request(app)
        .post('/api/auth/signup')
        .send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash(mockUser.password, 10);

      // Mock database response
      executeQuery.mockResolvedValueOnce({
        rows: [{
          id: 1,
          name: 'Test User',
          email: mockUser.email,
          password_hash: hashedPassword
        }]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(mockUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
    });

    it('should return error with incorrect credentials', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const hashedPassword = await bcrypt.hash('correctpassword', 10);

      // Mock database response
      executeQuery.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: mockUser.email,
          password_hash: hashedPassword
        }]
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(mockUser);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
}); 