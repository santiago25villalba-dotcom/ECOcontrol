/* =========================================================
   EcoControl - informe.js (Node.js)
   Arma el "Informe de Resultado" (IR) en HTML, listo para
   imprimir o guardar como PDF desde el navegador.
   ========================================================= */

const { limitarPuntaje, calcularIndice, calcularNivel } = require('./indice');

// Evita que un texto con < > & " ' rompa el HTML (seguridad: XSS)
function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Revisa los datos recibidos y recalcula el índice
function prepararDatos(datos) {
  const energia = limitarPuntaje(datos.energia);
  const agua = limitarPuntaje(datos.agua);
  const residuos = limitarPuntaje(datos.residuos);
  const indice = calcularIndice(energia, agua, residuos);
  const fecha = new Date(datos.fecha || Date.now());

  return {
    nombre: String(datos.nombre || 'Cliente').slice(0, 100),
    email: String(datos.email || '').slice(0, 150),
    tipo: datos.tipo === 'Negocio' ? 'Negocio' : 'Hogar',
    energia,
    agua,
    residuos,
    indice,
    nivel: calcularNivel(indice),
    fecha: Number.isNaN(fecha.getTime()) ? new Date() : fecha,
    recomendaciones: Array.isArray(datos.recomendaciones)
      ? datos.recomendaciones.filter((r) => typeof r === 'string').slice(0, 20)
      : []
  };
}

function barra(titulo, valor) {
  return `<div class="area"><div class="fila"><span>${titulo}</span><strong>${valor}/100</strong></div>` +
         `<div class="barra"><div style="width:${valor}%"></div></div></div>`;
}

function generarInforme(datosRecibidos) {
  const d = prepararDatos(datosRecibidos);
  const colores = { Alto: '#15966A', Medio: '#B07D00', Bajo: '#C62828' };
  const numero = 'IR-' + d.fecha.toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(d.fecha.getTime()).slice(-4);
  const fechaTexto = d.fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const recos = d.recomendaciones.length
    ? d.recomendaciones.map((r) => `<li>${escapar(r)}</li>`).join('')
    : '<li>¡Excelente! Mantené tus hábitos sustentables.</li>';

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><title>Informe de Resultado ${numero} | EcoControl</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #26332C; max-width: 760px; margin: 30px auto; padding: 0 20px; line-height: 1.5; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #123D2B; padding-bottom: 10px; }
  .marca { font-size: 26px; font-weight: bold; color: #123D2B; } .marca span { color: #15966A; }
  h1 { font-size: 20px; margin: 24px 0 6px; color: #123D2B; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 20px; }
  td { border: 1px solid #D9E3DD; padding: 6px 10px; } td:first-child { background: #E8F3ED; width: 35%; font-weight: bold; }
  .resultado { display: flex; gap: 30px; align-items: center; border: 1px solid #D9E3DD; border-radius: 12px; padding: 20px; }
  .indice { font-size: 56px; font-weight: bold; color: ${colores[d.nivel]}; line-height: 1; text-align: center; }
  .nivel { display: inline-block; margin-top: 6px; padding: 3px 12px; border-radius: 99px; color: #fff; background: ${colores[d.nivel]}; font-weight: bold; }
  .areas { flex: 1; } .area { margin: 6px 0; } .fila { display: flex; justify-content: space-between; }
  .barra { height: 8px; background: #E8F3ED; border-radius: 99px; } .barra div { height: 100%; background: #15966A; border-radius: 99px; }
  li { margin-bottom: 6px; } footer { margin-top: 30px; font-size: 12px; color: #5D6B63; border-top: 1px solid #D9E3DD; padding-top: 8px; }
  button { background: #15966A; color: #fff; border: 0; padding: 10px 18px; border-radius: 8px; font-size: 15px; cursor: pointer; }
  @media print { button { display: none; } body { margin: 0; } }
</style></head>
<body>
  <header>
    <div class="marca">Eco<span>Control</span></div>
    <div>Informe N.º <strong>${numero}</strong><br>Fecha: ${fechaTexto}</div>
  </header>
  <h1>Informe de Resultado – Diagnóstico ambiental</h1>
  <table>
    <tr><td>Cliente</td><td>${escapar(d.nombre)}</td></tr>
    <tr><td>Correo electrónico</td><td>${escapar(d.email)}</td></tr>
    <tr><td>Tipo de lugar</td><td>${d.tipo}</td></tr>
  </table>
  <div class="resultado">
    <div><div class="indice">${d.indice}</div><div style="text-align:center">de 100<br><span class="nivel">${d.nivel}</span></div></div>
    <div class="areas">${barra('Energía', d.energia)}${barra('Agua', d.agua)}${barra('Residuos', d.residuos)}</div>
  </div>
  <h1>Recomendaciones</h1>
  <ol>${recos}</ol>
  <p><button onclick="window.print()">Imprimir o guardar como PDF</button></p>
  <footer>Informe generado por el servicio de informes de EcoControl (Node.js). El Índice Eco es el promedio de los puntajes de energía, agua y residuos. Nivel Bajo: 0 a 39 · Medio: 40 a 69 · Alto: 70 a 100.</footer>
</body></html>`;
}

module.exports = { escapar, prepararDatos, generarInforme };
