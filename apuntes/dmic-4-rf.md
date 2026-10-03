# DMIC · RF: ruido, no linealidad y LNA

> Apunte de apoyo redactado por Claude a partir de Razavi (*RF Microelectronics*) y Carusone–Johns–Martin. Cubre el hueco «RF: LNA, ruido y no linealidad». Complementa a Exercises RF y al guion del Lab RF.

## 1. Cabezal receptor

Antena → filtro de banda → **LNA** → mezclador → filtro de FI → ADC.

El LNA debe:
- adaptarse a 50 Ω (para el filtro y la antena),
- tener ganancia suficiente para que el ruido de las etapas siguientes pese poco (Friis),
- añadir poco ruido (NF baja),
- ser lo bastante lineal para no saturarse con interferentes fuertes.

## 2. Ruido

**Fuentes**
- **Térmico en una resistencia**: $\overline{v_n^2} = 4kTR\,\Delta f$ (o $\overline{i_n^2} = 4kT\Delta f/R$). Con 50 Ω a 300 K da $0{,}91$ nV/√Hz.
- **Canal del MOS** (saturación): $\overline{i_d^2} = 4kT\gamma g_m\,\Delta f$, con $\gamma \approx 2/3$ en canal largo (mayor en canal corto).
- **Flicker (1/f)**: referido a la puerta, $\overline{v_n^2} = \dfrac{K}{C_{ox}WL}\cdot\dfrac{\Delta f}{f}$. Importa a baja frecuencia (y en mezcladores y osciladores); se reduce con transistores grandes.

**Ruido referido a la entrada**: el generador de tensión (y de corriente) a la entrada que produciría el mismo ruido de salida en el circuito sin ruido. Para un CS: $\overline{v_{n,in}^2} \approx \dfrac{4kT\gamma}{g_m}$, así que más $g_m$ (más corriente) da menos ruido.

**Figura de ruido**
$$F = \frac{SNR_{in}}{SNR_{out}} = 1 + \frac{\text{ruido de salida debido al circuito}}{\text{ruido de salida debido a la fuente}}, \qquad NF = 10\log F$$

Ejemplo: CS con $R_S$ a la entrada, contando solo el ruido del canal: $F = 1 + \dfrac{\gamma}{g_mR_S}$.

**Cascada (Friis)**, con ganancias de potencia disponibles $G_i$:
$$F_{tot} = F_1 + \frac{F_2-1}{G_1} + \frac{F_3-1}{G_1G_2} + \cdots$$
Mandan la primera etapa y su ganancia.

## 3. No linealidad

Modelo sin memoria: $y = \alpha_1x + \alpha_2x^2 + \alpha_3x^3$.

- **Armónicos**: con $x = A\cos\omega t$ aparecen $2\omega$ y $3\omega$.
- **Compresión a 1 dB**: si $\alpha_1\alpha_3 < 0$, la ganancia cae al crecer $A$. Cae 1 dB cuando $A_{1dB} = \sqrt{0{,}145\,|\alpha_1/\alpha_3|}$.
- **Intermodulación**: con dos tonos $\omega_1$ y $\omega_2$ aparecen productos en $2\omega_1-\omega_2$ y $2\omega_2-\omega_1$, que caen dentro de la banda y no se pueden filtrar.
- **IP3**: amplitud de entrada a la que el producto de 3.er orden igualaría al fundamental:
  $$A_{IIP3} = \sqrt{\tfrac{4}{3}\left|\tfrac{\alpha_1}{\alpha_3}\right|}, \qquad P_{1dB} \approx IIP3 - 9{,}6\ \text{dB}$$
- **Medida con dos tonos**: el fundamental crece 1 dB por dB y el IM3 3 dB por dB. Si a una potencia de entrada $P_{in}$ por tono la diferencia entre fundamental e IM3 a la salida es $\Delta P$ (dB):
  $$IIP3 = P_{in} + \frac{\Delta P}{2}$$
- **Cascada**: $\dfrac{1}{A^2_{IIP3,tot}} \approx \dfrac{1}{A^2_{IIP3,1}} + \dfrac{\alpha_1^2}{A^2_{IIP3,2}} + \cdots$ (en potencia, con la ganancia de la etapa 1). Mandan las últimas etapas: mucha ganancia delante empeora la linealidad total.

## 4. LNA de banda estrecha con degeneración inductiva

