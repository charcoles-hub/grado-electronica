# DMIC · Circuitos analógicos CMOS básicos

> Apunte de apoyo redactado por Claude a partir de Razavi (*Fundamentals of Microelectronics*, cap. 7, 9, 10 y 11) y Carusone–Johns–Martin. Cubre el hueco «circuitos analógicos: CS, CD, CG, cascode, espejos, cargas activas, respuesta en frecuencia y diferenciales». Complementa a Exercises Analog y al ejercicio de clase CS-CD.

Notación: $g_m$, $g_{mb}$ y $r_o$ del modelo de pequeña señal (ver el apunte del MOS); $X\parallel Y$ es el paralelo.

## 1. Tabla resumen de etapas

| Etapa | Ganancia $A_v$ | $R_{in}$ | $R_{out}$ |
|---|---|---|---|
| CS, carga $R_D$ | $-g_m(R_D\parallel r_o)$ | $\infty$ | $R_D\parallel r_o$ |
| CS con degeneración $R_S$ ($r_o=\infty$) | $-\dfrac{g_mR_D}{1+(g_m+g_{mb})R_S}$ | $\infty$ | $\approx R_D$ |
| CS, carga activa (fuente PMOS) | $-g_{m1}(r_{o1}\parallel r_{o2})$ | $\infty$ | $r_{o1}\parallel r_{o2}$ |
| CS, carga diodo (NMOS) | $\approx -\dfrac{g_{m1}}{g_{m2}+g_{mb2}}$ | $\infty$ | $\approx \dfrac{1}{g_{m2}}$ |
| CD (seguidor), carga $R_S$ | $\dfrac{g_mR_S}{1+(g_m+g_{mb})R_S}$ | $\infty$ | $\dfrac{1}{g_m+g_{mb}}\parallel R_S$ |
| CG, carga $R_D$ | $(g_m+g_{mb})R_D$ | $\approx\dfrac{1}{g_m+g_{mb}}$ | $\approx R_D$ |
| Cascode (CS + CG) | $\approx -g_{m1}R_{out}$ | $\infty$ | $\approx g_{m2}r_{o2}r_{o1}$ |

**Ideas clave**
- **CS**: la etapa amplificadora básica; invierte la señal.
- **CD**: ganancia algo menor que 1 (el efecto cuerpo la reduce a $\frac{g_m}{g_m+g_{mb}}$ con carga ideal) y resistencia de salida baja. Sirve de *buffer* de tensión.
- **CG**: resistencia de entrada baja. Sirve de *buffer* de corriente y es la etapa de arriba del cascode.
- **Cascode**: multiplica la resistencia de salida por $g_mr_o$. Con una carga también cascode, la ganancia llega a $\sim(g_mr_o)^2$. Su precio es menos excursión de salida, porque apila dos $V_{ov}$.

## 2. Fuentes y espejos de corriente

**Espejo simple** (M1 conectado como diodo con $I_{ref}$, M2 copia):
$$I_{out} = I_{ref}\,\frac{(W/L)_2}{(W/L)_1}\cdot\frac{1+\lambda V_{DS2}}{1+\lambda V_{DS1}}, \qquad R_{out} = r_{o2}$$

- Error de copia por $\lambda$ si $V_{DS2} \ne V_{DS1}$. Para que funcione, M2 debe estar en saturación: $V_{out} \ge V_{ov}$.
- **Espejo cascode**: $R_{out} \approx g_m r_o^2$ y copia mucho más exacta, pero necesita $V_{out} \ge 2V_{ov} + V_{TH}$ (o $2V_{ov}$ en la versión de alta excursión).
- En los circuitos integrados se polariza todo con espejos: las cargas activas y las fuentes de cola son espejos.

## 3. Cargas activas

Sustituir $R_D$ por un transistor (fuente de corriente PMOS) da una ganancia alta sin una resistencia enorme:
$$A_v = -g_{m1}(r_{o1}\parallel r_{o2}) \approx -\frac{g_m r_o}{2}\ \text{(si } r_{o1}=r_{o2}\text{)}$$
El punto de trabajo de salida queda muy sensible al desajuste de corrientes, así que estas etapas se usan dentro de un lazo de realimentación o de una estructura diferencial.

## 4. Respuesta en frecuencia

**Teorema de Miller**: una impedancia $Z$ entre dos nudos con ganancia $A = V_2/V_1$ equivale a $\frac{Z}{1-A}$ a la entrada y a $\frac{Z}{1-1/A}$ a la salida. Para un condensador: $C_{in} = C(1-A)$.

**CS con resistencia de fuente $R_{sig}$** (aproximación de dos polos):
$$\omega_{p,in} \approx \frac{1}{R_{sig}\,[C_{GS} + (1+g_mR_D)C_{GD}]}, \qquad \omega_{p,out} \approx \frac{1}{R_D\,(C_{DB}+C_{GD})}$$

- $C_{GD}$ multiplicada por la ganancia (efecto Miller) suele crear el **polo dominante** en la entrada.
- Hay también un cero en $\omega_z = +g_m/C_{GD}$ (semiplano derecho).
- **CD y CG** no sufren el efecto Miller sobre $C_{GD}$, por eso tienen más ancho de banda. El cascode reduce el Miller de la etapa CS porque la ganancia hasta el nudo intermedio es $\approx -1$.
- Producto ganancia-ancho de banda: con un polo dominante, $GBW \approx |A_0|\cdot f_{-3dB}$.

