import React, { useState, useEffect } from 'react';
import { Trash2, UserCog, Users, Shield, Ban, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { UserEditDialog } from '@/components/admin/UserEditDialog';
import authService from '@/services/authService';

const mockUsers: User[] = [
  {
    id: 1,
    email: 'petr.novotny@remax.cz',
    firstName: 'Petr',
    lastName: 'Novotný',
    phone: '+420 777 888 999',
    role: UserRole.AGENT,
    isBlocked: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: 2,
    email: 'jan.dvorak@email.cz',
    firstName: 'Jan',
    lastName: 'Dvořák',
    role: UserRole.CLIENT,
    isBlocked: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 3,
    email: 'marie.svobodova@email.cz',
    firstName: 'Marie',
    lastName: 'Svobodová',
    role: UserRole.CLIENT,
    isBlocked: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 4,
    email: 'pavel.novak@email.cz',
    firstName: 'Pavel',
    lastName: 'Novák',
    role: UserRole.CLIENT,
    isBlocked: false,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 999,
    email: 'admin@remax.cz',
    firstName: 'Admin',
    lastName: 'Správce',
    role: UserRole.ADMIN,
    isBlocked: false,
    createdAt: new Date('2022-01-01'),
    updatedAt: new Date('2022-01-01'),
  },
];

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  // const [isLoading, setIsLoading] = useState(true); // Uncomment for API integration
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { toast } = useToast();

  /*
  // Uncomment this useEffect for backend integration
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // setIsLoading(true);
        const fetchedUsers = await authService.getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          title: 'Chyba při načítání uživatelů',
          variant: 'destructive',
        });
      } finally {
        // setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);
  */

  const handleDeleteUser = (user: User) => setUserToDelete(user);
  const handleBlockUser = (user: User) => setUserToBlock(user);
  const handleEditUser = (user: User) => setUserToEdit(user);

  const handleUserUpdate = (updatedUser: Partial<User>) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)));
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      // Mock logic
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast({
        title: 'Uživatel smazán (Mock)',
        description: `Uživatel ${userToDelete.firstName} ${userToDelete.lastName} byl odstraněn.`,
      });
      setUserToDelete(null);
    }
  };

  const confirmBlock = async () => {
    if (userToBlock) {
      const isBlocked = !userToBlock.isBlocked;
      // Mock logic
      setUsers(users.map((u) => (u.id === userToBlock.id ? { ...u, isBlocked } : u)));
      toast({
        title: `Uživatel ${isBlocked ? 'zablokován' : 'odblokován'} (Mock)`,
      });
      setUserToBlock(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      [UserRole.ADMIN]: { label: 'Admin', variant: 'destructive' as const },
      [UserRole.AGENT]: { label: 'Makléř', variant: 'default' as const },
      [UserRole.CLIENT]: { label: 'Klient', variant: 'secondary' as const },
    };
    const config = roleConfig[role];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const agents = users.filter((u) => u.role === UserRole.AGENT);
  const clients = users.filter((u) => u.role === UserRole.CLIENT);

  const renderUserList = (userList: User[]) => {
    return userList.map((user) => (
      <div
        key={user.id}
        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {user.firstName} {user.lastName}
              </p>
              {getRoleBadge(user.role)}
              {user.isBlocked && <Badge variant="outline">Zablokován</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
            <Pencil className="h-4 w-4 mr-2" />
            Upravit
          </Button>
          <Button
            variant={user.isBlocked ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => handleBlockUser(user)}
            disabled={user.role === UserRole.ADMIN}
          >
            <Ban className="h-4 w-4 mr-2" />
            {user.isBlocked ? 'Odblokovat' : 'Zablokovat'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteUser(user)}
            disabled={user.role === UserRole.ADMIN}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Smazat
          </Button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Správa uživatelů a makléřů</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem uživatelů</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Makléři</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Klienti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Všichni uživatelé ({users.length})</TabsTrigger>
          <TabsTrigger value="agents">Makléři ({agents.length})</TabsTrigger>
          <TabsTrigger value="clients">Klienti ({clients.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Všichni uživatelé</CardTitle>
              <CardDescription>Správa všech uživatelů v systému (simulace)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">{renderUserList(users)}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Makléři</CardTitle>
              <CardDescription>Správa realitních makléřů (simulace)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">{renderUserList(agents)}</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Klienti</CardTitle>
              <CardDescription>Správa klientů (simulace)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">{renderUserList(clients)}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UserEditDialog
        user={userToEdit}
        open={!!userToEdit}
        onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}
        onUserUpdate={handleUserUpdate}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opravdu chcete smazat tohoto uživatele?</AlertDialogTitle>
            <AlertDialogDescription>
              Tato akce je nevratná. Uživatel{' '}
              <strong>
                {userToDelete?.firstName} {userToDelete?.lastName}
              </strong>{' '}
              bude trvale odstraněn ze systému.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToBlock} onOpenChange={(isOpen) => !isOpen && setUserToBlock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Opravdu chcete {userToBlock?.isBlocked ? 'odblokovat' : 'zablokovat'} tohoto uživatele?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Uživatel{' '}
              <strong>
                {userToBlock?.firstName} {userToBlock?.lastName}
              </strong>{' '}
              bude {userToBlock?.isBlocked ? 'odblokován' : 'zablokován'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBlock}>Potvrdit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;

