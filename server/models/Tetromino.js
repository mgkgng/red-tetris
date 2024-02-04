import { TETROMINO_ROTATIONS } from "../constant.js";

export class Tetromino {
	constructor(shape) {
		this.shape = shape;
		this.rotate = 0;
	}

	getWholePosition(row, col) {
		return TETROMINO_ROTATIONS[this.shape - 1][this.rotate]
			.map(([r, c]) => [r + row, c + col])
	}

	getRotatedPosition(row, col) {
		return TETROMINO_ROTATIONS[this.shape - 1][(this.rotate + 1) % 4]
			.map(([r, c]) => [r + row, c + col])
	}
}
