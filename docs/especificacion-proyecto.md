# Turismo Catamarca - Especificacion del Proyecto

## 1. Descripcion breve del problema

La informacion turistica de Catamarca suele encontrarse dispersa en distintas fuentes, redes sociales, paginas institucionales, mapas y recomendaciones informales. Esta dispersion dificulta que una persona pueda descubrir atractivos, comparar circuitos, conocer actividades disponibles y planificar un recorrido con informacion clara, organizada y actualizada.

El problema principal que aborda este proyecto es la falta de una plataforma web centralizada para consultar atractivos turisticos de Catamarca junto con sus circuitos, actividades, imagenes, videos y ubicaciones. La solucion busca facilitar la exploracion y planificacion turistica, reduciendo la friccion entre descubrir un lugar y decidir visitarlo.

## 2. Destinatarios principales

Los destinatarios principales son:

- Turistas que desean conocer Catamarca y necesitan informacion organizada para planificar su visita.
- Residentes de la provincia interesados en redescubrir atractivos, circuitos y actividades locales.
- Administradores o gestores turisticos responsables de cargar y mantener actualizada la informacion del sitio.
- Usuarios registrados que desean guardar atractivos en un itinerario personal.

## 3. Contexto de uso

El sitio esta pensado para utilizarse desde navegadores web en computadoras, tablets o celulares. Puede consultarse antes de viajar, durante la planificacion de un recorrido o mientras el visitante se encuentra en Catamarca y necesita acceder rapidamente a informacion del destino.

En el contexto publico, el usuario puede explorar atractivos, filtrar resultados, consultar mapas, ver videos y revisar actividades asociadas. En el contexto administrativo, una persona con permisos puede cargar, editar o eliminar atractivos, circuitos y actividades desde secciones protegidas.

## 4. Objetivo de la solucion

El objetivo de la solucion es centralizar la oferta turistica de Catamarca en una aplicacion web que permita explorar atractivos, circuitos y actividades de forma simple, visual y organizada.

La plataforma busca:

- Mostrar atractivos turisticos con informacion clara y multimedia.
- Relacionar cada atractivo con un circuito turistico.
- Asociar actividades especificas a cada atractivo.
- Permitir la planificacion mediante un itinerario personal.
- Brindar herramientas de administracion para mantener la informacion actualizada.

## 5. Alcance funcional con MoSCoW

### Must Have

Funcionalidades indispensables:

- Visualizacion de atractivos turisticos.
- Cada atractivo debe contar con nombre, departamento, descripcion, imagen, ubicacion en mapa, video y circuito asociado.
- Visualizacion de circuitos turisticos con nombre y descripcion.
- Visualizacion de actividades con descripcion, duracion estimada y atractivo asociado.
- Busqueda y filtrado de atractivos por nombre, departamento y circuito.
- Registro e inicio de sesion de usuarios.
- Diferenciacion de roles entre usuario comun y administrador.
- Proteccion de rutas administrativas.
- Alta, edicion y eliminacion de atractivos.
- Alta, edicion y eliminacion de circuitos.
- Alta, edicion y eliminacion de actividades.
- Conexion persistente con base de datos MongoDB.

### Should Have

Funcionalidades importantes pero no criticas para una primera entrega:

- Itinerario personal para que el usuario guarde atractivos de interes.
- Visualizacion de mapas embebidos dentro de la interfaz.
- Visualizacion de videos de YouTube dentro de modales.
- Mensajes de confirmacion, error y carga mediante notificaciones visuales.
- Confirmacion antes de eliminar registros.
- Manejo de imagen de respaldo cuando una URL externa no carga.
- Formularios con validacion de campos obligatorios.

### Could Have

Funcionalidades deseables para ampliar el valor del producto:

