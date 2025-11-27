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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import authService from '@/services/authService';

interface UserEditDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdate: (updatedUser: Partial<User>) => void;
}

const formSchema = z.object({
  firstName: z.string().min(1, 'Křestní jméno je povinné.'),
  lastName: z.string().min(1, 'Příjmení je povinné.'),
  email: z.string().email('Neplatný formát e-mailu.'),
  role: z.nativeEnum(UserRole),
});

type FormValues = z.infer<typeof formSchema>;

export const UserEditDialog: React.FC<UserEditDialogProps> = ({
  user,
  open,
  onOpenChange,
  onUserUpdate,
}) => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: UserRole.CLIENT,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.personalInformation.firstName,
        lastName: user.personalInformation.lastName,
        email: user.email,
        role: user.role,
      });
    }
  }, [user, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

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
    onUserUpdate({ id: user.id, ...data });
    toast({
      title: 'Uživatel aktualizován (Mock)',
    });

    onOpenChange(false);
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Křestní jméno</FormLabel>
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
                  <FormLabel>Příjmení</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
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
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Ukládání...' : 'Uložit změny'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
