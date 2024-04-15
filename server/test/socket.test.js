import { Server } from "socket.io";
import { createServer } from "http";
import { initSocketServer } from "../socket";
import { Player } from "../models/Player";
import { gameManager } from "../models/GameManager";
import { PLAYER_LIMIT } from "../constants";

jest.mock("socket.io", () => {
  return {
    Server: jest.fn(() => ({
      on: jest.fn(),
    })),
  };
});
jest.mock("../models/Room", () => {
  return {
    Room: jest.fn().mockImplementation(() => ({
      addPlayer: jest.fn(),
      removePlayer: jest.fn(),
      broadcast: jest.fn(),
      startGame: jest.fn(),
      joinedPlayer: [],
      playing: false,
    })),
  };
});

jest.mock("../models/Player");
jest.mock("../models/GameManager", () => {
  return {
    gameManager: {
      players: new Map(),
      getRoomByRoomId: jest.fn(),
      getPlayerBySocketId: jest.fn(),
      removePlayerFromRoom: jest.fn(),
    },
  };
});

describe("Socket Server Initialization", () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it("should initialize socket server", () => {
    const io = initSocketServer(server);
    expect(Server).toHaveBeenCalledWith(server, expect.anything());
    expect(io.on).toHaveBeenCalledWith("connection", expect.any(Function));
  });

  it("should handle a new connection", () => {
    const mockSocket = {
      id: "socket1",
      handshake: {
        query: {
          nickname: "testUser",
          room_id: "room1",
          emoji: "😀",
        },
      },
      emit: jest.fn(),
      on: jest.fn(),
      join: jest.fn(),
    };

    const mockRoom = {
      playing: false,
      joinedPlayer: [],
      addPlayer: jest.fn(),
      broadcast: jest.fn(),
    };

    gameManager.getRoomByRoomId.mockReturnValue(mockRoom);

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    expect(gameManager.getRoomByRoomId).toHaveBeenCalledWith("room1");
    expect(mockRoom.addPlayer).toHaveBeenCalledWith(
      mockSocket.id,
      expect.any(Player)
    );
    expect(mockSocket.emit).not.toHaveBeenCalledWith(
      "roomError",
      expect.any(Object)
    );
  });

  it('should emit "Room not found" if no room exists', () => {
    const mockSocket = {
      id: "socket2",
      handshake: {
        query: { nickname: "testUser2", room_id: "room2", emoji: "🙂" },
      },
      emit: jest.fn(),
      on: jest.fn(),
    };
    gameManager.getRoomByRoomId.mockReturnValue(undefined);

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    expect(mockSocket.emit).toHaveBeenCalledWith("roomError", {
      message: "Room not found",
    });
  });

  it('should emit "Room is already in a game" if the room is already playing', () => {
    const mockSocket = {
      id: "socket3",
      handshake: {
        query: { nickname: "testUser3", room_id: "room3", emoji: "😁" },
      },
      emit: jest.fn(),
      on: jest.fn(),
    };

    const mockRoom = {
      playing: true,
      joinedPlayer: [],
      addPlayer: jest.fn(),
      broadcast: jest.fn(),
    };

    gameManager.getRoomByRoomId.mockReturnValue(mockRoom);

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    expect(mockSocket.emit).toHaveBeenCalledWith("roomError", {
      message: "Room is already in a game",
    });
    expect(mockRoom.addPlayer).not.toHaveBeenCalled();
  });

  it('should emit "Room is full" if the room has reached player limit', () => {
    const mockSocket = {
      id: "socket4",
      handshake: {
        query: { nickname: "testUser4", room_id: "room4", emoji: "😂" },
      },
      emit: jest.fn(),
      on: jest.fn(),
    };

    const mockRoom = {
      playing: false,
      joinedPlayer: new Array(PLAYER_LIMIT).fill("player"),
      addPlayer: jest.fn(),
      broadcast: jest.fn(),
    };

    gameManager.getRoomByRoomId.mockReturnValue(mockRoom);

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    expect(mockSocket.emit).toHaveBeenCalledWith("roomError", {
      message: "Room is full",
    });
    expect(mockRoom.addPlayer).not.toHaveBeenCalled();
  });

  it("should handle player disconnecting and clean up properly", () => {
    const mockSocket = {
      id: "socket5",
      handshake: {
        query: { nickname: "testUser5", room_id: "room5", emoji: "😃" },
      },
      emit: jest.fn(),
      on: jest.fn().mockImplementation((event, callback) => {
        if (event === "disconnect") {
          callback();
        }
      }),
      disconnect: jest.fn(),
    };

    const mockRoom = {
      playing: false,
      joinedPlayer: ["socket5"],
      addPlayer: jest.fn(),
      removePlayer: jest.fn(),
      broadcast: jest.fn(),
    };

    gameManager.getRoomByRoomId.mockReturnValue(mockRoom);
    gameManager.players.set(
      mockSocket.id,
      new Player(mockSocket, "testUser5", "room5", "😃")
    );

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    expect(mockRoom.removePlayer).not.toHaveBeenCalledWith();
    expect(gameManager.players.has(mockSocket.id)).toBeFalsy();
    expect(gameManager.removePlayerFromRoom).not.toHaveBeenCalledWith();
  });

  it("should start a game only if the initiating player is the host", () => {
    const mockSocket = {
      id: "hostSocketId",
      handshake: {
        query: { nickname: "host", room_id: "hostRoom", emoji: "🚀" },
      },
      emit: jest.fn(),
      on: jest.fn(),
    };

    const mockRoom = {
      host: "hostSocketId",
      playing: false,
      startGame: jest.fn(),
      joinedPlayer: ["hostSocketId"],
      broadcast: jest.fn(),
      addPlayer: jest.fn(),
    };

    gameManager.getRoomByRoomId.mockReturnValue(mockRoom);

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "startGame") {
        callback();
      }
    });

    expect(mockRoom.startGame).not.toHaveBeenCalled();
    expect(mockSocket.emit).not.toHaveBeenCalledWith(
      "roomError",
      expect.any(Object)
    );
  });

  it("should not move or rotate blocks if the game is over", () => {
    const mockSocket = {
      id: "playerSocketId",
      handshake: {
        query: { nickname: "player", room_id: "playerRoom", emoji: "🚀" },
      },
      emit: jest.fn(),
      on: jest.fn(),
    };

    const player = {
      game: {
        gameOver: true,
        moveSide: jest.fn(),
        rotate: jest.fn(),
        sendGameState: jest.fn(),
      },
    };

    gameManager.getPlayerBySocketId.mockReturnValue(player);

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "moveBlock") {
        callback({ left: true });
      }
      if (event === "rotateBlock") {
        callback();
      }
    });

    expect(player.game.moveSide).not.toHaveBeenCalled();
    expect(player.game.rotate).not.toHaveBeenCalled();
    expect(player.game.sendGameState).not.toHaveBeenCalled();
  });
});
