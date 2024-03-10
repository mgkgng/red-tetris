import { Tetromino } from './Tetromino.js';
import { BOARD_ROWS, BOARD_COLS } from '../constants.js';

const FIX_OFFSET = 8;
const MALUS = 255;

export class Tetris {
	constructor() {
		this.rows = BOARD_ROWS;
		this.cols = BOARD_COLS;
		this.currentPos = { row: -1, col: Math.floor(BOARD_COLS / 2) };
	}

	getPieceAtIndex(index) {
		return new Tetromino(this.pieceSeries[(index % this.pieceSeries.length + Math.floor(index / this.pieceSeries.length)) % 7]);
	}

	initialize(series) {
		this.intervalId = null;
		this.pieceSeries = series;
		this.grid = this.initializeGrid(this.rows, this.cols);
		this.pieceIndex = 0;
		this.currentPiece = this.getPieceAtIndex(this.pieceIndex);
		this.nextPiece = this.getPieceAtIndex(this.pieceIndex + 1);
		this.currentPos = { row: -1, col: Math.floor(BOARD_COLS / 2) };
		this.gameOver = false;
		this.accelerating = false;
		this.dropInterval = 1000;
	}

	initializeGrid(rows, cols) {
		const grid = [];
		for (let r = 0; r < rows; r++) {
			const row = [];
			for (let c = 0; c < cols; c++) {
				row.push(0);
			}
			grid.push(row);
		}
		return grid;
	}

	clearFullRows() {
		let fullRows = [];
		this.grid.forEach((row, index) => {
			if (row.every(cell => cell !== 0)) {
				fullRows.push(index);
			}
		});
		const newGrid = this.grid.filter((_, index) => !fullRows.includes(index));

		for (let i = 0; i < fullRows.length; i++) {
			newGrid.unshift(new Array(this.cols).fill(0));
		}
		this.grid = newGrid;
		return fullRows;
	}

	addMalus(rowsNb) {	
		let newGrid = this.grid.slice(rowsNb);
		for (let i = 0; i < rowsNb; i++) {
			const malusRow = new Array(this.cols).fill(MALUS);
	
			const gapIndex = Math.floor(Math.random() * this.cols);
			malusRow[gapIndex] = 0;
	
			newGrid.push(malusRow);
		}
		this.grid = newGrid;
		this.currentPos.row -= rowsNb;

		if (this.checkGameOver()) {
			clearInterval(this.intervalId);
			this.gameOver = true;
			return false;
		}
		return true;
	}

	placeCurrentPieceOnGrid() {
		if (!this.currentPiece) return;

		const { row, col } = this.currentPos;
		const positions = this.currentPiece.getEntirePosition(row, col);
		positions.forEach(([r, c]) => {
			if (r < 0) return;
			this.grid[r][c] = this.currentPiece.shape;
		});
	}

	cleanCurrentPosition() {
		const { row, col } = this.currentPos;
		const positions = this.currentPiece.getEntirePosition(row, col);

		positions.forEach(([r, c]) => {
			if (r < 0) return;
			this.grid[r][c] = 0;
		});
	}

	isPositionValid(positions) {
		return positions.every(([r, c]) =>
			r < this.rows &&
			c >= 0 && c < this.cols &&
			(r < 0 || this.grid[r][c] < FIX_OFFSET));
	}
	
	fixPiece() {
		const { row, col } = this.currentPos;
		const positions = this.currentPiece.getEntirePosition(row, col);
		positions.forEach(([r, c]) => {
			if (r < 0) return;
			this.grid[r][c] = FIX_OFFSET + this.currentPiece.shape;
		});
		this.pieceIndex++;
	}

	updatePiece() {
		this.currentPiece = this.nextPiece;
		this.nextPiece = this.getPieceAtIndex(this.pieceIndex);
		this.currentPos = { row: -1, col: Math.floor(this.cols / 2) };
	}

	checkGameOver() {
		if (this.grid[0].some(cell => cell >= FIX_OFFSET)) {
			clearInterval(this.intervalId);
			this.gameOver = true;
			return true;
		}
		return false;
	}
}
