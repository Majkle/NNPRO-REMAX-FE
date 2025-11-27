import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Lock, Mail, Phone, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
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
import { UserRole, PersonalInformation, Address, AddressRegion } from '@/types';
import authService, { ProfileUpdateRequest } from '@/services/authService';

const profileSchema = z.object({
  email: z.string().email('Neplatná emailová adresa'),
  degree: z.string().optional(),
  firstName: z.string().min(2, 'Jméno musí mít alespoň 2 znaky'),
  lastName: z.string().min(2, 'Příjmení musí mít alespoň 2 znaky'),
  phoneNumber: z.string().min(9, 'Telefonní číslo musí mít alespoň 9 číslic'),
  street: z.string().min(2, 'Jméno ulice musí mít alespoň 2 znaky'),
  city: z.string().min(2, 'Jméno města musí mít alespoň 2 znaky'),
  postalCode: z.string().min(5, 'PSČ musí mít alespoň 5 znaků'),
  country: z.string().min(2, 'Jméno země musí mít alespoň 2 znaky'),
  region: z.nativeEnum(AddressRegion),
  role: z.nativeEnum(UserRole),
  flatNumber: z.string().optional(),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'Heslo musí mít alespoň 6 znaků'),
  newPassword: z.string().min(6, 'Nové heslo musí mít alespoň 6 znaků'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Hesla se neshodují',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      degree: user?.personalInformation.degree || '',
      firstName: user?.personalInformation.firstName || '',
      lastName: user?.personalInformation.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.personalInformation.phoneNumber || '',
      street: user?.personalInformation.address?.street || '',
      city: user?.personalInformation.address?.city || '',
      postalCode: user?.personalInformation.address?.postalCode || '',
      country: user?.personalInformation.address?.country || '',
      region: user?.personalInformation.address?.region || AddressRegion.PRAHA,
      flatNumber: user?.personalInformation.address?.flatNumber || ''
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  if (!user) {
    return null;
  }

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsProfileLoading(true);
    // -- BACKEND INTEGRATION --
    try {
      const request: ProfileUpdateRequest = {
        email: data.email,
        degree: data.degree || '',
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        birthDate: user.personalInformation.birthDate || new Date(),
        street: data.street,
        city: data.city,
        postalNumber: data.postalCode,
        country: data.country,
        region: data.region,
        flatNumber: data.flatNumber
      };
      const updatedUser = await authService.updateProfile(request);
      updatedUser.role = user.role;
      updatedUser.isBlocked = user.isBlocked;
      updateUser(updatedUser);
      toast({
        title: 'Profil aktualizován',
      });
    } catch (error) {
      toast({
        title: 'Chyba při ukládání',
        variant: 'destructive',
      });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsPasswordLoading(true);
    /*
    // --- BACKEND INTEGRATION ---
    try {
      await authService.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      toast({
        title: 'Heslo změněno',
      });
      passwordForm.reset();
    } catch (error) {
      toast({
        title: 'Chyba při změně hesla',
        variant: 'destructive',
      });
    } finally {
      setIsPasswordLoading(false);
    }
    */
    // Mock logic
    toast({
      title: 'Heslo změněno (Mock)',
      description: 'V reálné aplikaci by zde proběhla změna hesla.',
    });
    passwordForm.reset();
    setIsPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    // --- BACKEND INTEGRATION ---
    try {
      await authService.deleteProfile();
      toast({
        title: 'Účet smazán',
      });
      logout();
      navigate('/');
    } catch (error) {
      toast({
        title: 'Chyba při mazání účtu',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
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

  const getAddressRegionLabel = (addressRegion: AddressRegion) => {
    switch (addressRegion) {
      case AddressRegion.PRAHA:
        return 'Praha';
      case AddressRegion.STREDOCESKY:
        return 'Středočeský kraj';
      case AddressRegion.JIHOCESKY:
        return 'Jihočeský kraj';
      case AddressRegion.PLZENSKY:
        return 'Plzeňský kraj';
      case AddressRegion.KARLOVARSKY:
        return 'Karlovarský kraj';
      case AddressRegion.USTECKY:
        return 'Ústecký kraj';
      case AddressRegion.LIBERECKY:
        return 'Liberecký kraj';
      case AddressRegion.KRALOVEHRADECKY:
        return 'Královéhradecký kraj';
      case AddressRegion.PARDUBICKY:
        return 'Pardubický kraj';
      case AddressRegion.VYSOCINA:
        return 'Vysočina';
      case AddressRegion.JIHOMORAVSKY:
        return 'Jihomoravský kraj';
      case AddressRegion.OLOMOUCKY:
        return 'Olomoucký kraj';
      case AddressRegion.ZLINSKY:
        return 'Zlínský kraj';
      case AddressRegion.MORAVSKOSLEZSKY:
        return 'Moravskoslezský kraj';
      default:
        return addressRegion;
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
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Můj profil</h1>
        <p className="text-muted-foreground">
          Spravujte své osobní údaje a nastavení účtu (simulace)
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">
            <UserIcon className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Zabezpečení
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informace o profilu</CardTitle>
              <CardDescription>
                Aktualizujte své osobní údaje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  {/* Role Display (Read-only) */}
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Role</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getRoleLabel(user.role)}
                    </p>
                  </div>

                  <FormField
                    control={profileForm.control}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jméno</FormLabel>
                          <FormControl>
                            <Input placeholder="Jan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Příjmení</FormLabel>
                          <FormControl>
                            <Input placeholder="Novák" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="vas.email@example.com"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon (nepovinné)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+420 123 456 789"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ulice a č. p.</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
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
                    control={profileForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Obec</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PSČ</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Země</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isProfileLoading}>
                      {isProfileLoading ? 'Ukládání...' : 'Uložit změny'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Změna hesla</CardTitle>
              <CardDescription>
                Aktualizujte své heslo pro zvýšení bezpečnosti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Současné heslo</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nové heslo</FormLabel>
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
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Potvrzení nového hesla</FormLabel>
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

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isPasswordLoading}>
                      {isPasswordLoading ? 'Měním heslo...' : 'Změnit heslo'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle>Nebezpečná zóna</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Smazat tento účet</h3>
                  <p className="text-sm text-muted-foreground">
                    Tato akce je nevratná.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Smazat účet</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Jste si naprosto jisti?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tato akce je nevratná. Váš účet bude smazán (v této simulaci budete pouze odhlášeni).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Zrušit</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Mazání...' : 'Ano, smazat účet'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
