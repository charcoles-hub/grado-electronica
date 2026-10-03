# Plan de estudio Q1 · DMIC · HIPS · CIAF

App web para seguir día a día las tres asignaturas del Q1 Tardor 2026-27 del
Grado en Ingeniería Electrónica de Telecomunicación (GREELEC, ETSETB, UPC).

| Asignatura | Curso | Parcial | Final |
|---|---|---|---|
| DMIC · Disseny Microelectrònic (230930) | 4A | vie 6/11, 11:00–13:30 | jue 7/1, 14:45–17:45 |
| HIPS · Sistemes de Hardware de Processament de la Informació (230931) | 4A | mié 11/11, 14:30–17:00 | vie 15/1, 14:45–17:45 |
| CIAF · Circuits d'Alta Freqüència (230922) | 3A | jue 5/11, 11:00–13:30 | lun 18/1, 08:00–11:00 |

## Qué hace

- **Hoy**: las tareas del día (qué leer, qué resumir en papel y qué ejercicios
  hacer) con enlaces al material de Google Drive. Se marcan al terminar.
- **Ritmo**: compara lo hecho con el plan ideal e indica si vas al día,
  por delante o por detrás.
- **Replanificación automática**: lo que no haces se reparte en los días
  siguientes. «Hoy no puedo estudiar» libera el día.
- **Agenda** de tres semanas, **Asignaturas** con el progreso y la previsión
  de cada examen, **Exámenes** con el calendario oficial y **Material** con
  lo que faltaba, qué apunte lo cubre y qué solo se puede sacar de Atenea.
- Los laboratorios no están en el plan (se llevan aparte).
- **Apuntes**: lo que faltaba en Drive según las guías docentes, redactado
  por Claude con teoría, ejemplos y ejercicios resueltos (ver
  [`apuntes/README.md`](apuntes/README.md)).
- **Ajustes**: minutos por día (por defecto 2 h 30 min de lunes a sábado y
  1 h 30 min el domingo) y copia de seguridad del progreso.

## Archivos

- `plan-data.js`: asignaturas, exámenes, tareas y material (aquí se edita el plan).
- `app.js`: planificador, cálculo del ritmo, guardado y vistas.
- `apuntes/`: apuntes en Markdown (con fórmulas en LaTeX).
- `app.html`: la página (se publica tal cual como Artifact).
- `index.html`: versión completa generada con `scripts/build.sh` para abrir en
  local o servir con GitHub Pages.

El progreso se guarda en la cuenta de Claude cuando la app se abre como
Artifact (se sincroniza entre el móvil y el ordenador). Abierta desde
`index.html` se guarda solo en ese navegador.

## Fuentes

- Guías docentes UPC: [230930](https://www.upc.edu/content/grau/guiadocent/pdf/esp/230930),
  [230931](https://www.upc.edu/content/grau/guiadocent/pdf/esp/230931),
  [230922](https://www.upc.edu/content/grau/guiadocent/pdf/esp/230922)
- [Calendario de exámenes ETSETB, Tardor 26-27](https://telecos.upc.edu/ca/curs-actual/calendaris/calendaris-dexamens/calendari-dexamens)
- Presentaciones de curso de DMIC (QT26) y HIPS (Fall 2026)
