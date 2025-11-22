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

  const renderStarRating = () => { /* ... */ };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ... Header and Form JSX ... */}
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
    </div>
  );
};

export default ReviewFormPage;
