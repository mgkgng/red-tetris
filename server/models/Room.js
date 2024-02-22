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

    addPlayer(player) {
        this.players.set(socket.id, player);
        this.joinedPlayer.push(socket.id);
        if (!host) this.host = socket.id;
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