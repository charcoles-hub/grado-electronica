# HIPS · Ejercicios del Chapter 1 y control de práctica del Chapter 2

> Redactado por Claude a partir de los contenidos de la *Course Organization* 2026 (capítulos 1 y 2). Cubre los huecos «ejercicios del Chapter 1» y «parciales de otros años» (**no son exámenes oficiales**; los controles anteriores solo están en Atenea). Haz el control de práctica en 2 h 30 min.

## Parte A · Ejercicios del Chapter 1

**A1 · Frecuencia de muestreo y reloj.** Un ADC entrega 100 MS/s a una FPGA que funciona a 200 MHz. Hay que filtrar con un FIR de 64 coeficientes. ¿Cuántos ciclos de reloj hay por muestra y cuántos multiplicadores necesitas como mínimo?

**A2 · Ruta crítica.** Un multiplicador tarda 4 ns y un sumador 2 ns. Calcula la frecuencia máxima de un FIR de 4 coeficientes en **forma directa** (sumas en cadena) y en **forma transpuesta**. ¿Qué pasa al añadir un registro de *pipeline* tras cada multiplicador en la forma directa?

**A3 · Cuantificación.** ¿Qué SQNR ideal tiene un ADC de 12 bits con una senoide de fondo de escala? ¿Cuántos bits harían falta para 90 dB?

**A4 · Paralelismo e *interleaving*.** Una unidad de proceso solo llega a 150 MHz y la señal llega a 300 MS/s. Propón una solución y su coste.

**A5 · Retiming.** Explica la diferencia entre *pipelining* y *retiming*. ¿Cuál cambia la latencia?

**A6 · Multirate.** Una señal muestreada a 100 MS/s solo tiene contenido útil hasta 5 MHz. ¿Qué factor de diezmado máximo puedes aplicar, y qué hay que hacer antes de diezmar?

### Soluciones A

**A1.** 2 ciclos por muestra. Hacen falta 64 MACs por muestra, así que con multiplexado ×2 se necesitan **32 multiplicadores**.

**A2.** Forma directa: $T_m + 3T_a = 10$ ns → 100 MHz. Transpuesta: $T_m + T_a = 6$ ns → 166 MHz. Con *pipeline* tras los multiplicadores, la ruta crítica de la directa queda en la cadena de sumas ($3T_a = 6$ ns) → 166 MHz, con un ciclo más de latencia.

**A3.** $SQNR = 6{,}02B + 1{,}76 = 74$ dB. Para 90 dB: $B \ge (90 - 1{,}76)/6{,}02 = 14{,}7$ → **15 bits**.

**A4.** Dos unidades en paralelo (muestras pares e impares), cada una a 150 MHz → 300 MS/s. Se duplica el área (*interleaving*/paralelismo frente a velocidad).

**A5.** *Pipelining* añade registros en un camino de corte (cambia la latencia y sube la frecuencia). *Retiming* mueve registros que ya existían a través de la lógica sin cambiar la función ni la latencia de entrada a salida, para equilibrar las rutas.

**A6.** Nueva frecuencia mínima $\ge 2\cdot 5 = 10$ MS/s → $M_{max} = 10$. Antes hay que filtrar paso bajo (antialiasing) a $f_s/(2M)$; mejor con un filtro polifásico o un CIC + compensador.

## Parte B · Control de práctica (Chapter 2)

**B1 · Punto fijo (15 %).** a) Representa −0,375 en Q1.7 (8 bits en complemento a 2) y da su valor en hexadecimal. b) ¿Qué formato tiene el producto de dos números Q1.7? c) ¿Qué caso da desbordamiento al volver a Q1.7?

**B2 · IEEE 754 (10 %).** Codifica −6,25 en precisión simple.

**B3 · Multiplicadores (10 %).** ¿Cuántos productos parciales genera un multiplicador de 16×16 bits con Booth radix-4? Compáralo con el multiplicador paralelo-paralelo básico.

