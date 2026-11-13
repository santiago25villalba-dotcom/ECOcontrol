/* =========================================================
   EcoControl - servidor.js (Node.js)
   Servicio de informes. No necesita instalar paquetes:
   usa solamente el módulo "http" que ya trae Node.js.

   Cómo usarlo:   node servidor.js     (o: npm start)
   Queda escuchando en http://localhost:3000

   Rutas:
     GET  /api/estado   → indica si el servicio está funcionando
     POST /api/informe  → recibe un diagnóstico (JSON) y devuelve
                          el Informe de Resultado en HTML
   ========================================================= */

const http = require('http');
const { generarInforme } = require('./informe');

const PUERTO = process.env.PORT || 3000;
const LIMITE_BYTES = 20000; // tamaño máximo del pedido (20 KB)

// Permite que la página (Apache/XAMPP o archivo local) llame al servicio
function permisosCORS(respuesta) {
  respuesta.setHeader('Access-Control-Allow-Origin', '*');
  respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function enviarJSON(respuesta, codigo, datos) {
  respuesta.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8' });
  respuesta.end(JSON.stringify(datos));
}

// Lee el cuerpo del pedido y lo convierte de JSON a objeto
function leerCuerpo(pedido) {
  return new Promise(function (resolver, rechazar) {
    let texto = '';
    pedido.on('data', function (parte) {
      texto += parte;
      if (texto.length > LIMITE_BYTES) {
        rechazar(new Error('El pedido es demasiado grande.'));
        pedido.destroy();
      }
    });
    pedido.on('end', function () {
      try {
        resolver(JSON.parse(texto || '{}'));
      } catch (error) {
        rechazar(new Error('Los datos no tienen formato JSON válido.'));
      }
    });
  });
}

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

// Solo arranca el servidor si se ejecuta este archivo directamente
// (las pruebas lo importan sin arrancarlo)
if (require.main === module) {
  servidor.listen(PUERTO, function () {
    console.log('Servicio de informes de EcoControl en http://localhost:' + PUERTO);
  });
}

module.exports = servidor;
