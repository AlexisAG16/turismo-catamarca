# Turismo Catamarca - Especificación del Proyecto

Aplicación web para explorar atractivos turísticos de Catamarca, consultar circuitos, asociar actividades, guardar un itinerario personal y administrar la información turística desde una base de datos MongoDB.

## 1. Descripción Breve Del Problema

La información turística de Catamarca suele estar distribuida entre páginas institucionales, redes sociales, mapas, videos, notas periodísticas y recomendaciones informales. Esa dispersión dificulta que una persona pueda descubrir atractivos por departamento, conocer actividades asociadas, ver ubicaciones reales y organizar una visita sin saltar entre muchas fuentes.

El proyecto aborda la necesidad de centralizar la consulta turística provincial en una plataforma clara, visual y administrable. La solución permite presentar atractivos, circuitos y actividades con textos formales, imágenes, videos y enlaces de mapa, reduciendo la fricción entre descubrir un lugar y planificar una visita.

## 2. Destinatarios Principales

- Turistas que desean conocer Catamarca y necesitan información organizada antes o durante el viaje.
- Residentes interesados en redescubrir atractivos, actividades y circuitos provinciales.
- Usuarios registrados que quieren guardar atractivos en un itinerario personal.
- Administradores responsables de cargar, corregir y mantener datos turísticos.
- Docentes, evaluadores o equipos técnicos que necesitan revisar el alcance funcional y técnico del proyecto.

## 3. Contexto De Uso

El sitio está pensado para navegadores web en escritorio, tablet y celular. Puede utilizarse en etapa de planificación, durante el viaje o como catálogo turístico provincial. El usuario público puede filtrar atractivos, navegar por páginas de resultados, abrir mapas, consultar videos, revisar actividades y guardar lugares en su itinerario.

El usuario administrador puede acceder a formularios protegidos para cargar, editar y eliminar atractivos, circuitos y actividades. También puede descargar un informe Excel con información asociada de las tres entidades principales.

## 4. Objetivo De La Solución

Centralizar la oferta turística de Catamarca en una aplicación web responsive, administrable y conectada a MongoDB, que permita:

- Consultar atractivos por nombre, departamento y circuito.
- Ver detalles de cada atractivo con actividades asociadas.
- Relacionar circuitos con sus atractivos.
- Crear un itinerario personal de atractivos.
- Descargar informes administrativos en formato `.xlsx`.
- Mantener datos turísticos con validación backend y estructura consistente.

## 5. Alcance Funcional Con MoSCoW

### Must Have

- Listado público de atractivos turísticos.
- Paginación backend de atractivos con 6 registros por página.
- Filtros por nombre, departamento y circuito.
- Detalle individual de atractivo.
- Listado y detalle de circuitos.
- Listado de actividades asociadas a atractivos.
- Relación principal actual: un atractivo puede tener una o varias actividades.
- Asociación de circuitos con uno o varios atractivos.
- Registro, inicio de sesión y consulta de sesión.
- Diferenciación de rol entre usuario común y administrador.
- Formularios administrativos para atractivos, circuitos y actividades.
- Validaciones backend para altas y ediciones.
- Persistencia en MongoDB mediante Mongoose.
- Enlaces de Google Maps por atractivo.
- Enlaces de YouTube o búsqueda específica por atractivo.
- Manejo de imágenes externas con fallback visual.
- Itinerario personal con alta, baja individual y vaciado completo.
- Modo claro/oscuro disponible globalmente.

### Should Have

- Botón de volver desde el detalle de atractivo conservando la página del paginado.
- Estados vacíos útiles cuando no hay resultados.
- Confirmaciones visuales antes de borrar registros.
- Toasts de carga, éxito y error.
- Botones administrativos de editar y borrar integrados dentro de las tarjetas.
- Botón administrativo de informe en soporte.
- Descarga de informe Excel con hojas separadas para circuitos, atractivos y actividades.
- SEO básico mediante metadata global.
- Normalización de textos rotos por codificación en la base de datos y en el código.
- Soporte responsive en navegación, tarjetas, listas, modales y menús.

### Could Have

- Categorías explícitas para atractivos o actividades: religioso, natural, arqueológico, cultural, aventura.
- Niveles de dificultad y recomendaciones de preparación para actividades.
- Carga directa de imágenes desde el panel administrativo a un servicio de almacenamiento.
- Favoritos sincronizados entre dispositivos desde MongoDB.
- Recomendaciones automáticas por departamento o tipo de experiencia.
- Estadísticas de atractivos más guardados o más consultados.
- Pruebas automatizadas para APIs, formularios y flujos principales.

### Won't Have Por Ahora

