import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Appointment, AppointmentStatus, AppointmentType, UserRole, User as UserType, Property, CreateAppointmentInput } from '@/types';
import { format, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import appointmentService from '@/services/appointmentService';
import authService from '@/services/authService';
import propertyService from '@/services/propertyService';

const AppointmentsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const fetchedAppointments = await appointmentService.getAppointmentsByCurrentUser();

        let idSet: Record<number, UserType> = {};
        let propertyIdSet: Record<number, Property> = {};
        for (const a of fetchedAppointments) {
          a.meetingTime = new Date(Date.parse(a.meetingTime.toString()));

          if (!(a.realtorId in idSet)) {
            const user = await authService.getSpecificProfile(a.realtorId);
            idSet[a.realtorId] = user;
          }
          a.agent = idSet[a.realtorId];

          if (!(a.clientId in idSet)) {
            const user = await authService.getSpecificProfile(a.clientId);
            idSet[a.clientId] = user;
          }
          a.client = idSet[a.clientId];

          if (a.realEstateId) {
            if (!(a.realEstateId in propertyIdSet)) {
              const user = await propertyService.getProperty(a.realEstateId);
              propertyIdSet[a.realEstateId] = user;
            }
            a.property = propertyIdSet[a.realEstateId];
          }
        }

        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        toast({
          title: 'Chyba při načítání schůzek',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [toast]);

  // Handle status update via PUT request
  const handleStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    setProcessingId(appointment.id);
    try {
      // Construct the full payload as required
      const payload: CreateAppointmentInput = {
        meetingTime: appointment.meetingTime,
        title: appointment.title,
        description: appointment.description,
        meetingType: appointment.meetingType,
        meetingStatus: newStatus,
        realEstateId: appointment.realEstateId,
        realtorId: appointment.realtorId,
        clientId: appointment.clientId
      };

      // Call PUT endpoint
      const updatedAppointment = await appointmentService.updateAppointment(appointment.id, payload);

      // Update local state to reflect changes without reload
      setAppointments(prev => prev.map(apt =>
          apt.id === appointment.id
              ? { ...apt, meetingStatus: newStatus }
              : apt
      ));

      toast({
        title: 'Status aktualizován',
        description: `Schůzka byla ${newStatus === AppointmentStatus.CONFIRMED ? 'potvrzena' : 'zrušena'}.`,
      });

    } catch (error) {
      console.error('Update failed:', error);
      toast({
        title: 'Chyba při aktualizaci',
        description: 'Nepodařilo se změnit status schůzky.',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Check if current user is a client
  const canMeet = user?.role === UserRole.CLIENT;
  const isAgent = user?.role === UserRole.AGENT;

  const getStatusBadgeVariant = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'secondary';
      case AppointmentStatus.CONFIRMED:
        return 'default';
      case AppointmentStatus.CANCELED:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      [AppointmentStatus.PENDING]: 'Čeká na potvrzení',
      [AppointmentStatus.CONFIRMED]: 'Potvrzeno',
      [AppointmentStatus.CANCELED]: 'Zrušeno',
    };
    return labels[status];
  };

  const getTypeLabel = (type: AppointmentType) => {
    const labels = {
      [AppointmentType.OFFLINE]: 'Offline',
      [AppointmentType.ONLINE]: 'Online'
    };
    return labels[type];
  };

  const getTypeIcon = (type: AppointmentType) => {
    switch (type) {
      case AppointmentType.OFFLINE:
        return MapPin;
      case AppointmentType.ONLINE:
        return CalendarIcon;
      default:
        return CalendarIcon;
    }
  };

  const renderAppointmentActions = (appointment: Appointment) => {
    // Determine visibility based on Role and Status
    const isPending = appointment.meetingStatus === AppointmentStatus.PENDING;
    const isConfirmed = appointment.meetingStatus === AppointmentStatus.CONFIRMED;
    const isCanceled = appointment.meetingStatus === AppointmentStatus.CANCELED;

    if (isCanceled) return null;

    return (
        <div className="flex gap-2 w-full justify-end mt-4 pt-4 border-t">
          {/* AGENT ACTIONS */}
          {isAgent && isPending && (
              <>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(appointment, AppointmentStatus.CONFIRMED)}
                    disabled={processingId === appointment.id}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                >
                  {processingId === appointment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Potvrdit
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(appointment, AppointmentStatus.CANCELED)}
                    disabled={processingId === appointment.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  {processingId === appointment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                  Zrušit
                </Button>
              </>
          )}

          {/* CLIENT ACTIONS */}
          {canMeet && (isPending || isConfirmed) && (
              <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(appointment, AppointmentStatus.CANCELED)}
                  disabled={processingId === appointment.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                {processingId === appointment.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                Zrušit schůzku
              </Button>
          )}
        </div>
    );
  };

  const today = new Date();

  const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }

  const appointmentsThisMonth = appointments
      .filter((apt) => isSameMonth(apt.meetingTime, today) && apt.meetingStatus !== AppointmentStatus.CANCELED)
      .sort((a, b) => a.meetingTime.getTime() - b.meetingTime.getTime());

  const appointmentsOnSelectedDate = selectedDate
      ? appointments.filter((apt) => isSameDay(apt.meetingTime, selectedDate))
      : [];

  const upcomingAppointments = appointments
      .filter((apt) => apt.meetingTime >= new Date() && apt.meetingStatus !== AppointmentStatus.CANCELED)
      .sort((a, b) => a.meetingTime.getTime() - b.meetingTime.getTime());

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Schůzky</h1>
            <p className="text-muted-foreground">Plánování a správa schůzek</p>
          </div>
          {canMeet && (
              <Link to="/appointments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Naplánovat schůzku
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
                  <p className="text-sm text-muted-foreground">Dnes</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(apt =>
                        isSameDay(apt.meetingTime, new Date())
                    ).length}
                  </p>
                </div>
                <CalendarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nadcházející</p>
                  <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tento měsíc</p>
                  <p className="text-2xl font-bold">{appointmentsThisMonth.length}</p>
                </div>
                <CalendarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="calendar">Kalendář</TabsTrigger>
            <TabsTrigger value="list">Seznam</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Kalendář</CardTitle>
                  <CardDescription>Vyberte datum pro zobrazení schůzek</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Appointments for selected date */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedDate
                        ? format(selectedDate, 'd. MMMM yyyy', { locale: cs })
                        : 'Vyberte datum'
                    }
                  </CardTitle>
                  <CardDescription>
                    {appointmentsOnSelectedDate.length > 0
                        ? `${appointmentsOnSelectedDate.length} schůzek`
                        : 'Žádné schůzky tento den'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {appointmentsOnSelectedDate.length > 0 ? (
                      appointmentsOnSelectedDate.map((appointment) => {
                        const TypeIcon = getTypeIcon(appointment.meetingType);
                        const isAgentAndPending = isAgent && appointment.meetingStatus === AppointmentStatus.PENDING;

                        return (
                            <Card key={appointment.id}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <TypeIcon className="h-4 w-4" />
                                      {appointment.title}
                                    </CardTitle>
                                    <CardDescription>{appointment.description}</CardDescription>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {/* Red Notice for Agents on Pending */}
                                    {isAgentAndPending && (
                                        <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full animate-pulse">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Vyžaduje akci
                                </span>
                                    )}
                                    <Badge variant={getStatusBadgeVariant(appointment.meetingStatus)}>
                                      {getStatusLabel(appointment.meetingStatus)}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2 pb-2">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="mr-2 h-4 w-4" />
                                  {format(appointment.meetingTime, 'HH:mm')}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <User className="mr-2 h-4 w-4" />
                                  {isAgent
                                      ? `Klient: ${appointment.client.personalInformation.firstName} ${appointment.client.personalInformation.lastName}`
                                      : `Makléř: ${appointment.agent.personalInformation.firstName} ${appointment.agent.personalInformation.lastName}`
                                  }
                                </div>
                                <Badge variant="outline">{getTypeLabel(appointment.meetingType)}</Badge>
                              </CardContent>
                              <CardFooter className="pt-0">
                                {renderAppointmentActions(appointment)}
                              </CardFooter>
                            </Card>
                        );
                      })
                  ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>Žádné schůzky pro vybraný den</p>
                      </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Všechny schůzky</CardTitle>
                <CardDescription>Seznam všech naplánovaných i proběhlých schůzek</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {appointments
                    .sort((a, b) => b.meetingTime.getTime() - a.meetingTime.getTime()) // Sort by newest first
                    .map((appointment) => {
                      const TypeIcon = getTypeIcon(appointment.meetingType);
                      const isAgentAndPending = isAgent && appointment.meetingStatus === AppointmentStatus.PENDING;

                      return (
                          <Card key={appointment.id}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <TypeIcon className="h-4 w-4" />
                                    {appointment.title}
                                  </CardTitle>
                                  <CardDescription>{appointment.description}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Red Notice for Agents on Pending */}
                                  {isAgentAndPending && (
                                      <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Vyžaduje akci
                            </span>
                                  )}
                                  <Badge variant={getStatusBadgeVariant(appointment.meetingStatus)}>
                                    {getStatusLabel(appointment.meetingStatus)}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2 pb-2">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(appointment.meetingTime, 'd. MMMM yyyy', { locale: cs })}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4" />
                                {format(appointment.meetingTime, 'HH:mm')}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <User className="mr-2 h-4 w-4" />
                                {isAgent
                                    ? `Klient: ${appointment.client.personalInformation.firstName} ${appointment.client.personalInformation.lastName}`
                                    : `Makléř: ${appointment.agent.personalInformation.firstName} ${appointment.agent.personalInformation.lastName}`
                                }
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline">{getTypeLabel(appointment.meetingType)}</Badge>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                              {renderAppointmentActions(appointment)}
                            </CardFooter>
                          </Card>
                      );
                    })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default AppointmentsPage;