- Recomendaciones de atractivos segun departamento, circuito o tipo de experiencia.
- Mas categorias de actividades, por ejemplo aventura, cultura, historia, naturaleza o religioso.
- Calificaciones o comentarios de usuarios.
- Favoritos sincronizados en base de datos por usuario.
- Panel con estadisticas de atractivos mas guardados o mas consultados.
- Integracion con servicios externos de clima o distancia.
- Carga de imagenes directa a Cloudinary desde todos los formularios administrativos.

### Won't Have por ahora

Funcionalidades fuera del alcance actual:

- Reservas turisticas.
- Pagos en linea.
- Contratacion directa de guias, excursiones o alojamientos.
- Sistema de disponibilidad horaria.
- Geolocalizacion en tiempo real del usuario.
- Chat interno entre turistas y prestadores.
- Aplicacion movil nativa.

## 6. Funcionalidades del sitio

### Pagina principal

Presenta la identidad general del proyecto y funciona como entrada a las secciones principales del sitio turistico.

### Atractivos

Permite consultar tarjetas de atractivos turisticos. Cada tarjeta muestra imagen, departamento, nombre, descripcion breve y botones para abrir mapa o video. La pagina incluye filtros por nombre, departamento y circuito.

### Detalle de atractivo

Permite consultar informacion ampliada de un atractivo especifico, incluyendo descripcion, multimedia y datos asociados.

### Circuitos

Lista los circuitos turisticos cargados en la base de datos. Cada circuito puede agrupar uno o mas atractivos.

### Actividades

Muestra actividades asociadas a atractivos concretos, con descripcion y duracion estimada.

### Itinerario

Permite que un usuario guarde atractivos de interes para organizar un recorrido personal.

### Autenticacion

Incluye registro, inicio de sesion y consulta de sesion activa. La autenticacion permite distinguir usuarios comunes de administradores.

### Administracion

Incluye pantallas para cargar atractivos, circuitos y actividades. Estas secciones estan pensadas para usuarios con rol administrador.

## 7. Entidades principales del dominio

### Atractivo

Representa un lugar turistico de Catamarca. Campos principales:

- Nombre.
- Departamento.
- Descripcion.
- Imagen.
- Circuito asociado.
- URL de YouTube.
- URL de Google Maps.

### Circuito

Representa una ruta o propuesta turistica que agrupa atractivos. Campos principales:

- Nombre.
- Descripcion.

### Actividad

Representa una experiencia concreta que puede realizarse en un atractivo. Campos principales:

- Nombre.
- Descripcion.
- Duracion estimada.
- Costo aproximado.
- Atractivo asociado.

### Usuario

Representa una persona registrada en el sistema. Campos principales:

- Nombre o datos de identificacion definidos por el modelo.
- Credenciales de acceso.
- Rol de usuario o administrador.
- Itinerario personal.

## 8. Especificaciones tecnicas

### Framework principal

El proyecto esta desarrollado con Next.js `16.2.6`, utilizando la estructura `app/` propia del App Router.

### Lenguaje

El proyecto usa principalmente JavaScript para paginas, componentes, rutas API y scripts. Tambien incluye configuracion TypeScript mediante `tsconfig.json`, `next-env.d.ts`, `layout.tsx` y `next.config.ts`.

### Frontend

Tecnologias y librerias principales:

- React `19.2.4`.
- React DOM `19.2.4`.
- Tailwind CSS `4`.
- Componentes cliente con `"use client"`.
- `next/image` para renderizado de imagenes.
- `next/link` y `next/navigation` para navegacion.
- SweetAlert2 para confirmaciones visuales.

### Backend

El backend se implementa con Route Handlers de Next.js dentro de `app/api/`.

Rutas principales:

- `app/api/atractivos/route.js`
- `app/api/atractivos/[id]/route.js`
- `app/api/circuitos/route.js`
- `app/api/circuitos/[id]/route.js`
- `app/api/actividades/route.js`
- `app/api/actividades/[id]/route.js`
- `app/api/auth/login/route.js`
- `app/api/auth/register/route.js`
- `app/api/auth/session/route.js`
- `app/api/itinerario/route.js`

