import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import EmojiAccordeon from '@/components/EmojiAccordeon';

jest.mock('emoji-picker-react', () => ({
  __esModule: true,
  default: ({ onEmojiClick }) => (
    <div data-testid="emoji-picker" onClick={() => onEmojiClick({ emoji: '🎉' })}>
      Emoji Picker
    </div>
  )
}));

describe('EmojiAccordeon', () => {
    it('renders the component with an accordion', () => {
        render(<EmojiAccordeon onEmojiClick={() => {}} />);
        const accordionTitle = screen.getByText(/pick emoji/i);
        expect(accordionTitle).toBeInTheDocument();
        expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
    });

    it('calls the onEmojiClick when an emoji is clicked', () => {
        const mockOnEmojiClick = jest.fn();
        render(<EmojiAccordeon onEmojiClick={mockOnEmojiClick} />);

        const emojiPicker = screen.getByTestId('emoji-picker');
        fireEvent.click(emojiPicker);

        expect(mockOnEmojiClick).toHaveBeenCalledWith({ emoji: '🎉' });
    });
});
