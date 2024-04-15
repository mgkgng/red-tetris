import fs from "fs";
import path from "path";
import { ScoreManager } from "../../models/ScoreManager";

jest.mock("fs");
jest.mock("path");

describe("ScoreManager", () => {
  let scoreManager;
  const basePath = "/fake/path";
  const mockScores = [
    { name: "Alice", score: 20, emoji: "😊", date: "2021-01-01T12:00:00.000Z" },
    { name: "Bob", score: 15, emoji: "😂", date: "2021-01-02T13:00:00.000Z" },
  ];
  const mockScoreFilePath = `${basePath}/scores.json`;

  let errorSpy;

  beforeAll(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    path.join.mockReturnValue(mockScoreFilePath);
    fs.readFileSync.mockReturnValue(JSON.stringify(mockScores));
    fs.writeFileSync.mockImplementation(() => {});
    scoreManager = new ScoreManager();
  });

  test("loads scores from file on initialization", () => {
    expect(scoreManager.scores).toEqual(mockScores);
  });

  test("handles errors when reading scores from file", () => {
    fs.readFileSync.mockImplementationOnce(() => {
      throw new Error("Failed to read");
    });
    const scoreManagerError = new ScoreManager();
    expect(scoreManagerError.scores).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  test("saves scores to file", () => {
    const newScore = {
      name: "Charlie",
      score: 25,
      emoji: "🤣",
      date: new Date().toISOString(),
    };
    scoreManager.addScore(newScore);

    const expectedJson = JSON.stringify(scoreManager.scores, null, 2);
  });

  test("adds a new score and sorts list", () => {
    const newScore = {
      name: "Charlie",
      score: 25,
      emoji: "🤣",
      date: new Date().toISOString(),
    };
    scoreManager.addScore(newScore);

    expect(scoreManager.scores[0]).toEqual(newScore);
  });

  test("does not add score if it is zero", () => {
    const zeroScore = {
      name: "Zero",
      score: 0,
      emoji: "😑",
      date: new Date().toISOString(),
    };
    scoreManager.addScore(zeroScore);

    expect(scoreManager.scores).not.toContain(zeroScore);
  });

  test("getScores returns current list of scores", () => {
    expect(scoreManager.getScores()).toEqual(mockScores);
  });
});
