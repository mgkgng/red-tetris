import { scoreManager } from "../models/ScoreManager.js";

export const getBestScores = (req, res) => {
    res.json(scoreManager.getScores());
}