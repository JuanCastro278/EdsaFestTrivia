
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { useGame } from "@/context/GameContext";
import { Edit, FilePlus, Trash2, AlertTriangle, Gift, Coins, ExternalLink } from "lucide-react";
import Image from "next/image";
import { PrizeForm } from "@/components/admin/PrizeForm";
import type { Prize } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PremiosPage() {
  const { prizes, addOrUpdatePrize, deletePrize, globalConfig, updateGlobalConfig } = useGame();
  
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [prizeToDelete, setPrizeToDelete] = useState<Prize | null>(null);

  const openNewPrizeForm = () => {
    setEditingPrize(null);
    setIsFormOpen(true);
  }

  const openEditPrizeForm = (prize: Prize) => {
    setEditingPrize(prize);
    setIsFormOpen(true);
  }

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPrize(null);
  }
  
  const confirmDeletePrize = (prize: Prize) => {
    setPrizeToDelete(prize);
setIsDeleteConfirmOpen(true);
  }

  const handleDeletePrize = async () => {
    if (prizeToDelete) {
      await deletePrize(prizeToDelete.id);
    }
    setIsDeleteConfirmOpen(false);
    setPrizeToDelete(null);
  };
  
  const handleSavePrize = async (prizeData: Omit<Prize, 'id'> & { id?: string }) => {
    await addOrUpdatePrize(prizeData);
    closeForm();
  };

  const handleTogglePrizeUrls = async (enabled: boolean) => {
    await updateGlobalConfig({ prizeUrlsEnabled: enabled });
  };


  return (
    <div className="container mx-auto grid gap-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Gift /> Gestión de Premios</CardTitle>
              <CardDescription>
                Añade, edita o elimina los premios del catálogo.
              </CardDescription>
            </div>
            <Button onClick={openNewPrizeForm} className="w-full md:w-auto">
              <FilePlus className="mr-2 h-4 w-4" />
              Añadir Premio
            </Button>
          </CardHeader>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ExternalLink /> Control de Enlaces</CardTitle>
                <CardDescription>
                    Activa o desactiva la visibilidad del botón "Ver Premio" para todos los usuarios.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="prize-url-switch"
                        checked={globalConfig?.prizeUrlsEnabled ?? false}
                        onCheckedChange={handleTogglePrizeUrls}
                    />
                    <Label htmlFor="prize-url-switch" className="text-base">
                        {globalConfig?.prizeUrlsEnabled ? 'Enlaces de Premios Visibles' : 'Enlaces de Premios Ocultos'}
                    </Label>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Catálogo Actual</CardTitle>
            </CardHeader>
          <CardContent>
            {/* Mobile View */}
            <div className="grid grid-cols-2 gap-4 md:hidden">
              {prizes.length > 0 ? (
                prizes.map((prize) => (
                  <Card key={prize.id} className="flex flex-col">
                      <CardHeader className="p-0">
                         <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
                              <Image
                                  src={prize.src}
                                  alt={prize.alt}
                                  fill
                                  className="object-contain"
                              />
                         </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow flex flex-col">
                          <CardTitle className="text-base">{prize.alt}</CardTitle>
                           <div className="flex items-center gap-2 font-bold text-base text-primary my-2">
                                <Coins className="h-4 w-4" />
                                <span>{prize.cost}</span>
                            </div>
                          <CardDescription className="text-xs">{prize.description}</CardDescription>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 mt-auto">
                          <div className="flex w-full justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditPrizeForm(prize)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => confirmDeletePrize(prize)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                      </CardFooter>
                  </Card>
                ))
              ) : (
                  <div className="col-span-full text-center text-muted-foreground py-12">
                      No hay premios en el catálogo.
                  </div>
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[120px]">Costo (EDSACoins)</TableHead>
                    <TableHead className="w-[150px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizes.length > 0 ? (
                    prizes.map((prize) => (
                      <TableRow key={prize.id}>
                        <TableCell>
                          <div className="relative h-12 w-12 rounded-md overflow-hidden">
                              <Image src={prize.src} alt={prize.alt} fill className="object-contain" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{prize.alt}</TableCell>
                        <TableCell>{prize.description}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1 font-semibold">
                                <Coins className="h-4 w-4 text-primary" />
                                {prize.cost}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditPrizeForm(prize)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => confirmDeletePrize(prize)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No hay premios en el catálogo. ¡Añade uno para empezar!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      {/* Dialog for Deleting Prize */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> ¿Estás seguro?</DialogTitle>
                  <DialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente el premio
                      <span className="font-bold"> "{prizeToDelete?.alt}"</span>.
                  </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeletePrize}>Sí, eliminar</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>


      {/* Dialog for Adding/Editing Prize */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingPrize ? "Editar Premio" : "Añadir Nuevo Premio"}
            </DialogTitle>
          </DialogHeader>
           <ScrollArea className="max-h-[70vh] pr-6">
              <PrizeForm
                key={editingPrize?.id || 'new'}
                prize={editingPrize}
                onSave={handleSavePrize}
                onCancel={closeForm}
              />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
