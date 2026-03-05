# Copiloto 561/2006: SaaS de Gestión de Tiempos para Transporte 🚚⏱️

![Copiloto 561/2006](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Firebase](https://img.shields.io/badge/Firebase-v10-yellow)

**Copiloto 561/2006** es una aplicación SaaS diseñada para ayudar a los conductores profesionales de transporte por carretera a gestionar, calcular y prever sus tiempos de conducción y descanso conforme a la normativa europea (Reglamento CE 561/2006).

## 🛠 Stack Tecnológico

El proyecto está construido con un stack moderno y escalable:

- **Frontend Core**: React 18, Vite, TypeScript
- **Estilos**: Tailwind CSS (con soporte oscuro/claro)
- **Estado Global**: Zustand
- **Backend as a Service (BaaS)**: Firebase (Authentication, Firestore Database)
- **Despliegue**: Netlify

## 🏗 Arquitectura y Modularidad

El repositorio sigue una arquitectura modular y escalable para facilitar el mantenimiento a largo plazo. La lógica de la aplicación está dividida en las siguientes capas principales dentro de `src/`:

```text
src/
├── components/   # Componentes UI reutilizables y vistas de páginas (Dashboard.tsx, etc.)
├── context/      # Contextos de React para temas globales (Ej. ThemeContext)
├── services/     # Lógica de conexión externa (Ej. firebase.ts)
├── store/        # Gestión del estado global usando Zustand
├── types/        # Definiciones exclusivas de TypeScript (Interfaces y Tipos)
└── utils/        # Funciones helpers puras y motor de reglas (rulesEngine.ts)
```

## 🚀 Instalación en Local

Sigue estos pasos para arrancar el proyecto en tu máquina local en menos de 10 minutos.

1. **Clona el repositorio**:

   ```bash
   git clone <url-del-repositorio>
   cd "APP TACOGRAFO"
   ```

2. **Instala las dependencias**:

   ```bash
   npm install
   ```

3. **Configura las Variables de Entorno**:
   - Duplica el archivo `.env.example` y renómbralo a `.env.local`
   - Rellena las variables con las claves de tu proyecto de Firebase.

   ```bash
   cp .env.example .env.local
   ```

   *(Tus credenciales nunca se subirán a GitHub gracias al `.gitignore`)*

4. **Inicia el servidor de desarrollo**:

   ```bash
   npm run dev
   ```

## 🌐 Configuración de Despliegue (Netlify)

El proyecto está configurado para un despliegue continuo (CI/CD) sin fricciones a través de Netlify.

### El archivo `netlify.toml`

El repositorio incluye en la raíz un archivo de configuración para Netlify. Sus funciones principales son:

1. Asegurar que el comando de compilación sea `npm run build` y la carpeta de salida `dist`.
2. Configurar una regla mágica (`/*   /index.html   200`) para que el enrutamiento interno de React (SPA) funcione correctamente al recargar la página.

## ✅ Guía de Despliegue a Producción (Checklist)

Para subir esta aplicación a un entorno real, sigue esta guía:

### 1. En Firebase Console (Backend)

- [ ] Crea un nuevo proyecto en Firebase.
- [ ] Habilita **Authentication** (método: Correo/Contraseña).
- [ ] Habilita **Firestore Database** (empezar en modo producción o aplicar reglas custom).
- [ ] Pega el contenido de `firestore.rules` del proyecto en la pestaña "Reglas" de Firestore para proteger los datos de usuario.
- [ ] Registra una "Aplicación Web" para obtener tus claves de entorno.

### 2. En Netlify (Frontend)

- [ ] Conecta Netlify con este repositorio de GitHub (o súbelo manualmente arrastrando la carpeta dist).
- [ ] Ve a **Site settings > Environment variables** y añade exactamente las mismas variables del `.env.example` con las claves reales de tu proyecto de Firebase.
- [ ] Despliega el sitio web.

---

## ⚖️ Disclaimer Legal (Aviso Importante)
>
> [!WARNING]
> **Copiloto 561/2006 es exclusivamente una herramienta informática de apoyo a la planificación.**
> Los cálculos reflejados por esta aplicación proceden del motor interno y de los datos introducidos manualmente por el usuario. **Bajo ningún concepto sustituye al tacógrafo digital o analógico del vehículo**, el cual es el único dispositivo legalmente válido y vinculante ante las autoridades de tráfico europeas según establece el Reglamento (CE) nº 561/2006. El uso de esta app es responsabilidad absoluta del usuario.
