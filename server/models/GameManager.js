import { Room } from './Room.js';
import { Player } from './Player.js';
import { uid } from '../utils.js';

class GameManager {
    constructor() {
        this.rooms = new Map();
        this.roomInCreation = new Map();
        this.players = new Map();
    }

    addPlayerToRoom(name, roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return false;
        const player = new Player(socket, name, roomId, room.series);
        room.addPlayer(player);
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
            if (!room.playing && room.joinedPlayer.length < 3)
                res.push({ id, level: room.level });
        }
        console.log('res:' , res)
        return res;
    }

    getRoom(id) {
        return this.rooms.get(id);
    }

}

export const gameManager = new GameManager();
