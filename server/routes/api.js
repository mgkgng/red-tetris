import express from 'express';
const router = express.Router();

// Import your controllers here
import { getGameList, joinRoom } from '../controllers/GameController.js';

// Define routes
router.get('/game_list', getGameList);
router.post('/join_room', joinRoom);

export default router;
