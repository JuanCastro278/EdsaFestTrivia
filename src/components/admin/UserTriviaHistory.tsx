
"use client";

import { useGame } from "@/context/GameContext";
import type { User } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserTriviaHistoryProps {
  user: User;
}

export function UserTriviaHistory({ user }: UserTriviaHistoryProps) {
  const { trivias } = useGame();

  const completedTriviasDetails = user.completedTrivias
    ?.map(triviaId => {
      const trivia = trivias.find(t => t.id === triviaId);
      if (!trivia) return null;

      const results = user.answers?.[triviaId];
      if (!results) return null;
      
      const totalPoints = trivia.questions.reduce((sum, q) => {
        return results[q.id] === true ? sum + (q.points || 0) : sum;
      }, 0);

      return {
        ...trivia,
        results,
        totalPoints
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  if (!completedTriviasDetails || completedTriviasDetails.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Este usuario aún no ha completado ninguna trivia.
      </div>
    );
  }

  return (
    <ScrollArea className="h-96 pr-4">
        <Accordion type="single" collapsible className="w-full">
        {completedTriviasDetails.map(trivia => (
            <AccordionItem key={trivia.id} value={trivia.id}>
                <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-2">
                        <span className="font-semibold">{trivia.name}</span>
                        <span className="text-sm font-bold text-primary">+{trivia.totalPoints} Puntos</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-3">
                        {trivia.questions.map((q, index) => {
                            const wasCorrect = trivia.results[q.id];
                            let Icon = HelpCircle;
                            let color = "text-muted-foreground";
                            if (wasCorrect === true) {
                                Icon = CheckCircle2;
                                color = "text-green-500";
                            } else if (wasCorrect === false) {
                                Icon = XCircle;
                                color = "text-destructive";
                            }

                            return (
                                <div key={q.id} className="text-sm p-3 border rounded-md bg-secondary/30">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium pr-4">{index + 1}. {q.text}</p>
                                        <div className={cn("flex items-center gap-2 shrink-0", color)}>
                                            <span className="font-bold">{wasCorrect ? `+${q.points}` : '+0'}</span>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                     <p className="text-xs text-muted-foreground mt-1">
                                        Respuesta correcta: <span className="font-semibold text-foreground">{q.correctAnswer}</span>
                                     </p>
                                </div>
                            )
                        })}
                    </div>
                </AccordionContent>
            </AccordionItem>
        ))}
        </Accordion>
    </ScrollArea>
  );
}

    