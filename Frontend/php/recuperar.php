<?php
/* EcoControl - recuperar.php
   Genera un código para crear una nueva contraseña.
   Nota: XAMPP no envía correos si no se configura un servidor
   de correo (SMTP); por eso el código queda guardado en la tabla
   "recuperaciones" y se muestra el mismo mensaje exista o no
   la cuenta (así nadie puede averiguar qué correos están registrados). */
require 'conexion.php';

// MODO DEMOSTRACIÓN: muestra en pantalla el enlace que llegaría por correo.
// En un servidor real con correo configurado, cambiar a false.
define('MOSTRAR_ENLACE_DEMO', true);
$enlace = null;

$datos = leerDatos();
$email = strtolower(trim($datos['email'] ?? ''));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(['ok' => false, 'mensaje' => 'Ingresá un correo electrónico válido.'], 400);
}

$consulta = $conexion->prepare('SELECT id FROM usuarios WHERE email = ?');
$consulta->bind_param('s', $email);
$consulta->execute();
$usuario = $consulta->get_result()->fetch_assoc();

if ($usuario) {
    $token = bin2hex(random_bytes(32));
    // Vale 1 hora. El vencimiento lo calcula MySQL con su propio reloj,
    // el mismo que usa nueva_clave.php para controlarlo.
    $consulta = $conexion->prepare('INSERT INTO recuperaciones (usuario_id, token, vence) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))');
    $consulta->bind_param('is', $usuario['id'], $token);
    $consulta->execute();
    // Con un servidor de correo configurado, acá se enviaría el enlace:
    // mail($email, 'EcoControl - Nueva contraseña', "Ingresá a: .../login.html?token=$token");
    if (MOSTRAR_ENLACE_DEMO) {
        $enlace = 'login.html?token=' . $token;
    }
}

responder(['ok' => true, 'mensaje' => 'Si el correo está registrado, vas a recibir las instrucciones para crear una nueva contraseña.', 'enlace' => $enlace]);
