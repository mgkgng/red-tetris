import { Room } from './Room.js';
import { Player } from './Player.js';
import { uid } from '../utils.js';

export class GameManager {
    constructor() {
        this.rooms = new Map();
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

    removePlayerFromRoom(socketId) {
        const room = this.getRoomBySocketId(socketId);
        if (!room) return false;
        if (!room.removePlayer(socketId)) {
            this.rooms.delete(room.uid);
        }
    }

    createUid() {
        let id = uid();
        while (this.rooms.has(id))
            id = uid();
        return id;
    }

    createRoom(player) {
        const room = new Room(this.createUid());
        room.addPlayer(player);
        this.rooms.set(room.uid, room);
        return true;
    }

    getPlayerBySocketId(socketId) {
        return this.players.get(socketId);
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