'use client'
import { SocketProvider } from "@/contexts/SocketContext";
import GameComponent from "./GameComponent";

const Page = () => {
	return (
		<SocketProvider>
			<GameComponent />
		</SocketProvider>
	)
};

export default Page;
