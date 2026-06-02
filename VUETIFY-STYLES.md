# Guía Completa de Clases de Utilidad de Vuetify

Vuetify incluye un sistema completo de clases de utilidad CSS que permiten aplicar estilos rápidamente sin escribir CSS personalizado.

---

## 📐 Display

Controla la propiedad `display` de los elementos.

| Clase            | CSS Equivalente         |
| ---------------- | ----------------------- |
| `d-none`         | `display: none`         |
| `d-inline`       | `display: inline`       |
| `d-inline-block` | `display: inline-block` |
| `d-block`        | `display: block`        |
| `d-table`        | `display: table`        |
| `d-table-cell`   | `display: table-cell`   |
| `d-table-row`    | `display: table-row`    |
| `d-flex`         | `display: flex`         |
| `d-inline-flex`  | `display: inline-flex`  |

### Responsive Display

Usa el formato `d-{breakpoint}-{value}`:

```html
<div class="d-none d-md-flex">
  <!-- Oculto en móvil, flex en md y superior -->
</div>
```

**Breakpoints disponibles:**

- `sm` - 600px+
- `md` - 960px+
- `lg` - 1280px+
- `xl` - 1920px+
- `xxl` - 2560px+

---

## 🎯 Flexbox

### Dirección

| Clase                 | Descripción                    |
| --------------------- | ------------------------------ |
| `flex-row`            | Dirección horizontal (default) |
| `flex-row-reverse`    | Horizontal inverso             |
| `flex-column`         | Dirección vertical             |
| `flex-column-reverse` | Vertical inverso               |

### Justify Content (Eje Principal)

| Clase                   | CSS Equivalente                  |
| ----------------------- | -------------------------------- |
| `justify-start`         | `justify-content: flex-start`    |
| `justify-end`           | `justify-content: flex-end`      |
| `justify-center`        | `justify-content: center`        |
| `justify-space-between` | `justify-content: space-between` |
| `justify-space-around`  | `justify-content: space-around`  |
| `justify-space-evenly`  | `justify-content: space-evenly`  |

### Align Items (Eje Cruzado)

| Clase            | CSS Equivalente           |
| ---------------- | ------------------------- |
| `align-start`    | `align-items: flex-start` |
| `align-end`      | `align-items: flex-end`   |
| `align-center`   | `align-items: center`     |
| `align-baseline` | `align-items: baseline`   |
| `align-stretch`  | `align-items: stretch`    |

### Align Self (Individual)

| Clase                 | CSS Equivalente          |
| --------------------- | ------------------------ |
| `align-self-start`    | `align-self: flex-start` |
| `align-self-end`      | `align-self: flex-end`   |
| `align-self-center`   | `align-self: center`     |
| `align-self-baseline` | `align-self: baseline`   |
| `align-self-stretch`  | `align-self: stretch`    |
| `align-self-auto`     | `align-self: auto`       |

### Align Content (Múltiples líneas)

| Clase                         | CSS Equivalente                |
| ----------------------------- | ------------------------------ |
| `align-content-start`         | `align-content: flex-start`    |
| `align-content-end`           | `align-content: flex-end`      |
| `align-content-center`        | `align-content: center`        |
| `align-content-space-between` | `align-content: space-between` |
| `align-content-space-around`  | `align-content: space-around`  |
| `align-content-stretch`       | `align-content: stretch`       |

### Wrap

| Clase               | Descripción                      |
| ------------------- | -------------------------------- |
| `flex-wrap`         | Permite que los items hagan wrap |
| `flex-nowrap`       | Sin wrap (default)               |
| `flex-wrap-reverse` | Wrap en dirección inversa        |

### Flex Grow & Shrink

| Clase           | Descripción                 |
| --------------- | --------------------------- |
| `flex-grow-0`   | No crece                    |
| `flex-grow-1`   | Crece para llenar espacio   |
| `flex-shrink-0` | No se encoge                |
| `flex-shrink-1` | Puede encogerse             |
| `flex-fill`     | Equivale a `flex: 1 1 auto` |

### Orden

| Clase         | Descripción      |
| ------------- | ---------------- |
| `order-first` | `order: -1`      |
| `order-0`     | `order: 0`       |
| `order-1`     | `order: 1`       |
| `order-2`     | `order: 2`       |
| ...           | hasta `order-12` |
| `order-last`  | `order: 13`      |

---

## 📏 Spacing (Margin & Padding)

### Formato

```
{propiedad}{dirección}-{tamaño}
```

**Propiedades:**

- `m` - margin
- `p` - padding

**Direcciones:**

- `t` - top
- `b` - bottom
- `l` - left (o start en RTL)
- `r` - right (o end en RTL)
- `s` - start (left en LTR, right en RTL)
- `e` - end (right en LTR, left en RTL)
- `x` - horizontal (left y right)
- `y` - vertical (top y bottom)
- `a` - all (todas las direcciones) - se puede omitir

