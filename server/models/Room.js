export class Room {
    constructor(uid, titleEmojis) {
        this.titleEmojis = titleEmojis;
        this.series = this.generateTetrominoSeries();
        this.playing = false;
        this.players = new Map();
        this.joinedPlayer = [];
        this.host = null;
        this.uid = uid;
        this.level = 1; // TODO bonus
    }

    broadcast(event, data) {
        // TODO check if it's binded well when a player leaves
        for (let player of this.players.values()) {
            player.socket.connected && player.socket.emit(event, data);
        }
    }

    addPlayer(socketId, player) {
        console.log('adding player: ', socketId)
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
        this.broadcast('gameStarted', {
            pieces: [
                this.series[0],
                this.series[1]
            ]
        });

        this.series = this.generateTetrominoSeries();
        for (let player of this.players.values())
            player.game.initialize(this.series);

        for (let player of this.players.values())
            player.startGameLoop(this);
    }

    removePlayer(socketId) {
        this.players.delete(socketId);
        if (this.players.size === 0)
            return false;
        this.joinedPlayer.shift();
        this.host = this.joinedPlayer[0];
        return true;
    }

    checkGameEnd() {
        let playersAlive = [...this.players.values()].filter(player => !player.game.gameOver);
        if (playersAlive.length < 2) {
            this.playing = false;
            this.broadcast('gameEnd', {
                winner: playersAlive.length ? playersAlive[0].socket.id : null
            });
        }
    }

    generateTetrominoSeries() {
        return Array.from({length: 256}, () => Math.floor(Math.random() * 7) + 1).join('');
    }
}