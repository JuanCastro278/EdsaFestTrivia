
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
import { useToast } from "@/hooks/use-toast";

const passwordSchema = z.object({
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula.")
    .regex(/[0-9]/, "Debe contener al menos un número.")
    .refine(password => password !== "EDSA2025", {
      message: "No puedes usar la contraseña por defecto."
    }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ChangePasswordFormProps {
  onSave: (newPassword: string) => Promise<void>;
}

export function ChangePasswordForm({ onSave }: ChangePasswordFormProps) {
  const { toast } = useToast();
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    await onSave(data.password);
    toast({
      title: "¡Éxito!",
      description: "Tu contraseña ha sido actualizada.",
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-sm">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormDescription>
                Mínimo 6 caracteres, 1 mayúscula y 1 número.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </form>
    </Form>
  );
}
