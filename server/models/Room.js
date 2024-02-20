import { Player } from "./Player.js";

export class Room {
    constructor(uid) {
        this.series = this.generateTetrominoSeries();
        this.player1 = null;
        this.player2 = null;
        this.uid = uid;
        this.level = 1; // TODO bonus
    }

    broadcast(event, data) {
        this.player1.socket.emit(event, data);
        this.player2.socket.emit(event, data);
    }

    isFree() {
        return !this.player1 || !this.player2;
    }

    addPlayer1(socket, name) {
        this.tetris.set(socket.id, new Tetris(this.series));
        this.player1 = new Player(socket, name);
    }

    addPlayer2(socket, name) {
        this.tetris.set(socket.id, new Tetris(this.series));
        this.player2 = new Player(socket, name);
    }

    startGame() {
        this.broadcast('gameStarted', {
            pieces: [
                this.player1.gameBoard.currentPiece.shape,
                this.player1.gameBoard.nextPiece.shape
            ]
        });
        this.player1.gameLoop();
        this.player2.gameLoop();
    }

    removePlayer(player) {
        this.tetris.delete(player.socket.id);
        if (player.id === this.player1.id) {
            this.player2.socket.emit('roomDestroyed');
            return false;
        } else {
            this.player2 = null;
            this.player1.socket.emit('playerLeft');
            return true;
        }
    }

    hasPlayer(socketId) {
        return this.player1?.socket.id === socketId || this.player2?.socket.id === socketId;
    }

    generateTetrominoSeries() {
        return Array.from({length: 256}, () => Math.floor(Math.random() * 7) + 1).join('');
    }
}