## 5. Etapas diferenciales

Par M1–M2 con fuente de cola $I_{SS}$ y su resistencia $R_{SS}$.

- Señales: $v_{id} = v_{in1} - v_{in2}$ (diferencial) y $v_{ic} = \frac{v_{in1}+v_{in2}}{2}$ (modo común).
- **Gran señal**: con $v_{id} = 0$ cada rama lleva $I_{SS}/2$. Toda la corriente pasa a un lado cuando $|v_{id}| \ge \sqrt{2}\,V_{ov}$ (con $V_{ov}$ en el equilibrio).
- **Carga resistiva, salida diferencial**: $A_{dm} = -g_mR_D$. Con salida por un solo lado es la mitad.
- **Modo común** (salida por un lado): $A_{cm} \approx -\dfrac{R_D}{1/g_m + 2R_{SS}}$. Con salida diferencial y simetría perfecta, $A_{cm}=0$.
- $CMRR = |A_{dm}/A_{cm}|$: cuanto mayor $R_{SS}$, mejor (por eso la cola suele ser una fuente cascode).
- **Carga espejo (salida *single-ended*)**: el espejo PMOS suma las dos ramas, así que no se pierde la mitad de la ganancia:
  $$A_v = g_{m1}(r_{o2}\parallel r_{o4})$$
  Y el CMRR es mucho mayor que con salida por un solo lado y carga resistiva.

## 6. Ejemplos resueltos

Datos comunes: $g_m = 1$ mS, $g_{mb} = 0{,}2$ mS, $r_o = 100$ kΩ.

- **CS con carga activa** ($r_{o1}=r_{o2}=100$ kΩ): $A_v = -1m\cdot 50k = -50$ (34 dB).
- **Cascode**: $R_{out} \approx g_mr_o^2 = 10$ MΩ.
- **Espejo**: $I_{ref} = 50\ \mu$A y $(W/L)_2 = 4(W/L)_1$ → $I_{out} = 200\ \mu$A.
- **CD** con $R_S = 10$ kΩ: $A_v = \dfrac{10}{1 + 1{,}2\cdot 10} = 0{,}77$ y $R_{out} = 833\,\Omega\parallel 10\,\text{k}\Omega = 769\ \Omega$.
- **CG** con $R_D = 10$ kΩ: $R_{in} \approx 833\ \Omega$, $A_v = 1{,}2m\cdot 10k = 12$.
- **Polos de un CS** con $R_{sig} = 10$ kΩ, $R_D = 10$ kΩ, $C_{GS} = 50$ fF, $C_{GD} = 10$ fF y $C_{DB} = 20$ fF: la ganancia es $-10$.
  - Miller: $C_{in} = 50 + 11\cdot 10 = 160$ fF → $f_{p,in} = \dfrac{1}{2\pi\cdot 10k\cdot 160f} \approx 99$ MHz (polo dominante).
  - $f_{p,out} = \dfrac{1}{2\pi\cdot 10k\cdot 30f} \approx 530$ MHz.
- **Diferencial** con $R_D = 10$ kΩ y $R_{SS} = 50$ kΩ:
  - Salida por un lado: $A_{dm} = 5$ y $A_{cm} = -\dfrac{10k}{1k + 100k} = -0{,}099$ → $CMRR \approx 50$ (34 dB).
  - Con carga espejo y $r_o = 100$ kΩ: $A_v = 1m\cdot 50k = 50$.

## 7. Ejercicios

**E1.** Un CS con carga activa tiene $I_D = 100\ \mu$A, $V_{ov} = 0{,}2$ V y $\lambda_n = \lambda_p = 0{,}1$ V⁻¹. Calcula la ganancia.

**E2.** Diseña un espejo que dé 120 µA a partir de una referencia de 20 µA. ¿Cuánto vale $I_{out}$ si $V_{DS1} = 0{,}6$ V, $V_{DS2} = 1{,}2$ V y $\lambda = 0{,}1$ V⁻¹?

**E3.** En el CS del ejemplo de polos, ¿cuánto baja $f_{p,in}$ si la ganancia sube a $-30$ (manteniendo el resto)?

**E4.** Un par diferencial con carga espejo tiene $I_{SS} = 200\ \mu$A, $V_{ov} = 0{,}2$ V y $r_{o2} = r_{o4} = 100$ kΩ. Calcula la ganancia.

### Soluciones

**E1.** $g_m = 2\cdot 100\mu/0{,}2 = 1$ mS; $r_{o1} = r_{o2} = 1/(0{,}1\cdot 100\mu) = 100$ kΩ → $A_v = -1m\cdot 50k = -50$.

**E2.** Relación $(W/L)_2/(W/L)_1 = 6$. Con $\lambda$: $I_{out} = 120\mu\cdot\dfrac{1{,}12}{1{,}06} = 126{,}8\ \mu$A (un 5,7 % de error).

**E3.** $C_{in} = 50 + 31\cdot 10 = 360$ fF → $f_{p,in} = \dfrac{1}{2\pi\cdot 10k\cdot 360f} \approx 44$ MHz.

**E4.** Cada rama lleva 100 µA → $g_m = 2\cdot 100\mu/0{,}2 = 1$ mS → $A_v = 1m\cdot(100k\parallel 100k) = 50$.
