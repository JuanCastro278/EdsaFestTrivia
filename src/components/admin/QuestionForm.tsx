

"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Question } from "@/lib/types";
import { PlusCircle, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(10, "La pregunta debe tener al menos 10 caracteres."),
  imageUrl: z.string().optional().or(z.literal('')),
  options: z.array(z.string().min(1, "La opción no puede estar vacía.")).min(2, "Debe haber al menos 2 opciones.").max(4, "No puede haber más de 4 opciones."),
  correctAnswer: z.string().min(1, "Debes seleccionar una respuesta correcta."),
  timer: z.coerce.number().min(5, "El tiempo mínimo es 5 segundos.").max(120, "El tiempo máximo es 120 segundos."),
  points: z.coerce.number().gt(0, "Los puntos deben ser mayores que 0."),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  question: Question | null;
  onSave: (data: Question) => Promise<void>;
  onCancel: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function QuestionForm({ question, onSave, onCancel }: QuestionFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(question?.imageUrl || null);

  const defaultValues: Partial<QuestionFormValues> = question
    ? { ...question, options: question.options.slice(0, 4), imageUrl: question.imageUrl || '' }
    : {
        text: "",
        imageUrl: "",
        options: ["", ""],
        correctAnswer: "",
        timer: 30,
        points: 10,
      };

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const watchedOptions = form.watch("options");
  
  async function onSubmit(data: QuestionFormValues) {
    let finalImageUrl = imagePreview || '';

    if (imageFile) {
      const storageRef = ref(storage, `trivia-images/${Date.now()}-${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      finalImageUrl = await getDownloadURL(storageRef);
    }

    await onSave({
      id: question?.id || `q-${Date.now()}`,
      text: data.text,
      options: data.options,
      correctAnswer: data.correctAnswer,
      timer: data.timer,
      points: data.points,
      imageUrl: finalImageUrl,
    });
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      form.setValue('imageUrl', '');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
        form.setError("imageUrl", { message: "La imagen no debe pesar más de 5MB." });
        return;
    }
    
    form.clearErrors("imageUrl");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto de la Pregunta</FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: ¿Cuál es el producto estrella de la compañía?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Imagen (Opcional)</FormLabel>
          <FormControl>
            <div>
               <Input 
                  type="file" 
                  id="image-upload" 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={handleFileChange}
                />
               <label 
                  htmlFor="image-upload"
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
                <Image src={imagePreview} alt="Vista previa" fill className="object-contain"/>
                 <Button 
                   type="button"
                   variant="destructive"
                   size="icon"
                   className="absolute top-2 right-2 h-6 w-6"
                   onClick={() => {
                     setImageFile(null);
                     setImagePreview(null);
                     form.setValue('imageUrl', '');
                   }}
                 >
                   <Trash2 className="h-4 w-4"/>
                 </Button>
             </div>
           )}
          <FormDescription>La imagen no debe pesar más de 5MB.</FormDescription>
          <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
        </FormItem>


        <div>
          <FormLabel>Opciones de Respuesta</FormLabel>
          <div className="space-y-2 mt-2">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`options.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder={`Opción ${index + 1}`} {...field} />
                      </FormControl>
                      {fields.length > 2 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                     <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {fields.length < 4 && (
             <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append("")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Opción
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Respuesta Correcta</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecciona la respuesta correcta" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {watchedOptions?.map((option, index) => (
                        option.trim() && <SelectItem key={index} value={option}>{option}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

            <FormField
            control={form.control}
            name="timer"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Temporizador (segundos)</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Puntos por Respuesta Correcta</FormLabel>
                <FormControl>
                    <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Debe ser un número mayor a 0.</FormDescription>
                <FormMessage />
                </FormItem>
            )}
        />


        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : "Guardar Pregunta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
