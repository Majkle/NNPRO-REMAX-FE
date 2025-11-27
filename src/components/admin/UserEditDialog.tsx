import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
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

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (updatedUser: Partial<User>) => void;
}

const formSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
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
});

type FormValues = z.infer<typeof formSchema>;

export const UserEditDialog: React.FC<UserEditDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUserUpdate
}) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
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

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        degree: user.personalInformation.degree,
        firstName: user.personalInformation.firstName,
        lastName: user.personalInformation.lastName,
        phoneNumber: user.personalInformation.phoneNumber,
        street: user.personalInformation.address?.street || '',
        city: user.personalInformation.address?.city || '',
        postalCode: user.personalInformation.address?.postalCode || '',
        country: user.personalInformation.address?.country || '',
        region: user.personalInformation.address?.region || AddressRegion.PRAHA,
        flatNumber: user.personalInformation.address?.flatNumber || ''
      });
    }
  }, [user, form]);

  if (!user) return null;

  const onSubmit = async (data: FormValues) => {
    /*
    // --- BACKEND INTEGRATION ---
    try {
      const updatedUser = await authService.updateUser(user.id, data);
      onUserUpdate(updatedUser);
      toast({
        title: 'Uživatel aktualizován',
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: 'Chyba aktualizace',
        variant: 'destructive',
      });
      return;
    }
    */
    
    // Mock logic
    onUserUpdate({ id: user.id, username: user.username, ...data });
    toast({
      title: 'Uživatel aktualizován (Mock)',
    });

    onOpenChange(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrátor';
      case UserRole.AGENT:
        return 'Makléř';
      case UserRole.CLIENT:
        return 'Klient';
      default:
        return role;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upravit uživatele</DialogTitle>
          <DialogDescription>
            Změňte informace o uživateli a uložte je.
          </DialogDescription>
        </DialogHeader>

        {/* Username and Role Display (Read-only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-lg border p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{user.username}</span>
          </div>
          <p className="text-muted-foreground">
            {getRoleLabel(user.role)}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
