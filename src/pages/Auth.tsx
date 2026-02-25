import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Globe, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Auth() {
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { t } = useTranslation();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success(t('auth.success.login'));
                navigate(from, { replace: true });
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username: email.split('@')[0] } }
                });
                if (error) throw error;
                toast.success(t('auth.success.signup'));
                setIsLogin(true);
            }
        } catch (error: any) {
            toast.error(error.message || t('auth.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px]" />
            </div>

            {/* Back link */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
            >
                <ArrowLeft className="w-4 h-4" />
                {t('auth.back')}
            </Link>

            <motion.div
                className="relative z-10 w-full max-w-md"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="rounded-3xl bg-card border border-border/50 p-8 sm:p-10 shadow-xl">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Globe className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg">Wanderlust Maps</span>
                    </div>

                    {/* Title */}
                    <motion.div
                        className="text-center mb-8"
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isLogin ? t('auth.welcome') : t('auth.create')}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {isLogin ? t('auth.subtitle.login') : t('auth.subtitle.signup')}
                        </p>
                    </motion.div>

                    <form className="space-y-5" onSubmit={handleAuth}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">
                                    {t('auth.email')}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-foreground">
                                    {t('auth.password')}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-all"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading
                                ? t('auth.loading')
                                : isLogin
                                    ? t('auth.submit.login')
                                    : t('auth.submit.signup')
                            }
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            {isLogin ? t('auth.toggle.signup') : t('auth.toggle.login')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
