import { TETROMINO_ROTATIONS, TETROMINO_CODES } from "../constants.js";

export class Tetromino {
	constructor(shape) {
		this.shape = shape;
		this.shapeCode = TETROMINO_CODES[shape - 1];
		console.log('shape: ', this.shape)
		console.log('shape code: ', this.shapeCode)
		this.rotate = 0;
	}

	getEntirePosition(row, col) {
		return TETROMINO_ROTATIONS[this.shapeCode][this.rotate]
			.map(([r, c]) => [r + row, c + col])
	}

	getRotatedPosition(row, col) {
		return TETROMINO_ROTATIONS[this.shapeCode][(this.rotate + 1) % 4]
			.map(([r, c]) => [r + row, c + col])
	}
}
