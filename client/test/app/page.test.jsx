import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home component', () => {
    it('renders without crashing', () => {
        render(<Home />);
        expect(screen.getByText('TETRISSIMO')).toBeInTheDocument();
        expect(screen.getByText('Play')).toBeInTheDocument();
        expect(screen.getByText('Rank')).toBeInTheDocument();
    });

    it('contains links to play and leaderboard pages', () => {
        render(<Home />);
        const playLink = screen.getByText('Play').closest('a');
        const rankLink = screen.getByText('Rank').closest('a');

        expect(playLink).toHaveAttribute('href', '/join');
        expect(rankLink).toHaveAttribute('href', '/leaderboard');
    });

    it('checks CSS properties are applied', () => {
        render(<Home />);
        const title = screen.getByText('TETRISSIMO');

        expect(title).toHaveClass('title');
    });
});
