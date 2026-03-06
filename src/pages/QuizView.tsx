import React, { useState } from 'react';
import { quizQuestions } from '../data/quizQuestions';
import { Target, CheckCircle2, XCircle, RotateCcw, ChevronRight } from 'lucide-react';

export const QuizView: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const question = quizQuestions[currentIndex];

    const handleOptionSelect = (index: number) => {
        if (hasAnswered) return; // Prevent multiple selections

        setSelectedOption(index);
        setHasAnswered(true);

        if (index === question.correct) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < quizQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setHasAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setScore(0);
        setSelectedOption(null);
        setHasAnswered(false);
        setIsFinished(false);
    };

    if (isFinished) {
        const percentage = Math.round((score / quizQuestions.length) * 100);
        let feedbackMessage = '';
        if (percentage >= 90) feedbackMessage = '¡Excelente! Eres un experto en la 561.';
        else if (percentage >= 70) feedbackMessage = '¡Muy bien! Tienes una base sólida.';
        else if (percentage >= 50) feedbackMessage = 'Aprobado raspado. Toca repasar.';
        else feedbackMessage = 'Infracción inminente. Debes estudiar la norma urgentemente.';

        return (
            <div className="min-h-screen flex flex-col bg-[var(--color-brand-dark)] p-4 sm:p-6 pb-28">
                <header className="mb-8 p-4 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                        <Target className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide">Test Completado</h1>
                        <p className="text-sm text-gray-400">Resultados de tu evaluación</p>
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] p-8 rounded-[32px] w-full max-w-md text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />

                        <div className="mb-6 relative">
                            <svg className="w-32 h-32 mx-auto" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="var(--color-brand-border)" strokeWidth="10" />
                                <circle
                                    cx="50" cy="50" r="45"
                                    fill="transparent"
                                    stroke={percentage >= 70 ? "#10B981" : percentage >= 50 ? "#F59E0B" : "#EF4444"}
                                    strokeWidth="10"
                                    strokeDasharray={`${(percentage / 100) * 283} 283`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 50 50)"
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-black text-3xl text-white">
                                {percentage}%
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">{score} / {quizQuestions.length} Aciertos</h2>
                        <p className="text-gray-400 text-sm mb-8 px-4 leading-relaxed">{feedbackMessage}</p>

                        <button
                            onClick={handleRestart}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
                        >
                            <RotateCcw size={20} /> Reintentar Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-brand-dark)] p-4 sm:p-6 max-w-2xl mx-auto pb-28">
            <header className="mb-6 p-4 bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <Target className="text-purple-400" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-wide">Test de Batalla</h1>
                        <p className="text-xs text-gray-400 font-mono">NORM. 561/2006</p>
                    </div>
                </div>
                <div className="bg-black/30 px-3 py-1 rounded-lg border border-white/5 font-mono text-sm text-gray-300">
                    <span className="text-white">{currentIndex + 1}</span> / {quizQuestions.length}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[var(--color-brand-card)] rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-purple-500 transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex) / quizQuestions.length) * 100}%` }}
                />
            </div>

            <main className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300" key={currentIndex}>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 leading-snug">
                    {question.question}
                </h2>

                <div className="flex flex-col gap-3 flex-1">
                    {question.options.map((option, index) => {
                        let buttonClass = "bg-[var(--color-brand-card)] border border-[var(--color-brand-border)] text-gray-200 hover:border-white/20";
                        let icon = null;

                        if (hasAnswered) {
                            if (index === question.correct) {
                                buttonClass = "bg-[#10B981]/10 border-[#10B981]/50 text-[#10B981]";
                                icon = <CheckCircle2 size={20} className="text-[#10B981]" />;
                            } else if (index === selectedOption) {
                                buttonClass = "bg-[#EF4444]/10 border-[#EF4444]/50 text-[#EF4444]";
                                icon = <XCircle size={20} className="text-[#EF4444]" />;
                            } else {
                                buttonClass = "bg-black/20 border-transparent text-gray-600 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleOptionSelect(index)}
                                disabled={hasAnswered}
                                className={`text-left p-4 sm:p-5 rounded-xl transition-all duration-200 flex items-center justify-between gap-4 ${buttonClass} ${!hasAnswered && 'active:scale-[0.98]'}`}
                            >
                                <span className="text-sm sm:text-base font-medium leading-relaxed">{option}</span>
                                {icon}
                            </button>
                        );
                    })}
                </div>

                {/* Explanation Box */}
                {hasAnswered && (
                    <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm leading-relaxed animate-in slide-in-from-bottom-2 fade-in">
                        <strong>Explicación:</strong> {question.explanation}
                    </div>
                )}

                {/* Next Button */}
                <div className="mt-8">
                    <button
                        onClick={handleNext}
                        disabled={!hasAnswered}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${hasAnswered
                                ? 'bg-white text-black hover:bg-gray-200 active:scale-95 shadow-lg shadow-white/10'
                                : 'bg-[var(--color-brand-card)] text-gray-500 cursor-not-allowed opacity-50'
                            }`}
                    >
                        {currentIndex === quizQuestions.length - 1 ? 'Ver Resultados' : 'Siguiente Pregunta'}
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>
        </div>
    );
};
