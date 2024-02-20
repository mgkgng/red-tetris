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

            // if (!room || !room.addPlayer(player)) {
            //     socket.emit('joinRoomRes', { success: false });
            // } else {
            //     socket.emit('joinRoomRes', { success: true, id: data.roomId });
            // }
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
            if (!room) {
                socket.emit('roomVerified', { success: false, exists: false });
                return;
            }
            const canJoin = gameManager.checkRightRoom(roomId, socket.id);
            socket.emit('roomVerified', { success: canJoin, exists: true });
        });

    });

    return io;
}
