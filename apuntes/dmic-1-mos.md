# DMIC · Transistor MOS: análisis DC y pequeña señal

> Apunte de apoyo redactado por Claude a partir de la bibliografía de la guía docente (Razavi, *Fundamentals of Microelectronics*; Weste & Harris, *CMOS VLSI Design*). Cubre el hueco «análisis DC del MOS y pequeña señal». Si en Atenea tienes las transparencias oficiales, usa su notación (por ejemplo, $k'$, $\beta$ o $K$ según el profesor).

## 1. Ecuaciones del NMOS (modelo cuadrático)

Llamamos $V_{ov} = V_{GS} - V_{TH}$ a la tensión de *overdrive* y $k_n' = \mu_n C_{ox}$.

| Región | Condición | Corriente $I_D$ |
|---|---|---|
| Corte | $V_{GS} < V_{TH}$ | $I_D \approx 0$ |
| Triodo (lineal) | $V_{GS} > V_{TH}$ y $V_{DS} < V_{ov}$ | $k_n'\frac{W}{L}\left[V_{ov}V_{DS} - \frac{V_{DS}^2}{2}\right]$ |
| Saturación | $V_{GS} > V_{TH}$ y $V_{DS} \ge V_{ov}$ | $\frac{1}{2}k_n'\frac{W}{L}V_{ov}^2\,(1+\lambda V_{DS})$ |

- $V_{DS,sat} = V_{ov}$ es la frontera entre triodo y saturación.
- Para $V_{DS} \ll V_{ov}$ el transistor es una resistencia: $R_{on} = \dfrac{1}{k_n'\frac{W}{L}V_{ov}}$.
- **Modulación de canal**: el factor $(1+\lambda V_{DS})$ da pendiente a las curvas en saturación. $\lambda \propto 1/L$.
- **Efecto cuerpo**: si $V_{SB} > 0$, sube el umbral:
  $$V_{TH} = V_{TH0} + \gamma\left(\sqrt{2\phi_F + V_{SB}} - \sqrt{2\phi_F}\right)$$

## 2. PMOS

Las mismas ecuaciones con tensiones «al revés» y valores absolutos: $V_{SG}$, $V_{SD}$, $|V_{THp}|$ y $k_p' = \mu_p C_{ox}$ (con $\mu_p \approx \mu_n/2 \ldots \mu_n/3$).

- Conduce si $V_{SG} > |V_{THp}|$.
- Saturación si $V_{SD} \ge V_{SG} - |V_{THp}|$: $\;I_D = \frac{1}{2}k_p'\frac{W}{L}(V_{SG}-|V_{THp}|)^2(1+\lambda V_{SD})$.

## 3. Método para el análisis DC

1. **Supón una región** (normalmente saturación).
2. **Escribe** la ecuación de $I_D$ y la de malla (KVL) del circuito.
3. **Resuelve**. Si sale una ecuación de 2.º grado, quédate con la solución que cumple $V_{GS} > V_{TH}$.
4. **Verifica** la condición de región ($V_{DS} \ge V_{ov}$). Si falla, repite con triodo.

**Polarización por tensión** (puerta a una tensión fija): $I_D$ depende mucho de $V_{TH}$ y de la temperatura. **Por corriente** (fuente o espejo que fija $I_D$): $V_{GS}$ se ajusta solo. Es lo habitual en circuitos integrados.

Con resistencia de fuente $R_S$ (degeneración): $V_G = V_{GS} + I_D R_S$, que da una ecuación de 2.º grado en $V_{ov}$ y reduce la sensibilidad a $V_{TH}$.

## 4. Capacidades del MOS

| Región | $C_{GS}$ | $C_{GD}$ | $C_{GB}$ |
|---|---|---|---|
| Corte | $WC_{ov}$ | $WC_{ov}$ | $WLC_{ox}$ |
| Triodo | $\frac{1}{2}WLC_{ox} + WC_{ov}$ | $\frac{1}{2}WLC_{ox} + WC_{ov}$ | 0 |
| Saturación | $\frac{2}{3}WLC_{ox} + WC_{ov}$ | $WC_{ov}$ | 0 |

Además están las capacidades de unión $C_{SB}$ y $C_{DB}$, proporcionales al área y al perímetro de la difusión. En el layout se reducen compartiendo difusiones entre transistores.

## 5. Modelo de pequeña señal (saturación)

$$g_m = \frac{\partial I_D}{\partial V_{GS}} = k_n'\frac{W}{L}V_{ov} = \frac{2I_D}{V_{ov}} = \sqrt{2k_n'\frac{W}{L}I_D}$$

$$r_o = \frac{1}{\lambda I_D} \qquad g_{mb} = \eta\, g_m,\quad \eta = \frac{\gamma}{2\sqrt{2\phi_F + V_{SB}}}$$

- Fuente dependiente $g_m v_{gs}$ (y $g_{mb}v_{bs}$) en paralelo con $r_o$ entre drenador y surtidor.
- La puerta no consume corriente en DC: $R_{in} = \infty$.
- **Ganancia intrínseca**: $g_m r_o = \dfrac{2}{\lambda V_{ov}}$, la máxima que da un solo transistor.
- Frecuencia de transición: $\omega_T \approx \dfrac{g_m}{C_{GS}}$.

Las tres formas de $g_m$ son equivalentes. Usa la que tenga los datos del enunciado: con $I_D$ fija, $g_m \propto \sqrt{W/L}$; con $V_{ov}$ fija, $g_m \propto I_D$.

## 6. Ejemplo resuelto

NMOS con $V_{DD} = 1{,}8$ V, $R_D = 5$ kΩ, $V_G = 0{,}8$ V, surtidor a masa, $V_{TH} = 0{,}4$ V, $k_n' = 200\ \mu$A/V², $W/L = 10$, $\lambda = 0$.

- Suponemos saturación: $I_D = \frac{1}{2}\cdot 200\mu\cdot 10\cdot(0{,}4)^2 = 160\ \mu$A.
- $V_{DS} = 1{,}8 - 160\mu\cdot 5k = 1{,}0$ V $\ge V_{ov} = 0{,}4$ V → **saturación correcta**.
- $g_m = 2\cdot 160\mu/0{,}4 = 0{,}8$ mS → ganancia del amplificador de surtidor común $A_v = -g_mR_D = -4$.

## 7. Ejercicios

**E1.** En el ejemplo anterior, ¿qué $R_D$ máxima mantiene el transistor en saturación?

**E2.** Un PMOS tiene el surtidor a $V_{DD} = 1{,}8$ V, la puerta a 0,9 V y el drenador a masa a través de $R_D = 10$ kΩ. Datos: $|V_{THp}| = 0{,}45$ V, $k_p' = 80\ \mu$A/V², $W/L = 20$, $\lambda=0$. Calcula $I_D$ y $V_D$, y comprueba la región.

**E3.** Para un NMOS con $I_D = 100\ \mu$A y $V_{ov} = 0{,}2$ V, $\lambda = 0{,}1$ V⁻¹, calcula $g_m$, $r_o$ y la ganancia intrínseca.

**E4.** Con $R_S = 1$ kΩ en el surtidor del ejemplo y $V_G = 1{,}0$ V, calcula $I_D$.

### Soluciones

**E1.** Se necesita $V_{DS} \ge 0{,}4$ → $1{,}8 - 160\mu R_D \ge 0{,}4$ → $R_D \le 8{,}75$ kΩ.

**E2.** $V_{SG} = 0{,}9$ → $V_{ov} = 0{,}45$ V. Saturación: $I_D = \frac{1}{2}\cdot 80\mu\cdot 20\cdot 0{,}45^2 = 162\ \mu$A. $V_D = 162\mu \cdot 10k = 1{,}62$ V. $V_{SD} = 0{,}18$ V $< 0{,}45$ V → **no** está en saturación. En triodo:
$I_D = 1{,}6\text{m}\,[0{,}45\,V_{SD} - V_{SD}^2/2]$ y $V_{SD} = 1{,}8 - 10k\,I_D$. Sustituyendo y resolviendo: $8\,V_{SD}^2 - 8{,}2\,V_{SD} + 1{,}8 = 0$ → $V_{SD} \approx 0{,}318$ V (la otra raíz, 0,71 V, no cumple $V_{SD} < 0{,}45$ V). Por tanto $I_D = (1{,}8-0{,}318)/10k \approx 148\ \mu$A y $V_D \approx 1{,}48$ V.

**E3.** $g_m = 2\cdot 100\mu/0{,}2 = 1$ mS; $r_o = 1/(0{,}1\cdot 100\mu) = 100$ kΩ; $g_mr_o = 100$ (40 dB).

**E4.** $V_G = V_{GS} + I_DR_S$ con $I_D = 1\text{m}\cdot V_{ov}^2$ (A, con $V_{ov}$ en V): $1{,}0 = 0{,}4 + V_{ov} + 1\text{m}\cdot V_{ov}^2 \cdot 1000$ → $V_{ov}^2 + V_{ov} - 0{,}6 = 0$ → $V_{ov} = 0{,}422$ V → $I_D = 178\ \mu$A. Sin $R_S$ habría sido $360\ \mu$A: la degeneración estabiliza la polarización.
