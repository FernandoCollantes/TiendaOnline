<?php
/**
 * ============================================================================
 * ARCHIVO DE CONFIGURACIÓN GENERAL DEL BACKEND
 * ============================================================================
 */

// Token de autenticación (clave privada del servidor)
define('SECRET_TOKEN', 'tienda_online_token_secreto_2024');

// Tiempo de expiración del token (24 horas en segundos)
define('TOKEN_EXPIRATION', 86400);

// Rutas de archivos JSON
define('USUARIOS_JSON', __DIR__ . '/../data/usuarios.json');
define('TIENDA_JSON', __DIR__ . '/../data/tienda.json');

// ============================================================================
// HEADERS CORS - Permitir peticiones desde el frontend
// ============================================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// Responder a peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================================================
// FUNCIONES HELPER
// ============================================================================

/**
 * Leer archivo JSON
 */
function leerJSON($filepath) {
    if (!file_exists($filepath)) {
        return null;
    }
    
    $contenido = file_get_contents($filepath);
    return json_decode($contenido, true);
}

/**
 * Escribir archivo JSON
 */
function escribirJSON($filepath, $data) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents($filepath, $json) !== false;
}

/**
 * Enviar respuesta JSON estandarizada
 */
function enviarRespuesta($success, $data = null, $message = '', $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
?>