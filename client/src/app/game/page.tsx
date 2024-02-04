'use client'

// page.tsx
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import TetrisGame from '@/components/tetris/TetrisGame';
import Button from '@/components/Button';

// TODO set waiting state
const GAME_STATES = {
	JOINING: 0,
	GAME_MENU: 1,
	CREATE: 2,
	GAME_LIST: 3,
	PLAYING: 4,
};

const Page = () => {
    const [gameState, setGameState] = useState(GAME_STATES.MENU);
    const [socket, setSocket] = useState(null);
	const [nickname, setNickname] = useState('');

    useEffect(() => {
		console.log('connecting to socket')
        const newSocket = io("http://localhost:3000");
        newSocket && setSocket(newSocket);


        return () => {
			newSocket.disconnect();
        };
    }, []);

	useEffect(() => {
		socket?.on('playerAdded', ({playerName}) => {
			console.log('playerAdded', playerName);
			
			// TODO set waiting state
			if (gameState === GAME_STATES.JOINING)
				setGameState(GAME_STATES.GAME_MENU);
		});

		socket?.on('gameCreated', ({gameId}) => {
			console.log('gameCreated', gameId);
			// TODO set waiting state
			if (gameState === GAME_STATES.GAME_MENU)	
				setGameState(GAME_STATES.PLAYING);
		});

		return () => {
			socket?.off('playerAdded');
			socket?.off('gameCreated');
		};
    }, [socket, gameState]);

    return (
		<div>
			{gameState === GAME_STATES.MENU && (
			<Button onClick={() => setGameState(GAME_STATES.JOINING)} className="p-5 text-white bg-blue-700">
				Join Game
			</Button>
			)}
			{gameState === GAME_STATES.JOINING && <div className="flex flex-col gap-1 justify-center items-center bg-slate-200 p-12">
				<div>
					<input 
						type="text" 
						placeholder="Type your nickname"
						value={nickname} 
						onChange={(e) => setNickname(e.target.value)}
						className="h-8 border-2"
					/>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => {
						socket?.emit('joinGame', { playerName: nickname })
						console.log(gameState, GAME_STATES.JOINING)
					}}
						className="p-3 text-white bg-blue-700"					
					>Join</Button>
					<Button onClick={() => setGameState(GAME_STATES.MENU)}
						className="p-3 text-white bg-blue-700"
					>Back</Button>
				</div>
				</div>}
			{gameState === GAME_STATES.GAME_MENU && <div className="flex flex-col gap-1 justify-center items-center bg-slate-200 p-12">
				<Button onClick={() => {
					socket?.emit('createGame');
				}}
					className="p-3 text-white bg-blue-700"	
				>Create Game</Button>
				<Button onClick={() => console.log('not ready yet')}
					className="p-3 text-white bg-blue-700"	
				>Game List</Button>
				</div>}
			{gameState === GAME_STATES.PLAYING && <TetrisGame socket={socket} />}
		</div>
    );
};

export default Page;