**Tamaños:** 0 a 16 (en incrementos de 4px base)

| Tamaño       | Valor              |
| ------------ | ------------------ |
| 0            | 0                  |
| 1            | 4px                |
| 2            | 8px                |
| 3            | 12px               |
| 4            | 16px               |
| 5            | 20px               |
| 6            | 24px               |
| 7            | 28px               |
| 8            | 32px               |
| 9            | 36px               |
| 10           | 40px               |
| 11           | 44px               |
| 12           | 48px               |
| 13           | 52px               |
| 14           | 56px               |
| 15           | 60px               |
| 16           | 64px               |
| `auto`       | auto (solo margin) |
| `n1` a `n16` | Valores negativos  |

### Ejemplos

```html
<!-- Padding de 16px en todos los lados -->
<div class="pa-4">...</div>

<!-- Margin top de 8px -->
<div class="mt-2">...</div>

<!-- Padding horizontal de 24px -->
<div class="px-6">...</div>

<!-- Centrar horizontalmente con margin auto -->
<div class="mx-auto">...</div>

<!-- Margin negativo -->
<div class="mt-n2">...</div>

<!-- Responsive: sin padding en móvil, pa-4 en md+ -->
<div class="pa-0 pa-md-4">...</div>
```

---

## 📝 Tipografía

### Tamaños de Texto

| Clase             | Tamaño          | Peso          |
| ----------------- | --------------- | ------------- |
| `text-h1`         | 96px / 6rem     | 300 (light)   |
| `text-h2`         | 60px / 3.75rem  | 300 (light)   |
| `text-h3`         | 48px / 3rem     | 400 (regular) |
| `text-h4`         | 34px / 2.125rem | 400 (regular) |
| `text-h5`         | 24px / 1.5rem   | 400 (regular) |
| `text-h6`         | 20px / 1.25rem  | 500 (medium)  |
| `text-subtitle-1` | 16px / 1rem     | 400 (regular) |
| `text-subtitle-2` | 14px / 0.875rem | 500 (medium)  |
| `text-body-1`     | 16px / 1rem     | 400 (regular) |
| `text-body-2`     | 14px / 0.875rem | 400 (regular) |
| `text-button`     | 14px / 0.875rem | 500 (medium)  |
| `text-caption`    | 12px / 0.75rem  | 400 (regular) |
| `text-overline`   | 10px / 0.625rem | 500 (medium)  |

### Peso de Fuente

| Clase                 | Valor |
| --------------------- | ----- |
| `font-weight-thin`    | 100   |
| `font-weight-light`   | 300   |
| `font-weight-regular` | 400   |
| `font-weight-medium`  | 500   |
| `font-weight-bold`    | 700   |
| `font-weight-black`   | 900   |

### Alineación de Texto

| Clase          | Descripción             |
| -------------- | ----------------------- |
| `text-left`    | Alineado a la izquierda |
| `text-center`  | Centrado                |
| `text-right`   | Alineado a la derecha   |
| `text-justify` | Justificado             |
| `text-start`   | Inicio (LTR/RTL aware)  |
| `text-end`     | Fin (LTR/RTL aware)     |

### Decoración de Texto

| Clase                          | Descripción    |
| ------------------------------ | -------------- |
| `text-decoration-none`         | Sin decoración |
| `text-decoration-overline`     | Línea superior |
| `text-decoration-underline`    | Subrayado      |
| `text-decoration-line-through` | Tachado        |

### Transformación de Texto

| Clase             | Descripción             |
| ----------------- | ----------------------- |
| `text-lowercase`  | minúsculas              |
| `text-uppercase`  | MAYÚSCULAS              |
| `text-capitalize` | Primera Letra Mayúscula |
| `text-none`       | Sin transformación      |

### Wrap y Overflow

| Clase           | Descripción               |
| --------------- | ------------------------- |
| `text-wrap`     | Permite wrap              |
| `text-no-wrap`  | Sin wrap                  |
| `text-truncate` | Trunca con ellipsis (...) |
| `text-break`    | Rompe palabras largas     |

### Estilo de Fuente

| Clase         | Descripción |
| ------------- | ----------- |
| `font-italic` | Cursiva     |

### Opacidad de Texto

| Clase                  | Opacidad |
| ---------------------- | -------- |
| `text-high-emphasis`   | 87%      |
| `text-medium-emphasis` | 60%      |
| `text-disabled`        | 38%      |

---

## 🎨 Colores

### Colores de Texto

