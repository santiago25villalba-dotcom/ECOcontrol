<?php
/* EcoControl - nueva_clave.php
   Cambia la contraseña usando el código (token) del enlace de recuperación.
   El código vale 1 hora y se puede usar una sola vez. */
require 'conexion.php';

$datos = leerDatos();
$token = $datos['token'] ?? '';
$clave = $datos['clave'] ?? '';

if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
    responder(['ok' => false, 'mensaje' => 'El enlace no es válido. Pedí uno nuevo desde "Olvidé mi contraseña".'], 400);
}
if (strlen($clave) < 6) {
    responder(['ok' => false, 'mensaje' => 'La contraseña debe tener al menos 6 caracteres.'], 400);
}

$consulta = $conexion->prepare('SELECT id, usuario_id FROM recuperaciones WHERE token = ? AND usado = 0 AND vence > NOW()');
$consulta->bind_param('s', $token);
$consulta->execute();
$pedido = $consulta->get_result()->fetch_assoc();

if (!$pedido) {
    responder(['ok' => false, 'mensaje' => 'El enlace venció o ya fue usado. Pedí uno nuevo desde "Olvidé mi contraseña".'], 400);
}

$hash = password_hash($clave, PASSWORD_DEFAULT);
$consulta = $conexion->prepare('UPDATE usuarios SET clave = ? WHERE id = ?');
$consulta->bind_param('si', $hash, $pedido['usuario_id']);
$consulta->execute();

$consulta = $conexion->prepare('UPDATE recuperaciones SET usado = 1 WHERE id = ?');
$consulta->bind_param('i', $pedido['id']);
$consulta->execute();

responder(['ok' => true]);
