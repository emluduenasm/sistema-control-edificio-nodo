# Sistema Control Edificio NODO

Base frontend para la plataforma web de control, visualizacion y metricas del **Edificio NODO TECNOLOGICO**.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- ESLint
- Datos mock locales, sin backend real todavia

## Estructura

```txt
app/
  layout.tsx
  globals.css
  (dashboard)/
    layout.tsx
    page.tsx
    interior/
    exterior/
    metricas/
components/
  layout/
  planta/
  capas/
  controles/
  metricas/
features/
  interior/
  exterior/
  luces/
  aire-acondicionado/
  bombas/
  internet/
  metricas/
lib/
  svg/
  mock/
  utils/
  constants/
types/
public/
  planos/
```

## Rutas iniciales

- `/`
- `/interior`
- `/interior/este/planta-baja`
- `/exterior`
- `/metricas`

Las plantas soportadas usan estos slugs:

- `planta-baja`
- `entre-piso`
- `planta-alta`
- `sub-suelo`

Las alas soportadas son `este` y `oeste`.

## Planos SVG

Los SVG existentes se mantienen en `public/planos/`. El mapeo central esta en:

```txt
lib/svg/planta-map.ts
```

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Ejecutar en local:

```bash
npm run dev
```

Validar lint:

```bash
npm run lint
```

## Proximo paso recomendado

El componente a evolucionar para pintar zonas por capa es:

```txt
components/planta/planta-viewer.tsx
```

Actualmente renderiza el SVG correspondiente y lista zonas mock con `svgSelector`. La siguiente iteracion deberia cargar el SVG como documento manipulable o inline para aplicar estilos por selector segun `capaActiva` y `EstadoZona`.
