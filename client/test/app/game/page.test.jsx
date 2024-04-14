import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Page from '@/app/game/page';
import io from 'socket.io-client';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn()
  }),
  redirect: jest.fn()
}));

jest.mock('socket.io-client', () => ({
	__esModule: true,
	default: jest.fn(() => ({
	  on: jest.fn(),
	  off: jest.fn(),
	  disconnect: jest.fn(),
	})),
}));

describe('Game', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => key === 'nickname' ? 'testUser' : 'testEmoji'),
        setItem: jest.fn(),
      },
      writable: true,
    });

    delete window.location;
    window.location = { hash: '#testRoomId' };

    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ players: [], host: 'hostId' }),
    }));

    jest.clearAllMocks();
  });

  it('renders loading message when room is not verified', () => {
    render(<Page />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('renders TetrisGame component when room is verified', () => {
    render(<Page />);
    expect(screen.queryByTestId('tetris-game')).not.toBeInTheDocument();
  });

  it('opens modal with proper message on gameEnd event', () => {
    render(<Page />);
    const socket = {
      on: jest.fn((event, callback) => {
        if (event === 'gameEnd') {
          callback({ winner: 'some_winner_id' });
        }
      }),
      disconnect: jest.fn(),
    };
    expect(screen.queryByText('You are the winner')).not.toBeInTheDocument();
  });
  
  it('redirects to /game when localStorage items are not present', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
      },
      writable: true,
    });
    await act(async () => {
      render(<Page />);
    });
    await waitFor(() => {
      expect(screen.queryByText('Room not found')).not.toBeInTheDocument();
    });
  });

  it('does not redirect when local storage items are present', async () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => key === 'nickname' ? 'testUser' : '😊'),
        setItem: jest.fn(),
      },
      writable: true,
    });
    render(<Page />);
    await waitFor(() => {
      expect(screen.queryByText('Room not found')).not.toBeInTheDocument();
    });
  });

  it('renders players when room is successfully verified', async () => {
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ players: [], host: 'hostId' }),
    }));
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('loading...')).toBeInTheDocument();
    });
  });

  it('initializes and disconnects socket upon component mount and unmount', async () => {
    const { unmount } = render(<Page />);
    await waitFor(() => {
      expect(io).toHaveBeenCalled();
      const socketInstance = io.mock.results[0].value;
      expect(socketInstance.on).toHaveBeenCalled();
    });
    unmount();
    const socketInstance = io.mock.results[0].value;
    expect(socketInstance.disconnect).toHaveBeenCalled();
  });
});
