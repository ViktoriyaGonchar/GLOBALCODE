'use client';

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AuthForm mode="register" onSuccess={handleSuccess} />
    </div>
  );
}

