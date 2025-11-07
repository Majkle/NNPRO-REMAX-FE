import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyStatus, PropertyType, TransactionType } from '@/types';
import { mockProperties } from '@/data/mockData';

const PropertiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [transactionFilter, setTransactionFilter] = useState<string>('all');

  const filteredProperties = useMemo(() => {
    return mockProperties.filter(property => {
      const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'all' || property.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesTransaction = transactionFilter === 'all' || property.contractType === transactionFilter;

      return matchesSearch && matchesType && matchesStatus && matchesTransaction;
    });
  }, [searchTerm, typeFilter, statusFilter, transactionFilter, mockProperties]);

  const getStatusBadgeVariant = (status: PropertyStatus) => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return 'default';
      case PropertyStatus.RESERVED:
        return 'secondary';
      case PropertyStatus.BOUGHT:
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: PropertyStatus) => {
    const labels: Record<PropertyStatus, string> = {
      [PropertyStatus.AVAILABLE]: 'Dostupné',
      [PropertyStatus.RESERVED]: 'Rezervováno',
      [PropertyStatus.BOUGHT]: 'Prodáno',
    };
    return labels[status];
  };

  const getTypeLabel = (type: PropertyType) => {
    const labels: Record<PropertyType, string> = {
      [PropertyType.APARTMENT]: 'Byt',
      [PropertyType.HOUSE]: 'Dům',
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
    return transactionType === TransactionType.RENTAL ? `${formatted}/měsíc` : formatted;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nemovitosti</h1>
          <p className="text-muted-foreground mt-1">Procházejte dostupné nemovitosti</p>
        </div>
        <Button asChild>
          <Link to="/properties/new">
            <Plus className="mr-2 h-4 w-4" />
            Přidat nemovitost
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Vyhledávání a filtry</CardTitle>
          <CardDescription>Najděte nemovitost podle svých preferencí</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Typ nemovitosti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny typy</SelectItem>
                <SelectItem value={PropertyType.APARTMENT}>Byt</SelectItem>
                <SelectItem value={PropertyType.HOUSE}>Dům</SelectItem>
                <SelectItem value={PropertyType.LAND}>Pozemek</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny stavy</SelectItem>
                <SelectItem value={PropertyStatus.AVAILABLE}>Dostupné</SelectItem>
                <SelectItem value={PropertyStatus.RESERVED}>Rezervováno</SelectItem>
                <SelectItem value={PropertyStatus.BOUGHT}>Prodáno</SelectItem>
              </SelectContent>
            </Select>

            {/* Transaction Type Filter */}
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Typ transakce" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechny transakce</SelectItem>
                <SelectItem value={TransactionType.SALE}>Prodej</SelectItem>
                <SelectItem value={TransactionType.RENTAL}>Pronájem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            Nalezeno {filteredProperties.length} {filteredProperties.length === 1 ? 'nemovitost' : 'nemovitostí'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Link key={property.id} to={`/properties/${property.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video relative bg-muted overflow-hidden">
                  <img
                    src={property.images.find(img => img.isPrimary)?.url || property.images[0]?.url}
                    alt={property.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={getStatusBadgeVariant(property.status)}>
                      {getStatusLabel(property.status)}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {getTypeLabel(property.type)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {property.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">
                        {property.address.city}, {property.address.street}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Plocha:</span>
                      <span className="font-medium">{property.usableArea} m²</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-0">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(property.price, property.contractType)}
                  </p>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Žádné nemovitosti neodpovídají vybraným filtrům.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
