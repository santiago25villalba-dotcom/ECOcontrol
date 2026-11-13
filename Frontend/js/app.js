/* =========================================================
   EcoControl - app.js
   Lógica de la aplicación principal (index.html):
   navegación, diagnóstico, Índice Eco, panel del usuario,
   asesoramiento, pestañas de documentación y contacto.
   Usa las funciones de sesion.js
   ========================================================= */

// Si no hay sesión, exigirSesion() (en el <head>) ya está volviendo al login;
// usamos un usuario vacío para que el código no falle mientras tanto.
const usuario = obtenerSesion() || { nombre: '', email: '', modo: 'local' };
const modoServidor = usuario.modo === 'servidor';
const esAdmin = usuario.rol === 'admin'; // el Titular de la consultora

/* =========================================================
   1. MENÚ Y NAVEGACIÓN ENTRE PANTALLAS
   ========================================================= */

// Con la sesión iniciada mostramos el menú
document.getElementById('menuApp').hidden = false;
// La opción "Administración" solo la ve el Titular
document.getElementById('menuAdmin').hidden = !esAdmin;

const pantallasValidas = ['inicio', 'servicios', 'diagnostico', 'resultado', 'panel', 'admin', 'proyecto', 'contacto'];

function mostrarPantalla(id) {
  if (!pantallasValidas.includes(id)) id = 'inicio';
  // "resultado" solo tiene sentido después de hacer un diagnóstico
  if (id === 'resultado' && !ultimoResultado) id = 'panel';
  // "admin" solo para el Titular
  if (id === 'admin' && !esAdmin) id = 'inicio';

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
  if (id === 'admin') cargarAdmin();

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

// Botones "atrás" y "adelante" del navegador
window.addEventListener('popstate', function () {
  mostrarPantalla(window.location.hash.slice(1));
});

// Menú hamburguesa en celulares
document.getElementById('menuBoton').addEventListener('click', function () {
  document.getElementById('menu').classList.toggle('abierto');
});

// Cerrar sesión
document.getElementById('botonSalir').addEventListener('click', function (evento) {
  evento.preventDefault();
  cerrarSesion();
});

/* =========================================================
   2. DIAGNÓSTICO AMBIENTAL
   Cada opción tiene un puntaje de 0 (malo) a 100 (excelente).
   Si la respuesta no es la mejor, se agrega la recomendación.
   ========================================================= */

const pasosDiagnostico = [
  {
    titulo: 'Tipo de lugar',
    area: null,
    preguntas: [
      {
        id: 'tipo',
        texto: '¿El diagnóstico es para tu hogar o para tu negocio?',
        grande: true,
        opciones: [
          { valor: 'Hogar', texto: '🏠 Hogar' },
          { valor: 'Negocio', texto: '🏪 Negocio' }
        ]
      }
    ]
  },
  {
    titulo: 'Energía',
    area: 'energia',
    preguntas: [
      {
        id: 'luces',
        texto: '¿Qué tipo de lámparas usás?',
        recomendacion: 'Reemplazá las lámparas comunes por lámparas LED: consumen hasta un 80 % menos.',
        opciones: [
          { texto: 'Todas LED', puntos: 100 },
          { texto: 'Algunas LED', puntos: 60 },
          { texto: 'Halógenas o incandescentes', puntos: 10 }
        ]
      },
      {
        id: 'standby',
        texto: '¿Desenchufás los aparatos que no usás (TV, cargadores, microondas)?',
        recomendacion: 'Desenchufá los aparatos en espera o usá zapatillas con interruptor: el "stand-by" gasta energía todo el día.',
        opciones: [
          { texto: 'Siempre', puntos: 100 },
          { texto: 'A veces', puntos: 50 },
          { texto: 'Nunca', puntos: 0 }
        ]
      },
      {
        id: 'clima',
        texto: '¿A qué temperatura usás el aire acondicionado o la calefacción?',
        recomendacion: 'Usá el aire acondicionado a 24 °C en verano y la calefacción a 20 °C en invierno. Cada grado de más aumenta el consumo cerca de un 8 %.',
        opciones: [
          { texto: '24 °C en verano / 20 °C en invierno, o no uso', puntos: 100 },
          { texto: 'No me fijo en la temperatura', puntos: 40 },
          { texto: 'Muy frío en verano / muy caliente en invierno', puntos: 0 }
        ]
      }
    ]
  },
  {
    titulo: 'Agua',
    area: 'agua',
    preguntas: [
      {
        id: 'ducha',
        texto: '¿Cuánto duran, en promedio, las duchas?',
        recomendacion: 'Intentá ducharte en 5 minutos o menos: cada minuto menos ahorra entre 10 y 12 litros de agua.',
        opciones: [
          { texto: 'Menos de 5 minutos', puntos: 100 },
          { texto: 'Entre 5 y 10 minutos', puntos: 55 },
          { texto: 'Más de 10 minutos', puntos: 10 }
        ]
      },
      {
        id: 'perdidas',
        texto: '¿Hay canillas, inodoros o caños que pierden agua?',
        recomendacion: 'Arreglá las pérdidas cuanto antes: una canilla que gotea puede desperdiciar más de 30 litros por día.',
        opciones: [
          { texto: 'No, ninguno', puntos: 100 },
          { texto: 'No sé / no revisé', puntos: 50 },
          { texto: 'Sí, hay pérdidas', puntos: 0 }
        ]
      },
      {
        id: 'canilla',
        texto: '¿Cerrás la canilla mientras te lavás los dientes o lavás los platos?',
        recomendacion: 'Cerrá la canilla mientras te lavás los dientes o enjabonás los platos.',
        opciones: [
          { texto: 'Siempre', puntos: 100 },
          { texto: 'A veces', puntos: 50 },
          { texto: 'Nunca', puntos: 0 }
        ]
      }
    ]
  },
  {
    titulo: 'Residuos',
    area: 'residuos',
    preguntas: [
      {
        id: 'separacion',
        texto: '¿Separás los residuos (reciclables y no reciclables)?',
        recomendacion: 'Separá los residuos en al menos dos bolsas: reciclables (papel, cartón, plástico, vidrio, metal) y no reciclables.',
        opciones: [
          { texto: 'Siempre', puntos: 100 },
          { texto: 'A veces', puntos: 50 },
          { texto: 'Nunca', puntos: 0 }
        ]
      },
      {
        id: 'organicos',
        texto: '¿Qué hacés con los restos de comida y yerba?',
        recomendacion: 'Empezá una compostera con los restos orgánicos: reduce casi la mitad de la basura y genera abono.',
        opciones: [
          { texto: 'Hago compost', puntos: 100 },
          { texto: 'A veces los separo', puntos: 50 },
          { texto: 'Van a la basura común', puntos: 0 }
        ]
      },
      {
        id: 'plasticos',
        texto: '¿Usás bolsas y botellas reutilizables?',
        recomendacion: 'Llevá bolsas de tela y una botella reutilizable para evitar plásticos de un solo uso.',
        opciones: [
          { texto: 'Siempre', puntos: 100 },
          { texto: 'A veces', puntos: 50 },
          { texto: 'Nunca', puntos: 0 }
        ]
      }
    ]
  }
];

let pasoActual = 0;
let respuestas = {};      // { luces: 0, standby: 2, tipo: 'Hogar', ... }
let ultimoResultado = null;

const botonVolver = document.getElementById('botonVolver');
const botonSiguiente = document.getElementById('botonSiguiente');
const errorDiagnostico = document.getElementById('diagnosticoError');

function iniciarDiagnostico() {
  pasoActual = 0;
  respuestas = {};
  dibujarPaso();
}

// Dibuja las preguntas del paso actual
function dibujarPaso() {
  const paso = pasosDiagnostico[pasoActual];
  const total = pasosDiagnostico.length;
  const contenido = document.getElementById('diagnosticoContenido');

  document.getElementById('progresoBarra').style.width = ((pasoActual + 1) / total * 100) + '%';
  document.getElementById('pasoTexto').textContent = 'Paso ' + (pasoActual + 1) + ' de ' + total + ' · ' + paso.titulo;
  mostrarMensaje(errorDiagnostico, '', '');
  contenido.innerHTML = '';

  paso.preguntas.forEach(function (pregunta) {
    const bloque = document.createElement('div');
    bloque.className = 'pregunta';

    const texto = document.createElement('p');
    texto.textContent = pregunta.texto;
    bloque.appendChild(texto);

    const opciones = document.createElement('div');
    opciones.className = pregunta.grande ? 'opciones opciones-grandes' : 'opciones';

    pregunta.opciones.forEach(function (opcion, indice) {
      const etiqueta = document.createElement('label');
      etiqueta.className = 'opcion';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = pregunta.id;
      // En "tipo" guardamos el texto; en las demás, el número de opción
      radio.value = pregunta.grande ? opcion.valor : indice;
      if (String(respuestas[pregunta.id]) === String(radio.value)) radio.checked = true;
      radio.addEventListener('change', function () {
        respuestas[pregunta.id] = pregunta.grande ? opcion.valor : indice;
        mostrarMensaje(errorDiagnostico, '', '');
      });
      etiqueta.appendChild(radio);
      etiqueta.appendChild(document.createTextNode(opcion.texto));
      opciones.appendChild(etiqueta);
    });

    bloque.appendChild(opciones);
    contenido.appendChild(bloque);
  });

  botonVolver.style.visibility = pasoActual === 0 ? 'hidden' : 'visible';
  botonSiguiente.textContent = pasoActual === total - 1 ? 'Ver mi Índice Eco' : 'Siguiente →';
}

botonVolver.addEventListener('click', function () {
  if (pasoActual > 0) {
    pasoActual--;
    dibujarPaso();
  }
});

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

/* ---------- Cálculo del Índice Eco ---------- */

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

async function terminarDiagnostico() {
  ultimoResultado = calcularResultado();
  botonSiguiente.disabled = true;
  const aviso = await guardarDiagnostico(ultimoResultado);
  botonSiguiente.disabled = false;
  mostrarResultado(ultimoResultado);
  mostrarMensaje(document.getElementById('resultadoAviso'), aviso.texto, aviso.tipo);
  mostrarPantalla('resultado');
}

/* ---------- Guardar y leer diagnósticos ---------- */

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

async function leerDiagnosticos() {
  if (modoServidor) {
    const respuesta = await llamarPHP('php/diagnosticos.php', { accion: 'listar' });
    if (respuesta && respuesta.sinSesion) { cerrarSesion(); return []; }
    return respuesta && respuesta.ok ? respuesta.diagnosticos : [];
  }
  return leerLocal('diagnosticos').filter(function (d) { return d.email === usuario.email; });
}

/* ---------- Pantalla de resultado ---------- */

function claseNivel(nivel) {
  return 'nivel ' + nivel.toLowerCase();
}

function colorNivel(nivel) {
  if (nivel === 'Alto') return '#15966A';
  if (nivel === 'Medio') return '#E0A100';
  return '#C62828';
}

function llenarRecomendaciones(lista, recomendaciones) {
  lista.innerHTML = '';
  recomendaciones.forEach(function (texto) {
    const li = document.createElement('li');
    li.textContent = texto;
    lista.appendChild(li);
  });
}

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

  const nivel = document.getElementById('resultadoNivel');
  nivel.textContent = r.nivel;
  nivel.className = claseNivel(r.nivel);

  // Barras de cada área
  const areas = document.getElementById('resultadoAreas');
  areas.innerHTML = '';
  [['⚡ Energía', r.energia], ['💧 Agua', r.agua], ['♻️ Residuos', r.residuos]].forEach(function (dato) {
    const div = document.createElement('div');
    div.className = 'area';
    div.innerHTML = '<div class="area-titulo"><span></span><strong></strong></div><div class="area-barra"><div></div></div>';
    div.querySelector('span').textContent = dato[0];
    div.querySelector('strong').textContent = dato[1] + '/100';
    div.querySelector('.area-barra div').style.width = dato[1] + '%';
    areas.appendChild(div);
  });

  llenarRecomendaciones(document.getElementById('resultadoRecomendaciones'), r.recomendaciones);
}