- Reservas turísticas.
- Pagos en línea.
- Contratación directa de guías, excursiones o alojamientos.
- Chat interno entre turistas y prestadores.
- Geolocalización en tiempo real.
- Aplicación móvil nativa.
- Sistema de disponibilidad horaria.

## 6. Funcionalidades Del Sitio

### Inicio

Página de entrada al sitio con navegación hacia atractivos, circuitos, actividades, contacto, soporte, autenticación e itinerario.

### Atractivos

Listado principal de atractivos turísticos. Incluye:

- Tarjetas con imagen, departamento, nombre y descripción breve.
- Botones para mapa y video.
- Botón de itinerario con ícono de corazón.
- Filtros por nombre, departamento y circuito.
- Selector de departamentos completo para los 16 departamentos de Catamarca.
- Paginación con primera, anterior, siguiente y última página.
- Estados vacíos con mensaje contextual y botón para limpiar filtros.
- Controles de edición y eliminación dentro de la tarjeta para administradores.

### Detalle De Atractivo

Página individual de un atractivo. Incluye:

- Imagen principal con fallback.
- Descripción completa.
- Departamento.
- Actividades asociadas.
- Enlaces de mapa y video.
- Botón para volver a la lista conservando la página previa del paginado.

### Circuitos

Listado de circuitos en formato de lista vertical de ancho completo, evitando tarjetas cuadradas. Cada circuito muestra nombre, descripción y acceso a su detalle.

### Detalle De Circuito

Página individual de circuito. Muestra:

- Nombre y descripción.
- Atractivos asociados.
- Actividades de los atractivos del circuito.
- Imagen de referencia basada en el primer atractivo disponible.
- Fallback si la imagen externa falla.

### Actividades

Listado de actividades con descripción, duración estimada y atractivo asociado. Las actividades son experiencias concretas vinculadas a atractivos, no a circuitos como dependencia principal.

### Itinerario

Funcionalidad de planificación personal. Incluye:

- Botón global en la navegación.
- Modal desplegable con atractivos guardados.
- Contador de elementos.
- Eliminación individual desde el modal.
- Botón para vaciar todo el itinerario.
- Página dedicada de itinerario con resumen, acciones y opción de impresión.
- Persistencia local y sincronización con eventos del navegador.

### Autenticación

Incluye:

- Registro.
- Inicio de sesión.
- Cierre de sesión.
- Consulta de sesión activa.
- Uso de JWT.
- Hash de contraseña con `bcryptjs`.

### Administración

El rol administrador habilita:

- Carga de atractivos.
- Carga de circuitos.
- Carga de actividades.
- Edición y borrado desde listados.
- Botón `Informe` en soporte.
- Descarga de Excel con datos asociados.

### Soporte E Informes

La página de soporte incorpora un botón administrativo `Informe`, con comportamiento responsive. Descarga un archivo `.xlsx` generado desde el backend con tres hojas:

- `Circuitos`.
- `Atractivos`.
- `Actividades`.

El informe incluye datos asociados entre entidades para facilitar revisión, entrega o respaldo.

### Modo Claro/Oscuro

El sitio cuenta con un selector global de tema con íconos de sol y luna. El estado se conserva en `localStorage`, evita errores de hidratación y se sincroniza entre componentes mediante eventos.

## 7. Datos Turísticos Cargados

La base de datos fue ampliada para cubrir al menos un atractivo en cada uno de los 16 departamentos de Catamarca:

- Ambato.
- Ancasti.
- Andalgalá.
- Antofagasta de la Sierra.
- Belén.
- Capayán.
- Capital.
- El Alto.
- Fray Mamerto Esquiú.
- La Paz.
- Paclín.
- Pomán.
- Santa María.
- Santa Rosa.
- Tinogasta.
- Valle Viejo.

También se agregaron atractivos religiosos, arqueológicos, naturales y museísticos, entre ellos:

- Catedral Basílica Nuestra Señora del Valle.
- Gruta de la Virgen del Valle.
- Monumento a la Virgen del Valle.
- Monumento a Nuestra Señora de Belén.
- Iglesia de San Pablo.
- Dique de Collagasta.
- Dique La Cañada.
- El Shincal de Quimivil.
- Campo de Piedra Pómez.
- Dunas de Tatón.
- Museo Arqueológico Adán Quiroga.
- Museo de la Virgen del Valle.
- Museo Arqueológico Cóndor Huasi.

Las imágenes se clasifican mediante `public_id`. Cuando una imagen es generada o provisoria, se marca con prefijos como `generada-*`. Cuando se encuentra una imagen real estable, se usa una URL directa o una redirección estable de Wikimedia, Fotopaises, Turismo SFVC u otra fuente pública.

