'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TetrisGame from '@/components/tetris/TetrisGame.jsx';
import Button from '@/components/Button.jsx';
import Picker from "emoji-picker-react";
import styles from './page.module.css';

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
	const [emoji1, setEmoji1] = useState('🐥');
	const [emoji2, setEmoji2] = useState('🐥');
	const [emoji3, setEmoji3] = useState('🐥');
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

	async function createRoom() {
		try {
			const response = await fetch('http://localhost:3000/api/create_room', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ titleEmojis: [emoji1, emoji2, emoji3]}),
			});

			if (!response.ok)
				throw new Error(response.message);

			const data = await response.json();
			console.log(data);
			localStorage.setItem('nickname', nickname);
			localStorage.setItem('roomId', data.roomId);
			router.push(`/game/${data.roomId}`);
		} catch (e) {
			console.error(e);
			throw error;
		}
	}

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
						if (!nickname?.length) return;
						fetchGameList();
						setGameState(GAME_STATES.GAME_LIST);
					}}
						className="p-3 text-white bg-blue-700"					
					>Next</Button>
				</div>
			</div>}
			{gameState === GAME_STATES.GAME_LIST &&
			<div className="flex flex-col gap-2">
				<Button className="p-3 bg-yellow-200 text-white" onClick={() => fetchGameList()}>Refresh</Button>
				<Button className="p-3 text-white bg-green-700"
					onClick={() => {
						setGameState(GAME_STATES.CREATE)
					}}>Create Game</Button>
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
			{gameState === GAME_STATES.CREATE &&
				<div className="flex flex-col gap-2 justify-center items-center">
					<div className="flex gap-4 items-center justify-center bg-white p-7 rounded-2xl">
						{/* <div className='flex gap-1'>
							<Picker onEmojiSelect={console.log} />
						</div> */}
						<span className={styles.emojiContainer}>{emoji1}</span>
						<span className={styles.emojiContainer}>{emoji2}</span>
						<span className={styles.emojiContainer}>{emoji3}</span>
					</div>
					<Button className="p-3 text-white bg-green-700"
						onClick={createRoom}>Create</Button>
				</div>
			}
			{gameState === GAME_STATES.PLAYING && <TetrisGame socket={socket} />}
		</div>
    );
};

export default Page;
