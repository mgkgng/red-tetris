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
        console.log('client arrived!', socket.id);

        const nickname = socket.handshake.query.nickname;
        const room_id = socket.handshake.query.room_id; // TODO can i use it universally since it is initialized for a certain socket connection from here?
        const player = new Player(socket, nickname, room_id);
    

        socket.on('startTetris', (data) => {
            console.log('startTetris');
            const player = gameManager.getPlayerById(socket.id);
            // const game = gameManager.getGame(data.gameId);
            if (player) {
                // player.resetBoard();
                socket.emit('gameStarted', {
                    pieces: [
                        player.gameBoard.currentPiece.shape,
                        player.gameBoard.nextPiece.shape
                    ]
                });
                player.gameLoop();
            }
        })

        socket.on('moveBlock', ({left}) => {
            const player = gameManager.getPlayerById(socket.id);
            if (player) {
                if (player.gameBoard.gameOver || player.gameBoard.controlDisabled) return;
                player.moveSide(left);
                player.sendGameState();
            }
        })

        socket.on('rotateBlock', () => {
            const player = gameManager.getPlayerById(socket.id);
            if (player) {
                if (player.gameBoard.gameOver || player.gameBoard.controlDisabled) return;
                player.rotate() && player.sendGameState();
            }
        })

        socket.on('hardDrop', () => {
            console.log('hardDrop');
            const player = gameManager.getPlayerById(socket.id);
            if (player) {
                if (player.gameBoard.gameOver || player.gameBoard.controlDisabled) return;
                player.hardDrop();
                player.sendGameState();
            }
        })

        socket.on('startAccelerate', () => {
            console.log('startAccelerate');
            const player = gameManager.getPlayerById(socket.id);
            if (player) {
                if (player.gameBoard.gameOver || player.gameBoard.controlDisabled || player.gameBoard.accelerating) return;
                player.gameBoard.dropInterval /= 10;
                player.gameBoard.accelerating = true;
                player.gameLoop();
            }
        })

        socket.on('stopAccelerate', () => {
            console.log('stopAccelerate');
            const player = gameManager.getPlayerById(socket.id);
            if (player) {
                if (player.gameBoard.gameOver || player.gameBoard.controlDisabled || !player.gameBoard.accelerating) return;
                player.gameBoard.dropInterval *= 10;
                player.gameBoard.accelerating = false;
                player.gameLoop();
            }
        })

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const player = gameManager.getPlayerBySocketId(socket.id);
            player && gameManager.removePlayerFromRoom(player.roomId);
        });

    });

    return io;
}
