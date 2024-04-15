import { Room } from './Room.js';
import { Player } from './Player.js';
import { uid } from '../utils.js';

class GameManager {
    constructor() {
        this.rooms = new Map();
        this.roomInCreation = new Map();
        this.players = new Map();

        // If you want to test
        // const id1 = this.setRoomInCreation('🍎', 'easy');
        // const id2 = this.setRoomInCreation('🍉', 'medium');
        // const id3 = this.setRoomInCreation('🍌', 'hard');
        // const id4 = this.setRoomInCreation('🍇', 'easy');
        // this.createRoom(id1);
        // this.createRoom(id2);
        // this.createRoom(id3);
        // this.createRoom(id4);
    }

    removePlayerFromRoom(socketId, roomId) {
        const room = this.getRoomByRoomId(roomId);
        if (!room) return ;
        if (!room.removePlayer(socketId)) {
            this.rooms.delete(room.uid);
            return ;
        }
        room.broadcast('playerLeft', { id: socketId });
    }

    createUid() {
        let id = uid();
        while (this.rooms.has(id) || this.roomInCreation.has(id))
            id = uid();
        return id;
    }

    setRoomInCreation(emoji, difficulty) {
        const uid = this.createUid();
        this.roomInCreation.set(uid, { emoji, difficulty });
        return uid;
    }

    createRoom(id) {
        const info = this.roomInCreation.get(id);
        if (!info) return null;
        const room = new Room(id, info.emoji, info.difficulty);
        this.rooms.set(id, room);
        return room;
    }

    getPlayerBySocketId(socketId) { return this.players.get(socketId); }
    getRoomByRoomId(roomId) { return this.rooms.get(roomId);}

    getAvailableRooms() {
        const res = [];
        for (let [id, room] of this.rooms) {
            if (!room.playing && room.joinedPlayer.length < 5)
                res.push({ id, level: room.level, emoji: room.emoji, difficulty: room.difficulty, playersCount: room.joinedPlayer.length });
        }
        return res;
    }
}

export const gameManager = new GameManager();
