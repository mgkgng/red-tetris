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

};
