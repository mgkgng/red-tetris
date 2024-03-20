'use client'

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import anime from 'animejs';
import EmojiAccordeon from '@/components/EmojiAccordeon';

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
	const [roomEmoji, setRoomEmoji] = useState('🐥');
	const [level, setLevel] = useState('easy');

	const router = useRouter();

	const wrapperElemRef = useRef(null);

    function handleChange(event) {
        setLevel(event.target.value);
    };

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

		console.log('game list: ', data);
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
			localStorage.setItem('emoji', nameEmoji);
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
				body: JSON.stringify({ 
					emoji: roomEmoji,
					difficulty: level,
				}),
			});

			if (!response.ok) {
				// throw new Error(response.message);
				// TODO modal
				return ;
			}

			const data = await response.json();
			console.log(data);

			localStorage.setItem('nickname', nickname);
			localStorage.setItem('emoji', nameEmoji);
			router.push(`/game/${data.roomId}`);
		} catch (e) {
			console.error(e);
			throw error;
		}
	}

    return (
		<div ref={wrapperElemRef} className="w-full h-full flex justify-center items-center">

			{gameState === GAME_STATES.SETUP_NAME && 
			<div className="flex flex-col gap-1 justify-center items-center p-12">
				<div className='flex flex-col gap-1 justify-center items-center'>
					<span className={styles.nameEmojiContainer}>{nameEmoji}</span>
					<EmojiAccordeon onEmojiClick={(event) => setNameEmoji(event.emoji)} />
					<input 
						type="text" 
						placeholder="Type your nickname"
						value={nickname} 
						onChange={(e) => setNickname(e.target.value)}
						className="h-8 border-2 focus:border-fuchsia-200"
					/>
				</div>
				<div className="flex gap-2">
					<button onClick={() => {
						// fetch game list here
						if (!nickname?.length) return;
						fetchGameList();
						setGameListLoading(true);
						updateState(GAME_STATES.GAME_LIST);
					}}
						className="p-3 text-white hover:translate-x-1"					
					>&gt; Next </button>
				</div>
			</div>}
			{gameState === GAME_STATES.GAME_LIST &&
			<div className="flex flex-col gap-2 relative pt-10 border-2 w-96 justify-center items-center">
				<div className="absolute top-0 right-0 h-10 flex justify-center gap-1 items-center">
					<button className="p-2 opacity-75 hover:opacity-100 duration-75" onClick={() => fetchGameList()}>
						<img className="w-4 h-4" src="icons/refresh.svg" alt="refresh" />
					</button>
					<button className="p-2 opacity-75 hover:opacity-100 duration-75"
						onClick={() => {
							updateState(GAME_STATES.CREATE)
					}}>
						<img className="w-6 h-6" src="icons/add.svg" alt="create" />
					</button>
				</div>
				<div className="mt-6 grid grid-cols-3 gap-1">
					{gameListLoading ? (
						<p className='text-white'>Loading...</p>
					) : gameList.length === 0 ? (
						<p className='text-white'>No game available</p>
					) : (
						gameList.map((game, idx) => {
						return (
							<div key={idx} className="flex flex-col gap-2 px-10 border-2 p-4 justify-center items-center text-white">
								<span className="text-6xl">{game.emoji}</span>
								<div className="flex gap-2 justify-center items-center">
									<p className="text-lg">{game.difficulty}</p>
									<p className="text-sm text-black bg-white px-2 rounded-sm">{game.playersCount}</p>
								</div>
								{/* <span className="text-white">{game.playersCount}</span> */}
								<button onClick={() => {
										joinRoom(game.id);
										router.push(`/game/${game.id}`);
										updateState(GAME_STATES.JOINING);
									}}
									className="border-2 px-2 rounded-sm hover:bg-white hover:text-black duration-100"  
								>join</button>
							</div>
						);
						})
					)}
				</div>
			</div>
			}
			{gameState === GAME_STATES.CREATE &&
				<div className="flex flex-col gap-2 justify-center items-center">
					<span className={styles.emojiContainer}>{roomEmoji}</span>
					<EmojiAccordeon onEmojiClick={(event) => setRoomEmoji(event.emoji)} />
					<div className="flex justify-center items-center gap-2">
						<div className={styles.radioGroup}>
							<input
								type="radio"
								id="easy"
								name="level"
								value="easy"
								checked={level === 'easy'}
								onChange={handleChange}
								className={styles.hiddenRadio}
							/>
							<label htmlFor="easy" className={`${styles.button} ${level === 'easy' ? styles.selected : ''}`}>Easy</label>
							
							<input
								type="radio"
								id="medium"
								name="level"
								value="medium"
								checked={level === 'medium'}
								onChange={handleChange}
								className={styles.hiddenRadio}
							/>
							<label htmlFor="medium" className={`${styles.button} ${level === 'medium' ? styles.selected : ''}`}>Medium</label>
							
							<input
								type="radio"
								id="hard"
								name="level"
								value="hard"
								checked={level === 'hard'}
								onChange={handleChange}
								className={styles.hiddenRadio}
							/>
							<label htmlFor="hard" className={`${styles.button} ${level === 'hard' ? styles.selected : ''}`}>Hard</label>
						</div>

					</div>
					<div className='flex gap-1'>
						<button className="p-3 text-white hover:translate-x-1"
							onClick={createRoom}>Create</button>
						<button className="p-3 text-white hover:translate-x-1"
							onClick={() => updateState(GAME_STATES.GAME_LIST)}>Back</button>
					</div>

				</div>
			}
		</div>
    );
};

export default Page;
