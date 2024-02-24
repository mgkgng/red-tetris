'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TetrisGame from '@/components/tetris/TetrisGame.jsx';
import Button from '@/components/Button.jsx';

// TODO set waiting state
const GAME_STATES = {
	SETUP_NAME: 0,
	GAME_LIST: 1,
	CREATE: 2,
	PLAYING: 3,
	LOADING: 4
};

const Page = () => {
    const [gameState, setGameState] = useState(GAME_STATES.SETUP_NAME);
	const [nickname, setNickname] = useState('');
	const [gameList, setGameList] = useState([]);
	const router = useRouter();

	async function fetchGameList() {
		const response = await fetch(`http://localhost:3000/api/game_list`);
		const data = await response.json();
		console.log(data);
		setGameList(data);
		if (gameState === GAME_STATES.LOADING)
			setGameState(GAME_STATES.GAME_LIST);
	}

	async function joinRoom(roomId){
		try {
			const response = await fetch('http://localhost:3000/api/join_room', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ roomId }),
			});
		
			if (!response.ok)
				throw new Error(response.message);
		
			const data = await response.json();
			console.log(data);
			localStorage.setItem('nickname', nickname);
			router.push(`/game/${data.roomId}`);
			return data;
			} catch (error) {
				throw error;
			}
	};

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
						// fetch game list here
						fetchGameList();
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
								joinRoom(game.id);
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

export default Page;
