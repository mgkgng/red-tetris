import { TETROMINO_CODES, TetrisScores } from '../constants.js';
import { Tetris } from './Tetris.js';

export class Player {
    constructor(socket, name, roomId) {
        this.socket = socket;
        this.name = name;
        this.score = 0;
        this.game = null;
        this.roomId = roomId;
        this.room = null;
        this.score = 0;
        this.playing = false; // TODO protection from the back
    }

    initTetris(series) {
        this.game = new Tetris(series);
    }

    sendGameState() {
        this.room && this.room.broadcast('gameStateUpdate', {
            id: this.socket.id,
            grid: this.game.grid
        });
    }

    startGameLoop(room=null) {
        if (!this.room)
            this.room = room;
        clearInterval(this.game.intervalId);
        this.game.intervalId = setInterval(() => {
            let shouldSend = true;
            if (!this.moveDown())
                shouldSend = this.afterDropped();
            shouldSend && this.sendGameState();
        }, this.game.dropInterval);
    }

    moveDown() {
        if (this.game.gameOver) return false;

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
        if (this.game.gameOver) return false;

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
        if (this.game.gameOver) return false;

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

    updateScore(linesNb) {
        console.log('test', linesNb, TetrisScores[linesNb])
        this.score += TetrisScores[linesNb];
        this.socket.emit('scoreUpdate', this.score);
    }

    afterDropped() {
        this.game.fixPiece();
        let fullRows = this.game.clearFullRows();
        if (fullRows.length > 0) {
            this.sendGameState();
            console.log('check', this.room.players.size, this.room.players.size == 1)
            if (this.room.players.size == 1)
                this.updateScore(fullRows.length);
            this.game.currentPos = { row: 0, col: 3 };
            this.room.addMalusToPlayers(fullRows.length, this.socket.id);
            this.room.afterClearLines(fullRows.length);
            return false;
        }
        this.game.updatePiece();
        this.socket?.emit('nextPiece', this.game.nextPiece.shape);
        if (this.game.checkGameOver()) {
            this.sendGameState();
            this.room.broadcast('gameOver', this.socket.id);
            this.room.checkGameEnd();
            return false;
        }
        return true;
    }

    hardDrop() {
        if (this.game.gameOver) return false;

        while (this.moveDown());
        return this.afterDropped();
    }
}
