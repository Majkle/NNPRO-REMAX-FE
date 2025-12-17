import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Star, MapPin, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Review, User as UserType, UserRole, PropertyType, PropertyStatus, TransactionType, Property } from '@/types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import reviewService from '@/services/reviewService';
import authService from '@/services/authService';
import propertyService from '@/services/propertyService';

const AgentProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [agent, setAgent] = useState<UserType>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0.0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setIsLoading(true);
        const fetchedAgent = await authService.getSpecificProfile(parseInt(id || ''));

        setAgent(fetchedAgent);
      } catch (error) {
        console.error('Failed to fetch agent:', error);
        toast({
          title: 'Chyba při načítání makléře',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const fetchedProperties = await propertyService.getPropertiesByAgent(parseInt(id || ''));

        setProperties(fetchedProperties);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        toast({
          title: 'Chyba při načítání nemovitostí',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const fetchedReviews = await reviewService.getAgentReviews(parseInt(id || ''));

        let idSet: Record<number, UserType> = {};
        for (const r of fetchedReviews) {
          if (!(r.realtorId in idSet)) {
            const user = await authService.getSpecificProfile(r.realtorId);
            idSet[r.realtorId] = user;
          }
          r.agent = idSet[r.realtorId];

          if (r.authorClientId) {
            if (!(r.authorClientId in idSet)) {
              const user = await authService.getSpecificProfile(r.authorClientId);
              idSet[r.authorClientId] = user;
            }
            r.author = idSet[r.authorClientId];
          }
        }

        setReviews(fetchedReviews);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        toast({
          title: 'Chyba při načítání recenzí',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
    fetchProperties();
    fetchReviews();
  }, []);

  useEffect(() => {
    setAverageRating(reviews.length > 0
                         ? reviews.reduce((sum, review) => sum + review.overall, 0) / reviews.length
                         : 0);
  }, [reviews]);

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!agent) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Makléř nenalezen</h2>
        <Button onClick={() => navigate('/properties')}>
          Zpět na přehled
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {agent.personalInformation.firstName} {agent.personalInformation.lastName}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">Realitní makléř</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="properties">
                Nemovitosti ({properties.length})
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Recenze ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-6 space-y-4">
              {properties.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Tento makléř zatím nemá žádné aktivní nabídky.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                properties.map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 aspect-video md:aspect-square relative bg-muted">
                        <img
                          src={property.images[0]?.url}
                          alt={property.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Badge variant={getStatusBadgeVariant(property.status)}>
                            {getStatusLabel(property.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">
                              {property.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {property.address.city}, {property.address.street}
                            </div>
                          </div>
                          <Badge variant="outline">{getTypeLabel(property.type)}</Badge>
                        </div>
                        <p className="text-2xl font-bold text-primary mb-4">
                          {formatPrice(property.price, property.contractType)}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <span>{property.usableArea} m²</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Zatím žádné recenze.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">
                            {review.author && review.author.personalInformation.firstName} {review.author && review.author.personalInformation.lastName}
                          </CardTitle>
                        </div>
                        {renderStars(review.overall)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{review.text}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 pb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <CardTitle>
                    {agent.personalInformation.firstName} {agent.personalInformation.lastName}
                  </CardTitle>
                  <CardDescription>Realitní makléř</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 pb-4 border-b">
                {agent.personalInformation.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${agent.personalInformation.phoneNumber}`} className="hover:text-primary">
                      {agent.personalInformation.phoneNumber}
                    </a>
                  </div>
                )}
                {agent.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${agent.email}`} className="hover:text-primary break-all">
                      {agent.email}
                    </a>
                  </div>
                )}
              </div>

              <Button className="w-full" onClick={() => navigate('/appointments/new')}>
                <Calendar className="mr-2 h-4 w-4" />
                Naplánovat schůzku
              </Button>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiky</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Aktivní nabídky:</span>
                <span className="text-lg font-bold">{properties.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hodnocení:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Počet recenzí:</span>
                <span className="text-lg font-bold">{reviews.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentProfilePage;
