<?php
/* EcoControl - mis_asesorias.php: devuelve las solicitudes (y su pago) del usuario logueado */
require 'conexion.php';

$usuarioId = exigirUsuario();
$consulta = $conexion->prepare(
    'SELECT id, fecha, area, modalidad, metodo_pago, monto, pago_estado, referencia, estado
     FROM asesorias WHERE usuario_id = ? ORDER BY fecha DESC, id DESC'
);
$consulta->bind_param('i', $usuarioId);
$consulta->execute();
$lista = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);
responder(['ok' => true, 'asesorias' => $lista]);
