<?php
/**
 * ============================================================================
 * UTILIDADES PARA MANEJO DE TOKENS DE AUTENTICACIÓN
 * ============================================================================
 * 
 * Este archivo contiene todas las funciones relacionadas con:
 * - Generación de tokens
 * - Validación de tokens
 * - Extracción de tokens desde headers HTTP
 * - Middleware de autenticación
 * 
 * ¿Qué es un token de autenticación?
 * - Es como una "credencial temporal" que prueba que el usuario hizo login
 * - Similar a un ticket de entrada a un concierto
 * - El usuario lo presenta en cada petición para demostrar que está autenticado
 */

// Incluir el archivo de configuración para acceder a constantes y funciones
require_once __DIR__ . '/../config/config.php';

// ============================================================================
// GENERACIÓN DE TOKENS
// ============================================================================

/**
 * Genera un token de autenticación para un usuario
 * 
 * ¿Cuándo se llama esta función?
 * - Cuando el usuario hace login exitosamente
 * - El token generado se enviará al cliente para guardarlo en LocalStorage
 * 
 * ¿Qué información debe contener un token?
 * - ID del usuario (para saber quién es)
 * - Nombre de usuario
 * - Timestamp (momento de creación, para calcular expiración)
 * - Secret (firma para evitar falsificaciones)
 * 
 * @param int $userId ID del usuario autenticado
 * @param string $username Nombre de usuario
 * @return array Contiene: token, fecha de expiración y timestamp
 */
function generarToken($userId, $username) {
    /**
     * NOTA IMPORTANTE: Sistema de tokens simplificado para aprendizaje
     * 
     * ¿Qué usaríamos en producción real?
     * - JWT (JSON Web Tokens): Estándar de la industria
     * - Librería: firebase/php-jwt
     * - Incluye firma criptográfica más robusta
     * 
     * Para este ejercicio académico, usamos un sistema más simple
     * pero que enseña los conceptos fundamentales.
     */
    
    // time() devuelve el timestamp actual (segundos desde 1 enero 1970)
    $timestamp = time();
    
    // Calcular cuándo expirará el token
    // Ejemplo: Si TOKEN_EXPIRATION = 86400 (24 horas)
    // y ahora son las 14:00 del lunes, expirará a las 14:00 del martes
    $expiracion = $timestamp + TOKEN_EXPIRATION;
    
    /**
     * Crear el payload (contenido) del token
     * 
     * ¿Por qué incluimos el SECRET_TOKEN en el payload?
     * - Para que cuando validemos el token, podamos verificar que fue
     *   generado por nuestro servidor y no falsificado por un atacante
     * - Es como una "firma secreta" que solo nosotros conocemos
     */
    $payload = [
        'user_id' => $userId,
        'username' => $username,
        'timestamp' => $timestamp,
        'secret' => SECRET_TOKEN
    ];
    
    /**
     * ¿Por qué usamos json_encode() y luego base64_encode()?
     * 
     * 1. json_encode($payload): Convierte el array PHP a string JSON
     *    ['user_id' => 1] → '{"user_id":1}'
     * 
     * 2. base64_encode(): Convierte el string a base64
     *    '{"user_id":1}' → 'eyJ1c2VyX2lkIjoxfQ=='
     * 
     * ¿Para qué base64?
     * - Para que el token sea una cadena "segura" para URLs y headers HTTP
     * - Evita problemas con caracteres especiales como {, }, ", etc.
     * 
     * ⚠️ IMPORTANTE: base64 NO es encriptación, solo codificación
     * - Cualquiera puede decodificar base64 y ver el contenido
     * - La seguridad viene del SECRET_TOKEN, no del base64
     */
    $tokenData = base64_encode(json_encode($payload));
    
    // Devolver toda la información del token
    return [
        'token' => $tokenData,              // El token que se enviará al cliente
        'expiracion' => $expiracion,        // Timestamp de expiración
        'timestamp' => $timestamp           // Timestamp de creación
    ];
}

// ============================================================================
// VALIDACIÓN DE TOKENS
// ============================================================================

/**
 * Valida un token de autenticación
 * 
 * ¿Cuándo se llama esta función?
 * - Cada vez que el cliente hace una petición a un endpoint protegido
 * - El cliente debe enviar el token en el header "Authorization"
 * 
 * ¿Qué verificaciones hacemos?
 * 1. Que el token no esté vacío
 * 2. Que se pueda decodificar correctamente
 * 3. Que contenga todos los campos necesarios
 * 4. Que el SECRET_TOKEN coincida (firma válida)
 * 5. Que no haya expirado
 * 
 * @param string $token Token a validar
 * @return array|false Datos del usuario si es válido, false si no lo es
 */
