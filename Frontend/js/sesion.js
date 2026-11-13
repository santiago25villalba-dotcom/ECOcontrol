/* =========================================================
   EcoControl - sesion.js
   Funciones compartidas por login.html e index.html:
   - manejar la sesión del usuario
   - hablar con el backend PHP
   - guardar datos en el navegador cuando no hay servidor

   El sistema funciona de DOS maneras:
   1) "servidor": abierto desde XAMPP (http://localhost/...).
      Los datos se guardan en MySQL a través de los archivos PHP.
   2) "local": abierto con doble clic (file://) o sin PHP.
      Los datos se guardan en el navegador (localStorage)
      para poder probar y presentar el proyecto igual.
   ========================================================= */

const CLAVE_SESION = 'ecocontrol_sesion';

/* ---------- Sesión ---------- */

// Devuelve el usuario que inició sesión, o null si no hay nadie.
function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_SESION));
  } catch (error) {
    return null;
  }
}

// Guarda el usuario que inició sesión.
// usuario = { id, nombre, email, rol: 'cliente' | 'admin', modo: 'servidor' | 'local' }
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

/* ---------- Comunicación con PHP ---------- */

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

/* ---------- "Base de datos" del navegador (modo local) ---------- */

function leerLocal(nombre) {
  try {
    return JSON.parse(localStorage.getItem('ecocontrol_' + nombre)) || [];
  } catch (error) {
    return [];
  }
}

function guardarLocal(nombre, lista) {
  localStorage.setItem('ecocontrol_' + nombre, JSON.stringify(lista));
}

// Convierte la contraseña en un código para no guardarla tal cual
// en el navegador. (En el servidor se usa password_hash de PHP,
// que es mucho más seguro.)
function codificarClave(texto) {
  let hash = 5381;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 33) ^ texto.charCodeAt(i);
  }
  return 'h' + (hash >>> 0).toString(16);
}

/* ---------- Validaciones comunes ---------- */

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Muestra un mensaje de error (tipo 'error') o de éxito (tipo 'ok')
function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = 'mensaje ' + (tipo || '');
}
