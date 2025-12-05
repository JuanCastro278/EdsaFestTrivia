
'use client';

import { useGame } from '@/context/GameContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PartyPopper, Ticket, UserX } from 'lucide-react';
import { useState, useMemo } from 'react';


export default function RafflePage() {
  const { globalConfig, users, player, selectRaffleNumber } = useGame();
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = useMemo(() => {
    if (!player) return null;
    return users.find(u => u.username === player.username);
  }, [player, users]);

  const activeEmployeeUsersCount = useMemo(() => {
    return users.filter(user => user.role === 'user' && user.userType === 'empleado' && user.lastLogin !== null).length;
  }, [users]);
  
  const takenNumbers = useMemo(() => {
    return users.map(u => u.raffleNumber).filter((n): n is number => n !== null && n !== undefined);
  }, [users]);

  const handleSelectNumber = (num: number) => {
    if (takenNumbers.includes(num)) return;
    setSelectedNumber(num === selectedNumber ? null : num);
  }
  
  const handleConfirmNumber = async () => {
    if (!selectedNumber || !currentUser?.id) return;
    
    setIsLoading(true);
    const success = await selectRaffleNumber(currentUser.id, selectedNumber);
    if (!success) {
      alert("Este número acaba de ser tomado. Por favor, elige otro.");
    }
    setIsLoading(false);
  }

  const isPlayerNumberValid = currentUser?.raffleNumber && currentUser.raffleNumber >= 1;

  const raffleGrid = useMemo(() => {
    if (activeEmployeeUsersCount === 0) return [];
    return Array.from({ length: activeEmployeeUsersCount }, (_, i) => i + 1).map(num => {
        const isTaken = takenNumbers.includes(num);
        const isSelected = selectedNumber === num;
        return (
            <Button
                key={num}
                variant={isSelected ? 'default' : isTaken ? 'secondary' : 'outline'}
                disabled={isTaken}
                onClick={() => handleSelectNumber(num)}
                className="aspect-square h-auto w-auto text-base"
            >
                {num}
            </Button>
        )
    });
  }, [activeEmployeeUsersCount, takenNumbers, selectedNumber]);

  if (currentUser?.userType === 'invitado') {
    return (
      <div>
        <div className="mb-8 sm:pt-6">
          <h1 className="text-3xl font-bold font-headline">Sorteo Especial</h1>
        </div>
        <Card className="text-center">
          <CardHeader>
            <UserX className="mx-auto h-16 w-16 text-muted-foreground" />
            <CardTitle className="text-2xl mt-4">Sorteo Exclusivo para Empleados</CardTitle>
            <CardDescription>
              Como invitado, no puedes participar en el sorteo. ¡Pero puedes seguir disfrutando de las trivias y los premios!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (isPlayerNumberValid) {
    return (
       <div>
        <div className="mb-8 sm:pt-6">
            <h1 className="text-3xl font-bold font-headline">Sorteo Especial</h1>
        </div>
        <Card className="text-center">
            <CardHeader>
                <PartyPopper className="mx-auto h-16 w-16 text-primary"/>
                <CardTitle className="text-2xl mt-4">¡Ya estás participando!</CardTitle>
                <CardDescription>
                   Ya elegiste tu número para el sorteo. ¡Mucha suerte!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Ticket className="h-12 w-12 mx-auto text-primary" />
                <p className="text-6xl font-bold text-primary mt-2">#{currentUser?.raffleNumber}</p>
            </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 sm:pt-6">
        <h1 className="text-3xl font-bold font-headline">Sorteo Especial</h1>
        <p className="text-muted-foreground mt-2">
          Elige tu número de la suerte para participar en el sorteo final.
        </p>
      </div>

      {!globalConfig?.raffleEnabled ? (
        <Card>
          <CardHeader>
            <CardTitle>¡Atentos!</CardTitle>
            <CardDescription className="mt-2">
                Aún no se ha abierto la posibilidad de elegir tu número de la suerte, pero pronto participarás por grandes premios.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>Selecciona tu número</CardTitle>
                <CardDescription>
                    Los números en gris ya han sido elegidos. ¡Elige uno de los disponibles!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-5 sm:grid-cols-10 md:grid-cols-10 lg:grid-cols-10 gap-2">
                    {raffleGrid}
                </div>
                 {activeEmployeeUsersCount === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        No hay empleados activos para mostrar en el sorteo.
                    </p>
                )}
            </CardContent>
            <CardContent>
                <Button className="w-full" disabled={!selectedNumber || isLoading} onClick={handleConfirmNumber}>
                    <Ticket className="mr-2 h-4 w-4" />
                    {isLoading ? 'Confirmando...' : selectedNumber ? `Confirmar número ${selectedNumber}` : 'Elige un número'}
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
