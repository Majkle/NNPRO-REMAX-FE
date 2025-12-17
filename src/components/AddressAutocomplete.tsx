import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

export interface AddressData {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void;
  placeholder?: string;
  initialValue?: string;
  filterByCountryCode?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    country?: string;
  };
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onAddressSelect,
  placeholder = 'Zadejte adresu...',
  initialValue = '',
  filterByCountryCode = 'cz',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Nominatim API (OpenStreetMap) - FREE!
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(query)}&` +
          `countrycodes=${filterByCountryCode}&` +
          `format=json&` +
          `addressdetails=1&` +
          `limit=5`,
          {
            headers: {
              'Accept-Language': 'cs',
            },
          }
        );

        if (response.ok) {
          const data: NominatimResult[] = await response.json();
          setSuggestions(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [query, filterByCountryCode]);

  const handleSelect = (result: NominatimResult) => {
    const address = result.address;

    // Build street address
    let street = '';
    if (address.road) {
      street = address.road;
      if (address.house_number) {
        street += ' ' + address.house_number;
      }
    }

    const addressData: AddressData = {
      street: street || result.display_name.split(',')[0],
      city: address.city || address.town || address.village || '',
      postalCode: address.postcode || '',
      country: address.country || 'Česká republika',
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      fullAddress: result.display_name,
    };

    setQuery(result.display_name);
    setIsOpen(false);
    onAddressSelect(addressData);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />

      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((result) => (
            <button
              key={result.place_id}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="text-sm font-medium text-gray-900">
                {result.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && query.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
          <p className="text-sm text-gray-500">
            Žádné výsledky. Zkuste zadat přesnější adresu.
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-1">
        Geocoding pomocí OpenStreetMap Nominatim
      </p>
    </div>
  );
};

export default AddressAutocomplete;
