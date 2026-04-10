import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

/**
 * SocketProvider manages the WebSocket connection to the game server.
 * Provides real-time communication for matchmaking, game state, and chat.
 */
export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to the backend WebSocket server
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  /**
   * Emit an event to the server
   */
  const emit = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  /**
   * Listen for an event from the server
   */
  const on = (event, callback) => {
    socketRef.current?.on(event, callback);
  };

  /**
   * Remove a listener
   */
  const off = (event, callback) => {
    socketRef.current?.off(event, callback);
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      emit,
      on,
      off,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
