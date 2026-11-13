<?php
/* =========================================================
   EcoControl - admin.php  (solo para el Titular)
   accion = "resumen":       totales, solicitudes, clientes y mensajes
   accion = "cambiarEstado": cambia el estado de una solicitud
   ========================================================= */
require 'conexion.php';

exigirAdmin();
$datos = leerDatos();
$accion = $datos['accion'] ?? '';

if ($accion === 'resumen') {
    // Totales para las tarjetas del panel
    $totales = $conexion->query(
        "SELECT
            (SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente') AS clientes,
            (SELECT COUNT(*) FROM diagnosticos) AS diagnosticos,
            (SELECT ROUND(AVG(indice)) FROM diagnosticos) AS promedio,
            (SELECT COUNT(*) FROM asesorias WHERE estado = 'Pendiente') AS pendientes"
    )->fetch_assoc();

    // Solicitudes de asesoramiento con el nombre del cliente
    $solicitudes = $conexion->query(
        'SELECT a.id, a.fecha, u.nombre, u.email, a.area, a.modalidad, a.telefono, a.mensaje, a.estado
         FROM asesorias a INNER JOIN usuarios u ON u.id = a.usuario_id
         ORDER BY a.fecha DESC'
    )->fetch_all(MYSQLI_ASSOC);

    // Clientes con su cantidad de diagnósticos y su último índice
    $clientes = $conexion->query(
        "SELECT u.nombre, u.email, u.creado_en,
                COUNT(d.id) AS diagnosticos,
                (SELECT d2.indice FROM diagnosticos d2 WHERE d2.usuario_id = u.id
                 ORDER BY d2.fecha DESC, d2.id DESC LIMIT 1) AS ultimo_indice
         FROM usuarios u LEFT JOIN diagnosticos d ON d.usuario_id = u.id
         WHERE u.rol = 'cliente'
         GROUP BY u.id ORDER BY u.creado_en DESC"
    )->fetch_all(MYSQLI_ASSOC);

    $mensajes = $conexion->query(
        'SELECT fecha, nombre, email, asunto, mensaje FROM contactos ORDER BY fecha DESC'
    )->fetch_all(MYSQLI_ASSOC);

    responder([
        'ok' => true,
        'totales' => $totales,
        'solicitudes' => $solicitudes,
        'clientes' => $clientes,
        'mensajes' => $mensajes
    ]);
}

if ($accion === 'cambiarEstado') {
    $id = (int) ($datos['id'] ?? 0);
    $estado = $datos['estado'] ?? '';
    if (!in_array($estado, ['Pendiente', 'En curso', 'Finalizada'], true)) {
        responder(['ok' => false, 'mensaje' => 'Estado no válido.'], 400);
    }
    $consulta = $conexion->prepare('UPDATE asesorias SET estado = ? WHERE id = ?');
    $consulta->bind_param('si', $estado, $id);
    $consulta->execute();
    responder(['ok' => true]);
}

responder(['ok' => false, 'mensaje' => 'Acción no válida.'], 400);
