# Cambios de copy para aprobación del cliente

Todo texto que no es verbatim del documento de textos. Se completa a medida que se construyen las páginas.

## Erratas corregidas
| Dónde | Antes | Ahora |
|---|---|---|
| Inicio, descripción SEO | "6.000 m², y propuestas" | "6.000 m² y propuestas" |

## Texto escrito por nosotros
| Qué | Dónde | Por qué |
|---|---|---|
| "Mirá cómo se vive la celebración bajo techo cuando llueve." | Eventos reales, sección clima | El texto del documento era una nota interna. |
| Mensaje de WhatsApp de casamiento, casamiento con lluvia, empresa y visita | `src/lib/whatsapp.ts` | Variantes del mensaje base, con los corchetes literales. |
| Botón "Coordinar una visita" | Inicio, bloque "Vení a verlo…" | El brief pide un CTA en ese bloque. Reusa la etiqueta de la acción destacada. |
| "Cómo llegar" | Inicio, bloque de visita | Enlace de indicaciones por dirección, sin perfil de Maps. |
| "Menú", "Cerrar", "Saltar al contenido" | Header | Microcopy de interfaz. |
| "Escribinos por WhatsApp" | Botón flotante | Etiqueta accesible. |
| "Dónde estamos" | Pie de página | Rótulo de columna. |
| Texto de la página 404 | 404 | No hay copy en el documento. |
| Alt de las fotos | `src/content/photos.ts` | Descripciones de las fotos provisorias. |

## Ambiguos o recortados
- **Eventos reales, Casamientos:** se publica solo "Ceremonias, recepciones y fiestas con distintos armados." El resto de la frase (cantidad de invitados, época del año, aprobación de quienes aparecen) es política interna.
- **FAQ, estacionamiento:** se omite la cifra de vehículos y la referencia a la base de información.
- **Eventos reales, Eventos de empresa:** sección oculta hasta tener ejemplos reales.
