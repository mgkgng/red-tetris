import { LINES_TO_LEVEL_UP, Room } from "../../models/Room";
import { StartingLevelPerDifficulty } from "../../constants";

jest.mock("../../models/ScoreManager", () => ({
    scoreManager: {
        addScore: jest.fn(),
    }
}));

function createMockPlayer(socketId) {
    return {
        socket: { id: socketId, emit: jest.fn(), connected: true },
        game: {
            intervalId: null,
            gameOver: false,
            initialize: jest.fn(),
            addMalus: jest.fn(() => true),
            startGameLoop: jest.fn(),
            dropInterval: 1000
        },
        initTetris: jest.fn(),
        nickname: 'Player' + socketId,
        score: 0,
        sendGameState: jest.fn(),
        startGameLoop: jest.fn()
    };
}


describe("Room", () => {
    let room;
    let mockSocket;

    beforeEach(() => {
		room = new Room("uid1", "😊", "easy");
		mockSocket = { id: 'socket1', emit: jest.fn(), connected: true };
		jest.spyOn(room, 'broadcast').mockImplementation(() => {});
	});
	

    test("constructor initializes properties correctly", () => {
        expect(room.uid).toBe("uid1");
        expect(room.emoji).toBe("😊");
        expect(room.difficulty).toBe("easy");
        expect(room.level).toBe(StartingLevelPerDifficulty["easy"]);
        expect(room.playing).toBeFalsy();
        expect(room.players instanceof Map).toBeTruthy();
    });

    test('addPlayer adds new player and sets host if not set', () => {
        const player = createMockPlayer(mockSocket.id);
        room.addPlayer(mockSocket.id, player);
        expect(room.players.has(mockSocket.id)).toBeTruthy();
        expect(room.host).toBe(mockSocket.id);
        expect(player.initTetris).toHaveBeenCalled();
        expect(player.socket.emit).toHaveBeenCalledWith('updateHost', { name: player.nickname, id: mockSocket.id });
    });

    test("startGame starts the game if not already playing", () => {
        jest.spyOn(room, "broadcast");
        room.startGame();
        expect(room.playing).toBeTruthy();
        expect(room.broadcast).toHaveBeenCalledWith("gameStarted");
    });

    test("removePlayer removes player and updates host if necessary", () => {
        const player = createMockPlayer("socket2");
        room.addPlayer("socket2", player);
        room.addPlayer(mockSocket.id, createMockPlayer(mockSocket.id));

        room.removePlayer("socket2");
        expect(room.players.has("socket2")).toBeFalsy();
        expect(room.host).toBe(mockSocket.id);
    });

    test("checkGameEnd ends game if less than two players are not gameOver", () => {
        jest.spyOn(room, "broadcast");
        const player = createMockPlayer(mockSocket.id);
        player.game.gameOver = true;
        room.addPlayer(mockSocket.id, player);
        room.checkGameEnd();

        expect(room.playing).toBeFalsy();
        expect(room.broadcast).toHaveBeenCalledWith("gameEnd", { winner: null });
    });
	test("afterClearLines increases level and updates interval after enough lines are cleared", () => {
		const player1 = createMockPlayer('socket1');
		const player2 = createMockPlayer('socket2');
		room.addPlayer(player1.socket.id, player1);
		room.addPlayer(player2.socket.id, player2);
	
		const initialLevel = room.level;
		const linesNeeded = LINES_TO_LEVEL_UP * room.players.size;
	
		room.afterClearLines(linesNeeded);
	
		expect(room.level).toBe(initialLevel + 1);
		expect(player1.startGameLoop).toHaveBeenCalled();
		expect(player2.startGameLoop).toHaveBeenCalled();
		expect(room.broadcast).toHaveBeenCalledWith('levelUp', room.level);
	});

	test("handle empty room when last player is removed", () => {
		const player = createMockPlayer('socket1');
		room.addPlayer(player.socket.id, player);
	
		const result = room.removePlayer(player.socket.id);
		expect(result).toBeFalsy();
		expect(room.players.size).toBe(0);
		expect(room.host).toBe('socket1');
	});

    afterEach(() => {
        jest.clearAllMocks();
    });
});
