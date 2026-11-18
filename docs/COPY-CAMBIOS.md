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
| "Escenas del recorrido" | Riel del recorrido | Etiqueta accesible del grupo de botones. |
| "Cerrar el panel" | Consulta express | Etiqueta accesible del botón de cierre. |

## Agregados con el recorte y el panel de consulta (anexo v2.3)
| Qué | Dónde | Por qué |
|---|---|---|
| "Escribinos por WhatsApp y te respondemos por ahí." y "Escribir por WhatsApp" | Panel de consulta, sin JS o antes de hidratar | Texto de la versión sin JS. El mensaje de WhatsApp es el genérico del documento. |
| "Fecha, si ya la tenés", "Empresa" (antes "Evento de empresa") | Panel de consulta, paso 1 | Paso 1 con solo fecha y tipo de evento. Vacío en la fecha reemplaza a "Todavía no tengo fecha". |
| "Cantidad de invitados" con los rangos de antes | Panel de consulta, paso de contacto | Pasó del paso 1 al formulario de contacto. Los rangos siguen pendientes de confirmar con el cliente. |
| Se reutiliza "Vení a verlo con tu evento en mente" y su texto, con "Coordinar una visita" y "Consultar por mi fecha" | Inicio, bloque de visita de la segunda pantalla | Es el bloque que estaba en el cierre. |
| "Cómo llegar" y la dirección en una línea | Inicio, cierre con el mapa | Cierre reducido a mapa, dirección y un único botón. |

Se sacó el carrusel de testimonios, así que dejan de existir sus etiquetas accesibles. La sección de testimonios no se muestra con menos de 3 aprobados.

## Agregados con Espacios, Contacto y las páginas nuevas (cierre de fase 1)
| Qué | Dónde | Por qué |
|---|---|---|
| "El formulario necesita JavaScript. Mientras tanto, escribinos por WhatsApp y te respondemos por ahí." | Contacto, sin JS | Aviso de interfaz. |
| "Si todavía no la tenés, dejalo vacío." | Contacto, campo de fecha | Microcopy; sale de "Mantener opcionales fecha y cantidad" del documento. |
| "Nombre", "Correo", "WhatsApp", "Mensaje", "Nombre de la organización", "Tipo de evento", "Cantidad aproximada de personas", "Fecha estimada" | Formulario de Contacto | Etiquetas del documento. |
| "Ambiente que imaginás" con "A definir", "Al aire libre", "Espacio cubierto", "Los dos" | Formulario de Contacto | Pregunta nuestra para armar la propuesta. No afirma nada del lugar. Pendiente de aprobar. |
| "Nombres de la pareja", "¿Querés hacer la ceremonia en la quinta?" (Sí, No, A definir), "Objetivo del encuentro" | Formulario de Contacto, por tipo de evento | Salen de la FAQ "¿Cómo pido un presupuesto?". |
| "A definir" | Planilla y correo, para fecha, invitados, ambiente y mensaje vacíos | Evita celdas vacías. |
| Correo de aviso ("Nueva consulta: ...") y autorrespuesta ("Recibimos tu consulta", "Hola [nombre], ...", "Si querés agregar algo, respondé este correo.") | `apps-script/Code.gs` | La autorrespuesta usa el texto de confirmación del documento y el resumen de lo cargado. Sin plazo de respuesta. |
| Texto completo de la política de privacidad | `src/content/privacidad.ts` | **Borrador sin validación legal.** El documento no trae texto. Lleva aviso visible mientras `site.privacyReviewed.validated` sea false. |
| "Consultar por mi fecha" | Cierre de Preguntas frecuentes y de Eventos reales (el de Reales es "Consultar por un evento como este", del documento) | Reusa el botón del documento. |
| "Tipo de evento", "Todos", "Ver foto", "Foto anterior", "Foto siguiente", "Cerrar" | Eventos reales, filtro y lightbox | Microcopy de interfaz. |
| "Historia casamiento-a" y similares (etiqueta accesible) | Eventos reales | Etiqueta interna del grupo de fotos. Se cambia cuando haya datos aprobados de cada evento. |
| "Cómo se arma tu presupuesto" y su texto ("Depende de la fecha, de la cantidad de invitados y de los servicios que elijas. Al pedir presupuesto vas a recibir el detalle de lo incluido, las opciones disponibles y los adicionales. Así podés comparar propuestas con el mismo alcance.") | Casamientos | Título del brief v2 7.4. La segunda y tercera oración son del documento. **No se muestra** hasta `site.presupuestoBloque.validated = true`. Sin cifras. |
| "En esta página" | Política de privacidad, índice lateral | Etiqueta accesible. |

## Ambiguos o recortados (sin cambios)
- Eventos reales: las historias no llevan título propio ni pie de foto. Los datos (invitados, época del año, sector) solo se muestran con `aprobado: true` en `src/content/reales.ts`.
