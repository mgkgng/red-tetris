import React from 'react';
import { render, screen } from '@testing-library/react';
import PlayerList from '@/components/PlayerList';

describe('PlayerList Component', () => {
    const players = [
        { id: '1', emoji: '😀', nickname: 'Player1' },
        { id: '2', emoji: '😃', nickname: 'Player2' },
        { id: '3', emoji: '😄', nickname: 'Player3' }
    ];
    const hostId = '1';
    const socketId = '2';
    const gameOverSet = new Set(['3']);

    it('applies host styling correctly', () => {
        render(<PlayerList players={players} hostId={hostId} socketId={socketId} gameOverSet={gameOverSet} />);
        const hostElement = screen.getByTestId(`player-${hostId}`);
        expect(hostElement).toHaveClass('border-2', 'border-red-300');
    });

    it('applies socketId styling correctly', () => {
        render(<PlayerList players={players} hostId={hostId} socketId={socketId} gameOverSet={gameOverSet} />);
        const activePlayerElement = screen.getByTestId(`player-${socketId}`);
        expect(activePlayerElement).toHaveClass('bg-green-400');
    });

    it('applies gameOver styling correctly', () => {
        render(<PlayerList players={players} hostId={hostId} socketId={socketId} gameOverSet={gameOverSet} />);
        const gameOverPlayerElement = screen.getByTestId(`player-${Array.from(gameOverSet)[0]}`);
        expect(gameOverPlayerElement).toHaveClass('bg-gray-400');
    });
});
