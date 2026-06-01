import { createContext, useContext, useEffect } from 'react';
import socket from '../shared/socket/socket';

const SocketContext = createContext(null);

/**
 * SocketProvider
 *
 * Manages the singleton socket connection lifecycle:
 *   - Connects on mount
 *   - Logs connection events in dev
 *   - Disconnects on unmount (app teardown)
 *
 * All children access the socket instance via useSocket().
 * The socket singleton means one WS connection per browser tab.
 */
export const SocketProvider = ({ children }) => {
  useEffect(() => {
    socket.connect();

    const onConnect = () =>
      console.log(`[socket] connected  id=${socket.id}`);
    const onDisconnect = (reason) =>
      console.log(`[socket] disconnected  reason=${reason}`);
    const onError = (err) =>
      console.warn(`[socket] error  ${err.message}`);

    socket.on('connect',       onConnect);
    socket.on('disconnect',    onDisconnect);
    socket.on('connect_error', onError);

    return () => {
      socket.off('connect',       onConnect);
      socket.off('disconnect',    onDisconnect);
      socket.off('connect_error', onError);
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
};