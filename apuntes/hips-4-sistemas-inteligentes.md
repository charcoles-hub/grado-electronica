# HIPS · Chapter 4: filtros adaptativos y mecanismos de aprendizaje

> Apunte de apoyo redactado por Claude siguiendo el índice del Chapter 4 de la *Course Organization* 2026 (4.1 *Adaptive and non-linear filters*, 4.2 *Fundamentals of learning mechanisms*) y la bibliografía (Woods et al., *FPGA-based Implementation of Signal Processing Systems*; Haykin, *Adaptive Filter Theory*). Cubre el hueco «Chapter 4». Si consigues las transparencias de Atenea, compara la notación.

## 4.1 Filtros adaptativos

Un filtro FIR cuyos coeficientes $\mathbf{w}(n)$ se ajustan solos para minimizar el error $e(n) = d(n) - y(n)$, donde $y(n) = \mathbf{w}^T(n)\,\mathbf{x}(n)$ y $\mathbf{x}(n) = [x(n), x(n-1), \ldots, x(n-N+1)]^T$.

### Arquitecturas (qué se pone en $x$ y en $d$)

| Aplicación | Entrada $x(n)$ | Deseada $d(n)$ | Para qué |
|---|---|---|---|
| Identificación de sistemas | la misma que entra al sistema desconocido | salida del sistema desconocido | modelar un canal o una planta |
| Cancelación de ruido | referencia de ruido correlada con el ruido | señal + ruido | quitar ruido o eco |
| Predicción | señal retrasada $x(n-\Delta)$ | señal actual $x(n)$ | codificación, detección de tonos |
| Modelado inverso (ecualización) | salida del canal | símbolos conocidos (retrasados) | ecualizar un canal |

### Solución óptima (Wiener)

Minimizando $E[e^2(n)]$: $\;\mathbf{w}_{opt} = \mathbf{R}^{-1}\mathbf{p}$, con $\mathbf{R} = E[\mathbf{x}\mathbf{x}^T]$ (autocorrelación) y $\mathbf{p} = E[d\,\mathbf{x}]$ (correlación cruzada). Invertir $\mathbf{R}$ es caro y la estadística cambia, así que se usan algoritmos iterativos.

### LMS (*Least Mean Squares*)

$$\mathbf{w}(n+1) = \mathbf{w}(n) + \mu\, e(n)\, \mathbf{x}(n)$$

- **Coste**: $2N+1$ multiplicaciones por muestra ($N$ del filtro, $N$ de la actualización y 1 para $\mu e$).
- **Estabilidad**: $0 < \mu < \dfrac{2}{\lambda_{max}}$; en la práctica, $0 < \mu < \dfrac{2}{N\sigma_x^2}$ (con $N\sigma_x^2 = \text{tr}(\mathbf{R})$, la potencia total de la entrada al filtro).
- **Compromiso**: con $\mu$ grande converge rápido (constante de tiempo $\tau \approx \frac{1}{2\mu\lambda}$) pero el error final es mayor (desajuste $M \approx \frac{\mu\,\text{tr}(\mathbf{R})}{2}$).
- **NLMS**: $\mu(n) = \dfrac{\tilde\mu}{\epsilon + \|\mathbf{x}(n)\|^2}$, con $0 < \tilde\mu < 2$; no depende de la potencia de la entrada.
- **Variantes para hardware**: *sign-error* ($\text{sgn}(e)$), *sign-data* y *sign-sign*. Cambian multiplicadores por sumas y restas, a cambio de una convergencia más lenta.
- **DLMS (*Delayed LMS*)**: actualiza con $e(n-D)\,\mathbf{x}(n-D)$. Ese retardo permite *pipelining* del lazo de actualización y alcanzar más frecuencia de reloj, pero reduce el $\mu$ máximo estable.

### RLS (*Recursive Least Squares*)

Minimiza $\sum_k \lambda^{n-k}e^2(k)$, con un factor de olvido $0 < \lambda \le 1$ (típico 0,99):

$$\mathbf{k}(n) = \frac{\mathbf{P}(n-1)\mathbf{x}(n)}{\lambda + \mathbf{x}^T(n)\mathbf{P}(n-1)\mathbf{x}(n)}, \quad \xi(n) = d(n) - \mathbf{w}^T(n-1)\mathbf{x}(n)$$
$$\mathbf{w}(n) = \mathbf{w}(n-1) + \mathbf{k}(n)\,\xi(n), \qquad \mathbf{P}(n) = \lambda^{-1}\left[\mathbf{P}(n-1) - \mathbf{k}(n)\mathbf{x}^T(n)\mathbf{P}(n-1)\right]$$

- Converge mucho más rápido que el LMS y no depende de la dispersión de autovalores de $\mathbf{R}$.
- **Coste** $O(N^2)$ por muestra y numéricamente delicado en punto fijo.

**QR-RLS**: en lugar de propagar $\mathbf{P}$, se actualiza la descomposición QR de la matriz de datos con **rotaciones de Givens**.
- Es numéricamente estable y se mapea a un **array sistólico** triangular (Gentleman–Kung).
- Cada celda frontera calcula un ángulo de rotación (CORDIC en modo vectorización) y las celdas internas lo aplican (CORDIC en modo rotación). Es la conexión directa con el CORDIC del Chapter 2.

| | LMS | RLS / QR-RLS |
|---|---|---|
| Coste por muestra | $O(N)$ | $O(N^2)$ |
| Convergencia | lenta, depende de $\mathbf{R}$ | rápida |
| Hardware | MACs, fácil de segmentar (DLMS) | array sistólico con CORDIC |

### Filtros no lineales (mención)

