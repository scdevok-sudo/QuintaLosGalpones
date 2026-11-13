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

## Agregados con la dirección visual v2 (Inicio)
| Qué | Dónde | Por qué |
|---|---|---|
| "6.000 m² de parque, 320 m² cubiertos y a 500 metros de Panamericana." | Hero, debajo de los botones | Frase corriente armada con los datos del copy, pedida por el brief v2. |
| "Un día en Los Galpones", y las escenas "Llegada", "Ceremonia", "Fiesta", "Noche" | Recorrido de Inicio | Nombres definidos en el brief v2. Los textos de cada escena son frases del documento. |
| "Cómo seguimos" y los pasos "Contanos tu evento", "Visitás la quinta", "Recibís la propuesta por escrito" | Inicio | Títulos del brief v2. Las bajadas son frases del documento (Contacto y FAQ). |
| Ficha del lugar (Parque, Espacio cubierto, Ceremonia, Servicios, Estacionamiento, Llegada) | Inicio | Rótulos nuestros. Las definiciones salen del copy, sin datos nuevos. |
| "Ver el lugar con", "Sol", "Lluvia", "El parque a pleno sol.", "El armado cubierto." | Interruptor de "¿Y si llueve?" | Etiquetas y pies de foto del interruptor. |
| "Ver el mapa" | Fachada del mapa | Botón que carga el mapa de Google recién al hacer clic. |
| Panel de consulta express: "Tipo de evento", "Fecha", "Todavía no tengo fecha", "Cantidad de invitados", "Hasta 100", "De 100 a 200", "Más de 200", "Todavía no sé", "Seguir", "¿Cómo preferís seguir?", "Seguir por WhatsApp", "Prefiero que me escriban", "Volver", "Volver a los datos", "Cerrar", "Probar de nuevo", "Escribir por WhatsApp" | Consulta express | Microcopy de interfaz. Los rangos de invitados son opciones de formulario, no una afirmación de capacidad. Hay que confirmarlos con el cliente. |
| "Contanos tu nombre." y "Dejanos un correo o un WhatsApp para poder responderte." | Validación de la consulta express | Mensajes de error de campos. |
| Mensaje de WhatsApp completado ("Pensamos en 12/03/2027 para hasta 100 personas") | Consulta express | Mensaje base del documento con lo elegido. Lo que falta queda entre corchetes. |
| "Consultar por mi fecha" (barra inferior mobile) | Toda la web en mobile | Texto del documento (Casamientos, botón del hero). |

## Agregados con la capa de movimiento (anexo v2.2)
| Qué | Dónde | Por qué |
|---|---|---|
| "Testimonios, deslizá para ver el siguiente", "Elegir testimonio", "Ir al testimonio de [nombre]" | Carrusel de testimonios | Etiquetas accesibles del carrusel y sus puntos. |
| "Escenas del recorrido" | Riel del recorrido | Etiqueta accesible del grupo de botones. |
| "Cerrar el panel" | Consulta express | Etiqueta accesible del botón de cierre. |
