import React, { useState, useEffect } from 'react';
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
import { AppointmentType, SimplifiedUser, SimplifiedRealEstate, AppointmentStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import appointmentService from '@/services/appointmentService';
import reviewService from '@/services/reviewService';

// Validation schema
const appointmentFormSchema = z.object({
  title: z.string().min(5, 'Nadpis musí mít alespoň 5 znaků').max(100, 'Nadpis je příliš dlouhý'),
  description: z.string().optional(),
  type: z.nativeEnum(AppointmentType),
  agentId: z.number().min(1, 'Vyberte makléře'),
  propertyId: z.number().min(1, 'Vyberte nemovitost'),
  date: z.date(),
  startTime: z.string().min(1, 'Vyberte čas schůzky')
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const AppointmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agents, setAgents] = useState<SimplifiedUser[]>([]);
  const [estates, setEstates] = useState<SimplifiedRealEstate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: AppointmentType.OFFLINE,
      agentId: 0
    },
  });
  const selectedType = form.watch('type');

  useEffect(() => {
    const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const fetchedAgents = await reviewService.getAllAgents();

      setAgents(fetchedAgents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast({
        title: 'Chyba při načítání makléřů',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEstates = async () => {
    try {
      setIsLoading(true);
      const fetchedEstates = await appointmentService.getAllEstates();

      setEstates(fetchedEstates);
    } catch (error) {
      console.error('Failed to fetch real estates:', error);
      toast({
        title: 'Chyba při načítání nemovitostí',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  fetchAgents();
  fetchEstates();
  }, []);

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true);
    // --- BACKEND INTEGRATION ---
    try {
      const timestr = data.date.toDateString() + ' ' + data.startTime + data.date.toTimeString().substring(5);
      await appointmentService.createAppointment({
        title: data.title,
        description: data.description,
        meetingType: data.type,
        meetingStatus: AppointmentStatus.PENDING,
        meetingTime: new Date(Date.parse(timestr)),
        realEstateId: data.propertyId,
        realtorId: data.agentId,
        clientId: JSON.parse(localStorage.getItem('user') || '').id
      });
      toast({ title: 'Schůzka naplánována' });
      navigate('/appointments');
    } catch (error) {
      toast({ title: 'Chyba při plánování', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }

    navigate('/appointments');
  };

  const typeLabels = {
    [AppointmentType.OFFLINE]: 'Offline',
    [AppointmentType.ONLINE]: 'Online'
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
                        {agents.map((agent) => (
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

              {/* Property */}
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nemovitost</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte nemovitost" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {estates.map((property) => (
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
