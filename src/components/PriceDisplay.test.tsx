import React from 'react';
import { render, screen } from '@testing-library/react';
import PriceDisplay from './PriceDisplay';
import { TransactionType } from '@/types';

describe('PriceDisplay', () => {
  it('zobrazí cenu správně', () => {
    render(<PriceDisplay price={5000000} transactionType={TransactionType.SALE} />);

    // Check if price is displayed
    expect(screen.getByText(/5 000 000 Kč/i)).toBeInTheDocument();
  });

  it('zobrazí cenu s předchozí cenou a slevovým štítkem', () => {
    render(<PriceDisplay price={4500000} previousPrice={5000000} transactionType={TransactionType.SALE} />);

    // Check current price
    expect(screen.getByText(/4 500 000 Kč/i)).toBeInTheDocument();

    // Check that there's a percentage change displayed
    const percentage = screen.getByText(/-10.0%/);
    expect(percentage).toBeInTheDocument();
  });

  it('zobrazí štítek zvýšení ceny při nárůstu', () => {
    render(<PriceDisplay price={5500000} previousPrice={5000000} transactionType={TransactionType.SALE} />);

    // Check for increase indicator
    expect(screen.getByText(/\+10.0%/)).toBeInTheDocument();
  });

  it('nezobrazí procentní štítek pokud není předchozí cena', () => {
    render(<PriceDisplay price={5000000} transactionType={TransactionType.SALE} />);

    // Should not find any percentage text
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('nezobrazí procentní štítek pokud se cena nezměnila', () => {
    render(<PriceDisplay price={5000000} previousPrice={5000000} transactionType={TransactionType.SALE} />);

    // Should not find any percentage text when prices are same
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('formátuje velká čísla s mezerami', () => {
    render(<PriceDisplay price={12345678} transactionType={TransactionType.SALE} />);

    // Check formatting with spaces
    expect(screen.getByText(/12 345 678 Kč/i)).toBeInTheDocument();
  });

  it('zpracuje nulovou cenu', () => {
    render(<PriceDisplay price={0} transactionType={TransactionType.SALE} />);

    expect(screen.getByText(/0 Kč/i)).toBeInTheDocument();
  });

  it('zobrazí ceny pronájmů správně', () => {
    render(<PriceDisplay price={25000} transactionType={TransactionType.RENTAL} />);

    expect(screen.getByText(/25 000 Kč/i)).toBeInTheDocument();
  });
});
