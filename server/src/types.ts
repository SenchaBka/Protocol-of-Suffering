import WebSocket from 'ws';

export interface ChatMessage {
  type: 'chat' | 'join' | 'leave' | 'typing' | 'system' | 'error';
  message: string;
  username?: string;
  timestamp: string;
  id?: string;
}

export interface ServerResponse {
  type: 'welcome' | 'message' | 'error' | 'userList' | 'system';
  data?: any;
  message?: string;
  timestamp: string;
  id?: string;
}

export interface ConnectedUser {
  id: string;
  username: string;
  socket: WebSocket;
  lastActivity: Date;
  joinedAt: Date;
}

export interface ServerConfig {
  host: string;
  port: number;
  maxConnections?: number;
  messageRateLimit?: number;
}

export interface MessageValidation {
  isValid: boolean;
  error?: string;
  sanitizedMessage?: string;
}

export enum MessageType {
  CHAT = 'chat',
  JOIN = 'join',
  LEAVE = 'leave',
  TYPING = 'typing',
  SYSTEM = 'system',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong'
}

export enum ConnectionStatus {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

// Custom error types
export class WebSocketError extends Error {
  constructor(
    message: string,
    public code: string,
    public userId?: string
  ) {
    super(message);
    this.name = 'WebSocketError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}