// Forgot Password page component

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/validations/auth';
import { AuthLayout } from '@/components/auth/AuthLayout';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: values.email });
      toast({
        title: t('common.toast.success'),
        description: t('auth.messages.otpSent'),
      });
      // Automatically redirect to OTP verification screen
      navigate('/product/verify-otp', { state: { email: values.email }, replace: true });
    } catch (error: any) {
      toast({
        title: t('common.toast.error'),
        description: error.message || t('auth.messages.otpSendFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            {t('auth.buttons.sendOtp')}
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('auth.forgotPassword.title')}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('auth.forgotPassword.description')}
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
            <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('auth.buttons.sendingOtp')}
                </>
              ) : (
                t('auth.buttons.sendOtp')
              )}
            </Button>
          </form>
        </Form>

        <Link
          to="/product/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.forgotPassword.backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;

