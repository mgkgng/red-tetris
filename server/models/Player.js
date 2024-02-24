import { TETROMINO_CODES } from '../constants.js';
import { Tetris } from './Tetris.js';

export class Player {
    constructor(socket, name, roomId, pieceSeries) {
        this.socket = socket;
        this.name = name;
        this.score = 0;
        this.game = null;
        this.roomId = roomId;
        this.room = null;
    }

    initTetris(series) {
        this.game = new Tetris(series);
    }

    sendGameState() {
        this.room && this.room.broadcast('gameStateUpdate', this.game.grid);
    }

    startGameLoop(room=null) {
        if (!this.room)
            this.room = room;
        clearInterval(this.game.intervalId);
        this.game.intervalId = setInterval(() => {
            if (!this.moveDown()) {
                this.game.fixPiece();
                let fullRows = this.game.clearFullRows();
                if (fullRows.length > 0) {
                    this.afterClearRows(fullRows);
                    return;
                }
                this.game.updatePiece();
                this.socket?.emit('nextPiece', this.game.nextPiece.shape);
                if (this.game.checkGameOver()) {
                    this.room.broadcast('gameOver', this.socket.id);
                    this.room.checkGameEnd();
                    return;
                }
            }
            this.sendGameState();
        }, this.game.dropInterval);
    }

    afterClearRows(fullRows) {
        this.sendGameState();
        this.socket?.emit('rowsCleared', fullRows);
        this.game.controlDisabled = true;
        clearInterval(this.game.intervalId);
        setTimeout(() => {
            this.game.updatePiece();
            this.socket?.emit('nextPiece', this.game.nextPiece.shape);
            this.startGameLoop();
            this.game.controlDisabled = false;
        }, 500);
    }

    moveDown() {
        if (this.game.gameOver || this.game.controlDisabled) return false;

        const { row, col } = this.game.currentPos;
        const positions = this.game.currentPiece.getEntirePosition(row + 1, col);

        if (this.game.isPositionValid(positions)) {
            this.game.cleanCurrentPosition();
            this.game.currentPos.row++;
            positions.forEach(([r, c]) => {
                if (r < 0) return;
                this.game.grid[r][c] = this.game.currentPiece.shape;
            });
            return true;
        }
        return false;
    }

    moveSide(left) {
        if (this.game.gameOver || this.game.controlDisabled) return false;

        const { row, col } = this.game.currentPos;
        const positions = this.game.currentPiece.getEntirePosition(row, col + (left ? -1 : 1));

        if (this.game.isPositionValid(positions)) {
            this.game.cleanCurrentPosition();
            this.game.currentPos.col += left ? -1 : 1;
            positions.forEach(([r, c]) => {
                if (r < 0) return;
                this.game.grid[r][c] = this.game.currentPiece.shape;
            });
            return true;
        }
        return false;
    }

    rotate() {
        if (this.game.gameOver || this.game.controlDisabled) return false;

        if (this.game.currentPiece.shape === TETROMINO_CODES.O) return true;

        const { row, col } = this.game.currentPos;
        let rotatedPositions = this.game.currentPiece.getRotatedPosition(row, col);

        if (this.game.isPositionValid(rotatedPositions)) {
            this.game.cleanCurrentPosition();
            this.game.currentPiece.rotate = (this.game.currentPiece.rotate + 1) % 4;
            rotatedPositions.forEach(([r, c]) => {
                if (r < 0) return;
                this.game.grid[r][c] = this.game.currentPiece.shape;
            });
            return true;
        }

        const adjustments = [-1, 1];
        for (let i = 0; i < adjustments.length; i++) {
            const adjustedCol = col + adjustments[i];
            rotatedPositions = this.game.currentPiece.getRotatedPosition(row, adjustedCol);

            if (this.game.isPositionValid(rotatedPositions)) {
                this.game.cleanCurrentPosition();
                this.game.currentPos.col = adjustedCol;
                this.game.currentPiece.rotate = (this.game.currentPiece.rotate + 1) % 4;
                rotatedPositions.forEach(([r, c]) => {
                    if (r < 0) return;
                    this.game.grid[r][c] = this.game.currentPiece.shape;
                });
                return true;
            }
        }

        return false;
    }

    hardDrop() {
        if (this.game.gameOver || this.game.controlDisabled) return false;

        while (this.moveDown());
        this.game.fixPiece();
        let fullRows = this.game.clearFullRows();
        if (fullRows.length > 0) {
            this.afterClearRows(fullRows);
            return false;
        }
        this.game.updatePiece();
        this.socket?.emit('nextPiece', this.game.nextPiece.shape);
        if (this.game.checkGameOver()) {
            this.room.broadcast('gameOver', this.socket.id);
            this.room.checkGameEnd();
            return;
        }
        return true;
    }
}
