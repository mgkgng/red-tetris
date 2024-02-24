'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { TETRIS_BLOCK_SIZE, TETRIS_COLS, TETRIS_ROWS, SHAPES, TETRIS_SHAPES } from '@/constants.js';
import { useSocket } from '@/contexts/SocketContext';
import Button from '@/components/Button.jsx';

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

const TetrisGame = ({ socket }) => {
	const [grid, setGrid] = useState(Array.from({ length: TETRIS_ROWS }, () => new Array(TETRIS_COLS).fill(0)));
	const acceleartingRef = useRef(false);
	const updateGrid = useCallback((newGridData) => {
		setGrid(newGridData);
	}, []);

	const [gameStarted, setGameStarted] = useState(false);

	useEffect(() => {
		if (!socket) return;

		socket.on('roomConnection', (data) => {
			console.log('roomConnection', data);
		
		})

		socket.on('gameStarted', (data) => {
			console.log('gameStarted', data);
			setGameStarted(true);
		})

		socket.on('updateHost', (data) => {
			console.log('updateHost', data);
		})

		socket.on('gameStateUpdate', (data) => {
			updateGrid(data);
		})

		socket.on('nextPiece', (data) => {
			console.log('nextPiece', data);
		})

		socket.on('gameOver', (data) => {
			console.log('gameOver', data);
		})

		socket.on('gameEnd', ({winner}) => {
			console.log('gameEnd', winner);
			setGameStarted(false);
		})

		socket.on('rowsCleared', (data) => {
			console.log('rowsCleared', data);
		})

		return () => {
			socket.off('startTetrisTest');
			socket.off('nextPiece');
			socket.off('gameState');
			socket.off('gameOver');
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
	<div>
		<div className={styles.tetrisGrid}>
			{grid.map((row, rowIndex) => (
				<div key={rowIndex} className={styles.row}>
				{row.map((cell, cellIndex) => (
					<div
						key={cellIndex}
						className={`${styles.cell}  ${cell ? 'filled' : ''}`}
						style={{ backgroundColor: BLOCK_COLORS[cell % 8] }}
					></div>
				))}
				</div>
			))}
		</div>
		{!gameStarted &&
		<Button onClick={() => socket?.emit('startGame')}
			className="p-3 text-white bg-red-700"
		>start game</Button>
		}
	</div>
  );
}

export default TetrisGame;
