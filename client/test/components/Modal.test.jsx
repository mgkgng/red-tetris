import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Modal from '@/components/Modal';

describe('Modal Component', () => {
  const modalTitle = 'Test Modal';
  const modalBody = 'This is a modal. Click outside to close.';

  it('should not render the modal when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={() => {}} title={modalTitle}>{modalBody}</Modal>);
    expect(screen.queryByText(modalTitle)).toBeNull();
  });

  it('should render the modal when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={() => {}} title={modalTitle}>{modalBody}</Modal>);
    expect(screen.getByText(modalTitle)).toBeInTheDocument();
    expect(screen.getByText(modalBody)).toBeInTheDocument();
  });

  it('should call onClose when the overlay is clicked', () => {
    const onClose = jest.fn();
    render(<Modal isOpen={true} onClose={onClose} title={modalTitle}>{modalBody}</Modal>);

    fireEvent.click(screen.getByText(modalBody).closest('.modal-overlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when the modal content is clicked', () => {
    const onClose = jest.fn();
    render(<Modal isOpen={true} onClose={onClose} title={modalTitle}>{modalBody}</Modal>);

    fireEvent.click(screen.getByText(modalBody));
    expect(onClose).not.toHaveBeenCalled();
  });
});
