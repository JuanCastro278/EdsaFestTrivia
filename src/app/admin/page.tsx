
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Gift, Users, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">¡Hola, Admin!</CardTitle>
          <CardDescription>Bienvenido al panel de control de EDSAFEST. Desde aquí puedes gestionar toda la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
           <p>Utiliza el menú de la izquierda para navegar por las diferentes secciones.</p>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gamepad2/> Juegos</CardTitle>
                <CardDescription>Crea y gestiona las trivias, activa o desactiva juegos y revisa las preguntas.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/juegos">Gestionar Juegos</Link>
                </Button>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users/> Usuarios</CardTitle>
                <CardDescription>Administra los usuarios, crea nuevas cuentas y asigna EDSACoins manualmente.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/usuarios">Gestionar Usuarios</Link>
                </Button>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift/> Premios</CardTitle>
                <CardDescription>Configura el catálogo de premios, edita sus costos y actualiza las imágenes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/premios">Gestionar Premios</Link>
                </Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Ticket/> Sorteo</CardTitle>
                <CardDescription>Activa el sorteo, visualiza los números de los participantes y asigna Edsacoins.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/admin/raffle">Gestionar Sorteo</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
