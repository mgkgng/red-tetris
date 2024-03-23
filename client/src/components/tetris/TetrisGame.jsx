'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { TETRIS_COLS, TETRIS_ROWS } from '@/constants.js';
import PlayerList from '../PlayerList.jsx';

const MALUS = 255;

const BLOCK_COLORS = {
	0: 'transparent',
	1: 'cyan',
	2: 'blue',
	3: 'orange',
	4: 'yellow',
	5: 'green',
	6: 'purple',
	7: 'red',
};

function createEmptyGrid() { return Array.from({ length: TETRIS_ROWS }, () => new Array(TETRIS_COLS).fill(0)); }

const TetrisGame = ({ socket, players, setPlayers, hostId, setHostId, scores, setScores }) => {
	const [myGrid, setMyGrid] = useState(createEmptyGrid());
	const [othersGrid, setOthersGrid] = useState(initOthersGrid());
	const [gameStarted, setGameStarted] = useState(false);
	const [gameOverSet, setGameOverSet] = useState(new Set());
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [gameResultMessage, setGameResultMessage] = useState('');	

	const acceleratingRef = useRef(false);

	function initGame() {
		setGameStarted(true);
		setGameOverSet(new Set());
		setMyGrid(createEmptyGrid());
		setScores(prev => {
			const newMap = new Map(prev);
			players.forEach(player => newMap.set(player.id, 0));
			return newMap;
		})
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

		socket.on('gameStarted', (data) => {
			console.log('gameStarted', data);
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

		socket.on('gameEnd', ({winner}) => {
			console.log('gameEnd', winner);
			setGameStarted(false);
		})

		socket.on('rowsCleared', (data) => {
			console.log('rowsCleared', data);
		})

		socket.on('updateHost', (data) => {
            console.log('updateHost', data);
            setHostId(data.id);
        });

		socket.on('levelUp', (data) => {
			console.log('levelUp', data);
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
			if (!gameStarted)
				deleteFromOtherGrid(data.id);
			else
				console.log('playerLeft', data);
		});

		return () => {
			socket.off('startTetrisTest');
			socket.off('gameState');
			socket.off('gameOver');
			socket.off('gameEnd');
			socket.off('rowsCleared');
			socket.off('playerJoined');
			socket.off('playerLeft');
			socket.off('updateHost');
		};
	}, [socket]);

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
		<PlayerList players={players} hostId={hostId} socketId={socket?.id}/>
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
							className={styles.cell}
							style={
								(!gameOverSet.has(socket?.id)) 
								? { backgroundColor: cell == MALUS ? 'rgb(200, 48, 6)' : BLOCK_COLORS[cell % 8] }
								: (cell) 
								? { backgroundColor: 'rgba(156, 156, 156)' }
								: { backgroundColor: 'rgba(255, 255, 255)' }
							}
						></div>
					))}
					</div>
				))}
			</div>
			
		</div>
		<div className="othersGame flex gap-2">
			{Array.from(othersGrid.entries()).map(([playerId, grid], index) => (
			<div key={playerId}>
				<div className={styles.othersTetrisGrid}>
					{grid.map((row, rowIndex) => (
					<div key={rowIndex} className={styles.othersRow}>
						{row.map((cell, cellIndex) => (
						<div
							key={cellIndex}
							className={`${styles.cell} ${cell ? 'filled' : ''}`}
							style={
								(!gameOverSet.has(playerId)) 
								? { backgroundColor: cell == MALUS ? 'rgb(200, 48, 6)' : BLOCK_COLORS[cell % 8] }
								: (cell) 
								? { backgroundColor: 'rgba(156, 156, 156)' }
								: { backgroundColor: 'rgba(164, 164, 164)' }
							}
						></div>
						))}
					</div>
					))}
				</div>
			</div>
			))}
		</div>
		

	</>
  );
}

export default TetrisGame;
