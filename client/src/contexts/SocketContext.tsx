// contexts/SocketContext.js
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            // Disconnect on cleanup
            newSocket.disconnect();
        };
    }, []);

    const providerValue = useMemo(() => ({ socket }), [socket]);

    return (
        <SocketContext.Provider value={providerValue}>
            {children}
        </SocketContext.Provider>
    );
};
