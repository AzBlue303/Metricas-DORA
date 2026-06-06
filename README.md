# Métricas DORA

Sistema que analiza un repositorio Git local y calcula las cuatro métricas **DevOps Research and Assessment (DORA)** para un año determinado:

| Métrica | Descripción |
|---------|-------------|
| **DF** — Deployment Frequency | Frecuencia de despliegues realizados |
| **LTFC** — Lead Time for Changes | Tiempo promedio entre un commit y su despliegue |
| **MTTR** — Mean Time to Recovery | Tiempo promedio de recuperación ante fallos |
| **CFR** — Change Failure Rate | Porcentaje de cambios que generaron incidentes |

## Arquitectura

Sigue una arquitectura de plugins: un `CoreSystem` gestiona la conexión al repositorio y delega el cálculo de cada métrica a un plugin independiente. Cada plugin implementa la interfaz `PluginOptions` (inicialización, cálculo, cierre). El plugin LTFC además genera un gráfico con `GraphGenerator`.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

Dependencias de desarrollo:

```bash
npm install typescript @types/node nodemon --save-dev
```

## Uso

```bash
# Producción
npm run start

# Desarrollo (hot-reload)
npm run dev -- <ruta_repositorio>/ <carpeta_salida_graficos>/ [flags]
```

### Flags

| Flag | Descripción |
|------|-------------|
| `-df=true\|false` | Calcular Deployment Frequency |
| `-ltfc=true\|false` | Calcular Lead Time for Changes (genera gráfico) |
| `-mttr=true\|false` | Calcular Mean Time to Recovery |
| `-cfr=true\|false` | Calcular Change Failure Rate |

### Ejemplo

```bash
npm run dev -- ./repositorio-objetivo/ ./graficos/ -df=true -ltfc=true -mttr=true -cfr=true
```

Los gráficos (LTFC) se exportan como imagen en la carpeta de salida especificada.
