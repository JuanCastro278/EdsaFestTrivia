

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { QuestionForm } from "@/components/admin/QuestionForm";
import type { Question, Trivia } from "@/lib/types";
import { useGame } from "@/context/GameContext";
import { Edit, FilePlus, Trash2, Power, PowerOff, Gamepad2, AlertTriangle, Star, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { arrayRemove, arrayUnion } from "firebase/firestore";

export default function AdminJuegosPage() {
  const { trivias, globalConfig, updateGlobalConfig, addOrUpdateTrivia, deleteTrivia, resetTriviaForAllUsers } = useGame();
  
  const [editingTrivia, setEditingTrivia] = useState<Trivia | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [isTriviaFormOpen, setIsTriviaFormOpen] = useState(false);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [triviaToDelete, setTriviaToDelete] = useState<Trivia | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [triviaToReset, setTriviaToReset] = useState<Trivia | null>(null);

  const [newTriviaName, setNewTriviaName] = useState("");

  const handleSaveTrivia = async () => {
    if (editingTrivia) {
      // Edit existing trivia
      await addOrUpdateTrivia({ ...editingTrivia, name: newTriviaName });
    } else {
      // Add new trivia
      const newTrivia: Omit<Trivia, 'id'> = {
        name: newTriviaName,
        questions: []
      };
      await addOrUpdateTrivia(newTrivia);
    }
    closeTriviaForm();
  };


  const openNewTriviaForm = () => {
    setEditingTrivia(null);
    setNewTriviaName("");
    setIsTriviaFormOpen(true);
  }

  const openEditTriviaForm = (trivia: Trivia) => {
    setEditingTrivia(trivia);
    setNewTriviaName(trivia.name);
    setIsTriviaFormOpen(true);
  }

  const closeTriviaForm = () => {
    setIsTriviaFormOpen(false);
    setEditingTrivia(null);
    setNewTriviaName("");
  }
  
  const confirmDeleteTrivia = (trivia: Trivia) => {
    setTriviaToDelete(trivia);
    setIsDeleteConfirmOpen(true);
  }

  const handleDeleteTrivia = async () => {
    if (triviaToDelete) {
      await deleteTrivia(triviaToDelete.id);
    }
    setIsDeleteConfirmOpen(false);
    setTriviaToDelete(null);
  };

  const confirmResetTrivia = (trivia: Trivia) => {
    setTriviaToReset(trivia);
    setIsResetConfirmOpen(true);
  };

  const handleResetTrivia = async () => {
    if (triviaToReset) {
      await resetTriviaForAllUsers(triviaToReset.id);
    }
    setIsResetConfirmOpen(false);
    setTriviaToReset(null);
  };


  // QUESTION MANAGEMENT
  const handleAddQuestion = (trivia: Trivia) => {
    setEditingTrivia(trivia);
    setEditingQuestion(null);
    setIsQuestionFormOpen(true);
  };

  const handleEditQuestion = (trivia: Trivia, question: Question) => {
    setEditingTrivia(trivia);
    setEditingQuestion(question);
    setIsQuestionFormOpen(true);
  };

  const handleDeleteQuestion = async (triviaId: string, questionId: string) => {
     const trivia = trivias.find(t => t.id === triviaId);
     if (!trivia) return;
     const updatedQuestions = trivia.questions.filter(q => q.id !== questionId);
     await addOrUpdateTrivia({ ...trivia, questions: updatedQuestions });
  };

  const handleSaveQuestion = async (questionData: Question) => {
    if (!editingTrivia) return;

    let updatedQuestions: Question[];

    if (editingQuestion) {
      // Edit: Replace the existing question.
      updatedQuestions = editingTrivia.questions.map(q => 
        q.id === questionData.id ? questionData : q
      );
    } else {
      // Add: Append the new question.
      updatedQuestions = [...editingTrivia.questions, questionData];
    }
    
    await addOrUpdateTrivia({ ...editingTrivia, questions: updatedQuestions });
    
    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
    setEditingTrivia(null);
  };
  
  const toggleTriviaState = async (triviaId: string) => {
    if (!globalConfig) return;
    const isActive = globalConfig.activeTriviaIds.includes(triviaId);
    await updateGlobalConfig({
      activeTriviaIds: isActive ? arrayRemove(triviaId) as any : arrayUnion(triviaId) as any
    });
  };


  return (
    <div className="container mx-auto grid gap-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Gestión de Trivias</CardTitle>
              <CardDescription>
                Crea, edita y activa las diferentes tandas de trivias.
              </CardDescription>
            </div>
            <Button onClick={openNewTriviaForm} className="w-full md:w-auto">
              <FilePlus className="mr-2 h-4 w-4" />
              Crear Nueva Trivia
            </Button>
          </CardHeader>
          <CardContent>
            {trivias.length > 0 ? (
              trivias.map((trivia) => {
                const isActive = globalConfig?.activeTriviaIds.includes(trivia.id) ?? false;
                return (
                <Card key={trivia.id} className="mb-6">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="flex items-center gap-2">
                           <Gamepad2 /> {trivia.name}
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                            <Button onClick={() => toggleTriviaState(trivia.id)} variant={isActive ? 'destructive' : 'default'} size="sm" disabled={trivia.questions.length === 0} className="w-full sm:w-auto">
                                {isActive ? <PowerOff className="mr-2 h-4 w-4" /> : <Power className="mr-2 h-4 w-4" />}
                                {isActive ? 'Desactivar' : 'Activar'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => confirmResetTrivia(trivia)}>
                              <RefreshCw className="mr-2 h-4 w-4" /> Reiniciar
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEditTriviaForm(trivia)} className="w-full sm:w-auto">
                                <Edit className="mr-2 h-4 w-4" /> Editar Nombre
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => confirmDeleteTrivia(trivia)} className="w-full sm:w-auto">
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar Trivia
                            </Button>
                        </div>
                    </div>
                     {isActive && <CardDescription className="text-green-600 font-bold pt-2">Esta trivia está activa.</CardDescription>}
                     {trivia.questions.length === 0 && <CardDescription className="text-yellow-600 font-bold pt-2">Añade preguntas para poder activar esta trivia.</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">Preguntas ({trivia.questions.length})</h3>
                         <Button size="sm" onClick={() => handleAddQuestion(trivia)}>
                            <FilePlus className="mr-2 h-4 w-4" />
                            Añadir Pregunta
                        </Button>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                      {trivia.questions.length > 0 ? (
                        trivia.questions.map(q => (
                          <Card key={q.id} className="p-4">
                            <p className="font-semibold">{q.text}</p>
                            <Separator className="my-2"/>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 font-semibold">
                                <Star className="h-4 w-4 text-yellow-500" />
                                {`${q.points} Puntos`}
                              </div>
                              <span>{q.timer} seg</span>
                            </div>
                            <div className="flex justify-end mt-3 gap-2">
                               <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditQuestion(trivia, q)}
                              >
                                  <Edit className="mr-2 h-4 w-4" /> Editar
                              </Button>
                              <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteQuestion(trivia.id, q.id)}
                              >
                                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No hay preguntas en esta trivia.
                        </p>
                      )}
                    </div>
                     
                     {/* Desktop View */}
                     <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Pregunta</TableHead>
                                <TableHead className="w-[150px]">Puntos</TableHead>
                                <TableHead className="w-[150px]">Temporizador</TableHead>
                                <TableHead className="w-[150px] text-right">Acciones</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {trivia.questions.length > 0 ? (
                                trivia.questions.map((q) => (
                                <TableRow key={q.id}>
                                    <TableCell className="font-medium">{q.text}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 font-semibold">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            {q.points}
                                        </div>
                                    </TableCell>
                                    <TableCell>{q.timer} seg</TableCell>
                                    <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditQuestion(trivia, q)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteQuestion(trivia.id, q.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No hay preguntas en esta trivia.
                                </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </div>
                  </CardContent>
                </Card>
              )})
            ) : (
                <div className="text-center text-muted-foreground py-12">No hay trivias creadas. ¡Crea una para empezar!</div>
            )}
          </CardContent>
        </Card>

      {/* Dialog for Creating/Editing Trivia */}
      <Dialog open={isTriviaFormOpen} onOpenChange={setIsTriviaFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTrivia ? "Editar Nombre de la Trivia" : "Crear Nueva Trivia"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                value={newTriviaName}
                onChange={(e) => setNewTriviaName(e.target.value)}
                className="col-span-3"
                placeholder="Ej: Trivia de Cultura General"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeTriviaForm}>Cancelar</Button>
            <Button onClick={handleSaveTrivia}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Deleting Trivia */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> ¿Estás seguro?</DialogTitle>
                  <DialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente la trivia
                      <span className="font-bold"> "{triviaToDelete?.name}"</span> y todas sus preguntas.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeleteTrivia}>Sí, eliminar</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      {/* Dialog for Resetting Trivia */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" /> ¿Confirmas el reinicio?
            </DialogTitle>
            <DialogDescription>
              Esto permitirá que todos los usuarios vuelvan a jugar la trivia{' '}
              <span className="font-bold">"{triviaToReset?.name}"</span>. Su progreso anterior en esta trivia se perderá.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleResetTrivia}>
              Sí, reiniciar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Dialog for Adding/Editing Question */}
      <Dialog open={isQuestionFormOpen} onOpenChange={setIsQuestionFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Editar Pregunta" : "Añadir Nueva Pregunta"}
            </DialogTitle>
             <DialogDescription>
              Añadiendo pregunta a la trivia: <span className="font-bold">{editingTrivia?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-6">
            <QuestionForm
              key={editingQuestion?.id || 'new'}
              question={editingQuestion}
              onSave={handleSaveQuestion}
              onCancel={() => setIsQuestionFormOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
