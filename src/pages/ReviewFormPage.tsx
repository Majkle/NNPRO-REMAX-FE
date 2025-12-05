import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import reviewService from '@/services/reviewService';

// Mock agents data
const mockAgents = [
  { id: 1, firstName: 'Petr', lastName: 'Novotný' },
  { id: 2, firstName: 'Jana', lastName: 'Dvořáková' },
  { id: 3, firstName: 'Martin', lastName: 'Svoboda' },
];
// Validation schema
const reviewFormSchema = z.object({
  agentId: z.number().min(1, 'Vyberte makléře'),
  rating: z.number().min(1, 'Hodnocení musí být alespoň 1').max(5, 'Hodnocení může být maximálně 5'),
  comment: z.string().min(10, 'Komentář musí mít alespoň 10 znaků').max(500, 'Komentář je příliš dlouhý'),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

const ReviewFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      agentId: 0,
      rating: 0,
      comment: '',
    },
  });
  const selectedRating = form.watch('rating');

  const onSubmit = async (data: ReviewFormValues) => {
    setIsSubmitting(true);
    /*
    // --- BACKEND INTEGRATION ---
    try {
      await reviewService.createReview(data);
      toast({ title: 'Recenze přidána' });
      navigate('/reviews');
    } catch (error) {
      toast({ title: 'Chyba při odesílání', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
    */

    // Mock logic
    console.log('Review data:', data);
    const agent = mockAgents.find(a => a.id === data.agentId);
    toast({
      title: 'Recenze přidána (Mock)',
      description: `Vaše recenze pro makléře ${agent?.firstName} ${agent?.lastName} byla úspěšně přidána.`,
    });
    navigate('/reviews');
    setIsSubmitting(false);
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reviews')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Přidat recenzi</h1>
          <p className="text-muted-foreground">Ohodnoťte vašeho makléře</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nová recenze</CardTitle>
          <CardDescription>
            Podělte se o svou zkušenost s makléřem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Agent Selection */}
              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Makléř</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte makléře" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.firstName} {agent.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Vyberte makléře, kterého chcete ohodnotit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/reviews')} disabled={isSubmitting}>
                  Zrušit
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Odesílání...
                    </>
                  ) : (
                    'Odeslat recenzi'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewFormPage;
