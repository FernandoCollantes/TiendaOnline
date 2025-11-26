<?php
/**
 * ============================================================================
 * ARCHIVO DE CONFIGURACIÓN GENERAL DEL BACKEND
 * ============================================================================
 * 
 * Este archivo contiene todas las constantes y configuraciones globales
 * que se usarán en toda la API REST.
 * 
 * ¿Por qué crear un archivo de configuración separado?
 * - Centraliza valores que se usan en múltiples archivos
 * - Facilita el mantenimiento (cambiar un valor en un solo lugar)
 * - Mejora la seguridad (separar configuración de lógica)
 * - Permite diferentes configuraciones para desarrollo/producción
 */

// ============================================================================
// CONSTANTES DE SEGURIDAD
// ============================================================================

/**
 * Token secreto para validar autenticación
 * 
 * ¿Para qué sirve SECRET_TOKEN?
 * - Es como una "clave privada" que solo conoce el servidor
 * - Se usa para firmar y validar tokens de autenticación
 * - Si alguien intenta crear un token falso sin conocer este secreto, será rechazado
 * 
 *  IMPORTANTE: En producción real, este token debería:
 * - Ser mucho más largo y complejo (mínimo 64 caracteres)
 * - Guardarse en variables de entorno (.env), NO en el código
 * - Cambiarse periódicamente por seguridad
 */
define('SECRET_TOKEN', 'tienda_online_token_secreto_2024');

/**
 * Tiempo de expiración del token en segundos
 * 
 * ¿Por qué los tokens expiran?
 * - Seguridad: Si alguien roba un token, solo será válido por tiempo limitado
 * - Obligar re-autenticación periódica
 * 
 * Conversión de tiempo:
 * - 86400 segundos = 1440 minutos = 24 horas
 * - Puedes calcularlo: 60 seg * 60 min * 24 horas = 86400
 */
define('TOKEN_EXPIRATION', 86400);

// ============================================================================
// RUTAS DE ARCHIVOS JSON
// ============================================================================

/**
 * ¿Qué es __DIR__?
 * - Es una constante mágica de PHP que contiene la ruta del directorio actual
 * - Ejemplo: Si este archivo está en /var/www/backend/config/
 *   entonces __DIR__ = "/var/www/backend/config"
 * 
 * ¿Por qué usamos __DIR__ . '/../data/usuarios.json'?
 * - __DIR__ → /backend/config
 * - /../ → sube un nivel → /backend
 * - /data/usuarios.json → entra en data → /backend/data/usuarios.json
 * 
 * Ventaja: Funciona sin importar desde dónde ejecutemos el script PHP
 */
define('USUARIOS_JSON', __DIR__ . '/../data/usuarios.json');
define('TIENDA_JSON', __DIR__ . '/../data/tienda.json');

// ============================================================================
// CONFIGURACIÓN DE HEADERS CORS
// ============================================================================

/**
 * ¿Qué es CORS (Cross-Origin Resource Sharing)?
 * 
 * Imagina esta situación:
 * - Tu FRONTEND (HTML/JS) se ejecuta en: http://localhost:5500 (Live Server)
 * - Tu BACKEND (PHP) se ejecuta en: http://localhost:8080 (XAMPP)
 * 
 * Por seguridad, los navegadores BLOQUEAN peticiones entre diferentes orígenes
 * (diferente protocolo, dominio o puerto).
 * 
 * ¿Por qué son necesarios estos headers?
 * - Le dicen al navegador: "Está bien, permite que el frontend haga peticiones al backend"
 * - Sin estos headers, tendrías errores tipo: "CORS policy: No 'Access-Control-Allow-Origin'"
 */

/**
 * Access-Control-Allow-Origin: *
 * - Permite peticiones desde CUALQUIER origen
 * - El asterisco (*) significa "todos"
 * -  En producción, deberías especificar tu dominio exacto:
 *   header('Access-Control-Allow-Origin: https://mitienda.com');
 */
header('Access-Control-Allow-Origin: *');

/**
 * Access-Control-Allow-Methods
 * - Especifica qué métodos HTTP están permitidos
 * - GET: Leer datos
 * - POST: Crear/enviar datos
 * - PUT: Actualizar datos
 * - DELETE: Eliminar datos
 * - OPTIONS: Petición de verificación previa (preflight)
 */
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

/**
 * Access-Control-Allow-Headers
 * - Especifica qué headers puede enviar el cliente
 * - Content-Type: Para especificar que enviamos JSON
 * - Authorization: Para enviar el token de autenticación
 */
header('Access-Control-Allow-Headers: Content-Type, Authorization');

