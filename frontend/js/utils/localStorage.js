/**
 * ============================================================================
 * UTILIDAD PARA MANEJO DE LOCALSTORAGE
 * ============================================================================
 * 
 * Centraliza todas las operaciones con LocalStorage
 * 
 * ¿Por qué usar funciones en lugar de acceder directamente a localStorage?
 * - Manejo de errores centralizado
 * - Fácil añadir encriptación en el futuro
 * - Consistencia en toda la aplicación
 */

// Claves usadas en LocalStorage
const KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data',
    TIENDA: 'tienda_data',
    CARRITO: 'carrito',
    PRODUCTOS_VISTOS: 'productos_vistos'
};

/**
 * Guardar un valor en LocalStorage
 * 
 * @param {string} key - Clave
 * @param {any} value - Valor (se convertirá a JSON automáticamente)
 */
export function guardar(key, value) {
    try {
        const jsonValue = JSON.stringify(value);
        localStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

/**
 * Obtener un valor de LocalStorage
 * 
 * @param {string} key - Clave
 * @returns {any} Valor parseado o null si no existe
 */
export function obtener(key) {
    try {
        const jsonValue = localStorage.getItem(key);
        return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error al leer de localStorage:', error);
        return null;
    }
}

/**
 * Eliminar un valor de LocalStorage
 * 
 * @param {string} key - Clave
 */
export function eliminar(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error al eliminar de localStorage:', error);
    }
}

/**
 * Limpiar todo el LocalStorage
 */
export function limpiarTodo() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error al limpiar localStorage:', error);
    }
}

// ============================================================================
// FUNCIONES ESPECÍFICAS PARA NUESTRA APLICACIÓN
// ============================================================================

/**
 * Guardar token de autenticación
 */
export function guardarToken(token) {
    guardar(KEYS.TOKEN, token);
}

/**
 * Obtener token de autenticación
 */
export function obtenerToken() {
    return obtener(KEYS.TOKEN);
}

/**
 * Guardar datos del usuario
 */
export function guardarUsuario(usuario) {
    guardar(KEYS.USER, usuario);
}

/**
 * Obtener datos del usuario
 */
export function obtenerUsuario() {
    return obtener(KEYS.USER);
}

/**
 * Guardar catálogo completo de la tienda
 */
export function guardarTienda(tienda) {
    guardar(KEYS.TIENDA, tienda);
}

/**
 * Obtener catálogo de la tienda
 */
export function obtenerTienda() {
    return obtener(KEYS.TIENDA);
}

/**
 * Guardar carrito de compras
 */
export function guardarCarrito(carrito) {
    guardar(KEYS.CARRITO, carrito);
}

/**
 * Obtener carrito de compras
 */
export function obtenerCarrito() {
    return obtener(KEYS.CARRITO) || [];
}

/**
 * Guardar productos vistos recientemente
 */
export function guardarProductosVistos(productos) {
    guardar(KEYS.PRODUCTOS_VISTOS, productos);
}

/**
 * Obtener productos vistos recientemente
 */
export function obtenerProductosVistos() {
    return obtener(KEYS.PRODUCTOS_VISTOS) || [];
}

/**
 * Cerrar sesión - Eliminar todos los datos
 * 
 * Importante: Según el documento, al cerrar sesión debemos eliminar:
 * - Token
 * - Datos de usuario
 * - Catálogo de la tienda
 * - Carrito
 * - Productos vistos
 */
export function cerrarSesion() {
    eliminar(KEYS.TOKEN);
    eliminar(KEYS.USER);
    eliminar(KEYS.TIENDA);
    eliminar(KEYS.CARRITO);
    eliminar(KEYS.PRODUCTOS_VISTOS);
}
/**
 * Vaciar el carrito completamente
 */
export function vaciarCarrito() {
    guardar(KEYS.CARRITO, []);
}