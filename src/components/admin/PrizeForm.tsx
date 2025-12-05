
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Prize } from "@/lib/types";
import { Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState } from "react";

const prizeSchema = z.object({
  id: z.string().optional(),
  alt: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  cost: z.coerce.number().min(1, "El costo debe ser de al menos 1."),
  src: z.string().optional().or(z.literal('')),
  productUrl: z.string().url("Debe ser una URL válida (ej: https://...).").optional().or(z.literal('')),
});

type PrizeFormValues = z.infer<typeof prizeSchema>;

interface PrizeFormProps {
  prize: Prize | null;
  onSave: (data: Omit<Prize, 'id'> & { id?: string }) => Promise<void>;
  onCancel: () => void;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function PrizeForm({ prize, onSave, onCancel }: PrizeFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(prize?.src || null);
  
  const defaultValues: Partial<PrizeFormValues> = prize
    ? { ...prize, productUrl: prize.productUrl || '', src: prize.src || '' }
    : {
        alt: "",
        description: "",
        cost: 10,
        src: "",
        productUrl: "",
      };

  const form = useForm<PrizeFormValues>({
    resolver: zodResolver(prizeSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const watchedSrc = form.watch('src');

  async function onSubmit(data: PrizeFormValues) {
    let imageUrl = prize?.src || '';

    if (imageFile) {
      const storageRef = ref(storage, `prize-images/${Date.now()}-${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    } else if (!imagePreview) {
      imageUrl = '';
    }

    const dataToSave: Omit<Prize, 'id'> & { id?: string } = {
      alt: data.alt,
      description: data.description,
      cost: data.cost,
      src: imageUrl,
      productUrl: data.productUrl,
      type: 'prize',
    };

    if (prize?.id) {
      dataToSave.id = prize.id;
    }
    
    await onSave(dataToSave);
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      form.setValue('src', '');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
        form.setError("src", { message: "La imagen no debe pesar más de 4MB." });
        return;
    }
    
    form.clearErrors("src");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="alt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Premio</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Auriculares Inalámbricos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del Premio</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: Experimenta el sonido de alta fidelidad sin cables." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Costo (en EDSACoins)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del Producto (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="https://ejemplo.com/producto" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Imagen del Premio</FormLabel>
          <FormControl>
            <div>
               <Input 
                  type="file" 
                  id="prize-image-upload" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileChange}
                />
               <label 
                  htmlFor="prize-image-upload"
                  className="cursor-pointer inline-flex items-center gap-2"
                >
                  <Button type="button" variant="outline" asChild>
                      <span>
                        <ImageIcon className="mr-2"/>
                        {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                      </span>
                  </Button>
               </label>
            </div>
          </FormControl>
           {imagePreview && (
             <div className="mt-4 relative w-full h-48 border rounded-lg overflow-hidden">
                <Image src={imagePreview} alt="Vista previa del premio" fill className="object-contain"/>
                 <Button 
                   type="button"
                   variant="destructive"
                   size="icon"
                   className="absolute top-2 right-2 h-6 w-6"
                   onClick={() => {
                     setImageFile(null);
                     setImagePreview(null);
                     form.setValue('src', '');
                   }}
                 >
                   <Trash2 className="h-4 w-4"/>
                 </Button>
             </div>
           )}
          <FormDescription>La imagen no debe pesar más de 4MB. Si no se sube una imagen, se usará la que ya existe (si la hay).</FormDescription>
          <FormMessage>{form.formState.errors.src?.message}</FormMessage>
        </FormItem>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? "Guardando..." : "Guardar Premio"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