function validarToken($token) {
    // Verificación 1: Token no vacío
    if (empty($token)) {
        return false;
    }
    
    /**
     * try-catch: Manejo de errores
     * 
     * ¿Por qué usarlo?
     * - base64_decode() y json_decode() pueden fallar si el token está corrupto
     * - Sin try-catch, el script mostraría errores feos al usuario
     * - Con try-catch, capturamos el error y devolvemos false limpiamente
     */
    try {
        /**
         * Decodificar el token (proceso inverso a generarToken)
         * 
         * 1. base64_decode($token): Convierte base64 a string JSON
         *    'eyJ1c2VyX2lkIjoxfQ==' → '{"user_id":1,...}'
         * 
         * 2. json_decode(..., true): Convierte string JSON a array PHP
         *    '{"user_id":1}' → ['user_id' => 1]
         */
        $tokenData = json_decode(base64_decode($token), true);
        
        /**
         * Verificación 2: El token debe contener todos los campos necesarios
         * 
         * ¿Por qué verificar cada campo?
         * - Si alguien intenta crear un token falso manualmente
         * - Si el token se corrompió durante la transmisión
         * - Si usamos una versión vieja del token con diferente estructura
         */
        if (!isset($tokenData['user_id']) || 
            !isset($tokenData['username']) || 
            !isset($tokenData['timestamp']) || 
            !isset($tokenData['secret'])) {
            return false;
        }
        
        /**
         * Verificación 3: El secret debe coincidir
         * 
         * Esta es la verificación MÁS IMPORTANTE de seguridad
         * 
         * ¿Cómo funciona?
         * - Cuando generamos el token, incluimos SECRET_TOKEN
         * - Un atacante no conoce SECRET_TOKEN (está solo en el servidor)
         * - Si alguien crea un token falso, no tendrá el secret correcto
         * - Por tanto, esta verificación lo rechazará
         * 
         * Es como verificar que un billete tenga la marca de agua correcta
         */
        if ($tokenData['secret'] !== SECRET_TOKEN) {
            return false;
        }
        
        /**
         * Verificación 4: El token no debe haber expirado
         * 
         * ¿Cómo calculamos si expiró?
         * - time() = timestamp actual (ejemplo: 1700000000)
         * - $tokenData['timestamp'] = cuando se creó (ejemplo: 1699913600)
         * - tiempoTranscurrido = 1700000000 - 1699913600 = 86400 (24 horas)
         * 
         * Si tiempoTranscurrido > TOKEN_EXPIRATION, el token expiró
         * 
         * ¿Por qué expiran los tokens?
         * - Seguridad: Si roban tu token, solo será válido por tiempo limitado
         * - Fuerza al usuario a volver a autenticarse periódicamente
         */
        $tiempoTranscurrido = time() - $tokenData['timestamp'];
        if ($tiempoTranscurrido > TOKEN_EXPIRATION) {
            return false;
        }
        
        /**
         * Si llegamos aquí, el token es 100% válido ✅
         * Devolvemos solo la información relevante del usuario
         * (sin incluir el secret por seguridad)
         */
        return [
            'user_id' => $tokenData['user_id'],
            'username' => $tokenData['username']
        ];
        
    } catch (Exception $e) {
        /**
         * Si hubo cualquier error durante la decodificación
         * (token corrupto, formato inválido, etc.)
         * devolvemos false
         */
        return false;
    }
}

// ============================================================================
// EXTRACCIÓN DE TOKEN DESDE HEADERS HTTP
// ============================================================================

/**
 * Obtiene el token del header Authorization de la petición HTTP
 * 
 * ¿Cómo envía el cliente el token?
 * En JavaScript, cuando hace fetch:
 * 
 * fetch('http://localhost/backend/api/carrito.php', {
 *   headers: {
 *     'Authorization': 'Bearer eyJ1c2VyX2lkIjoxfQ=='
 *   }
 * })
 * 
 * ¿Qué es "Bearer"?
 * - Es un estándar que indica que el tipo de autenticación es por token
 * - Formato: "Bearer ELTOKEN"
 * - Es como decir: "El portador (bearer) de este token está autenticado"
 * 
 * @return string|null Token si existe, null si no se encontró
 */
