<?php
/**
 * ============================================================================
 * UTILIDADES PARA MANEJO DE TOKENS DE AUTENTICACIÓN
 * ============================================================================
 */

require_once __DIR__ . '/../config/config.php';

/**
 * Generar token de autenticación
 */
function generarToken($userId, $username) {
    $timestamp = time();
    $expiracion = $timestamp + TOKEN_EXPIRATION;
    
    // Crear payload del token
    $payload = [
        'user_id' => $userId,
        'username' => $username,
        'timestamp' => $timestamp,
        'secret' => SECRET_TOKEN
    ];
    
    // Codificar en base64
    $tokenData = base64_encode(json_encode($payload));
    
    return [
        'token' => $tokenData,
        'expiracion' => $expiracion,
        'timestamp' => $timestamp
    ];
}

/**
 * Validar token de autenticación
 */
function validarToken($token) {
    if (empty($token)) {
        return false;
    }
    
    try {
        // Decodificar token
        $tokenData = json_decode(base64_decode($token), true);
        
        // Verificar campos necesarios
        if (!isset($tokenData['user_id']) || 
            !isset($tokenData['username']) || 
            !isset($tokenData['timestamp']) || 
            !isset($tokenData['secret'])) {
            return false;
        }
        
        // Verificar secret
        if ($tokenData['secret'] !== SECRET_TOKEN) {
            return false;
        }
        
        // Verificar expiración
        $tiempoTranscurrido = time() - $tokenData['timestamp'];
        if ($tiempoTranscurrido > TOKEN_EXPIRATION) {
            return false;
        }
        
        return [
            'user_id' => $tokenData['user_id'],
            'username' => $tokenData['username']
        ];
        
    } catch (Exception $e) {
        return false;
    }
}

/**
 * Obtener token del header Authorization
 */
function obtenerTokenDeHeader() {
    // Método compatible con todos los servidores
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    } else {
        return null;
    }
    
    if (isset($authHeader)) {
        // Extraer token del formato "Bearer TOKEN"
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        return $authHeader;
    }
    
    return null;
}

/**
 * Middleware: Verificar autenticación en endpoints protegidos
 */
function verificarAutenticacion() {
    $token = obtenerTokenDeHeader();
    
    if (!$token) {
        enviarRespuesta(false, null, 'Token no proporcionado. Debes iniciar sesión.', 401);
    }
    
    $datosToken = validarToken($token);
    
    if (!$datosToken) {
        enviarRespuesta(false, null, 'Token inválido o expirado. Debes iniciar sesión nuevamente.', 401);
    }
    
    return $datosToken;
}
?>

