export class Room {
    constructor(uid) {
        this.series = this.generateTetrominoSeries();
        this.playing = false;
        this.players = new Map();
        this.joinedPlayer = [];
        this.host = null;
        this.uid = uid;
        this.level = 1; // TODO bonus
    }

    broadcast(event, data) {
        for (let player of this.players.values())
            player.socket.emit(event, data);
    }

    addPlayer(socketId, player) {
        this.players.set(socketId, player);
        this.joinedPlayer.push(socketId);
        if (!this.host) this.host = socketId;
        player.initTetris(this.series);
    }

    startGame() {
        this.broadcast('gameStarted', {
            pieces: [
                this.series[0],
                this.series[1]
            ]
        });
    }

    removePlayer(socketId) {
        this.players.delete(socketId);
        if (this.players.size() === 0)
            return false;
        this.joinedPlayer.shift();
        this.host = this.joinedPlayer[0];
        return true;
    }

    generateTetrominoSeries() {
        return Array.from({length: 256}, () => Math.floor(Math.random() * 7) + 1).join('');
    }
}