/* =========================================================
   EcoControl - login.js
   Pantalla de acceso: iniciar sesión, crear cuenta,
   recuperar contraseña y mostrar/ocultar contraseña.
   Usa las funciones de sesion.js
   ========================================================= */

/* ---------- Usuario de prueba para el modo local ---------- */
// Así se puede entrar aunque todavía no se haya creado ninguna cuenta.
// Correo: demo@ecocontrol.com   Contraseña: eco123
(function crearUsuarioDemo() {
  const usuarios = leerLocal('usuarios');
  if (usuarios.length === 0) {
    usuarios.push({
      id: 1,
      nombre: 'Usuario Demo',
      email: 'demo@ecocontrol.com',
      clave: codificarClave('eco123')
    });
    guardarLocal('usuarios', usuarios);
  }
})();

/* ---------- Cambiar entre vistas (login / registro / recuperar) ---------- */
function mostrarVista(nombre) {
  document.querySelectorAll('.vista').forEach(function (vista) {
    vista.classList.remove('activa');
  });
  document.getElementById('vista-' + nombre).classList.add('activa');
  // Limpiamos los mensajes viejos
  document.querySelectorAll('.login-tarjeta .mensaje').forEach(function (m) {
    mostrarMensaje(m, '', '');
  });
}

document.querySelectorAll('[data-vista]').forEach(function (enlace) {
  enlace.addEventListener('click', function (evento) {
    evento.preventDefault();
    mostrarVista(enlace.dataset.vista);
  });
});

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

/* ---------- Ayudas ---------- */
function marcar(campo, malo) {
  campo.classList.toggle('invalido', malo);
}

function entrar(usuario) {
  guardarSesion(usuario);
  window.location.replace('index.html');
}

/* ---------- INICIAR SESIÓN ---------- */
const formLogin = document.getElementById('formLogin');

formLogin.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  const campoEmail = document.getElementById('loginEmail');
  const campoClave = document.getElementById('loginClave');
  const mensaje = document.getElementById('loginMensaje');
  const email = campoEmail.value.trim().toLowerCase();
  const clave = campoClave.value;

  // 1) Validamos los datos
  marcar(campoEmail, !emailValido(email));
  marcar(campoClave, clave.length < 6);
  if (!emailValido(email)) {
    return mostrarMensaje(mensaje, 'Ingresá un correo electrónico válido.', 'error');
  }
  if (clave.length < 6) {
    return mostrarMensaje(mensaje, 'La contraseña debe tener al menos 6 caracteres.', 'error');
  }

  const boton = formLogin.querySelector('button[type="submit"]');
  boton.disabled = true;
  mostrarMensaje(mensaje, 'Verificando…', '');

  // 2) Probamos con el servidor (PHP + MySQL)
  const respuesta = await llamarPHP(formLogin.dataset.php, { email: email, clave: clave });
  boton.disabled = false;

  if (respuesta) {
    if (respuesta.ok) {
      respuesta.usuario.modo = 'servidor';
      return entrar(respuesta.usuario);
    }
    return mostrarMensaje(mensaje, respuesta.mensaje || 'No se pudo iniciar sesión.', 'error');
  }

  // 3) Sin servidor: buscamos el usuario en el navegador
  const usuario = leerLocal('usuarios').find(function (u) { return u.email === email; });
  if (!usuario) {
    return mostrarMensaje(mensaje, 'No existe una cuenta con ese correo. Creá una cuenta nueva.', 'error');
  }
  if (usuario.clave !== codificarClave(clave)) {
    marcar(campoClave, true);
    return mostrarMensaje(mensaje, 'La contraseña es incorrecta.', 'error');
  }
  entrar({ id: usuario.id, nombre: usuario.nombre, email: usuario.email, modo: 'local' });
});

/* ---------- CREAR CUENTA ---------- */
const formRegistro = document.getElementById('formRegistro');

formRegistro.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  const campoNombre = document.getElementById('registroNombre');
  const campoEmail = document.getElementById('registroEmail');
  const campoClave = document.getElementById('registroClave');
  const campoClave2 = document.getElementById('registroClave2');
  const mensaje = document.getElementById('registroMensaje');

  const nombre = campoNombre.value.trim();
  const email = campoEmail.value.trim().toLowerCase();
  const clave = campoClave.value;
  const clave2 = campoClave2.value;

  // 1) Validaciones
  marcar(campoNombre, nombre.length < 2);
  marcar(campoEmail, !emailValido(email));
  marcar(campoClave, clave.length < 6);
  marcar(campoClave2, clave !== clave2);

  if (nombre.length < 2) return mostrarMensaje(mensaje, 'Escribí tu nombre.', 'error');
  if (!emailValido(email)) return mostrarMensaje(mensaje, 'Ingresá un correo electrónico válido.', 'error');
  if (clave.length < 6) return mostrarMensaje(mensaje, 'La contraseña debe tener al menos 6 caracteres.', 'error');
  if (clave !== clave2) return mostrarMensaje(mensaje, 'Las contraseñas no coinciden.', 'error');

  const boton = formRegistro.querySelector('button[type="submit"]');
  boton.disabled = true;
  mostrarMensaje(mensaje, 'Creando tu cuenta…', '');

  // 2) Servidor
  const respuesta = await llamarPHP(formRegistro.dataset.php, { nombre: nombre, email: email, clave: clave });
  boton.disabled = false;

  if (respuesta) {
    if (respuesta.ok) {
      respuesta.usuario.modo = 'servidor';
      mostrarMensaje(mensaje, '¡Cuenta creada! Entrando…', 'ok');
      return setTimeout(function () { entrar(respuesta.usuario); }, 800);
    }
    return mostrarMensaje(mensaje, respuesta.mensaje || 'No se pudo crear la cuenta.', 'error');
  }

  // 3) Modo local
  const usuarios = leerLocal('usuarios');
  if (usuarios.some(function (u) { return u.email === email; })) {
    marcar(campoEmail, true);
    return mostrarMensaje(mensaje, 'Ya existe una cuenta con ese correo.', 'error');
  }
  const nuevo = { id: Date.now(), nombre: nombre, email: email, clave: codificarClave(clave) };
  usuarios.push(nuevo);
  guardarLocal('usuarios', usuarios);
  mostrarMensaje(mensaje, '¡Cuenta creada! Entrando…', 'ok');
  setTimeout(function () {
    entrar({ id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email, modo: 'local' });
  }, 800);
});

/* ---------- RECUPERAR CONTRASEÑA ---------- */
const formRecuperar = document.getElementById('formRecuperar');

formRecuperar.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  const campoEmail = document.getElementById('recuperarEmail');
  const mensaje = document.getElementById('recuperarMensaje');
  const email = campoEmail.value.trim().toLowerCase();

  marcar(campoEmail, !emailValido(email));
  if (!emailValido(email)) {
    return mostrarMensaje(mensaje, 'Ingresá un correo electrónico válido.', 'error');
  }

  const respuesta = await llamarPHP(formRecuperar.dataset.php, { email: email });
  if (respuesta) {
    return mostrarMensaje(mensaje, respuesta.mensaje, respuesta.ok ? 'ok' : 'error');
  }
  // Modo local: no se pueden enviar correos desde el navegador
  mostrarMensaje(mensaje, 'Si el correo está registrado, vas a recibir las instrucciones para crear una nueva contraseña.', 'ok');
  formRecuperar.reset();
});
