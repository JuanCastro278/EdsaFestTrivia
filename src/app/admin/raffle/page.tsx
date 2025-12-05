
'use client';

import { useGame } from '@/context/GameContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMemo, useState } from 'react';
import { User, AlertTriangle, BadgePercent, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function RaffleAdminActions() {
    const { users } = useGame();
    const [numberToFree, setNumberToFree] = useState('');
    const [isFreeNumberDialogOpen, setIsFreeNumberDialogOpen] = useState(false);

    const handleResetRaffle = async () => {
        const batch = writeBatch(db);
        users.forEach(user => {
            if (user.id && user.raffleNumber !== null && user.raffleNumber !== undefined) {
                const userRef = doc(db, "users", user.id);
                batch.update(userRef, { raffleNumber: null });
            }
        });
        await batch.commit();
    };
    
    const handleFreeNumber = async () => {
        const num = parseInt(numberToFree, 10);
        if (isNaN(num) || num < 1) return;

        const userToUpdate = users.find(u => u.raffleNumber === num);
        if (userToUpdate && userToUpdate.id) {
            const userRef = doc(db, "users", userToUpdate.id);
            await updateDoc(userRef, { raffleNumber: null });
        }
        
        setIsFreeNumberDialogOpen(false);
        setNumberToFree('');
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Acciones de Administrador</CardTitle>
                <CardDescription>
                    Herramientas para gestionar el estado del sorteo.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                {/* Dialogo para liberar un número */}
                <AlertDialog open={isFreeNumberDialogOpen} onOpenChange={setIsFreeNumberDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline"><BadgePercent className="mr-2"/>Liberar un Número</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Liberar Número de Sorteo</AlertDialogTitle>
                            <AlertDialogDescription>
                                Escribe el número del casillero que quieres dejar disponible nuevamente. El usuario asociado perderá su selección.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                             <Label htmlFor="number-to-free" className="sr-only">
                                Número a liberar
                            </Label>
                            <Input
                                id="number-to-free"
                                type="number"
                                placeholder="Ej: 42"
                                value={numberToFree}
                                onChange={(e) => setNumberToFree(e.target.value)}
                            />
                        </div>
                        <AlertDialogFooter>
                           <AlertDialogCancel onClick={() => setNumberToFree('')}>Cancelar</AlertDialogCancel>
                           <AlertDialogAction onClick={handleFreeNumber} disabled={!numberToFree}>
                             Liberar Número
                           </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Dialogo para reiniciar el sorteo */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Reiniciar Sorteo</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle />
                                ¿Estás seguro?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción es irreversible. Se eliminarán todos los números de sorteo
                                asignados a los usuarios. Deberán volver a elegir su número.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel>Cancelar</AlertDialogCancel>
                           <AlertDialogAction onClick={handleResetRaffle}>
                             Sí, reiniciar sorteo
                           </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

export default function AdminRafflePage() {
  const { users, globalConfig, updateGlobalConfig } = useGame();

  const activeEmployeeUsersCount = useMemo(() => {
    return users.filter(user => user.role === 'user' && user.userType === 'empleado' && user.lastLogin !== null).length;
  }, [users]);

  const raffleSelections = useMemo(() => {
    const selections = new Map<number, string>();
    users.forEach(user => {
      if (user.raffleNumber !== null && user.raffleNumber !== undefined) {
        selections.set(user.raffleNumber, user.username);
      }
    });
    return selections;
  }, [users]);

  const raffleGrid = useMemo(() => {
    if (activeEmployeeUsersCount === 0) return [];
    return Array.from({ length: activeEmployeeUsersCount }, (_, i) => i + 1).map(num => {
        const userName = raffleSelections.get(num);
        return (
          <div
              key={num}
              className={cn(
                "flex flex-col items-center justify-center border rounded-lg bg-secondary/50 p-2 text-center",
                userName && "border-green-500 border-2"
              )}
          >
              <span className="text-lg font-bold">{num}</span>
              {userName ? (
                  <span className="text-xs font-semibold text-primary break-words">{userName}</span>
              ) : (
                  <User className="h-4 w-4 text-muted-foreground"/>
              )}
          </div>
        );
    });
  }, [activeEmployeeUsersCount, raffleSelections]);

  const handleRaffleToggle = async (enabled: boolean) => {
      await updateGlobalConfig({ raffleEnabled: enabled });
  }

  return (
    <div className="grid gap-8">
        <div className="mb-6">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3"><Ticket/> Gestión del Sorteo</h1>
            <p className="text-muted-foreground">
                Activa el sorteo y visualiza los participantes.
            </p>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Control del Sorteo</CardTitle>
          <CardDescription>
            Usa el interruptor para iniciar o detener el sorteo para todos los usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="raffle-switch"
              checked={globalConfig?.raffleEnabled ?? false}
              onCheckedChange={handleRaffleToggle}
            />
            <Label htmlFor="raffle-switch" className="text-base">
              {globalConfig?.raffleEnabled ? 'Sorteo Activo' : 'Sorteo Inactivo'}
            </Label>
          </div>
        </CardContent>
      </Card>
      
      <RaffleAdminActions />
      
      <Card>
        <CardHeader>
          <CardTitle>Participantes del Sorteo</CardTitle>
          <CardDescription>
            Se han generado {activeEmployeeUsersCount} casilleros, uno por cada empleado que ha iniciado sesión. Los invitados no participan.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
                {raffleGrid}
            </div>
            {activeEmployeeUsersCount === 0 && (
                <p className="text-center text-muted-foreground py-8">
                    No hay empleados activos para mostrar en el sorteo.
                </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
