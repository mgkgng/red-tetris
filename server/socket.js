    import { Player } from './models/Player.js';
    import { gameManager } from './models/GameManager.js';
    import { Server } from 'socket.io';

    export function initSocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
        }
    });

    io.on('connection', (socket) => {
        const nickname = socket.handshake.query.nickname;
        const room_id = socket.handshake.query.room_id;
        const emoji = socket.handshake.query.emoji;
        console.log('new client arrived!', socket.id, nickname, room_id, emoji);
        
        const player = new Player(socket, nickname, room_id, emoji);
        gameManager.players.set(socket.id, player);

        const room = gameManager.getRoom(room_id);
        if (!room) return;

        room.addPlayer(socket.id, player);
        room.broadcast('playerJoined', { id: socket.id, nickname, emoji });

        socket.on('startGame', () => {
            const room = gameManager.getRoom(room_id);
            if (!room || room.playing) return;
            if (room.host !== socket.id) return;
            room.startGame();
        })

        socket.on('moveBlock', ({left}) => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver) return;
                player.moveSide(left);
                player.sendGameState();
            }
        })

        socket.on('rotateBlock', () => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver) return;
                player.rotate() && player.sendGameState();
            }
        })

        socket.on('hardDrop', () => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver) return;
                clearInterval(player.game.intervalId)
                player.hardDrop() && player.sendGameState();
                player.startGameLoop();
            }
        })

        socket.on('startAccelerate', () => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver || player.game.accelerating) return;
                player.game.dropInterval /= 10;
                player.game.accelerating = true;
                player.startGameLoop();
            }
        })

        socket.on('stopAccelerate', () => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver || !player.game.accelerating) return;
                player.game.dropInterval *= 10;
                player.game.accelerating = false;
                player.startGameLoop();
            }
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const player = gameManager.getPlayerBySocketId(socket.id);
            player && gameManager.removePlayerFromRoom(socket.id, player.roomId);
            gameManager.players.delete(socket.id);
        });

    });

    return io;
}