/* ---------- Informe de Resultado (servicio Node.js) ---------- */
// El informe imprimible lo arma el servicio de Node.js (carpeta servicio-node).
// Para usarlo: abrir una terminal en servicio-node y ejecutar "node servidor.js".
const URL_SERVICIO_INFORMES = 'http://localhost:3000/api/informe';

document.getElementById('botonInforme').addEventListener('click', async function () {
  const aviso = document.getElementById('resultadoAviso');
  if (!ultimoResultado) return;

  // Abrimos la pestaña antes de esperar la respuesta para que el navegador no la bloquee
  const ventana = window.open('', '_blank');
  if (!ventana) {
    return mostrarMensaje(aviso, 'Permití las ventanas emergentes para ver el informe.', 'error');
  }
  ventana.document.write('<p style="font-family:Arial">Generando el informe…</p>');

  try {
    const datos = Object.assign({ nombre: usuario.nombre, email: usuario.email }, ultimoResultado);
    const respuesta = await fetch(URL_SERVICIO_INFORMES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!respuesta.ok) throw new Error('Respuesta ' + respuesta.status);
    const html = await respuesta.text();
    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
  } catch (error) {
    ventana.close();
    mostrarMensaje(aviso, 'El servicio de informes (Node.js) no está encendido. Abrí una terminal en la carpeta servicio-node y ejecutá: node servidor.js', 'error');
  }
});

