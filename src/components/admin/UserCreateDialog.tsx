import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { User, UserRole, AddressRegion } from '@/types';
import { useToast } from '@/hooks/use-toast';
import authService from '@/services/authService';

interface UserCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreate: (createdUser: User) => void;
}

const formSchema = z.object({
  username: z.string().min(2, 'Uživatelské jméno musí mít alespoň 2 znaky'),
  email: z.string().email('Neplatná emailová adresa'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
  firstName: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  lastName: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
  phoneNumber: z.string().min(9, 'Telefonní číslo musí mít alespoň 9 číslic'),
  street: z.string().min(2, 'Jméno ulice musí mít alespoň 2 znaky'),
  city: z.string().min(2, 'Jméno města musí mít alespoň 2 znaky'),
  postalCode: z.string().min(5, 'PSČ musí mít alespoň 5 znaků'),
  country: z.string().min(2, 'Jméno země musí mít alespoň 2 znaky'),
  region: z.nativeEnum(AddressRegion),
  degree: z.string().optional(),
  flatNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof formSchema>;

export const UserCreateDialog: React.FC<UserCreateDialogProps> = ({
  open,
  onOpenChange,
  onUserCreate
}) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: UserRole.AGENT,
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

  const onSubmit = async (data: FormValues) => {
    /*
    // --- BACKEND INTEGRATION ---
    try {
      const createdUser = await authService.createUser( data);
      onUserCreate(createdUser);
      toast({
        title: 'Uživatel vytvořen',
      });
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        title: 'Chyba vytvoření uživatele',
        variant: 'destructive',
      });
      return;
    }
    */

    // Mock logic
    onUserCreate({
      id: Math.floor(Math.random() * 10000)+1000,
      username: data.username,
      email: data.email,
      role: data.role,
      createdAt: new Date(),
      isBlocked: false,
      personalInformation: {
        degree: data.degree || '',
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: new Date(),
        phoneNumber: data.phoneNumber,
        address: {
          id: Math.floor(Math.random() * 10000)+1000,
          street: data.street,
          city: data.city,
          flatNumber: data.flatNumber,
          postalCode: data.postalCode,
          country: data.country,
          region: data.region
        }
      }
    });
    toast({
      title: 'Uživatel vytvořen (Mock)',
    });

    onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vytvořit uživatele</DialogTitle>
          <DialogDescription>
            Vyplňte informace o uživateli a uložte je.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte roli" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.CLIENT}>Klient</SelectItem>
                      <SelectItem value={UserRole.AGENT}>Makléř</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormLabel>E-mail *</FormLabel>
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
                        autoComplete="confirm-password"
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
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Křestní jméno *</FormLabel>
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
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefonní číslo *</FormLabel>
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

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Ukládání...' : 'Uložit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
