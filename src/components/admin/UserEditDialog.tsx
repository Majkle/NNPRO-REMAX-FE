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

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (updatedUser: Partial<User>) => void;
  onUserCreate: (createdUser: User) => void;
}

const formSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
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
});

type FormValues = z.infer<typeof formSchema>;

export const UserEditDialog: React.FC<UserEditDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUserUpdate,
  onUserCreate
}) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: UserRole.AGENT,
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
        role: user.role,
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

  const onSubmit = async (data: FormValues) => {
    //if (!user) return;

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
    if (user) {
      onUserUpdate({ id: user.id, username: user.username, ...data });
      toast({
        title: 'Uživatel aktualizován (Mock)',
      });
    } else {
      onUserCreate({
        id: Math.floor(Math.random() * 10000)+1000,
        username: data.firstName + "." + data.lastName,
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
    }

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
          <DialogTitle>{user ? 'Upravit' : 'Vytvořit'} uživatele</DialogTitle>
          <DialogDescription>
            {user ? 'Změňte' : 'Vyplňte'} informace o uživateli a uložte je.
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
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
