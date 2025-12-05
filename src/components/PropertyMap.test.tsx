import React from 'react';
import { render, screen } from '@testing-library/react';
import PropertyMap from './PropertyMap';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => (
    <div data-testid="map-container">
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({})),
  Marker: {
    prototype: {
      options: {
        icon: {},
      },
    },
  },
}));

describe('PropertyMap', () => {
  const defaultProps = {
    latitude: 50.0755,
    longitude: 14.4378,
    propertyName: 'Test Property',
    address: 'Test Street 123, Prague',
  };

  it('vykreslí kontejner mapy', () => {
    render(<PropertyMap {...defaultProps} />);

    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('vykreslí vrstvu dlaždic', () => {
    render(<PropertyMap {...defaultProps} />);

    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  it('vykreslí značku s polohou nemovitosti', () => {
    render(<PropertyMap {...defaultProps} />);

    expect(screen.getByTestId('marker')).toBeInTheDocument();
  });

  it('zobrazí název nemovitosti v popupu', () => {
    render(<PropertyMap {...defaultProps} />);

    expect(screen.getByText('Test Property')).toBeInTheDocument();
  });

  it('zobrazí adresu nemovitosti v popupu', () => {
    render(<PropertyMap {...defaultProps} />);

    expect(screen.getByText('Test Street 123, Prague')).toBeInTheDocument();
  });

  it('zpracuje různé souřadnice', () => {
    const props = {
      ...defaultProps,
      latitude: 49.1951,
      longitude: 16.6068,
      propertyName: 'Brno Property',
      address: 'Brno Street 456, Brno',
    };

    render(<PropertyMap {...props} />);

    expect(screen.getByText('Brno Property')).toBeInTheDocument();
    expect(screen.getByText('Brno Street 456, Brno')).toBeInTheDocument();
  });
});
