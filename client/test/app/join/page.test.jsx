import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Page from '@/app/join/page';
import React from 'react';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(key => {
    if (key === 'nickname') return 'testNickname';
    if (key === 'emoji') return '😊';
  });
  jest.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {});
  fetchMock.mockResponse(JSON.stringify([]));

});

describe('Join', () => {
    it('displays loading message when data is being fetched', async () => {
        await act(async () => {
          render(<Page />);
        });
        await waitFor(() => {
          const loadingElement = screen.getByText('Loading...');
          expect(loadingElement).toBeInTheDocument();
        });
    });
    
    it('should render nickname input after checking local storage and clicking back', async () => {
        render(<Page />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const backButton = screen.getByRole('button', { name: 'back' });
        fireEvent.click(backButton);
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Type your nickname')).toBeInTheDocument();
        });
    });

    it('handles nickname and emoji setup', async () => {
        render(<Page />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const backButton = screen.getByRole('button', { name: 'back' });
        fireEvent.click(backButton);
        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText('Type your nickname'), { target: { value: 'lol' } });
            fireEvent.click(screen.getByText('> Next'));
        });
        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith('nickname', 'lol');
            expect(fetchMock).toHaveBeenCalled();
        });
    });


    it('fetches game list and updates state', async () => {
        await act(async () => {
            fetchMock.mockResponseOnce(JSON.stringify([{ id: 1, emoji: '👾', difficulty: 'easy', playersCount: 3 }]));
            render(<Page />);
        });
        await waitFor(() => expect(screen.getByText('easy')).toBeInTheDocument());
    });

    it('handles game room creation', async () => {
        render(<Page />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        await waitFor(() => {
            expect(localStorage.getItem("nickname")).toBe("testNickname")
        });
        const createButton = screen.getByAltText('create');
        fireEvent.click(createButton);
        const easyRadioButton = screen.getByLabelText('Easy');
        expect(easyRadioButton).toHaveAttribute('checked', '');
        const mediumRadioButton = screen.getByLabelText('Medium');
        expect(mediumRadioButton).not.toHaveAttribute('checked');
        const hardRadioButton = screen.getByLabelText('Hard');
        expect(hardRadioButton).not.toHaveAttribute('checked');
    });


    it('closes modal when close button is clicked', async () => {
        render(<Page />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const backButton = screen.getByRole('button', { name: 'back' });
        fireEvent.click(backButton);
        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText('Type your nickname'), { target: { value: 'aaaaaaaaaaaaaaa' } });
            fireEvent.click(screen.getByText('> Next'));
        });
        await waitFor(() => {
            const errorMessage = screen.getByText('Nickname should be less than 10 characters');
            expect(errorMessage).toBeInTheDocument();
            
            const closeButton = screen.getByText('Close');
            fireEvent.click(closeButton);
        });
        await waitFor(() => {
            const modalElement = screen.queryByRole('dialog');
            expect(modalElement).not.toBeInTheDocument();
        });
    });

    it('goes back after clicking create', async () => {
        render(<Page />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const backButton = screen.getByRole('button', { name: 'back' });
        fireEvent.click(backButton);
        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText('Type your nickname'), { target: { value: 'test' } });
            fireEvent.click(screen.getByText('> Next'));
        });
        const createButton = screen.getByAltText('create');
        fireEvent.click(createButton);
        await waitFor(() => {
            fireEvent.click(screen.getByText('Back'));
        });
    });
    
    it('checks for button to launch the room', async () => {
        render(<Page />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const createIcon = screen.getByAltText('create');
        fireEvent.click(createIcon);
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        expect(screen.getByText('Create')).toBeInTheDocument();
        const createButton = screen.getByText('Create');
        fireEvent.click(createButton);
    });
});
