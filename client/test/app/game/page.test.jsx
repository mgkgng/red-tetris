import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import Page from '@/app/game/page';

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

describe('Page Component', () => {
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
  
	render(<Page />);
  
	await waitFor(() => {
	  expect(screen.queryByText('Room not found')).not.toBeInTheDocument();
	});
  });
});
