# DMIC · Parcial de práctica (MOS y digital)

> Examen de práctica redactado por Claude con el temario del parcial (tecnología, MOS DC, circuitos digitales CMOS e introducción a la pequeña señal). **No es un examen oficial**: los parciales de otros años solo están en Atenea. Hazlo en 2 h 30 min sin mirar las soluciones.

Datos generales si no se indica lo contrario: $\lambda = 0$ y sin efecto cuerpo.

## Problema 1 · Polarización (25 %)

NMOS con $V_{DD} = 1{,}8$ V, $R_D = 2$ kΩ en el drenador, $R_S = 500\ \Omega$ en el surtidor y $V_G = 1{,}2$ V. $V_{TH} = 0{,}4$ V y $k_n'\frac{W}{L} = 2$ mA/V².

a) Calcula $I_D$, $V_S$, $V_D$ y comprueba la región.
b) Calcula $g_m$ y la ganancia de pequeña señal $v_d/v_g$.
c) ¿Qué valor máximo de $R_D$ mantiene la saturación?

## Problema 2 · Inversor (20 %)

$V_{DD} = 1{,}2$ V, $V_{Tn} = |V_{Tp}| = 0{,}35$ V, $k_n' = 250\ \mu$A/V² y $k_p' = 100\ \mu$A/V².

a) ¿Qué relación $W_p/W_n$ (misma $L$) da $V_M = V_{DD}/2$?
b) Calcula $V_M$ si $W_p = W_n$.
c) Explica cómo cambian los márgenes de ruido en el caso b).

## Problema 3 · Retardo y buffers (25 %)

Un inversor mínimo tiene $C_{in} = 2$ fF, $t_{p0} = 10$ ps y $\gamma = 1$. Hay que atacar un pad de 512 fF.

a) Retardo si el inversor mínimo ataca el pad directamente.
b) Diseña la cadena óptima con $f = 4$: número de etapas, tamaño relativo de cada una y retardo total.
c) ¿La salida queda invertida?

## Problema 4 · Consumo (15 %)

Un bloque tiene $10^6$ puertas con $C_L = 5$ fF cada una, factor de actividad 0,15, $V_{DD} = 1{,}0$ V y reloj de 1 GHz. Cada puerta fuga 10 nA.

a) Potencia dinámica y estática.
b) ¿Cuál sería la potencia dinámica a 0,8 V y 800 MHz?

## Problema 5 · Restricciones temporales (15 %)

$t_{c\to q} = 60$ ps, $t_{setup} = 40$ ps, $t_{hold} = 20$ ps. El camino largo tiene 700 ps de lógica y el corto 10 ps. El reloj llega 30 ps más tarde al biestable de captura.

a) Frecuencia máxima.
b) ¿Se cumple el hold?

---

## Soluciones

**P1.** a) $I_D = 1m\cdot V_{ov}^2$, y $1{,}2 = 0{,}4 + V_{ov} + 0{,}5\,V_{ov}^2$ → $V_{ov}^2 + 2V_{ov} - 1{,}6 = 0$ → $V_{ov} = 0{,}612$ V. Resulta $I_D = 0{,}375$ mA, $V_S = 0{,}19$ V y $V_D = 1{,}05$ V. $V_{DS} = 0{,}86 \ge 0{,}61$ → saturación.
b) $g_m = 2\cdot 0{,}375m/0{,}612 = 1{,}22$ mS; $A_v = -\dfrac{g_mR_D}{1+g_mR_S} = -\dfrac{2{,}45}{1{,}61} = -1{,}52$.
c) Se necesita $V_D - V_S \ge 0{,}612$: $1{,}8 - 0{,}375m\,R_D - 0{,}19 \ge 0{,}612$ → $R_D \le 2{,}67$ kΩ.

**P2.** a) $W_p/W_n = 250/100 = 2{,}5$.
b) $r = \sqrt{0{,}4} = 0{,}632$ → $V_M = \dfrac{0{,}35 + 0{,}632\cdot 0{,}85}{1{,}632} = 0{,}54$ V.
c) $V_M$ baja: el margen bajo $NM_L$ se reduce y el alto $NM_H$ aumenta (la VTC se desplaza a la izquierda).

**P3.** a) $t_p = 10(1 + 256) = 2{,}57$ ns.
b) $F = 256$, $N = \log_4 256 = 4$ etapas de tamaños 1, 4, 16 y 64; $t_p = 4\cdot 10\cdot(1+4) = 200$ ps.
c) Con 4 inversores, la salida no queda invertida.

**P4.** a) $P_{din} = 10^6\cdot 0{,}15\cdot 5f\cdot 1^2\cdot 1G = 0{,}75$ W; $P_{est} = 10^6\cdot 10n\cdot 1 = 10$ mW.
b) $0{,}75\cdot 0{,}8^2\cdot 0{,}8 = 0{,}38$ W.

**P5.** a) $T_{min} = 60 + 700 + 40 - 30 = 770$ ps → $f_{max} = 1{,}30$ GHz.
b) $60 + 10 = 70 \ge 20 + 30 = 50$ ps → se cumple, con 20 ps de margen.
