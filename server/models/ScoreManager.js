import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCORES_JSON_PATH = path.join(__dirname, '..', 'data', 'scores.json');

class ScoreManager {
    constructor() {
        this.scores = this.loadScoresFromFile();
    }

    loadScoresFromFile() {
        try {
            const data = fs.readFileSync(SCORES_JSON_PATH, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error reading scores from file:', error);
            return [];
        }
    }

    saveScoresToFile() {
        try {
            const data = JSON.stringify(this.scores, null, 2);
            fs.writeFileSync(SCORES_JSON_PATH, data, 'utf8');
        } catch (error) {
            console.error('Error writing scores to file:', error);
        }
    }

    updateScore(name, score) {
        if (score === 0) return ;
        
        if (this.scores.length < 10 || score > this.scores[9].score)
            this.addScore(name, score);
    }

    addScore(name, score) {
        const info = {
            name,
            score,
            date: new Date().toISOString()
        }
        console.log('check date: ', info.date);
        this.scores.push(info);
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, 10);
        this.saveScoresToFile();
    }

    getScores() {
        return this.scores;
    }
}

export const scoreManager = new ScoreManager();