<?php
/* EcoControl - asesoramiento.php: guarda una solicitud de asesoría */
require 'conexion.php';

$usuarioId = exigirUsuario();
$datos = leerDatos();

$area = trim($datos['area'] ?? '');
$modalidad = trim($datos['modalidad'] ?? '');
$telefono = trim($datos['telefono'] ?? '');
$mensaje = trim($datos['mensaje'] ?? '');

if ($area === '' || $modalidad === '' || mb_strlen($mensaje) < 5) {
    responder(['ok' => false, 'mensaje' => 'Completá los datos de la solicitud.'], 400);
}

$consulta = $conexion->prepare(
    'INSERT INTO asesorias (usuario_id, area, modalidad, telefono, mensaje) VALUES (?, ?, ?, ?, ?)'
);
$consulta->bind_param('issss', $usuarioId, $area, $modalidad, $telefono, $mensaje);
$consulta->execute();

responder(['ok' => true, 'id' => $conexion->insert_id]);
