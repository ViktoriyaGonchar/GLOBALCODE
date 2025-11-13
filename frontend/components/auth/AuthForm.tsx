'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(1, 'Пароль обязателен'),
});

const registerSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  username: z
    .string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Имя пользователя может содержать только буквы, цифры, _ и -'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      'Пароль должен содержать хотя бы одну букву и одну цифру'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthForm({ mode = 'login', onSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const { login, register, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setError(null);
    try {
      if (isLogin) {
        const loginData = data as LoginFormData;
        await login(loginData.email, loginData.password);
      } else {
        const registerData = data as RegisterFormData;
        await register(registerData.email, registerData.username, registerData.password);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Произошла ошибка');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isLogin ? 'Вход в GLOBALCODE' : 'Регистрация в GLOBALCODE'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isLogin
            ? 'Войдите в свой аккаунт'
            : 'Создайте новый аккаунт'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isLogin && (
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Имя пользователя
            </label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              {...registerField('username' as any)}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username.message as string}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            {...registerField('email' as any)}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message as string}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Пароль
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...registerField('password' as any)}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message as string}</p>
          )}
        </div>

        {!isLogin && (
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Подтвердите пароль
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...registerField('confirmPassword' as any)}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message as string}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? 'Загрузка...'
            : isLogin
            ? 'Войти'
            : 'Зарегистрироваться'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-primary hover:underline"
        >
          {isLogin
            ? 'Нет аккаунта? Зарегистрироваться'
            : 'Уже есть аккаунт? Войти'}
        </button>
      </div>
    </div>
  );
}

