# CIAF · Tema 6: ruido, detectores, mezcladores y osciladores

> Apunte de apoyo redactado por Claude siguiendo el apartado 6 de la guía docente y Pozar (*Microwave Engineering*, cap. 10, 12 y 13). Cubre los huecos «ruido y margen dinámico (Friis), detectores y mezcladores» y «teoría de osciladores». La parte de amplificadores ya la tienes en MW amplifiers v2 y Teoría amplificadores.

## 1. Ruido en sistemas de microondas

- **Potencia de ruido disponible** de una resistencia a temperatura $T$ en un ancho de banda $B$: $\;P_n = kTB$. A $T_0 = 290$ K: $kT_0 = -174$ dBm/Hz.
- **Temperatura equivalente de ruido** $T_e$: la temperatura de una resistencia a la entrada que, en un dispositivo sin ruido, daría el mismo ruido de salida. A la salida: $N_o = kGB(T_{fuente} + T_e)$.
- **Factor de ruido** (definido con la fuente a $T_0$): $\;F = 1 + \dfrac{T_e}{T_0}$, $\;NF = 10\log F$.
- **Atenuador o línea con pérdidas $L$** a temperatura física $T$: $G = 1/L$, $T_e = (L-1)T$. A $T_0$: $F = L$. Un cable de 2 dB delante del LNA suma 2 dB a la NF.

**Cascada (Friis)**
$$F = F_1 + \frac{F_2-1}{G_1} + \frac{F_3-1}{G_1G_2} + \cdots \qquad T_e = T_{e1} + \frac{T_{e2}}{G_1} + \frac{T_{e3}}{G_1G_2} + \cdots$$
Conviene un LNA con poca NF y mucha ganancia al principio de la cadena.

**Sensibilidad** (señal mínima detectable para una $SNR_{min}$ dada):
$$S_{min}\,[\text{dBm}] = -174 + 10\log B + NF + SNR_{min}$$

**Margen dinámico**
- Lineal: desde el suelo de ruido hasta el punto de compresión a 1 dB.
- **SFDR** (libre de espurios): $\;SFDR = \dfrac{2}{3}\left(IIP3 - N_{floor}\right)$, con $N_{floor} = -174 + 10\log B + NF$ (en dBm, referido a la entrada).

## 2. Detectores

- **Diodo detector** (Schottky): para señales pequeñas trabaja en la **zona cuadrática**, donde la corriente o tensión de salida en DC es proporcional a la potencia de entrada. Para señales grandes pasa a la zona lineal (detector de envolvente).
- **Sensibilidad en corriente**: $\beta_i = \Delta I_0/P_{in}$ (A/W). La de tensión, $\beta_v$ (V/W), depende de la resistencia de vídeo.
- La zona cuadrática llega hasta unos −20 dBm. Se usan en medidores de potencia y control automático de ganancia.

## 3. Mezcladores

Un mezclador multiplica la señal de RF por el oscilador local (LO) mediante un elemento no lineal (diodo o transistor):
$$f_{IF} = |f_{RF} - f_{LO}| \quad (\text{y también aparece } f_{RF}+f_{LO})$$

- **Frecuencia imagen**: la otra frecuencia que también cae en la FI, $f_{IM} = 2f_{LO} - f_{RF}$, al otro lado del LO. Hay que eliminarla con un filtro antes del mezclador o con un mezclador de rechazo de imagen.
- **Pérdidas de conversión**: $L_c = 10\log(P_{RF}/P_{IF})$; en mezcladores de diodo típicamente 5–8 dB. En mezcladores activos hay ganancia de conversión.
- **Figura de ruido**: la NF en SSB es unos 3 dB mayor que en DSB (en SSB el ruido de la banda imagen también entra y no hay señal).

**Tipos**
- **Simple** (un diodo): sencillo, pero con poco aislamiento entre LO y RF.
- **Equilibrado simple** (dos diodos + híbrido de 90° o de 180°): mejor aislamiento LO–RF, rechazo del ruido AM del LO y de algunos armónicos.
- **Doblemente equilibrado** (anillo de 4 diodos + dos *baluns*): aísla todos los puertos y cancela los armónicos pares; es el más usado.
- **De rechazo de imagen**: dos mezcladores con LO en cuadratura y un híbrido de 90° en la FI. Separa la banda deseada de la imagen sin filtro.

## 4. Osciladores

