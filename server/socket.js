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
        const room_id = socket.handshake.query.room_id; // TODO can i use it universally since it is initialized for a certain socket connection from here?
        console.log('client arrived!', socket.id, nickname, room_id);
        
        const player = new Player(socket, nickname, room_id);
        gameManager.players.set(socket.id, player);

        const room = gameManager.getRoom(room_id);
        if (!room) {
            // socket.emit('roomConnection', { success: false })
            return;
        }
        room.addPlayer(socket.id, player);
        room.broadcast('playerJoined', { id: socket.id, nickname });

        socket.on('startGame', () => {
            const room = gameManager.getRoom(room_id);
            if (!room || room.playing) return;
            if (room.host !== socket.id) return;
            room.startGame();
        })

        socket.on('moveBlock', ({left}) => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver || player.game.controlDisabled) return;
                player.moveSide(left);
                player.sendGameState();
            }
        })

        socket.on('rotateBlock', () => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver || player.game.controlDisabled) return;
                player.rotate() && player.sendGameState();
            }
        })

        socket.on('hardDrop', () => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver || player.game.controlDisabled) return;
                player.hardDrop();
                player.sendGameState();
            }
        })

        socket.on('startAccelerate', () => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver || player.game.controlDisabled || player.game.accelerating) return;
                player.game.dropInterval /= 10;
                player.game.accelerating = true;
                player.startGameLoop();
            }
        })

        socket.on('stopAccelerate', () => {
            const player = gameManager.getPlayerBySocketId(socket.id);
            if (player) {
                if (player.game.gameOver || player.game.controlDisabled || !player.game.accelerating) return;
                player.game.dropInterval *= 10;
                player.game.accelerating = false;
                player.startGameLoop();
            }
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const player = gameManager.getPlayerBySocketId(socket.id);
            player && gameManager.removePlayerFromRoom(socket.id, player.roomId);
        });

    });

    return io;
}
