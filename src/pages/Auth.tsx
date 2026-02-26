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
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=2000&auto=format&fit=crop")',
                }}
            >
                {/* Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            </div>

            {/* Back link */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors z-10 glass-panel px-4 py-2 rounded-full border border-white/10"
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
                <div className="rounded-3xl glass-panel border border-white/20 p-8 sm:p-10 shadow-2xl backdrop-blur-xl bg-black/40">
                    {/* Logo */}
                    <div className="flex flex-col items-center justify-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20">
                            <Globe className="w-6 h-6 text-primary" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">Wanderlust Maps</span>
                    </div>

                    {/* Title */}
                    <motion.div
                        className="text-center mb-8"
                        key={isLogin ? 'login' : 'signup'}
                        initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="text-2xl font-bold tracking-tight text-white">
                            {isLogin ? t('auth.welcome') : t('auth.create')}
                        </h2>
                        <p className="mt-2 text-sm text-white/70 font-medium">
                            {isLogin ? t('auth.subtitle.login') : t('auth.subtitle.signup')}
                        </p>
                    </motion.div>

                    <form className="space-y-5" onSubmit={handleAuth}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-white/90 ml-1">
                                    {t('auth.email')}
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm"
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="block text-sm font-medium text-white/90">
                                        {t('auth.password')}
                                    </label>
                                    {isLogin && (
                                        <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                                            Forgot password?
                                        </a>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm"
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
                            className="flex w-full justify-center items-center rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 transition-all mt-6"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                isLogin ? t('auth.submit.login') : t('auth.submit.signup')
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 text-center relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-white/50">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-medium text-white hover:text-primary transition-colors"
                        >
                            {isLogin ? t('auth.toggle.signup') : t('auth.toggle.login')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
