/**
 * ============================================================================
 * UTILIDAD PARA COMUNICACIÓN CON LA API REST
 * ============================================================================
 * 
 * Este módulo centraliza todas las peticiones HTTP al backend
 * Ventajas:
 * - Un solo lugar para configurar la URL base
 * - Manejo consistente de errores
 * - Fácil de mantener y actualizar
 */

// URL base del backend - AJUSTA ESTO SEGÚN TU CONFIGURACIÓN
const API_BASE_URL = 'http://localhost/TiendaOnline/backend/api';

/**
 * Realiza una petición HTTP al backend
 * 
 * @param {string} endpoint - Ruta del endpoint (ej: 'login.php')
 * @param {object} options - Opciones de la petición
 * @returns {Promise<object>} Respuesta del servidor
 */
async function fetchAPI(endpoint, options = {}) {
    // Configuración por defecto
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Combinar opciones por defecto con las proporcionadas
    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        // Hacer la petición
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
        
        // Parsear respuesta JSON
        const data = await response.json();
        
        // Si el servidor respondió con error HTTP, lanzar excepción
        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }
        
        return data;
        
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

/**
 * Login del usuario
 * 
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<object>} Datos del usuario y token
 */
export async function login(username, password) {
    return fetchAPI('login.php', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
}

/**
 * Validar carrito de compras
 * 
 * @param {Array} carrito - Array de productos con id, cantidad y precio
 * @param {string} token - Token de autenticación
 * @returns {Promise<object>} Confirmación del pedido
 */
export async function validarCarrito(carrito, token) {
    return fetchAPI('carrito.php', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ carrito })
    });
}

/**
 * Registrar producto como visto
 * 
 * @param {number} productoId - ID del producto
 * @param {string} token - Token de autenticación
 * @returns {Promise<object>} Confirmación
 */
export async function registrarProductoVisto(productoId, token) {
    return fetchAPI('productos_vistos.php', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            producto_id: productoId,
            timestamp: Math.floor(Date.now() / 1000)
        })
    });
}