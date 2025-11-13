'use client';

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <AuthForm mode="login" onSuccess={handleSuccess} />
    </div>
  );
}

