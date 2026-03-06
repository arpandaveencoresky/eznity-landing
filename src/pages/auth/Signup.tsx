// Signup page component

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { signupSchema, type SignupFormValues } from '@/validations/auth';
import { AuthLayout } from '@/components/auth/AuthLayout';

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    try {
      // Send name (now mandatory)
      const name = values.name.trim();
      await signup(values.email, values.password, name);
      // Redirect to dashboard after successful signup
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
            {t('common.buttons.signUp')}
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('auth.signup.title')}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('auth.signup.subtitle')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t('common.labels.name')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={t('common.placeholders.name')}
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
                        placeholder={t('common.placeholders.createPassword')}
                        className="h-12 rounded-xl pl-11 text-base"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.trigger('confirmPassword');
                        }}
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
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t('common.labels.confirmPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder={t('common.placeholders.confirmPassword')}
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
            <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('auth.buttons.creatingAccount')}
                </>
              ) : (
                t('auth.buttons.createAccount')
              )}
            </Button>
          </form>
        </Form>

        <div className="text-sm text-center text-muted-foreground">
          {t('auth.login.alreadyHaveAccount')}{' '}
          <Link to="/product/login" className="text-primary hover:underline font-medium">
            {t('common.buttons.signIn')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;

