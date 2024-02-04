// SocketContext.ts
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketProviderProps {
  serverUrl: string;
  children: ReactNode;
}

const SocketContext = createContext<Socket | null>(null);

export const useSocket = (): Socket | null => useContext(SocketContext);

export const SocketProvider: React.FC<SocketProviderProps> = ({ serverUrl, children }) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const newSocket = io(serverUrl);
		setTimeout(() => {
			console.log(newSocket)
		}, 1500);
		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, [serverUrl]);
	
	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	);
};
