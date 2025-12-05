
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ChangePasswordForm } from '@/components/user/ChangePasswordForm';
import { useGame } from '@/context/GameContext';
import { useMemo } from 'react';

export function ForcePasswordChange() {
  const { player, users, changeUserPassword, showPasswordChange, setShowPasswordChange } = useGame();

  const currentUser = useMemo(() => {
      if (!player) return null;
      return users.find(u => u.username === player.username);
  }, [player, users]);

  if (!player || !currentUser?.id || !showPasswordChange) {
    return null;
  }

  const handlePasswordChanged = async (newPassword: string) => {
    if (player.username) {
        await changeUserPassword(player.username, newPassword);
    }
    setShowPasswordChange(false);
  };

  return (
    <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>¡Bienvenido, {player.username}!</DialogTitle>
          <DialogDescription>
            Grandes premios te esperan, pero primero debes cambiar tu contraseña inicial para proteger tu cuenta.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ChangePasswordForm onSave={handlePasswordChanged} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
