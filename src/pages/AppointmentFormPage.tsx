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

  const typeLabels = {
    [AppointmentType.PROPERTY_VIEWING]: 'Prohlídka nemovitosti',
    [AppointmentType.CONSULTATION]: 'Konzultace',
    [AppointmentType.ONLINE_MEETING]: 'Online schůzka',
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/appointments')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Naplánovat schůzku</h1>
          <p className="text-muted-foreground">Vytvořte novou schůzku s makléřem</p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Základní informace</CardTitle>
              <CardDescription>Zadejte informace o schůzce</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nadpis schůzky</FormLabel>
                    <FormControl>
                      <Input placeholder="Např. Prohlídka bytu v centru Prahy" {...field} />
                    </FormControl>
                    <FormDescription>
                      Stručný popis účelu schůzky
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Popis (volitelné)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Podrobnosti o schůzce..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Typ schůzky</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value as AppointmentType)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte typ schůzky" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Agent */}
              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Makléř</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property (optional, shown for viewing type) */}
              {selectedType === AppointmentType.PROPERTY_VIEWING && (
                <FormField
                  control={form.control}
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nemovitost (volitelné)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vyberte nemovitost" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockProperties.map((property) => (
                            <SelectItem key={property.id} value={property.id.toString()}>
                              {property.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termín a čas</CardTitle>
              <CardDescription>Vyberte datum a čas schůzky</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Datum</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: cs })
                            ) : (
                              <span>Vyberte datum</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Čas schůzky</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Vyberte čas začátku schůzky
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Místo konání (volitelné)</FormLabel>
                    <FormControl>
                      <Input placeholder="Např. Hlavní 123, Praha 1 nebo Online - Google Meet" {...field} />
                    </FormControl>
                    <FormDescription>
                      Adresa nebo odkaz na online schůzku
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Poznámky</CardTitle>
              <CardDescription>Další informace k schůzce</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poznámky (volitelné)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Jakékoliv další informace nebo požadavky..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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
        </form>
      </Form>
    </div>
  );
};

export default AppointmentFormPage;
