import { TetrisFrames, StartingLevelPerDifficulty } from '../constants.js';
import { scoreManager } from './ScoreManager.js';

export const LINES_TO_LEVEL_UP = 10;

export class Room {
    constructor(uid, emoji, difficulty='easy') {
        this.emoji = emoji;
        this.difficulty = difficulty;
        this.level = StartingLevelPerDifficulty[difficulty];
        this.playing = false;
        this.players = new Map();
        this.joinedPlayer = [];
        this.host = null;
        this.uid = uid;
        this.clearedLines = 0;
    }

    broadcast(event, data) {
        for (let player of this.players.values())
            player.socket.connected && player.socket.emit(event, data);
    }

    addPlayer(socketId, player) {
        this.players.set(socketId, player);
        this.joinedPlayer.push(socketId);
        if (!this.host) {
            this.host = socketId;

            player.socket.emit('updateHost', { name: player.nickname, id: socketId});
        }
        player.initTetris(this.series);
    }

    startGame() {
        if (this.playing) return;

        this.playing = true;
        this.broadcast('gameStarted');

        this.series = this.generateTetrominoSeries();
        for (let player of this.players.values()) {
            player.score = 0;
            player.game.initialize(this.series, this.level);
        }

        for (let player of this.players.values())
            player.startGameLoop(this);
    }

    addMalusToPlayers(rowsNb, socketId) {
        for (let player of this.players.values()) {
            if (player.socket.id === socketId) continue;
            const res = player.game.addMalus(rowsNb);
            player.sendGameState();
            if (!res) {
                this.broadcast('gameOver', player.socket.id);
                this.checkGameEnd();
            }
        }
    }

    removePlayer(socketId) {
        const player = this.players.get(socketId);
        clearInterval(player.game.intervalId);
        player.game.gameOver = true;
        this.broadcast('gameOver', player.socket.id);
        this.checkGameEnd();

        this.players.delete(socketId);
        if (this.players.size === 0)
            return false;
        this.joinedPlayer = this.joinedPlayer.filter(id => id !== socketId);
        if (this.host === socketId) {
            this.host = this.joinedPlayer[0];
            this.broadcast('updateHost', { id: this.host });
        }
        return true;
    }

    checkGameEnd() {
        let playersAlive = [...this.players.values()].filter(player => !player.game.gameOver);
        if (playersAlive.length < 2) {
            if (playersAlive.length === 1) {
                clearInterval(playersAlive[0].game.intervalId);
                scoreManager.addScore(playersAlive[0]);
            }
            this.playing = false;

            this.broadcast('gameEnd', {
                winner: playersAlive.length ? playersAlive[0].socket.id : null
            });
        }
    }

    afterClearLines(linesNb) {
        this.clearedLines += linesNb;
        if (this.clearedLines < LINES_TO_LEVEL_UP * this.players.size) return;
        this.clearedLines -= LINES_TO_LEVEL_UP * this.players.size;
        this.level++;
        for (let player of this.players.values()) {
            player.game.dropInterval = (this.level < TetrisFrames.length ? TetrisFrames[this.level] : 1) * 1000 / 60
            player.startGameLoop();
        }
        this.broadcast('levelUp', this.level);
    }

    generateTetrominoSeries() {
        return Array.from({length: 256}, () => Math.floor(Math.random() * 7 + 1)).join('');
    }
}
