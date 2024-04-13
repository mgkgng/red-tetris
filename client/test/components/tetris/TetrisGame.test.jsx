import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TetrisGame from '@/components/tetris/TetrisGame';

jest.mock('@/components/PlayerList', () => (props) => <div data-testid="mockPlayerList"></div>);

describe('TetrisGame', () => {
    const mockSocket = {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
        id: '123'
    };

    const players = [{ id: '123', name: 'Player1' }, { id: '456', name: 'Player2' }];
    const hostId = '123';
    const initialScores = new Map(players.map(player => [player.id, 0]));

    const props = {
        socket: mockSocket,
        players: players,
        hostId: hostId,
        scores: initialScores,
        setScores: jest.fn(),
        setPlayers: jest.fn(),
        setHostId: jest.fn(),
        gameStarted: false,
        setGameStarted: jest.fn()
    };

    beforeEach(() => {
        mockSocket.on.mockImplementation((event, callback) => {
            if (event === 'gameStarted') {
                setTimeout(() => act(callback), 50);
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing and handles socket events correctly', async () => {
        await act(async () => {
            render(<TetrisGame {...props} />);
        });

        expect(screen.getByTestId('mockPlayerList')).toBeInTheDocument();

        await act(async () => {
            mockSocket.on.mock.calls
                .filter(call => call[0] === 'gameStarted')
                .forEach(call => call[1]());
        });

        const startButton = screen.queryByText(/start/i);
        if (startButton) fireEvent.click(startButton);

        expect(mockSocket.emit).toHaveBeenCalledWith('startGame');
    });

    it('handles all key interactions correctly', async () => {
      await act(async () => {
          render(<TetrisGame {...props} gameStarted={true} />);
      });
    
      const gameArea = screen.getByTestId('gameArea');
      gameArea.focus();
    
      fireEvent.keyDown(gameArea, { key: 'ArrowLeft', code: 'ArrowLeft' });
      fireEvent.keyDown(gameArea, { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.keyDown(gameArea, { key: 'ArrowUp', code: 'ArrowUp' });
      fireEvent.keyDown(gameArea, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyUp(gameArea, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(gameArea, { key: ' ', code: 'Space' });
    
      expect(mockSocket.emit).toHaveBeenCalledWith('moveBlock', { left: true });
      expect(mockSocket.emit).toHaveBeenCalledWith('moveBlock', { left: false });
      expect(mockSocket.emit).toHaveBeenCalledWith('rotateBlock');
      expect(mockSocket.emit).toHaveBeenCalledWith('startAccelerate');
      expect(mockSocket.emit).toHaveBeenCalledWith('stopAccelerate');
      expect(mockSocket.emit).toHaveBeenCalledWith('hardDrop');
    });
    
  
});
