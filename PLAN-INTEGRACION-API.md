# Plan de Integración de API - Vue Hotel

## Resumen del Proyecto

Este documento describe el plan de integración del frontend con la API de gestión hotelera. El proyecto está basado en:

- **Vue 3** (Composition API)
- **Vue Router** (enrutamiento)
- **Axios** (peticiones HTTP)
- **TanStack Query** (gestión de datos y caché)
- **Vuetify 4** (componentes UI)

**Base URL de la API:** `/api/v1/v1`

---

## Estructura de Módulos

```
src/
├── modules/
│   ├── auth/           ✅ Creado
│   ├── employees/      📋 Pendiente
│   ├── customers/      📋 Pendiente
│   ├── rooms/          📋 Pendiente
│   ├── reservations/   📋 Pendiente
│   ├── services/       📋 Pendiente
│   └── housekeeping/   📋 Pendiente
├── router/
│   └── index.ts
├── composables/
│   └── useApi.ts       (configuración global de Axios)
└── stores/
    └── auth.ts         (estado global de autenticación)
```

---

## Módulo 1: Authentication (auth) ✅

### Información General

| Campo                       | Valor                                |
| --------------------------- | ------------------------------------ |
| **Nombre del módulo**       | `auth`                               |
| **Carpeta**                 | `src/modules/auth/`                  |
| **Funcionalidad principal** | Autenticación de empleados del hotel |
| **Dependencias**            | Ninguna (módulo base)                |

### Estructura del Módulo

```
auth/
├── components/
│   └── LoginForm.vue
├── composables/
│   └── useAuth.ts
├── interfaces/
│   ├── login.interface.ts
│   └── auth-response.interface.ts
├── services/
│   └── auth.service.ts
├── store/
│   └── auth.store.ts
└── views/
    └── LoginView.vue
```

### Endpoints

| Método | Endpoint        | Descripción            | Parámetros            | Autenticación |
| ------ | --------------- | ---------------------- | --------------------- | ------------- |
| `POST` | `/auth/login`   | Iniciar sesión         | `{ email, password }` | ❌ No         |
| `POST` | `/auth/refresh` | Renovar token          | `{ refreshToken }`    | ❌ No         |
| `POST` | `/auth/logout`  | Cerrar sesión          | -                     | ✅ Bearer     |
| `POST` | `/auth/me`      | Obtener usuario actual | -                     | ✅ Bearer     |

### Rutas del Frontend

| Ruta     | Nombre  | Vista           | Guard                          |
| -------- | ------- | --------------- | ------------------------------ |
| `/login` | `login` | `LoginView.vue` | `guest` (solo no autenticados) |

### Interfaces TypeScript

```typescript
// login.interface.ts
interface LoginDto {
  email: string;
  password: string;
}

// auth-response.interface.ts
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  employee: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING';
  };
}
```

---

## Módulo 2: Employees (employees)

### Información General

| Campo                       | Valor                                 |
| --------------------------- | ------------------------------------- |
| **Nombre del módulo**       | `employees`                           |
| **Carpeta**                 | `src/modules/employees/`              |
| **Funcionalidad principal** | Gestión de empleados del hotel (CRUD) |
| **Dependencias**            | `auth` (requiere autenticación)       |
| **Roles permitidos**        | `ADMIN`, `MANAGER`                    |

### Estructura del Módulo

```
employees/
├── components/
│   ├── EmployeeTable.vue
│   ├── EmployeeForm.vue
│   ├── EmployeeFilters.vue
│   └── ChangePasswordDialog.vue
├── composables/
│   └── useEmployees.ts
├── interfaces/
│   ├── employee.interface.ts
│   └── employee-filters.interface.ts
├── services/
│   └── employees.service.ts
├── store/
│   └── employees.store.ts
└── views/
    ├── EmployeesListView.vue
    ├── EmployeeDetailView.vue
    └── EmployeeFormView.vue
```

### Endpoints

| Método   | Endpoint                          | Descripción                | Parámetros Query                                       | Parámetros Body     |
| -------- | --------------------------------- | -------------------------- | ------------------------------------------------------ | ------------------- |
| `GET`    | `/employees`                      | Listar empleados           | `page, limit, sortBy, sortOrder, search, role, status` | -                   |
| `POST`   | `/employees`                      | Crear empleado             | -                                                      | `CreateEmployeeDto` |
| `GET`    | `/employees/{id}`                 | Obtener empleado           | -                                                      | -                   |
| `PATCH`  | `/employees/{id}`                 | Actualizar empleado        | -                                                      | `UpdateEmployeeDto` |
| `DELETE` | `/employees/{id}`                 | Eliminar empleado (soft)   | -                                                      | -                   |
| `POST`   | `/employees/{id}/restore`         | Restaurar empleado         | -                                                      | -                   |
| `PATCH`  | `/employees/{id}/change-password` | Cambiar contraseña (Admin) | -                                                      | `ChangePasswordDto` |
| `PATCH`  | `/employees/me/change-password`   | Cambiar mi contraseña      | -                                                      | `ChangePasswordDto` |

### Rutas del Frontend

| Ruta                  | Nombre             | Vista                    | Descripción         |
| --------------------- | ------------------ | ------------------------ | ------------------- |
| `/employees`          | `employees-list`   | `EmployeesListView.vue`  | Lista de empleados  |
| `/employees/new`      | `employees-create` | `EmployeeFormView.vue`   | Crear empleado      |
| `/employees/:id`      | `employees-detail` | `EmployeeDetailView.vue` | Detalle de empleado |
| `/employees/:id/edit` | `employees-edit`   | `EmployeeFormView.vue`   | Editar empleado     |

### Interfaces TypeScript

```typescript
// employee.interface.ts
type EmployeeRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING';
type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
}

interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
  password?: string;
}

interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
}
```

---

## Módulo 3: Customers (customers)

### Información General

| Campo                       | Valor                              |
| --------------------------- | ---------------------------------- |
| **Nombre del módulo**       | `customers`                        |
| **Carpeta**                 | `src/modules/customers/`           |
| **Funcionalidad principal** | Gestión de huéspedes/clientes      |
| **Dependencias**            | `auth`                             |
| **Roles permitidos**        | `ADMIN`, `MANAGER`, `RECEPTIONIST` |

### Estructura del Módulo

```
customers/
├── components/
│   ├── CustomerTable.vue
│   ├── CustomerForm.vue
│   ├── CustomerFilters.vue
│   └── ReservationHistory.vue
├── composables/
│   └── useCustomers.ts
├── interfaces/
│   └── customer.interface.ts
├── services/
│   └── customers.service.ts
└── views/
    ├── CustomersListView.vue
    ├── CustomerDetailView.vue
    └── CustomerFormView.vue
```

