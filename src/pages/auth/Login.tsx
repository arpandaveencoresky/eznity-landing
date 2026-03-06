// Login page component

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/validations/auth';
import { AuthLayout } from '@/components/auth/AuthLayout';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      // Redirect to dashboard after successful login
      navigate('/product/dashboard', { replace: true });
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            {t('auth.buttons.signIn')}
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('auth.login.title')}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t('common.labels.email')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder={t('common.placeholders.email')}
                        className="h-12 rounded-xl pl-11 text-base"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage />
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t('common.labels.password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder={t('common.placeholders.password')}
                        className="h-12 rounded-xl pl-11 text-base"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage />
                  )}
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end">
              <Link
                to="/product/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
            <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('auth.buttons.signingIn')}
                </>
              ) : (
                t('auth.buttons.signIn')
              )}
            </Button>
          </form>
        </Form>

        <div className="text-sm text-center text-muted-foreground">
          {t('auth.login.dontHaveAccount')}{' '}
          <Link to="/product/signup" className="text-primary hover:underline font-medium">
            {t('common.buttons.signUp')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;

