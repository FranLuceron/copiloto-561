# QA & Testing Plan: Copiloto 561/2006 🧪

Para asegurar que tu aplicación calcula correctamente los tiempos según el Reglamento (CE) nº 561/2006, te propongo realizar estos 3 simulacros o "Test Cases" directamente sobre la interfaz web de la aplicación (<http://localhost:5177>).

## 🛑 Prerrequisitos de Prueba

Como la app lee la hora real del navegador, te sugiero que durante las pruebas **cambies temporalmente la hora de tu reloj de Windows** hacia adelante en lugar de quedarte esperando horas reales. P.ej: Le das a "Conducir", adelantas 4 horas en Windows, y vas a la App a comprobar si saltó la alerta.

---

## 🧪 Test Case 1: Límite de Conducción Ininterrumpida (4h 30m)

**Objetivo:** Verificar que la app alerta al sobrepasar el límite máximo de conducción sin pausa.

1. **Paso:** Inicia sesión con tu nuevo usuario.
2. **Paso:** Haz clic en **"Conducir"**.
3. **Paso:** *[Truco]* Adelanta el reloj de tu ordenador 4 horas y 15 minutos exactos.
4. **Verificación Esperada:** La tarjeta central debería cambiar a estado "Aviso" (color naranja/amarillo) indicando que te acercas al límite.
5. **Paso:** *[Truco]* Adelanta el reloj otros 20 minutos (total 4h 35m conduciendo sin parar).
6. **Verificación Esperada:** La tarjeta central debe cambiar a **Infracción / Exceso de Conducción Continua** (color Rojo).
7. **Paso Final:** Haz clic en **"Pausa"**. La alerta en rojo debe mantenerse (una pausa normal no borra una infracción ya cometida en el registro diario).

---

## 🧪 Test Case 2: Pausa Dividida de 45 Minutos (15m + 30m)

**Objetivo:** Validar que el motor reconoce que una pausa fraccionada legal resetea el contador de conducción ininterrumpida.

1. **Paso:** Partiendo de contadores a cero, haz clic en **"Conducir"** durante 2 horas (adelanta el reloj).
2. **Paso:** Haz clic en **"Pausa"**.
3. **Paso:** *[Truco]* Adelanta el reloj 15 minutos (pero no más de 30).
4. **Paso:** Haz clic en **"Conducir"** nuevamente durante otras 2 horas.
5. **Verificación Esperada:** El estado de cumplimiento debe ser Verde (Llevas 4h conducidas en total, pero el límite ininterrumpido a vigilar ahora es 4h 30m).
6. **Paso:** Haz clic en **"Pausa"**.
7. **Paso:** *[Truco]* Adelanta el reloj 30 minutos exactos. **OJO**, al sumar la primera pausa de 15m y esta segunda de 30m, el reglamento europeo establece que has cumplido tu pausa de 45 minutos obligatoria.
8. **Verificación Esperada:** Al hacer clic en **"Conducir"** de nuevo, tu tiempo de "Conducción Ininterrumpida acumulada" debe estar a `00:00:00`, dándote luz verde para un nuevo bloque completo de 4.5h.

---

## 🧪 Test Case 3: Descanso Diario (11h)

**Objetivo:** Confirmar el reinicio de los contadores diarios tras el cierre de jornada.

1. **Paso:** Simula una jornada dura: haz clic en "Conducir" (4h) -> Pausa (45m) -> "Conducir" (4h) -> Pausa (45m) -> "En Espera" (2h).
2. **Verificación Esperada:** El contador de tu Conducción Diaria acumulada debe marcar lógicamente 8 horas.
3. **Paso:** Haz clic en el botón de **"Pausa (Descanso)"** o la opción de terminar día, simulando iniciar tu descanso diario.
4. **Paso:** *[Truco]* Adelanta el reloj de tu ordenador directamente al día siguiente (por ejemplo 14 horas hacia el futuro).
5. **Verificación Esperada:** TODOS los contadores de la interfaz principal (*Conducción de hoy, Actividad Ininterrumpida, etc.*) deben haber vuelto a `00:00`. Estás listo para una nueva jornada.

> 🛠 Si alguno de estos tests no devuelve la "Verificación Esperada", significaría que hay que revisar el código del archivo `/src/utils/rulesEngine.ts` que redactamos anteriormente en la base del proyecto.
