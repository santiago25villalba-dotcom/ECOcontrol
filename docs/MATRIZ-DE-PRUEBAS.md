# EcoControl – Matriz de pruebas

Pruebas realizadas el 13/11/2026 sobre la versión publicada en GitHub. Resultado: **34 aprobadas**, **0 fallidas** y **1 pendiente** de un total de 35.

**Entorno:** navegador Google Chrome (escritorio 1280 px y celular 390 px), PHP 8.3 y Node.js 22. Las pruebas de la interfaz se ejecutaron en modo local (sin servidor); las de PHP, con el servidor de PHP sin base de datos. La prueba con MySQL queda pendiente para ejecutarse en XAMPP.

| N.º | Módulo | Caso de prueba | Datos de entrada | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| P-01 | Acceso | Entrar a la aplicación sin haber iniciado sesión | Abrir index.html directamente | Redirige a la pantalla de login | Redirigió a login.html | Aprobada |
| P-02 | Acceso | Login con correo con formato inválido | santiago@ / eco123 | Mensaje de correo inválido | Ingresá un correo electrónico válido. | Aprobada |
| P-03 | Acceso | Login con contraseña de menos de 6 caracteres | demo@ecocontrol.com / 123 | Mensaje de mínimo 6 caracteres | La contraseña debe tener al menos 6 caracteres. | Aprobada |
| P-04 | Acceso | Login con contraseña incorrecta | demo@ecocontrol.com / clave999 | Mensaje de contraseña incorrecta | La contraseña es incorrecta. | Aprobada |
| P-05 | Acceso | Login con correo no registrado | nadie@gmail.com / eco123 | Mensaje de cuenta inexistente | No existe una cuenta con ese correo. Creá una cuenta nueva. | Aprobada |
| P-06 | Acceso | Mostrar y ocultar la contraseña con el botón del ojo | Clic dos veces en el ojo | La contraseña se ve y luego se oculta | Tipo del campo: text → password | Aprobada |
| P-07 | Acceso | Recuperar contraseña | malcorreo y luego demo@ecocontrol.com | Error con correo inválido; confirmación con correo válido | «Ingresá un correo electrónico válido.» / «Si el correo está registrado, vas a recibir l…» | Aprobada |
| P-08 | Registro | Crear cuenta con contraseñas distintas | secreto1 / secreto2 | Mensaje de contraseñas que no coinciden | Las contraseñas no coinciden. | Aprobada |
| P-09 | Registro | Crear cuenta con un correo ya registrado | demo@ecocontrol.com | Mensaje de cuenta existente | Ya existe una cuenta con ese correo. | Aprobada |
| P-10 | Registro | Crear cuenta con datos correctos | Santiago / santiago@gmail.com / secreto1 | Crea la cuenta y entra a la aplicación | Entró a index.html#inicio | Aprobada |
| P-11 | Navegación | Cada opción del menú muestra su pantalla | Inicio, Servicios, Diagnóstico, Proyecto, Contacto, Mi panel | Se ve la pantalla elegida | 6 de 6 pantallas correctas | Aprobada |
| P-12 | Panel | Panel de un usuario sin diagnósticos | Usuario recién registrado | Mensaje «Todavía no hiciste ningún diagnóstico» | Mensaje visible | Aprobada |
| P-13 | Seguridad | Nombre con código HTML (intento de XSS) | &lt;img src=x onerror=alert(1)&gt;Santi | Se muestra como texto y no se ejecuta | Texto mostrado: «Hola, &lt;img src=x onerror=alert(1)&gt;Santi»; alertas ejecutadas: 0 | Aprobada |
| P-14 | Diagnóstico | Avanzar sin responder | Sin elegir opciones | Mensaje pidiendo responder todo | Respondé todas las preguntas para continuar. | Aprobada |
| P-15 | Diagnóstico | Volver al paso anterior conserva las respuestas | Responder energía, avanzar y volver | Las 3 respuestas de energía siguen marcadas | 3 respuestas marcadas | Aprobada |
| P-16 | Índice Eco | Todas las respuestas óptimas | Mejor opción en las 9 preguntas | Índice 100, nivel Alto, mensaje de felicitación | Índice 100, nivel Alto, 1 recomendación | Aprobada |
| P-17 | Índice Eco | Todas las respuestas desfavorables | Peor opción en las 9 preguntas | Índice 2 (energía 10/3, agua 10/3, residuos 0), nivel Bajo, 9 recomendaciones | Índice 2, nivel Bajo, 9 recomendaciones | Aprobada |
| P-18 | Índice Eco | Respuestas mixtas | Energía óptima, agua intermedia, residuos óptimos | Índice 84 = (100 + 52 + 100) / 3, nivel Alto, 3 recomendaciones de agua | Índice 84, nivel Alto, 3 recomendaciones | Aprobada |
| P-19 | Diagnóstico | Guardado del diagnóstico | Diagnóstico de P-18 | Mensaje de guardado en el historial | Diagnóstico guardado en tu historial (en este navegador). | Aprobada |
| P-20 | Servicio Node.js | Descargar informe con el servicio encendido | Botón «Descargar informe» del resultado P-18 | Abre el Informe de Resultado con índice 84 y nivel Alto | Informe abierto con índice 84, nivel Alto | Aprobada |
| P-21 | Servicio Node.js | Descargar informe con el servicio apagado | Node.js detenido | Aviso indicando cómo encender el servicio | El servicio de informes (Node.js) no está encendido. Abrí una terminal… | Aprobada |
| P-22 | Panel | Historial de diagnósticos | 3 diagnósticos completos (P-16, P-17, P-18) | 3 filas en el historial y último índice 84 | 3 filas, último índice 84 | Aprobada |
| P-23 | Asesoramiento | Solicitar asesoramiento | Primero sin mensaje y luego con mensaje | Error sin mensaje; confirmación con mensaje | «Contanos brevemente qué necesitás.» / «¡Solicitud enviada! Te vamos a…» | Aprobada |
| P-24 | Contacto | Enviar el formulario de contacto | Primero con asunto y mensaje vacíos, luego completo | Error con campos vacíos; agradecimiento con datos completos | «Revisá los campos marcados en rojo.» / «¡Gracias, Santiago! Recib…» | Aprobada |
| P-25 | Documentación | Pestañas de documentación del proyecto | Clic en las 10 pestañas | Cada pestaña muestra su contenido y cargan todas las imágenes | 10 de 10 pestañas; 11 de 11 imágenes cargadas | Aprobada |
| P-26 | Sesión | Recargar la página con la sesión iniciada | F5 en la pantalla Proyecto | Sigue en la aplicación y en la misma pantalla | Pantalla Proyecto visible: True | Aprobada |
| P-27 | Diseño responsivo | Menú en pantalla de celular | Ancho 390 px | Menú oculto, se abre con ☰ y se cierra al elegir | Antes: oculto, con ☰: visible, al elegir: oculto | Aprobada |
| P-28 | Diseño responsivo | Sin desplazamiento horizontal en celular | Ancho 390 px | El contenido entra en el ancho de la pantalla | Ancho del contenido: 390 px | Aprobada |
| P-29 | Sesión | Cerrar sesión | Botón Salir y después abrir index.html | Vuelve al login y no deja entrar sin sesión | Terminó en login.html | Aprobada |
| P-30 | Acceso | Login con el usuario de prueba | demo@ecocontrol.com / eco123 | Entra a la aplicación | Entró a index.html#inicio | Aprobada |
| P-31 | Backend PHP | Sintaxis de los archivos PHP | php -l en los 8 archivos | Sin errores de sintaxis | 8 de 8 archivos sin errores | Aprobada |
| P-32 | Backend PHP | Pedido GET a login.php | GET /php/login.php | Rechaza el pedido (código 405) | Código 405 | Aprobada |
| P-33 | Backend PHP | Login con MySQL apagado | POST a login.php sin base de datos | Mensaje claro indicando revisar MySQL en XAMPP | No se pudo conectar a la base de datos. Revisá que MySQL est… | Aprobada |
| P-34 | Servicio Node.js | Pruebas automáticas del servicio (npm test) | N-01 a N-06: cálculo, niveles, rangos, XSS, índice falso, rutas HTTP | 6 pruebas aprobadas | 6 aprobadas, 0 fallidas | Aprobada |
| P-35 | Base de datos | Registro, login y diagnósticos guardados en MySQL | XAMPP con la base ecocontrol importada | Los datos se guardan y se leen desde MySQL | Pendiente: se ejecuta en la computadora con XAMPP | Pendiente |

## Cómo repetir las pruebas

- **Servicio Node.js:** abrir una terminal en `servicio-node` y ejecutar `npm test` (pruebas N-01 a N-06).
- **PHP:** `php -l archivo.php` revisa la sintaxis de cada archivo.
- **Interfaz:** seguir los pasos de la columna «Datos de entrada» en el navegador.
- **P-35 (MySQL):** encender Apache y MySQL en XAMPP, importar `database/ecocontrol.sql`, abrir `http://localhost/ecocontrol/Frontend/login.html`, crear una cuenta, hacer un diagnóstico y verificar en phpMyAdmin que aparezcan en las tablas `usuarios` y `diagnosticos`.
