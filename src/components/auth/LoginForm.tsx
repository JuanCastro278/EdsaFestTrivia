"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useGame } from '@/context/GameContext';

// 🔥 IMPORTS DE FIREBASE
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

const loginSchema = z.object({
  legajo: z.string().min(1, { message: 'El DNI es requerido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Desde tu GameContext (pero ya no usaremos el backend local)
  const { setPlayer } = useGame();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    try {
      // 1. Buscar usuario en Firestore por legajo
      const q = query(
        collection(db, "users"),
        where("legajo", "==", data.legajo)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Usuario no encontrado.");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const user = userDoc.data();

      // 2. Verificar contraseña
      if (user.password !== data.password) {
        setError("Contraseña incorrecta.");
        return;
      }

      // 3. Actualizar lastLogin en Firestore
      await updateDoc(userDoc.ref, {
        lastLogin: new Date().toISOString(),
      });

      // 4. Guardar usuario en tu GameContext
      setPlayer({
        id: userDoc.id,          
        username: user.username,
        score: user.score
      });

      // 5. Redirección según rol
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError("Hubo un error al iniciar sesión.");
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error de inicio de sesión</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="legajo">DNI</Label>
            <Input id="legajo" {...register('legajo')} placeholder="ej: 12345678" />
            {errors.legajo && <p className="text-sm text-destructive">{errors.legajo.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" {...register('password')} placeholder="••••••••" />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
