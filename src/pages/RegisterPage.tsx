import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useAuth } from '@/contexts/AuthContext';
import { AddressRegion } from '@/types';

// Validation schema
const registerSchema = z.object({
  username: z.string().min(2, 'Uživatelské jméno musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatná emailová adresa'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  lastName: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
  phoneNumber: z.string().min(9, 'Telefonní číslo musí mít alespoň 9 číslic'),
  street: z.string().min(2, 'Jméno ulice musí mít alespoň 2 znaky'),
  city: z.string().min(2, 'Jméno města musí mít alespoň 2 znaky'),
  postalCode: z.string().min(5, 'PSČ musí mít alespoň 5 znaků'),
  country: z.string().min(2, 'Jméno země musí mít alespoň 2 znaky'),
  region: z.nativeEnum(AddressRegion),
  degree: z.string(),
  flatNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      degree: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
      region: AddressRegion.PRAHA,
      flatNumber: ''
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await register(data.username, data.email, data.password, data.degree, data.firstName, data.lastName, data.phoneNumber, new Date(), data.street, data.city, data.postalCode, data.country, data.region, data.flatNumber);

      toast({
        title: 'Registrace úspěšná',
        description: 'Váš účet byl vytvořen. Vítejte!',
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'Registrace selhala',
        description: 'Zkuste to prosím znovu.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addressRegionLabels = {
    [AddressRegion.PRAHA]: 'Praha',
    [AddressRegion.STREDOCESKY]: 'Středočeský kraj',
    [AddressRegion.JIHOCESKY]: 'Jihočeský kraj',
    [AddressRegion.PLZENSKY]: 'Plzeňský kraj',
    [AddressRegion.KARLOVARSKY]: 'Karlovarský kraj',
    [AddressRegion.USTECKY]: 'Ústecký kraj',
    [AddressRegion.LIBERECKY]: 'Liberecký kraj',
    [AddressRegion.KRALOVEHRADECKY]: 'Královéhradecký kraj',
    [AddressRegion.PARDUBICKY]: 'Pardubický kraj',
    [AddressRegion.VYSOCINA]: 'Vysočina',
    [AddressRegion.JIHOMORAVSKY]: 'Jihomoravský kraj',
    [AddressRegion.OLOMOUCKY]: 'Olomoucký kraj',
    [AddressRegion.ZLINSKY]: 'Zlínský kraj',
    [AddressRegion.MORAVSKOSLEZSKY]: 'Moravskoslezský kraj'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-8 w-8 text-red-600" />
            <span className="font-bold text-2xl">
              <span className="text-red-600">RE/MAX</span>
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Registrace</CardTitle>
          <CardDescription className="text-center">
            Vytvořte si nový účet pro pokračování
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titul</FormLabel>
                    <FormControl>
                      <Input placeholder="Ing." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jméno *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Příjmení *</FormLabel>
                      <FormControl>
                        <Input placeholder="Novák" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uživatelské jméno *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="vase.uzivatelske.jmeno"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="vas.email@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+420 123 456 789"
                        autoComplete="phoneNumber"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heslo *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Potvrdit heslo *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ulice a č. p. *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Československých legií 565"
                        autoComplete="street"
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Číslo bytu</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="101"
                        autoComplete="flatNumber"
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obec *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pardubice I"
                        autoComplete="city"
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PSČ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="530 02"
                        autoComplete="postalCode"
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Země *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Česká republika"
                        autoComplete="country"
                        {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte region" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(addressRegionLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Vyberte svůj region
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Registrace...' : 'Zaregistrovat se'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Již máte účet?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Přihlaste se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
