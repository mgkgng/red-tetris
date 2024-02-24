import express from 'express';
const router = express.Router();

import { getGameList, joinRoom, createRoom, verifyRoom } from '../controllers/GameController.js';

router.get('/game_list', getGameList);
router.post('/join_room', joinRoom);
router.post('/create_room', createRoom);
router.get('/verify_room/:id', verifyRoom);

export default router;
