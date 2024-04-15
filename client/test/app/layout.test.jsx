import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter-font' })
}));

describe('RootLayout', () => {
  let errorSpy;

  beforeAll(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  it('renders children and applies correct class names', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>,
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveTextContent('Test Child');

    const divElement = screen.getByText('Test Child').parentElement.parentElement;
  });
});
