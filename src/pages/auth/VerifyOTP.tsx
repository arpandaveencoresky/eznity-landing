// Verify OTP page component

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { verifyOTPSchema, type VerifyOTPFormValues } from '@/validations/auth';
import { AuthLayout } from '@/components/auth/AuthLayout';

const VerifyOTP = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    // Get email from location state or redirect to forgot-password
    const stateEmail = location.state?.email;
    if (!stateEmail) {
      toast({
        title: t('common.toast.error'),
        description: t('auth.messages.requestPasswordResetFirst'),
        variant: 'destructive',
      });
      navigate('/product/forgot-password', { replace: true });
    } else {
      setEmail(stateEmail);
    }
  }, [location, navigate]);

  const form = useForm<VerifyOTPFormValues>({
    resolver: zodResolver(verifyOTPSchema),
    mode: 'onChange',
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: VerifyOTPFormValues) => {
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.verifyOTP({
        email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      toast({
        title: t('common.toast.success'),
        description: t('auth.messages.passwordReset'),
      });
      navigate('/product/login', { replace: true });
    } catch (error: any) {
      toast({
        title: t('common.toast.error'),
        description: error.message || t('auth.messages.passwordResetFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            {t('auth.buttons.verifyOtp')}
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{t('auth.verifyOtp.title')}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t('auth.verifyOtp.description', { email })}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="otp"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t('common.labels.otpCode')}</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        {...field}
                        disabled={isLoading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
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
              name="newPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-foreground">{t('common.labels.newPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder={t('common.placeholders.enterNewPassword')}
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
                  <FormLabel className="text-foreground">{t('common.labels.confirmNewPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder={t('common.placeholders.confirmNewPassword2')}
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
                  {t('auth.buttons.verifying')}
                </>
              ) : (
                t('auth.buttons.verifyOtp')
              )}
            </Button>
          </form>
        </Form>

        <Link
          to="/product/forgot-password"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('auth.verifyOtp.backToForgotPassword')}
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;

