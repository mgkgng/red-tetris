'use client'
import { SocketProvider } from "@/contexts/SocketContext.jsx";
import GameComponent from "./GameComponent.jsx";

const Page = () => {
	return (
		<SocketProvider>
			<GameComponent />
		</SocketProvider>
	)
};

export default Page;
