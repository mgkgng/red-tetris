import { FIX_OFFSET, Tetris } from "../../models/Tetris";
import { BOARD_ROWS, BOARD_COLS } from "../../constants";
import { Tetromino } from "../../models/Tetromino";

jest.mock("../../models/Tetromino");

describe("Tetris", () => {
  let tetris;
  const series = "1234567890";

  beforeEach(() => {
    Tetromino.mockClear();
    tetris = new Tetris();
    tetris.initialize(series, 0);
  });

  test("initialize should set initial properties", () => {
    expect(tetris.rows).toBe(BOARD_ROWS);
    expect(tetris.cols).toBe(BOARD_COLS);
    expect(tetris.currentPos).toEqual({
      row: -1,
      col: Math.floor(BOARD_COLS / 2),
    });
    expect(tetris.gameOver).toBe(false);
    expect(tetris.grid.every((row) => row.every((cell) => cell === 0))).toBe(
      true
    );
  });

  test("initializeGrid should create an empty grid", () => {
    const grid = tetris.initializeGrid(BOARD_ROWS, BOARD_COLS);
    expect(grid.length).toBe(BOARD_ROWS);
    expect(grid[0].length).toBe(BOARD_COLS);
    expect(grid.every((row) => row.every((cell) => cell === 0))).toBe(true);
  });

  test("clearFullRows should remove full rows and add new empty rows at the top", () => {
    tetris.grid[BOARD_ROWS - 1] = new Array(BOARD_COLS).fill(1);
    const clearedRows = tetris.clearFullRows();
    expect(clearedRows).toEqual([BOARD_ROWS - 1]);
    expect(tetris.grid[0].every((cell) => cell === 0)).toBe(true);
    expect(tetris.grid[BOARD_ROWS - 1].every((cell) => cell === 0)).toBe(true);
  });

  test("addMalus should add malus rows and adjust current piece position", () => {
    const rowsToAdd = 2;
    tetris.currentPos.row = 5;
    const canContinue = tetris.addMalus(rowsToAdd);

    expect(tetris.grid.length).toBe(BOARD_ROWS);
    expect(tetris.grid[BOARD_ROWS - 1].some((cell) => cell === 255)).toBe(true);
    expect(tetris.grid[BOARD_ROWS - 2].some((cell) => cell === 255)).toBe(true);
    expect(canContinue).toBe(true);
    expect(tetris.currentPos.row).toBe(3);
  });

  test("placeCurrentPieceOnGrid should correctly place piece on the grid", () => {
    const mockPiece = {
      shape: 2,
      getEntirePosition: jest.fn().mockReturnValue([
        [0, 4],
        [0, 5],
      ]),
    };
    tetris.currentPiece = mockPiece;
    tetris.placeCurrentPieceOnGrid();

    expect(tetris.grid[0][4]).toBe(2);
    expect(tetris.grid[0][5]).toBe(2);
    expect(mockPiece.getEntirePosition).toHaveBeenCalledWith(
      -1,
      Math.floor(BOARD_COLS / 2)
    );
  });

  test("checkGameOver should detect game over when pieces reach the top", () => {
    tetris.grid[0][0] = 8;
    const isGameOver = tetris.checkGameOver();

    expect(isGameOver).toBe(true);
    expect(tetris.gameOver).toBe(true);
  });

  test("isPositionValid should return false for positions out of grid bounds or on fixed pieces", () => {
    expect(
      tetris.isPositionValid([
        [0, 0],
        [0, 1],
      ])
    ).toBe(true);

    tetris.grid[0][1] = FIX_OFFSET + 1;
    expect(
      tetris.isPositionValid([
        [0, 0],
        [0, 1],
      ])
    ).toBe(false);

    expect(tetris.isPositionValid([[BOARD_ROWS, 0]])).toBe(false);
    expect(tetris.isPositionValid([[-1, BOARD_COLS]])).toBe(false);
  });

  test("fixPiece should correctly fix the current piece on the grid", () => {
    tetris.currentPiece = new Tetromino(1);
    tetris.currentPiece.getEntirePosition = jest.fn().mockReturnValue([[0, 0]]);
    tetris.currentPos = { row: 0, col: 0 };
    tetris.fixPiece();

    expect(tetris.grid[0][0]).toBe(FIX_OFFSET + tetris.currentPiece.shape);
    expect(tetris.currentPiece.getEntirePosition).toHaveBeenCalledWith(0, 0);
  });

  test("addMalus should trigger game over if rows reach the top", () => {
    tetris.currentPos.row = 0;
    const gameOverSpy = jest
      .spyOn(tetris, "checkGameOver")
      .mockReturnValue(true);

    expect(tetris.addMalus(1)).toBe(false);
    expect(gameOverSpy).toHaveBeenCalled();
    expect(tetris.gameOver).toBe(false);
  });
});
