<?php
/* EcoControl - login.php: inicia la sesión de un usuario */
require 'conexion.php';

$datos = leerDatos();
$email = strtolower(trim($datos['email'] ?? ''));
$clave = $datos['clave'] ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($clave) < 6) {
    responder(['ok' => false, 'mensaje' => 'Correo o contraseña inválidos.'], 400);
}

$consulta = $conexion->prepare('SELECT id, nombre, email, clave, rol FROM usuarios WHERE email = ?');
$consulta->bind_param('s', $email);
$consulta->execute();
$usuario = $consulta->get_result()->fetch_assoc();

if (!$usuario || !password_verify($clave, $usuario['clave'])) {
    responder(['ok' => false, 'mensaje' => 'El correo o la contraseña son incorrectos.'], 401);
}

session_regenerate_id(true);
$_SESSION['usuario_id'] = $usuario['id'];
$_SESSION['rol'] = $usuario['rol'];

responder([
    'ok' => true,
    'usuario' => ['id' => $usuario['id'], 'nombre' => $usuario['nombre'], 'email' => $usuario['email'], 'rol' => $usuario['rol']]
]);