## 8. Entidades Del Dominio

### Atractivo

Representa un lugar turístico. Campos principales:

- `nombre`.
- `departamento`.
- `descripcion`.
- `imagen.public_id`.
- `imagen.url`.
- `actividades`.
- `youtubeUrl`.
- `googleMapsUrl`.
- `circuito` cuando corresponde.

### Circuito

Representa una propuesta de recorrido. Campos principales:

- `nombre`.
- `descripcion`.
- `atractivos`.

### Actividad

Representa una experiencia asociada a un atractivo. Campos principales:

- `nombre`.
- `descripcion`.
- `duracionEstimada`.
- `atractivo`.

El campo `costoAproximado` existe en el modelo como opcional, pero no forma parte del formulario ni se exige en la validación backend.

### Usuario

Representa una persona registrada. Campos principales:

- Datos de identificación.
- Email.
- Contraseña hasheada.
- Rol.
- Itinerario cuando aplica.

## 9. Especificaciones Técnicas

### Stack Principal

- Next.js `16.2.6`.
- React `19.2.4`.
- React DOM `19.2.4`.
- Tailwind CSS `4`.
- MongoDB.
- Mongoose `9.6.2`.
- JavaScript como lenguaje principal.
- TypeScript en configuración y layout.

### App Router

El proyecto utiliza la estructura `app/` de Next.js:

- Páginas públicas.
- Páginas dinámicas.
- Route Handlers API.
- Layout global.
- Metadata SEO.

### Backend

El backend se implementa mediante Route Handlers en:

- `app/api/atractivos/route.js`.
- `app/api/atractivos/[id]/route.js`.
- `app/api/circuitos/route.js`.
- `app/api/circuitos/[id]/route.js`.
- `app/api/actividades/route.js`.
- `app/api/actividades/[id]/route.js`.
- `app/api/auth/login/route.js`.
- `app/api/auth/register/route.js`.
- `app/api/auth/session/route.js`.
- `app/api/itinerario/route.js`.
- `app/api/informes/excel/route.js`.

### Validación Backend

Las APIs administrativas validan datos antes de persistir:

- Texto obligatorio.
- Longitud mínima y máxima.
- URLs `http` o `https`.
- IDs válidos de MongoDB.
- Existencia de referencias asociadas.
- Evitar duplicados por nombre.
- Validación de atractivo asociado en actividades.
- Validación de atractivos asociados en circuitos.

Archivo central:

- `lib/serverValidation.js`.

### Base De Datos

MongoDB se conecta mediante:

- `lib/mongodb.js`.

Modelos:

- `models/Atractivo.js`.
- `models/Circuito.js`.
- `models/Actividad.js`.
- `models/User.js`.

Variables de entorno necesarias:

- `MONGODB_URI`.
- `JWT_SECRET`.

### Autenticación Y Autorización

- `bcryptjs` para contraseñas.
- `jsonwebtoken` para tokens.
- Helper de autorización en `lib/authMiddleware.js`.
- Middleware/proxy en `proxy.js` para rutas protegidas.

### Informes Excel

El endpoint `app/api/informes/excel/route.js` genera un `.xlsx` sin depender de una librería externa de planillas. Construye internamente las partes Open XML del workbook y devuelve un archivo con hojas para circuitos, atractivos y actividades.

### SEO Básico

El layout global define:

- `metadataBase`.
- Título default y template.
- Descripción.
- Keywords.
- Open Graph.
- Robots index/follow.
- Idioma `es`.

### Imágenes Y Fallback

Las tarjetas y páginas de detalle contemplan imágenes externas. Si una imagen no carga:

- Se usa fallback visual.
- Se evita dejar íconos rotos.
- Se preserva la estabilidad visual de la tarjeta.

### Paginación

La paginación de atractivos se calcula desde backend:

- Query params: `page`, `limit`, `nombre`, `departamento`, `circuito`.
- Límite por defecto: 6.
- Respuesta con `paginacion`.
- Navegación por primera, anterior, siguiente y última página.

### Normalización De Textos

Se trabajó sobre textos con caracteres rotos por codificación. El proyecto debe conservar UTF-8 y escribir correctamente acentos, eñes y nombres propios:

- Catamarca.
- Belén.
- Tinogasta.
- Paclín.
- Pomán.
- Andalgalá.
- Fray Mamerto Esquiú.

## 10. Estructura Del Proyecto

```text
app/          Páginas, layouts y APIs.
components/   Componentes reutilizables.
docs/         Documentación del proyecto.
lib/          Conexión MongoDB, auth, validación y utilidades.
models/       Modelos Mongoose.
public/       Recursos estáticos.
scripts/      MCP, carga, sincronización y normalización de datos.
specs/        Especificaciones auxiliares.
```

