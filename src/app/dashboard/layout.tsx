
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Coins,
  Gamepad2,
  Gift,
  Home,
  LogOut,
  PanelLeft,
  Settings,
  Ticket,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { Logo } from '@/components/Logo';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { ForcePasswordChange } from '@/components/user/ForcePasswordChange';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const NavLink = ({ href, children, onClick }: { href: string, children: React.ReactNode, onClick?: () => void }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Button asChild variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={onClick}>
            <Link href={href}>
                {children}
            </Link>
        </Button>
    );
};

const navItems = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/juegos', label: 'Juegos', icon: Gamepad2 },
    { href: '/dashboard/premios', label: 'Premios', icon: Gift },
    { href: '/dashboard/raffle', label: 'Sorteo', icon: Ticket },
];

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
    const { setPlayer } = useGame();
    const router = useRouter();

    const handleLogout = () => {
        if (onLinkClick) onLinkClick();
        setPlayer(null);
        router.push('/');
    };
    
    return (
        <div className="flex h-full flex-col">
           <div className="flex h-16 items-center gap-2 px-6">
              <Logo />
              <h1 className="text-xl font-bold text-primary font-headline">EDSAFEST</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                 {navItems.map(item => (
                    <NavLink key={item.href} href={item.href} onClick={onLinkClick}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
            </nav>

             <div className="p-4 mt-auto border-t">
                <NavLink href="/dashboard/settings" onClick={onLinkClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferencias</span>
                </NavLink>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start mt-2">
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Cerrar Sesión?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Se cerrará tu sesión y volverás a la pantalla de inicio.
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
}

const BottomNavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: React.ElementType }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link href={href} className={cn(
            "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-colors w-full",
            isActive ? "text-primary" : "text-muted-foreground hover:bg-muted/50"
        )}>
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{children}</span>
        </Link>
    );
};

const BottomNavBar = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 p-2 backdrop-blur-sm sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 items-center justify-around gap-1 rounded-2xl bg-card/50 p-1">
            {navItems.map(item => (
                <BottomNavLink key={item.href} href={item.href} icon={item.icon}>
                    {item.label}
                </BottomNavLink>
            ))}
        </div>
    </nav>
);

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 flex-shrink-0 border-r bg-background sm:flex sticky top-0 h-screen">
        {/* Sidebar Skeleton */}
        <div className="flex h-full flex-col p-4 space-y-4">
          <div className="flex items-center gap-2 h-16 px-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="mt-auto space-y-2 border-t pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:justify-end sm:px-6">
            <Skeleton className="h-8 w-8 sm:hidden" />
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
           </div>
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Skeleton className="h-48 w-full" />
        </main>
      </div>
    </div>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { player, setPlayer } = useGame();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // This effect runs only on the client
    if (player === null) {
      router.replace('/');
    }
  }, [player, router]);
  
  const handleLogout = () => {
    setPlayer(null);
    router.push('/');
  };

  if (!isClient || !player) {
    return <DashboardSkeleton />;
  }

  // Once loading is false, we know `player` is not null.
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-64 flex-shrink-0 border-r bg-background sm:flex sticky top-0 h-screen">
        <SidebarContent />
      </aside>
      <div className="flex flex-1 flex-col pb-20 sm:pb-0">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{player.username}</span>
            </div>
           <div className="ml-auto flex items-center gap-4">
               <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Cerrar Sesión?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Se cerrará tu sesión y volverás a la pantalla de inicio.
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
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-y-auto">
            {children}
        </main>
      </div>
      <BottomNavBar />
      <ForcePasswordChange />
    </div>
  );
}
