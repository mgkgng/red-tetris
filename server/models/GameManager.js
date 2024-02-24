import { Room } from './Room.js';
import { Player } from './Player.js';
import { uid } from '../utils.js';

class GameManager {
    constructor() {
        this.rooms = new Map();
        this.roomInCreation = new Map();
        this.players = new Map();

        const dummyId1 = this.createUid();
        const dummyId2 = this.createUid();
        this.rooms.set(dummyId1, new Room(dummyId1));
        this.rooms.set(dummyId2, new Room(dummyId2));
    }

    addPlayerToRoom(name, roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return false;
        const player = new Player(socket, name, roomId, room.series);
        room.addPlayer(player);
    }

    removePlayerFromRoom(roomId) {
        const room = this.getRoomByRoomId(roomId);
        if (!room) return false;
        if (!room.removePlayer(socketId)) {
            this.rooms.delete(room.uid);
        }
    }

    createUid() {
        let id = uid();
        while (this.rooms.has(id) || this.roomInCreation.has(id))
            id = uid();
        return id;
    }

    setRoomInCreation(roomTitle) {
        const uid = this.createUid();
        this.roomInCreation.set(uid, roomTitle);
        return uid;
    }

    createRoom(id) {
        const room = new Room(id, this.roomInCreation.get(id));
        this.rooms.set(id, room);
        return room;

    }

    getPlayerBySocketId(socketId) {
        return this.players.get(socketId);
    }

    getRoomByRoomId(roomId) {
        return this.rooms.get(roomId);
    }

    getAvailableRooms() {
        const res = [];
        for (let [id, room] of this.rooms) {
            if (!room.playing && room.joinedPlayer < 3)
                res.push({ id, level: room.level });
        }
        return res;
    }

    getRoom(id) {
        return this.rooms.get(id);
    }

}

export const gameManager = new GameManager();
