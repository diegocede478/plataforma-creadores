/* ========================================
   Creata - Settings View
   ======================================== */

import { useState, useEffect, type FormEvent } from 'react';
import {
  User as UserIcon, KeyRound, Bell, Shield, Mail, Calendar,
  AtSign, Lock, Image as ImageIcon, Save,
} from 'lucide-react';
import { useAuth, useUpdateProfile, useChangePassword, useLocalStorage } from '../hooks';
import { Button, Card, CardHeader, CardBody, CardFooter, Input, Textarea, Avatar, Badge } from '../components/ui';
import './Settings.css';

interface Prefs {
  newSubscribers: boolean;
  newMessages: boolean;
  newSales: boolean;
  weeklyDigest: boolean;
}

const DEFAULT_PREFS: Prefs = {
  newSubscribers: true,
  newMessages: true,
  newSales: true,
  weeklyDigest: false,
};

const PREFS_OPTIONS: { key: keyof Prefs; title: string; description: string }[] = [
  { key: 'newSubscribers', title: 'Nuevos suscriptores', description: 'Notifícame cuando alguien se suscribe a mi perfil.' },
  { key: 'newMessages', title: 'Nuevos mensajes', description: 'Notifícame cuando recibo un mensaje nuevo.' },
  { key: 'newSales', title: 'Nuevas ventas', description: 'Notifícame cuando vendo un servicio o desbloquean mi contenido.' },
  { key: 'weeklyDigest', title: 'Resumen semanal', description: 'Recibe un resumen de mi actividad cada semana.' },
];

