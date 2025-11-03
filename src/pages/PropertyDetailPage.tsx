import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Calendar, Edit, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property, PropertyStatus, PropertyType, TransactionType, UserRole } from '@/types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

// Mock data - in real app, this would be fetched from API
const mockProperty: Property = {
  id: 1,
  title: 'Moderní byt v centru Prahy',
  description: 'Krásný prostorný byt s výhledem na město. Nachází se v klidné lokalitě v centru Prahy, blízko metra a všech služeb. Byt je kompletně zrekonstruován a vybaven moderní kuchyňskou linkou včetně spotřebičů. K bytu náleží sklep a možnost parkování v podzemních garážích.',
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
    { id: 1, url: 'https://placehold.co/800x600/4F46E5/white?text=Byt+3%2Bkk', isPrimary: true, propertyId: 1 },
    { id: 2, url: 'https://placehold.co/800x600/7C3AED/white?text=Ob%C3%BDvac%C3%AD+pokoj', isPrimary: false, propertyId: 1 },
    { id: 3, url: 'https://placehold.co/800x600/2563EB/white?text=Kuchyn%C4%9B', isPrimary: false, propertyId: 1 },
  ],
  agentId: 1,
  agent: {
    id: 1,
    email: 'petr.novotny@remax.cz',
    firstName: 'Petr',
    lastName: 'Novotný',
    phone: '+420 777 888 999',
    role: UserRole.AGENT,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

const PropertyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // In real app, fetch property by ID
  const property = mockProperty;

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

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Nemovitost nenalezena</h2>
        <Button onClick={() => navigate('/properties')}>
          Zpět na přehled
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              {property.address.street}, {property.address.city}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/properties/edit/${id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Upravit
          </Button>
        </div>
      </div>

      {/* Main Image */}
      <Card className="overflow-hidden">
        <div className="aspect-video relative bg-muted">
          <img
            src={property.images.find(img => img.isPrimary)?.url || property.images[0]?.url}
            alt={property.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant={getStatusBadgeVariant(property.status)}>
              {getStatusLabel(property.status)}
            </Badge>
            <Badge variant="outline">{getTypeLabel(property.type)}</Badge>
          </div>
        </div>
        {property.images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {property.images.slice(1).map((image) => (
              <div key={image.id} className="flex-shrink-0">
                <img
                  src={image.url}
                  alt="Property thumbnail"
                  className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-primary">
                {formatPrice(property.price, property.transactionType)}
              </CardTitle>
              <CardDescription>
                {property.transactionType === TransactionType.RENT ? 'Měsíční nájemné' : 'Prodejní cena'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle>Základní parametry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Maximize className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{property.size}</p>
                  <p className="text-sm text-muted-foreground">m²</p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Bed className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{property.bedrooms}</p>
                  <p className="text-sm text-muted-foreground">ložnice</p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Bath className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{property.bathrooms}</p>
                  <p className="text-sm text-muted-foreground">koupelny</p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Calendar className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{property.yearBuilt}</p>
                  <p className="text-sm text-muted-foreground">rok výstavby</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Popis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Další informace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Počet pokojů:</span>
                  <span className="font-medium">{property.rooms}</span>
                </div>
                {property.floor !== undefined && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Podlaží:</span>
                    <span className="font-medium">{property.floor}</span>
                  </div>
                )}
                {property.energyClass && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Energetická třída:</span>
                    <Badge variant="outline">{property.energyClass}</Badge>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Přidáno:</span>
                  <span className="font-medium">
                    {format(property.createdAt, 'd. MMMM yyyy', { locale: cs })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Contact */}
          {property.agent && (
            <Card>
              <CardHeader>
                <CardTitle>Kontaktujte makléře</CardTitle>
                <CardDescription>Váš realitní agent pro tuto nemovitost</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {property.agent.firstName} {property.agent.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Realitní makléř</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {property.agent.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${property.agent.phone}`} className="hover:text-primary">
                        {property.agent.phone}
                      </a>
                    </div>
                  )}
                  {property.agent.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${property.agent.email}`} className="hover:text-primary">
                        {property.agent.email}
                      </a>
                    </div>
                  )}
                </div>

                <Button className="w-full" onClick={() => navigate('/appointments/new')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Naplánovat prohlídku
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Lokace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">{property.address.street}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.address.city}, {property.address.zipCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{property.address.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
