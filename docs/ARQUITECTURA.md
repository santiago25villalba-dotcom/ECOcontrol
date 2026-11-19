# EcoControl – Arquitectura técnica

## Stack tecnológico

| Capa | Tecnología | Para qué se usa |
|---|---|---|
| Frontend | HTML5, CSS3 y JavaScript (sin frameworks) | Pantallas, validaciones, cálculo del Índice Eco en el navegador y diseño responsivo. |
| Backend | PHP 8 (mysqli) | Sesiones, registro, login, diagnósticos, asesoramientos con pago simulado, contacto y panel del Titular. |
| Servicio de informes | Node.js (solo módulos nativos) | Genera el Informe de Resultado imprimible y vuelve a calcular el índice para que no se pueda falsear. |
| Base de datos | MySQL / MariaDB (XAMPP) | Usuarios, diagnósticos, asesorías, contactos y recuperaciones de contraseña. |
| Control de versiones | Git y GitHub | Un commit por cada hito del proyecto. |

## Dos formas de funcionar

El sistema funciona de dos maneras con el mismo código de pantallas:

1. **Modo servidor:** se abre desde XAMPP (`http://localhost/...`). Los datos se guardan en MySQL a través de los archivos PHP.
2. **Modo local:** se abre con doble clic (`file://`) o sin PHP. Los datos se guardan en el navegador (localStorage), de modo que el proyecto se puede probar y presentar en cualquier computadora.

`llamarPHP()` (en `js/sesion.js`) intenta hablar con el servidor; si no hay servidor devuelve `null` y la aplicación usa el modo local.

## Flujo de un diagnóstico

1. El cliente inicia sesión (sin sesión, toda la aplicación vuelve a `login.html`).
2. Responde las preguntas en 4 pasos con barra de progreso.
3. El navegador calcula el Índice Eco, el nivel y las recomendaciones.
4. El diagnóstico se guarda (`php/diagnosticos.php` en modo servidor; localStorage en modo local). El servidor recalcula el índice antes de guardar.
5. El cliente ve el resultado y puede descargar el Informe de Resultado, que genera el servicio de Node.js.

## Diccionario de endpoints

### PHP (carpeta `Frontend/php/`, método POST con JSON)

| Archivo | Acción | Datos que recibe | Respuesta |
|---|---|---|---|
| `login.php` | Inicia sesión | email, clave | Usuario (id, nombre, email, rol) o mensaje de error |
| `registro.php` | Crea la cuenta | nombre, email, clave | Usuario creado o error (correo repetido, datos inválidos) |
| `logout.php` | Cierra la sesión | – | Confirmación |
| `recuperar.php` | Genera el enlace de recuperación (1 hora, un solo uso) | email | Mensaje neutro, exista o no la cuenta |
| `nueva_clave.php` | Cambia la contraseña con el enlace | token, clave | Confirmación o «el enlace venció o ya fue usado» |
| `diagnosticos.php` | `guardar` o `listar` el historial del usuario | respuestas del diagnóstico / – | Índice y nivel recalculados / lista de diagnósticos |
| `asesoramiento.php` | Guarda una solicitud con su pago simulado | área, modalidad, teléfono, mensaje, método de pago | Confirmación; el monto, el estado del pago y la referencia los define el servidor |
| `mis_asesorias.php` | Lista las solicitudes y pagos del usuario | – | Lista de solicitudes |
| `contacto.php` | Guarda un mensaje de contacto | nombre, email, asunto, mensaje | Confirmación |
| `admin.php` | `resumen` o `cambiarEstado` (solo rol admin) | – / id y estado | Totales, solicitudes, clientes y mensajes / confirmación |

### Servicio Node.js (puerto 3000)

| Ruta | Método | Descripción |
|---|---|---|
| `/api/estado` | GET | Indica si el servicio está encendido. |
| `/api/informe` | POST | Recibe un diagnóstico en JSON y devuelve el Informe de Resultado en HTML. |

## Cálculo del Índice Eco

Cada opción vale entre 0 y 100 puntos. El puntaje de cada área (energía, agua y residuos) es el promedio de sus preguntas, y el **Índice Eco es el promedio de las tres áreas**.

| Puntaje | Nivel | Significado |
|---|---|---|
| 70 a 100 | Alto | Hábitos muy sustentables. |
| 40 a 69 | Medio | Buen punto de partida, con mejoras posibles. |
| 0 a 39 | Bajo | Conviene aplicar las recomendaciones y pedir asesoramiento. |

**Ejemplo:** energía 100, agua 52 y residuos 100 → (100 + 52 + 100) ÷ 3 = 84 → nivel **Alto**. El índice se calcula en el navegador y se vuelve a calcular en PHP y en Node.js para que nadie pueda enviar un puntaje falso.

## Seguridad

- **Contraseñas:** se guardan con `password_hash()` en MySQL; nunca en texto plano.
- **Consultas preparadas** en todos los archivos PHP, contra inyección SQL.
- **Salida segura:** los textos del usuario se muestran con `textContent`, no como HTML (probado con un intento de XSS).
- **Acceso:** sin sesión, la aplicación vuelve al login; el panel del Titular solo se abre con rol admin, y el servidor lo vuelve a comprobar.
- **Recuperación de contraseña:** enlace con código aleatorio de 64 caracteres, vigencia de 1 hora y un solo uso.
- **Pagos:** son simulados. No se cobra nada ni se piden ni guardan datos de tarjeta; el monto lo define el servidor según la modalidad.
- **Privacidad:** texto «Privacidad y términos» accesible desde el pie de página.

## Estructura del proyecto

```
ECOcontrol/
├── database/        ecocontrol.sql, migracion_pagos.sql
├── docs/            documentación (código, DER, DFD, UI/UX, pruebas, arquitectura)
├── servicio-node/   servidor.js, informe.js, indice.js y pruebas
└── Frontend/        login.html, index.html, css/, js/, img/, php/
```

## Puesta en marcha

1. Copiar la carpeta a `C:\xampp\htdocs\ecocontrol` y encender **Apache** y **MySQL**.
2. En phpMyAdmin, pestaña **Importar**, elegir `database/ecocontrol.sql`.
3. Abrir `http://localhost/ecocontrol/Frontend/login.html`.
4. Para el informe: instalar Node.js 18 o superior, abrir una terminal en `servicio-node` y ejecutar `node servidor.js`.
5. Sin servidor: abrir `Frontend/login.html` con doble clic (modo local).

**Cuentas de prueba:** cliente `demo@ecocontrol.com` / `eco123` · Titular `admin@ecocontrol.com` / `admin123`.
