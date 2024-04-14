import { Server } from 'socket.io';
import { createServer } from 'http';
import { initSocketServer } from '../socket';
import { Player } from '../models/Player';
import { gameManager } from '../models/GameManager';

jest.mock('socket.io', () => {
  return { Server: jest.fn(() => ({
      on: jest.fn()
    }))
  };
});

jest.mock('../models/Player');
jest.mock('../models/GameManager', () => {
  return {
    gameManager: {
      players: new Map(),
      getRoomByRoomId: jest.fn(),
      getPlayerBySocketId: jest.fn(),
      removePlayerFromRoom: jest.fn()
    }
  };
});

describe('Socket Server Initialization', () => {
  let server;
  beforeEach(() => {
    server = createServer();
  });

  it('should initialize socket server', () => {
    const io = initSocketServer(server);
    expect(Server).toHaveBeenCalledWith(server, expect.anything());
    expect(io.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('should handle a new connection', () => {
    const mockSocket = {
        id: 'socket1',
        handshake: {
            query: {
                nickname: 'testUser',
                room_id: 'room1',
                emoji: '😀'
            }
        },
        emit: jest.fn(),
        on: jest.fn(),
        join: jest.fn()
    };

    const mockRoom = {
        playing: false,
        joinedPlayer: [],
        addPlayer: jest.fn(),
        broadcast: jest.fn()
    };

    gameManager.getRoomByRoomId.mockReturnValue(mockRoom);

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    expect(gameManager.getRoomByRoomId).toHaveBeenCalledWith('room1');
    expect(mockRoom.addPlayer).toHaveBeenCalledWith(mockSocket.id, expect.any(Player));
    expect(mockSocket.emit).not.toHaveBeenCalledWith('roomError', expect.any(Object));
});


it('should emit "Room not found" if no room exists', () => {
    const mockSocket = {
        id: 'socket2',
        handshake: { query: { nickname: 'testUser2', room_id: 'room2', emoji: '🙂' } },
        emit: jest.fn(),
        on: jest.fn(),
    };
    gameManager.getRoomByRoomId.mockReturnValue(undefined);

    const io = initSocketServer(server);
    const connectionHandler = io.on.mock.calls[0][1];
    connectionHandler(mockSocket);

    expect(mockSocket.emit).toHaveBeenCalledWith('roomError', { message: 'Room not found' });
});
});

