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
    const roomEmoji = req.body.emoji;
    const roomDifficulty = req.body.difficulty;
    const roomId = gameManager.setRoomInCreation(roomEmoji, roomDifficulty);
    res.json({ roomId });
};

export const verifyRoom = (req, res) => {
    const { id } = req.params;
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
        console.log('now room players:', room.players.values());
        res.status(200).json({ 
            titleEmojis: room.titleEmojis,
            series: room.series,
            players: [...room.players.values()].map(player => ({
                id: player.socket.id,
                nickname: player.name,
                emoji: player.emoji
            })),
            host: room.host
         });
    }
}