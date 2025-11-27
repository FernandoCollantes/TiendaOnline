<?php
/**
 * ============================================================================
 * ENDPOINT DE CARRITO - VALIDACIÓN DE PRECIOS
 * ============================================================================
 * 
 * Aclaracion de para que sirve este endpoint:
 * - El cliente puede manipular LocalStorage y cambiar precios
 * - Antes de confirmar la compra, el servidor debe validar los precios reales
 * - Es la última línea de defensa contra fraudes
 * 
 * Flujo:
 * 1. Cliente envía el carrito con productos y cantidades
 * 2. Servidor verifica que los precios coincidan con tienda.json
 * 3. Si todo está bien: confirma la compra
 * 4. Si hay manipulación: rechaza y notifica
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/token.php';

// ============================================================================
// VERIFICAR AUTENTICACIÓN
// ============================================================================

/**
 * Middleware de autenticación
 * Si el token no es válido, aquí termina todo con error 401
 */
$usuario = verificarAutenticacion();

// ============================================================================
// SOLO PERMITIR POST
// ============================================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    enviarRespuesta(false, null, 'Método no permitido. Usa POST.', 405);
}

// ============================================================================
// OBTENER DATOS DEL CARRITO
// ============================================================================

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

/**
 * Estructura esperada del carrito desde el cliente:
 * {
 *   "carrito": [
 *     { "id": 1, "cantidad": 2, "precio": 2299.99 },
 *     { "id": 4, "cantidad": 1, "precio": 1199.99 }
 *   ]
 * }
 */

if (!isset($input['carrito']) || !is_array($input['carrito'])) {
    enviarRespuesta(false, null, 'Formato de carrito inválido.', 400);
}

$carritoCliente = $input['carrito'];

// Validar que el carrito no esté vacío
if (empty($carritoCliente)) {
    enviarRespuesta(false, null, 'El carrito está vacío.', 400);
}

// ============================================================================
// LEER PRODUCTOS REALES DEL SERVIDOR
// ============================================================================

$tienda = leerJSON(TIENDA_JSON);

if ($tienda === null || !isset($tienda['productos'])) {
    enviarRespuesta(false, null, 'Error al cargar productos del servidor.', 500);
}

$productosReales = $tienda['productos'];

// Convertir array de productos a formato id => producto para búsqueda rápida
$productosMap = [];
foreach ($productosReales as $producto) {
    $productosMap[$producto['id']] = $producto;
}

// ============================================================================
// VALIDAR CADA PRODUCTO DEL CARRITO
// ============================================================================

$totalReal = 0;
$totalCliente = 0;
$productosValidados = [];
$errores = [];

foreach ($carritoCliente as $item) {
    // Validar estructura del item
    if (!isset($item['id']) || !isset($item['cantidad']) || !isset($item['precio'])) {
        $errores[] = "Item con estructura inválida";
        continue;
    }
    
    $idProducto = $item['id'];
    $cantidadCliente = $item['cantidad'];
    $precioCliente = $item['precio'];
    
    // Verificar que el producto existe en el servidor
    if (!isset($productosMap[$idProducto])) {
        $errores[] = "Producto ID $idProducto no existe";
        continue;
    }
    
    $productoReal = $productosMap[$idProducto];
    $precioReal = $productoReal['precio'];
    
    /**
     * VALIDACIÓN CRÍTICA: Comparar precios
     * 
     * ¿Por qué usar number_format?
     * - Los números float pueden tener pequeñas diferencias por redondeo
     * - Ejemplo: 19.99 podría ser 19.990000001
     * - number_format redondea a 2 decimales para comparar correctamente
     */
    if (number_format($precioCliente, 2) !== number_format($precioReal, 2)) {
        $errores[] = "Precio manipulado en producto '{$productoReal['nombre']}'. " .
                     "Precio real: €{$precioReal}, precio enviado: €{$precioCliente}";
        continue;
    }
    
    // Validar cantidad (debe ser positiva)
    if ($cantidadCliente <= 0) {
        $errores[] = "Cantidad inválida para producto '{$productoReal['nombre']}'";
        continue;
    }
    
    // Validar stock disponible
    if ($cantidadCliente > $productoReal['stock']) {
        $errores[] = "Stock insuficiente para '{$productoReal['nombre']}'. " .
                     "Disponible: {$productoReal['stock']}, solicitado: {$cantidadCliente}";
        continue;
    }
    
    // Calcular subtotales
    $subtotalReal = $precioReal * $cantidadCliente;
    $subtotalCliente = $precioCliente * $cantidadCliente;
    
    $totalReal += $subtotalReal;
    $totalCliente += $subtotalCliente;
    
    // Guardar producto validado
    $productosValidados[] = [
        'id' => $idProducto,
        'nombre' => $productoReal['nombre'],
        'cantidad' => $cantidadCliente,
        'precio_unitario' => $precioReal,
        'subtotal' => $subtotalReal
    ];
}

// ============================================================================
// VERIFICAR SI HUBO ERRORES
// ============================================================================

if (!empty($errores)) {
    enviarRespuesta(false, [
        'errores' => $errores
    ], 'Se encontraron problemas con el carrito.', 400);
}

// ============================================================================
// TODO ESTÁ BIEN - CONFIRMAR PEDIDO
// ============================================================================

/**
 * En una aplicación real, aquí:
 * 1. Guardarías el pedido en base de datos
 * 2. Actualizarías el stock de productos
 * 3. Generarías un número de pedido
 * 4. Enviarías email de confirmación
 * 
 * Para este ejercicio, solo validamos y confirmamos
 */

$pedido = [
    'numero_pedido' => 'PED-' . time() . '-' . $usuario['user_id'], // ID único del pedido
    'usuario_id' => $usuario['user_id'],
    'usuario_nombre' => $usuario['username'],
    'fecha' => date('Y-m-d H:i:s'),
    'productos' => $productosValidados,
    'total' => round($totalReal, 2),
    'estado' => 'confirmado'
];

enviarRespuesta(true, $pedido, '¡Pedido confirmado exitosamente!', 200);

/**
 * ============================================================================
 * RESUMEN DE SEGURIDAD:
 * ============================================================================
 * 
 * ¿Por qué es importante este endpoint?
 * - El cliente NUNCA es confiable (cualquiera puede manipular JavaScript)
 * - Un usuario malicioso podría cambiar precios en LocalStorage
 * - Este endpoint es la ÚNICA fuente de verdad para los precios
 * 
 * Capas de seguridad:
 * 1. Verificación de token (usuario autenticado)
 * 2. Validación de existencia de productos
 * 3. Validación de precios contra tienda.json (servidor)
 * 4. Validación de stock disponible
 * 5. Validación de cantidades positivas
 * 
 * Nunca confíes en datos del cliente, siempre valida en el servidor ✅
 */
?>