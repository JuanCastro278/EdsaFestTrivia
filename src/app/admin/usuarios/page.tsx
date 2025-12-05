

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGame } from "@/context/GameContext";
import { UserPlus, Users, Trash2, Coins, KeyRound, Search, AlertTriangle, Medal, Crown, PlusCircle, MinusCircle, Download, ArrowUpDown, MoreHorizontal, History, Ticket, UserCheck, UserX, Lock, Unlock, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator";
import { UserTriviaHistory } from "@/components/admin/UserTriviaHistory";
import type { User } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";


const newUserSchema = z.object({
    legajo: z.string().min(1, { message: 'El DNI es requerido' }),
    username: z.string().min(1, { message: 'El nombre de usuario es requerido' }).regex(/^[^\d]*$/, { message: 'El nombre no puede contener números' }),
    seniorityScore: z.coerce.number().min(0, "Debe ser un número positivo.").default(0),
    userType: z.enum(['empleado', 'invitado'], { required_error: 'Debes seleccionar un tipo de usuario.' }),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

type SortConfig = {
  key: keyof import('@/lib/types').User | 'triviaScore';
  direction: 'asc' | 'desc';
} | null;


const formatLastLogin = (date: string | null) => {
    if (!date) return 'Nunca';
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
};

const PointsManager = ({
  userId,
  onUpdate,
  placeholder,
}: {
  userId: string;
  onUpdate: (userId: string, amount: number) => Promise<void>;
  placeholder: string;
}) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (operation: 'add' | 'subtract') => {
    const value = Number(amount);
    if (value > 0) {
      setLoading(true);
      const updateAmount = operation === 'add' ? value : -value;
      await onUpdate(userId, updateAmount);
      setAmount('');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-2">
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
        className="h-9 w-20 text-center md:w-24"
        placeholder={placeholder}
        min="1"
        disabled={loading}
      />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleUpdate('add')}
          disabled={!amount || loading}
          >
          <PlusCircle className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleUpdate('subtract')}
          disabled={!amount || loading}
          >
          <MinusCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


const ManageTriviaCoinsForm = ({ userId }: { userId: string }) => {
    const { updateUserScore } = useGame();
    return <PointsManager userId={userId} onUpdate={updateUserScore} placeholder="Trivia" />;
};

const ManagePeladoCoinsForm = ({ userId }: { userId: string }) => {
    const { updateUserPeladoScore } = useGame();
    return <PointsManager userId={userId} onUpdate={updateUserPeladoScore} placeholder="Pelado" />;
};

const ManageRaffleCoinsForm = ({ userId }: { userId: string }) => {
    const { updateUserRaffleScore } = useGame();
    return <PointsManager userId={userId} onUpdate={updateUserRaffleScore} placeholder="Sorteo" />;
};

const TriviaPointsLimitManager = () => {
    const { globalConfig, updateGlobalConfig } = useGame();
    const [limit, setLimit] = useState<string>('');
    
    useEffect(() => {
        if (globalConfig?.triviaPointsLimit !== null && globalConfig?.triviaPointsLimit !== undefined) {
            setLimit(String(globalConfig.triviaPointsLimit));
        } else {
            setLimit('');
        }
    }, [globalConfig?.triviaPointsLimit])

    const handleSave = async () => {
        const numLimit = parseInt(limit, 10);
        if (!isNaN(numLimit) && numLimit >= 0) {
            await updateGlobalConfig({ triviaPointsLimit: numLimit });
        } else {
            await updateGlobalConfig({ triviaPointsLimit: null });
            setLimit('');
        }
    };
    
    const handleRemove = async () => {
        await updateGlobalConfig({ triviaPointsLimit: null });
        setLimit('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock /> Límite de Puntos de Trivia</CardTitle>
                <CardDescription>
                    Establece un máximo de puntos que se pueden ganar en las trivias. Si no se establece un límite, los usuarios pueden ganar puntos indefinidamente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-grow w-full sm:w-auto">
                        <Label htmlFor="trivia-limit">Límite de Puntos</Label>
                        <Input 
                            id="trivia-limit"
                            type="number"
                            placeholder="Sin límite"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                    <div className="flex gap-2 self-end">
                        <Button onClick={handleSave}>Guardar Límite</Button>
                        <Button onClick={handleRemove} variant="ghost" disabled={globalConfig?.triviaPointsLimit === null || globalConfig?.triviaPointsLimit === undefined}>
                            <Unlock className="mr-2 h-4 w-4"/>
                            Quitar Límite
                        </Button>
                    </div>
                </div>
                {globalConfig?.triviaPointsLimit !== null && globalConfig?.triviaPointsLimit !== undefined && (
                    <p className="text-sm text-muted-foreground mt-4">
                        El límite actual es de <span className="font-bold text-primary">{globalConfig?.triviaPointsLimit}</span> puntos de trivia.
                    </p>
                )}
            </CardContent>
        </Card>
    )
}


export default function UsersPage() {
  const { users, addUser, deleteUser, resetUserPassword, globalConfig } = useGame();
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<{ type: 'delete' | 'reset', user: User } | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [historyUser, setHistoryUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showDetailedPoints, setShowDetailedPoints] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);


  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
        legajo: "",
        username: "",
        seniorityScore: 0,
        userType: "empleado"
      }
  });

  const handleAddUser = async (data: NewUserFormValues) => {
    setError(null);
    const result = await addUser({
        legajo: data.legajo,
        username: data.username,
        password: "EDSA2025",
        userType: data.userType,
        seniorityScore: data.seniorityScore || 0,
    });

    if (result.success) {
        form.reset();
    } else {
        setError(result.message || "No se pudo crear el usuario.");
    }
};

  const openConfirmationDialog = (type: 'delete' | 'reset', user: User) => {
    setActionToConfirm({ type, user });
    setIsAlertOpen(true);
  };
  
  const handleConfirmAction = async () => {
    if (!actionToConfirm || !actionToConfirm.user.id) return;
    
    if (actionToConfirm.type === 'delete') {
      await deleteUser(actionToConfirm.user.id);
    } else if (actionToConfirm.type === 'reset') {
      await resetUserPassword(actionToConfirm.user.id);
    }
    
    setIsAlertOpen(false);
    setActionToConfirm(null);
  };

  const requestSort = (key: keyof import('@/lib/types').User | 'triviaScore') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getTriviaScore = (user: User) => {
    return user.score - (user.seniorityScore || 0) - (user.peladoScore || 0) - (user.raffleScore || 0);
  };


  const filteredUsers = useMemo(() => {
    let sortableUsers = [...users.filter(user => user.role === 'user')];

    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'triviaScore') {
            aValue = getTriviaScore(a);
            bValue = getTriviaScore(b);
        } else {
            aValue = a[sortConfig.key as keyof User] ?? '';
            bValue = b[sortConfig.key as keyof User] ?? '';
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableUsers.filter(user => 
        user.username.toLowerCase().startsWith(searchTerm.toLowerCase()) || 
        user.legajo.toLowerCase().startsWith(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, sortConfig]);
  
  const activeUsersCount = useMemo(() => users.filter(user => user.role === 'user' && user.lastLogin !== null).length, [users]);
  const totalUsersCount = useMemo(() => users.filter(user => user.role === 'user').length, [users]);


  const handleExportUsers = () => {
    const userList = users.filter(user => user.role === 'user');

    const fileContent = userList.map(user => {
        const triviaScore = getTriviaScore(user);
        return `
DNI: ${user.legajo}
Nombre: ${user.username}
Tipo: ${user.userType === 'empleado' ? 'Empleado' : 'Invitado'}
Total EDSACoins: ${user.score}
Nº Sorteo: ${user.raffleNumber || 'N/A'}
Puntos de Trivia: ${triviaScore}
Puntos por Antigüedad: ${user.seniorityScore || 0}
Puntos del Pelado: ${user.peladoScore || 0}
Puntos del Sorteo: ${user.raffleScore || 0}
Última Sesión: ${formatLastLogin(user.lastLogin)}
---------------------------------
        `.trim();
    }).join('\n\n');

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reporte_usuarios_edsafest.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const SortableHeader = ({ sortKey, children }: { sortKey: keyof import('@/lib/types').User | 'triviaScore', children: React.ReactNode }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => requestSort(sortKey)} className="px-1">
            {children}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    </TableHead>
  );

  return (
    <div className="container mx-auto grid gap-8">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus/>Crear Nuevo Usuario</CardTitle>
                <CardDescription>
                Crea una nueva cuenta de usuario. La contraseña será 'EDSA2025' por defecto.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="legajo"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="legajo">DNI</Label>
                                        <FormControl>
                                             <Input id="legajo" {...field} placeholder="ej: 12345678"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="username">Nombre</Label>
                                         <FormControl>
                                            <Input id="username" {...field} placeholder="ej: Juan Perez"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="seniorityScore"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="seniorityScore">EDSAcoins por Antigüedad</Label>
                                         <FormControl>
                                            <Input id="seniorityScore" type="number" {...field} placeholder="ej: 100"/>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="userType"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <Label>Tipo de Usuario</Label>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex items-center space-x-4 pt-2"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="empleado" />
                                                    </FormControl>
                                                    <Label className="font-normal flex items-center gap-2">
                                                        <UserCheck className="h-4 w-4"/> Empleado
                                                    </Label>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="invitado" />
                                                    </FormControl>
                                                    <Label className="font-normal flex items-center gap-2">
                                                        <UserX className="h-4 w-4"/> Invitado
                                                    </Label>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {form.formState.isSubmitting ? 'Creando...' : 'Crear Usuario'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <TriviaPointsLimitManager />
        
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                     <div>
                        <CardTitle className="flex items-center gap-2"><Search /> Buscar Usuario</CardTitle>
                        <CardDescription>
                            Filtra la lista de usuarios por su nombre o DNI.
                        </CardDescription>
                     </div>
                     <div className="w-full md:w-auto md:max-w-xs">
                        <Input 
                            placeholder="Escribe un nombre o DNI para buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                </div>
            </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Users/> Todos los Usuarios</CardTitle>
                        <CardDescription>Lista de todos los usuarios registrados en el sistema.</CardDescription>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch md:items-center gap-4">
                       <div className="flex items-center space-x-2">
                            <Switch
                                id="show-detailed-points"
                                checked={showDetailedPoints}
                                onCheckedChange={setShowDetailedPoints}
                            />
                            <Label htmlFor="show-detailed-points">Mostrar desglose</Label>
                        </div>
                        <Button onClick={handleExportUsers} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar .txt
                        </Button>
                        <span className="text-sm text-muted-foreground font-medium text-center md:text-right">
                          {isClient ? `${activeUsersCount} / ${totalUsersCount} activos` : '...'}
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                            if (!user.id) return null;
                            const triviaScore = getTriviaScore(user);
                            const limitReached = globalConfig?.triviaPointsLimit !== null && globalConfig?.triviaPointsLimit !== undefined && triviaScore >= globalConfig.triviaPointsLimit;
                            return (
                            <Card key={user.id} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg flex items-center gap-2">
                                          {user.username}
                                          <Badge variant={user.userType === 'invitado' ? 'secondary' : 'outline'}>
                                              {user.userType === 'empleado' ? 'Empleado' : 'Invitado'}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">DNI: {user.legajo}</p>
                                    </div>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setHistoryUser(user)}>
                                                <History className="mr-2 h-4 w-4" /> Ver Historial
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => openConfirmationDialog('reset', user)}>
                                                <KeyRound className="mr-2 h-4 w-4" /> Restablecer Contraseña
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => openConfirmationDialog('delete', user)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuario
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <Separator className="my-3" />

                                <Collapsible>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Nº Sorteo:</span>
                                            <span className="font-medium flex items-center gap-1"><Ticket className="h-4 w-4 text-green-600"/>{user.raffleNumber || '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Total EDSACoins:</span>
                                            <span className="font-bold text-lg flex items-center gap-1"><Coins className="h-5 w-5 text-primary"/>{user.score}</span>
                                        </div>

                                        <CollapsibleContent className="space-y-2 pt-2 animate-in fade-in-0">
                                             <div className="flex justify-between">
                                                <span className="text-muted-foreground">Puntos de Trivia:</span>
                                                <span className="font-medium flex items-center gap-1">
                                                    {triviaScore}
                                                    {limitReached && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger><Lock className="h-4 w-4 text-destructive"/></TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Límite de puntos de trivia alcanzado.</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Por Antigüedad:</span>
                                                <span className="font-medium flex items-center gap-1"><Medal className="h-4 w-4 text-amber-500"/>{user.seniorityScore || 0}</span>
                                            </div>
                                             <div className="flex justify-between">
                                                <span className="text-muted-foreground">Puntos del Pelado:</span>
                                                <span className="font-medium flex items-center gap-1"><Crown className="h-4 w-4 text-purple-500"/>{user.peladoScore || 0}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Puntos del Sorteo:</span>
                                                <span className="font-medium flex items-center gap-1"><Ticket className="h-4 w-4 text-cyan-500"/>{user.raffleScore || 0}</span>
                                            </div>
                                        </CollapsibleContent>
                                    </div>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" size="sm" className="w-full mt-2">
                                            <ChevronsUpDown className="mr-2 h-4 w-4" />
                                            Ver Desglose
                                        </Button>
                                    </CollapsibleTrigger>
                                </Collapsible>

                                <Separator className="my-3" />
                                <div className="grid grid-cols-3 gap-2 text-center">
                                     <div className="flex flex-col items-center gap-2">
                                        <span className="text-muted-foreground font-semibold text-xs">Trivia</span>
                                        <ManageTriviaCoinsForm userId={user.id} />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-muted-foreground font-semibold text-xs">Pelado</span>
                                        <ManagePeladoCoinsForm userId={user.id} />
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-muted-foreground font-semibold text-xs">Sorteo</span>
                                        <ManageRaffleCoinsForm userId={user.id} />
                                    </div>
                                </div>
                                <Separator className="my-3" />
                                <div className="text-sm flex justify-between">
                                    <span className="text-muted-foreground">Última Sesión:</span>
                                    <span className="font-medium">{formatLastLogin(user.lastLogin)}</span>
                                </div>
                            </Card>
                        )})
                    ) : (
                         <p className="text-center text-muted-foreground py-8">No se encontraron usuarios.</p>
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableHeader sortKey="legajo">DNI</SortableHeader>
                                <SortableHeader sortKey="username">Nombre</SortableHeader>
                                <SortableHeader sortKey="userType">Tipo</SortableHeader>
                                <SortableHeader sortKey="raffleNumber">Nº Sorteo</SortableHeader>
                                <SortableHeader sortKey="score">Total EDSACoins</SortableHeader>
                                {showDetailedPoints && (
                                    <>
                                        <SortableHeader sortKey="triviaScore">Ptos. Trivia</SortableHeader>
                                        <SortableHeader sortKey="seniorityScore">Ptos. Antigüedad</SortableHeader>
                                        <SortableHeader sortKey="peladoScore">Ptos. Pelado</SortableHeader>
                                        <SortableHeader sortKey="raffleScore">Ptos. Sorteo</SortableHeader>
                                    </>
                                )}
                                <TableHead>Última Sesión</TableHead>
                                <TableHead className="w-[180px]">Puntos de Trivia</TableHead>
                                <TableHead className="w-[180px]">Puntos del Pelado</TableHead>
                                <TableHead className="w-[180px]">Puntos del Sorteo</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    if (!user.id) return null;
                                    const triviaScore = getTriviaScore(user);
                                    const limitReached = globalConfig?.triviaPointsLimit !== null && globalConfig?.triviaPointsLimit !== undefined && triviaScore >= globalConfig.triviaPointsLimit;
                                    return (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.legajo}</TableCell>
                                        <TableCell className="font-medium">{user.username}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.userType === 'invitado' ? 'secondary' : 'outline'}>
                                                {user.userType === 'empleado' ? 'Empleado' : 'Invitado'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-semibold">
                                                <Ticket className="h-4 w-4 text-green-600"/>
                                                {user.raffleNumber || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 font-bold"><Coins className="h-4 w-4 text-primary"/>{user.score}</div>
                                        </TableCell>
                                        {showDetailedPoints && (
                                            <>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 font-semibold">
                                                        {triviaScore}
                                                        {limitReached && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger><Lock className="h-3 w-3 text-destructive"/></TooltipTrigger>
                                                                    <TooltipContent><p>Límite de puntos de trivia alcanzado.</p></TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 font-semibold">
                                                        <Medal className="h-4 w-4 text-amber-500" />
                                                        {user.seniorityScore || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 font-semibold">
                                                        <Crown className="h-4 w-4 text-purple-500" />
                                                        {user.peladoScore || 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 font-semibold">
                                                        <Ticket className="h-4 w-4 text-cyan-500" />
                                                        {user.raffleScore || 0}
                                                    </div>
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell>{formatLastLogin(user.lastLogin)}</TableCell>
                                        <TableCell>
                                            <ManageTriviaCoinsForm userId={user.id} />
                                        </TableCell>
                                        <TableCell>
                                            <ManagePeladoCoinsForm userId={user.id} />
                                        </TableCell>
                                        <TableCell>
                                            <ManageRaffleCoinsForm userId={user.id} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Abrir menú</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => setHistoryUser(user)}>
                                                        <History className="mr-2 h-4 w-4" />
                                                        Ver Historial
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => openConfirmationDialog('reset', user)}>
                                                        <KeyRound className="mr-2 h-4 w-4" />
                                                        Restablecer Contraseña
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => openConfirmationDialog('delete', user)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar Usuario
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )})
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={showDetailedPoints ? 15 : 10} className="h-24 text-center">
                                        No se encontraron usuarios con ese nombre o DNI.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive"/>
                    ¿Estás seguro?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {actionToConfirm?.type === 'delete'
                    ? `Esta acción eliminará permanentemente al usuario '${actionToConfirm.user.username}'. No se puede deshacer.`
                    : `La contraseña del usuario '${actionToConfirm?.user.username}' se restablecerá a "EDSA2025".`}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setActionToConfirm(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmAction} className={actionToConfirm?.type === 'delete' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
                    {actionToConfirm?.type === 'delete' ? 'Sí, eliminar' : 'Sí, restablecer'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        <Dialog open={!!historyUser} onOpenChange={(isOpen) => !isOpen && setHistoryUser(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Historial de Trivias de {historyUser?.username}</DialogTitle>
                    <DialogDescription>
                        Aquí puedes ver el detalle de las trivias completadas y las respuestas del usuario.
                    </DialogDescription>
                </DialogHeader>
                {historyUser && <UserTriviaHistory user={historyUser} />}
            </DialogContent>
        </Dialog>
    </div>
  );
}
