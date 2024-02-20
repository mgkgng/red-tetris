'use client'

// page.tsx
import { useSocket } from '@/contexts/SocketContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TetrisGame from '@/components/tetris/TetrisGame';
import Button from '@/components/Button';

// TODO set waiting state
const GAME_STATES = {
	SETUP_NAME: 0,
	GAME_LIST: 1,
	CREATE: 2,
	PLAYING: 3,
	LOADING: 4
};

const GameComponent = () => {
    const [gameState, setGameState] = useState(GAME_STATES.SETUP_NAME);
	const [nickname, setNickname] = useState('');
	const [gameList, setGameList] = useState([]);
	const router = useRouter();

    const { socket } = useSocket();

	useEffect(() => {
		socket?.on('playerAdded', ({playerName}) => {
			console.log('playerAdded', playerName);
			
			// TODO set waiting state
			if (gameState === GAME_STATES.JOINING)
				setGameState(GAME_STATES.GAME_MENU);
		});

		socket?.on('createRoomRes', ({gameId}) => {
			console.log('gameCreated', gameId);
			// TODO set waiting state
			if (gameState === GAME_STATES.GAME_MENU)	
				setGameState(GAME_STATES.PLAYING);
		});

		socket?.on('gameListRes', (data) => {
			console.log('gameList', data);
			setGameList(data);
			if (gameState === GAME_STATES.LOADING)
				setGameState(GAME_STATES.GAME_LIST);
		})

		socket?.on('joinRoomRes', (data) => {
			if (data.success === false) {
				console.log('join room failed');
				return;
			}
			console.log('joinRoomRes', data);
			router.push(`/game/${data.roomId}`);
		})

		return () => {
			socket?.off('playerAdded');
			socket?.off('gameCreated');
			socket?.off('gameListRes');
		};
    }, [socket, gameState]);

    return (
		<div>
			{gameState === GAME_STATES.SETUP_NAME && 
			<div className="flex flex-col gap-1 justify-center items-center bg-slate-200 p-12">
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
						socket?.emit('gameListReq');
						setGameState(GAME_STATES.GAME_LIST);
					}}
						className="p-3 text-white bg-blue-700"					
					>Next</Button>
				</div>
			</div>}
			{gameState === GAME_STATES.GAME_LIST &&
			<div className="flex flex-col gap-2">
				{gameList.map((game, idx) => {
					return (
						<div key={idx} className="flex gap-2">
							<Button onClick={() => {
								socket?.emit('joinRoom', {roomId: game.id, playerName: nickname});
								router.push(`/game/${game.id}`);
								setGameState(GAME_STATES.JOINING);
							}}
								className="p-3 text-white bg-blue-700"	
							>Join</Button>
						</div>
					);
				})}
			</div>
			}
			{gameState === GAME_STATES.PLAYING && <TetrisGame socket={socket} />}
		</div>
    );
};

export default GameComponent;
