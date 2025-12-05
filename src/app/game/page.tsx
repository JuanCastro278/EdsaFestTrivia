
"use client";

import { useGame } from "@/context/GameContext";
import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle } from "lucide-react";
import Image from 'next/image';

export default function GamePage() {
  const {
    trivias,
    users,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    submitAnswer,
    player,
  } = useGame();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const triviaId = searchParams.get('triviaId');

  const currentUser = useMemo(() => {
    if (!player) return null;
    return users.find(u => u.username === player.username);
  }, [users, player]);

  useEffect(() => {
    if (!player) {
      router.replace('/');
    }
  }, [player, router]);
  
  useEffect(() => {
    if (currentUser && triviaId && currentUser.completedTrivias?.includes(triviaId)) {
        router.replace(`/results?triviaId=${triviaId}`);
    }
  }, [currentUser, triviaId, router]);


  const activeTrivia = useMemo(() => trivias.find(t => t.id === triviaId), [trivias, triviaId]);
  const currentQuestion = useMemo(() => activeTrivia?.questions[currentQuestionIndex], [activeTrivia, currentQuestionIndex]);

  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timer || 0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Effect to reset state when the question changes
  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timer);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [currentQuestion]);
  
  // Effect for the countdown timer
  useEffect(() => {
    if (isAnswered || !currentQuestion || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, currentQuestion, timeLeft]);
  
  const handleTimeUp = async () => {
    if (isAnswered) return; 

    if(currentUser?.id && triviaId && currentQuestion) {
      await submitAnswer(currentUser.id, triviaId, currentQuestion.id, null);
    }
    setIsAnswered(true);
  };
  
  // Effect to handle when time runs out
  useEffect(() => {
    if (!isAnswered && timeLeft === 0 && currentQuestion) {
      handleTimeUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isAnswered, currentQuestion]);


  const goToNextQuestion = () => {
    if (activeTrivia && currentQuestionIndex >= activeTrivia.questions.length - 1) {
      router.push(`/results?triviaId=${triviaId}`);
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  // Effect to automatically move to the next question after an answer
  useEffect(() => {
    if (isAnswered) {
      const nextQuestionTimer = setTimeout(() => {
        goToNextQuestion();
      }, 2000); // 2-second delay
      return () => clearTimeout(nextQuestionTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered]);


  const handleAnswerClick = async (option: string) => {
    if (isAnswered || !currentUser?.id || !triviaId || !currentQuestion) return;

    setSelectedAnswer(option);
    setIsAnswered(true); // Set answered state immediately for UI feedback
    await submitAnswer(currentUser.id, triviaId, currentQuestion.id, option); 
  };

  const getButtonVariant = (option: string) => {
    if (!isAnswered || !currentQuestion) return "outline";
    
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedAnswer;

    if (isSelected) {
      return isCorrect ? "default" : "destructive";
    }

    // Do not reveal the correct answer if the user was wrong
    return "outline";
  };
  
  if (!currentQuestion || !player || !currentUser || (triviaId && currentUser.completedTrivias?.includes(triviaId))) {
    return <div className="flex min-h-screen items-center justify-center">Cargando trivia...</div>;
  }
  
  const questions = activeTrivia?.questions || [];
  const progressPercentage = (timeLeft / currentQuestion.timer) * 100;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <CardHeader>
           <p className="text-sm text-center text-muted-foreground font-bold mb-2">{activeTrivia?.name}</p>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
            <Progress value={progressPercentage} className="w-full mt-2" />
            <p className="text-center font-bold text-lg mt-2">{timeLeft}s</p>
          </div>
          {(currentQuestion.imageUrl || currentQuestion.src) && (
    <div className="relative w-full h-48 md:h-72 mb-4 rounded-lg overflow-hidden">
        <Image
            src={currentQuestion.imageUrl ?? currentQuestion.src}

                    alt={`Imagen para la pregunta: ${currentQuestion.text}`}
                    fill
                    className="object-contain"
                    priority
                />
            </div>
          )}

          <CardTitle className="text-2xl md:text-3xl text-center font-headline">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={getButtonVariant(option)}
                className="h-auto min-h-[4rem] whitespace-normal text-lg justify-start p-4"
                onClick={() => handleAnswerClick(option)}
                disabled={isAnswered}
              >
                {option}
              </Button>
            ))}
          </div>
            {isAnswered && (
                <div className="mt-6">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                    <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>¡Correcto!</AlertTitle>
                        <AlertDescription>
                            Ganaste {currentQuestion.points} EDSACoins.
                        </AlertDescription>
                    </Alert>
                ) : selectedAnswer !== null ? (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>¡Incorrecto!</AlertTitle>
                         <AlertDescription>
                            ¡No te preocupes! Sigue intentando.
                        </AlertDescription>
                    </Alert>
                ) : (
                   <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>¡Tiempo!</AlertTitle>
                         <AlertDescription>
                            Se acabó el tiempo. ¡Más rápido la próxima vez!
                        </AlertDescription>
                    </Alert>
                )}
                </div>
            )}
        </CardContent>
      </div>
    </main>
  );
}