**Oscilador de resistencia negativa (un puerto)**: un dispositivo con impedancia $Z_{in}(A,\omega) = R_{in} + jX_{in}$, con $R_{in} < 0$, cargado con $Z_L = R_L + jX_L$.
- **Condición de oscilación**: $\;R_{in} + R_L = 0$ y $X_{in} + X_L = 0$.
- **Arranque**: hace falta $R_{in} + R_L < 0$ con señal pequeña. Al crecer la amplitud, $|R_{in}|$ disminuye hasta que se cumple la igualdad. Regla habitual: $R_L = -R_{in}/3$ y $X_L = -X_{in}$.
- Dispositivos: diodos Gunn e IMPATT, o un transistor con realimentación.

**Oscilador con transistor (dos puertos)**: se usa un transistor **inestable** ($K < 1$, o se añade realimentación, por ejemplo una inductancia en la base o puerta en configuración de base común).
1. Se elige la red de terminación $\Gamma_T$ de forma que $|\Gamma_{in}| > 1$, con $\Gamma_{in} = S_{11} + \dfrac{S_{12}S_{21}\Gamma_T}{1-S_{22}\Gamma_T}$.
2. Se elige la carga $\Gamma_L$ que cumple la condición de oscilación $\Gamma_{in}\Gamma_L = 1$ (entonces también $\Gamma_{out}\Gamma_T = 1$), con el criterio de arranque de antes.

**Otros osciladores**
- **Colpitts y Hartley** (baja frecuencia): $f_0 = \dfrac{1}{2\pi\sqrt{L\,\frac{C_1C_2}{C_1+C_2}}}$ (Colpitts).
- **DRO**: el resonador dieléctrico da una Q muy alta y, por tanto, poco ruido de fase.
- **VCO**: un varactor sintoniza la frecuencia.
- **Ruido de fase**: se especifica en dBc/Hz a un *offset*; mejora con resonadores de Q alta (modelo de Leeson).

## 5. Ejemplos y ejercicios

**E1 · Friis.** Cadena: LNA (G = 15 dB, NF = 1,5 dB) → mezclador (pérdidas de conversión 7 dB, NF = 10 dB) → amplificador de FI (G = 20 dB, NF = 3 dB). Calcula la NF total.

**E2 · Sensibilidad.** Receptor con B = 1 MHz, NF = 3 dB y $SNR_{min}$ = 10 dB.

**E3 · Cable.** ¿Qué $T_e$ tiene un cable de 2 dB a 290 K? ¿Y qué NF?

**E4 · SFDR.** Receptor con B = 1 MHz, NF = 5 dB e IIP3 = 0 dBm.

**E5 · Imagen.** $f_{RF}$ = 2,4 GHz y $f_{IF}$ = 100 MHz con LO por debajo. ¿$f_{LO}$ y frecuencia imagen?

**E6 · Resistencia negativa.** Un dispositivo tiene $Z_{in} = -30 + j20\ \Omega$ a $f_0$. Diseña la carga.

**E7 · Colpitts.** $L = 10$ nH y $C_1 = C_2 = 2$ pF. Calcula la frecuencia.

### Soluciones

**E1.** $F = 1{,}413 + \dfrac{10-1}{31{,}6} + \dfrac{1{,}995-1}{31{,}6\cdot0{,}2} = 1{,}413 + 0{,}285 + 0{,}157 = 1{,}855$ → $NF = 2{,}68$ dB. El mezclador ruidoso apenas pesa gracias a la ganancia del LNA.

**E2.** $S_{min} = -174 + 60 + 3 + 10 = -101$ dBm.

**E3.** $L = 1{,}585$ → $T_e = 0{,}585\cdot290 = 170$ K; $NF = 2$ dB.

**E4.** $N_{floor} = -174 + 60 + 5 = -109$ dBm → $SFDR = \frac{2}{3}(0 + 109) = 72{,}7$ dB.

**E5.** $f_{LO} = 2{,}3$ GHz y $f_{IM} = 2{,}2$ GHz.

**E6.** $R_L = 30/3 = 10\ \Omega$ y $X_L = -20\ \Omega$ → $Z_L = 10 - j20\ \Omega$ (una capacidad en serie). Arranca porque $-30 + 10 < 0$.

**E7.** $C_{serie} = 1$ pF → $f_0 = \dfrac{1}{2\pi\sqrt{10^{-8}\cdot10^{-12}}} = 1{,}59$ GHz.
