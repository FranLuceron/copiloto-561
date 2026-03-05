import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="fixed bottom-0 w-full bg-[#0a0a0a] border-t border-[var(--color-brand-border)] p-4 text-center z-50">
            <div className="max-w-2xl mx-auto flex flex-col gap-1 items-center justify-center">
                <span className="text-[10px] text-gray-600 font-semibold tracking-widest uppercase">
                    Desarrollado para A.M.A por FranLuceron © 2026
                </span>
                <p className="text-[10px] text-gray-500 max-w-xl leading-tight">
                    <strong>Aviso Legal:</strong> Esta app es de apoyo y no sustituye al tacógrafo. Ante discrepancias, prevalece la normativa vigente (Reglamento CE 561/2006).
                </p>
            </div>
        </footer>
    );
};
