<?php
/* EcoControl - diagnosticos.php
   accion = "guardar": guarda un diagnóstico del usuario logueado
   accion = "listar":  devuelve el historial del usuario logueado */
require 'conexion.php';

$usuarioId = exigirUsuario();
$datos = leerDatos();
$accion = $datos['accion'] ?? '';

// Asegura que un número esté entre 0 y 100
function puntaje($valor)
{
    return max(0, min(100, (int) $valor));
}

if ($accion === 'guardar') {
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

if ($accion === 'listar') {
    $consulta = $conexion->prepare(
        'SELECT id, fecha, tipo, indice, nivel, energia, agua, residuos, recomendaciones
         FROM diagnosticos WHERE usuario_id = ? ORDER BY fecha DESC, id DESC'
    );
    $consulta->bind_param('i', $usuarioId);
    $consulta->execute();
    $resultado = $consulta->get_result();

    $lista = [];
    while ($fila = $resultado->fetch_assoc()) {
        $fila['indice'] = (int) $fila['indice'];
        $fila['recomendaciones'] = json_decode($fila['recomendaciones'], true) ?: [];
        $lista[] = $fila;
    }
    responder(['ok' => true, 'diagnosticos' => $lista]);
}

responder(['ok' => false, 'mensaje' => 'Acción no válida.'], 400);
