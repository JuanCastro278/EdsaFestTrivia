
'use client';

import { useGame } from '@/context/GameContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Home, CheckCircle2, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function ResultsPage() {
  const { player, trivias, setCurrentQuestionIndex, users, finalizeTrivia } = useGame();
  const router = useRouter();
  const searchParams = useSearchParams();

  const triviaId = searchParams.get('triviaId');

  const trivia = useMemo(() => trivias.find(t => t.id === triviaId), [trivias, triviaId]);
  
  const currentUser = useMemo(() => {
    if (!player) return null;
    return users.find(u => u.username === player.username);
  }, [users, player]);

  const triviaResults = currentUser?.answers?.[triviaId || ''];

  const triviaScore = useMemo(() => {
    if (!triviaResults || !trivia) return 0;

    return trivia.questions.reduce((totalScore, question) => {
        if (triviaResults[question.id] === true) {
            return totalScore + (question.points || 10);
        }
        return totalScore;
    }, 0);
  }, [triviaResults, trivia]);

  useEffect(() => {
    if (currentUser?.id && triviaId && triviaResults !== undefined) {
      const alreadyFinalized = currentUser.completedTrivias?.includes(triviaId);
      if (!alreadyFinalized) {
        finalizeTrivia(currentUser.id, triviaId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triviaId, currentUser?.id, triviaResults]);
  
  useEffect(() => {
    if (!player) {
      router.replace('/');
    }
  }, [player, router]);
  
  const handleGoToDashboard = () => {
    setCurrentQuestionIndex(0); // Reset for next game
    router.push('/dashboard');
  };

  if (!player || !currentUser) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="flex flex-col items-center p-6">
          <Trophy className="mx-auto h-16 w-16 text-yellow-500" />
          <h2 className="mt-4 text-3xl font-headline font-semibold leading-none tracking-tight">
            ¡Trivia Finalizada!
          </h2>
          <p className="text-lg text-muted-foreground">
            Estos son tus resultados, {player.username}.
          </p>
        </div>
        <div className="space-y-6 p-6 pt-0">
          <div className="space-y-2">
            <p className="text-muted-foreground">Puntuación de esta trivia</p>
            <p className="text-5xl font-bold text-primary">+{triviaScore}</p>
            <p className="font-semibold">EDSACoins</p>
          </div>
          
           {trivia && triviaResults && (
             <div className="w-full text-left">
                <Separator className="my-4" />
                <h3 className="text-base font-semibold mb-2">Resumen de respuestas</h3>
                <ScrollArea className="h-60">
                  <div className="space-y-3 pr-4">
                    {trivia.questions.map((q, index) => {
                      const wasCorrect = triviaResults[q.id];
                      return (
                        <div key={q.id} className={cn("flex items-start justify-between rounded-md border p-3",
                            wasCorrect === true && "bg-green-100/10 dark:bg-green-900/30 border-green-200/20 dark:border-green-800/50",
                            wasCorrect === false && "bg-red-100/10 dark:bg-red-900/30 border-red-200/20 dark:border-red-800/50",
                             wasCorrect === undefined && "bg-muted/10 border-muted/50"
                        )}>
                          <p className={cn("flex-1 pr-4 text-sm",
                            wasCorrect === true && "text-green-400",
                            wasCorrect === false && "text-red-400",
                          )}>{index + 1}. {q.text}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {wasCorrect === true && (
                                <>
                                    <span className="text-xs font-bold text-green-500">+{q.points || 10}</span>
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </>
                            )}
                            {wasCorrect === false && (
                                <XCircle className="h-5 w-5 text-destructive" />
                            )}
                            {wasCorrect === undefined && ( // For unanswered questions
                                <XCircle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </div>
           )}

        </div>
        <div className="flex items-center p-6 pt-0">
          <Button className="w-full" onClick={handleGoToDashboard}>
            <Home className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
        </div>
      </div>
    </main>
  );
}
