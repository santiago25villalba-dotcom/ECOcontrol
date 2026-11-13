<?php
/* EcoControl - contacto.php: guarda un mensaje del formulario de contacto */
require 'conexion.php';

$datos = leerDatos();
$nombre = trim($datos['nombre'] ?? '');
$email = trim($datos['email'] ?? '');
$asunto = trim($datos['asunto'] ?? '');
$mensaje = trim($datos['mensaje'] ?? '');

if (mb_strlen($nombre) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($asunto) < 2 || mb_strlen($mensaje) < 2) {
    responder(['ok' => false, 'mensaje' => 'Revisá los datos del formulario.'], 400);
}

$consulta = $conexion->prepare('INSERT INTO contactos (nombre, email, asunto, mensaje) VALUES (?, ?, ?, ?)');
$consulta->bind_param('ssss', $nombre, $email, $asunto, $mensaje);
$consulta->execute();

responder(['ok' => true, 'id' => $conexion->insert_id]);
