# CIAF · Tema 5: circuitos pasivos de microondas

> Apunte de apoyo redactado por Claude siguiendo el apartado 5 de la guía docente y la bibliografía (Pozar, *Microwave Engineering*, cap. 4, 7 y 8; Bará, *Circuitos de microondas con líneas de transmisión*, Edicions UPC, de acceso abierto en [UPCommons](http://hdl.handle.net/2099.3/36161)). Cubre el hueco «teoría de circuitos pasivos: atenuadores, filtros, divisores e híbridos». Complementa a QUCS circuits v3 y a Líneas acopladas.

Notación: puertos de referencia $Z_0$ (normalmente 50 Ω), $[S]$ matriz de dispersión.

## 1. Propiedades útiles de $[S]$

- **Recíproco** (sin ferritas ni activos): $[S] = [S]^T$.
- **Sin pérdidas**: $[S]^H[S] = [I]$. Cada columna tiene norma 1 y dos columnas distintas son ortogonales.
- **Adaptado en el puerto $i$**: $S_{ii} = 0$.
- En dB: pérdidas de retorno $RL = -20\log|S_{11}|$ y pérdidas de inserción $IL = -20\log|S_{21}|$.

## 2. Redes de dos puertos

### Atenuadores resistivos adaptados

Sea $K = 10^{A/20}$ (relación de tensiones para una atenuación $A$ en dB).

| Topología | Resistencias serie | Resistencia(s) paralelo |
|---|---|---|
| **T** | $R_1 = Z_0\dfrac{K-1}{K+1}$ (dos) | $R_2 = Z_0\dfrac{2K}{K^2-1}$ |
| **Π** | $R_s = Z_0\dfrac{K^2-1}{2K}$ | $R_p = Z_0\dfrac{K+1}{K-1}$ (dos) |

Ejemplo con 3 dB y 50 Ω: T → 8,55 Ω y 141,9 Ω; Π → 292,4 Ω y 17,6 Ω. Sirven para mejorar la adaptación (un atenuador de $A$ dB mejora las pérdidas de retorno de lo que haya detrás en $2A$ dB) y para ajustar niveles.

### Filtros (método de pérdidas de inserción)

Se especifica la **relación de pérdidas de potencia** $P_{LR} = \dfrac{1}{1-|\Gamma(\omega)|^2}$:
- **Butterworth** (máximamente plano): $P_{LR} = 1 + k^2(\omega/\omega_c)^{2N}$.
- **Chebyshev** (rizado constante en la banda): $P_{LR} = 1 + k^2T_N^2(\omega/\omega_c)$; cae más rápido fuera de banda.
- **Orden de un Butterworth** (3 dB en $\omega_c$) para atenuar $A$ dB a $\omega$: $\;N \ge \dfrac{\log_{10}(10^{A/10}-1)}{2\log_{10}(\omega/\omega_c)}$.

**Prototipo paso bajo** normalizado ($g_0 = g_{N+1} = 1$). Butterworth: $g_k = 2\sin\dfrac{(2k-1)\pi}{2N}$; por ejemplo, $N=3$ da 1, 2, 1. En escalera alternan C en paralelo y L en serie.

**Escalado a $R_0$ y $\omega_c$**: $\;L = \dfrac{g_kR_0}{\omega_c}$, $\;C = \dfrac{g_k}{R_0\omega_c}$.

**Transformaciones** (con $\Delta = (\omega_2-\omega_1)/\omega_0$):

| Del prototipo | Paso alto | Paso banda |
|---|---|---|
| L serie $g_k$ | C serie $= \dfrac{1}{R_0\omega_cg_k}$ | L–C serie: $L = \dfrac{g_kR_0}{\omega_0\Delta}$, $C = \dfrac{\Delta}{\omega_0g_kR_0}$ |
| C paralelo $g_k$ | L paralelo $= \dfrac{R_0}{\omega_cg_k}$ | L∥C: $L = \dfrac{\Delta R_0}{\omega_0g_k}$, $C = \dfrac{g_k}{\omega_0\Delta R_0}$ |

**Paso a líneas de transmisión**
- **Richards**: $\Omega = \tan\beta\ell$. Una L se convierte en un *stub* en cortocircuito de impedancia $L$ (normalizada) y una C en un *stub* en abierto de admitancia $C$, los dos de $\lambda/8$ a $\omega_c$. La respuesta se repite cada $4\omega_c$.
- **Identidades de Kuroda**: insertan líneas unitarias ($\lambda/8$) para convertir *stubs* serie en *stubs* paralelo realizables en microstrip.
- **Salto de impedancia** (*stepped impedance*): un tramo corto de $Z_h$ alta se comporta como una inductancia ($\beta\ell = LR_0/Z_h$) y uno de $Z_l$ baja como una capacidad ($\beta\ell = CZ_l/R_0$).

## 3. Redes de tres puertos (divisores)

**Teorema**: una red de 3 puertos no puede ser a la vez **sin pérdidas, recíproca y adaptada** en todos los puertos.

| Divisor | Cómo es | Propiedades |
|---|---|---|
| **Unión en T sin pérdidas** | $\dfrac{1}{Z_2} + \dfrac{1}{Z_3} = \dfrac{1}{Z_0}$ | adaptado solo en la entrada; salidas sin aislamiento |
| **Resistivo** | tres resistencias de $Z_0/3$ en estrella | $[S] = \frac{1}{2}\begin{bmatrix}0&1&1\\1&0&1\\1&1&0\end{bmatrix}$; −6 dB a cada salida (se pierde la mitad de la potencia); sin aislamiento; banda ancha |
| **Wilkinson** (división igual) | dos líneas de $\lambda/4$ de $\sqrt{2}Z_0$ y una resistencia $2Z_0$ entre salidas | $[S] = \frac{-j}{\sqrt2}\begin{bmatrix}0&1&1\\1&0&0\\1&0&0\end{bmatrix}$; −3 dB a cada salida; todo adaptado y salidas aisladas; banda estrecha |

- **Funcionamiento del Wilkinson**: con señal en el puerto 1, las salidas están en fase y la resistencia no disipa. Lo que vuelve por una salida se cancela en la otra y se disipa en $R$: de ahí el aislamiento. Se analiza con modos par e impar.
- **Wilkinson desigual** ($K^2 = P_3/P_2$): $Z_{03} = Z_0\sqrt{\dfrac{1+K^2}{K^3}}$, $Z_{02} = K^2Z_{03}$ y $R = Z_0\left(K + \dfrac{1}{K}\right)$.
- **Circulador**: 3 puertos, adaptado, sin pérdidas y **no recíproco** (ferrita), $[S] = \begin{bmatrix}0&0&1\\1&0&0\\0&1&0\end{bmatrix}$ (1→2→3→1). Con una carga adaptada en el puerto 3 es un **aislador**.

## 4. Redes de cuatro puertos (acopladores e híbridos)

**Acoplador direccional** (convenio de Pozar: 1 entrada, 2 transmitido, 3 acoplado, 4 aislado):
- Acoplamiento $C = -20\log|S_{31}|$
- Directividad $D = 20\log\dfrac{|S_{31}|}{|S_{41}|}$
- Aislamiento $I = -20\log|S_{41}| = C + D$
- Pérdidas de inserción $-20\log|S_{21}|$

Si es ideal y sin pérdidas: $|S_{21}|^2 + |S_{31}|^2 = 1$.

| Tipo | Cómo se construye | Salidas (entrando por 1) |
|---|---|---|
| **Híbrido de 90° (*branch-line*)** | 4 tramos de $\lambda/4$: dos de $Z_0/\sqrt2$ (35,4 Ω) y dos de $Z_0$ | −3 dB en los puertos 2 y 3 con 90° de diferencia; el 4 aislado |
| **Híbrido de 180° (*rat-race*)** | anillo de $1{,}5\lambda$ de impedancia $\sqrt2Z_0$ (70,7 Ω) | entrando por Σ: salidas en fase; entrando por Δ: en contrafase |
| **Líneas acopladas** | dos líneas paralelas de $\lambda/4$ | acoplamiento débil (10–20 dB), el puerto acoplado está en el lado de la entrada |
| **Lange** | líneas interdigitadas | acoplamiento fuerte (3 dB) en banda ancha |

**Branch-line**: $[S] = \dfrac{-1}{\sqrt2}\begin{bmatrix}0&j&1&0\\j&0&0&1\\1&0&0&j\\0&1&j&0\end{bmatrix}$

**Líneas acopladas** (análisis par/impar, con $C$ el acoplamiento en tensión, $C = 10^{-C_{dB}/20}$):
$$Z_0 = \sqrt{Z_{0e}Z_{0o}}, \qquad C = \frac{Z_{0e}-Z_{0o}}{Z_{0e}+Z_{0o}}, \qquad Z_{0e} = Z_0\sqrt{\frac{1+C}{1-C}}, \quad Z_{0o} = Z_0\sqrt{\frac{1-C}{1+C}}$$

**Aplicaciones**: monitorizar potencia (acoplador de 20 dB), mezcladores equilibrados (híbridos), amplificadores balanceados (dos híbridos de 90°), medir $\Gamma$ (reflectómetro con dos acopladores).

## 5. Ejemplos y ejercicios

**E1.** Diseña un Wilkinson igual a 2 GHz en 50 Ω.

**E2.** Diseña un acoplador de líneas acopladas de 10 dB en 50 Ω.

**E3.** Un paso bajo Butterworth en 50 Ω con $f_c = 1$ GHz debe atenuar 20 dB a 2 GHz. Calcula el orden y diseña uno de orden 3 (empieza con C en paralelo).

**E4.** Diseña una unión en T sin pérdidas que reparta 2:1 la potencia desde una línea de 50 Ω.

**E5.** Un acoplador tiene $C = 20$ dB y $D = 25$ dB. ¿Cuál es el aislamiento? Si en el puerto 1 entran 10 dBm, ¿qué potencia sale por los puertos 3 y 4?

**E6.** Comprueba que el divisor resistivo no es sin pérdidas a partir de su matriz $[S]$.

### Soluciones

**E1.** Líneas de $\lambda/4$ a 2 GHz con $70{,}7\ \Omega$ y $R = 100\ \Omega$ entre las salidas.

**E2.** $C = 10^{-10/20} = 0{,}316$ → $Z_{0e} = 69{,}4\ \Omega$ y $Z_{0o} = 36{,}0\ \Omega$ (se comprueba: $\sqrt{69{,}4\cdot36{,}0} = 50\ \Omega$). Longitud $\lambda/4$ a la frecuencia central.

**E3.** $N \ge \dfrac{\log_{10}(99)}{2\log_{10}2} = 3{,}3$ → hace falta **orden 4**. Con orden 3 ($g = 1, 2, 1$): $C_1 = C_3 = \dfrac{1}{50\cdot2\pi\cdot10^9} = 3{,}18$ pF y $L_2 = \dfrac{2\cdot50}{2\pi\cdot10^9} = 15{,}9$ nH. Con orden 3 se queda en ≈ 18 dB a 2 GHz.

**E4.** La potencia se reparte en proporción a $1/Z$: con $P_2 = 2P_3$, $Z_2 = 75\ \Omega$ y $Z_3 = 150\ \Omega$ (se comprueba: $1/75 + 1/150 = 1/50$). Para llevarlas a 50 Ω se añaden transformadores $\lambda/4$.

**E5.** $I = 45$ dB. Puerto 3: −10 dBm; puerto 4: −35 dBm.

**E6.** La primera columna es $(0, \tfrac12, \tfrac12)$, de norma $\tfrac{1}{4}+\tfrac{1}{4} = \tfrac{1}{2} \ne 1$: se pierde la mitad de la potencia en las resistencias.
