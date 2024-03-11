import express from 'express';
const router = express.Router();

import { getGameList, joinRoom, createRoom, verifyRoom } from '../controllers/GameController.js';
import { getScores } from '../controllers/ScoreController.js';

router.get('/game_list', getGameList);
router.post('/join_room', joinRoom);
router.post('/create_room', createRoom);
router.get('/verify_room/:id', verifyRoom);

router.get('/get_scores', getScores);

export default router;
