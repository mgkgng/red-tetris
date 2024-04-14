import { getGameList, joinRoom, createRoom, verifyRoom } from '../../controllers/GameController';
import { gameManager } from '../../models/GameManager';

jest.mock('../../models/GameManager.js', () => {
	const mockMap = new Map();
	jest.spyOn(mockMap, 'has').mockReturnValue(true);
	jest.spyOn(mockMap, 'delete').mockImplementation();
  
	return {
	  gameManager: {
		getAvailableRooms: jest.fn(),
		getRoomByRoomId: jest.fn(),
		setRoomInCreation: jest.fn(),
		createRoom: jest.fn(),
		roomInCreation: mockMap,
	  }
	};
  });

describe('Game Controller', () => {
  describe('getGameList', () => {
    it('should return a list of available rooms', async () => {
      const mockRooms = [{ id: 'room1' }, { id: 'room2' }];
      gameManager.getAvailableRooms.mockReturnValue(mockRooms);
      const req = {};
      const res = { json: jest.fn() };
      getGameList(req, res);
      expect(res.json).toHaveBeenCalledWith(mockRooms);
    });
  });

  describe('joinRoom', () => {
    it('should handle non-existing room', () => {
      const req = { body: { roomId: 'nonexistent' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      gameManager.getRoomByRoomId.mockReturnValue(undefined);
      joinRoom(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Room not found." });
    });

    it('should handle already playing room', () => {
      const req = { body: { roomId: 'playingRoom' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const room = { playing: true };

      gameManager.getRoomByRoomId.mockReturnValue(room);

      joinRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Room is already in a game." });
    });
  });

  describe('createRoom', () => {
    it('should create a room and return its ID', () => {
      const req = { body: { emoji: '😊', difficulty: 'hard' } };
      const res = { json: jest.fn() };
      const roomId = '123';

      gameManager.setRoomInCreation.mockReturnValue(roomId);

      createRoom(req, res);

      expect(res.json).toHaveBeenCalledWith({ roomId });
    });
  });

  describe('verifyRoom', () => {
    it('should verify room creation', () => {
      const req = { params: { id: 'creationId' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const room = { titleEmojis: '🎉', players: [] };
      gameManager.roomInCreation.has.mockReturnValue(true);
      gameManager.createRoom.mockReturnValue(room);

      verifyRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        titleEmojis: room.titleEmojis,
        players: []
      });
      expect(gameManager.roomInCreation.delete).toHaveBeenCalledWith('creationId');
    });

    it('should handle room verification for an existing room', () => {
      const req = { params: { id: 'existingRoom' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const room = {
        titleEmojis: '🌟',
        series: 'series1',
        players: new Map([['player1', { socket: { id: 'socket1' }, name: 'Name1', emoji: '😀' }]]),
        host: 'Host1'
      };
      gameManager.roomInCreation.has.mockReturnValue(false);
      gameManager.getRoomByRoomId.mockReturnValue(room);

      verifyRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        titleEmojis: room.titleEmojis,
        series: room.series,
        players: [{
          id: 'socket1',
          nickname: 'Name1',
          emoji: '😀'
        }],
        host: 'Host1'
      });
    });

    it('should return 404 for non-existing room', () => {
      const req = { params: { id: 'nonexistentRoom' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      gameManager.getRoomByRoomId.mockReturnValue(undefined);

      verifyRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Room not found." });
    });
  });
});
