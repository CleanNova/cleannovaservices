# CleanNova — sitio web de servicios de limpieza

Sitio bilingüe (EN/ES) con **estimado instantáneo** y **reserva por solicitud** (el cliente envía la solicitud y CleanNova la confirma por teléfono o WhatsApp).

Stack: Vite + React + TypeScript. Genera un sitio estático (`dist/`) que se puede publicar en Netlify, Vercel, Cloudflare Pages o GitHub Pages.

## Comandos

```bash
npm install
npm run dev        # desarrollo en http://localhost:5173
npm run build      # revisa tipos y genera dist/
npm run preview    # sirve dist/ en http://localhost:4173
```

## Qué es PROVISIONAL (cambiar cuando haya datos oficiales)

| Qué | Dónde | Estado |
|---|---|---|
| **Precios** | `src/config/pricing.ts` | Valores de referencia para el área de San Diego. La página de Ruiz & Daughter's **no publica precios**, así que no se copió nada. |
| **Ciudades y códigos postales** | `src/config/areas.ts` | Lista de partida (San Diego + North County). Los ZIP son aproximados. |
| **Teléfono** | `src/config/site.ts` | La tarjeta dice `+1 619 2052 135`; se leyó como **(619) 205-2135**. Confirmar los dígitos. |
| **Qué incluye cada servicio** | `src/i18n/en.ts` y `es.ts` → `services.items` | Listas de ejemplo. Ajustar a lo que realmente hace CleanNova. |
| **Preguntas frecuentes** | `src/i18n/*.ts` → `faq` | Redactadas de forma genérica. Confirmar política de cancelación, si se llevan productos y equipo, formas de pago, etc. |
| **Organization Service** | `src/i18n/*.ts` → `org` | Texto genérico; confirmar qué incluye el servicio. |
| **Redes sociales** | `src/config/site.ts` → `socials` | Instagram `@cleannovasd` y Facebook (perfiles oficiales proporcionados). |
| **Logo** | `src/components/Logo.tsx`, `public/favicon.svg` | Recreado en SVG a partir de la tarjeta. Sustituir por el logo vectorial oficial. |

## Pendiente de contenido (no se inventó)

- **Reseñas / testimonios:** no hay ninguno publicado porque no se deben inventar. Agregar la sección cuando existan reseñas reales (Google, clientes).
- **Fotos reales** (equipo, antes y después). El sitio usa ilustraciones y formas, no fotos de stock.
- Seguro y *bonded*, licencias, años de experiencia: agregarlos solo si son ciertos.
- Dominio, dirección del negocio, Telegram (la tarjeta muestra el ícono pero no el usuario) y datos estructurados en `index.html`.
- Páginas legales (privacidad y términos).

## Publicación

El archivo `netlify.toml` ya trae el comando de build (`npm run build`), la carpeta (`dist`), la versión de Node y cabeceras de seguridad básicas: al importar el repo en Netlify no hay que configurar nada manualmente. Funciona igual en Vercel o Cloudflare Pages (build `npm run build`, salida `dist`).

## Cómo reciben las solicitudes

El formulario de reserva funciona en dos modos:

1. **Sin configurar (por defecto):** al final aparece un botón que abre WhatsApp con la solicitud ya escrita (y otra opción por correo). Funciona de inmediato, pero el cliente debe tocar "enviar".
2. **Con un servicio de formularios (recomendado):** la solicitud llega directo al correo de CleanNova sin que el cliente haga nada más.
   1. Crear un formulario gratis en [Formspree](https://formspree.io) o [Web3Forms](https://web3forms.com).
   2. Copiar `.env.example` a `.env` y completar `VITE_FORM_ENDPOINT` (y `VITE_FORM_ACCESS_KEY` si es Web3Forms).
   3. En el hosting, definir esas mismas variables y volver a publicar.

El campo oculto `website` es un anzuelo anti-spam: los bots que lo llenan no envían nada.

## Estructura

```
src/
  config/      site.ts (contacto) · pricing.ts (precios) · areas.ts (zonas)
  i18n/        en.ts · es.ts · index.tsx (idioma, se recuerda y se detecta del navegador)
  lib/         quote.ts (cálculo del estimado) · submit.ts (envío / WhatsApp / correo)
  components/  Header · Hero (estimador) · Sections · Footer · Logo
               booking/BookingWizard.tsx (formulario de 5 pasos)
  styles.css   sistema de diseño (colores de la tarjeta de CleanNova)
```

## Cómo se calcula el estimado

`src/lib/quote.ts`: precio base + recámaras + baños (+ recargo por tamaño), por la frecuencia (semanal −15 %, quincenal −10 %, mensual −5 %), más extras. Se muestra como rango (−8 % / +15 %) con el aviso de que el precio final lo confirma CleanNova. Oficinas se cotizan por tamaño; post-construcción y organización son "cotización personalizada".

## Experiencia de reserva (resumen)

- Si el cliente llega desde una tarjeta de servicio o el estimador, el formulario empieza en "Detalles" (un paso menos).
- Atajos de fecha (próximos 6 días) además del calendario; teléfono con formato automático; ejemplos en cada campo.
- Validación específica por campo y el cursor salta al primer error. Cada fila del resumen final tiene "Editar".
- Si el cliente recarga la página, se recupera su solicitud sin terminar (solo en esa pestaña, `sessionStorage`; se borra al enviar).
- Si el envío falla, nunca se muestra como confirmado: se conserva todo y se ofrece reintentar o escribir por WhatsApp.
- El mensaje que recibe CleanNova incluye servicio, detalles, estimado, fecha, contacto y la hora de envío (hora del Pacífico).

## Verificación

El flujo completo (32 comprobaciones: validaciones, edición, idioma, borrador, envío exitoso y fallido, móvil) y las auditorías automáticas (axe sin violaciones; Lighthouse 100/100/100/100 en escritorio y 98/100/100/100 en móvil) se ejecutaron contra la compilación de producción. Los scripts de prueba no forman parte del repositorio.

**No verificado:** la entrega a un Formspree/Web3Forms real (se probó contra un servidor de formularios simulado) y la apariencia en iPhone/Safari reales (se probó con Chromium).
