'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { TETRIS_BLOCK_SIZE, TETRIS_COLS, TETRIS_ROWS, SHAPES, TETRIS_SHAPES } from '@/constants.js';
import Button from '@/components/Button.jsx';
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

const TetrisGame = ({ socket, players, setPlayers, hostId, setHostId }) => {
	const [myGrid, setMyGrid] = useState(createEmptyGrid());
	const [othersGrid, setOthersGrid] = useState(initOthersGrid());
	const [gameOverSet, setGameOverSet] = useState(new Set());
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [gameResultMessage, setGameResultMessage] = useState('');	

	const acceleartingRef = useRef(false);

	function initGame() {
		setGameOverSet(new Set());
		setMyGrid(createEmptyGrid());
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

	const [gameStarted, setGameStarted] = useState(false);

	useEffect(() => {
		if (!socket) return;

		socket.on('gameStarted', (data) => {
			console.log('gameStarted', data);
			initGame();
			setGameStarted(true);
		})

		socket.on('gameStateUpdate', (data) => {
			if (data.id === socket.id) {
				setMyGrid(data.grid);
			} else {
				updateOthersGrid(data.id, data.grid);
			}
		})

		socket.on('nextPiece', (data) => {
			console.log('nextPiece', data);
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

		socket.on('playerJoined', (data) => {
            setPlayers(prev => [...prev, data]);
			if (data.id === socket.id)
				return;
			addNewOtherGrid(data.id);
		});

		socket.on('playerLeft', (data) => {
            setPlayers(prev => prev.filter(player => player.id !== data.id));
			
			if (!gameStarted)
				deleteFromOtherGrid(data.id);
			else
				console.log('playerLeft', data);
		});

		return () => {
			socket.off('startTetrisTest');
			socket.off('nextPiece');
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
		if (e.key === "ArrowLeft") {
			socket?.emit('moveBlock', { left: true });
		} else if (e.key === "ArrowRight") {
			socket?.emit('moveBlock', { left: false });
		} else if (e.key === "ArrowUp") {
			socket?.emit('rotateBlock');
		} else if (e.key === "ArrowDown") {
			if (acceleartingRef.current) return;
			socket?.emit('startAccelerate');
			acceleartingRef.current = true;
		} else if (e.key === " ") {
			socket?.emit('hardDrop');
		}
	}

	function handleKeyUp(e) {
		if (e.key === "ArrowDown") {
			if (!acceleartingRef.current) return;
			socket?.emit('stopAccelerate');
			acceleartingRef.current = false;
		}
	}

	useEffect(() => {
		if (!socket) return;
		window.addEventListener('keydown', handleKeyPress);
		window.addEventListener('keyup', handleKeyUp)
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, [socket]);

  return (
	<>
		<PlayerList players={players} hostId={hostId} socketId={socket?.id}/>
		<div className="myGame">
			<div className={styles.tetrisGrid}>
				{myGrid.map((row, rowIndex) => (
					<div key={rowIndex} className={styles.row}>
					{row.map((cell, cellIndex) => (
						<div
							key={cellIndex}
							className={`${styles.cell}  ${cell ? 'filled' : ''}`}
							style={
								(!gameOverSet.has(socket?.id)) 
								? { backgroundColor: cell == MALUS ? 'rgb(200, 48, 6)' : BLOCK_COLORS[cell % 8] }
								: (cell) 
								? { backgroundColor: 'rgba(156, 156, 156)' }
								: { backgroundColor: 'rgba(64, 64, 64)' }
							}
						></div>
					))}
					</div>
				))}
			</div>
			{!gameStarted && hostId === socket?.id &&
			<Button onClick={() => socket?.emit('startGame')}
				className="p-3 text-white bg-red-700"
			>start game</Button>
			}
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
								: { backgroundColor: 'rgba(64, 64, 64)' }
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
