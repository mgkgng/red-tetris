import { gameManager } from "../models/GameManager.js";

export const getGameList = (req, res) => {
    res.json(gameManager.getAvailableRooms());
};

export const joinRoom = (req, res) => {
    const { roomId } = req.body;
    const room = gameManager.getRoom(roomId);

    if (!room) {
        return res.status(404).json({ success: false, message: "Room not found." });
    } else if (room.playing) {
        return res.status(400).json({ success: false, message: "Room is already in a game." });
    } else {
        return res.status(200).json({ success: true, roomId });
    }
};

export const createRoom = (req, res) => {
    const titleEmojis = req.body.titleEmojis;
    const roomId = gameManager.setRoomInCreation(titleEmojis);
    res.json({ roomId });
};

export const verifyRoom = (req, res) => {
    const { id } = req.params;
    console.log('lets verify', id);
    if (gameManager.roomInCreation.has(id)) {
        const room = gameManager.createRoom(id);
        console.log('room created:', id);
        res.status(200).json({ 
            titleEmojis: room.titleEmojis,
            players: [],
        });
        gameManager.roomInCreation.delete(id);
    } else {
        const room = gameManager.getRoom(id);
        if (!room) {
            res.status(404).json({ message: "Room not found." });
            return;
        }
        res.status(200).json({ 
            titleEmojis: room.titleEmojis,
            series: room.series,
            players: [...room.players.values()].map(player => ({
                id: player.id,
                nickname: player.nickname
            })),
            host: gameManager.getPlayerBySocketId(room.host).nickname
         });

    }
}