**B4 · DDS (15 %).** Acumulador de fase de 32 bits y reloj de 100 MHz. a) Resolución en frecuencia. b) Palabra de sintonía (FTW) para 1 MHz. c) Frecuencia máxima útil.

**B5 · CORDIC (20 %).** Modo rotación, punto de partida $(x_0, y_0) = (1, 0)$ y ángulo objetivo 30°. Haz las tres primeras iteraciones y da el ángulo acumulado, el vector y el módulo. ¿Qué factor de corrección tiene el CORDIC con muchas iteraciones?

**B6 · FIR (10 %).** ¿Cuántos multiplicadores necesita un FIR simétrico de 31 coeficientes en forma directa aprovechando la simetría?

**B7 · CIC (10 %).** CIC de diezmado con $N = 3$ etapas, $R = 16$ y $M = 1$. Ganancia en DC y bits que crecen. Si la entrada es de 12 bits, ¿qué ancho de registro hace falta?

**B8 · FFT (10 %).** Número de mariposas de una FFT radix-2 de 1024 puntos y comparación con la DFT directa.

### Soluciones B

**B1.** a) $0{,}375 = 0{,}0110000_2$ → al negarlo, $1{,}1010000_2$ = **0xD0**. b) Q2.14 (16 bits). c) $(-1)\times(-1) = +1$, que no cabe en Q1.7 (rango $[-1,\ 1-2^{-7}]$): hay que saturar.

**B2.** $-6{,}25 = -110{,}01_2 = -1{,}1001\times2^2$ → signo 1, exponente $127+2 = 129 = 10000001_2$, mantisa $1001000\ldots0$ → **0xC0C80000**.

**B3.** Booth radix-4: $16/2 = 8$ productos parciales, frente a 16 del básico. Menos sumadores y menos retardo, a cambio de lógica de codificación.

**B4.** a) $\Delta f = 100\text{M}/2^{32} = 0{,}0233$ Hz. b) $FTW = 1\text{M}\cdot2^{32}/100\text{M} = 42\,949\,673$ = 0x028F5C29. c) $f_{clk}/2 = 50$ MHz en teoría; en la práctica, ≈ 40 % de $f_{clk}$ por el filtro de reconstrucción.

**B5.** Ángulos elementales $\arctan 2^{-i}$: 45°, 26,565°, 14,036°…
- $i=0$, $z=30>0$ → $d=+1$: $(x,y) = (1, 1)$, $z = -15°$.
- $i=1$, $z<0$ → $d=-1$: $x = 1 + 0{,}5 = 1{,}5$, $y = 1 - 0{,}5 = 0{,}5$, $z = 11{,}565°$.
- $i=2$, $z>0$ → $d=+1$: $x = 1{,}5 - 0{,}125 = 1{,}375$, $y = 0{,}5 + 0{,}375 = 0{,}875$, $z = -2{,}47°$.

Ángulo acumulado $= 45 - 26{,}565 + 14{,}036 = 32{,}47°$ (se comprueba: $\arctan(0{,}875/1{,}375) = 32{,}47°$). Módulo $= 1{,}630 = \sqrt{2}\cdot\sqrt{1{,}25}\cdot\sqrt{1{,}0625}$. Con muchas iteraciones, la ganancia tiende a $A_n \approx 1{,}6468$ y se corrige con $K = 1/A_n \approx 0{,}6073$.

**B6.** 16 multiplicadores (15 pares con pre-sumador + el central).

**B7.** Ganancia $(RM)^N = 16^3 = 4096$ → crecen $N\log_2(RM) = 12$ bits → registros de **24 bits**.

**B8.** $\frac{N}{2}\log_2N = 512\cdot 10 = 5120$ mariposas (≈ 5120 productos complejos), frente a $N^2 \approx 10^6$ de la DFT directa: unas 200 veces menos.
