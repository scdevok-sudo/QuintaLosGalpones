# Apps Script de consultas

`Code.gs` recibe lo que envían el panel de consulta y el formulario de Contacto, lo guarda en una planilla de Google, avisa por correo al cliente y le manda una autorrespuesta a quien consultó (sin promesa de plazo).

## Despliegue (una sola vez)

1. Crear una planilla de Google nueva (por ejemplo "Consultas Quinta Los Galpones"), con la cuenta que va a ser dueña de los datos.
2. En la planilla: **Extensiones > Apps Script**. Borrar lo que haya, pegar el contenido de `Code.gs` y guardar.
3. **Configuración del proyecto > Propiedades del script > Agregar propiedad**:
   | Propiedad | Valor |
   |---|---|
   | `NOTIFY_EMAIL` | Correo que recibe los avisos. Obligatoria. Hasta que el cliente pase uno con dominio propio, usar uno provisorio y cambiarlo acá (no hace falta tocar el sitio). |
   | `SENDER_NAME` | Opcional. Nombre del remitente. Por defecto "Quinta Los Galpones". |
   | `REPLY_TO` | Opcional. Correo al que responde quien recibe la autorrespuesta. Por defecto `NOTIFY_EMAIL`. |
   | `SHEET_ID` | Opcional. Solo si el script no está vinculado a la planilla. |
4. **Implementar > Nueva implementación > Aplicación web**. Ejecutar como: *Yo*. Quién tiene acceso: *Cualquier persona*. Copiar la URL que termina en `/exec`.
5. La primera vez Google pide autorizar el acceso a la planilla y al correo. Aceptar.
6. En el sitio, poner esa URL en `VITE_FORM_ENDPOINT` (archivo `.env.local` o variable del entorno de build) y volver a construir.

## Probar

- Abrir la URL `/exec` en el navegador: tiene que mostrar `{"ok":true,...}`.
- Desde la terminal (el campo `ms` simula el tiempo que el formulario estuvo abierto, tiene que ser mayor a 2500):

  ```bash
  curl -L -X POST "URL_EXEC" -H "Content-Type: text/plain" \
    -d '{"origen":"contacto","tipo":"casamiento","nombre":"Prueba","correo":"vos@ejemplo.com","ms":"5000","pagina":"/contacto"}'
  ```

  Esperado: fila nueva en la hoja `Consultas`, correo de aviso a `NOTIFY_EMAIL` y autorrespuesta a `vos@ejemplo.com`.
- Con `"sitio_web":"x"` o `"ms":"500"` responde `ok` pero no guarda ni envía nada (antispam).

## Qué guarda

Columnas: fecha de envío, tipo, nombre, organización, correo, WhatsApp, fecha del evento, rango de invitados, ambiente, mensaje (incluye pareja, ceremonia y objetivo según el tipo) y página de origen. Lo que falta se guarda como "A definir".

## Notas

- Cada vez que se cambie `Code.gs` hay que **Implementar > Administrar implementaciones > Editar > Nueva versión**; la URL no cambia.
- Cuota gratuita de Gmail: unos 100 correos por día (cuenta común). Alcanza para este volumen; con Google Workspace es mayor.
- Las celdas que empiezan con `=`, `+`, `-` o `@` se guardan con un apóstrofe delante para que la planilla no las ejecute como fórmula.
- Google es el proveedor que aloja estos datos: la política de privacidad del sitio lo dice.