```html
<span class="text-primary">Primary</span>
<span class="text-secondary">Secondary</span>
<span class="text-success">Success</span>
<span class="text-info">Info</span>
<span class="text-warning">Warning</span>
<span class="text-error">Error</span>
```

### Colores de Fondo

```html
<div class="bg-primary">...</div>
<div class="bg-secondary">...</div>
<div class="bg-success">...</div>
<div class="bg-info">...</div>
<div class="bg-warning">...</div>
<div class="bg-error">...</div>
<div class="bg-surface">...</div>
<div class="bg-background">...</div>
```

### Colores del Tema

| Color        | Descripción          |
| ------------ | -------------------- |
| `primary`    | Color principal      |
| `secondary`  | Color secundario     |
| `accent`     | Color de acento      |
| `success`    | Verde/Éxito          |
| `info`       | Azul/Información     |
| `warning`    | Amarillo/Advertencia |
| `error`      | Rojo/Error           |
| `surface`    | Superficie de cards  |
| `background` | Fondo general        |

### Variantes de Color (lighten/darken)

```html
<div class="bg-primary-lighten-1">...</div>
<div class="bg-primary-lighten-2">...</div>
<div class="bg-primary-darken-1">...</div>
<div class="bg-primary-darken-2">...</div>
```

---

## 📦 Sizing (Ancho y Alto)

### Width

| Clase    | Valor |
| -------- | ----- |
| `w-0`    | 0     |
| `w-25`   | 25%   |
| `w-33`   | 33%   |
| `w-50`   | 50%   |
| `w-66`   | 66%   |
| `w-75`   | 75%   |
| `w-100`  | 100%  |
| `w-auto` | auto  |

### Height

| Clase      | Valor |
| ---------- | ----- |
| `h-0`      | 0     |
| `h-25`     | 25%   |
| `h-50`     | 50%   |
| `h-75`     | 75%   |
| `h-100`    | 100%  |
| `h-auto`   | auto  |
| `h-screen` | 100vh |

### Utilidades Especiales

| Clase         | Descripción  |
| ------------- | ------------ |
| `fill-height` | height: 100% |
| `fill-width`  | width: 100%  |

---

## 🔲 Border Radius

| Clase            | Valor                     |
| ---------------- | ------------------------- |
| `rounded-0`      | Sin border radius         |
| `rounded-sm`     | 2px                       |
| `rounded`        | 4px (default)             |
| `rounded-lg`     | 8px                       |
| `rounded-xl`     | 16px                      |
| `rounded-pill`   | 9999px (pill shape)       |
| `rounded-circle` | 50% (círculo)             |
| `rounded-shaped` | Forma especial de Vuetify |

### Direccionales

```html
<div class="rounded-t-xl"><!-- Solo top --></div>
<div class="rounded-b-xl"><!-- Solo bottom --></div>
<div class="rounded-l-xl"><!-- Solo left --></div>
<div class="rounded-r-xl"><!-- Solo right --></div>
<div class="rounded-ts-xl"><!-- Top start --></div>
<div class="rounded-te-xl"><!-- Top end --></div>
<div class="rounded-bs-xl"><!-- Bottom start --></div>
<div class="rounded-be-xl"><!-- Bottom end --></div>
```

---

## 🎚️ Elevation (Sombras)

Valores de 0 a 24:

| Clase          | Descripción        |
| -------------- | ------------------ |
| `elevation-0`  | Sin sombra         |
| `elevation-1`  | Sombra muy sutil   |
| `elevation-2`  | Sombra sutil       |
| `elevation-4`  | Sombra ligera      |
| `elevation-6`  | Sombra media       |
| `elevation-8`  | Sombra pronunciada |
| `elevation-12` | Sombra fuerte      |
| `elevation-16` | Sombra muy fuerte  |
| `elevation-24` | Sombra máxima      |

```html
<v-card class="elevation-4">...</v-card> <v-card class="elevation-12">...</v-card>
```

---

## 👁️ Visibility

| Clase       | Descripción           |
| ----------- | --------------------- |
| `visible`   | `visibility: visible` |
| `invisible` | `visibility: hidden`  |

---

## 🖱️ Cursor

| Clase                | Descripción         |
| -------------------- | ------------------- |
| `cursor-pointer`     | Cursor de mano      |
| `cursor-default`     | Cursor default      |
| `cursor-move`        | Cursor de mover     |
| `cursor-not-allowed` | Cursor no permitido |
| `cursor-wait`        | Cursor de espera    |
| `cursor-text`        | Cursor de texto     |

---

## 📍 Position

| Clase               | CSS Equivalente      |
| ------------------- | -------------------- |
| `position-static`   | `position: static`   |
| `position-relative` | `position: relative` |
| `position-fixed`    | `position: fixed`    |
| `position-absolute` | `position: absolute` |
| `position-sticky`   | `position: sticky`   |

