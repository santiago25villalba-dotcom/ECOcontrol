<?php
/* =========================================================
   EcoControl - conexion.php
   Conexión a MySQL y funciones que usan todos los PHP.
   Configurado para XAMPP (usuario root sin contraseña).
   ========================================================= */

// Datos de la base de datos (cambiarlos si tu XAMPP es distinto)
define('DB_SERVIDOR', 'localhost');
define('DB_USUARIO', 'root');
define('DB_CLAVE', '');
define('DB_NOMBRE', 'ecocontrol');

session_start();
header('Content-Type: application/json; charset=utf-8');

// Envía una respuesta en formato JSON al JavaScript y termina
function responder($datos, $codigo = 200)
{
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Lee los datos que manda el JavaScript (en formato JSON)
function leerDatos()
{
    $datos = json_decode(file_get_contents('php://input'), true);
    return is_array($datos) ? $datos : [];
}

// Devuelve el id del usuario logueado o corta si no hay sesión
function exigirUsuario()
{
    if (empty($_SESSION['usuario_id'])) {
        responder(['ok' => false, 'sinSesion' => true, 'mensaje' => 'Tu sesión expiró. Volvé a iniciar sesión.'], 401);
    }
    return (int) $_SESSION['usuario_id'];
}

// Igual que exigirUsuario(), pero además el usuario tiene que ser el Titular (admin)
function exigirAdmin()
{
    $id = exigirUsuario();
    if (($_SESSION['rol'] ?? '') !== 'admin') {
        responder(['ok' => false, 'mensaje' => 'Solo el Titular puede ver esta información.'], 403);
    }
    return $id;
}

// Solo aceptamos pedidos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
}

// Conexión (los errores se manejan con try/catch)
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
try {
    $conexion = new mysqli(DB_SERVIDOR, DB_USUARIO, DB_CLAVE, DB_NOMBRE);
    $conexion->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    responder(['ok' => false, 'mensaje' => 'No se pudo conectar a la base de datos. Revisá que MySQL esté encendido en XAMPP y que exista la base "ecocontrol".'], 500);
}