### Endpoints

| Método   | Endpoint                       | Descripción                | Parámetros Query                                                    | Parámetros Body     |
| -------- | ------------------------------ | -------------------------- | ------------------------------------------------------------------- | ------------------- |
| `GET`    | `/customers`                   | Listar clientes            | `page, limit, sortBy, sortOrder, search, documentType, nationality` | -                   |
| `POST`   | `/customers`                   | Crear cliente              | -                                                                   | `CreateCustomerDto` |
| `GET`    | `/customers/{id}`              | Obtener cliente            | -                                                                   | -                   |
| `PATCH`  | `/customers/{id}`              | Actualizar cliente         | -                                                                   | `UpdateCustomerDto` |
| `DELETE` | `/customers/{id}`              | Eliminar cliente (soft)    | -                                                                   | -                   |
| `POST`   | `/customers/{id}/restore`      | Restaurar cliente          | -                                                                   | -                   |
| `GET`    | `/customers/{id}/reservations` | Historial de reservaciones | -                                                                   | -                   |

### Rutas del Frontend

| Ruta                  | Nombre             | Vista                    | Descripción        |
| --------------------- | ------------------ | ------------------------ | ------------------ |
| `/customers`          | `customers-list`   | `CustomersListView.vue`  | Lista de clientes  |
| `/customers/new`      | `customers-create` | `CustomerFormView.vue`   | Crear cliente      |
| `/customers/:id`      | `customers-detail` | `CustomerDetailView.vue` | Detalle de cliente |
| `/customers/:id/edit` | `customers-edit`   | `CustomerFormView.vue`   | Editar cliente     |

### Interfaces TypeScript

```typescript
// customer.interface.ts
type DocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'OTHER';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType: DocumentType;
  documentNumber: string;
  address?: string;
  nationality?: string;
  birthDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType: DocumentType;
  documentNumber: string;
  address?: string;
  nationality?: string;
  birthDate?: string;
}

interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}
```

---

## Módulo 4: Rooms (rooms)

### Información General

| Campo                       | Valor                              |
| --------------------------- | ---------------------------------- |
| **Nombre del módulo**       | `rooms`                            |
| **Carpeta**                 | `src/modules/rooms/`               |
| **Funcionalidad principal** | Gestión de habitaciones del hotel  |
| **Dependencias**            | `auth`                             |
| **Roles permitidos**        | `ADMIN`, `MANAGER`, `RECEPTIONIST` |

### Estructura del Módulo

```
rooms/
├── components/
│   ├── RoomTable.vue
│   ├── RoomCard.vue
│   ├── RoomForm.vue
│   ├── RoomFilters.vue
│   ├── RoomStatusBadge.vue
│   └── AvailabilityCalendar.vue
├── composables/
│   ├── useRooms.ts
│   └── useRoomAvailability.ts
├── interfaces/
│   └── room.interface.ts
├── services/
│   └── rooms.service.ts
└── views/
    ├── RoomsListView.vue
    ├── RoomDetailView.vue
    ├── RoomFormView.vue
    └── RoomAvailabilityView.vue
```

### Endpoints

| Método   | Endpoint              | Descripción                  | Parámetros Query                                                                               |
| -------- | --------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `GET`    | `/rooms`              | Listar habitaciones          | `page, limit, sortBy, sortOrder, search, type, status, floor, minCapacity, maxPrice, minPrice` |
| `POST`   | `/rooms`              | Crear habitación             | -                                                                                              |
| `GET`    | `/rooms/stats`        | Estadísticas de habitaciones | -                                                                                              |
| `GET`    | `/rooms/availability` | Verificar disponibilidad     | `checkInDate, checkOutDate, type, capacity`                                                    |
| `GET`    | `/rooms/{id}`         | Obtener habitación           | -                                                                                              |
| `PATCH`  | `/rooms/{id}`         | Actualizar habitación        | -                                                                                              |
| `DELETE` | `/rooms/{id}`         | Eliminar habitación (soft)   | -                                                                                              |
| `PATCH`  | `/rooms/{id}/status`  | Cambiar estado               | -                                                                                              |
| `POST`   | `/rooms/{id}/restore` | Restaurar habitación         | -                                                                                              |

### Rutas del Frontend

| Ruta                  | Nombre               | Vista                      | Descripción              |
| --------------------- | -------------------- | -------------------------- | ------------------------ |
| `/rooms`              | `rooms-list`         | `RoomsListView.vue`        | Lista de habitaciones    |
| `/rooms/new`          | `rooms-create`       | `RoomFormView.vue`         | Crear habitación         |
| `/rooms/availability` | `rooms-availability` | `RoomAvailabilityView.vue` | Verificar disponibilidad |
| `/rooms/:id`          | `rooms-detail`       | `RoomDetailView.vue`       | Detalle de habitación    |
| `/rooms/:id/edit`     | `rooms-edit`         | `RoomFormView.vue`         | Editar habitación        |

### Interfaces TypeScript

```typescript
// room.interface.ts
type RoomType = 'SINGLE' | 'DOUBLE' | 'TWIN' | 'SUITE' | 'DELUXE' | 'PRESIDENTIAL' | 'FAMILY';
type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  pricePerNight: number;
  capacity: number;
  description?: string;
  images?: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreateRoomDto {
  number: string;
  floor: number;
  type: RoomType;
  status?: RoomStatus;
  pricePerNight: number;
  capacity: number;
  description?: string;
  images?: string[];
  amenities?: string[];
}

interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  maintenance: number;
  outOfService: number;
}
```

---

## Módulo 5: Reservations (reservations)

### Información General

| Campo                       | Valor                             |
| --------------------------- | --------------------------------- |
| **Nombre del módulo**       | `reservations`                    |
| **Carpeta**                 | `src/modules/reservations/`       |
| **Funcionalidad principal** | Gestión completa de reservaciones |
| **Dependencias**            | `auth`, `customers`, `rooms`      |
| **Roles permitidos**        | Todos los roles autenticados      |

### Estructura del Módulo

```
reservations/
├── components/
│   ├── ReservationTable.vue
│   ├── ReservationForm.vue
│   ├── ReservationFilters.vue
│   ├── ReservationStatusBadge.vue
│   ├── ReservationTimeline.vue
│   ├── CheckInDialog.vue
│   ├── CheckOutDialog.vue
│   ├── TodayArrivals.vue
│   └── TodayDepartures.vue
├── composables/
│   ├── useReservations.ts
│   └── useReservationActions.ts
├── interfaces/
│   └── reservation.interface.ts
├── services/
│   └── reservations.service.ts
└── views/
    ├── ReservationsListView.vue
    ├── ReservationDetailView.vue
    ├── ReservationFormView.vue
    └── DashboardView.vue
```