function obtenerTokenDeHeader() {
    /**
     * getallheaders() obtiene todos los headers HTTP de la petición
     * Devuelve un array asociativo:
     * [
     *   'Content-Type' => 'application/json',
     *   'Authorization' => 'Bearer eyJ1c2VyX2lkIjoxfQ==',
     *   ...
     * ]
     */
    $headers = getallheaders();
    
    // Buscar el header Authorization
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        
        /**
         * preg_match() busca un patrón en un string
         * 
         * Patrón: '/Bearer\s+(.*)$/i'
         * - Bearer: La palabra "Bearer"
         * - \s+: Uno o más espacios en blanco
         * - (.*): Captura todo lo que siga (el token)
         * - $: Hasta el final del string
         * - i: Case insensitive (acepta "bearer", "Bearer", "BEARER")
         * 
         * Si encuentra el patrón:
         * - Devuelve true
         * - Llena $matches[1] con lo capturado (el token)
         * 
         * Ejemplo:
         * $authHeader = "Bearer abc123"
         * Después de preg_match:
         * $matches[0] = "Bearer abc123"  (coincidencia completa)
         * $matches[1] = "abc123"         (grupo capturado)
         */
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        /**
         * Si no tiene "Bearer", devolver el header completo
         * Esto permite flexibilidad: el cliente puede enviar solo el token
         */
        return $authHeader;
    }
    
    // Si no hay header Authorization, devolver null
    return null;
}

// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================================================

/**
 * Middleware para verificar autenticación en endpoints protegidos
 * 
 * ¿Qué es un middleware?
 * - Es una función que se ejecuta ANTES del código principal del endpoint
 * - Actúa como un "guardián" que verifica permisos
 * - Si la verificación falla, detiene la ejecución y devuelve error
 * - Si la verificación pasa, permite continuar
 * 
 * ¿Cómo se usa?
 * Al inicio de cada endpoint protegido:
 * 
 * // En carrito.php:
 * $usuario = verificarAutenticacion(); // Si falla, aquí termina todo
 * // Si llegamos aquí, el usuario está autenticado ✅
 * echo "Usuario autenticado: " . $usuario['username'];
 * 
 * @return array Datos del usuario autenticado (user_id, username)
 */
function verificarAutenticacion() {
    // Paso 1: Obtener el token del header
    $token = obtenerTokenDeHeader();
    
    /**
     * Verificación 1: ¿Se proporcionó el token?
     * 
     * ¿Cuándo falla esto?
     * - El cliente olvidó enviar el header Authorization
     * - El cliente no está autenticado (no hizo login)
     * 
     * Respuesta: Error 401 (Unauthorized)
     */
    if (!$token) {
        enviarRespuesta(false, null, 'Token no proporcionado. Debes iniciar sesión.', 401);
        // enviarRespuesta() hace exit(), así que aquí termina todo
    }
    
    // Paso 2: Validar el token
    $datosToken = validarToken($token);
    
    /**
     * Verificación 2: ¿Es válido el token?
     * 
     * ¿Cuándo falla esto?
     * - El token está corrupto
     * - El token fue manipulado (secret incorrecto)
     * - El token expiró (pasaron más de 24 horas)
     * 
     * Respuesta: Error 401 (Unauthorized)
     */
    if (!$datosToken) {
        enviarRespuesta(false, null, 'Token inválido o expirado. Debes iniciar sesión nuevamente.', 401);
        // Aquí también termina todo
    }
    
    /**
     * Si llegamos aquí, todo está bien ✅
     * El usuario está autenticado y su token es válido
     * Devolvemos sus datos para que el endpoint los use
     */
    return $datosToken;
}

/**
 * ============================================================================
 * RESUMEN DEL FLUJO DE AUTENTICACIÓN:
 * ============================================================================
 * 
 * 1. LOGIN:
 *    - Usuario envía credenciales → login.php
 *    - Si son correctas → generarToken()
 *    - Token se envía al cliente
 *    - Cliente guarda token en LocalStorage
 * 
 * 2. PETICIÓN A ENDPOINT PROTEGIDO:
 *    - Cliente envía petición con header: Authorization: Bearer TOKEN
 *    - Endpoint llama a verificarAutenticacion()
 *    - obtenerTokenDeHeader() extrae el token
 *    - validarToken() verifica que sea válido
 *    - Si es válido → continúa, si no → error 401
 * 
 * 3. EXPIRACIÓN:
 *    - Después de 24 horas, validarToken() detecta que expiró
 *    - Cliente recibe error 401
 *    - Cliente borra LocalStorage y redirige a login
 *    - Usuario debe volver a autenticarse
 */
?>