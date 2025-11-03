import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Star } from 'lucide-react';
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

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      agentId: 0,
      rating: 0,
      comment: '',
    },
  });

  const selectedRating = form.watch('rating');

  const onSubmit = (data: ReviewFormValues) => {
    console.log('Review data:', data);

    const agent = mockAgents.find(a => a.id === data.agentId);

    toast({
      title: 'Recenze přidána',
      description: `Vaše recenze pro makléře ${agent?.firstName} ${agent?.lastName} byla úspěšně přidána.`,
    });

    navigate('/reviews');
  };

  const renderStarRating = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoveredStar || selectedRating);
          return (
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
                  isActive
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
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
          <h1 className="text-3xl font-bold">Přidat recenzi makléře</h1>
          <p className="text-muted-foreground">
            Ohodnoťte svou zkušenost se spoluprací s makléřem
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hodnocení makléře</CardTitle>
              <CardDescription>
                Vaše recenze pomůže ostatním uživatelům při výběru makléře
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Makléř *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))}>
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
                      Vyberte makléře, se kterým jste spolupracovali
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hodnocení *</FormLabel>
                    <FormControl>
                      <div>
                        {renderStarRating()}
                        {selectedRating > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Hodnocení: {selectedRating} z 5 hvězdiček
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

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komentář *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Popište vaši zkušenost se spoluprací s makléřem... (např. profesionalita, rychlost komunikace, znalost trhu, celková spokojenost)"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Min. 10 znaků, max. 500 znaků (zbývá: {500 - (field.value?.length || 0)})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Criteria Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Na co se zaměřit v recenzi</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Rychlost a kvalita komunikace</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Profesionalita a přístup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Znalost trhu a poradenství</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Férovost a transparentnost</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Celková spokojenost se spoluprací</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/reviews')}>
              Zrušit
            </Button>
            <Button type="submit">
              Odeslat recenzi
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ReviewFormPage;
