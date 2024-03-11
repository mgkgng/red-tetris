import { scoreManager } from "../models/ScoreManager.js";

export const getScores = (req, res) => {
    res.json(scoreManager.getScores());
}