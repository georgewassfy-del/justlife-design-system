import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { renderWithTheme } from '../../test-utils';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its label', () => {
    renderWithTheme(<Badge tone="success">Save 33%</Badge>);
    expect(screen.getByText('Save 33%')).toBeInTheDocument();
  });

  it('renders with an icon and an accessible label', () => {
    renderWithTheme(
      <Badge tone="rating" icon="star" iconFilled accessibilityLabel="Rated 5.0">
        5.0
      </Badge>,
    );
    expect(screen.getByLabelText('Rated 5.0')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithTheme(<Badge tone="neutral">New</Badge>);
    expect((await axe(container)).violations).toEqual([]);
  });
});
