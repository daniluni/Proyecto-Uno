# Verde - Gestor de Finanzas Personales

**Verde** es una aplicación web interactiva y de estética premium diseñada para ayudarte a tomar el control absoluto de tus finanzas personales. Utiliza un diseño moderno con tonos inspirados en el dinero, efectos visuales de glassmorphism y micro-animaciones fluidas para ofrecer una experiencia de usuario de primer nivel.

Esta aplicación es 100% del lado del cliente, lo que garantiza que tus datos financieros permanezcan privados en tu dispositivo mediante almacenamiento local.

---

## 🚀 Características Principales

1. **Dashboard Financiero Integrado**:
   - Resumen del Balance Total, Ingresos y Gastos del mes con indicadores de salud financiera.
   - **Gráfico de Torta / Doughnut**: Visualización de la distribución porcentual de tus gastos del mes por categorías.
   - **Gráfico de Barras**: Comparación mensual de Ingresos vs. Gastos para identificar tendencias de ahorro en los últimos 6 meses.
   - Acceso rápido a las últimas 5 transacciones.

2. **Historial Completo de Transacciones**:
   - Registro de Ingresos y Gastos con detalles (monto, fecha, descripción, categoría y notas).
   - Filtros avanzados en tiempo real: búsqueda por texto, filtrado por tipo (Ingreso/Gasto) y por categoría.
   - Ordenación flexible por fecha y por monto (ascendente o descendente).
   - Herramientas para **Editar** y **Eliminar** transacciones.

3. **Presupuestos Mensuales**:
   - Establece límites máximos de gasto mensual para categorías específicas (Alimentación, Transporte, Servicios, etc.).
   - Barra de progreso dinámica que cambia de color según el nivel de consumo:
     - **Verde**: Consumo inferior al 80%.
     - **Naranja**: Consumo entre el 80% y 100% (Advertencia).
     - **Rojo**: Presupuesto excedido (Peligro).

4. **Metas de Ahorro**:
   - Define objetivos financieros a mediano y largo plazo (Ej: Fondo de Emergencia, Comprar un auto, Viaje).
   - Barra de progreso visual con porcentaje de cumplimiento de metas.
   - **Aportación Inteligente**: Permite añadir dinero a tus metas directamente y cuenta con una opción opcional para restar automáticamente ese monto de tu balance general, registrando un gasto de tipo "Ahorro".

5. **Gestión de Respaldos (Exportar/Importar)**:
   - **Exportar**: Descarga todo tu estado financiero en un archivo estructurado `.json` para respaldo.
   - **Importar**: Carga un archivo JSON de respaldo para migrar tus datos a otro dispositivo o navegador.
   - **Restablecer**: Borra todos tus datos personalizados y carga la base de datos de demostración en un solo click.

---

## 🛠️ Tecnologías Utilizadas

- **Estructura**: HTML5 Semántico.
- **Diseño e Interfaz**: CSS3 con Variables Personalizadas (Diseño responsivo, Grid/Flexbox, Glassmorphism, Micro-animaciones).
- **Lógica de Negocio**: Vanilla JavaScript ES6+ (Separado de la presentación).
- **Persistencia**: Web Storage API (`localStorage`).
- **Gráficos**: [Chart.js](https://www.chartjs.org/) (vía CDN).
- **Iconografía**: [Lucide Icons](https://lucide.dev/) (vía CDN).
- **Tipografía**: Google Fonts (Plus Jakarta Sans y Outfit).

---

## 📂 Estructura de Archivos

```text
Proyecto-Uno/
│
├── index.html   # Estructura principal y contenedores SPA de la aplicación.
├── style.css    # Diseño de la interfaz, paleta de colores y adaptabilidad responsiva.
├── app.js       # Control de estado de la aplicación, eventos y gráficos.
└── README.md    # Este archivo con instrucciones de uso y documentación.
```

---

## 💻 Instrucciones de Instalación y Ejecución

Al ser una aplicación web de JavaScript vanilla y sin dependencias del servidor, **no requiere ningún proceso de instalación complejo**.

### Opción 1: Apertura Directa (Rápida)
1. Descarga o clona este repositorio en tu ordenador.
2. Haz doble click sobre el archivo `index.html` para abrirlo en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari).

### Opción 2: Servidor Local (Recomendado para desarrollo)
Para disfrutar de la mejor experiencia de carga y compatibilidad de archivos de respaldo locales:
1. Abre el directorio del proyecto en Visual Studio Code.
2. Inicia la extensión **Live Server** (o similar) haciendo click en "Go Live" en la barra inferior.
3. La aplicación se abrirá automáticamente en `http://127.0.5.1:5500`.

---

## 📖 Guía de Uso Paso a Paso

### 1. Gestión de Transacciones
- En el panel lateral o superior, haz click en **Transacciones** o presiona el botón **Nueva Transacción** en la cabecera.
- Completa el formulario del modal:
  - Selecciona si es un **Gasto** o un **Ingreso**.
  - Digita el monto, la descripción, la fecha y la categoría correspondiente.
  - Opcionalmente añade notas en el campo de texto inferior.
- Guarda para registrar. El balance del dashboard y los gráficos se actualizarán al instante.

### 2. Establecer un Presupuesto de Control
- Navega a la vista de **Presupuestos**.
- Presiona **Configurar Presupuesto**.
- Selecciona una categoría (ej: Alimentación) y escribe el monto límite mensual que no deseas superar.
- A medida que añadas gastos en esa categoría durante el mes actual, la barra se irá llenando e indicará el nivel de riesgo mediante colores interactivos.

### 3. Ahorrar para una Meta
- Navega a **Metas de Ahorro**.
- Haz click en **Nueva Meta**, especifica el nombre del objetivo, el monto final deseado y (opcionalmente) un ahorro inicial o fecha límite.
- Para ingresar ahorros acumulados, pulsa en **Aportar Fondos** dentro de la tarjeta de la meta correspondiente.
- Si dejas marcada la casilla *"Deducir del balance general"*, la aplicación creará automáticamente una transacción de gasto bajo la categoría "Ahorro", sincronizando tus ahorros con tu flujo de caja real.