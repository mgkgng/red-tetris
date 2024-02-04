class Room {
    constructor() {
        this.series = this.generateTetrominoSeries();
    }

    generateTetrominoSeries() {
        return Array.from({length: 256}, () => Math.floor(Math.random() * 7) + 1).join('');
    }
}