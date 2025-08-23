# Screaming Architecture + Hexagonal Architecture

Este proyecto implementa una combinación de Screaming Architecture y Hexagonal Architecture.

## Estructura del Proyecto

### Screaming Architecture

La estructura de carpetas "grita" el propósito del negocio:

- `user-management/`: Todo relacionado con gestión de usuarios
- `order-management/`: Todo relacionado con gestión de órdenes

### Hexagonal Architecture

Cada bounded context sigue la arquitectura hexagonal:

- `domain/`: Lógica de negocio pura
- `application/`: Casos de uso y orquestación
- `infrastructure/`: Adaptadores externos

## Bounded Contexts

### User Management

Responsable de la gestión completa de usuarios y perfiles.

### Order Management

Responsable de la gestión completa de órdenes y procesamiento de pagos.

## Capas

### Domain Layer

- **Entities**: Objetos de negocio con identidad
- **Value Objects**: Objetos inmutables sin identidad
- **Repositories**: Contratos para persistencia
- **Services**: Lógica de dominio compleja

### Application Layer

- **Use Cases**: Casos de uso específicos
- **Ports**: Interfaces para adapters externos

### Infrastructure Layer

- **Adapters**: Implementaciones de puertos
- **Web**: Controladores HTTP
- **Persistence**: Repositorios concretos
- **External Services**: Integraciones externas
