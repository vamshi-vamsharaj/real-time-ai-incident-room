
import { createContext, useContext } from "react";
import socket from "../shared/socket/socket.js";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};


export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used inside <SocketProvider>");
  }
  return ctx;
};
