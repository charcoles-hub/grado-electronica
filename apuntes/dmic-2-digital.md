# DMIC · Circuitos digitales CMOS

> Apunte de apoyo redactado por Claude a partir de Weste & Harris (*CMOS VLSI Design*) y Rabaey (*Digital Integrated Circuits*). Cubre el hueco «circuitos digitales CMOS: característica DC, retardo, consumo, buffers y restricciones temporales». Úsalo junto con tus ejercicios Invx2, Inversor PMOS y Tasca 2.

## 1. Característica DC del inversor (VTC)

Recorriendo $V_{in}$ de 0 a $V_{DD}$:

| Tramo | NMOS | PMOS | $V_{out}$ |
|---|---|---|---|
| $V_{in} < V_{Tn}$ | corte | triodo | $V_{DD}$ |
| poco por encima de $V_{Tn}$ | saturación | triodo | cerca de $V_{DD}$ |
| $V_{in} \approx V_M$ | saturación | saturación | cae casi vertical |
| poco por debajo de $V_{DD}-\lvert V_{Tp}\rvert$ | triodo | saturación | cerca de 0 |
| $V_{in} > V_{DD}-\lvert V_{Tp}\rvert$ | triodo | corte | 0 |

**Tensión de conmutación** $V_M$ ($V_{in}=V_{out}$, los dos en saturación, $\lambda = 0$):

$$V_M = \frac{V_{Tn} + r\,(V_{DD} - |V_{Tp}|)}{1 + r}, \qquad r = \sqrt{\frac{k_p'(W/L)_p}{k_n'(W/L)_n}}$$

- Inversor simétrico ($V_M = V_{DD}/2$ con $V_{Tn} = |V_{Tp}|$): $r = 1$ → $\dfrac{(W/L)_p}{(W/L)_n} = \dfrac{\mu_n}{\mu_p} \approx 2\ldots3$.
- Si se ensancha el PMOS, $V_M$ sube; si se ensancha el NMOS, baja.

**Márgenes de ruido**: $V_{IL}$ y $V_{IH}$ son los puntos donde la pendiente de la VTC vale $-1$.
$$NM_L = V_{IL} - V_{OL}, \qquad NM_H = V_{OH} - V_{IH}$$
En CMOS estático, $V_{OH} = V_{DD}$ y $V_{OL} = 0$ (salida *rail-to-rail*).

## 2. Retardo de propagación

Definiciones (al 50 % de las excursiones): $t_{pHL}$ (salida baja), $t_{pLH}$ (salida sube), $t_p = \frac{t_{pHL}+t_{pLH}}{2}$.

**Modelo RC**: cada transistor que conduce se sustituye por una resistencia equivalente
$$R_{eq} \approx \frac{3}{4}\frac{V_{DD}}{I_{D,sat}} \quad\Rightarrow\quad t_{pHL} = 0{,}69\,R_{eq,n}C_L, \qquad t_{pLH} = 0{,}69\,R_{eq,p}C_L$$

**Modelo de corriente media** (alternativa típica en ejercicios): $t_p \approx \dfrac{C_L\,\Delta V}{I_{media}}$, con $\Delta V = V_{DD}/2$.

**Capacidad de carga**: $C_L = C_{int} + C_{wire} + C_{fan\text{-}out}$.
- $C_{int}$: capacidades de drenador propias ($C_{DB}$ y $C_{GD}$, esta última por efecto Miller cuenta doble).
- $C_{fan\text{-}out}$: puertas de las etapas siguientes, $C_g \approx C_{ox}WL$ por transistor.

Escribiendo $t_p = t_{p0}\left(1 + \dfrac{C_{ext}}{C_{int}}\right)$: ensanchar un inversor reduce $R_{eq}$, pero también aumenta $C_{int}$, así que el retardo intrínseco $t_{p0}$ no baja. Solo ayuda si domina la carga externa.

**Cómo reducir el retardo**: reducir $C_L$ (layout compacto), aumentar $W/L$ (si domina $C_{ext}$), subir $V_{DD}$ (a costa de consumo).

## 3. Consumo

$$P = \underbrace{\alpha\,C_L V_{DD}^2 f}_{\text{dinámico}} + \underbrace{P_{sc}}_{\text{cortocircuito}} + \underbrace{V_{DD}I_{leak}}_{\text{estático}}$$

- **Dinámico**: cada transición 0→1 toma $C_LV_{DD}^2$ de la alimentación. La mitad se queda en $C_L$ y se pierde en la siguiente descarga. $\alpha$ es la probabilidad de transición 0→1 por ciclo.
- **Cortocircuito**: durante la transición conducen los dos transistores. Crece con tiempos de subida lentos en la entrada.
- **Estático**: fugas subumbral y de puerta. Importante en nodos avanzados.
- **Figuras de mérito**: $PDP = P\cdot t_p$ (energía por conmutación) y $EDP = PDP\cdot t_p$.

Bajar $V_{DD}$ es lo más eficaz (cuadrático), pero aumenta el retardo.

## 4. Buffers escalados

Para atacar una carga grande $C_L$ desde una puerta pequeña $C_{in}$ se usa una cadena de $N$ inversores, cada uno $f$ veces mayor que el anterior.