/* =========================================================
   3. PANEL DEL USUARIO
   ========================================================= */

function formatearFecha(iso) {
  const fecha = new Date(String(iso).replace(' ', 'T'));
  if (isNaN(fecha)) return iso;
  return fecha.toLocaleDateString('es-AR') + ' ' +
         fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

async function cargarPanel() {
  document.getElementById('panelBienvenida').textContent = 'Hola, ' + usuario.nombre;

  const lista = await leerDiagnosticos();
  const hayDatos = lista.length > 0;
  document.getElementById('panelVacio').hidden = hayDatos;
  document.getElementById('panelDatos').hidden = !hayDatos;
  if (!hayDatos) return;

  // Ordenamos del más nuevo al más viejo
  lista.sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  const ultimo = lista[0];

  document.getElementById('panelIndice').textContent = ultimo.indice;
  const nivel = document.getElementById('panelNivel');
  nivel.textContent = ultimo.nivel;
  nivel.className = claseNivel(ultimo.nivel);
  llenarRecomendaciones(document.getElementById('panelRecomendaciones'), ultimo.recomendaciones || []);

  const tabla = document.getElementById('panelHistorial');
  tabla.innerHTML = '';
  lista.forEach(function (d) {
    const fila = document.createElement('tr');
    [formatearFecha(d.fecha), d.tipo, d.indice, d.nivel].forEach(function (valor) {
      const celda = document.createElement('td');
      celda.textContent = valor;
      fila.appendChild(celda);
    });
    tabla.appendChild(fila);
  });
}

/* ---------- Solicitar asesoramiento (ventana emergente) ---------- */

document.getElementById('botonAsesoramiento').addEventListener('click', function (evento) {
  evento.preventDefault();
  abrirAsesoramiento();
});

function abrirAsesoramiento() {
  const fondo = document.createElement('div');
  fondo.className = 'modal-fondo';
  fondo.innerHTML =
    '<div class="tarjeta" role="dialog" aria-modal="true" aria-labelledby="tituloAsesoria">' +
    '  <h3 id="tituloAsesoria">Solicitar asesoramiento</h3>' +
    '  <p class="gris">Un asesor de EcoControl te va a contactar para ayudarte a mejorar tu Índice Eco.</p>' +
    '  <form id="formAsesoria" novalidate>' +
    '    <div class="campo"><label for="asesoriaArea">Área de interés</label>' +
    '      <select id="asesoriaArea"><option>Energía</option><option>Agua</option><option>Residuos</option><option>Plan de mejora completo</option></select></div>' +
    '    <div class="campo"><label for="asesoriaModalidad">Modalidad</label>' +
    '      <select id="asesoriaModalidad"><option>Videollamada</option><option>Visita presencial</option><option>Por correo</option></select></div>' +
    '    <div class="campo"><label for="asesoriaTelefono">Teléfono (opcional)</label><input type="tel" id="asesoriaTelefono" placeholder="11 2345-6789"></div>' +
    '    <div class="campo"><label for="asesoriaMensaje">Contanos qué necesitás</label><textarea id="asesoriaMensaje" rows="3"></textarea></div>' +
    '    <p class="mensaje" id="asesoriaEstado" role="alert"></p>' +
    '    <div class="botones-fila"><button type="button" class="boton boton-borde" id="asesoriaCancelar">Cancelar</button><button type="submit" class="boton">Enviar solicitud</button></div>' +
    '  </form>' +
    '</div>';
  document.body.appendChild(fondo);

  function cerrar() { fondo.remove(); }
  fondo.addEventListener('click', function (e) { if (e.target === fondo) cerrar(); });
  document.getElementById('asesoriaCancelar').addEventListener('click', cerrar);
  document.addEventListener('keydown', function escape(e) {
    if (e.key === 'Escape') { cerrar(); document.removeEventListener('keydown', escape); }
  });

  document.getElementById('formAsesoria').addEventListener('submit', async function (e) {
    e.preventDefault();
    const estado = document.getElementById('asesoriaEstado');
    const datos = {
      area: document.getElementById('asesoriaArea').value,
      modalidad: document.getElementById('asesoriaModalidad').value,
      telefono: document.getElementById('asesoriaTelefono').value.trim(),
      mensaje: document.getElementById('asesoriaMensaje').value.trim()
    };
    if (datos.mensaje.length < 5) {
      return mostrarMensaje(estado, 'Contanos brevemente qué necesitás.', 'error');
    }

    let ok = false;
    if (modoServidor) {
      const respuesta = await llamarPHP('php/asesoramiento.php', datos);
      ok = respuesta && respuesta.ok;
    } else {
      const lista = leerLocal('asesorias');
      lista.push(Object.assign({ id: Date.now(), email: usuario.email, nombre: usuario.nombre, fecha: new Date().toISOString(), estado: 'Pendiente' }, datos));
      guardarLocal('asesorias', lista);
      ok = true;
    }

    if (ok) {
      mostrarMensaje(estado, '¡Solicitud enviada! Te vamos a contactar a ' + usuario.email + '.', 'ok');
      setTimeout(cerrar, 2000);
    } else {
      mostrarMensaje(estado, 'No se pudo enviar la solicitud. Intentá de nuevo.', 'error');
    }
  });

  document.getElementById('asesoriaArea').focus();
}

/* =========================================================
   3 bis. PANEL DEL TITULAR (solo administrador)
   ========================================================= */

// Agrega una fila a una tabla con los valores indicados (como texto)
function agregarFila(tabla, valores) {
  const fila = document.createElement('tr');
  valores.forEach(function (valor) {
    const celda = document.createElement('td');
    if (valor instanceof Node) celda.appendChild(valor);
    else celda.textContent = valor;
    fila.appendChild(celda);
  });
  tabla.appendChild(fila);
}

function filaVacia(tabla, columnas, texto) {
  tabla.innerHTML = '<tr><td class="vacia" colspan="' + columnas + '"></td></tr>';
  tabla.querySelector('td').textContent = texto;
}

// Arma los mismos datos que devuelve admin.php, pero desde el navegador
function resumenLocal() {
  const usuarios = leerLocal('usuarios').filter(function (u) { return u.rol !== 'admin'; });
  const diagnosticos = leerLocal('diagnosticos');
  const asesorias = leerLocal('asesorias');
  // Las solicitudes viejas pueden no tener id ni estado
  asesorias.forEach(function (a, i) {
    if (!a.id) a.id = Date.now() + i;
    if (!a.estado) a.estado = 'Pendiente';
  });
  guardarLocal('asesorias', asesorias);

  const suma = diagnosticos.reduce(function (total, d) { return total + d.indice; }, 0);
  return {
    totales: {
      clientes: usuarios.length,
      diagnosticos: diagnosticos.length,
      promedio: diagnosticos.length ? Math.round(suma / diagnosticos.length) : null,
      pendientes: asesorias.filter(function (a) { return a.estado === 'Pendiente'; }).length
    },
    solicitudes: asesorias.slice().reverse(),
    clientes: usuarios.map(function (u) {
      const suyos = diagnosticos.filter(function (d) { return d.email === u.email; })
        .sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
      return { nombre: u.nombre, email: u.email, diagnosticos: suyos.length, ultimo_indice: suyos.length ? suyos[0].indice : null };
    }),
    mensajes: leerLocal('contactos').slice().reverse()
  };
}

async function cambiarEstado(id, estado) {
  const aviso = document.getElementById('adminMensaje');
  if (modoServidor) {
    const respuesta = await llamarPHP('php/admin.php', { accion: 'cambiarEstado', id: id, estado: estado });
    if (!respuesta || !respuesta.ok) {
      return mostrarMensaje(aviso, 'No se pudo cambiar el estado.', 'error');
    }
  } else {
    const lista = leerLocal('asesorias');
    lista.forEach(function (a) { if (String(a.id) === String(id)) a.estado = estado; });
    guardarLocal('asesorias', lista);
  }
  mostrarMensaje(aviso, 'Estado actualizado: ' + estado + '.', 'ok');
  cargarAdmin();
}

async function cargarAdmin() {
  let datos;
  if (modoServidor) {
    datos = await llamarPHP('php/admin.php', { accion: 'resumen' });
    if (datos && datos.sinSesion) return cerrarSesion();
    if (!datos || !datos.ok) {
      return mostrarMensaje(document.getElementById('adminMensaje'), (datos && datos.mensaje) || 'No se pudieron cargar los datos.', 'error');
    }
  } else {
    datos = resumenLocal();
  }

  const t = datos.totales;
  document.getElementById('adminClientes').textContent = t.clientes;
  document.getElementById('adminDiagnosticos').textContent = t.diagnosticos;
  document.getElementById('adminPromedio').textContent = t.promedio === null || t.promedio === undefined ? '–' : t.promedio;
  document.getElementById('adminPendientes').textContent = t.pendientes;

  // Solicitudes de asesoramiento, con un selector para cambiar el estado
  const solicitudes = document.getElementById('adminSolicitudes');
  solicitudes.innerHTML = '';
  if (datos.solicitudes.length === 0) filaVacia(solicitudes, 6, 'Todavía no hay solicitudes.');
  datos.solicitudes.forEach(function (s) {
    const selector = document.createElement('select');
    selector.setAttribute('aria-label', 'Estado de la solicitud');
    ['Pendiente', 'En curso', 'Finalizada'].forEach(function (estado) {
      const opcion = document.createElement('option');
      opcion.textContent = estado;
      opcion.selected = estado === s.estado;
      selector.appendChild(opcion);
    });
    selector.addEventListener('change', function () { cambiarEstado(s.id, selector.value); });
    agregarFila(solicitudes, [formatearFecha(s.fecha), (s.nombre || '') + ' (' + s.email + ')', s.area, s.modalidad, s.mensaje, selector]);
  });

  const clientes = document.getElementById('adminTablaClientes');
  clientes.innerHTML = '';
  if (datos.clientes.length === 0) filaVacia(clientes, 4, 'Todavía no hay clientes registrados.');
  datos.clientes.forEach(function (c) {
    agregarFila(clientes, [c.nombre, c.email, c.diagnosticos, c.ultimo_indice === null ? '–' : c.ultimo_indice]);
  });

  const mensajes = document.getElementById('adminMensajes');
  mensajes.innerHTML = '';
  if (datos.mensajes.length === 0) filaVacia(mensajes, 5, 'Todavía no hay mensajes.');
  datos.mensajes.forEach(function (m) {
    agregarFila(mensajes, [formatearFecha(m.fecha), m.nombre, m.email, m.asunto, m.mensaje]);
  });
}

/* =========================================================
   4. DOCUMENTACIÓN DEL PROYECTO (pestañas)
   ========================================================= */

document.querySelectorAll('.pestana').forEach(function (pestana) {
  pestana.addEventListener('click', function () {
    document.querySelectorAll('.pestana').forEach(function (p) {
      p.classList.toggle('activa', p === pestana);
    });
    document.querySelectorAll('.panel-proyecto').forEach(function (panel) {
      panel.classList.toggle('activo', panel.id === 'proy-' + pestana.dataset.tab);
    });
  });
});

/* =========================================================
   5. CONTACTO
   ========================================================= */

const formContacto = document.getElementById('formContacto');

// Completamos nombre y correo con los datos de la sesión
document.getElementById('contactoNombre').value = usuario.nombre;
document.getElementById('contactoEmail').value = usuario.email;

formContacto.addEventListener('submit', async function (evento) {
  evento.preventDefault();
  const estado = document.getElementById('contactoMensajeEstado');
  const campos = {
    nombre: document.getElementById('contactoNombre'),
    email: document.getElementById('contactoEmail'),
    asunto: document.getElementById('contactoAsunto'),
    mensaje: document.getElementById('contactoMensaje')
  };
  const datos = {
    nombre: campos.nombre.value.trim(),
    email: campos.email.value.trim(),
    asunto: campos.asunto.value.trim(),
    mensaje: campos.mensaje.value.trim()
  };

  // Validamos cada campo
  let hayError = false;
  Object.keys(campos).forEach(function (clave) {
    const malo = clave === 'email' ? !emailValido(datos.email) : datos[clave].length < 2;
    campos[clave].classList.toggle('invalido', malo);
    if (malo) hayError = true;
  });
  if (hayError) {
    return mostrarMensaje(estado, 'Revisá los campos marcados en rojo.', 'error');
  }

  const boton = formContacto.querySelector('button[type="submit"]');
  boton.disabled = true;
  let respuesta = await llamarPHP(formContacto.dataset.php, datos);
  boton.disabled = false;

  if (!respuesta) {
    // Modo local
    const lista = leerLocal('contactos');
    lista.push(Object.assign({ fecha: new Date().toISOString() }, datos));
    guardarLocal('contactos', lista);
    respuesta = { ok: true };
  }

  if (respuesta.ok) {
    mostrarMensaje(estado, '¡Gracias, ' + datos.nombre + '! Recibimos tu mensaje y te responderemos pronto.', 'ok');
    campos.asunto.value = '';
    campos.mensaje.value = '';
  } else {
    mostrarMensaje(estado, respuesta.mensaje || 'No se pudo enviar el mensaje.', 'error');
  }
});

/* =========================================================
   6. INICIO: mostramos la pantalla que indica la dirección (#)
   ========================================================= */
mostrarPantalla(window.location.hash.slice(1) || 'inicio');
