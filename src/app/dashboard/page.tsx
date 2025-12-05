
'use client';

import { useGame } from '@/context/GameContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play, BarChart2, Check, Trophy, Ticket } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import type { User } from '@/lib/types';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Progress } from '@/components/ui/progress';
import { EdsaCoinIcon, MissionIcon } from '@/components/Logo';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardHomePage() {
  const { player, users, trivias, globalConfig, setInitialScore, clearPreviousScore } = useGame();
  const router = useRouter();

  const handlePlay = (triviaId: string) => {
    if (!player) return;
    setInitialScore();
    router.push(`/game?user=${player.username}&triviaId=${triviaId}`);
  };

  const handleViewResults = (triviaId: string) => {
    router.push(`/results?triviaId=${triviaId}`);
  };
  
  useEffect(() => {
    if (player?.previousScore !== undefined) {
      const timer = setTimeout(() => {
        clearPreviousScore();
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [player, clearPreviousScore]);


  const activeTrivias = useMemo(() => {
      if (!globalConfig) return [];
      return trivias.filter(t => globalConfig.activeTriviaIds.includes(t.id));
  }, [trivias, globalConfig]);

  const currentUser = useMemo((): User | undefined => {
    if (!player) return undefined;
    return users.find(u => u.username === player.username);
  }, [player, users]);

  if (!player || !currentUser || !globalConfig) {
    return null;
  }
  
  const fromScore = player.previousScore ?? currentUser.score;
  const toScore = currentUser.score;
  
  const completedTriviasCount = currentUser.completedTrivias?.filter(id => globalConfig.activeTriviaIds.includes(id)).length || 0;
  const totalActiveTrivias = activeTrivias.length;
  const hasAvailableMissions = completedTriviasCount < totalActiveTrivias;
  
  const missionsProgress = totalActiveTrivias > 0 ? (completedTriviasCount / totalActiveTrivias) * 100 : 0;
  const allMissionsCompleted = !hasAvailableMissions && totalActiveTrivias > 0;

  return (
    <div className="grid gap-6">
      <div className="bg-card/80 border border-border p-4 sm:p-6 rounded-2xl neon-shadow mt-6">
          <div className="flex justify-between items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">¡HOLA,</h1>
                <p className="text-3xl sm:text-4xl font-extrabold text-amber-400">{currentUser.username.toUpperCase()}!</p>
              </div>
              <Link href="/dashboard/raffle" className="relative bg-gradient-to-br from-primary/10 to-accent/10 p-3 rounded-xl text-center border-2 border-primary/50 hover:from-primary/20 hover:to-accent/20 transition-colors cursor-pointer">
                {currentUser.raffleNumber ? (
                  <>
                    <Ticket className="h-8 w-8 mx-auto text-primary"/>
                    <p className="text-2xl font-bold text-primary mt-1">#{String(currentUser.raffleNumber).padStart(3, '0')}</p>
                    <p className="text-xs text-muted-foreground font-semibold">Tu Nº de Sorteo</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full px-2">
                    <Ticket className="h-8 w-8 mx-auto text-muted-foreground/50"/>
                    <p className="text-xs font-semibold text-muted-foreground/80 mt-2 text-center">
                      {globalConfig.raffleEnabled ? "¡Ya puedes elegir tu número!" : "Sorteo pronto"}
                    </p>
                  </div>
                )}
              </Link>
          </div>
      </div>
      
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 border border-border p-6 rounded-2xl neon-border">
          <div className="flex items-center gap-3 mb-4">
            <EdsaCoinIcon className="w-8 h-8 text-amber-400"/>
            <h2 className="text-xl font-bold text-amber-400">TUS EDSACOINS</h2>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-6xl font-bold text-cyan-400 drop-shadow-cyan-neon">
                <AnimatedCounter from={fromScore} to={toScore} />
            </p>
          </div>
          <Progress 
            value={allMissionsCompleted ? 100 : missionsProgress} 
            className="w-full mt-4 h-3 bg-slate-800" 
            indicatorClassName={cn(
              "bg-gradient-to-r from-cyan-400 to-primary",
              allMissionsCompleted && "from-green-400 to-emerald-500"
            )}
          />
          <p className={cn(
            "text-center font-semibold text-cyan-400 text-sm mt-2",
            allMissionsCompleted && "text-green-400"
          )}>
            {hasAvailableMissions
              ? '¡HAY MISIONES DISPONIBLES, COMPLETALAS PARA GANAR EDSACOINS!'
              : '¡COMPLETASTE TODAS LAS MISIONES DISPONIBLES!'}
          </p>
      </div>

      <div className="bg-card/80 border border-border p-6 rounded-2xl neon-border">
         <div className="flex items-center gap-3 mb-4">
            <MissionIcon className="w-8 h-8 text-amber-400"/>
            <h2 className="text-xl font-bold text-amber-400">TUS MISIONES</h2>
          </div>
        {activeTrivias.length > 0 ? (
            <div className="grid gap-4">
            {activeTrivias.map(trivia => {
                const isCompleted = currentUser?.completedTrivias?.includes(trivia.id);
                return (
                    <div key={trivia.id} className="bg-background/70 border border-border/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                        <div className="flex items-center gap-4 w-full">
                            <div className="bg-secondary p-3 rounded-lg">
                                <Trophy className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="w-full">
                                <p className="font-bold text-lg">{trivia.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                                    <span>{trivia.questions.length} PREGUNTAS</span>
                                    {isCompleted && (
                                        <>
                                            <span className="text-muted-foreground/50">•</span>
                                            <div className="flex items-center gap-1 text-green-400">
                                                <span>COMPLETADA</span>
                                                <Check className="w-4 h-4"/>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                           {!isCompleted ? (
                                <Button 
                                    onClick={() => handlePlay(trivia.id)} 
                                    className="w-full sm:w-auto bg-primary/20 text-foreground border border-primary hover:bg-primary/40 shadow-primary-neon"
                                >
                                    Jugar Trivia
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleViewResults(trivia.id)}
                                    variant="outline"
                                    className="w-full sm:w-auto bg-secondary/50 border-border"
                                >
                                    Ver Resultados
                                </Button>
                            )}
                        </div>
                    </div>
                )
            })}
            </div>
        ) : (
             <div className="text-center py-8 px-6 bg-background/50 rounded-lg">
                <p className="font-bold">No hay misiones por ahora</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Vuelve a intentarlo más tarde.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}
