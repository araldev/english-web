# Architecture Decision Records

## ADR-001: Screaming Architecture + Hexagonal Architecture

### Status

Accepted

### Context

Necesitamos una estructura que sea clara sobre el propósito del negocio mientras mantiene la separación de responsabilidades.

### Decision

Combinar Screaming Architecture (estructura que revela el dominio) con Hexagonal Architecture (separación de capas).

### Consequences

- **Positive**: Clara identificación de bounded contexts
- **Positive**: Separación clara de responsabilidades
- **Negative**: Puede ser verbosa para proyectos pequeños
