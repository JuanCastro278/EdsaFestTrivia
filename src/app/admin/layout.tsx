
'use client';

import { Logo } from '@/components/Logo';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, LogOut, Gamepad2, Gift, PanelLeft, Ticket } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const NavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Button asChild variant={isActive ? 'secondary' : 'ghost'} className="justify-start w-full" onClick={onClick}>
            <Link href={href}>
                {children}
            </Link>
        </Button>
    );
};

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const router = useRouter();

  const handleLogout = () => {
    if (onLinkClick) onLinkClick();
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 p-4 h-16 border-b">
        <Logo />
        <div className="flex flex-col">
          <h2 className="text-lg font-bold">EDSAFEST</h2>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <NavLink href="/admin" onClick={onLinkClick}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink href="/admin/juegos" onClick={onLinkClick}>
          <Gamepad2 className="mr-2 h-4 w-4" />
          <span>Juegos</span>
        </NavLink>
        <NavLink href="/admin/usuarios" onClick={onLinkClick}>
          <Users className="mr-2 h-4 w-4" />
          <span>Usuarios</span>
        </NavLink>
        <NavLink href="/admin/premios" onClick={onLinkClick}>
          <Gift className="mr-2 h-4 w-4" />
          <span>Premios</span>
        </NavLink>
        <NavLink href="/admin/raffle" onClick={onLinkClick}>
          <Ticket className="mr-2 h-4 w-4" />
          <span>Sorteo</span>
        </NavLink>
      </nav>
      <div className="p-4 mt-auto border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cerrar Sesión?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que quieres cerrar la sesión de administrador?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Cerrar Sesión</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 flex-shrink-0 border-r bg-background sm:flex sticky top-0 h-screen">
        <SidebarContent />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 sm:hidden"
                    >
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Menú de Administrador</SheetTitle>
                    </SheetHeader>
                    <SidebarContent onLinkClick={() => setIsSheetOpen(false)} />
                </SheetContent>
            </Sheet>
            
            <div className="ml-auto flex items-center gap-4">
              <p className="text-sm text-muted-foreground hidden sm:block">Panel de Administrador</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex items-center">
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only sm:hidden">Cerrar Sesión</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Cerrar Sesión?</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que quieres cerrar la sesión de administrador?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Cerrar Sesión</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
