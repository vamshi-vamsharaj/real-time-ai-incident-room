import { createContext, useContext, useEffect } from 'react';
import socket from '../shared/socket/socket';

const SocketContext = createContext(null);

/**
 * SocketProvider wraps the whole app.
 * It connects the singleton socket on mount and disconnects on unmount.
 *
 * All child components that need real-time access call useSocket().
 */
export const SocketProvider = ({ children }) => {
  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log(`[socket] connected  id=${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[socket] disconnected  reason=${reason}`);
    });

    socket.on('connect_error', (err) => {
      console.warn(`[socket] connection error  ${err.message}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);