### Endpoints

| Método   | Endpoint                         | Descripción            | Parámetros                                                                                                             |
| -------- | -------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/reservations`                  | Listar reservaciones   | `page, limit, sortBy, sortOrder, search, status, customerId, roomId, checkInFrom, checkInTo, checkOutFrom, checkOutTo` |
| `POST`   | `/reservations`                  | Crear reservación      | `CreateReservationDto`                                                                                                 |
| `GET`    | `/reservations/today/arrivals`   | Llegadas de hoy        | -                                                                                                                      |
| `GET`    | `/reservations/today/departures` | Salidas de hoy         | -                                                                                                                      |
| `GET`    | `/reservations/code/{code}`      | Buscar por código      | -                                                                                                                      |
| `GET`    | `/reservations/{id}`             | Obtener reservación    | -                                                                                                                      |
| `PATCH`  | `/reservations/{id}`             | Actualizar reservación | `UpdateReservationDto`                                                                                                 |
| `DELETE` | `/reservations/{id}`             | Eliminar reservación   | -                                                                                                                      |
| `POST`   | `/reservations/{id}/confirm`     | Confirmar reservación  | -                                                                                                                      |
| `POST`   | `/reservations/{id}/check-in`    | Realizar check-in      | `CheckInDto`                                                                                                           |
| `POST`   | `/reservations/{id}/check-out`   | Realizar check-out     | `CheckOutDto`                                                                                                          |
| `POST`   | `/reservations/{id}/cancel`      | Cancelar reservación   | -                                                                                                                      |
| `POST`   | `/reservations/{id}/no-show`     | Marcar como no-show    | -                                                                                                                      |

### Rutas del Frontend

| Ruta                     | Nombre                | Vista                       | Descripción                          |
| ------------------------ | --------------------- | --------------------------- | ------------------------------------ |
| `/`                      | `dashboard`           | `DashboardView.vue`         | Panel principal con llegadas/salidas |
| `/reservations`          | `reservations-list`   | `ReservationsListView.vue`  | Lista de reservaciones               |
| `/reservations/new`      | `reservations-create` | `ReservationFormView.vue`   | Crear reservación                    |
| `/reservations/:id`      | `reservations-detail` | `ReservationDetailView.vue` | Detalle de reservación               |
| `/reservations/:id/edit` | `reservations-edit`   | `ReservationFormView.vue`   | Editar reservación                   |

### Interfaces TypeScript

```typescript
// reservation.interface.ts
type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

