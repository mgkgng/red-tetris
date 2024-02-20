import { Room } from './Room.js';
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

    getAvailableRooms() {
        const res = [];
        for (let [id, room] of this.rooms) {
            if (room.isFree())
                res.push({ id, level: room.level });
        }
        return res;
    }

    getRoom(id) {
        return this.rooms.get(id);
    }

    checkRightRoom(roomId, socketId) {
        const room = this.getRoom(roomId);
        if (!room) return false;
        return room.hasPlayer(socketId);
    }
}