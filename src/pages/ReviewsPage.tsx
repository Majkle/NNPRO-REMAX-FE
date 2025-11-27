import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Search, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Review, UserRole } from '@/types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

// Mock data - pouze recenze makléřů
const mockReviews: Review[] = [
  {
    id: 1,
    rating: 5,
    comment: 'Výborný makléř! Pan Novotný mi pomohl najít perfektní byt. Profesionální přístup, rychlá komunikace a perfektní znalost trhu.',
    agentId: 1,
    agent: {
      id: 1,
      username: 'petr.novotny.remax',
      email: 'petr.novotny@remax.cz',
      firstName: 'Petr',
      lastName: 'Novotný',
      phone: '+420 777 888 999',
      role: UserRole.AGENT,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    authorId: 2,
    author: {
      id: 2,
      username: 'jan.novak',
      email: 'jan.novak@example.com',
      firstName: 'Jan',
      lastName: 'Novák',
      role: UserRole.CLIENT,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 2,
    rating: 4,
    comment: 'Profesionální přístup, oceňuji rychlou komunikaci a ochotu. Doporučuji!',
    agentId: 1,
    agent: {
      id: 1,
      username: 'petr.novotny.remax',
      email: 'petr.novotny@remax.cz',
      firstName: 'Petr',
      lastName: 'Novotný',
      phone: '+420 777 888 999',
      role: UserRole.AGENT,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    authorId: 3,
    author: {
      id: 3,
      username: 'marie.svobodova',
      email: 'marie.svobodova@example.com',
      firstName: 'Marie',
      lastName: 'Svobodová',
      role: UserRole.CLIENT,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
    },
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 3,
    rating: 5,
    comment: 'Skvělá spolupráce! Makléř byl vždy k dispozici, poradil s financováním a celý proces proběhl hladce.',
    agentId: 2,
    agent: {
      id: 2,
      username: 'jana.dvorakova.remax',
      email: 'jana.dvorakova@remax.cz',
      firstName: 'Jana',
      lastName: 'Dvořáková',
      phone: '+420 606 555 444',
      role: UserRole.AGENT,
      createdAt: new Date('2023-03-15'),
      updatedAt: new Date('2023-03-15'),
    },
    authorId: 4,
    author: {
      id: 4,
      username: 'pavel.kral',
      email: 'pavel.kral@example.com',
      firstName: 'Pavel',
      lastName: 'Král',
      role: UserRole.CLIENT,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01'),
    },
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05'),
  },
];

const ReviewsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const filteredReviews = mockReviews.filter((review) => {
    const matchesSearch =
      review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.agent?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.agent?.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recenze makléřů</h1>
          <p className="text-muted-foreground">Hodnocení a zkušenosti s makléři</p>
        </div>
        <Link to="/reviews/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Přidat recenzi
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Celkem recenzí</p>
                <p className="text-3xl font-bold">{mockReviews.length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Průměrné hodnocení</p>
                <p className="text-3xl font-bold">{getAverageRating(mockReviews)}</p>
              </div>
              {renderStars(Math.round(Number(getAverageRating(mockReviews))))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">5★ recenzí</p>
                <p className="text-3xl font-bold">
                  {mockReviews.filter(r => r.rating === 5).length}
                </p>
              </div>
              <Badge variant="default" className="text-lg">
                {Math.round((mockReviews.filter(r => r.rating === 5).length / mockReviews.length) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledat v recenzích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger>
                <SelectValue placeholder="Hodnocení" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všechna hodnocení</SelectItem>
                <SelectItem value="5">5 hvězdiček</SelectItem>
                <SelectItem value="4">4 hvězdičky</SelectItem>
                <SelectItem value="3">3 hvězdičky</SelectItem>
                <SelectItem value="2">2 hvězdičky</SelectItem>
                <SelectItem value="1">1 hvězdička</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {review.author.firstName} {review.author.lastName}
                      </CardTitle>
                      <CardDescription>
                        {format(review.createdAt, 'd. MMMM yyyy', { locale: cs })}
                      </CardDescription>
                    </div>
                  </div>
                  {review.agent && (
                    <div className="flex items-center gap-2 ml-13 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Makléř: {review.agent.firstName} {review.agent.lastName}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {renderStars(review.rating)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{review.comment}</p>
            </CardContent>
          </Card>
        ))}

        {filteredReviews.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Žádné recenze</h3>
              <p className="text-muted-foreground">
                Nebyly nalezeny žádné recenze odpovídající vašim kritériím.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