Filtros de Volterra (productos de muestras), filtros de mediana y redes neuronales como filtros no lineales adaptativos.

## 4.2 Mecanismos de aprendizaje

### Neurona y MLP

- **Neurona**: $y = \varphi\left(\sum_i w_ix_i + b\right)$, con una activación $\varphi$: escalón (perceptrón), sigmoide, tanh o ReLU $\max(0,x)$.
- **MLP**: capas de neuronas totalmente conectadas. Una capa de $N_{in}$ entradas y $N_{out}$ salidas necesita $N_{in}N_{out}$ MACs y otros tantos pesos.
- **Entrenamiento**: retropropagación del gradiente, normalmente *offline* (GPU). En la FPGA solo se implementa la **inferencia**.

### Otros modelos

| Modelo | Idea | Coste de inferencia en hardware |
|---|---|---|
| **KNN** | clase mayoritaria entre los $k$ vecinos más cercanos de un conjunto guardado | memoria de todas las muestras + distancias ($L_1$ es más barata que $L_2$) |
| **SVM** | $f(\mathbf{x}) = \text{sgn}\left(\sum_i\alpha_iy_iK(\mathbf{x}_i,\mathbf{x}) + b\right)$; frontera de margen máximo | lineal: un producto escalar; con *kernel*: una evaluación por vector soporte |
| **RBF** | capa oculta $\varphi_j = e^{-\|\mathbf{x}-\mathbf{c}_j\|^2/2\sigma^2}$ y salida lineal | distancias + exponencial (tabla o CORDIC hiperbólico) |
| **SOM** (Kohonen) | mapa de neuronas: gana la más cercana (BMU), y ella y sus vecinas se acercan a $\mathbf{x}$: $\mathbf{w}_i \leftarrow \mathbf{w}_i + \eta\,h(i,\text{BMU})(\mathbf{x}-\mathbf{w}_i)$ | búsqueda del mínimo + actualización; aprendizaje no supervisado |
| **CNN** | capas de convolución + *pooling* + capas densas | dominado por los MACs de las convoluciones |

### CNN y deep learning

- **MACs de una capa convolucional**: $K^2\cdot C_{in}\cdot C_{out}\cdot H_{out}\cdot W_{out}$.
- **Pesos**: $K^2\cdot C_{in}\cdot C_{out}$ (+ $C_{out}$ sesgos).
- *Pooling* (máximo o media) reduce la resolución sin pesos; ReLU es solo un comparador.

### Diseño en lógica programable

- **Cuantificación**: pesos y activaciones a int8 (o binarios y ternarios en BNN). Pierde poca precisión y ahorra DSPs y BRAM.
- **Arquitecturas**: arrays de MACs o sistólicos, *dataflow* (una unidad por capa, en cadena) frente a un motor reutilizado capa a capa; pesos en BRAM/URAM o en DDR.
- **Herramientas**: Vitis AI (DPU de AMD-Xilinx), hls4ml, FINN (redes binarizadas) y HLS en general.
- **Métricas**: latencia, *throughput* (inferencias/s), recursos (DSP, BRAM, LUT) y energía por inferencia.

## Ejemplos y ejercicios

**E1 · LMS a mano.** $N = 2$, $\mu = 0{,}1$, $\mathbf{w}(0) = [0, 0]$. Muestras: $\mathbf{x}(0) = [1, 0]$ con $d(0) = 0{,}5$; $\mathbf{x}(1) = [-1, 1]$ con $d(1) = 0{,}2$. Calcula $\mathbf{w}(2)$.

**E2 · Paso máximo.** Un LMS de 32 coeficientes recibe una señal de potencia 0,5. ¿Qué $\mu$ máximo usarías?

**E3 · Coste.** Compara las multiplicaciones por muestra de LMS y RLS para $N = 32$ (toma $\approx 3N^2$ para RLS).

**E4 · CNN.** Entrada de 32×32×3, 16 filtros de 3×3, *stride* 1 y *padding* «same». Calcula los MACs y los pesos. Si dispones de 64 DSPs a 200 MHz siempre ocupados, ¿cuántas imágenes por segundo procesa esta capa?

**E5 · KNN.** Muestras guardadas: A = (0,0), A = (1,0), B = (3,3), B = (2,3), B = (3,2). Clasifica (2,2) con $k = 3$ y distancia $L_1$.

### Soluciones

**E1.** $n=0$: $y = 0$, $e = 0{,}5$ → $\mathbf{w}(1) = [0{,}05,\ 0]$.
$n=1$: $y = 0{,}05\cdot(-1) = -0{,}05$, $e = 0{,}25$ → $\mathbf{w}(2) = [0{,}05 - 0{,}025,\ 0 + 0{,}025] = [0{,}025,\ 0{,}025]$.

**E2.** $\mu < \dfrac{2}{32\cdot 0{,}5} = 0{,}125$. En la práctica, un orden de magnitud por debajo (≈ 0,01) para tener poco desajuste.

**E3.** LMS: $2\cdot 32 + 1 = 65$. RLS: $\approx 3\cdot 32^2 \approx 3000$ (unas 47 veces más).

**E4.** MACs: $3\cdot 3\cdot 3\cdot 16\cdot 32\cdot 32 = 442\,368$. Pesos: $432 + 16 = 448$ (448 bytes en int8). Ciclos: $442\,368/64 = 6912$ → $34{,}6\ \mu$s → unas 28 900 imágenes/s.

**E5.** Distancias $L_1$ a (2,2): (0,0)→4, (1,0)→3, (3,3)→2, (2,3)→1, (3,2)→1. Los 3 más cercanos son B, B y B → **clase B**.
