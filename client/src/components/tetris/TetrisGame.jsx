'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { TETRIS_COLS, TETRIS_ROWS } from '@/constants.js';
import PlayerList from '../PlayerList.jsx';

const MALUS = 255;

const BLOCK_COLORS = {
	0: 'bg-transparent',
	1: 'bg-cyan-300',
	2: 'bg-blue-600',
	3: 'bg-orange-500',
	4: 'bg-yellow-300',
	5: 'bg-green-400',
	6: 'bg-purple-600',
	7: 'bg-red-600',
};

function createEmptyGrid() { return Array.from({ length: TETRIS_ROWS }, () => new Array(TETRIS_COLS).fill(0)); }

const TetrisGame = ({ socket, players, setPlayers, hostId, setHostId, scores, setScores, gameStarted, setGameStarted }) => {
	const [myGrid, setMyGrid] = useState(createEmptyGrid());
	const [othersGrid, setOthersGrid] = useState(initOthersGrid());
	const [gameOverSet, setGameOverSet] = useState(new Set());

	const acceleratingRef = useRef(false);

	function initGame() {
		setGameStarted(true);
		setGameOverSet(new Set());
		setMyGrid(createEmptyGrid());
		setScores(() => new Map(players.map(player => [player.id, 0])));
		initOthersGrid();
	}

	function initOthersGrid() {
		const newMap = new Map();
		players.forEach(player => {
			newMap.set(player.id, createEmptyGrid());
		});
		return newMap;
	}

	function updateOthersGrid(id, grid) {
		setOthersGrid(prev => {
			const newMap = new Map(prev);
			newMap.set(id, grid);
			return newMap;
		})
	}

	function addNewOtherGrid(id) {
		setOthersGrid(prev => {
			const newMap = new Map(prev);
			newMap.set(id, createEmptyGrid());
			return newMap;
		})
	}

	function deleteFromOtherGrid(id) {
		setOthersGrid(prev => {
			const newMap = new Map(prev);
			newMap.delete(id);
			return newMap;
		})
	}

	useEffect(() => {
		if (!socket) return;

		socket.on('gameStarted', () => {
			initGame();
		})

		socket.on('gameStateUpdate', (data) => {
			if (data.id === socket.id) {
				setMyGrid(data.grid);
			} else {
				updateOthersGrid(data.id, data.grid);
			}
		})

		socket.on('gameOver', (data) => {
			console.log('gameOver', data);
			setGameOverSet(prev => new Set([...prev, data]));
		})

		socket.on('rowsCleared', (data) => {
			console.log('rowsCleared', data);
		})

		socket.on('playerJoined', (data) => {
            setPlayers(prev => [...prev, data]);
			setScores(prev => new Map(prev.set(data.id, 0)));
			if (data.id === socket.id)
				return;
			addNewOtherGrid(data.id);
		});

		socket.on('playerLeft', (data) => {
            setPlayers(prev => prev.filter(player => player.id !== data.id));
			setScores(prev => {
				const newMap = new Map(prev);
				newMap.delete(data.id);
				return newMap;
			});
			deleteFromOtherGrid(data.id);
		});

		return () => {
			socket.off('gameStarted');
			socket.off('gameStateUpdate');
			socket.off('gameOver');
			socket.off('rowsCleared');
			socket.off('playerJoined');
			socket.off('playerLeft');
		};
	}, [socket, players, scores, othersGrid, myGrid]);

	function handleKeyPress(e) {
		if (!gameStarted) return;

		if (e.key === "ArrowLeft") {
			socket.emit('moveBlock', { left: true });
		} else if (e.key === "ArrowRight") {
			socket.emit('moveBlock', { left: false });
		} else if (e.key === "ArrowUp") {
			socket.emit('rotateBlock');
		} else if (e.key === "ArrowDown") {
			if (acceleratingRef.current) return;
			socket.emit('startAccelerate');
			acceleratingRef.current = true;
		} else if (e.key === " ") {
			socket.emit('hardDrop');
		}
	}

	function handleKeyUp(e) {
		if (e.key === "ArrowDown") {
			if (!acceleratingRef.current) return;
			socket?.emit('stopAccelerate');
			acceleratingRef.current = false;
		}
	}

	useEffect(() => {
		if (!socket) return;
		window.addEventListener('keydown', handleKeyPress);
		window.addEventListener('keyup', handleKeyUp)
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [socket, gameStarted]);

  return (
	<>
		<PlayerList players={players} hostId={hostId} socketId={socket?.id} gameOverSet={gameOverSet}/>
		<div className="m-3 relative p-12 pt-16">
			{/* Game Header */}
			<div className="absolute w-full top-0 left-0 text-white h-12 flex justify-between items-center border-sm gap-2">
				<div className='flex h-8 w-3/5 justify-between items-center border-2 border-white rounded-sm px-2'>
					<p>Score:</p>
					<p>{scores.get(socket?.id)}</p>
				</div>
				{!gameStarted && hostId === socket?.id &&
				<button onClick={() => socket?.emit('startGame')}
					className="text-black bg-white hover:bg-gray-300 px-3 duration-150"
				>start</button>
				}
			</div>
			{/* Game Body */}
			<div className={styles.tetrisGrid}>
				{myGrid.map((row, rowIndex) => (
					<div key={rowIndex} className={styles.row}>
					{row.map((cell, cellIndex) => (
						<div
							key={cellIndex}
							className={`${
								!gameOverSet.has(socket?.id)
									? cell === MALUS
										? 'bg-stone-500' 
										: `${BLOCK_COLORS[cell % 8]}`
									: cell
										? 'bg-gray-400'
										: 'bg-white'
							  } ${styles.cell}`}
						></div>
					))}
					</div>
				))}
			</div>
			
		</div>
		<div className={styles.othersGameGrid}>
			{Array.from(othersGrid.entries()).map(([playerId, grid], index) => (
			<div className={styles.othersTetrisWrapper} key={playerId}>
				<div className={styles.othersTetrisGrid}>
					{grid.map((row, rowIndex) => (
					<div key={rowIndex} className={styles.othersRow}>
						{row.map((cell, cellIndex) => (
						<div
							key={cellIndex}
							className={`${
								!gameOverSet.has(playerId)
									? cell === MALUS
										? 'bg-stone-500' 
										: `${BLOCK_COLORS[cell % 8]}`
									: cell
										? 'bg-gray-400'
										: 'bg-white'
							  } ${styles.cell}`}
						></div>
						))}
					</div>
					))}
				</div>d
			</div>
			))}
		</div>
		

	</>
  );
}

export default TetrisGame;
