import { Board } from './Board.js';
import { TETRIS_ROWS, TETRIS_COLS, SHAPES } from '../constant.js';
export class Player {
    constructor(socket, name) {
        this.socket = socket;
        this.name = name;
        this.score = 0;
        this.gameBoard = new Board(TETRIS_COLS, TETRIS_ROWS);
    }

    gameLoop() {
        clearInterval(this.gameBoard.intervalId);
        this.gameBoard.intervalId = setInterval(() => {
            if (!this.moveDown()) {
                this.gameBoard.fixPiece();
                let fullRows = this.gameBoard.clearFullRows();
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

    /**
     *
     */
    afterClearRows(fullRows) {
        this.sendGameState();
        this.socket?.emit('rowsCleared', fullRows);
        this.gameBoard.controlDisabled = true;
        clearInterval(this.gameBoard.intervalId);
        setTimeout(() => {
            this.gameBoard.updatePiece();
            this.socket?.emit('nextPiece', this.gameBoard.nextPiece.shape);
            this.gameLoop();
            this.gameBoard.controlDisabled = false;
        }, 500);
    }

    /**
     * Move the current piece down
     * @returns {boolean} True if the piece has been moved, false otherwise
     */
    moveDown() {
        if (this.gameBoard.gameOver || this.gameBoard.controlDisabled) return false;

        const { row, col } = this.gameBoard.currentPos;
        const positions = this.gameBoard.currentPiece.getWholePosition(row + 1, col);

        if (this.gameBoard.isPositionValid(positions)) {
            this.gameBoard.cleanCurrentPosition();
            this.gameBoard.currentPos.row++;
            positions.forEach(([r, c]) => {
                if (r < 0) return;
                this.gameBoard.grid[r][c] = this.gameBoard.currentPiece.shape;
            });
            return true;
        }
        return false;
    }

    /**
     * Move the current piece to the left or to the right
     * @param {boolean} left - True if the piece has to be moved to the left, false otherwise
     * @returns {boolean} True if the piece has been moved, false otherwise
     */
    moveSide(left) {
        if (this.gameBoard.gameOver || this.gameBoard.controlDisabled) return false;

        const { row, col } = this.gameBoard.currentPos;
        const positions = this.gameBoard.currentPiece.getWholePosition(row, col + (left ? -1 : 1));

        if (this.gameBoard.isPositionValid(positions)) {
            this.gameBoard.cleanCurrentPosition();
            this.gameBoard.currentPos.col += left ? -1 : 1;
            positions.forEach(([r, c]) => {
                if (r < 0) return;
                this.gameBoard.grid[r][c] = this.gameBoard.currentPiece.shape;
            });
            return true;
        }
        return false;
    }

    /**
     * Rotate the current piece
     * @returns {boolean} True if the piece has been rotated, false otherwise
     */
    rotate() {
        if (this.gameBoard.gameOver || this.gameBoard.controlDisabled) return false;

        if (this.gameBoard.currentPiece.shape === SHAPES.O) return true;

        const { row, col } = this.gameBoard.currentPos;
        let rotatedPositions = this.gameBoard.currentPiece.getRotatedPosition(row, col);

        if (this.gameBoard.isPositionValid(rotatedPositions)) {
            this.gameBoard.cleanCurrentPosition();
            this.gameBoard.currentPiece.rotate = (this.gameBoard.currentPiece.rotate + 1) % 4;
            rotatedPositions.forEach(([r, c]) => {
                if (r < 0) return;
                this.gameBoard.grid[r][c] = this.gameBoard.currentPiece.shape;
            });
            return true;
        }

        const adjustments = [-1, 1];
        for (let i = 0; i < adjustments.length; i++) {
            const adjustedCol = col + adjustments[i];
            rotatedPositions = this.gameBoard.currentPiece.getRotatedPosition(row, adjustedCol);

            if (this.gameBoard.isPositionValid(rotatedPositions)) {
                this.gameBoard.cleanCurrentPosition();
                this.gameBoard.currentPos.col = adjustedCol;
                this.gameBoard.currentPiece.rotate = (this.gameBoard.currentPiece.rotate + 1) % 4;
                rotatedPositions.forEach(([r, c]) => {
                    if (r < 0) return;
                    this.gameBoard.grid[r][c] = this.gameBoard.currentPiece.shape;
                });
                return true;
            }
        }

        return false;
    }

    hardDrop() {
        if (this.gameBoard.gameOver || this.gameBoard.controlDisabled) return false;

        while (this.moveDown());
        this.gameBoard.fixPiece();
        let fullRows = this.gameBoard.clearFullRows();
        if (fullRows.length > 0) {
            this.afterClearRows(fullRows);
            return false;
        }
        this.gameBoard.updatePiece();
        this.socket?.emit('nextPiece', this.gameBoard.nextPiece.shape);
        if (this.gameBoard.checkGameOver()) {
            this.socket?.emit('gameOver');
            return;
        }
        return true;
    }
}
