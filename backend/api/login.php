<?php
// Activar errores para debugging (solo en desarrollo)
error_reporting(E_ALL);
ini_set('display_errors', 1);
/**
 * 
 * ============================================================================
 * ENDPOINT DE LOGIN - API REST
 * ============================================================================
 * 
 * Este endpoint maneja la autenticación de usuarios.
 * 
 * Flujo:
 * 1. Recibe username y password desde el cliente
 * 2. Valida las credenciales contra usuarios.json
 * 3. Si son correctas: genera token + envía catálogo completo de la tienda
 * 4. Si son incorrectas: devuelve error 401
 * 
 * ¿Por qué enviamos el catálogo completo en el login?
 * - Para que el cliente lo guarde en LocalStorage
 * - Y así evitar hacer más peticiones al servidor durante la navegación
 */

// Incluir archivos necesarios
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/token.php';

// ============================================================================
// SOLO PERMITIR PETICIONES POST
// ============================================================================

/**
 * ¿Por qué solo POST?
 * - POST envía datos en el body (más seguro que GET que los pone en la URL)
 * - Las credenciales nunca deben ir en la URL
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarRespuesta(false, null, 'Método no permitido. Usa POST.', 405);
}

// ============================================================================
// OBTENER Y VALIDAR DATOS DE ENTRADA
// ============================================================================

/**
 * file_get_contents('php://input') obtiene el body de la petición
 * En JavaScript se envía así:
 * 
 * fetch('login.php', {
 *   method: 'POST',
 *   body: JSON.stringify({ username: 'admin', password: 'admin123' })
 * })
 */
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true); // Convertir JSON a array PHP

// Validar que se recibieron los datos necesarios
if (!isset($input['username']) || !isset($input['password'])) {
    enviarRespuesta(false, null, 'Faltan credenciales. Proporciona username y password.', 400);
}

// Sanitizar datos para evitar inyecciones
$username = trim($input['username']); // trim() quita espacios en blanco
$password = trim($input['password']);

// Validar que no estén vacíos
if (empty($username) || empty($password)) {
    enviarRespuesta(false, null, 'Username y password no pueden estar vacíos.', 400);
}

// ============================================================================
// LEER USUARIOS DESDE JSON
// ============================================================================

$usuarios = leerJSON(USUARIOS_JSON);

// Verificar que se pudo leer el archivo
if ($usuarios === null || !isset($usuarios['usuarios'])) {
    enviarRespuesta(false, null, 'Error al cargar usuarios del sistema.', 500);
}

// ============================================================================
// BUSCAR USUARIO Y VALIDAR CREDENCIALES
// ============================================================================

$usuarioEncontrado = null;

/**
 * Recorrer todos los usuarios para buscar coincidencia
 * 
 * ¿Por qué no usar base de datos?
 * - Es un ejercicio académico para aprender el flujo
 * - En producción usarías MySQL con password_hash()
 */
foreach ($usuarios['usuarios'] as $usuario) {
    // Verificar username Y password
    if ($usuario['username'] === $username && $usuario['password'] === $password) {
        $usuarioEncontrado = $usuario;
        break; // Salir del loop cuando lo encontremos
    }
}

// Si no se encontró, credenciales incorrectas
if ($usuarioEncontrado === null) {
    enviarRespuesta(false, null, 'Credenciales incorrectas.', 401);
}

// ============================================================================
// GENERAR TOKEN DE AUTENTICACIÓN
// ============================================================================

$tokenData = generarToken($usuarioEncontrado['id'], $usuarioEncontrado['username']);

// ============================================================================
// LEER CATÁLOGO COMPLETO DE LA TIENDA
// ============================================================================

/**
 * Este es el punto clave: enviamos TODO el catálogo al cliente
 * ¿Por qué?
 * - El cliente lo guardará en LocalStorage
 * - Así puede navegar por productos/categorías sin tocar el servidor
 */
$tienda = leerJSON(TIENDA_JSON);

if ($tienda === null) {
    enviarRespuesta(false, null, 'Error al cargar el catálogo de la tienda.', 500);
}

// ============================================================================
// CONSTRUIR RESPUESTA EXITOSA
// ============================================================================

/**
 * Estructura de la respuesta:
 * {
 *   "success": true,
 *   "data": {
 *     "token": "eyJ1c2VyX2lk...",
 *     "expiracion": 1234567890,
 *     "usuario": { "id": 1, "username": "admin", ... },
 *     "tienda": { "categorias": [...], "productos": [...] }
 *   },
 *   "message": "Login exitoso"
 * }
 * 
 * El cliente JavaScript recibirá todo esto y:
 * 1. Guardará el token en LocalStorage
 * 2. Guardará la tienda completa en LocalStorage
 * 3. Redirigirá al dashboard
 */
$respuesta = [
    'token' => $tokenData['token'],
    'expiracion' => $tokenData['expiracion'],
    'usuario' => [
        'id' => $usuarioEncontrado['id'],
        'username' => $usuarioEncontrado['username'],
        'email' => $usuarioEncontrado['email'],
        'nombre' => $usuarioEncontrado['nombre']
    ],
    'tienda' => $tienda // Catálogo completo: categorías y productos
];

// Enviar respuesta exitosa
enviarRespuesta(true, $respuesta, 'Login exitoso. Bienvenido ' . $usuarioEncontrado['nombre'], 200);

/**
 * ============================================================================
 * RESUMEN DEL FLUJO COMPLETO:
 * ============================================================================
 * 
 * CLIENTE (JavaScript):
 * 1. Usuario ingresa credenciales en formulario
 * 2. JavaScript hace fetch a login.php con username/password
 * 3. Recibe respuesta con token + tienda completa
 * 4. Guarda todo en LocalStorage
 * 5. Redirige a dashboard.html
 * 
 * SERVIDOR (PHP):
 * 1. Recibe credenciales
 * 2. Valida contra usuarios.json
 * 3. Si correctas: genera token + lee tienda.json
 * 4. Envía todo al cliente
 * 
 * VENTAJA:
 * - Después de este login, el cliente tiene TODO lo necesario
 * - Puede navegar sin hacer más peticiones al servidor
 * - Solo volverá al servidor para validar el carrito en el checkout
 */
?>