### Location (Top, Bottom, Left, Right)

| Clase      | Descripción   |
| ---------- | ------------- |
| `top-0`    | `top: 0`      |
| `bottom-0` | `bottom: 0`   |
| `left-0`   | `left: 0`     |
| `right-0`  | `right: 0`    |
| `start-0`  | LTR/RTL aware |
| `end-0`    | LTR/RTL aware |

---

## 🔢 Overflow

| Clase               | Descripción                 |
| ------------------- | --------------------------- |
| `overflow-auto`     | Auto scroll                 |
| `overflow-hidden`   | Ocultar overflow            |
| `overflow-visible`  | Visible                     |
| `overflow-x-auto`   | Auto scroll horizontal      |
| `overflow-x-hidden` | Ocultar overflow horizontal |
| `overflow-y-auto`   | Auto scroll vertical        |
| `overflow-y-hidden` | Ocultar overflow vertical   |

---

## 🎭 Opacity

| Clase         | Valor |
| ------------- | ----- |
| `opacity-0`   | 0     |
| `opacity-20`  | 0.2   |
| `opacity-40`  | 0.4   |
| `opacity-60`  | 0.6   |
| `opacity-80`  | 0.8   |
| `opacity-100` | 1     |

---

## 📱 Responsive Breakpoints

Puedes añadir breakpoints a muchas clases:

| Breakpoint | Tamaño  | Ejemplo      |
| ---------- | ------- | ------------ |
| (ninguno)  | 0px+    | `d-flex`     |
| `sm`       | 600px+  | `d-sm-flex`  |
| `md`       | 960px+  | `d-md-flex`  |
| `lg`       | 1280px+ | `d-lg-flex`  |
| `xl`       | 1920px+ | `d-xl-flex`  |
| `xxl`      | 2560px+ | `d-xxl-flex` |

### Ejemplos Responsive

```html
<!-- Oculto en móvil, visible en tablet+ -->
<div class="d-none d-md-block">...</div>

<!-- Columna en móvil, fila en desktop -->
<div class="d-flex flex-column flex-md-row">...</div>

<!-- Padding diferente por tamaño -->
<div class="pa-2 pa-md-4 pa-lg-6">...</div>

<!-- Texto centrado en móvil, izquierda en desktop -->
<p class="text-center text-md-left">...</p>
```

---

## 🔧 Utilidades Misceláneas

### Float

| Clase         | Descripción     |
| ------------- | --------------- |
| `float-left`  | Float izquierda |
| `float-right` | Float derecha   |
| `float-none`  | Sin float       |
| `float-start` | LTR/RTL aware   |
| `float-end`   | LTR/RTL aware   |

### Clearfix

```html
<div class="clearfix">...</div>
```

### User Select

| Clase              | Descripción      |
| ------------------ | ---------------- |
| `user-select-all`  | Seleccionar todo |
| `user-select-auto` | Auto             |
| `user-select-none` | No seleccionable |

### Pointer Events

| Clase     | Descripción            |
| --------- | ---------------------- |
| `pe-none` | `pointer-events: none` |
| `pe-auto` | `pointer-events: auto` |

---

## 🎯 Ejemplos Prácticos

### Card Centrada

```html
<v-card class="mx-auto pa-4" max-width="400">
  <v-card-title class="text-h5 text-center"> Título </v-card-title>
</v-card>
```

### Flex Container con Items Centrados

```html
<div class="d-flex align-center justify-center fill-height">
  <span>Contenido centrado</span>
</div>
```

### Responsive Grid Manual

```html
<div class="d-flex flex-wrap">
  <div class="w-100 w-md-50 w-lg-33 pa-2">Item 1</div>
  <div class="w-100 w-md-50 w-lg-33 pa-2">Item 2</div>
  <div class="w-100 w-md-50 w-lg-33 pa-2">Item 3</div>
</div>
```

### Texto con Estilos

```html
<p class="text-h4 font-weight-bold text-primary text-center mb-4">Título Principal</p>
<p class="text-body-1 text-medium-emphasis">Texto secundario con menos énfasis</p>
```

### Espaciado Consistente

```html
<v-card class="pa-4 pa-md-6 rounded-lg elevation-4">
  <div class="mb-4">Sección 1</div>
  <div class="mb-4">Sección 2</div>
  <div>Sección 3</div>
</v-card>
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de Vuetify - Styles](https://vuetifyjs.com/en/styles/spacing/)
- [Vuetify Flex Helpers](https://vuetifyjs.com/en/styles/flex/)
- [Vuetify Typography](https://vuetifyjs.com/en/styles/text-and-typography/)

---

> **Nota:** Todas estas clases vienen incluidas con Vuetify y no requieren ninguna librería adicional como Tailwind CSS.
