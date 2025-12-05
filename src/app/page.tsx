import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 sm:justify-center sm:pt-0 p-8">
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex items-center">
            <Logo />
            <h1 className="text-5xl font-headline font-extrabold text-primary">EDSA</h1>
        </div>
        <h1 className="text-4xl font-headline font-bold">
          EDSAFEST Trivia
        </h1>
        <p className="text-muted-foreground">Inicia sesión con tu DNI para unirte al evento</p>
      </div>
      <LoginForm />
    </main>
  );
}
