export const quizQuestions = [
    {
        id: 1,
        question: "¿Cuál es el tiempo máximo de conducción continua permitido antes de una pausa obligatoria?",
        options: ["4 horas", "4 horas y 30 minutos", "5 horas", "6 horas"],
        correct: 1,
        explanation: "El Reglamento 561/2006 obliga a una pausa tras 4 horas y 30 minutos de conducción continua."
    },
    {
        id: 2,
        question: "Si realizas una pausa fraccionada, ¿cómo debe ser el orden obligatorio?",
        options: ["Cualquier orden", "30 minutos seguidos de 15 minutos", "15 minutos seguidos de 30 minutos", "No se permite fraccionar"],
        correct: 2,
        explanation: "La norma permite fraccionar la pausa en 15 minutos primero y 30 minutos después (total 45 min)."
    },
    {
        id: 3,
        question: "Realizas 9 horas de conducción el lunes y 9 horas el martes. Si el límite semanal es de 56h, ¿cuántas horas de conducción te quedan para el resto de la semana?",
        options: ["47 horas", "38 horas", "45 horas", "56 horas"],
        correct: 1,
        explanation: "56 horas (límite) - 18 horas realizadas (9+9) = 38 horas disponibles para el resto de la semana."
    },
    {
        id: 4,
        question: "¿Cuál es el límite máximo de conducción diaria normal?",
        options: ["8 horas", "9 horas", "10 horas", "11 horas"],
        correct: 1,
        explanation: "El límite normal es de 9 horas, ampliable a 10 horas máximo dos veces por semana."
    },
    {
        id: 5,
        question: "¿Cuántas horas de descanso diario normal se exigen como mínimo?",
        options: ["8 horas", "9 horas", "10 horas", "11 horas"],
        correct: 3,
        explanation: "El descanso diario normal es de 11 horas (o 3+9 horas)."
    },
    {
        id: 6,
        question: "¿Cuál es el límite de horas de conducción semanal?",
        options: ["45 horas", "50 horas", "56 horas", "60 horas"],
        correct: 2,
        explanation: "El límite semanal son 56 horas de conducción."
    },
    {
        id: 7,
        question: "¿Cuál es el límite máximo de conducción en dos semanas consecutivas?",
        options: ["80 horas", "85 horas", "90 horas", "95 horas"],
        correct: 2,
        explanation: "El límite bisemanal no puede superar las 90 horas."
    },
    {
        id: 8,
        question: "Si haces un descanso diario reducido, ¿cuántas horas debe tener?",
        options: ["7 horas", "8 horas", "9 horas", "10 horas"],
        correct: 2,
        explanation: "El descanso diario reducido debe ser de al menos 9 horas."
    },
    {
        id: 9,
        question: "¿Cuántas veces por semana puedes ampliar la conducción diaria a 10 horas?",
        options: ["1 vez", "2 veces", "3 veces", "Ilimitado"],
        correct: 1,
        explanation: "Se puede ampliar a 10 horas máximo dos veces por semana."
    },
    {
        id: 10,
        question: "Si acompañas al vehículo en un ferry o tren, ¿puedes interrumpir el descanso diario?",
        options: ["No, nunca", "Sí, pero máximo dos veces (interrupciones < 1h total)", "Sí, todas las veces que quieras", "Depende de la empresa"],
        correct: 1,
        explanation: "En ferry/tren se puede interrumpir el descanso normal para embarcar/desembarcar, máximo 2 veces y <1h total."
    },
    {
        id: 11,
        question: "El tiempo de 'Disponibilidad' (icono cuadrado con diagonal)...",
        options: ["Computa como descanso", "Computa como conducción", "No computa como descanso ni conducción", "Es igual a 'Otros trabajos'"],
        correct: 2,
        explanation: "La disponibilidad no es descanso ni es conducción. No sirve para cumplir los 45' de pausa."
    },
    {
        id: 12,
        question: "Si conduces 4h 30m, ¿puedes hacer tres pausas de 15 minutos en vez de una de 45?",
        options: ["Sí, si sumas 45m", "No, debe ser una de 45 o fraccionada (15+30)", "Sí, el tacógrafo lo acepta siempre", "Depende del tacógrafo"],
        correct: 1,
        explanation: "La norma permite hacer varias pausas siempre que la última sea de al menos 30 min y sumen 45 min en total."
    }
];