- Esfuerzo total $F = C_L/C_{in}$ y $f = F^{1/N}$.
- Con $\gamma = C_{int}/C_g$: $\;t_p = N\,t_{p0}\left(1 + \dfrac{f}{\gamma}\right)$.
- **Óptimo**: $f = e \approx 2{,}7$ si $\gamma = 0$; $f \approx 3{,}6$ si $\gamma = 1$ (lo habitual es usar 3–4). $N_{opt} = \ln F/\ln f$, redondeado a un entero.
- Si hace falta una salida no invertida, $N$ debe ser par.
- Es un caso particular del **esfuerzo lógico** (*logical effort*): $d = g\cdot h + p$, con $g$ el esfuerzo lógico de la puerta (1 en el inversor, $\frac{4}{3}$ en NAND2 y $\frac{5}{3}$ en NOR2), $h$ el fan-out eléctrico y $p$ el retardo parásito.

## 5. Restricciones temporales en circuitos síncronos

Entre dos biestables con lógica combinacional en medio:

- **Setup** (tiempo de ciclo mínimo): $\;T_{clk} \ge t_{c\to q} + t_{logic,max} + t_{setup} - \delta$
- **Hold** (carrera de datos): $\;t_{c\to q,min} + t_{logic,min} \ge t_{hold} + \delta$

$\delta$ es el *skew* (el reloj llega más tarde al biestable de captura). Un *skew* positivo ayuda al setup y perjudica al hold. Una violación de hold no se arregla bajando la frecuencia: hay que añadir retardo al camino corto.

## 6. Ejemplos resueltos

**Dimensionado para $V_M$ simétrico.** $V_{DD} = 1{,}8$ V, $V_{Tn} = |V_{Tp}| = 0{,}4$ V, $k_n' = 200$ y $k_p' = 80\ \mu$A/V². Para $V_M = 0{,}9$ V hace falta $r = 1$ → $(W/L)_p/(W/L)_n = 200/80 = 2{,}5$.

**Retardo.** NMOS con $W/L = 2$: $I_{D,sat} = \frac{1}{2}\cdot 200\mu\cdot 2\cdot(1{,}4)^2 = 392\ \mu$A → $R_{eq} = \frac{3}{4}\cdot\frac{1{,}8}{392\mu} = 3{,}44$ kΩ. Con $C_L = 20$ fF: $t_{pHL} = 0{,}69\cdot 3{,}44k\cdot 20f \approx 47$ ps.

**Buffer.** $C_{in} = 2$ fF, $C_L = 2$ pF → $F = 1000$. Con $f \approx 3{,}6$: $N = \ln 1000/\ln 3{,}6 = 5{,}4$, así que 5 o 6 etapas.
- $N = 5$: $f = 3{,}98$ → $t_p = 5\,t_{p0}(1+3{,}98) = 24{,}9\,t_{p0}$.
- $N = 6$: $f = 3{,}16$ → $t_p = 6\,t_{p0}(1+3{,}16) = 25{,}0\,t_{p0}$.
- Sin buffer: $t_p = t_{p0}(1+1000) \approx 1001\,t_{p0}$. Cuarenta veces más lento.

**Consumo.** $C_L = 50$ fF, $V_{DD} = 1{,}8$ V, $f = 100$ MHz y $\alpha = 0{,}1$: $\;P = 0{,}1\cdot 50f\cdot 1{,}8^2\cdot 100M = 1{,}62\ \mu$W.

**Timing.** $t_{c\to q} = 50$ ps, $t_{logic,max} = 400$ ps y $t_{setup} = 30$ ps, sin *skew*: $T_{min} = 480$ ps → $f_{max} \approx 2{,}08$ GHz.

## 7. Ejercicios

**E1.** Con los datos del primer ejemplo y $(W/L)_p = (W/L)_n$, calcula $V_M$.

**E2.** Un inversor tiene $t_{p0} = 15$ ps y $C_{int} = 3$ fF. ¿Cuál es su retardo con 4 inversores iguales de carga ($C_g = 3$ fF cada uno) y 6 fF de interconexión?

**E3.** Una cadena de buffers ataca 1 pF desde 4 fF. Calcula el $N$ óptimo con $f = 4$ y el retardo resultante en unidades de $t_{p0}$ ($\gamma = 1$).

**E4.** Un bloque consume 2 mW a 1,8 V y 200 MHz. ¿Cuánto consumirá a 1,2 V y 100 MHz (solo potencia dinámica)?

**E5.** $t_{c\to q,min} = 40$ ps, $t_{hold} = 25$ ps y el camino más corto tiene 0 ps de lógica. ¿Qué *skew* máximo se tolera?

### Soluciones

**E1.** $r = \sqrt{80/200} = 0{,}632$ → $V_M = \dfrac{0{,}4 + 0{,}632\cdot 1{,}4}{1{,}632} = 0{,}79$ V (por debajo de $V_{DD}/2$ porque el NMOS es más fuerte).

**E2.** $C_{ext} = 4\cdot 3 + 6 = 18$ fF → $t_p = 15(1 + 18/3) = 105$ ps.

**E3.** $F = 250$, $N = \ln 250/\ln 4 = 3{,}98$ → $N = 4$, $f = 250^{1/4} = 3{,}98$, $t_p = 4\,t_{p0}(1 + 3{,}98) \approx 19{,}9\,t_{p0}$.

**E4.** $P' = 2\text{ mW}\cdot(1{,}2/1{,}8)^2\cdot(100/200) = 0{,}44$ mW.

**E5.** $40 + 0 \ge 25 + \delta$ → $\delta \le 15$ ps.