/**
 * Content-Type: application/json
 * - Le dice al navegador que nuestras respuestas serán en formato JSON
 * - charset=UTF-8: Permite caracteres especiales (ñ, á, é, €, etc.)
 */
header('Content-Type: application/json; charset=UTF-8');

/**
 * ¿Qué es una petición OPTIONS (preflight)?
 * 
 * Antes de hacer una petición "real" (POST, PUT, DELETE), los navegadores
 * hacen una petición OPTIONS para "preguntar" si tienen permiso.
 * 
 * Flujo:
 * 1. JavaScript hace fetch(..., {method: 'POST'})
 * 2. Navegador primero envía OPTIONS (preflight)
 * 3. Si el servidor responde OK (200), entonces hace el POST real
 * 
 * Por eso aquí respondemos rápidamente a OPTIONS con código 200
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ============================================================================
// FUNCIONES HELPER (AUXILIARES)
// ============================================================================

/**
 * Función para leer archivos JSON y convertirlos en arrays PHP
 * 
 * ¿Por qué crear esta función en lugar de repetir el código?
 * - DRY Principle (Don't Repeat Yourself)
 * - Si necesitamos cambiar cómo leemos JSON, lo hacemos en un solo lugar
 * - Manejo centralizado de errores
 * 
 * @param string $filepath Ruta completa del archivo JSON
 * @return array|null Array con los datos decodificados, o null si hay error
 */
function leerJSON($filepath) {
    // Verificar si el archivo existe antes de intentar leerlo
    // ¿Por qué verificar? Para evitar errores y dar mejor feedback
    if (!file_exists($filepath)) {
        return null;
    }
    
    // file_get_contents() lee TODO el contenido del archivo como string
    $contenido = file_get_contents($filepath);
    
    // json_decode() convierte el string JSON en array PHP
    // Parámetro true: devuelve array asociativo en lugar de objeto
    // Ejemplo: {"nombre": "Juan"} se convierte en ['nombre' => 'Juan']
    return json_decode($contenido, true);
}

/**
 * Función para escribir datos en archivos JSON
 * 
 * ¿Cuándo se usará esta función?
 * - Al crear nuevos pedidos
 * - Al actualizar inventario
 * - Al registrar productos vistos
 * 
 * @param string $filepath Ruta completa del archivo JSON
 * @param array $data Array de datos a guardar
 * @return bool True si se guardó correctamente, false si hubo error
 */
function escribirJSON($filepath, $data) {
    // json_encode() convierte array PHP a string JSON
    // Opciones:
    // - JSON_PRETTY_PRINT: Formatea el JSON con indentación (más legible)
    // - JSON_UNESCAPED_UNICODE: Permite escribir ñ, á, é sin escapar (\u00f1)
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    // file_put_contents() escribe el contenido en el archivo
    // Devuelve false si hubo error, o el número de bytes escritos si tuvo éxito
    return file_put_contents($filepath, $json) !== false;
}

/**
 * Función estandarizada para enviar respuestas JSON al cliente
 * 
 * ¿Por qué estandarizar las respuestas?
 * - El frontend siempre sabe qué estructura esperar
 * - Facilita el manejo de errores en JavaScript
 * - Consistencia en toda la API
 * 
 * Todas nuestras respuestas tendrán esta estructura:
 * {
 *   "success": true/false,
 *   "data": {...},
 *   "message": "Descripción de lo que pasó"
 * }
 * 
 * @param bool $success Indica si la operación fue exitosa
 * @param mixed $data Datos a enviar (puede ser array, objeto, null)
 * @param string $message Mensaje descriptivo para el usuario
 * @param int $httpCode Código HTTP de respuesta
 * 
 * Códigos HTTP comunes:
 * - 200: OK - Todo bien
 * - 201: Created - Recurso creado exitosamente
 * - 400: Bad Request - Error en los datos enviados
 * - 401: Unauthorized - No autenticado o token inválido
 * - 403: Forbidden - Autenticado pero sin permisos
 * - 404: Not Found - Recurso no encontrado
 * - 500: Internal Server Error - Error del servidor
 */
function enviarRespuesta($success, $data = null, $message = '', $httpCode = 200) {
    // Establecer el código HTTP de la respuesta
    http_response_code($httpCode);
    
    // Crear el array de respuesta estandarizado
    $respuesta = [
        'success' => $success,
        'data' => $data,
        'message' => $message
    ];
    
    // Convertir a JSON y enviar
    // JSON_UNESCAPED_UNICODE permite mostrar acentos correctamente
    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
    
    // exit() termina la ejecución del script
    // ¿Por qué? Para asegurar que no se envíe nada más después de la respuesta
    exit();
}
?>