interface Reservation {
  id: string;
  code: string;
  customerId: string;
  customer?: Customer;
  roomId: string;
  room?: Room;
  checkInDate: string;
  checkOutDate: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateReservationDto {
  customerId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  children?: number;
  notes?: string;
}

interface CheckInDto {
  notes?: string;
}

interface CheckOutDto {
  notes?: string;
}
```

---

## Módulo 6: Services (services)

### Información General

| Campo                       | Valor                              |
| --------------------------- | ---------------------------------- |
| **Nombre del módulo**       | `services`                         |
| **Carpeta**                 | `src/modules/services/`            |
| **Funcionalidad principal** | Servicios adicionales del hotel    |
| **Dependencias**            | `auth`, `reservations`             |
| **Roles permitidos**        | `ADMIN`, `MANAGER`, `RECEPTIONIST` |

### Estructura del Módulo

```
services/
├── components/
│   ├── ServiceTable.vue
│   ├── ServiceForm.vue
│   ├── ServiceCard.vue
│   ├── AddServiceDialog.vue
│   └── ReservationServices.vue
├── composables/
│   └── useServices.ts
├── interfaces/
│   └── service.interface.ts
├── services/
│   └── services.service.ts
└── views/
    ├── ServicesListView.vue
    ├── ServiceDetailView.vue
    └── ServiceFormView.vue
```

### Endpoints

| Método   | Endpoint                                | Descripción                    | Parámetros                                                 |
| -------- | --------------------------------------- | ------------------------------ | ---------------------------------------------------------- |
| `GET`    | `/services`                             | Listar servicios               | `page, limit, sortBy, sortOrder, search, category, active` |
| `POST`   | `/services`                             | Crear servicio                 | `CreateServiceDto`                                         |
| `GET`    | `/services/category/{category}`         | Servicios por categoría        | -                                                          |
| `GET`    | `/services/{id}`                        | Obtener servicio               | -                                                          |
| `PATCH`  | `/services/{id}`                        | Actualizar servicio            | `UpdateServiceDto`                                         |
| `DELETE` | `/services/{id}`                        | Eliminar servicio              | -                                                          |
| `POST`   | `/services/reservation`                 | Agregar servicio a reservación | `AddServiceToReservationDto`                               |
| `DELETE` | `/services/reservation/{id}`            | Quitar servicio de reservación | -                                                          |
| `GET`    | `/services/reservation/{reservationId}` | Servicios de una reservación   | -                                                          |

### Rutas del Frontend

| Ruta                 | Nombre            | Vista                   | Descripción         |
| -------------------- | ----------------- | ----------------------- | ------------------- |
| `/services`          | `services-list`   | `ServicesListView.vue`  | Lista de servicios  |
| `/services/new`      | `services-create` | `ServiceFormView.vue`   | Crear servicio      |
| `/services/:id`      | `services-detail` | `ServiceDetailView.vue` | Detalle de servicio |
| `/services/:id/edit` | `services-edit`   | `ServiceFormView.vue`   | Editar servicio     |

### Interfaces TypeScript

```typescript
// service.interface.ts
type ServiceCategory = 'RESTAURANT' | 'SPA' | 'TRANSPORT' | 'LAUNDRY' | 'ROOM_SERVICE' | 'OTHER';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: ServiceCategory;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateServiceDto {
  name: string;
  description?: string;
  price: number;
  category: ServiceCategory;
  active?: boolean;
}

interface AddServiceToReservationDto {
  reservationId: string;
  serviceId: string;
  quantity?: number;
  notes?: string;
}

interface ReservationService {
  id: string;
  reservationId: string;
  serviceId: string;
  service: Service;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
}
```

---

## Módulo 7: Housekeeping (housekeeping)

### Información General

| Campo                       | Valor                                      |
| --------------------------- | ------------------------------------------ |
| **Nombre del módulo**       | `housekeeping`                             |
| **Carpeta**                 | `src/modules/housekeeping/`                |
| **Funcionalidad principal** | Gestión de tareas de limpieza              |
| **Dependencias**            | `auth`, `rooms`, `employees`               |
| **Roles permitidos**        | Todos (vista limitada para `HOUSEKEEPING`) |

### Estructura del Módulo

```
housekeeping/
├── components/
│   ├── TaskTable.vue
│   ├── TaskForm.vue
│   ├── TaskCard.vue
│   ├── TaskFilters.vue
│   ├── AssignTaskDialog.vue
│   ├── CompleteTaskDialog.vue
│   └── MyTasksList.vue
├── composables/
│   ├── useHousekeeping.ts
│   └── useMyTasks.ts
├── interfaces/
│   └── housekeeping.interface.ts
├── services/
│   └── housekeeping.service.ts
└── views/
    ├── HousekeepingListView.vue
    ├── TaskDetailView.vue
    ├── TaskFormView.vue
    └── MyTasksView.vue
```

### Endpoints

| Método   | Endpoint                                    | Descripción             | Parámetros                                                                             |
| -------- | ------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `GET`    | `/housekeeping`                             | Listar tareas           | `page, limit, sortBy, sortOrder, search, status, roomId, employeeId, dateFrom, dateTo` |
| `POST`   | `/housekeeping`                             | Crear tarea             | `CreateCleaningTaskDto`                                                                |
| `GET`    | `/housekeeping/today`                       | Tareas de hoy           | -                                                                                      |
| `GET`    | `/housekeeping/pending`                     | Tareas pendientes       | -                                                                                      |
| `GET`    | `/housekeeping/my-tasks`                    | Mis tareas asignadas    | -                                                                                      |
| `GET`    | `/housekeeping/room/{roomId}/history`       | Historial de habitación | -                                                                                      |
| `GET`    | `/housekeeping/employee/{employeeId}/tasks` | Tareas de empleado      | -                                                                                      |
| `GET`    | `/housekeeping/{id}`                        | Obtener tarea           | -                                                                                      |
| `PATCH`  | `/housekeeping/{id}`                        | Actualizar tarea        | `UpdateCleaningTaskDto`                                                                |
| `DELETE` | `/housekeeping/{id}`                        | Eliminar tarea          | -                                                                                      |
| `PATCH`  | `/housekeeping/{id}/assign`                 | Asignar tarea           | `AssignTaskDto`                                                                        |
| `POST`   | `/housekeeping/{id}/start`                  | Iniciar tarea           | -                                                                                      |
| `POST`   | `/housekeeping/{id}/complete`               | Completar tarea         | `CompleteTaskDto`                                                                      |

### Rutas del Frontend

| Ruta                     | Nombre                  | Vista                      | Descripción      |
| ------------------------ | ----------------------- | -------------------------- | ---------------- |
| `/housekeeping`          | `housekeeping-list`     | `HousekeepingListView.vue` | Lista de tareas  |
| `/housekeeping/new`      | `housekeeping-create`   | `TaskFormView.vue`         | Crear tarea      |
| `/housekeeping/my-tasks` | `housekeeping-my-tasks` | `MyTasksView.vue`          | Mis tareas       |
| `/housekeeping/:id`      | `housekeeping-detail`   | `TaskDetailView.vue`       | Detalle de tarea |

### Interfaces TypeScript

```typescript
// housekeeping.interface.ts
type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

interface CleaningTask {
  id: string;
  roomId: string;
  room?: Room;
  employeeId?: string;
  employee?: Employee;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  status: TaskStatus;
  priority: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCleaningTaskDto {
  roomId: string;
  employeeId?: string;
  scheduledDate: string;
  priority?: number;
  notes?: string;
}

interface AssignTaskDto {
  employeeId: string;
}

interface CompleteTaskDto {
  notes?: string;
}
```

---

## Resumen de Rutas del Router

```typescript
// router/index.ts
const routes = [
  // Auth
  { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },

  // Dashboard
  { path: '/', name: 'dashboard', component: DashboardView, meta: { auth: true } },

  // Employees
  { path: '/employees', name: 'employees-list', component: EmployeesListView },
  { path: '/employees/new', name: 'employees-create', component: EmployeeFormView },
  { path: '/employees/:id', name: 'employees-detail', component: EmployeeDetailView },
  { path: '/employees/:id/edit', name: 'employees-edit', component: EmployeeFormView },

  // Customers
  { path: '/customers', name: 'customers-list', component: CustomersListView },
  { path: '/customers/new', name: 'customers-create', component: CustomerFormView },
  { path: '/customers/:id', name: 'customers-detail', component: CustomerDetailView },
  { path: '/customers/:id/edit', name: 'customers-edit', component: CustomerFormView },

  // Rooms
  { path: '/rooms', name: 'rooms-list', component: RoomsListView },
  { path: '/rooms/new', name: 'rooms-create', component: RoomFormView },
  { path: '/rooms/availability', name: 'rooms-availability', component: RoomAvailabilityView },
  { path: '/rooms/:id', name: 'rooms-detail', component: RoomDetailView },
  { path: '/rooms/:id/edit', name: 'rooms-edit', component: RoomFormView },

  // Reservations
  { path: '/reservations', name: 'reservations-list', component: ReservationsListView },
  { path: '/reservations/new', name: 'reservations-create', component: ReservationFormView },
  { path: '/reservations/:id', name: 'reservations-detail', component: ReservationDetailView },
  { path: '/reservations/:id/edit', name: 'reservations-edit', component: ReservationFormView },

  // Services
  { path: '/services', name: 'services-list', component: ServicesListView },
  { path: '/services/new', name: 'services-create', component: ServiceFormView },
  { path: '/services/:id', name: 'services-detail', component: ServiceDetailView },
  { path: '/services/:id/edit', name: 'services-edit', component: ServiceFormView },

  // Housekeeping
  { path: '/housekeeping', name: 'housekeeping-list', component: HousekeepingListView },
  { path: '/housekeeping/new', name: 'housekeeping-create', component: TaskFormView },
  { path: '/housekeeping/my-tasks', name: 'housekeeping-my-tasks', component: MyTasksView },
  { path: '/housekeeping/:id', name: 'housekeeping-detail', component: TaskDetailView },
];
```

---

## Orden de Implementación Recomendado

| Orden | Módulo         | Prioridad | Razón                           |
| ----- | -------------- | --------- | ------------------------------- |
| 1     | `auth` ✅      | Alta      | Base para autenticación         |
| 2     | `employees`    | Alta      | Gestión de usuarios del sistema |
| 3     | `rooms`        | Alta      | Core del negocio                |
| 4     | `customers`    | Alta      | Requerido para reservaciones    |
| 5     | `reservations` | Alta      | Funcionalidad principal         |
| 6     | `services`     | Media     | Complemento de reservaciones    |
| 7     | `housekeeping` | Media     | Operaciones internas            |

---

## Configuración de TanStack Query

```typescript
// composables/useApi.ts
import axios from 'axios';
import { QueryClient } from '@tanstack/vue-query';

export const api = axios.create({
  baseURL: '/api/v1/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});
```

---

## Notas Adicionales

1. **Soft Delete**: Los endpoints de eliminación realizan borrado lógico, por lo que se debe considerar un filtro para mostrar/ocultar registros eliminados.

2. **Paginación**: Todos los listados usan paginación con `page` y `limit`. Implementar componente de paginación reutilizable.

3. **Filtros**: Crear componentes de filtros reutilizables que se puedan parametrizar según el módulo.

4. **Refresh Token**: Implementar lógica de renovación automática de token en el interceptor de Axios.

5. **Guards de Ruta**: Implementar guards basados en roles para proteger rutas según el tipo de empleado.

6. **Notificaciones**: Implementar sistema de notificaciones (toast) para feedback de operaciones CRUD.

---

## Sistema de Autenticación y Guards de Vue Router

### Estructura de Archivos para Guards

```
src/
├── router/
│   ├── index.ts
│   └── guards/
│       ├── auth.guard.ts
│       ├── guest.guard.ts
│       └── role.guard.ts
├── directives/
│   └── role.directive.ts
└── composables/
    └── usePermissions.ts
```

### 1. Auth Store (Estado de Autenticación)

```typescript
// src/modules/auth/store/auth.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuthResponse } from '../interfaces/auth-response.interface';

export type EmployeeRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
}

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<AuthUser | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);

