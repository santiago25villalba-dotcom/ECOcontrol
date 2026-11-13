<?php
/* EcoControl - registro.php: crea una cuenta nueva */
require 'conexion.php';

$datos = leerDatos();
$nombre = trim($datos['nombre'] ?? '');
$email = strtolower(trim($datos['email'] ?? ''));
$clave = $datos['clave'] ?? '';

if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 100) {
    responder(['ok' => false, 'mensaje' => 'Escribí tu nombre.'], 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(['ok' => false, 'mensaje' => 'Ingresá un correo electrónico válido.'], 400);
}
if (strlen($clave) < 6) {
    responder(['ok' => false, 'mensaje' => 'La contraseña debe tener al menos 6 caracteres.'], 400);
}

// ¿Ya existe ese correo?
$consulta = $conexion->prepare('SELECT id FROM usuarios WHERE email = ?');
$consulta->bind_param('s', $email);
$consulta->execute();
if ($consulta->get_result()->num_rows > 0) {
    responder(['ok' => false, 'mensaje' => 'Ya existe una cuenta con ese correo.'], 409);
}

// Guardamos la contraseña encriptada, nunca el texto original
$hash = password_hash($clave, PASSWORD_DEFAULT);
$consulta = $conexion->prepare('INSERT INTO usuarios (nombre, email, clave) VALUES (?, ?, ?)');
$consulta->bind_param('sss', $nombre, $email, $hash);
$consulta->execute();
$id = $conexion->insert_id;

session_regenerate_id(true);
$_SESSION['usuario_id'] = $id;

responder(['ok' => true, 'usuario' => ['id' => $id, 'nombre' => $nombre, 'email' => $email]]);
