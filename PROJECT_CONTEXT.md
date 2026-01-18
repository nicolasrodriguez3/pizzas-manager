# Project Context — Costos Manager

## Overview

Costos Manager es una aplicación web pensada para **emprendimientos gastronómicos** (pizzerías, rotiserías, food trucks, pastelerías, etc.) que necesitan **entender de verdad** cuánto les cuesta producir y vender sus productos.

El foco no está en "vender más" sino en:

- Calcular costos reales de productos
- Entender márgenes y ganancias
- Tomar decisiones basadas en números, no en intuición

---

## Core Goals

- Permitir calcular el **costo unitario** de productos elaborados
- Soportar productos **con receta** y **sin receta** (reventa)
- Registrar ventas y calcular **ganancias reales**
- Mantener el sistema **simple, claro y auditable**

---

## Target Users

- Emprendedores gastronómicos
- Pequeños comercios
- Usuarios no técnicos

**Implicancia clave:**
La UI y los flujos deben ser claros. Menos features, más claridad.

---

## Tech Stack (Decisiones Cerradas)

- **Next.js 16** (App Router)
- **Server Actions** para lógica de backend
- **Prisma ORM v7**
- **SQLite** (por ahora, migrable)
- **TailwindCSS v4**
- **shadcn/ui**
- **React Hook Form**
- **Zod** para validaciones
- **NextAuth** para autenticación

No sugerir cambios de stack salvo que haya un motivo técnico muy claro.

---

## Multi-Tenancy (Non-Negotiable)

- El sistema es **multi-tenant** desde el inicio
- Cada usuario pertenece a un **tenant (negocio/emprendimiento)**
- **Todos los modelos principales** (products, ingredients, recipes, sales, etc.) deben estar asociados a un `tenantId`
- Nunca asumir contexto global
- Siempre filtrar por tenant desde Server Actions

Errores graves:

- Queries sin `tenantId`
- Compartir datos entre tenants
- Lógica que asuma un único negocio

---

## Architecture Principles

### Data & Business Logic

- La **lógica de negocio vive en Server Actions**, no en componentes
- Los componentes React son mayormente de presentación
- Prisma se usa **solo desde Server Actions**, nunca directo desde el cliente

### Validations

- Validaciones siempre con **Zod**
- Zod es la fuente de verdad (no duplicar lógica)

### Forms

- Formularios con **React Hook Form + Zod resolver**
- Evitar estados manuales innecesarios

---

## Domain Concepts

### Tenant

- Representa un emprendimiento gastronómico
- Es el límite de aislamiento de datos

### Product

- Pertenece a un tenant
- Puede ser:
  - Producto final (vendible)
  - Producto intermedio (usado en recetas)

- Puede tener receta o no

### Ingredient

- Pertenece a un tenant
- Insumo básico comprable

### Recipe

- Define cómo se compone un producto
- Puede incluir ingredientes y otros productos

### Sale

- Pertenece a un tenant
- Puede incluir múltiples productos

---

### Product

- Puede ser:
  - Con receta (ingredientes + cantidades)
  - Sin receta (producto comprado y revendido)

### Ingredient

- Tiene costo, unidad de medida y proveedor (opcional)

### Recipe

- Puede incluir:
  - Ingredientes básicos
  - **Otros productos** (productos compuestos)

Ejemplo:

- Pizza Napolitana:
  - Pizza común (producto base)
  - Tomate

Implicancias técnicas:

- La receta **no es una tabla simple**
- Debe soportar relaciones recursivas o polimórficas
- Evitar suposiciones de "un producto = solo ingredientes"

---

## UX Rules (No negociables)

- El usuario **no piensa en tablas ni relaciones**
- El sistema se adapta al flujo del negocio real
- Siempre mostrar:
  - Costo
  - Precio de venta
  - Ganancia
  - Margen

Nada de métricas confusas o nombres técnicos.

---

## What NOT to Suggest

- Redux, Zustand u otros state managers globales
- Backend separado (Express, Nest, etc.)
- ORM distinto a Prisma
- CSS frameworks alternativos
- Soluciones "enterprise" innecesarias

---

## Design Philosophy

- Claridad > features
- Simple > flexible
- Explícito > mágico

Si una solución es "muy linda" pero difícil de explicar a un emprendedor, probablemente esté mal.

---

## Expectations from the Assistant

- Proponer soluciones alineadas con este contexto
- Avisar si algo rompe buenas prácticas en Next.js App Router
- No dar ejemplos genéricos de tutorial
- Priorizar soluciones mantenibles