export function Settings() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Profile form
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatar, setAvatar] = useState(user?.avatar ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');

  // Keep the form in sync when the user updates
  useEffect(() => {
    setUsername(user?.username ?? '');
    setAvatar(user?.avatar ?? '');
    setBio(user?.bio ?? '');
  }, [user?.username, user?.avatar, user?.bio]);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Preferences (local)
  const [prefs, setPrefs] = useLocalStorage<Prefs>('creata-prefs', DEFAULT_PREFS);

  const isProfileDirty =
    username !== (user?.username ?? '') ||
    avatar !== (user?.avatar ?? '') ||
    bio !== (user?.bio ?? '');

  const newPasswordError =
    newPassword && newPassword.length < 6 ? 'Debe tener al menos 6 caracteres' : '';
  const confirmError =
    confirmPassword && confirmPassword !== newPassword ? 'Las contraseñas no coinciden' : '';

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      username,
      avatar: avatar.trim() ? avatar.trim() : undefined,
      bio: bio.trim() ? bio.trim() : undefined,
    });
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || newPassword.length < 6 || newPassword !== confirmPassword) {
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  const togglePref = (key: keyof Prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
    : '';

  return (
    <div className="settings">
      <div className="settings__heading">
        <h1 className="settings__title">Configuración</h1>
        <p className="settings__subtitle">Administra tu cuenta, perfil y preferencias.</p>
      </div>

      <div className="settings__grid">
        <div className="settings__column">
          {/* ── Cuenta ─────────────────────────────── */}
          <section aria-label="Información de la cuenta">
            <Card variant="glass" className="settings__account-card">
              <CardHeader className="settings__card-header">
                <div className="settings__card-title">
                  <Shield size={18} aria-hidden="true" />
                  <span>Cuenta</span>
                </div>
              </CardHeader>
              <CardBody>
                <div className="settings__account-info">
                  <Avatar src={user?.avatar} name={user?.username} size="xl" border />
                  <div className="settings__account-main">
                    <div className="settings__account-name">
                      <span className="settings__account-username">@{user?.username}</span>
                      <Badge variant={user?.role === 'creator' ? 'primary' : 'secondary'} size="sm">
                        {user?.role === 'creator' ? 'Creador' : 'Fan'}
                      </Badge>
                    </div>
                    <p className="settings__account-email">
                      <Mail size={14} aria-hidden="true" />
                      {user?.email}
                    </p>
                    {memberSince && (
                      <p className="settings__account-since">
                        <Calendar size={14} aria-hidden="true" />
                        Miembro desde {memberSince}
                      </p>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          {/* ── Perfil ─────────────────────────────── */}
          <section aria-label="Editar perfil">
            <Card variant="glass">
              <CardHeader className="settings__card-header">
                <div className="settings__card-title">
                  <UserIcon size={18} aria-hidden="true" />
                  <span>Perfil público</span>
                </div>
              </CardHeader>
              <form onSubmit={handleProfileSubmit}>
                <CardBody>
                  <div className="settings__field">
                    <Input
                      label="Nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="tu_usuario"
                      minLength={3}
                      maxLength={30}
                      leftIcon={<AtSign size={16} />}
                      fullWidth
                    />
                  </div>
                  <div className="settings__field">
                    <Input
                      label="URL del avatar"
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="https://ejemplo.com/avatar.jpg"
                      leftIcon={<ImageIcon size={16} />}
                      fullWidth
                    />
                    <p className="settings__hint">Pega una URL de imagen pública. Deja vacío para usar las iniciales.</p>
                  </div>
                  <div className="settings__field">
                    <Textarea
                      label="Biografía"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Cuéntale a tus fans quién eres..."
                      maxLength={500}
                      rows={4}
                      fullWidth
                    />
                    <p className="settings__hint settings__hint--right">{bio.length}/500</p>
                  </div>
                </CardBody>
                <CardFooter divided className="settings__footer">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={updateProfile.isPending}
                    disabled={!isProfileDirty}
                    leftIcon={<Save size={16} />}
                  >
                    {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </section>
        </div>

        <div className="settings__column">
          {/* ── Contraseña ─────────────────────────── */}
          <section aria-label="Cambiar contraseña">
            <Card variant="glass">
              <CardHeader className="settings__card-header">
                <div className="settings__card-title">
                  <KeyRound size={18} aria-hidden="true" />
                  <span>Contraseña</span>
                </div>
              </CardHeader>
              <form onSubmit={handlePasswordSubmit}>
                <CardBody>
                  <div className="settings__field">
                    <Input
                      label="Contraseña actual"
                      type={showPasswords ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      leftIcon={<Lock size={16} />}
                      fullWidth
                    />
                  </div>
                  <div className="settings__field">
                    <Input
                      label="Nueva contraseña"
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      leftIcon={<Lock size={16} />}
                      error={newPasswordError}
                      fullWidth
                    />
                  </div>
                  <div className="settings__field">
                    <Input
                      label="Confirmar nueva contraseña"
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      autoComplete="new-password"
                      leftIcon={<Lock size={16} />}
                      error={confirmError}
                      fullWidth
                    />
                  </div>
                  <div className="settings__show-password">
                    <label className="settings__show-password-label">
                      <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                      />
                      <span>Mostrar contraseñas</span>
                    </label>
                  </div>
                </CardBody>
                <CardFooter divided className="settings__footer">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={changePassword.isPending}
                    disabled={
                      !currentPassword ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword.length < 6 ||
                      newPassword !== confirmPassword
                    }
                    leftIcon={<Save size={16} />}
                  >
                    {changePassword.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </section>

          {/* ── Preferencias ───────────────────────── */}
          <section aria-label="Preferencias de notificaciones">
            <Card variant="glass">
              <CardHeader className="settings__card-header">
                <div className="settings__card-title">
                  <Bell size={18} aria-hidden="true" />
                  <span>Notificaciones</span>
                </div>
              </CardHeader>
              <CardBody className="settings__prefs">
                {PREFS_OPTIONS.map((option) => (
                  <div key={option.key} className="settings__pref-row">
                    <div className="settings__pref-info">
                      <p className="settings__pref-title">{option.title}</p>
                      <p className="settings__pref-desc">{option.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs[option.key]}
                      aria-label={option.title}
                      className={`settings__toggle ${prefs[option.key] ? 'settings__toggle--on' : ''}`}
                      onClick={() => togglePref(option.key)}
                    >
                      <span className="settings__toggle-knob" />
                    </button>
                  </div>
                ))}
                <p className="settings__prefs-note">
                  Estas preferencias se guardan en este dispositivo y se aplicarán cuando lleguen las notificaciones.
                </p>
              </CardBody>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;
