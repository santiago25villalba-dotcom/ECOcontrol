<?php
/* EcoControl - logout.php: cierra la sesión en el servidor */
session_start();
$_SESSION = [];
session_destroy();
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => true]);
