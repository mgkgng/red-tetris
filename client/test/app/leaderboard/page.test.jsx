import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Page from '@/app/leaderboard/page';

const mockRankData = [
  { id: 1, emoji: '🥇', name: 'Alice', score: 150, date: '2022-05-01T12:34:56Z' },
  { id: 2, emoji: '🥈', name: 'Bob', score: 120, date: '2022-04-25T11:22:33Z' }
];

describe('Page Component', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = jest.fn(() =>
      new Promise(resolve => setTimeout(() => resolve({
        json: () => Promise.resolve(mockRankData)
      }), 100))
    );
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('displays loading message initially', async () => {
    render(<Page />);
    const loadingMessage = await screen.findByText('Loading...');
    expect(loadingMessage).toBeInTheDocument();
  });

  it('renders rank data after loading', async () => {
    await act(async () => {
      render(<Page />);
    });
    await waitFor(async () => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('🥇')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('2022-05-01')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject('API is down'));
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
