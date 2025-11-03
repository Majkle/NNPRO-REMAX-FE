import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin, Bed, Bath, Maximize, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Property, PropertyStatus, PropertyType, TransactionType } from '@/types';

// Mock data - will be replaced with API calls
const mockProperties: Property[] = [
  {
    id: 1,
    title: 'Moderní byt v centru Prahy',
    description: 'Krásný prostorný byt s výhledem na město',
    price: 8500000,
    type: PropertyType.APARTMENT,
    status: PropertyStatus.AVAILABLE,
    transactionType: TransactionType.SALE,
    size: 85,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    floor: 4,
    yearBuilt: 2020,
    energyClass: 'A',
    address: {
      id: 1,
      street: 'Hlavní 123',
      city: 'Praha',
      zipCode: '110 00',
      country: 'Česká republika',
      latitude: 50.0755,
      longitude: 14.4378,
    },
    images: [
      { id: 1, url: 'https://placehold.co/600x400', isPrimary: true, propertyId: 1 }
    ],
    agentId: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 2,
    title: 'Rodinný dům s zahradou',
    description: 'Prostorný dům s velkou zahradou v klidné lokalitě',
    price: 35000,
    type: PropertyType.HOUSE,
    status: PropertyStatus.AVAILABLE,
    transactionType: TransactionType.RENT,
    size: 180,
    rooms: 5,
    bedrooms: 4,
    bathrooms: 2,
    yearBuilt: 2015,
    energyClass: 'B',
    address: {
      id: 2,
      street: 'Zahradní 45',
      city: 'Brno',
      zipCode: '602 00',
      country: 'Česká republika',
      latitude: 49.1951,
      longitude: 16.6068,
    },
    images: [
      { id: 2, url: 'https://placehold.co/600x400', isPrimary: true, propertyId: 2 }
    ],
    agentId: 1,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

const PropertiesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getStatusBadgeVariant = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return 'default';
      case PropertyStatus.RESERVED:
        return 'secondary';
      case PropertyStatus.SOLD:
      case PropertyStatus.RENTED:
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: PropertyStatus) => {
    const labels = {
      [PropertyStatus.AVAILABLE]: 'Dostupné',
      [PropertyStatus.RESERVED]: 'Rezervováno',
      [PropertyStatus.SOLD]: 'Prodáno',
      [PropertyStatus.RENTED]: 'Pronajato',
    };
    return labels[status];
  };

  const getTypeLabel = (type: PropertyType) => {
    const labels = {
      [PropertyType.APARTMENT]: 'Byt',
      [PropertyType.HOUSE]: 'Dům',
      [PropertyType.COMMERCIAL]: 'Komerční',
      [PropertyType.LAND]: 'Pozemek',
    };
    return labels[type];
  };

  const formatPrice = (price: number, transactionType: TransactionType) => {
    const formatted = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(price);
    return transactionType === TransactionType.RENT ? `${formatted}/měsíc` : formatted;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nemovitosti</h1>
          <p className="text-muted-foreground">Správa a přehled všech nemovitostí</p>
        </div>
        <Link to="/properties/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Přidat nemovitost
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Hledat nemovitosti..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Typ nemovitosti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny typy</SelectItem>
                <SelectItem value={PropertyType.APARTMENT}>Byty</SelectItem>
                <SelectItem value={PropertyType.HOUSE}>Domy</SelectItem>
                <SelectItem value={PropertyType.COMMERCIAL}>Komerční</SelectItem>
                <SelectItem value={PropertyType.LAND}>Pozemky</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Stav" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny stavy</SelectItem>
                <SelectItem value={PropertyStatus.AVAILABLE}>Dostupné</SelectItem>
                <SelectItem value={PropertyStatus.RESERVED}>Rezervované</SelectItem>
                <SelectItem value={PropertyStatus.SOLD}>Prodáno</SelectItem>
                <SelectItem value={PropertyStatus.RENTED}>Pronajato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden bg-muted">
              <img
                src={property.images[0]?.url}
                alt={property.title}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={getStatusBadgeVariant(property.status)}>
                  {getStatusLabel(property.status)}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="line-clamp-1">{property.title}</CardTitle>
                <Badge variant="outline">{getTypeLabel(property.type)}</Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {property.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {property.address.city}, {property.address.street}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Maximize className="mr-1 h-4 w-4" />
                  {property.size} m²
                </div>
                <div className="flex items-center">
                  <Bed className="mr-1 h-4 w-4" />
                  {property.bedrooms}
                </div>
                <div className="flex items-center">
                  <Bath className="mr-1 h-4 w-4" />
                  {property.bathrooms}
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatPrice(property.price, property.transactionType)}
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/properties/${property.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  Zobrazit detail
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockProperties.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Žádné nemovitosti</h3>
            <p className="text-muted-foreground mb-4">
              Zatím nejsou k dispozici žádné nemovitosti.
            </p>
            <Link to="/properties/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Přidat první nemovitost
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertiesPage;
