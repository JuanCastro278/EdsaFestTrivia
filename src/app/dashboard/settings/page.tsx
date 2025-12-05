
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { ChangePasswordForm } from '@/components/user/ChangePasswordForm';
import { useGame } from '@/context/GameContext';
import { Toaster } from '@/components/ui/toaster';
import { useMemo } from 'react';


export default function UserSettingsPage() {
    const { player, changeUserPassword } = useGame();

    if (!player || !player.username) {
        return null;
    }

    const handleChangePassword = async (newPassword: string) => {
        if (!player.username) return;
        await changeUserPassword(player.username, newPassword);
    };

    return (
        <div>
            <div className="mb-6 sm:pt-6">
                <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                    <Settings/>
                    Preferencias
                </h1>
                <p className="text-muted-foreground mt-2">
                    Gestiona la configuración de tu cuenta.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Cambiar Contraseña</CardTitle>
                    <CardDescription>
                        Elige una nueva contraseña para tu cuenta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChangePasswordForm onSave={handleChangePassword} />
                </CardContent>
            </Card>
            <Toaster />
        </div>
    );
}
