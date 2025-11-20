import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AppointmentType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import appointmentService from '@/services/appointmentService';

// Mock agents data
const mockAgents = [
  { id: 1, firstName: 'Petr', lastName: 'Novotný' },
  { id: 2, firstName: 'Jana', lastName: 'Dvořáková' },
  { id: 3, firstName: 'Martin', lastName: 'Svoboda' },
];

// Mock properties data
const mockProperties = [
  { id: 1, title: 'Moderní byt 3+kk v centru Prahy' },
  { id: 2, title: 'Rodinný dům se zahradou, Brno' },
  { id: 3, title: 'Komerční prostory, Ostrava' },
];
// Validation schema
const appointmentFormSchema = z.object({
  title: z.string().min(5, 'Nadpis musí mít alespoň 5 znaků').max(100, 'Nadpis je příliš dlouhý'),
  description: z.string().optional(),
  type: z.nativeEnum(AppointmentType),
  agentId: z.number().min(1, 'Vyberte makléře'),
  propertyId: z.number().optional(),
  date: z.date(),
  startTime: z.string().min(1, 'Vyberte čas schůzky'),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const AppointmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: AppointmentType.PROPERTY_VIEWING,
      agentId: 0,
      notes: '',
    },
  });
  const selectedType = form.watch('type');

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    /*
    // --- BACKEND INTEGRATION ---
    try {
      const payload = { ...data }; // Adjust payload as needed for API
      await appointmentService.createAppointment(payload);
      toast({ title: 'Schůzka naplánována' });
      navigate('/appointments');
    } catch (error) {
      toast({ title: 'Chyba při plánování', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
    */
    
    // Mock logic
    console.log('Appointment data:', data);
    const agent = mockAgents.find(a => a.id === data.agentId);
    toast({
      title: 'Schůzka naplánována (Mock)',
      description: `Vaše schůzka s makléřem ${agent?.firstName} ${agent?.lastName} byla úspěšně naplánována.`,
    });
    navigate('/appointments');
    setIsSubmitting(false);
  };
  
  const typeLabels = { /* ... */ };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ... Header and Form JSX ... */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => navigate('/appointments')} disabled={isSubmitting}>
          Zrušit
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rezervuji...
            </>
          ) : (
            'Rezervovat schůzku'
          )}
        </Button>
      </div>
    </div>
  );
};

export default AppointmentFormPage;
