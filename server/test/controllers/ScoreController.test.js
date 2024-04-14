import { getBestScores } from '../../controllers/ScoreController';
import { scoreManager } from '../../models/ScoreManager';

// Mock the ScoreManager module
jest.mock('../../models/ScoreManager.js', () => {
  return {
    scoreManager: {
      getScores: jest.fn()
    }
  };
});

describe('Score Controller', () => {
  describe('getBestScores', () => {
    it('should return the best scores', () => {
      // Prepare
      const mockScores = [
        { name: 'Alice', score: 95 },
        { name: 'Bob', score: 89 }
      ];
      scoreManager.getScores.mockReturnValue(mockScores);

      const req = {};
      const res = { json: jest.fn() };

      // Execute
      getBestScores(req, res);

      // Assert
      expect(res.json).toHaveBeenCalledWith(mockScores);
      expect(scoreManager.getScores).toHaveBeenCalled();
    });
  });
});
