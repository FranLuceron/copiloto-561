import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const authSchema = z.object({
    email: z.string().email('Por favor, ingresa un correo electrónico válido.'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.')
});

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false); // Estado para alternar modos

    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validación con Zod
        const validationResult = authSchema.safeParse({ email, password });
        if (!validationResult.success) {
            setError(validationResult.error.issues[0].message);
            return;
        }

        setIsSubmitting(true);

        try {
            if (isRegistering) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
            navigate('/dashboard');
        } catch (err: any) {
            console.error("FIREBASE ERROR:", err.code, err.message); // <-- Añadido para debugear
            // Manejo de errores amigable
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Correo o contraseña incorrectos.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos. Intenta más tarde.');
            } else {
                setError(`Ocurrió un error al ${isRegistering ? 'registrar' : 'iniciar sesión'}. Verifica tu conexión.`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-brand-dark)]">
            <div className="luxury-card w-full max-w-md relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 bg-[var(--color-brand-dark)] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-black">
                            <Truck size={32} className="text-[var(--color-state-drive)] drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Acceso a Copiloto</h1>
                        <p className="text-sm text-gray-400 font-medium">Tacógrafo Digital 561/2006</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl mb-6 text-sm text-center flex items-center justify-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold tracking-widest text-gray-500 mb-2 uppercase">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[var(--color-state-drive)] transition-all placeholder:text-gray-600 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                placeholder="conductor@empresa.com"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold tracking-widest text-gray-500 mb-2 uppercase">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[var(--color-state-drive)] transition-all placeholder:text-gray-600 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                                placeholder="••••••••"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[var(--color-state-drive)] hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0a] font-bold tracking-widest uppercase py-4 rounded-xl transition-all mt-8 flex justify-center items-center shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                        >
                            {isSubmitting ? (
                                <div className="h-5 w-5 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                isRegistering ? "Crear Cuenta" : "Acceder"
                            )}
                        </button>

                        {/* Botón para alternar entre login y registro */}
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                disabled={isSubmitting}
                                className="text-gray-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
                            >
                                {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
