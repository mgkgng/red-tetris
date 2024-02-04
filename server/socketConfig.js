    import { GameManager } from './models/GameManager.js';
    import { Player } from './models/Player.js';
    import { Server } from 'socket.io';

    const gameManager = new GameManager();

    export function setupSocket(server) {
    const io = new Server(server, {
        cors: {
        origin: '*',
        }
    });

    io.on('connection', (socket) => {

        /***************************************/
        /************* GAME LOGIC **************/
        /***************************************/

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
            console.log('moveBlock');
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

        /***************************************/
        /************* UNTIL HERE **************/
        /***************************************/

        socket.on('joinGame', ({ playerName }) => {
            console.log('A new player join:', playerName)
            const player = new Player(socket, playerName);
            gameManager.addPlayer(player);
            socket.emit('playerAdded', { playerName: player.name });
            console.log('player added:', player)
        });

        socket.on('createGame', () => {
            console.log('A new game is created')
            const game = gameManager.createGame(socket.id);
            if (!game) {
                socket.emit('error', { errormsg: "You are already in a game" });
                return;
            }
            socket.emit('gameCreated', { gameId: game.gameId });
            // console log all the info, includinq all the players boards
            console.log(game);
            for (const player of game.players) {
                console.log(player.gameBoard);
            }

        });
        socket.on('getGames', () => {
            console.log('A player is asking for the games list')
            const games = gameManager.getGames();
            if (games.length === 0) {
                socket.emit('error', { errormsg: "No games available" });
                return;
            }
            socket.emit('gamesList', { games });
        });
        socket.on("getGame", ({ gameId }) => {
            console.log('A player is asking for a game')
            const game = gameManager.getGame(gameId);
            if (!game) {
                socket.emit('error', { errormsg: "Game not found" });
                return;
            }
            socket.emit('gameInfo', { game });
        });
        socket.on("deleteGame", ({ gameId }) => {
            console.log('A player is asking to delete a game')
            ret = gameManager.deleteGame(gameId);
            if (!ret) {
                socket.emit('error', { errormsg: "Game not found" });
                return;
            }
            socket.emit('gameDeleted', { gameId });
        });
        socket.on("startGame", ({ gameId, playerId }) => {
            console.log('A player is asking to start a game')
            const game = gameManager.getGame(gameId);
            if (!game) {
                socket.emit('error', { errormsg: "Game not found" });
                return;
            }
            ret = game.startGame(playerId);
            if (!ret) {
                socket.emit('error', { errormsg: "You aren't allowed to launch this game" });
                return;
            }
            game.players.forEach(player => {
                io.to(player.id).emit('gameStarted', { gameId });
            });
        });
        socket.on("resetServer", () => {
            console.log('A player is asking to reset the server')
            gameManager.reset();
            socket.emit('serverReset', {});
        });
        socket.on("joinGame", ({ gameId, playerId }) => {
            console.log('A player is asking to join a game')
            const game = gameManager.getGame(gameId);
            if (!game) {
                socket.emit('error', { errormsg: "Game not found" });
                return;
            }
            const player2 = gameManager.getPlayerById(playerId);
            game.addPlayerToGame(player2);
            game.players.forEach(player => {
                io.to(player.id).emit('playerJoined', { gameId: gameId, playerId: socket.id });
            });
        });
        socket.on("leaveGame", ({ gameId, playerId }) => {
            console.log('A player is asking to leave a game')
            const game = gameManager.getGame(gameId);
            game.players.forEach(player => {
                io.to(player.id).emit('playerLeft', { playerId });
            });
            game.leaveGame(playerId);
            if (game.isStarted) {
                game.isStarted = false;
                game.players.forEach(player => {
                io.to(player.id).emit('gameEnded', { gameId });
                });
                gameManager.deleteGame(gameId);
            }
        });
        socket.on('sendMalus', ({ gameId, playerId, malus }) => {
            console.log('A player is sending a malus')
            const game = gameManager.getGame(gameId);
            if (!game) {
                socket.emit('error', { errormsg: "Game not found" });
                return;
            }
            game.players.forEach(player => {
                if (player.id != socket.id) {
                    io.to(player.id).emit('malusReceived', { gameId, playerId, malus });
                    const player2 = gameManager.getPlayerById(player.id);
                    const board = player2.gameBoard;
                    board.upgradeMalus(malus);
                }
            });
        });
        socket.on('sendPointToAddScore', ({ gameId, playerId, pointsToAdd }) => {
            console.log('A player is sending points to add to score')
            const game = gameManager.getGame(gameId);
            if (!game) {
                socket.emit('error', { errormsg: "Game not found" });
                return;
            }
            game.players.forEach(player => {
                if (player.id == socket.id) {
                    io.to(player.id).emit('pointsReceived', { gameId, playerId, pointsToAdd });
                    const player2 = gameManager.getPlayerById(player.id);
                    player2.addScore(pointsToAdd);
                }
            });
        });
        socket.on('changeName', ({ playerId, newName }) => {
            console.log('A player is changing his name')
            const player = gameManager.getPlayerById(playerId);
            if (!player) {
                socket.emit('error', { errormsg: "Player not found" });
                return;
            }
            player.changeName(newName);
            socket.emit('nameChanged', { playerId, newName });
        });
        socket.on('disconnect', () => {
            console.log('A player disconnected')
            for (const game of gameManager.games.values()) {
                if (game.players.some(player => player.id === socket.id)) {
                    game.players.forEach(player => {
                        if (player.id != socket.id)
                        io.to(player.id).emit('playerLeft', { playerId: socket.id });
                    });
                    game.leaveGame(socket.id);
                    if (game.isStarted) {
                        game.isStarted = false;
                        game.players.forEach(player => {
                            io.to(player.id).emit('gameEnded', { gameId: game.gameId });
                        });
                        gameManager.deleteGame(game.gameId);
                    }
                    if (game.players.length === 0) {
                        gameManager.deleteGame(game.gameId);
                    }
                }
            }
            gameManager.handlePlayerDisconnect(socket.id);
        });
    });

    return io;
}
