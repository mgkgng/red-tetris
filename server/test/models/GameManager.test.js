import { GameManager } from '../../models/GameManager';
import { Room } from '../../models/Room';
import { Player } from '../../models/Player';
import { uid } from '../../utils';

jest.mock('../../models/Room', () => {
  return {
    Room: jest.fn().mockImplementation((id, emoji, difficulty) => {
      return {
        id,
        emoji,
        difficulty,
        players: [],
        addPlayer: function(player) {
          this.players.push(player);
        },
        removePlayer: function(socketId) {
          const index = this.players.findIndex(p => p.socket.id === socketId);
          if (index !== -1) {
            this.players.splice(index, 1);
            return true;
          }
          return false;
        },
        playing: false,
        broadcast: jest.fn()
      };
    })
  };
});

jest.mock('../../models/Player', () => {
  return {
    Player: jest.fn().mockImplementation((socket, name, roomId, series) => {
      return { socket, name, roomId, series };
    })
  };
});

jest.mock('../../utils', () => {
  return {
    uid: jest.fn()
  };
});

describe('GameManager', () => {
  let gameManager;

  beforeEach(() => {
    uid.mockClear();
    Room.mockClear();
    Player.mockClear();
    gameManager = new GameManager();
  });

  it('should create and store a new room', () => {
    uid.mockReturnValue('uniqueRoomId');
    const roomId = gameManager.setRoomInCreation('🍎', 'easy');
    const room = gameManager.createRoom(roomId);

    expect(room).toBeTruthy();
    expect(room.emoji).toEqual('🍎');
    expect(gameManager.rooms.has(roomId)).toBe(true);
  });

  it('should add a player to a room', () => {
    const roomId = 'testRoomId';
    gameManager.rooms.set(roomId, new Room(roomId, '🍎', 'easy'));
    const added = gameManager.addPlayerToRoom('Alice', roomId);

    expect(added).toBe(true);
    const room = gameManager.getRoomByRoomId(roomId);
    expect(room.players.length).toBe(1);
  });

  it('should handle removal of a player', () => {
    const roomId = 'testRoomId';
    const room = new Room(roomId, '🍎', 'easy');
    gameManager.rooms.set(roomId, room);
    const player = new Player({ id: 'socket1' }, 'Alice', roomId, 'series');
    room.addPlayer(player);

    gameManager.removePlayerFromRoom('socket1', roomId);
    expect(room.players.length).toBe(0);
    expect(room.broadcast).toHaveBeenCalledWith('playerLeft', { id: 'socket1' });
  });
});