  // Getters computados
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const userRole = computed(() => user.value?.role || null);
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : '',
  );

  // Verificar si el usuario tiene uno de los roles especificados
  const hasRole = (roles: EmployeeRole | EmployeeRole[]): boolean => {
    if (!user.value) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.value.role);
  };

  // Verificar si el usuario tiene permiso para una acción específica
  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false;

    // Matriz de permisos por rol
    const rolePermissions: Record<EmployeeRole, string[]> = {
      ADMIN: ['*'], // Todos los permisos
      MANAGER: [
        'employees:read',
        'employees:create',
        'employees:update',
        'customers:*',
        'rooms:*',
        'reservations:*',
        'services:*',
        'housekeeping:*',
      ],
      RECEPTIONIST: [
        'customers:*',
        'rooms:read',
        'reservations:*',
        'services:read',
        'services:add-to-reservation',
        'housekeeping:read',
      ],
      HOUSEKEEPING: ['housekeeping:read', 'housekeeping:my-tasks', 'housekeeping:complete'],
    };

    const permissions = rolePermissions[user.value.role];

    // Admin tiene todos los permisos
    if (permissions.includes('*')) return true;

    // Verificar permiso exacto o wildcard del módulo
    const [module] = permission.split(':');
    return permissions.includes(permission) || permissions.includes(`${module}:*`);
  };

  // Acciones
  const setAuth = (authResponse: AuthResponse) => {
    accessToken.value = authResponse.accessToken;
    refreshToken.value = authResponse.refreshToken;
    user.value = authResponse.employee;

    // Persistir en localStorage
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    localStorage.setItem('user', JSON.stringify(authResponse.employee));
  };

  const loadFromStorage = () => {
    const storedToken = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      accessToken.value = storedToken;
      refreshToken.value = storedRefresh;
      user.value = JSON.parse(storedUser);
    }
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  // Cargar estado inicial
  loadFromStorage();

  return {
    // Estado
    user,
    accessToken,
    refreshToken,
    isLoading,
    // Getters
    isAuthenticated,
    userRole,
    fullName,
    // Métodos
    hasRole,
    hasPermission,
    setAuth,
    clearAuth,
    loadFromStorage,
  };
});
```

### 2. Funciones Guard para beforeEnter

```typescript
// src/router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

type EmployeeRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING';

/**
 * Obtiene el usuario del localStorage
 */
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Guard: Requiere autenticación
 * Uso: beforeEnter: requireAuth
 */
export const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
};

/**
 * Guard: Solo para invitados (no autenticados)
 * Uso: beforeEnter: guestOnly
 */
export const guestOnly = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
};

/**
 * Guard Factory: Requiere roles específicos
 * Uso: beforeEnter: requireRoles(['ADMIN', 'MANAGER'])
 */
export const requireRoles = (allowedRoles: EmployeeRole[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    const user = getUser();

    if (!user || !allowedRoles.includes(user.role)) {
      next({ name: 'unauthorized' });
      return;
    }

    next();
  };
};

/**
 * Guard combinado: Auth + Roles
 * Uso: beforeEnter: authWithRoles(['ADMIN'])
 */
