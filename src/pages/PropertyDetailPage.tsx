import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Edit,
  User,
  Phone,
  Mail,
  Home,
  Building,
  TreeDeciduous,
  Zap,
  Wifi,
  Car,
  Bus,
  School,
  ShoppingCart,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Property,
  PropertyStatus,
  PropertyType,
  TransactionType,
  UserRole,
  Equipment,
  BuildingCondition,
  EnergyEfficiencyClass,
  ConstructionMaterial,
  BuildingLocation,
  InternetConnection,
  ApartmentOwnershipType,
  HouseType,
  utilitiesFromAPI,
  transportFromAPI,
  civicAmenitiesFromAPI
} from '@/types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { mockProperties } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import PriceDisplay from '@/components/PriceDisplay';
import PropertyMap from '@/components/PropertyMap';
import propertyService from '@/services/propertyService';
import userService from '@/services/userService';

const PropertyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property>();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const fetchProperty = async () => {
      try {
        const response = await propertyService.getProperty(Number(id));

        // If agent data is not included in the property response, fetch it separately
        if (!response.agent && response.agentId) {
          try {
            const agentData = await userService.getUserProfile(response.agentId);
            response.agent = agentData;
          } catch (agentError) {
            console.error('Failed to fetch agent data:', agentError);
          }
        }

        // Transform backend format to frontend format if needed
        if ((response.utilities as any).availableUtilities) {
          response.utilities = utilitiesFromAPI(response.utilities as any);
        }
        if ((response.transportPossibilities as any).possibilities) {
          response.transportPossibilities = transportFromAPI(response.transportPossibilities as any);
        }
        if ((response.civicAmenities as any).amenities) {
          response.civicAmenities = civicAmenitiesFromAPI(response.civicAmenities as any);
        }

        setProperty(response);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Image gallery state
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Check if current user is the agent who owns this property
  const canEdit = user?.id === property?.agentId && user?.role === UserRole.AGENT;
  // Check if current user is a client
  const canMeet = user?.role === UserRole.CLIENT;

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
    const labels = {
      [PropertyStatus.AVAILABLE]: 'Dostupné',
      [PropertyStatus.RESERVED]: 'Rezervováno',
      [PropertyStatus.BOUGHT]: 'Prodáno',
    };
    return labels[status];
  };

  const getTypeLabel = (type: PropertyType) => {
    const labels = {
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

  const getEquipmentLabel = (equipment: Equipment) => {
    const labels = {
      [Equipment.FURNISHED]: 'Zařízený',
      [Equipment.UNFURNISHED]: 'Nezařízený',
      [Equipment.PARTIALLY_FURNISHED]: 'Částečně zařízený',
    };
    return labels[equipment];
  };

  const getBuildingConditionLabel = (condition: BuildingCondition) => {
    const labels = {
      [BuildingCondition.NEW]: 'Nový',
      [BuildingCondition.RENOVATED]: 'Rekonstruovaný',
      [BuildingCondition.GOOD]: 'Dobrý stav',
      [BuildingCondition.NEEDS_RENOVATION]: 'Vyžaduje rekonstrukci',
      [BuildingCondition.DILAPIDATED]: 'Špatný stav',
    };
    return labels[condition];
  };

  const getMaterialLabel = (material: ConstructionMaterial) => {
    const labels = {
      [ConstructionMaterial.BRICK]: 'Cihla',
      [ConstructionMaterial.PANEL]: 'Panel',
      [ConstructionMaterial.WOOD]: 'Dřevo',
      [ConstructionMaterial.STONE]: 'Kámen',
      [ConstructionMaterial.OTHER]: 'Jiné',
    };
    return labels[material];
  };

  const getLocationLabel = (location: BuildingLocation) => {
    const labels = {
      [BuildingLocation.CITY_CENTER]: 'Centrum města',
      [BuildingLocation.SUBURBS]: 'Předměstí',
      [BuildingLocation.RURAL_AREA]: 'Venkov',
      [BuildingLocation.QUITE_AREA]: 'Klidná oblast',
    };
    return labels[location];
  };

  const getInternetLabel = (internet: InternetConnection) => {
    const labels = {
      [InternetConnection.NONE]: 'Bez připojení',
      [InternetConnection.DSL]: 'DSL',
      [InternetConnection.CABLE]: 'Kabelové',
      [InternetConnection.FIBER_OPTIC]: 'Optické vlákno',
      [InternetConnection.SATELLITE]: 'Satelitní',
    };
    return labels[internet];
  };

  const getPropertyInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!property) {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Načítání nemovitosti...</h2>
        </div>
      );
    } else {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Nemovitost nenalezena</h2>
          <Button onClick={() => navigate('/properties')}>
            Zpět na přehled
          </Button>
        </div>
      );
    }
  }

  const renderApartmentDetails = () => {
    if (property.type !== PropertyType.APARTMENT) return null;
    const apt = property;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Počet pokojů:</span>
          <span className="font-medium">{apt.rooms}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Podlaží:</span>
          <span className="font-medium">{apt.floor} z {apt.totalFloors}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Výtah:</span>
          <span className="font-medium">{apt.elevator ? 'Ano' : 'Ne'}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Balkon:</span>
          <span className="font-medium">{apt.balcony ? 'Ano' : 'Ne'}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Typ vlastnictví:</span>
          <span className="font-medium">
            {apt.ownershipType === ApartmentOwnershipType.OWNERSHIP ? 'Osobní' : 'Družstevní'}
          </span>
        </div>
      </div>
    );
  };

  const renderHouseDetails = () => {
    if (property.type !== PropertyType.HOUSE) return null;
    const house = property;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Plocha pozemku:</span>
          <span className="font-medium">{house.plotArea} m²</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Typ domu:</span>
          <span className="font-medium">
            {house.houseType === HouseType.DETACHED && 'Rodinný'}
            {house.houseType === HouseType.SEMI_DETACHED && 'Dvojdomek'}
            {house.houseType === HouseType.TERRACED && 'Řadový'}
            {house.houseType === HouseType.END_TERRACE && 'Koncový řadový'}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Počet pater:</span>
          <span className="font-medium">{house.stories}</span>
        </div>
      </div>
    );
  };

  const renderLandDetails = () => {
    if (property.type !== PropertyType.LAND) return null;
    const land = property;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex justify-between py-2 border-b">
          <span className="text-muted-foreground">Určeno pro bydlení:</span>
          <span className="font-medium">{land.isForHousing ? 'Ano' : 'Ne'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{property.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              {property.address.street}, {property.address.city}
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/properties/edit/${id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Upravit
            </Button>
          </div>
        )}
      </div>

      {/* Main Image */}
      <Card className="overflow-hidden">
        <div className="aspect-video relative bg-muted">
          {(selectedImageUrl || (property.images && property.images.length > 0 && (property.images.find(img => img.isPrimary)?.url || property.images[0]?.url))) ? (
            <img
              src={selectedImageUrl ||
                (property.images.find(img => img.isPrimary)?.url || property.images[0]?.url)}
              alt={property.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-purple-100 flex items-center justify-center">
              <span className="text-8xl font-bold text-purple-600">
                {getPropertyInitials(property.name)}
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant={getStatusBadgeVariant(property.status)}>
              {getStatusLabel(property.status)}
            </Badge>
            <Badge variant="outline">{getTypeLabel(property.type)}</Badge>
          </div>
        </div>
        {property.images && property.images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {property.images.map((image) => (
              <div
                key={image.id}
                className="flex-shrink-0"
                onClick={() => setSelectedImageUrl(image.url)}
              >
                <img
                  src={image.url}
                  alt="Property thumbnail"
                  className={`w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity border-2 ${
                    (selectedImageUrl === image.url || (!selectedImageUrl && image.isPrimary))
                      ? 'border-primary'
                      : 'border-transparent'
                  }`}
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
              <CardTitle>
                <PriceDisplay
                  price={property.price}
                  previousPrice={property.previousPrice}
                  transactionType={property.contractType}
                  showBadge={true}
                />
              </CardTitle>
              <CardDescription>
                {property.contractType === TransactionType.RENTAL ? 'Měsíční nájemné' : 'Prodejní cena'}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Tabs for organized information */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 h-auto p-2">
              <TabsTrigger value="details">Detaily</TabsTrigger>
              <TabsTrigger value="utilities">Vybavení</TabsTrigger>
              <TabsTrigger value="transport">Doprava</TabsTrigger>
              <TabsTrigger value="amenities">Občanská vybavenost</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
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

              {/* Key Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Základní parametry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Užitná plocha:</span>
                      <span className="font-medium">{property.usableArea} m²</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Vybavení:</span>
                      <span className="font-medium">{getEquipmentLabel(property.equipment)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Sklep:</span>
                      <span className="font-medium">{property.basement ? 'Ano' : 'Ne'}</span>
                    </div>
                    {property.availableFrom && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Volné od:</span>
                        <span className="font-medium">
                          {format(property.availableFrom, 'd. MMMM yyyy', { locale: cs })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Type-specific details */}
                  {renderApartmentDetails()}
                  {renderHouseDetails()}
                  {renderLandDetails()}
                </CardContent>
              </Card>

              {/* Building Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Parametry budovy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Materiál:</span>
                      <span className="font-medium">{getMaterialLabel(property.buildingProperties.constructionMaterial)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Stav:</span>
                      <span className="font-medium">{getBuildingConditionLabel(property.buildingProperties.buildingCondition)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Energetická třída:</span>
                      <Badge variant="outline">{property.buildingProperties.energyEfficiencyClass}</Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Lokalita:</span>
                      <span className="font-medium">{getLocationLabel(property.buildingProperties.buildingLocation)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Ochranné pásmo:</span>
                      <span className="font-medium">{property.buildingProperties.inProtectionZone  ? 'Ano' : 'Ne'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="utilities" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Inženýrské sítě a vybavení
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasWater ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasWater ? 'text-muted-foreground' : ''}>Vodovod</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasWell ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasWell ? 'text-muted-foreground' : ''}>Studna</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasElectricity ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasElectricity ? 'text-muted-foreground' : ''}>Elektřina</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasGas ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasGas ? 'text-muted-foreground' : ''}>Plyn</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasSewerage ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasSewerage ? 'text-muted-foreground' : ''}>Kanalizace</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasCesspool ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasCesspool ? 'text-muted-foreground' : ''}>Žumpa</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasHeating ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasHeating ? 'text-muted-foreground' : ''}>Topení</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasPhoneLine ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasPhoneLine ? 'text-muted-foreground' : ''}>Telefonní linka</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasCableTV ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasCableTV ? 'text-muted-foreground' : ''}>Kabelová TV</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasRecycling ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasRecycling ? 'text-muted-foreground' : ''}>Třídění odpadu</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.utilities.hasBarrierFreeAccess ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.utilities.hasBarrierFreeAccess ? 'text-muted-foreground' : ''}>Bezbariérový přístup</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        Internet:
                      </span>
                      <span className="font-medium text-sm">{getInternetLabel(property.utilities.internetConnection)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Parkovací místa:
                      </span>
                      <span className="font-medium text-sm">{property.utilities.parkingPlaces}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transport" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    Dopravní dostupnost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      {property.transportPossibilities.road ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.transportPossibilities.road ? 'text-muted-foreground' : ''}>Silnice</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.transportPossibilities.highway ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.transportPossibilities.highway ? 'text-muted-foreground' : ''}>Dálnice</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.transportPossibilities.train ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.transportPossibilities.train ? 'text-muted-foreground' : ''}>Vlak</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.transportPossibilities.bus ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.transportPossibilities.bus ? 'text-muted-foreground' : ''}>Autobus</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.transportPossibilities.publicTransport ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.transportPossibilities.publicTransport ? 'text-muted-foreground' : ''}>MHD</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.transportPossibilities.airplane ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.transportPossibilities.airplane ? 'text-muted-foreground' : ''}>Letiště</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.transportPossibilities.boat ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.transportPossibilities.boat ? 'text-muted-foreground' : ''}>Lodní doprava</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.transportPossibilities.ferry ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.transportPossibilities.ferry ? 'text-muted-foreground' : ''}>Trajekt</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Občanská vybavenost v okolí
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.busStop ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.busStop ? 'text-muted-foreground' : ''}>Zastávka autobusu</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.trainStation ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.trainStation ? 'text-muted-foreground' : ''}>Vlakové nádraží</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.subway ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.subway ? 'text-muted-foreground' : ''}>Metro</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.postOffice ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.postOffice ? 'text-muted-foreground' : ''}>Pošta</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.atm ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.atm ? 'text-muted-foreground' : ''}>Bankomat</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.generalPractitioner ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.generalPractitioner ? 'text-muted-foreground' : ''}>Praktický lékař</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.veterinarian ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.veterinarian ? 'text-muted-foreground' : ''}>Veterinář</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.elementarySchool ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.elementarySchool ? 'text-muted-foreground' : ''}>Základní škola</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.kindergarten ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.kindergarten ? 'text-muted-foreground' : ''}>Mateřská škola</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.supermarket ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.supermarket ? 'text-muted-foreground' : ''}>Supermarket</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.smallShop ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.smallShop ? 'text-muted-foreground' : ''}>Malá prodejna</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.restaurant ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.restaurant ? 'text-muted-foreground' : ''}>Restaurace</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.pub ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.pub ? 'text-muted-foreground' : ''}>Hospoda</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {property.civicAmenities.playground ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={!property.civicAmenities.playground ? 'text-muted-foreground' : ''}>Dětské hřiště</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
                <div
                  className="flex items-center gap-3 pb-4 border-b cursor-pointer hover:bg-accent/50 transition-colors rounded-lg p-2 -m-2"
                  onClick={() => navigate(`/agents/${property.agent!.id}`)}
                >
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {property.agent.personalInformation.firstName} {property.agent.personalInformation.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Realitní makléř</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {property.agent.personalInformation.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${property.agent.personalInformation.phoneNumber}`} className="hover:text-primary">
                        {property.agent.personalInformation.phoneNumber}
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

                {canMeet && (
                <Button className="w-full" onClick={() => navigate('/appointments/new')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Naplánovat prohlídku
                </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Lokace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">{property.address.street}</p>
                  {property.address.flatNumber && (
                    <p className="text-sm text-muted-foreground">č.p. {property.address.flatNumber}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {property.address.city}, {property.address.postalCode}
                  </p>
                  <p className="text-sm text-muted-foreground">{property.address.country}</p>
                </div>
              </div>

              {/* Map */}
              {property.address.latitude && property.address.longitude && (
                <PropertyMap
                  latitude={property.address.latitude}
                  longitude={property.address.longitude}
                  propertyName={property.name}
                  address={`${property.address.street}, ${property.address.city}`}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
