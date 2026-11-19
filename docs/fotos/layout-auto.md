# Layout automático por ranura

Agrandado = ancho renderizado a 1920 px (medido con `npm run photos:measure`, por el zoom del recorrido si lo hay) dividido por el ancho del recorte publicado a pantalla completa. Hasta 1.35x la ranura va a cover; si no, a su layout alternativo. "explícito" = el layout está fijado en photos.config.json.

| Ranura | Foto | Recorte px | Render 1920 px | Agrandado | Layout resultante |
|---|---|---|---|---|---|
| hero.principal | F043 | 1320 | 825 | 0.63x | cover (recorte base) |
| hero.secundaria | F041 | 1320 | 825 | 0.63x | cover (recorte base) |
| story.llegada | F033 | 1320 | 1920 x1.12 | 1.63x | cover (explícito, sin límite de agrandado) |
| story.ceremonia | F057 | 4284 | 1920 x1.12 | 0.5x | cover (explícito, sin límite de agrandado) |
| story.fiesta | F029 | 1320 | 1920 x1.12 | 1.63x | cover (explícito, sin límite de agrandado) |
| story.noche | F048 | 1320 | 1920 x1.12 | 1.63x | cover (explícito, sin límite de agrandado) |
| lluvia.sol | F035 | 1194 | 677 | 0.57x | cover (recorte base) |
| lluvia.cubierto | F037 | 1320 | 677 | 0.51x | cover (recorte base) |
| home.casamientos | F028 | 1320 | 588 | 0.45x | cover (recorte base) |
| home.empresas | F032 | 1320 | 588 | 0.45x | cover (recorte base) |
| casamientos.hero | F057 | 4284 | 1216 | 0.28x | cover (explícito) |
| casamientos.parque | F035 | 1194 | 463 | 0.39x | cover (recorte base) |
| casamientos.servicios | F047 | 1309 | 463 | 0.35x | split (explícito) |
| casamientos.lluvia | F045 | 1320 | 677 | 0.51x | mosaico (explícito) |
| espacios.hero | F027 | 1320 | 463 | 0.35x | split (explícito) |
| espacios.parque | F032 | 1320 | 463 | 0.35x | split (explícito) |
| espacios.cubierto | F037 | 1317 | 463 | 0.35x | split (explícito) |
| espacios.ceremonia | F057 | 4284 | 568 | 0.13x | split (explícito) |
| espacios.llegada | F052 | 1320 | 463 | 0.35x | split (explícito) |
| contacto.hero | F035 | 1194 | 568 | 0.48x | cover (recorte base) |
| contacto.entrada | F015 | 1320 | 463 | 0.35x | split (explícito) |