export const authWithRoles = (allowedRoles?: EmployeeRole[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const user = getUser();
      if (!user || !allowedRoles.includes(user.role)) {
        next({ name: 'unauthorized' });
        return;
      }
    }

    next();
  };
};
```

### 3. Configuración del Router con beforeEnter

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import { requireAuth, guestOnly, requireRoles, authWithRoles } from './guards';

// Layouts
import AuthLayout from '@/modules/layouts/AuthLayout.vue';
import AdminLayout from '@/modules/layouts/AdminLayout.vue';

// Views
import LoginView from '@/modules/auth/views/LoginView.vue';
import DashboardView from '@/modules/dashboard/views/DashboardView.vue';

const routes = [
  // ========== LOGIN (Solo invitados) ==========
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    beforeEnter: guestOnly,
  },

  // ========== DASHBOARD ==========
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    beforeEnter: requireAuth,
  },

  // ========== EMPLOYEES (ADMIN, MANAGER) ==========
  {
    path: '/employees',
    name: 'employees-list',
    component: () => import('@/modules/employees/views/EmployeesListView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']),
  },
  {
    path: '/employees/new',
    name: 'employees-create',
    component: () => import('@/modules/employees/views/EmployeeFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']),
  },
  {
    path: '/employees/:id',
    name: 'employees-detail',
    component: () => import('@/modules/employees/views/EmployeeDetailView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']),
  },
  {
    path: '/employees/:id/edit',
    name: 'employees-edit',
    component: () => import('@/modules/employees/views/EmployeeFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']),
  },

  // ========== CUSTOMERS (ADMIN, MANAGER, RECEPTIONIST) ==========
  {
    path: '/customers',
    name: 'customers-list',
    component: () => import('@/modules/customers/views/CustomersListView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/customers/new',
    name: 'customers-create',
    component: () => import('@/modules/customers/views/CustomerFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/customers/:id',
    name: 'customers-detail',
    component: () => import('@/modules/customers/views/CustomerDetailView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/customers/:id/edit',
    name: 'customers-edit',
    component: () => import('@/modules/customers/views/CustomerFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },

  // ========== ROOMS ==========
  {
    path: '/rooms',
    name: 'rooms-list',
    component: () => import('@/modules/rooms/views/RoomsListView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/rooms/new',
    name: 'rooms-create',
    component: () => import('@/modules/rooms/views/RoomFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']), // Solo ADMIN y MANAGER pueden crear
  },
  {
    path: '/rooms/availability',
    name: 'rooms-availability',
    component: () => import('@/modules/rooms/views/RoomAvailabilityView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/rooms/:id',
    name: 'rooms-detail',
    component: () => import('@/modules/rooms/views/RoomDetailView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/rooms/:id/edit',
    name: 'rooms-edit',
    component: () => import('@/modules/rooms/views/RoomFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']), // Solo ADMIN y MANAGER pueden editar
  },

  // ========== RESERVATIONS (Todos los autenticados) ==========
  {
    path: '/reservations',
    name: 'reservations-list',
    component: () => import('@/modules/reservations/views/ReservationsListView.vue'),
    beforeEnter: requireAuth,
  },
  {
    path: '/reservations/new',
    name: 'reservations-create',
    component: () => import('@/modules/reservations/views/ReservationFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/reservations/:id',
    name: 'reservations-detail',
    component: () => import('@/modules/reservations/views/ReservationDetailView.vue'),
    beforeEnter: requireAuth,
  },
  {
    path: '/reservations/:id/edit',
    name: 'reservations-edit',
    component: () => import('@/modules/reservations/views/ReservationFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },

  // ========== SERVICES ==========
  {
    path: '/services',
    name: 'services-list',
    component: () => import('@/modules/services/views/ServicesListView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/services/new',
    name: 'services-create',
    component: () => import('@/modules/services/views/ServiceFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']),
  },
  {
    path: '/services/:id',
    name: 'services-detail',
    component: () => import('@/modules/services/views/ServiceDetailView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/services/:id/edit',
    name: 'services-edit',
    component: () => import('@/modules/services/views/ServiceFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']),
  },

  // ========== HOUSEKEEPING ==========
  {
    path: '/housekeeping',
    name: 'housekeeping-list',
    component: () => import('@/modules/housekeeping/views/HousekeepingListView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  },
  {
    path: '/housekeeping/new',
    name: 'housekeeping-create',
    component: () => import('@/modules/housekeeping/views/TaskFormView.vue'),
    beforeEnter: requireRoles(['ADMIN', 'MANAGER']),
  },
  {
    path: '/housekeeping/my-tasks',
    name: 'housekeeping-my-tasks',
    component: () => import('@/modules/housekeeping/views/MyTasksView.vue'),
    beforeEnter: requireAuth, // Todos los autenticados
  },
  {
    path: '/housekeeping/:id',
    name: 'housekeeping-detail',
    component: () => import('@/modules/housekeeping/views/TaskDetailView.vue'),
    beforeEnter: requireAuth,
  },

  // ========== PÁGINAS DE ERROR ==========
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/modules/common/views/UnauthorizedView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/modules/common/views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
```

### 4. Ejemplo de Uso Directo en Rutas (Estilo Simple)

Si prefieres definir el guard directamente en cada ruta sin funciones separadas:

```typescript
// src/router/index.ts - Versión inline
const routes = [
  // Login - Solo para no autenticados
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        next('/');
      } else {
        next();
      }
    },
  },

  // Dashboard - Requiere autenticación
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        next('/login');
      } else {
        next();
      }
    },
  },

  // Employees - Solo ADMIN y MANAGER
  {
    path: '/employees',
    name: 'employees-list',
    component: () => import('@/modules/employees/views/EmployeesListView.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token) {
        next('/login');
      } else if (!['ADMIN', 'MANAGER'].includes(user.role)) {
        next('/unauthorized');
      } else {
        next();
      }
    },
  },

  // Customers - ADMIN, MANAGER, RECEPTIONIST
  {
    path: '/customers',
    name: 'customers-list',
    component: () => import('@/modules/customers/views/CustomersListView.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token) {
        next('/login');
      } else if (!['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(user.role)) {
        next('/unauthorized');
      } else {
        next();
      }
    },
  },

  // Rooms - Ver: todos, Crear/Editar: solo ADMIN, MANAGER
  {
    path: '/rooms',
    name: 'rooms-list',
    component: () => import('@/modules/rooms/views/RoomsListView.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token) {
        next('/login');
      } else if (!['ADMIN', 'MANAGER', 'RECEPTIONIST'].includes(user.role)) {
        next('/unauthorized');
      } else {
        next();
      }
    },
  },
  {
    path: '/rooms/new',
    name: 'rooms-create',
    component: () => import('@/modules/rooms/views/RoomFormView.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (!token) {
        next('/login');
      } else if (!['ADMIN', 'MANAGER'].includes(user.role)) {
        next('/unauthorized');
      } else {
        next();
      }
    },
  },

  // Reservations - Todos los autenticados pueden ver
  {
    path: '/reservations',
    name: 'reservations-list',
    component: () => import('@/modules/reservations/views/ReservationsListView.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        next('/login');
      } else {
        next();
      }
    },
  },

  // Housekeeping - Mis tareas (todos autenticados)
  {
    path: '/housekeeping/my-tasks',
    name: 'housekeeping-my-tasks',
    component: () => import('@/modules/housekeeping/views/MyTasksView.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        next('/login');
      } else {
        next();
      }
    },
  },
];
```

---

## Sistema de Control de Acceso por Roles (UI)

### 1. Directiva v-role (Mostrar/Ocultar elementos)

```typescript
// src/directives/role.directive.ts
import type { Directive, DirectiveBinding } from 'vue';
import { useAuthStore, type EmployeeRole } from '@/modules/auth/store/auth.store';

/**
 * Directiva v-role para mostrar/ocultar elementos basado en roles
 *
 * Uso:
 * - v-role="'ADMIN'"                    → Solo visible para ADMIN
 * - v-role="['ADMIN', 'MANAGER']"       → Visible para ADMIN o MANAGER
 * - v-role:hide="'HOUSEKEEPING'"        → Oculto solo para HOUSEKEEPING
 * - v-role:disable="['RECEPTIONIST']"   → Deshabilitado para RECEPTIONIST
 */
export const vRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    updateElement(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    updateElement(el, binding);
  },
};

function updateElement(el: HTMLElement, binding: DirectiveBinding) {
  const authStore = useAuthStore();
  const roles = normalizeRoles(binding.value);
  const modifier = binding.arg as 'hide' | 'disable' | undefined;

  const hasRole = authStore.hasRole(roles);

  switch (modifier) {
    case 'hide':
      // Ocultar si el usuario TIENE el rol especificado
      el.style.display = hasRole ? 'none' : '';
      break;

    case 'disable':
      // Deshabilitar si el usuario NO tiene el rol
      if (!hasRole) {
        el.setAttribute('disabled', 'true');
        el.classList.add('v-role-disabled');
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
      } else {
        el.removeAttribute('disabled');
        el.classList.remove('v-role-disabled');
        el.style.pointerEvents = '';
        el.style.opacity = '';
      }
      break;

    default:
      // Por defecto: mostrar solo si tiene el rol
      el.style.display = hasRole ? '' : 'none';
  }
}

function normalizeRoles(value: EmployeeRole | EmployeeRole[]): EmployeeRole[] {
  return Array.isArray(value) ? value : [value];
}

// Registro global en main.ts
// app.directive('role', vRole);
```

