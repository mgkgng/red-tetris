import { Player } from "../../models/Player";
import { Tetris } from "../../models/Tetris";
import { TetrisScores } from "../../constants";

jest.mock("../../models/Tetris", () => {
  return {
    Tetris: jest.fn().mockImplementation(() => ({
      grid: Array.from({ length: 20 }, () => Array(10).fill(0)),
      intervalId: null,
      gameOver: false,
      currentPiece: {
        shape: "I",
        getEntirePosition: jest.fn().mockReturnValue([[1, 4]]),
        getRotatedPosition: jest.fn().mockReturnValue([[1, 4]]),
        rotate: jest.fn(),
      },
      currentPos: { row: 0, col: 4 },
      cleanCurrentPosition: jest.fn(),
      isPositionValid: jest.fn().mockReturnValue(true),
      fixPiece: jest.fn(),
      clearFullRows: jest.fn().mockReturnValue([]),
      updatePiece: jest.fn(),
      checkGameOver: jest.fn().mockReturnValue(false),
    })),
  };
});

jest.mock("../../models/ScoreManager", () => ({
  scoreManager: {
    addScore: jest.fn(),
  },
}));

describe("Player", () => {
  let mockSocket, player, mockRoom;

  beforeEach(() => {
    mockSocket = { id: "socket123" };
    mockRoom = {
      broadcast: jest.fn(),
      addMalusToPlayers: jest.fn(),
      afterClearLines: jest.fn(),
      checkGameEnd: jest.fn(),
      playing: false,
    };
    player = new Player(mockSocket, "John", "room1", "😊");
    player.room = mockRoom;
    player.game = new Tetris();
    jest.spyOn(player, "moveDown").mockImplementation(() => true);
  });

  test("initTetris initializes a new Tetris game", () => {
    player.initTetris(["I", "O", "T"]);
    expect(player.game).toBeDefined();
    expect(Tetris).toHaveBeenCalledTimes(2);
  });

  test("sendGameState should call room.broadcast if in a room", () => {
    player.sendGameState();
    expect(mockRoom.broadcast).toHaveBeenCalledWith("gameStateUpdate", {
      id: mockSocket.id,
      grid: player.game.grid,
    });
  });

  test("moveDown should update game state correctly", () => {
    expect(player.moveDown()).toBe(true);
    expect(player.game.grid).not.toContain("I");
  });

  test("rotate should manipulate piece orientation", () => {
    player.rotate();
    expect(player.game.currentPiece.getRotatedPosition).toHaveBeenCalled();
    expect(player.game.isPositionValid).toHaveBeenCalledWith([[1, 4]]);
  });

  test("startGameLoop starts the game interval when conditions are met", () => {
    jest.useFakeTimers();
    player.room.playing = true;
    player.game.gameOver = false;

    jest.spyOn(global, "setInterval");

    player.startGameLoop();

    expect(setInterval).toHaveBeenCalled();
    jest.advanceTimersByTime(player.game.dropInterval);

    expect(player.moveDown).toHaveBeenCalled();

    jest.useRealTimers();
  });

  test.each([true, false])("moveSide moves the piece %s", (left) => {
    player.game.gameOver = false;
    const expectedCol = left ? 3 : 5;
    player.moveSide(left);
    expect(player.game.currentPos.col).toBe(expectedCol);
  });

  test("hardDrop moves the piece down until it cannot move further and then handles the drop", () => {
    player.game.gameOver = false;
    const maxMoves = 5;
    let moveCount = 0;

    jest.spyOn(player, "moveDown").mockImplementation(() => {
      if (moveCount < maxMoves) {
        moveCount++;
        return true;
      }
      return false;
    });
    jest.spyOn(player, "afterDropped").mockImplementation(() => false);

    expect(player.hardDrop()).toBe(false);
    expect(player.moveDown).toBeCalledTimes(maxMoves + 1);
    expect(player.afterDropped).toBeCalled();
  });

  test("updateScore updates the player score and broadcasts the score update", () => {
    const initialScore = player.score;
    const linesCleared = 2;
    player.updateScore(linesCleared);

    expect(player.score).toBe(initialScore + TetrisScores[linesCleared]);
    expect(mockRoom.broadcast).toHaveBeenCalledWith("scoreUpdate", {
      player: player.socket.id,
      score: player.score,
    });
  });

  test("afterDropped handles piece fixing, row clearing, and game over checks", () => {
    player.game.gameOver = false;
    jest.spyOn(player.game, "clearFullRows").mockReturnValue([1]);
    jest.spyOn(player, "sendGameState");

    player.afterDropped();

    expect(player.afterDropped()).toBe(false);
    expect(player.game.fixPiece).toHaveBeenCalled();
    expect(player.game.updatePiece).toHaveBeenCalled();
    expect(player.sendGameState).toHaveBeenCalled();
  });

  test.each([true, false])(
    "moveSide does not change position on invalid move %s",
    (left) => {
      player.game.gameOver = false;
      player.game.currentPos = { row: 0, col: 4 };
      jest.spyOn(player.game, "isPositionValid").mockReturnValue(false);

      player.moveSide(left);
      expect(player.game.currentPos.col).toBe(4);
    }
  );
});
