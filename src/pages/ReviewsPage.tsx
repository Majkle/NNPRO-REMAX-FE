import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Search, User as UserIcon, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Review, UserRole, User } from '@/types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import reviewService from '@/services/reviewService';
import authService from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ReviewEditDialog from '@/components/ReviewEditDialog';

const ReviewsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const fetchedReviews = await reviewService.getAllReviews();

      let idSet: Record<number, User> = {};
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

  fetchReviews();
  }, []);

  // Refetch reviews after delete or edit
  const refetchReviews = async () => {
    try {
      setIsLoading(true);
      const fetchedReviews = await reviewService.getAllReviews();

      let idSet: Record<number, User> = {};
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
      console.error('Failed to refetch reviews:', error);
      toast({
        title: 'Chyba při načítání recenzí',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete review
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      await reviewService.deleteReview(reviewToDelete.id);
      toast({
        title: 'Recenze smazána',
        description: 'Vaše recenze byla úspěšně smazána.',
      });
      setReviewToDelete(null);
      await refetchReviews();
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast({
        title: 'Chyba při mazání recenze',
        description: 'Nepodařilo se smazat recenzi. Zkuste to prosím znovu.',
        variant: 'destructive',
      });
    }
  };

  // Update review
  const handleUpdateReview = async (reviewId: number, data: { rating: number; comment: string; realtorId: number }) => {
    try {
      await reviewService.updateReview(reviewId, {
        overall: data.rating,
        speed: data.rating,
        communication: data.rating,
        professionality: data.rating,
        fairness: data.rating,
        text: data.comment,
        realtorId: data.realtorId,
      });
      toast({
        title: 'Recenze upravena',
        description: 'Vaše recenze byla úspěšně upravena.',
      });
      await refetchReviews();
    } catch (error) {
      console.error('Failed to update review:', error);
      toast({
        title: 'Chyba při úpravě recenze',
        description: 'Nepodařilo se upravit recenzi. Zkuste to prosím znovu.',
        variant: 'destructive',
      });
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  // Check if current user is a client
  const canReview = user?.role === UserRole.CLIENT;

  // Check if current user is the author of a review
  const isReviewAuthor = (review: Review) => {
    return user?.id === review.authorClientId;
  };

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
    const sum = reviews.reduce((acc, review) => acc + review.overall, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.agent?.personalInformation.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.agent?.personalInformation.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = filterRating === 'all' || review.overall.toString() === filterRating;

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
        { canReview && (
        <Link to="/reviews/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Přidat recenzi
          </Button>
        </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Celkem recenzí</p>
                <p className="text-3xl font-bold">{reviews.length}</p>
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
                <p className="text-3xl font-bold">{getAverageRating(reviews)}</p>
              </div>
              {renderStars(Math.round(Number(getAverageRating(reviews))))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">5★ recenzí</p>
                <p className="text-3xl font-bold">
                  {reviews.filter(r => r.overall === 5).length}
                </p>
              </div>
              <Badge variant="default" className="text-lg">
                {reviews.length > 0 ? Math.round((reviews.filter(r => r.overall === 5).length / reviews.length) * 100) : 0}%
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
                        {review.author.personalInformation.firstName} {review.author.personalInformation.lastName}
                      </CardTitle>
                    </div>
                  </div>
                  {review.agent && (
                    <div className="flex items-center gap-2 ml-13 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Makléř: {review.agent.personalInformation.firstName} {review.agent.personalInformation.lastName}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {renderStars(review.overall)}
                  {isReviewAuthor(review) && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewToEdit(review)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReviewToDelete(review)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{review.text}</p>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!reviewToDelete} onOpenChange={(open) => !open && setReviewToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat recenzi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tato akce je nevratná. Recenze bude trvale smazána a nebude možné ji obnovit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Review Dialog */}
      {reviewToEdit && (
        <ReviewEditDialog
          review={reviewToEdit}
          open={!!reviewToEdit}
          onOpenChange={(open) => !open && setReviewToEdit(null)}
          onSave={handleUpdateReview}
        />
      )}
    </div>
  );
};

export default ReviewsPage;
