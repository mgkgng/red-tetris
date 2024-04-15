import { Tetromino } from "../../models/Tetromino";
import { TETROMINO_ROTATIONS, TETROMINO_CODES } from "../../constants";

describe("Tetromino", () => {
  const testShape = 1;
  let tetromino;

  beforeEach(() => {
    tetromino = new Tetromino(testShape);
  });

  test("constructor initializes the tetromino correctly", () => {
    expect(tetromino.shape).toBe(testShape);
    expect(tetromino.shapeCode).toBe(TETROMINO_CODES[testShape - 1]);
    expect(tetromino.rotate).toBe(0);
  });

  test("getEntirePosition returns correct positions based on current rotation", () => {
    const row = 5;
    const col = 5;
    const expectedPositions = TETROMINO_ROTATIONS[
      TETROMINO_CODES[testShape - 1]
    ][0].map(([r, c]) => [r + row, c + col]);

    const positions = tetromino.getEntirePosition(row, col);

    expect(positions).toEqual(expectedPositions);
  });

  test("getRotatedPosition returns correct positions for the next rotation state", () => {
    const row = 5;
    const col = 5;
    const nextRotationIndex = (tetromino.rotate + 1) % 4;
    const expectedPositions = TETROMINO_ROTATIONS[
      TETROMINO_CODES[testShape - 1]
    ][nextRotationIndex].map(([r, c]) => [r + row, c + col]);

    const positions = tetromino.getRotatedPosition(row, col);

    expect(positions).toEqual(expectedPositions);
  });
});