### 2. Directiva v-permission (Control granular por permisos)

```typescript
// src/directives/permission.directive.ts
import type { Directive, DirectiveBinding } from 'vue';
import { useAuthStore } from '@/modules/auth/store/auth.store';

/**
 * Directiva v-permission para control granular de permisos
 *
 * Uso:
 * - v-permission="'employees:create'"     → Solo con permiso de crear empleados
 * - v-permission="'rooms:*'"              → Cualquier permiso de rooms
 * - v-permission:disable="'services:delete'" → Deshabilitar sin permiso
 */
export const vPermission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    updateElement(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    updateElement(el, binding);
  },
};

function updateElement(el: HTMLElement, binding: DirectiveBinding) {
  const authStore = useAuthStore();
  const permission = binding.value as string;
  const modifier = binding.arg as 'disable' | undefined;

  const hasPermission = authStore.hasPermission(permission);

  if (modifier === 'disable') {
    if (!hasPermission) {
      el.setAttribute('disabled', 'true');
      el.classList.add('v-permission-disabled');
      el.style.pointerEvents = 'none';
      el.style.opacity = '0.5';
    } else {
      el.removeAttribute('disabled');
      el.classList.remove('v-permission-disabled');
      el.style.pointerEvents = '';
      el.style.opacity = '';
    }
  } else {
    el.style.display = hasPermission ? '' : 'none';
  }
}

// Registro global en main.ts
// app.directive('permission', vPermission);
```

### 3. Composable usePermissions

```typescript
// src/composables/usePermissions.ts
import { computed } from 'vue';
import { useAuthStore, type EmployeeRole } from '@/modules/auth/store/auth.store';

/**
 * Composable para verificar roles y permisos en componentes
 *
 * Uso:
 * const { canCreate, canEdit, canDelete, hasRole, hasPermission } = usePermissions('employees');
 */
export function usePermissions(module?: string) {
  const authStore = useAuthStore();

  // Verificar si tiene un rol específico
  const hasRole = (roles: EmployeeRole | EmployeeRole[]): boolean => {
    return authStore.hasRole(roles);
  };

  // Verificar permiso específico
  const hasPermission = (permission: string): boolean => {
    return authStore.hasPermission(permission);
  };

  // Permisos CRUD para un módulo específico
  const canRead = computed(() => (module ? authStore.hasPermission(`${module}:read`) : false));
  const canCreate = computed(() => (module ? authStore.hasPermission(`${module}:create`) : false));
  const canUpdate = computed(() => (module ? authStore.hasPermission(`${module}:update`) : false));
  const canDelete = computed(() => (module ? authStore.hasPermission(`${module}:delete`) : false));

  // Verificaciones de rol comunes
  const isAdmin = computed(() => authStore.hasRole('ADMIN'));
  const isManager = computed(() => authStore.hasRole(['ADMIN', 'MANAGER']));
  const isReceptionist = computed(() => authStore.hasRole('RECEPTIONIST'));
  const isHousekeeping = computed(() => authStore.hasRole('HOUSEKEEPING'));

  // El usuario actual
  const currentUser = computed(() => authStore.user);
  const currentRole = computed(() => authStore.userRole);

  return {
    // Métodos
    hasRole,
    hasPermission,
    // Permisos CRUD del módulo
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    // Verificaciones de rol
    isAdmin,
    isManager,
    isReceptionist,
    isHousekeeping,
    // Usuario
    currentUser,
    currentRole,
  };
}
```

### 4. Componente RoleGuard (Alternativa a directivas)

```typescript
<!-- src/components/common/RoleGuard.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore, type EmployeeRole } from '@/modules/auth/store/auth.store';

interface Props {
  roles?: EmployeeRole | EmployeeRole[];
  permission?: string;
  fallback?: 'hide' | 'disable' | 'message';
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  fallback: 'hide',
  message: 'No tienes permisos para ver este contenido',
});

const authStore = useAuthStore();

const hasAccess = computed(() => {
  if (props.permission) {
    return authStore.hasPermission(props.permission);
  }
  if (props.roles) {
    return authStore.hasRole(props.roles);
  }
  return true;
});
</script>

<template>
  <!-- Mostrar contenido si tiene acceso -->
  <slot v-if="hasAccess" />

  <!-- Fallback: mensaje -->
  <div v-else-if="fallback === 'message'" class="role-guard-message">
    <v-alert type="warning" variant="tonal">
      {{ message }}
    </v-alert>
  </div>

  <!-- Fallback: deshabilitado -->
  <div v-else-if="fallback === 'disable'" class="role-guard-disabled">
    <slot name="disabled">
      <div style="opacity: 0.5; pointer-events: none">
        <slot />
      </div>
    </slot>
  </div>

  <!-- Fallback: ocultar (por defecto) - no renderiza nada -->
</template>
```

### 5. Registro de Directivas en main.ts

```typescript
// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Directivas
import { vRole } from './directives/role.directive';
import { vPermission } from './directives/permission.directive';

// Componentes globales
import RoleGuard from './components/common/RoleGuard.vue';

const app = createApp(App);

// Plugins
app.use(createPinia());
app.use(router);

// Registrar directivas globalmente
app.directive('role', vRole);
app.directive('permission', vPermission);

// Registrar componentes globales
app.component('RoleGuard', RoleGuard);

app.mount('#app');
```

---

## Ejemplos de Uso en Componentes

### Ejemplo 1: Lista de empleados con acciones basadas en rol

