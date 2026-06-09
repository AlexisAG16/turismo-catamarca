# Turismo Catamarca

Aplicación web full stack para descubrir atractivos turísticos de los 16 departamentos de Catamarca, consultar circuitos y actividades, armar un itinerario personal y administrar el catálogo desde MongoDB.

## Funcionalidades

- Atractivos con imagen, descripción, departamento, mapa y video.
- Filtros por nombre, departamento y circuito, con limpieza general.
- Paginación backend de 6 registros por página.
- Detalles de atractivos con sus actividades asociadas.
- Circuitos con atractivos relacionados y páginas de detalle.
- Itinerario con alta, eliminación individual, vaciado e impresión.
- Registro, sesión JWT y roles de usuario/administrador.
- CRUD administrativo con validación frontend y backend.
- Informe Excel de atractivos, circuitos y actividades.
- Modo claro/oscuro persistente.
- Estados vacíos, notificaciones y fallback de imágenes.
- Interfaz responsive, navegación móvil y footer global.
- Footer con copyright, redes, ubicación y accesos internos.
- SEO básico mediante Metadata de Next.js.

## Modelo del dominio

- **Atractivo:** lugar turístico con departamento, imagen, mapa, video, actividades y circuito opcional.
- **Actividad:** experiencia asociada obligatoriamente a un atractivo.
- **Circuito:** recorrido que agrupa uno o varios atractivos.
- **Usuario:** cuenta autenticada con rol e itinerario.

La relación central es `Atractivo -> Actividades`. Los circuitos agrupan atractivos, pero las actividades no dependen directamente de un circuito.

## Tecnologías

- Next.js `16.2.6` y React `19.2.4`.
- Tailwind CSS `4`.
- MongoDB y Mongoose `9.6.2`.
- JWT y `bcryptjs`.
- React Icons y SweetAlert2.
- JavaScript y TypeScript.

## Estructura

```text
app/          Páginas, layout y endpoints API
components/   Componentes reutilizables
docs/         Especificación e informe Word
lib/          MongoDB, autenticación y validaciones
models/       Modelos Mongoose
public/       Recursos estáticos
scripts/      MCP, semillas y mantenimiento
specs/        Especificación OpenAPI
```

## Instalación

```bash
npm install
```

Crear `.env.local`:

```env
MONGODB_URI=...
JWT_SECRET=...
```

Iniciar el proyecto:

```bash
npm run dev
```

Disponible en `http://localhost:3000`.

## Comandos

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## API

Los Route Handlers están en `app/api/` e incluyen atractivos, circuitos, actividades, autenticación, itinerario e informes. La referencia está en [`specs/catamarca_tourism_openapi-v2.json`](specs/catamarca_tourism_openapi-v2.json).

## Calidad de datos

- Departamentos seleccionados desde un catálogo cerrado.
- Referencias MongoDB verificadas antes de asociarse.
- Textos almacenados y mostrados en UTF-8.
- URLs opcionales validadas cuando se informan.
- Imágenes reales y coherentes como primera opción.
- Fallback visual para recursos externos.

## Documentación

- [Especificación funcional y técnica](docs/especificacion-proyecto.md)
- [Informe general de estudio en Word](docs/informe-general-turismo-catamarca-2026.docx)

## Limitaciones

- Algunas imágenes y videos dependen de servicios externos.
- No existe carga propia de imágenes.
- Todavía no hay una suite automatizada de pruebas.
- Facebook, X e Instagram usan enlaces generales hasta disponer de perfiles oficiales.

## Próximas mejoras

- Almacenamiento propio de imágenes.
- Categorías, dificultad y temporada recomendada.
- Itinerario completamente sincronizado por usuario.
- Pruebas automatizadas para API y flujos críticos.
- Panel administrativo con métricas y búsqueda avanzada.

Proyecto académico desarrollado por Alexis. © 2026 Turismo Catamarca.
