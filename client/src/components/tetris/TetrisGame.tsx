'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './page.module.css';
import { TETRIS_BLOCK_SIZE, TETRIS_COLS, TETRIS_ROWS, SHAPES, TETRIS_SHAPES } from '@/constants';
import { useSocket } from '@/context/SocketContext';

const BLOCK_COLORS: { [key: number]: string } = {
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
	const [grid, setGrid] = useState<number[][]>(Array.from({ length: TETRIS_ROWS }, () => new Array(TETRIS_COLS).fill(0)));
	const acceleartingRef = useRef(false);
	const updateGrid = useCallback((newGridData) => {
		setGrid(newGridData);
	}, []);

	// Websocket event listeners
	useEffect(() => {
		if (!socket) return;

		socket.emit('startTetris', { message: "hello server" });

		socket.on('gameState', (data) => {
			// console.log('grid received', data);
			updateGrid(data);
		})

		socket.on('nextPiece', (data) => {
			console.log('nextPiece', data);
		})

		socket.on('gameOver', (data) => {
			console.log('gameOver', data);
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
	}, []);

	function handleKeyPress(e) {
		if (e.key === "ArrowLeft") {
			// setCurrentBlock(prev => ({ ...prev, col: prev.col - 1 }));
			socket?.emit('moveBlock', { left: true });
		} else if (e.key === "ArrowRight") {
			// setCurrentBlock(prev => ({ ...prev, col: prev.col + 1 }));
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
		window.addEventListener('keydown', handleKeyPress);
		window.addEventListener('keyup', handleKeyUp)
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, []);

  return (
	<table >
		<tbody className={styles.tetrisGrid}>
		{grid.map((row, rowIndex) => (
			<tr key={rowIndex} className={styles.row}>
			{row.map((cell, cellIndex) => (
				<td
					key={cellIndex}
					className={`${styles.cell}  ${cell ? 'filled' : ''}`}
					style={{ backgroundColor: BLOCK_COLORS[cell % 8] }}
				></td>
			))}
			</tr>
		))}
		</tbody>
	</table>
  );
}

export default TetrisGame;
