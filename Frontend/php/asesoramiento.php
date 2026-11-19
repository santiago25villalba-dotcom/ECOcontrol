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

// Pago simulado: el monto lo define el servidor segun la modalidad (nunca el navegador)
$precios = ['Videollamada' => 25000, 'Visita presencial' => 45000, 'Por correo' => 12000];
$metodos = ['Mercado Pago', 'PayPal', 'Tarjeta de crédito/débito', 'Transferencia bancaria'];
$metodo = trim($datos['metodo_pago'] ?? '');
if (!isset($precios[$modalidad]) || !in_array($metodo, $metodos, true)) {
    responder(['ok' => false, 'mensaje' => 'Elegí una modalidad y un método de pago válidos.'], 400);
}
$monto = $precios[$modalidad];
$pagoEstado = $metodo === 'Transferencia bancaria' ? 'Pendiente' : 'Aprobado';
$referencia = 'ECO-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));

$consulta = $conexion->prepare(
    'INSERT INTO asesorias (usuario_id, area, modalidad, telefono, mensaje, metodo_pago, monto, pago_estado, referencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$consulta->bind_param('isssssiss', $usuarioId, $area, $modalidad, $telefono, $mensaje, $metodo, $monto, $pagoEstado, $referencia);
$consulta->execute();

responder(['ok' => true, 'id' => $conexion->insert_id]);
