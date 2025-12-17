import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Review } from '@/types';

// Validation schema
const editReviewSchema = z.object({
  rating: z.number().min(1, 'Hodnocení musí být alespoň 1').max(5, 'Hodnocení může být maximálně 5'),
  comment: z.string().min(10, 'Komentář musí mít alespoň 10 znaků').max(500, 'Komentář je příliš dlouhý'),
});

type EditReviewFormValues = z.infer<typeof editReviewSchema>;

interface ReviewEditDialogProps {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (reviewId: number, data: { rating: number; comment: string; realtorId: number }) => Promise<void>;
}

const ReviewEditDialog: React.FC<ReviewEditDialogProps> = ({
  review,
  open,
  onOpenChange,
  onSave
}) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditReviewFormValues>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      rating: review.overall,
      comment: review.text,
    },
  });

  const selectedRating = form.watch('rating');

  // Update form when review changes
  useEffect(() => {
    form.reset({
      rating: review.overall,
      comment: review.text,
    });
  }, [review, form]);

  const onSubmit = async (data: EditReviewFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave(review.id, {
        rating: data.rating,
        comment: data.comment,
        realtorId: review.realtorId,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => form.setValue('rating', star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= (hoveredStar || selectedRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Upravit recenzi</DialogTitle>
          <DialogDescription>
            Upravte své hodnocení nebo komentář
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Star Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hodnocení</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {renderStarRating()}
                      {selectedRating > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {selectedRating} {selectedRating === 1 ? 'hvězdička' : selectedRating < 5 ? 'hvězdičky' : 'hvězdiček'}
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Klikněte na hvězdičky pro ohodnocení (1-5)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Komentář</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Popište svou zkušenost s tímto makléřem..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimálně 10 znaků, maximálně 500 znaků
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Zrušit
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ukládání...
                  </>
                ) : (
                  'Uložit změny'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewEditDialog;
