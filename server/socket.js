    import { Player } from './models/Player.js';
    import { GameManager } from './models/GameManager.js';
    import { Server } from 'socket.io';

    const gameManager = new GameManager();

    export function initSocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: '*',
        }
    });

    io.on('connection', (socket) => {
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

        socket.on('joinRoom', (data) => {
            console.log('joinRoom Request received', data);
            const room = gameManager.getRoom(data.roomId);
            const player = new Player(socket, data.name);
            gameManager.players.set(socket.id, player);

            if (!room) {
                socket.emit('joinRoomRes', { success: false });
                return;
            }
            room.addPlayer(socket.id, player);
            socket.emit('joinRoomRes', { success: true, roomId: room.uid});            
        })

        socket.on('createRoom', (data) => {
            gameManager.createGame(socket) && socket.emit('createRoomRes', { roomId: room.uid });
        });

        socket.on('gameListReq', () => {
            console.log('gameList request received');
            socket.emit('gameListRes', gameManager.getAvailableRooms());
        })

        socket.on('verifyRoom', ({ roomId }) => {
            const room = gameManager.getRoom(roomId);
            console.log(room)
            if (!room) {
                socket.emit('roomVerified', { success: false, roomExists: false });
                return;
            }

            const player = gameManager.getPlayerBySocketId(socket.id);
            if (!player) {
                socket.emit('roomVerified', { success: false, playerExists: false });
                return;
            }

            console.log(player)

            if (player.roomId === roomId)
                socket.emit('roomVerified', { success: true, roomExists: true });
            else
                console.log('not yet here')
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            const player = gameManager.getPlayerBySocketId(socket.id);
            player && gameManager.removePlayerFromRoom(player.roomId);
        });

    });

    return io;
}
