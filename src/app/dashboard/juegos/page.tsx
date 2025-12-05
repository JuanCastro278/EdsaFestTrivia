
'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, BarChart2 } from 'lucide-react';
import { useMemo } from 'react';
import type { User, Trivia } from '@/lib/types';

export default function DashboardGamesPage() {
  const { player, users, trivias, globalConfig, setInitialScore, setCurrentQuestionIndex } = useGame();
  const router = useRouter();

  const handlePlay = (triviaId: string) => {
    if (!player) return;
    setInitialScore();
    setCurrentQuestionIndex(0);
    router.push(`/game?user=${player.username}&triviaId=${triviaId}`);
  };

  const handleViewResults = (triviaId: string) => {
    router.push(`/results?triviaId=${triviaId}`);
  };
  
  const currentUser = useMemo((): User | undefined => {
    if (!player) return undefined;
    return users.find(u => u.username === player.username);
  }, [player, users]);

  const triviasToDisplay = useMemo(() => {
    if (!currentUser || !globalConfig) return [];

    const completedIds = currentUser.completedTrivias || [];
    const activeIds = globalConfig.activeTriviaIds || [];
    
    const allRelevantTrivias = trivias.filter(trivia => 
      activeIds.includes(trivia.id) || completedIds.includes(trivia.id)
    );
    
    // Remove duplicates
    const uniqueTrivias = Array.from(new Map(allRelevantTrivias.map(t => [t.id, t])).values());
    
    return uniqueTrivias;
  }, [trivias, globalConfig, currentUser]);


  return (
    <div>
        <div className="mb-6 sm:pt-6">
            <h1 className="text-3xl font-bold font-headline">Juegos Activos</h1>
            <p className="text-muted-foreground mt-2">¡Demuestra lo que sabes y gana EDSACoins!</p>
        </div>

        {triviasToDisplay.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {triviasToDisplay.map(trivia => {
                const isCompleted = currentUser?.completedTrivias?.includes(trivia.id);
                const isActive = globalConfig?.activeTriviaIds.includes(trivia.id);

                return (
                    <Card key={trivia.id} className={`flex flex-col ${isCompleted ? 'bg-muted/70' : ''}`}>
                        <CardHeader>
                            <CardTitle>{trivia.name}</CardTitle>
                            <CardDescription>{trivia.questions.length} preguntas</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {isCompleted ? (
                                <p className="text-sm font-semibold text-muted-foreground">
                                    Ya completaste esta trivia.
                                </p>
                            ) : isActive ? (
                                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                ¡Esta trivia está activa ahora mismo!
                                </p>
                            ) : (
                                <p className="text-sm font-semibold text-muted-foreground">
                                    Esta trivia ya no está activa.
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            {isActive && !isCompleted && (
                                <Button 
                                    onClick={() => handlePlay(trivia.id)} 
                                    className="w-full"
                                >
                                <Play className="mr-2 h-4 w-4" />
                                Jugar Trivia
                                </Button>
                            )}
                            {isCompleted && (
                                <Button
                                    onClick={() => handleViewResults(trivia.id)}
                                    variant="secondary"
                                    className="w-full"
                                >
                                    <BarChart2 className="mr-2 h-4 w-4" />
                                    Ver Resultados
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                )
            })}
            </div>
        ) : (
            <div className="text-center py-12 px-6 bg-card rounded-lg shadow-sm">
                <CardHeader>
                    <CardTitle>No hay juegos por ahora</CardTitle>
                    <CardDescription>
                        El administrador no ha activado ninguna trivia en este momento. Vuelve a intentarlo más tarde.
                    </CardDescription>
                </CardHeader>
            </div>
        )}
    </div>
  );
}