NMOS en surtidor común con $L_s$ en el surtidor y $L_g$ en la puerta. Su impedancia de entrada:
$$Z_{in} = s(L_g+L_s) + \frac{1}{sC_{GS}} + \frac{g_mL_s}{C_{GS}} \;\Rightarrow\; \text{Re}\{Z_{in}\} = \omega_TL_s$$

- **Adaptación**: $\omega_TL_s = R_S$ (50 Ω), y resonancia a la frecuencia de trabajo $\omega_0 = \dfrac{1}{\sqrt{(L_g+L_s)C_{GS}}}$.
- La parte real viene de $L_s$, que **no** es una resistencia, así que no añade ruido térmico.
- **Transconductancia efectiva** en resonancia y adaptado: $G_m = \dfrac{\omega_T}{2\omega_0R_S}$.
- **Carga sintonizada** (LC en el drenador, resistencia de pérdidas $R_p$ a $\omega_0$): ganancia $A_v = G_mR_p$ y ancho de banda $\omega_0/Q$ del tanque. Con un cascode se mejora el aislamiento entrada–salida (menos Miller sobre $C_{GD}$).
- **Amplificador sintonizado general**: CS con tanque LC, ganancia $-g_mR_p$ a $f_0 = \frac{1}{2\pi\sqrt{LC}}$ y $BW = f_0/Q$.

## 5. Ejemplos resueltos

**Diseño de un LNA a 2,4 GHz** con $C_{GS} = 200$ fF y $g_m = 20$ mS:
- $\omega_T = g_m/C_{GS} = 10^{11}$ rad/s ($f_T \approx 15{,}9$ GHz).
- $L_s = 50/\omega_T = 0{,}5$ nH.
- $L_g + L_s = \dfrac{1}{\omega_0^2C_{GS}} = \dfrac{1}{(1{,}508\cdot10^{10})^2\cdot 200f} = 22{,}0$ nH → $L_g = 21{,}5$ nH.
- $G_m = \dfrac{10^{11}}{2\cdot 1{,}508\cdot10^{10}\cdot 50} = 66$ mS. Con $R_p = 500\ \Omega$ resulta $A_v = 33$ (30 dB).

**IP3 y P1dB**: $\alpha_1 = 10$ y $\alpha_3 = -0{,}5$ V⁻² → $A_{IIP3} = \sqrt{\frac{4}{3}\cdot 20} = 5{,}16$ V, $A_{1dB} = \sqrt{0{,}145\cdot 20} = 1{,}70$ V. El cociente es $0{,}33$ (−9,6 dB).

**Medida de dos tonos**: $P_{in} = -30$ dBm por tono, fundamental a −10 dBm y IM3 a −50 dBm a la salida → $\Delta P = 40$ dB → $IIP3 = -30 + 20 = -10$ dBm.

## 6. Ejercicios

**E1.** Un LNA (NF = 2 dB, G = 15 dB) va seguido de un mezclador con NF = 8 dB. Calcula la NF total.

**E2.** Mismo LNA con $IIP3 = 0$ dBm, seguido de un mezclador con $IIP3 = +5$ dBm. Calcula el IIP3 total.

**E3.** Un CS con $g_m = 20$ mS se ataca desde 50 Ω ($\gamma = 2/3$, solo ruido de canal). Calcula la NF.

**E4.** Rediseña el LNA del ejemplo para 5 GHz con el mismo transistor. ¿Qué cambia?

### Soluciones

**E1.** $F = 1{,}585 + \dfrac{6{,}31 - 1}{31{,}6} = 1{,}753$ → $NF = 2{,}44$ dB.

**E2.** En mW: $\dfrac{1}{IIP3} = \dfrac{1}{1} + \dfrac{31{,}6}{3{,}16} = 11$ → $IIP3 = 0{,}091$ mW $= -10{,}4$ dBm. El mezclador limita.

**E3.** $F = 1 + \dfrac{0{,}667}{20m\cdot 50} = 1{,}667$ → $NF = 2{,}2$ dB.

**E4.** $L_s$ no cambia (0,5 nH, depende de $\omega_T$). $L_g + L_s = \dfrac{1}{(2\pi\cdot5\text{G})^2\cdot 200f} = 5{,}07$ nH → $L_g = 4{,}57$ nH. Además $G_m = \dfrac{10^{11}}{2\cdot 3{,}14\cdot10^{10}\cdot 50} = 32$ mS: la ganancia cae a la mitad porque $\omega_0/\omega_T$ es mayor.
