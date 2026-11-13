# EcoControl – Código destacado

Este documento reúne los fragmentos de código más importantes del sistema, explicados paso a paso. El código completo está en la carpeta `Frontend/` y la base de datos en `database/ecocontrol.sql`.

## Índice
1. [Tecnologías y archivos](#1-tecnologías-y-archivos)
2. [Sesión del usuario](#2-sesión-del-usuario-jssesionjs)
3. [Comunicación con PHP](#3-comunicación-con-php-jssesionjs)
4. [Mostrar u ocultar la contraseña](#4-mostrar-u-ocultar-la-contraseña-jsloginjs)
5. [Navegación entre pantallas](#5-navegación-entre-pantallas-jsappjs)
6. [Validación del diagnóstico](#6-validación-del-diagnóstico-jsappjs)
7. [Cálculo del Índice Eco](#7-cálculo-del-índice-eco-jsappjs)
8. [Medidor animado](#8-medidor-animado-del-resultado-jsappjs)
9. [Guardar el diagnóstico](#9-guardar-el-diagnóstico-jsappjs)
10. [Registro seguro en PHP](#10-registro-seguro-phpregistrophp)
11. [Inicio de sesión en PHP](#11-inicio-de-sesión-phploginphp)
12. [Guardar diagnósticos en MySQL](#12-guardar-diagnósticos-en-mysql-phpdiagnosticosphp)
13. [Base de datos](#13-base-de-datos-databaseecocontrolsql)
14. [Diseño responsivo](#14-diseño-responsivo-cssstylescss)
15. [Servicio de informes en Node.js](#15-servicio-de-informes-en-nodejs-servicio-node)

## 1. Tecnologías y archivos

| Archivo | Lenguaje | Función |
|---|---|---|
| `login.html` | HTML | Pantalla de acceso: iniciar sesión, crear cuenta y recuperar contraseña |
| `index.html` | HTML | Aplicación: inicio, servicios, diagnóstico, resultado, panel, documentación y contacto |
| `css/styles.css` | CSS | Diseño general, colores, tipografías y adaptación a celulares |
| `css/login.css` | CSS | Diseño propio de la pantalla de acceso |
| `js/sesion.js` | JavaScript | Funciones compartidas: sesión, conexión con PHP y validaciones |
| `js/login.js` | JavaScript | Lógica de la pantalla de acceso |
| `js/app.js` | JavaScript | Lógica de la aplicación: diagnóstico, Índice Eco, panel, asesoramiento y contacto |
| `php/conexion.php` | PHP | Conexión a MySQL y funciones comunes |
| `php/login.php`, `registro.php`, `logout.php`, `recuperar.php` | PHP | Manejo de usuarios y roles |
| `php/diagnosticos.php` | PHP | Guarda y lista los diagnósticos |
| `php/admin.php` | PHP | Datos del panel del Titular (solo rol admin) y cambio de estado de solicitudes |
| `php/nueva_clave.php` | PHP | Cambia la contraseña con el enlace de recuperación (un solo uso, vence en 1 hora) |
| `php/asesoramiento.php`, `contacto.php` | PHP | Guardan solicitudes y mensajes |
| `database/ecocontrol.sql` | SQL | Crea la base de datos, las tablas y el usuario de prueba |
| `servicio-node/servidor.js` | Node.js | Servidor HTTP del servicio de informes (puerto 3000) |
| `servicio-node/informe.js`, `indice.js` | Node.js | Arman el Informe de Resultado y recalculan el Índice Eco |

**Cómo se comunican:** el navegador (HTML, CSS y JavaScript) envía los datos en formato JSON con `fetch()` a los archivos PHP; PHP los valida y los guarda en MySQL, y responde también en JSON. Además, la pantalla de resultado le pide a un **servicio en Node.js** (puerto 3000) el Informe de Resultado imprimible.

## 2. Sesión del usuario (`js/sesion.js`)

La sesión se guarda en `localStorage`. `index.html` llama a `exigirSesion()` apenas carga: si no hay sesión, vuelve al login. `login.html` llama a `saltarSiHaySesion()`: si ya hay sesión, pasa directo a la aplicación.

```javascript
// Devuelve el usuario que inició sesión, o null si no hay nadie.
function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch (error) {
    return null;
  }
}

// Guarda el usuario que inició sesión.
// usuario = { id, nombre, email, modo: 'servidor' | 'local' }
function guardarSesion(usuario) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
}

// Cierra la sesión y vuelve a la pantalla de login.
function cerrarSesion() {
  const sesion = obtenerSesion();
  localStorage.removeItem(CLAVE_SESION);
  if (sesion && sesion.modo === 'servidor') {
    // Avisamos al servidor, pero no esperamos la respuesta
    fetch('php/logout.php', { method: 'POST' }).catch(function () {});
  }
  window.location.replace('login.html');
}

// Se usa en index.html: si NO hay sesión, manda al login.
function exigirSesion() {
  if (!obtenerSesion()) {
    window.location.replace('login.html');
  }
}

// Se usa en login.html: si YA hay sesión, pasa directo a la app.
function saltarSiHaySesion() {
  if (obtenerSesion()) {
    window.location.replace('index.html');
  }
}
```
*Archivo: `Frontend/js/sesion.js` (líneas 20 a 58)*

## 3. Comunicación con PHP (`js/sesion.js`)

`llamarPHP()` envía los datos al servidor con `fetch()`. Si la página se abrió sin servidor (con doble clic) o el PHP no existe, devuelve `null` y el sistema guarda los datos en el navegador. Así el proyecto funciona con XAMPP y también para presentarlo sin servidor.

```javascript
// Envía datos a un archivo PHP y devuelve la respuesta en JSON.
// Si no hay servidor (archivo abierto con doble clic, sin XAMPP,
// o el PHP no existe) devuelve null para usar el modo local.
async function llamarPHP(url, datos) {
  if (!window.location.protocol.startsWith('http')) {
    return null; // abierto como archivo: no hay PHP
  }
  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos || {})
    });
    if (respuesta.status === 404) return null;
    return await respuesta.json(); // si no es JSON, salta al catch
  } catch (error) {
    return null;
  }
}
```
*Archivo: `Frontend/js/sesion.js` (líneas 62 a 80)*

## 4. Mostrar u ocultar la contraseña (`js/login.js`)

Cada botón del ojo tiene un atributo `data-ver` con el id del campo. Al tocarlo, se cambia el tipo del campo entre `password` y `text`, y se alterna el ícono.

```javascript
/* ---------- Mostrar u ocultar la contraseña (botón del ojo) ---------- */
document.querySelectorAll('.ver-clave').forEach(function (boton) {
  boton.addEventListener('click', function () {
    const campo = document.getElementById(boton.dataset.ver);
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    boton.querySelector('.ojo').hidden = mostrar;
    boton.querySelector('.ojo-tachado').hidden = !mostrar;
    boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
});
```
*Archivo: `Frontend/js/login.js` (líneas 43 a 53)*

## 5. Navegación entre pantallas (`js/app.js`)

Toda la aplicación está en una sola página. Cada sección es un `<section class="pantalla">` y solo se ve la que tiene la clase `activa`. Cualquier enlace con `data-ir="..."` llama a esta función. La dirección se actualiza (`#panel`, `#diagnostico`, etc.) para que funcionen los botones Atrás y Adelante del navegador.

```javascript
function mostrarPantalla(id) {
  if (!pantallasValidas.includes(id)) id = 'inicio';
  // "resultado" solo tiene sentido después de hacer un diagnóstico
  if (id === 'resultado' && !ultimoResultado) id = 'panel';

  document.querySelectorAll('.pantalla').forEach(function (p) {
    p.classList.toggle('activa', p.id === id);
  });
  document.querySelectorAll('#menuApp a[data-ir]').forEach(function (a) {
    a.classList.toggle('actual', a.dataset.ir === id);
  });
  document.getElementById('menu').classList.remove('abierto');

  // Acciones al entrar a cada pantalla
  if (id === 'diagnostico') iniciarDiagnostico();
  if (id === 'panel') cargarPanel();

  if (window.location.hash !== '#' + id) {
    history.pushState(null, '', '#' + id);
  }
  window.scrollTo(0, 0);
}

// Todos los enlaces y botones con data-ir="..." cambian de pantalla
document.addEventListener('click', function (evento) {
  const enlace = evento.target.closest('[data-ir]');
  if (enlace) {
    evento.preventDefault();
    mostrarPantalla(enlace.dataset.ir);
  }
});
```
*Archivo: `Frontend/js/app.js` (líneas 23 a 53)*

## 6. Validación del diagnóstico (`js/app.js`)

Antes de pasar al paso siguiente, se revisa que todas las preguntas tengan respuesta. En el último paso se calcula el resultado.

```javascript
botonSiguiente.addEventListener('click', function () {
  // Antes de avanzar, revisamos que todo esté respondido
  const faltan = pasosDiagnostico[pasoActual].preguntas.filter(function (p) {
    return respuestas[p.id] === undefined;
  });
  if (faltan.length > 0) {
    return mostrarMensaje(errorDiagnostico, 'Respondé todas las preguntas para continuar.', 'error');
  }
  if (pasoActual < pasosDiagnostico.length - 1) {
    pasoActual++;
    dibujarPaso();
  } else {
    terminarDiagnostico();
  }
});
```
*Archivo: `Frontend/js/app.js` (líneas 272 a 286)*

## 7. Cálculo del Índice Eco (`js/app.js`)

Cada opción vale entre 0 y 100 puntos. El puntaje de cada área (energía, agua y residuos) es el promedio de sus preguntas, y el **Índice Eco es el promedio de las tres áreas**. Si una respuesta no es la mejor, se agrega su recomendación.

| Puntaje | Nivel |
|---|---|
| 70 a 100 | Alto |
| 40 a 69 | Medio |
| 0 a 39 | Bajo |

```javascript
function calcularNivel(indice) {
  if (indice >= 70) return 'Alto';
  if (indice >= 40) return 'Medio';
  return 'Bajo';
}

function calcularResultado() {
  const areas = {};
  const recomendaciones = [];

  pasosDiagnostico.forEach(function (paso) {
    if (!paso.area) return;
    let suma = 0;
    paso.preguntas.forEach(function (pregunta) {
      const opcion = pregunta.opciones[respuestas[pregunta.id]];
      suma += opcion.puntos;
      if (opcion.puntos < 100) recomendaciones.push(pregunta.recomendacion);
    });
    areas[paso.area] = Math.round(suma / paso.preguntas.length);
  });

  // El Índice Eco es el promedio de las tres áreas (0 a 100)
  const indice = Math.round((areas.energia + areas.agua + areas.residuos) / 3);

  if (recomendaciones.length === 0) {
    recomendaciones.push('¡Excelente! Tus hábitos son muy sustentables. Mantenelos y compartilos con tu familia o equipo.');
  }

  return {
    fecha: new Date().toISOString(),
    tipo: respuestas.tipo,
    indice: indice,
    nivel: calcularNivel(indice),
    energia: areas.energia,
    agua: areas.agua,
    residuos: areas.residuos,
    recomendaciones: recomendaciones
  };
}
```
*Archivo: `Frontend/js/app.js` (líneas 290 a 328)*

**Ejemplo:** energía 100, agua 52 y residuos 100 → (100 + 52 + 100) ÷ 3 = 84 → nivel **Alto**.

## 8. Medidor animado del resultado (`js/app.js`)

El medidor es un círculo SVG. Con `stroke-dashoffset` se dibuja solo una parte del borde, proporcional al Índice Eco, y el color cambia según el nivel.

```javascript
function mostrarResultado(r) {
  const arco = document.getElementById('medidorArco');
  const largo = 339.3; // circunferencia del círculo (2 · π · 54)
  arco.style.stroke = colorNivel(r.nivel);
  arco.style.strokeDashoffset = largo;
  // Pequeña espera para que se vea la animación
  setTimeout(function () {
    arco.style.strokeDashoffset = largo * (1 - r.indice / 100);
  }, 50);

  // Número que sube de 0 hasta el índice
  const numero = document.getElementById('medidorNumero');
  let actual = 0;
  const contador = setInterval(function () {
    actual = Math.min(actual + 2, r.indice);
    numero.textContent = actual;
    if (actual >= r.indice) clearInterval(contador);
  }, 15);
```
*Archivo: `Frontend/js/app.js` (líneas 387 a 405)*

## 9. Guardar el diagnóstico (`js/app.js`)

Si el usuario entró con el servidor, el diagnóstico se envía a `php/diagnosticos.php`; si no, se guarda en el navegador junto con su correo.

```javascript
async function guardarDiagnostico(resultado) {
  if (modoServidor) {
    const respuesta = await llamarPHP('php/diagnosticos.php', Object.assign({ accion: 'guardar' }, resultado));
    if (respuesta && respuesta.ok) {
      return { texto: 'Diagnóstico guardado en tu historial.', tipo: 'ok' };
    }
    if (respuesta && respuesta.sinSesion) return cerrarSesion();
    return { texto: 'No se pudo guardar en el servidor. Intentá de nuevo más tarde.', tipo: 'error' };
  }
  const lista = leerLocal('diagnosticos');
  lista.push(Object.assign({ email: usuario.email }, resultado));
  guardarLocal('diagnosticos', lista);
  return { texto: 'Diagnóstico guardado en tu historial (en este navegador).', tipo: 'ok' };
}
```
*Archivo: `Frontend/js/app.js` (líneas 342 a 356)*

## 10. Registro seguro (`php/registro.php`)

Se verifica que el correo no exista y la contraseña se guarda **encriptada** con `password_hash()`. Se usan consultas preparadas (`prepare` y `bind_param`) para evitar la inyección SQL.

```php
// ¿Ya existe ese correo?
$consulta = $conexion->prepare('SELECT id FROM usuarios WHERE email = ?');
$consulta->bind_param('s', $email);
$consulta->execute();
if ($consulta->get_result()->num_rows > 0) {
    responder(['ok' => false, 'mensaje' => 'Ya existe una cuenta con ese correo.'], 409);
}

// Guardamos la contraseña encriptada, nunca el texto original
$hash = password_hash($clave, PASSWORD_DEFAULT);
$consulta = $conexion->prepare('INSERT INTO usuarios (nombre, email, clave) VALUES (?, ?, ?)');
$consulta->bind_param('sss', $nombre, $email, $hash);
$consulta->execute();
$id = $conexion->insert_id;

session_regenerate_id(true);
$_SESSION['usuario_id'] = $id;

responder(['ok' => true, 'usuario' => ['id' => $id, 'nombre' => $nombre, 'email' => $email]]);
```
*Archivo: `Frontend/php/registro.php` (líneas 20 a 38)*

## 11. Inicio de sesión (`php/login.php`)

`password_verify()` compara la contraseña escrita con la encriptada. Si es correcta, se guarda el id del usuario en la sesión de PHP.

```php
$consulta = $conexion->prepare('SELECT id, nombre, email, clave FROM usuarios WHERE email = ?');
$consulta->bind_param('s', $email);
$consulta->execute();
$usuario = $consulta->get_result()->fetch_assoc();

if (!$usuario || !password_verify($clave, $usuario['clave'])) {
    responder(['ok' => false, 'mensaje' => 'El correo o la contraseña son incorrectos.'], 401);
}

session_regenerate_id(true);
$_SESSION['usuario_id'] = $usuario['id'];

responder([
    'ok' => true,
    'usuario' => ['id' => $usuario['id'], 'nombre' => $usuario['nombre'], 'email' => $usuario['email']]
]);
```
*Archivo: `Frontend/php/login.php` (líneas 13 a 28)*

## 12. Guardar diagnósticos en MySQL (`php/diagnosticos.php`)

El servidor vuelve a calcular el índice y el nivel, para que nadie pueda mandar un puntaje falso. Las recomendaciones se guardan en formato JSON.

```php
    $tipo = ($datos['tipo'] ?? '') === 'Negocio' ? 'Negocio' : 'Hogar';
    $energia = puntaje($datos['energia'] ?? 0);
    $agua = puntaje($datos['agua'] ?? 0);
    $residuos = puntaje($datos['residuos'] ?? 0);

    // El índice y el nivel se recalculan acá para que no se puedan falsear
    $indice = (int) round(($energia + $agua + $residuos) / 3);
    $nivel = $indice >= 70 ? 'Alto' : ($indice >= 40 ? 'Medio' : 'Bajo');

    $recomendaciones = array_values(array_filter((array) ($datos['recomendaciones'] ?? []), 'is_string'));
    $recomendacionesJson = json_encode($recomendaciones, JSON_UNESCAPED_UNICODE);

    $consulta = $conexion->prepare(
        'INSERT INTO diagnosticos (usuario_id, tipo, indice, nivel, energia, agua, residuos, recomendaciones)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $consulta->bind_param('isisiiis', $usuarioId, $tipo, $indice, $nivel, $energia, $agua, $residuos, $recomendacionesJson);
    $consulta->execute();

    responder(['ok' => true, 'id' => $conexion->insert_id, 'indice' => $indice, 'nivel' => $nivel]);
}
```
*Archivo: `Frontend/php/diagnosticos.php` (líneas 18 a 38)*

## 13. Base de datos (`database/ecocontrol.sql`)

Tablas: `usuarios`, `diagnosticos`, `asesorias`, `contactos` y `recuperaciones`. Las claves foráneas (`FOREIGN KEY`) relacionan cada diagnóstico y cada asesoría con su usuario; con `ON DELETE CASCADE`, si se borra un usuario se borran también sus datos.

```sql
-- ---------------------------------------------------------
-- Usuarios (clientes) que se registran en el sistema
-- La contraseña se guarda con password_hash() de PHP.
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  clave VARCHAR(255) NOT NULL,
  rol ENUM('cliente', 'admin') NOT NULL DEFAULT 'cliente',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Diagnósticos ambientales y su Índice Eco (0 a 100)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS diagnosticos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('Hogar', 'Negocio') NOT NULL,
  indice TINYINT UNSIGNED NOT NULL,
  nivel ENUM('Bajo', 'Medio', 'Alto') NOT NULL,
  energia TINYINT UNSIGNED NOT NULL,
  agua TINYINT UNSIGNED NOT NULL,
  residuos TINYINT UNSIGNED NOT NULL,
  recomendaciones TEXT NOT NULL,          -- lista guardada en formato JSON
  CONSTRAINT fk_diagnostico_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```
*Archivo: `database/ecocontrol.sql` (líneas 13 a 42)*

## 14. Diseño responsivo (`css/styles.css`)

Con `@media` el diseño se adapta a pantallas chicas: el menú se convierte en un menú desplegable (botón ☰) y las columnas pasan a una sola.

```css
@media (max-width: 760px) {
  .menu-boton { display: block; }
  .menu {
    display: none;
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    background: var(--blanco);
    border-bottom: 1px solid var(--borde);
    padding: 10px 4%;
  }
  .menu.abierto { display: block; }
  .menu #menuApp { flex-direction: column; align-items: stretch; }
  .menu a.boton { margin-left: 0; text-align: center; }
  .resultado-cabecera { grid-template-columns: 1fr; justify-items: center; }
  .tarjeta { padding: 20px; }
  .cta { padding: 24px; }
}
```
*Archivo: `Frontend/css/styles.css` (líneas 451 a 469)*

## 15. Servicio de informes en Node.js (`servicio-node/`)

Node.js cumple una función propia en el sistema: genera el **Informe de Resultado** (el formulario IR del Cursograma 1) para imprimir o guardar como PDF. No usa paquetes externos, solo el módulo `http` que ya trae Node.js. Se enciende con `node servidor.js` y responde en `http://localhost:3000`.

**Reglas del Índice Eco** (`servicio-node/indice.js`): el servidor vuelve a calcular el índice con las mismas reglas que el navegador, así nadie puede mandar un puntaje falso.

```javascript
// Asegura que un puntaje sea un número entero entre 0 y 100
function limitarPuntaje(valor) {
  const numero = Math.round(Number(valor));
  if (Number.isNaN(numero)) return 0;
  return Math.max(0, Math.min(100, numero));
}

// El Índice Eco es el promedio de energía, agua y residuos
function calcularIndice(energia, agua, residuos) {
  return Math.round((limitarPuntaje(energia) + limitarPuntaje(agua) + limitarPuntaje(residuos)) / 3);
}

// Bajo: 0 a 39 · Medio: 40 a 69 · Alto: 70 a 100
function calcularNivel(indice) {
  if (indice >= 70) return 'Alto';
  if (indice >= 40) return 'Medio';
  return 'Bajo';
}
```

**Rutas del servidor** (`servicio-node/servidor.js`): `GET /api/estado` informa si el servicio funciona y `POST /api/informe` recibe el diagnóstico en JSON y devuelve el informe en HTML. Cualquier otra ruta responde 404, y si los datos no son JSON válido responde 400.

```javascript
const servidor = http.createServer(async function (pedido, respuesta) {
  permisosCORS(respuesta);

  if (pedido.method === 'OPTIONS') {
    respuesta.writeHead(204);
    return respuesta.end();
  }

  if (pedido.method === 'GET' && pedido.url === '/api/estado') {
    return enviarJSON(respuesta, 200, { ok: true, servicio: 'EcoControl - informes', version: '1.0.0' });
  }

  if (pedido.method === 'POST' && pedido.url === '/api/informe') {
    try {
      const datos = await leerCuerpo(pedido);
      const html = generarInforme(datos);
      respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return respuesta.end(html);
    } catch (error) {
      return enviarJSON(respuesta, 400, { ok: false, mensaje: error.message });
    }
  }

  enviarJSON(respuesta, 404, { ok: false, mensaje: 'Ruta no encontrada.' });
});
```
*Archivo: `servicio-node/servidor.js` (líneas 54 a 78)*

**Pruebas automáticas:** `npm test` ejecuta 6 pruebas con el módulo `node:test` (cálculo del índice, niveles, puntajes fuera de rango, protección contra XSS, índice falso y rutas HTTP). Ver [MATRIZ-DE-PRUEBAS.md](MATRIZ-DE-PRUEBAS.md).
