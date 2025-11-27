import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Appointment, AppointmentStatus, AppointmentType, UserRole } from '@/types';
import { format, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';

// Mock data
const mockAppointments: Appointment[] = [
  {
    id: 1,
    title: 'Prohlídka bytu v centru Prahy',
    description: 'Prohlídka moderního bytu 3+kk',
    type: AppointmentType.PROPERTY_VIEWING,
    status: AppointmentStatus.CONFIRMED,
    startTime: new Date('2024-11-05T10:00:00'),
    endTime: new Date('2024-11-05T11:00:00'),
    propertyId: 1,
    agentId: 1,
    agent: {
      id: 1,
      username: 'petr.novotny.remax',
      email: 'petr.novotny@remax.cz',
      personalInformation: {
        firstName: 'Petr',
        lastName: 'Novotný'
      },
      role: UserRole.AGENT,
      createdAt: new Date('2024-01-01')
    },
    clientId: 2,
    client: {
      id: 2,
      username: 'jan.novak',
      email: 'jan.novak@example.com',
      personalInformation: {
        firstName: 'Jan',
        lastName: 'Novák'
      },
      role: UserRole.CLIENT,
      createdAt: new Date('2024-01-01')
    },
    location: 'Hlavní 123, Praha 1',
    createdAt: new Date('2024-10-20'),
    updatedAt: new Date('2024-10-20'),
  },
  {
    id: 2,
    title: 'Konzultace k financování',
    description: 'Konzultace ohledně hypotéky a financování nemovitosti',
    type: AppointmentType.CONSULTATION,
    status: AppointmentStatus.SCHEDULED,
    startTime: new Date('2024-11-06T14:00:00'),
    endTime: new Date('2024-11-06T15:00:00'),
    agentId: 1,
    agent: {
      id: 1,
      username: 'petr.novotny.remax',
      email: 'petr.novotny@remax.cz',
      personalInformation: {
        firstName: 'Petr',
        lastName: 'Novotný'
      },
      role: UserRole.AGENT,
      createdAt: new Date('2024-01-01')
    },
    clientId: 3,
    client: {
      id: 3,
      username: 'marie.svobodova',
      email: 'marie.svobodova@example.com',
      personalInformation: {
        firstName: 'Marie',
        lastName: 'Svobodová'
      },
      role: UserRole.CLIENT,
      createdAt: new Date('2024-01-05')
    },
    location: 'Online - Google Meet',
    createdAt: new Date('2024-10-25'),
    updatedAt: new Date('2024-10-25'),
  },
];

const AppointmentsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('calendar');

  const getStatusBadgeVariant = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return 'secondary';
      case AppointmentStatus.CONFIRMED:
        return 'default';
      case AppointmentStatus.COMPLETED:
        return 'outline';
      case AppointmentStatus.CANCELLED:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels = {
      [AppointmentStatus.SCHEDULED]: 'Naplánováno',
      [AppointmentStatus.CONFIRMED]: 'Potvrzeno',
      [AppointmentStatus.COMPLETED]: 'Dokončeno',
      [AppointmentStatus.CANCELLED]: 'Zrušeno',
    };
    return labels[status];
  };

  const getTypeLabel = (type: AppointmentType) => {
    const labels = {
      [AppointmentType.PROPERTY_VIEWING]: 'Prohlídka',
      [AppointmentType.CONSULTATION]: 'Konzultace',
      [AppointmentType.ONLINE_MEETING]: 'Online schůzka',
    };
    return labels[type];
  };

  const getTypeIcon = (type: AppointmentType) => {
    switch (type) {
      case AppointmentType.PROPERTY_VIEWING:
        return MapPin;
      case AppointmentType.CONSULTATION:
        return User;
      case AppointmentType.ONLINE_MEETING:
        return CalendarIcon;
      default:
        return CalendarIcon;
    }
  };

  const appointmentsOnSelectedDate = selectedDate
    ? mockAppointments.filter((apt) => isSameDay(apt.startTime, selectedDate))
    : [];

  const upcomingAppointments = mockAppointments
    .filter((apt) => apt.startTime >= new Date() && apt.status !== AppointmentStatus.CANCELLED)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Schůzky</h1>
          <p className="text-muted-foreground">Plánování a správa schůzek</p>
        </div>
        <Link to="/appointments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Naplánovat schůzku
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dnes</p>
                <p className="text-2xl font-bold">
                  {mockAppointments.filter(apt =>
                    isSameDay(apt.startTime, new Date())
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
                <p className="text-2xl font-bold">{mockAppointments.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dokončeno</p>
                <p className="text-2xl font-bold">
                  {mockAppointments.filter(apt =>
                    apt.status === AppointmentStatus.COMPLETED
                  ).length}
                </p>
              </div>
              <Badge variant="outline" className="text-lg">
                100%
              </Badge>
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
                    const TypeIcon = getTypeIcon(appointment.type);
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
                            <Badge variant={getStatusBadgeVariant(appointment.status)}>
                              {getStatusLabel(appointment.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" />
                            {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4" />
                            {appointment.location}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="mr-2 h-4 w-4" />
                            {appointment.client.personalInformation.firstName} {appointment.client.personalInformation.lastName}
                          </div>
                          <Badge variant="outline">{getTypeLabel(appointment.type)}</Badge>
                        </CardContent>
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
              <CardTitle>Nadcházející schůzky</CardTitle>
              <CardDescription>Všechny naplánované schůzky</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const TypeIcon = getTypeIcon(appointment.type);
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
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(appointment.startTime, 'd. MMMM yyyy', { locale: cs })}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {appointment.location}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        {appointment.client.personalInformation.firstName} {appointment.client.personalInformation.lastName}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{getTypeLabel(appointment.type)}</Badge>
                      </div>
                    </CardContent>
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