### Base de datos

La base de datos utilizada es MongoDB. La conexion se realiza mediante Mongoose `9.6.2`, usando la variable de entorno `MONGODB_URI` definida en `.env.local`.

Archivo de conexion:

- `lib/mongodb.js`

Modelos principales:

- `models/Atractivo.js`
- `models/Circuito.js`
- `models/Actividad.js`
- `models/User.js`

### Autenticacion y autorizacion

El proyecto utiliza:

- `bcryptjs` para hash de contrasenas.
- `jsonwebtoken` para manejo de tokens JWT.
- Middleware/helper de autorizacion en `lib/authMiddleware.js`.

El sistema diferencia al menos dos perfiles:

- Usuario comun.
- Administrador.

Las operaciones administrativas requieren validacion de permisos.

### Variables de entorno

Variables detectadas en `.env.local`:

- `MONGODB_URI`: cadena de conexion a MongoDB.
- `JWT_SECRET`: secreto utilizado para firmar/verificar tokens JWT.

### Herramientas de desarrollo

Scripts disponibles:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

El proyecto usa ESLint `9` con `eslint-config-next` `16.2.6`.

### MCP local para MongoDB

Se agrego un servidor MCP local para conectarse a MongoDB desde Codex:

- `scripts/mcp-mongodb.js`

Herramientas disponibles:

- `mongodb_database_info`
- `mongodb_list_collections`
- `mongodb_count_documents`
- `mongodb_find_documents`
- `mongodb_insert_document`
- `mongodb_update_document`
- `mongodb_aggregate`

Este MCP lee `MONGODB_URI` desde `.env.local`, evitando duplicar credenciales en la configuracion global.

### Scripts de carga de datos

Se agrego un script idempotente para cargar atractivos, circuitos y actividades de ejemplo:

- `scripts/seed-extra-attractions.js`

Este script crea o actualiza registros sin duplicarlos cuando se vuelve a ejecutar.

## 9. Estructura general del proyecto

Directorios principales:

- `app/`: paginas, layouts y rutas API.
- `components/`: componentes reutilizables de interfaz.
- `lib/`: utilidades compartidas, conexion a MongoDB, autenticacion y datos comunes.
- `models/`: modelos Mongoose.
- `public/`: recursos estaticos.
- `scripts/`: herramientas locales y scripts de carga.
- `docs/`: documentacion del proyecto.

## 10. Criterios de calidad esperados

- Las pantallas deben ser claras, navegables y adaptables a distintos tamanos de pantalla.
- Los formularios deben validar campos obligatorios antes de enviar datos.
- Las operaciones de administracion deben estar protegidas por rol.
- Las imagenes externas deben tener manejo de fallback para evitar iconos rotos.
- Las relaciones entre atractivo, circuito y actividad deben mantenerse consistentes.
- Las descripciones deben usar un tono formal, turistico y comprensible.
- El sitio debe poder ejecutarse localmente con `npm run dev`.
- El codigo debe pasar `npm run lint` antes de considerarse estable.

## 11. Limitaciones actuales

- Algunas URLs de imagen y video dependen de servicios externos.
- No hay sistema de reservas ni pagos.
- Las ubicaciones se guardan como URLs de Google Maps.
- La administracion depende del rol registrado en la base de datos.
- El proyecto no incluye pruebas automatizadas dedicadas por ahora.

## 12. Posibles mejoras futuras

- Normalizar nombres con acentos y soporte completo de codificacion en scripts de carga.
- Agregar pruebas automatizadas para rutas API y componentes principales.
- Mejorar el panel administrativo con tablas, busquedas y edicion inline.
- Crear categorias de actividades y niveles de dificultad.
- Incorporar valoraciones de usuarios.
- Permitir carga de imagenes desde el panel administrativo hacia un servicio de almacenamiento.
- Agregar recomendaciones personalizadas para itinerarios.