```typescript
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions';

const { canCreate, canUpdate, canDelete, isAdmin } = usePermissions('employees');
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Empleados</h1>
      </v-col>
      <v-col class="text-right">
        <!-- Opción 1: Usando directiva v-role -->
        <v-btn v-role="['ADMIN', 'MANAGER']" color="primary" :to="{ name: 'employees-create' }">
          Nuevo Empleado
        </v-btn>

        <!-- Opción 2: Usando composable -->
        <v-btn v-if="canCreate" color="primary" :to="{ name: 'employees-create' }">
          Nuevo Empleado
        </v-btn>

        <!-- Opción 3: Usando componente RoleGuard -->
        <RoleGuard :roles="['ADMIN', 'MANAGER']">
          <v-btn color="primary" :to="{ name: 'employees-create' }"> Nuevo Empleado </v-btn>
        </RoleGuard>
      </v-col>
    </v-row>

    <v-data-table :items="employees" :headers="headers">
      <template #item.actions="{ item }">
        <!-- Ver - todos pueden -->
        <v-btn icon size="small" :to="{ name: 'employees-detail', params: { id: item.id } }">
          <v-icon>mdi-eye</v-icon>
        </v-btn>

        <!-- Editar - solo ADMIN y MANAGER -->
        <v-btn
          v-role="['ADMIN', 'MANAGER']"
          icon
          size="small"
          :to="{ name: 'employees-edit', params: { id: item.id } }"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <!-- Eliminar - solo ADMIN -->
        <v-btn v-role="'ADMIN'" icon size="small" color="error" @click="deleteEmployee(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>

        <!-- Botón deshabilitado para quienes no tienen permiso -->
        <v-btn
          v-role:disable="['ADMIN']"
          icon
          size="small"
          color="error"
          @click="deleteEmployee(item.id)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>
```

### Ejemplo 2: Menú de navegación con items filtrados por rol

```typescript
<script setup lang="ts">
import { computed } from 'vue';
import { usePermissions } from '@/composables/usePermissions';

const { hasRole, hasPermission } = usePermissions();

interface NavItem {
  title: string;
  icon: string;
  to: string;
  roles?: string[];
  permission?: string;
}

const allMenuItems: NavItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
  {
    title: 'Empleados',
    icon: 'mdi-account-group',
    to: '/employees',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    title: 'Clientes',
    icon: 'mdi-account-multiple',
    to: '/customers',
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'],
  },
  {
    title: 'Habitaciones',
    icon: 'mdi-bed',
    to: '/rooms',
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'],
  },
  { title: 'Reservaciones', icon: 'mdi-calendar-check', to: '/reservations' },
  {
    title: 'Servicios',
    icon: 'mdi-room-service',
    to: '/services',
    roles: ['ADMIN', 'MANAGER', 'RECEPTIONIST'],
  },
  { title: 'Limpieza', icon: 'mdi-broom', to: '/housekeeping' },
  {
    title: 'Mis Tareas',
    icon: 'mdi-clipboard-check',
    to: '/housekeeping/my-tasks',
    roles: ['HOUSEKEEPING'],
  },
];

// Filtrar items de menú según permisos del usuario
const menuItems = computed(() => {
  return allMenuItems.filter((item) => {
    // Si no tiene restricción de roles, mostrar a todos
    if (!item.roles || item.roles.length === 0) return true;

    // Verificar si el usuario tiene alguno de los roles permitidos
    return hasRole(item.roles as any);
  });
});
</script>

<template>
  <v-navigation-drawer>
    <v-list nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
      />
    </v-list>
  </v-navigation-drawer>
</template>
```

### Ejemplo 3: Formulario con campos condicionales por rol

```typescript
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions';

const { isAdmin, hasPermission } = usePermissions();
</script>

<template>
  <v-form @submit.prevent="submitForm">
    <v-text-field v-model="form.firstName" label="Nombre" required />

    <v-text-field v-model="form.lastName" label="Apellido" required />

    <v-text-field v-model="form.email" label="Email" type="email" required />

    <!-- Solo ADMIN puede cambiar roles -->
    <v-select
      v-if="isAdmin"
      v-model="form.role"
      :items="roleOptions"
      label="Rol"
      item-title="text"
      item-value="value"
    />

    <!-- Campo deshabilitado para no-admin -->
    <v-select
      v-permission:disable="'employees:change-role'"
      v-model="form.role"
      :items="roleOptions"
      label="Rol"
    />

    <!-- Sección de permisos avanzados solo para ADMIN -->
    <RoleGuard
      :roles="['ADMIN']"
      fallback="message"
      message="Solo administradores pueden ver esta sección"
    >
      <v-card class="mt-4">
        <v-card-title>Configuración Avanzada</v-card-title>
        <v-card-text>
          <v-checkbox v-model="form.canAccessReports" label="Acceso a reportes" />
          <v-checkbox v-model="form.canManageSystem" label="Gestión del sistema" />
        </v-card-text>
      </v-card>
    </RoleGuard>

    <v-btn type="submit" color="primary" class="mt-4"> Guardar </v-btn>
  </v-form>
</template>
```

---

## Matriz de Permisos por Módulo y Rol

| Módulo/Acción                 | ADMIN | MANAGER | RECEPTIONIST | HOUSEKEEPING |
| ----------------------------- | :---: | :-----: | :----------: | :----------: |
| **Dashboard**                 |  ✅   |   ✅    |      ✅      |      ✅      |
| **Employees - Ver**           |  ✅   |   ✅    |      ❌      |      ❌      |
| **Employees - Crear**         |  ✅   |   ✅    |      ❌      |      ❌      |
| **Employees - Editar**        |  ✅   |   ✅    |      ❌      |      ❌      |
| **Employees - Eliminar**      |  ✅   |   ❌    |      ❌      |      ❌      |
| **Customers - Ver**           |  ✅   |   ✅    |      ✅      |      ❌      |
| **Customers - CRUD**          |  ✅   |   ✅    |      ✅      |      ❌      |
| **Rooms - Ver**               |  ✅   |   ✅    |      ✅      |      ❌      |
| **Rooms - Crear/Editar**      |  ✅   |   ✅    |      ❌      |      ❌      |
| **Rooms - Eliminar**          |  ✅   |   ❌    |      ❌      |      ❌      |
| **Reservations - Ver**        |  ✅   |   ✅    |      ✅      |      ✅      |
| **Reservations - CRUD**       |  ✅   |   ✅    |      ✅      |      ❌      |
| **Services - Ver**            |  ✅   |   ✅    |      ✅      |      ❌      |
| **Services - Crear/Editar**   |  ✅   |   ✅    |      ❌      |      ❌      |
| **Housekeeping - Ver todo**   |  ✅   |   ✅    |      ✅      |      ❌      |
| **Housekeeping - Mis tareas** |  ✅   |   ✅    |      ✅      |      ✅      |
| **Housekeeping - Crear**      |  ✅   |   ✅    |      ❌      |      ❌      |
| **Housekeeping - Completar**  |  ✅   |   ✅    |      ✅      |      ✅      |
