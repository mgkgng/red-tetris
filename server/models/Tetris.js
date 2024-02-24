import { Tetromino } from './Tetromino.js';
import { BOARD_ROWS, BOARD_COLS } from '../constants.js';

const FIX_OFFSET = 8;

export class Tetris {
	constructor(series) {
		this.rows = BOARD_ROWS;
		this.cols = BOARD_COLS;
		this.grid = this.initializeGrid(this.rows, this.cols);
		this.pieceIndex = 0;
		this.pieceSeries = series;
		this.currentPiece = this.getPieceAtIndex(this.pieceIndex)
		this.nextPiece = this.getPieceAtIndex(this.pieceIndex + 1)
		this.currentPos = { row: -1, col: Math.floor(BOARD_COLS / 2) };  
		this.piecesListSeed = 0;
		this.dropInterval = 1000;
		this.intervalId = null;
		this.gameOver = false;
		this.controlDisabled = false;
		this.accelerating = false;
	}

	getPieceAtIndex(index) {
		return new Tetromino(this.pieceSeries[(index % this.pieceSeries.length + Math.floor(index / this.pieceSeries.length)) % 7]);
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

    gameLoop() {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
            if (!this.moveDown()) {
                this.fixPiece();
                let fullRows = this.clearFullRows();
                if (fullRows.length > 0) {
                    this.afterClearRows(fullRows);
                    return;
                }
                this.gameBoard.updatePiece();
                this.socket?.emit('nextPiece', this.gameBoard.nextPiece.shape);
                if (this.gameBoard.checkGameOver()) {
                    this.socket && this.socket.emit('gameOver');
                    return;
                }
            }
        this.sendGameState();
        }, this.gameBoard.dropInterval);
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

	placeCurrentPieceOnGrid() {
		if (!this.currentPiece) return;

		const { row, col } = this.currentPos;
		const positions = this.currentPiece.getEntirePosition(row, col);
		positions.forEach(([r, c]) => { this.grid[r][c] = this.currentPiece.shape; });
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
		positions.forEach(([r, c]) => { this.grid[r][c] = FIX_OFFSET + this.currentPiece.shape; });
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
