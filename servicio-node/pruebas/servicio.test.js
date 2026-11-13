/* Pruebas automáticas del servicio Node.js.  Ejecutar: npm test */
const test = require('node:test');
const assert = require('node:assert');
const { calcularIndice, calcularNivel, limitarPuntaje } = require('../indice');
const { escapar, generarInforme } = require('../informe');
const servidor = require('../servidor');

test('N-01 calcula el Índice Eco como promedio de las tres áreas', function () {
  assert.strictEqual(calcularIndice(100, 52, 100), 84);
  assert.strictEqual(calcularIndice(0, 0, 0), 0);
  assert.strictEqual(calcularIndice(100, 100, 100), 100);
});

test('N-02 asigna el nivel según el puntaje (límites 40 y 70)', function () {
  assert.strictEqual(calcularNivel(39), 'Bajo');
  assert.strictEqual(calcularNivel(40), 'Medio');
  assert.strictEqual(calcularNivel(69), 'Medio');
  assert.strictEqual(calcularNivel(70), 'Alto');
});

test('N-03 corrige puntajes fuera de rango o inválidos', function () {
  assert.strictEqual(limitarPuntaje(150), 100);
  assert.strictEqual(limitarPuntaje(-20), 0);
  assert.strictEqual(limitarPuntaje('abc'), 0);
});

test('N-04 escapa el código HTML para evitar XSS', function () {
  assert.strictEqual(escapar('<script>'), '&lt;script&gt;');
  const html = generarInforme({ nombre: '<b>Ana</b>', energia: 50, agua: 50, residuos: 50 });
  assert.ok(!html.includes('<b>Ana</b>'));
});

test('N-05 recalcula el índice aunque el cliente mande uno falso', function () {
  const html = generarInforme({ indice: 100, energia: 10, agua: 10, residuos: 10 });
  assert.ok(html.includes('>10</div>'));
  assert.ok(html.includes('Bajo'));
});

test('N-06 rutas HTTP: estado, informe, JSON inválido y ruta inexistente', async function () {
  await new Promise((r) => servidor.listen(0, r));
  const base = 'http://127.0.0.1:' + servidor.address().port;
  try {
    let r = await fetch(base + '/api/estado');
    assert.strictEqual(r.status, 200);
    assert.strictEqual((await r.json()).ok, true);

    r = await fetch(base + '/api/informe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Santiago', tipo: 'Hogar', energia: 100, agua: 52, residuos: 100, recomendaciones: ['Duchas cortas'] })
    });
    assert.strictEqual(r.status, 200);
    const html = await r.text();
    assert.ok(html.includes('Informe de Resultado') && html.includes('>84</div>') && html.includes('Alto'));

    r = await fetch(base + '/api/informe', { method: 'POST', body: '{esto no es json' });
    assert.strictEqual(r.status, 400);

    r = await fetch(base + '/no-existe');
    assert.strictEqual(r.status, 404);
  } finally {
    servidor.close();
  }
});
