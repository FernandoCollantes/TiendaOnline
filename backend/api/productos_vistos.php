<?php
/**
 * ============================================================================
 * ENDPOINT DE PRODUCTOS VISTOS RECIENTEMENTE
 * ============================================================================
 * 
 * ¿Para qué sirve?
 * - Permitir que el cliente registre qué productos ha visto
 * - Útil para mostrar recomendaciones o historial
 * 
 * Nota: En este proyecto, los productos vistos se guardarán principalmente
 * en LocalStorage del cliente. Este endpoint es opcional y se podría usar
 * para sincronizar con el servidor o análisis.
 * 
 * Métodos soportados:
 * - GET: Obtener productos vistos (si los guardáramos en servidor)
 * - POST: Registrar un producto como visto
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/token.php';

// ============================================================================
// VERIFICAR AUTENTICACIÓN
// ============================================================================

$usuario = verificarAutenticacion();

// ============================================================================
// MANEJAR DIFERENTES MÉTODOS HTTP
// ============================================================================

$metodo = $_SERVER['REQUEST_METHOD'];

switch ($metodo) {
    case 'GET':
        manejarGET($usuario);
        break;
    
    case 'POST':
        manejarPOST($usuario);
        break;
    
    default:
        enviarRespuesta(false, null, 'Método no permitido.', 405);
}

// ============================================================================
// FUNCIÓN PARA MANEJAR GET
// ============================================================================

/**
 * Obtener productos vistos del usuario
 * 
 * En este proyecto simplificado, los productos vistos están en LocalStorage
 * Este endpoint podría devolver productos vistos guardados en servidor
 * (si implementáramos esa funcionalidad)
 */
function manejarGET($usuario) {
    /**
     * En una implementación completa:
     * 1. Leerías de una base de datos los productos vistos por este usuario
     * 2. Los devolverías ordenados por fecha (más recientes primero)
     * 
     * Para este ejercicio académico:
     * - Los productos vistos se gestionan en LocalStorage del cliente
     * - Este endpoint devuelve un mensaje informativo
     */
    
    enviarRespuesta(true, [
        'mensaje' => 'Los productos vistos se gestionan en LocalStorage del cliente.',
        'usuario_id' => $usuario['user_id']
    ], 'Endpoint informativo.', 200);
}

// ============================================================================
// FUNCIÓN PARA MANEJAR POST
// ============================================================================

/**
 * Registrar que el usuario vio un producto
 * 
 * El cliente enviará:
 * {
 *   "producto_id": 5,
 *   "timestamp": 1234567890
 * }
 */
function manejarPOST($usuario) {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    
    // Validar datos recibidos
    if (!isset($input['producto_id'])) {
        enviarRespuesta(false, null, 'Falta producto_id.', 400);
    }
    
    $productoId = $input['producto_id'];
    $timestamp = isset($input['timestamp']) ? $input['timestamp'] : time();
    
    // Verificar que el producto existe
    $tienda = leerJSON(TIENDA_JSON);
    
    if ($tienda === null || !isset($tienda['productos'])) {
        enviarRespuesta(false, null, 'Error al cargar productos.', 500);
    }
    
    $productoExiste = false;
    $productoInfo = null;
    
    foreach ($tienda['productos'] as $producto) {
        if ($producto['id'] == $productoId) {
            $productoExiste = true;
            $productoInfo = $producto;
            break;
        }
    }
    
    if (!$productoExiste) {
        enviarRespuesta(false, null, 'Producto no encontrado.', 404);
    }
    
    /**
     * En una implementación completa:
     * 1. Guardarías en base de datos: user_id, producto_id, timestamp
     * 2. Usarías esto para análisis, recomendaciones, etc.
     * 
     * Para este ejercicio:
     * - Solo confirmamos que el registro es válido
     * - El cliente lo manejará en LocalStorage
     */
    
    $registro = [
        'usuario_id' => $usuario['user_id'],
        'producto' => [
            'id' => $productoInfo['id'],
            'nombre' => $productoInfo['nombre'],
            'precio' => $productoInfo['precio']
        ],
        'timestamp' => $timestamp,
        'fecha' => date('Y-m-d H:i:s', $timestamp)
    ];
    
    enviarRespuesta(true, $registro, 'Producto registrado como visto.', 200);
}

/**
 * ============================================================================
 * NOTA SOBRE PRODUCTOS VISTOS:
 * ============================================================================
 * 
 * ¿Por qué usar LocalStorage para productos vistos?
 * - Es información no crítica (no afecta pagos o seguridad)
 * - Mejora la velocidad (no necesita peticiones al servidor)
 * - Es específica del dispositivo del usuario
 * 
 * ¿Cuándo usar el servidor?
 * - Si quieres sincronizar entre dispositivos del mismo usuario
 * - Si necesitas análisis de comportamiento
 * - Si quieres que persista aunque el usuario borre caché
 * 
 * En este proyecto: usamos LocalStorage (más simple y rápido)
 */
?>