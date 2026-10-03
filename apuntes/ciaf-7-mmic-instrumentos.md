# CIAF · Temas 7 y 9: circuitos híbridos y monolíticos, instrumentos de microondas

> Apunte de apoyo redactado por Claude siguiendo los apartados 7 y 9 de la guía docente y Pozar (*Microwave Engineering*), más notas de aplicación de fabricantes de instrumentación. Cubre el hueco «MMIC e instrumentos (analizador de espectro, VNA, medidor de figura de ruido)».

## 1. Circuitos híbridos (HMIC) y monolíticos (MMIC)

| | HMIC (híbrido) | MMIC (monolítico) |
|---|---|---|
| **Qué es** | componentes discretos (transistores encapsulados, chips, condensadores y resistencias SMD) sobre un sustrato con líneas impresas | todos los elementos activos y pasivos fabricados en una sola pastilla de semiconductor |
| **Sustratos** | alúmina, PTFE/teflón, Rogers (RO4003…), FR4 a baja frecuencia | GaAs, GaN, InP, SiGe, Si CMOS/SOI |
| **Ventajas** | barato en series cortas, se puede ajustar y reparar, componentes óptimos para cada función | pequeño y ligero, muy repetible, barato en grandes volúmenes, llega a ondas milimétricas, pocos parásitos |
| **Inconvenientes** | mayor tamaño, más parásitos (soldaduras, *bondings*), menos repetible | coste inicial (máscaras y diseño) muy alto, no se puede ajustar, Q baja de los inductores |

**Elementos de un MMIC**
- **Activos**: MESFET, pHEMT (GaAs), HEMT de GaN (alta potencia), HBT (SiGe, InP).
- **Pasivos**: condensadores MIM (metal–aislante–metal), inductores en espiral, resistencias de capa fina (NiCr, TaN), puentes de aire, vías al plano de masa y líneas microstrip o coplanares.

**Encapsulado**: chip desnudo (*bare die*) con hilos de *bonding* (añaden inductancia, ≈ 1 nH/mm) o encapsulados QFN y cerámicos.

**Cómo leer una hoja de características** de un amplificador MMIC: ganancia y su planitud, NF, $P_{1dB}$ de salida, OIP3, VSWR de entrada y salida, polarización (tensión y corriente) y rango de frecuencias.

## 2. Analizador de espectro

Muestra la potencia frente a la frecuencia. El clásico es un **receptor superheterodino de barrido**:

Atenuador de entrada → mezclador → filtro de FI (**RBW**) → detector logarítmico → filtro de vídeo (**VBW**) → pantalla. El LO barre en sincronía con el eje horizontal.

- **RBW** (*resolution bandwidth*): separa dos tonos próximos. Con menos RBW se resuelve mejor y baja el ruido, pero el barrido es más lento ($T_{barrido} \propto \text{span}/RBW^2$).
- **Suelo de ruido (DANL)**: $\approx -174 + 10\log(RBW) + NF_{SA}$ dBm. Reducir la RBW 10 veces baja el suelo 10 dB.
- **VBW**: promedia la traza y la suaviza sin cambiar el suelo medio.
- **Atenuador de entrada**: evita comprimir el mezclador y que el propio analizador genere distorsión. Si un producto cambia de nivel al cambiar la atenuación, lo está creando el analizador.
- **Medidas típicas**: armónicos, IP3 (dos tonos), potencia en canal, ruido de fase de osciladores, espurios. Los modernos combinan barrido con FFT.

## 3. Analizador de redes vectorial (VNA)

Mide los parámetros S en módulo y fase.

- **Bloques**: fuente de barrido, *test set* con acopladores direccionales o puentes que muestrean la onda incidente $a_1$, la reflejada $b_1$ y la transmitida $b_2$, y receptores que calculan cocientes: $S_{11} = b_1/a_1$ y $S_{21} = b_2/a_1$. Para $S_{22}$ y $S_{12}$ la fuente se conmuta al puerto 2.
- **Errores sistemáticos** (modelo de 12 términos): directividad, adaptación de fuente, *tracking* de reflexión, adaptación de carga, *tracking* de transmisión y aislamiento, en sentido directo e inverso.
- **Calibración**: se miden patrones conocidos y se corrigen las medidas.
  - **SOLT** (*Short, Open, Load, Thru*): la más común en coaxial.
  - **TRL** (*Thru, Reflect, Line*): en placa o en oblea, no necesita una carga perfecta.
  - La calibración fija los **planos de referencia**. Para quitar *fixtures* se usa la extensión de puerto o el *de-embedding*.
- **Presentación**: carta de Smith, módulo en dB, fase, retardo de grupo, VSWR. La transformada inversa da el dominio temporal (localizar discontinuidades).

## 4. Medidor de figura de ruido (método del factor Y)

Se conecta a la entrada una **fuente de ruido** con dos estados: encendida (temperatura $T_h$) y apagada ($T_c \approx T_0$). Su **ENR** es $\;ENR = \dfrac{T_h - T_0}{T_0}$ (en dB, típicamente 5–15 dB).

Se miden las potencias de salida y se calcula $Y = N_{on}/N_{off}$:
$$T_e = \frac{T_h - Y\,T_c}{Y - 1}, \qquad F = \frac{ENR}{Y - 1}\ \ (\text{con } T_c = T_0)$$
En dB: $\;NF = ENR_{dB} - 10\log_{10}(Y - 1)$.

- **Corrección de segunda etapa**: el propio medidor tiene ruido. Con Friis se despeja el dispositivo: $F_1 = F_{tot} - \dfrac{F_2 - 1}{G_1}$. Por eso el medidor calibra primero sin el dispositivo.
- **Alternativa**: método de fuente fría, con un VNA o analizador de espectro y la ganancia conocida.

## 5. Ejercicios

**E1.** Un analizador de espectro con NF = 25 dB mide con RBW = 10 kHz. ¿Qué suelo de ruido muestra? ¿Y con RBW = 100 Hz?

**E2.** Con una fuente de ENR = 15 dB, el factor Y medido es 6 dB. Calcula la NF y $T_e$.

**E3.** Un amplificador de G = 20 dB medido con un receptor de NF = 10 dB da una NF total de 3,2 dB. ¿Cuál es la NF real del amplificador?

**E4.** ¿Por qué no se puede medir bien $S_{21}$ de un amplificador de 40 dB de ganancia sin atenuar a la salida? ¿Qué harías?

### Soluciones

**E1.** $-174 + 40 + 25 = -109$ dBm. Con 100 Hz: $-174 + 20 + 25 = -129$ dBm (20 dB menos, a cambio de barrer unas 10 000 veces más lento).

**E2.** $ENR = 31{,}6$ e $Y = 3{,}98$ → $F = 31{,}6/2{,}98 = 10{,}6$ → $NF = 10{,}3$ dB; $T_e = (F-1)\cdot290 = 2785$ K.

**E3.** $F_{tot} = 2{,}09$, $F_2 = 10$, $G_1 = 100$ → $F_1 = 2{,}09 - 9/100 = 2{,}0$ → $NF = 3{,}0$ dB.

**E4.** La potencia de salida podría comprimir o dañar el receptor del puerto 2. Hay que bajar la potencia de la fuente o poner un atenuador a la salida e incluirlo en la calibración.
