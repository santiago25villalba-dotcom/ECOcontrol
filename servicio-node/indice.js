/* =========================================================
   EcoControl - indice.js (Node.js)
   Reglas del Índice Eco. Son las mismas que usa el
   JavaScript del navegador (app.js) y el PHP, para que el
   resultado sea siempre igual.
   ========================================================= */

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

module.exports = { limitarPuntaje, calcularIndice, calcularNivel };
