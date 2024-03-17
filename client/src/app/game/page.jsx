'use client'

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button.jsx';
import Picker from "emoji-picker-react";
import styles from './page.module.css';
import anime from 'animejs';
import { Accordion } from 'flowbite-react';

// TODO set waiting state
const GAME_STATES = {
	SETUP_NAME: 0,
	GAME_LIST: 1,
	CREATE: 2,
};

const Page = () => {
    const [gameState, setGameState] = useState(GAME_STATES.SETUP_NAME);
	const [nickname, setNickname] = useState('');
	const [gameList, setGameList] = useState([]);
	const [gameListLoading, setGameListLoading] = useState(false);
	const [nameEmoji, setNameEmoji] = useState('🙂');
	const [emoji1, setEmoji1] = useState('🐥');
	const [emoji2, setEmoji2] = useState('🐥');
	const [emoji3, setEmoji3] = useState('🐥');
	const router = useRouter();

	const wrapperElemRef = useRef(null);

	function animeAppear() {
		if (!wrapperElemRef.current) return;
		anime({
			targets: wrapperElemRef.current,
			opacity: [0, 1],
			duration: 400,
			translateX: [-150, 0],
			easing: 'easeInOutQuad',
		});
	}

	function updateState(state) {
		setGameState(state);
		animeAppear();
	}

	async function fetchGameList() {
		setGameListLoading(true);

		const response = await fetch(`http://localhost:3000/api/game_list`);
		const data = await response.json().then((data) => {
			setTimeout(() => {
				setGameListLoading(false);
			}, 200);
			return data;
		});
		setGameList(data);
	}

	useEffect(() => {
		animeAppear();
	}, [])

	async function joinRoom(roomId){
		try {
			const response = await fetch('http://localhost:3000/api/join_room', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ roomId }),
			});
		
			if (!response.ok) {
				// throw new Error(response.message);
				// TODO join room error
				return;
			}
		
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

			if (!response.ok) {
				// throw new Error(response.message);
				// TODO
				return ;
			}

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

	function onEmojiClick(event, emojiObject) {
		setNameEmoji(event.emoji);
	}

    return (
		<div ref={wrapperElemRef} className="w-full h-full flex justify-center items-center">

			{gameState === GAME_STATES.SETUP_NAME && 
			<div className="flex flex-col gap-1 justify-center items-center p-12">
				<div className='flex flex-col gap-1 justify-center items-center'>
					<span className={styles.nameEmojiContainer}>{nameEmoji}</span>

					<Accordion className='border-none hover:bg-none' collapseAll>
						<Accordion.Panel className={styles.accordion}>
							<Accordion.Title className={styles.accordion}>Pick My Emoji</Accordion.Title>
							<Accordion.Content>
								<Picker
									onEmojiClick={onEmojiClick} 
									searchDisabled={true}
									reactionsDefaultOpen={true}
									height={400}
									native
								/>
							</Accordion.Content>
						</Accordion.Panel>
					</Accordion>

					<input 
						type="text" 
						placeholder="Type your nickname"
						value={nickname} 
						onChange={(e) => setNickname(e.target.value)}
						className="h-8 border-2 focus:border-fuchsia-200"
					/>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => {
						// fetch game list here
						if (!nickname?.length) return;
						fetchGameList();
						setGameListLoading(true);
						updateState(GAME_STATES.GAME_LIST);
					}}
						className="p-3 text-white hover:translate-x-1"					
					>&gt; Next </Button>
				</div>
			</div>}
			{gameState === GAME_STATES.GAME_LIST &&
			<div className="flex flex-col gap-2 relative pt-10 p-16 border-2 w-80 justify-center items-center">
				<div className="absolute top-0 right-0 h-10 flex justify-center gap-1 items-center">
					<Button className="p-2 opacity-75 hover:opacity-100 duration-75" onClick={() => fetchGameList()}>
						<img className="w-4 h-4" src="icons/refresh.svg" alt="refresh" />
					</Button>
					<Button className="p-2 opacity-75 hover:opacity-100 duration-75"
						onClick={() => {
							updateState(GAME_STATES.CREATE)
					}}>
						<img className="w-6 h-6" src="icons/add.svg" alt="create" />
					</Button>
				</div>
				<div className="mt-6">
					{gameListLoading ? (
						<p className='text-white'>Loading...</p>
					) : gameList.length === 0 ? (
						<p className='text-white'>No game available</p>
					) : (
						gameList.map((game, idx) => {
						return (
							<div key={idx} className="flex gap-2">
							<Button onClick={() => {
									joinRoom(game.id);
									router.push(`/game/${game.id}`);
									updateState(GAME_STATES.JOINING);
								}}
								className="p-3 text-white bg-blue-700"  
							>Join</Button>
							</div>
						);
						})
					)}
				</div>
			</div>
			}
			{gameState === GAME_STATES.CREATE &&
				<div className="flex flex-col gap-2 justify-center items-center">
					<div className="flex gap-4 items-center justify-center bg-white p-4 rounded-md">
						{/* <div className='flex gap-1'>
							<Picker onEmojiSelect={console.log} />
						</div> */}
						<span className={styles.emojiContainer}>{emoji1}</span>
						<span className={styles.emojiContainer}>{emoji2}</span>
						<span className={styles.emojiContainer}>{emoji3}</span>
					</div>
					<div className='flex gap-1'>
						<Button className="p-3 text-white"
							onClick={createRoom}>Create</Button>
						<Button className="p-3 text-white"
							onClick={() => updateState(GAME_STATES.GAME_LIST)}>Back</Button>
					</div>

				</div>
			}
		</div>
    );
};

export default Page;