Componentes principales:

- `Navbar.js`.
- `CardAtractivo.js`.
- `FormAtractivo.js`.
- `FormCircuito.js`.
- `Toast.js`.
- `ToastProvider.js`.
- `LoadingState.js`.

Scripts destacados:

- `scripts/mcp-mongodb.js`.
- `scripts/rebuild-tourism-data.js`.
- `scripts/normalize-spanish-text-data.js`.
- `scripts/sync-attraction-activities.js`.
- `scripts/sync-circuit-attractions.js`.
- `scripts/seed-pagination-test-data.js`.

## 11. MCP Local Para MongoDB

Se creó un MCP local para operar MongoDB desde Codex usando las credenciales de `.env.local`. Herramientas disponibles:

- `mongodb_database_info`.
- `mongodb_list_collections`.
- `mongodb_count_documents`.
- `mongodb_find_documents`.
- `mongodb_insert_document`.
- `mongodb_update_document`.
- `mongodb_aggregate`.

Esto permite auditar, insertar y corregir datos sin exponer credenciales en la conversación ni duplicarlas fuera del entorno local.

## 12. Ejecución Local

Instalar dependencias:

```bash
npm install
```

Crear `.env.local`:

```env
MONGODB_URI=...
JWT_SECRET=...
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Validar lint:

```bash
npm run lint
```

Compilar producción:

```bash
npm run build
```

## 13. Criterios De Calidad

- Mantener relaciones consistentes entre atractivos, actividades y circuitos.
- No cargar atractivos sin imagen, mapa o video/búsqueda específica.
- Preferir imágenes reales y directas. Si no existen, usar imagen generada marcada como tal.
- Evitar imágenes que muestren mapas cuando deberían mostrar paisajes o monumentos.
- Evitar paisajes confusos que no correspondan al lugar.
- Mantener textos turísticos formales y claros.
- Validar datos en backend, no solo en frontend.
- Revisar `npm run lint` antes de cerrar cambios.
- Preservar responsive en navegación, listas, tarjetas, modales y formularios.

## 14. Limitaciones Actuales

- Algunas imágenes dependen de servicios externos.
- Algunos videos son búsquedas específicas de YouTube cuando no hay un video único confiable.
- No hay tests automatizados dedicados.
- No hay carga de imágenes propia desde el panel.
- El informe Excel se genera desde backend, pero no incluye gráficos ni tablas dinámicas.
- Algunas imágenes generadas son provisorias hasta encontrar fotos reales estables.

## 15. Mejoras Futuras

- Incorporar carga de imágenes a Cloudinary, S3 u otro almacenamiento.
- Agregar categorías y etiquetas por tipo de atractivo.
- Añadir dificultad, recomendaciones y temporada sugerida en actividades.
- Sincronizar itinerario por usuario en MongoDB.
- Agregar pruebas automatizadas para APIs y formularios.
- Crear panel administrativo con tablas, filtros y edición más cómoda.
- Agregar métricas de uso e informes más completos.
- Mejorar videos reemplazando búsquedas por enlaces directos confirmados.

## 16. Actualización Visual Y Documental

### Footer Global

El layout raíz incorpora un pie de página disponible en todas las rutas. Su objetivo es cerrar visualmente la interfaz y ofrecer navegación secundaria sin alterar los flujos funcionales.

- Copyright con año calculado dinámicamente.
- Identidad y descripción breve de Turismo Catamarca.
- Enlaces internos a atractivos, circuitos, actividades y contacto.
- Ubicación general: Catamarca, Argentina.
- Accesos con iconos a Facebook, X, GitHub e Instagram.
- Enlace de GitHub dirigido al repositorio real del proyecto.
- Recomendación para verificar horarios, accesos y condiciones.
- Diseño responsive y estilos compatibles con modo claro y oscuro.
- Etiquetas accesibles, títulos y foco visible en enlaces sociales.

Los enlaces de Facebook, X e Instagram son generales hasta disponer de perfiles oficiales.

### Componentes Y Dependencias Incorporadas

- `components/Footer.tsx`: componente global del pie de página.
- `react-icons` `5.6.0`: iconos de redes sociales y ubicación.
- `app/layout.tsx`: punto de integración del footer en todas las páginas.

### Estado Actual De Calidad

- El proyecto compila correctamente con Next.js `16.2.6`.
- El análisis ESLint se ejecuta sin errores.
- La interfaz mantiene navegación responsive, modo claro/oscuro y fallback de imágenes.
- Las altas y ediciones validan textos, IDs, referencias y URLs desde backend.
- El selector de departamento utiliza los 16 valores definidos por el dominio.
