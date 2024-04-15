import { GameManager } from "../../models/GameManager";
import { Room } from "../../models/Room";
import { uid } from "../../utils";

jest.mock("../../models/Room", () => {
  return {
    __esModule: true,
    Room: jest.fn().mockImplementation((id, emoji, difficulty) => ({
      id,
      emoji,
      difficulty,
      removePlayer: jest.fn(),
      broadcast: jest.fn(),
      playing: false,
      joinedPlayer: [],
      level: undefined,
    })),
  };
});

jest.mock("../../utils", () => ({
  uid: jest.fn(),
}));

describe("GameManager", () => {
  let gameManager;

  beforeEach(() => {
    Room.mockClear();
    uid.mockClear();
    gameManager = new GameManager();
  });

  test("createUid generates unique identifiers", () => {
    uid
      .mockReturnValueOnce("uniqueId1")
      .mockReturnValueOnce("uniqueId1")
      .mockReturnValueOnce("uniqueId2");
    gameManager.rooms.set("uniqueId1", new Room());
    const id = gameManager.createUid();
    expect(id).toBe("uniqueId2");
    expect(uid).toHaveBeenCalledTimes(3);
  });

  test("setRoomInCreation sets a room with the correct parameters", () => {
    const emoji = "🍎";
    const difficulty = "easy";
    uid.mockReturnValue("uniqueRoomId");
    const roomId = gameManager.setRoomInCreation(emoji, difficulty);
    expect(roomId).toBe("uniqueRoomId");
    expect(gameManager.roomInCreation.has(roomId)).toBeTruthy();
    expect(gameManager.roomInCreation.get(roomId)).toEqual({
      emoji,
      difficulty,
    });
  });

  test("createRoom creates a room from roomInCreation", () => {
    const roomId = "roomId";
    const roomData = { emoji: "🍎", difficulty: "easy" };
    gameManager.roomInCreation.set(roomId, roomData);
    const room = gameManager.createRoom(roomId);
    expect(room).toBeDefined();
    expect(gameManager.rooms.has(roomId)).toBeTruthy();
    expect(gameManager.roomInCreation.has(roomId)).toBeTruthy();
  });

  test("removePlayerFromRoom removes a player and deletes room if necessary", () => {
    const roomId = "roomId";
    const socketId = "socketId";
    const mockRoom = {
      removePlayer: jest.fn(() => false),
      broadcast: jest.fn(),
    };
    gameManager.rooms.set(roomId, mockRoom);
    gameManager.removePlayerFromRoom(socketId, roomId);
    expect(mockRoom.removePlayer).toHaveBeenCalledWith(socketId);
    expect(gameManager.rooms.has(roomId)).toBeTruthy();
  });

  test("getAvailableRooms returns rooms that are not full and not playing", () => {
    const roomId = "roomId";
    const mockRoom = {
      playing: false,
      joinedPlayer: [],
      level: 1,
      emoji: "🍎",
      difficulty: "easy",
    };
    gameManager.rooms.set(roomId, mockRoom);
    const availableRooms = gameManager.getAvailableRooms();
    expect(availableRooms.length).toBe(1);
    expect(availableRooms[0].id).toBe(roomId);
  });

  test("getPlayerBySocketId retrieves a player or returns undefined if not found", () => {
    const socketId = "socketId";
    const player = { id: socketId, name: "TestPlayer" };
    gameManager.players.set(socketId, player);

    expect(gameManager.getPlayerBySocketId(socketId)).toBe(player);
    expect(gameManager.getPlayerBySocketId("nonexistentId")).toBeUndefined();
  });

  test("removePlayerFromRoom does nothing if the player does not exist in the room", () => {
    const roomId = "roomId";
    const socketId = "socketId";
    const mockRoom = {
      removePlayer: jest.fn().mockReturnValue(false),
      broadcast: jest.fn(),
    };
    gameManager.rooms.set(roomId, mockRoom);

    gameManager.removePlayerFromRoom("nonexistentPlayer", roomId);

    expect(mockRoom.removePlayer).toHaveBeenCalledWith("nonexistentPlayer");
    expect(gameManager.rooms.has(roomId)).toBeTruthy();
    expect(mockRoom.broadcast).not.toHaveBeenCalled();
  });
});
