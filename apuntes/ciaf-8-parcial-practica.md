# CIAF · Parcial de práctica (líneas, Smith y parámetros S)

> Examen de práctica redactado por Claude con el temario que entra antes del parcial del 5/11 (temas 1–4 de la guía docente). **No es un examen oficial**: los controles y exámenes recientes solo están en Atenea. Hazlo en 2 h 30 min, con carta de Smith a lápiz donde se pueda.

## Problema 1 · Línea de transmisión (30 %)

Una línea sin pérdidas de $Z_0 = 50\ \Omega$ termina en $Z_L = 100 + j50\ \Omega$.

a) Calcula $\Gamma_L$, la ROE y las pérdidas de retorno.
b) ¿Qué fracción de la potencia incidente llega a la carga? Da las pérdidas por desadaptación en dB.
c) Calcula $Z_{in}$ a $0{,}15\lambda$ de la carga (con la fórmula y comprobándolo en la carta).

## Problema 2 · Adaptación con *stub* (30 %)

Adapta la carga del problema 1 con un *stub* en paralelo.

a) Distancia $d$ desde la carga y susceptancia que debe aportar el *stub* (las dos soluciones).
b) Longitud del *stub* en abierto y en cortocircuito para la primera solución.
c) Si la carga fuera $Z_L = 100\ \Omega$ real, diseña un transformador $\lambda/4$.

## Problema 3 · Parámetros S (25 %)

Un bipuerto tiene $S_{11} = S_{22} = 0{,}2$ y $S_{12} = S_{21} = 0{,}9\angle{-90°}$.

a) ¿Es recíproco? ¿Es sin pérdidas?
b) Pérdidas de retorno y de inserción en dB.
c) Calcula $\Gamma_{in}$ si el puerto 2 se carga con $\Gamma_L = 0{,}5$.
d) Calcula los parámetros S de una impedancia serie $Z = 50\ \Omega$ entre dos puertos de 50 Ω.

## Problema 4 · Microstrip (15 %)

Un sustrato da $\varepsilon_{eff} = 3{,}3$ para una línea de 50 Ω.

a) Longitud de un tramo $\lambda/4$ a 2 GHz.
b) Si se cambia a un sustrato de $\varepsilon_r$ mayor con el mismo grosor, ¿la línea de 50 Ω es más ancha o más estrecha?
c) ¿Por qué la microstrip es cuasi-TEM y no TEM?

---

## Soluciones

**P1.** a) $\Gamma_L = \dfrac{50 + j50}{150 + j50} = 0{,}4 + j0{,}2 = 0{,}447\angle 26{,}6°$. $ROE = \dfrac{1{,}447}{0{,}553} = 2{,}62$. $RL = 7{,}0$ dB.
b) $1 - |\Gamma|^2 = 0{,}8$ → llega el 80 % (pérdidas por desadaptación de 0,97 dB).
c) $\Gamma_{in} = \Gamma_Le^{-j2\beta\ell} = 0{,}447\angle(26{,}6° - 108°) = 0{,}447\angle{-81{,}4°}$ → $Z_{in} = Z_0\dfrac{1+\Gamma_{in}}{1-\Gamma_{in}} = 37{,}5 - j41{,}5\ \Omega$. En la carta: se gira $0{,}15\lambda$ hacia el generador sobre el círculo de ROE 2,62.

**P2.** a) Hay dos soluciones:
- $d = 0{,}199\lambda$: la admitancia normalizada allí es $y = 1 + j1$, así que el *stub* debe aportar $-j1$.
- $d = 0{,}375\lambda$: $y = 1 - j1$, y el *stub* debe aportar $+j1$.

b) Para $-j1$: en abierto, $\ell = 0{,}375\lambda$; en cortocircuito, $\ell = 0{,}125\lambda$. (Para la segunda solución sería al revés.)
c) $Z_1 = \sqrt{50\cdot100} = 70{,}7\ \Omega$, de longitud $\lambda/4$.

**P3.** a) Recíproco: sí ($S_{12} = S_{21}$). Sin pérdidas: no, porque $|S_{11}|^2 + |S_{21}|^2 = 0{,}85 \ne 1$ (se disipa el 15 %).
b) $RL = -20\log 0{,}2 = 14$ dB; $IL = -20\log 0{,}9 = 0{,}92$ dB.
c) $S_{12}S_{21} = 0{,}81\angle{-180°} = -0{,}81$ → $\Gamma_{in} = 0{,}2 + \dfrac{-0{,}81\cdot0{,}5}{1 - 0{,}1} = 0{,}2 - 0{,}45 = -0{,}25$.
d) $S_{11} = S_{22} = \dfrac{Z}{Z + 2Z_0} = \dfrac{1}{3}$ y $S_{21} = S_{12} = \dfrac{2Z_0}{Z + 2Z_0} = \dfrac{2}{3}$.

**P4.** a) $\lambda_0 = 150$ mm → $\lambda_g = 150/\sqrt{3{,}3} = 82{,}6$ mm → $\lambda/4 = 20{,}6$ mm.
b) Más estrecha (con más $\varepsilon_r$ sube la capacidad por unidad de longitud y para mantener 50 Ω hay que reducir $W$).
c) Porque el campo está parte en el dieléctrico y parte en el aire, con velocidades distintas. Aparecen componentes longitudinales pequeñas y $\varepsilon_{eff}$ depende algo de la frecuencia (dispersión).
