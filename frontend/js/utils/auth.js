/**
 * ============================================================================
 * UTILIDAD DE AUTENTICACIÓN
 * ============================================================================
 * 
 * Funciones para verificar y proteger páginas que requieren login
 */

import { obtenerToken, obtenerUsuario, cerrarSesion } from './localStorage.js';

/**
 * Verificar si el usuario está autenticado
 * 
 * @returns {boolean} true si hay token, false si no
 */
export function estaAutenticado() {
    const token = obtenerToken();
    return token !== null && token !== undefined;
}

/**
 * Proteger una página - redirigir a login si no está autenticado
 * 
 * Esta función se debe llamar al inicio de cada página protegida
 * Ejemplo: dashboard.html, categories.html, product.html, cart.html
 */
export function protegerPagina() {
    if (!estaAutenticado()) {
        // No hay sesión, redirigir a login
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * Obtener información del usuario actual
 * 
 * @returns {object|null} Datos del usuario o null
 */
export function obtenerUsuarioActual() {
    return obtenerUsuario();
}

/**
 * Cerrar sesión y redirigir a login
 */
export function logout() {
    // Limpiar todo el LocalStorage
    cerrarSesion();
    
    // Redirigir a login
    window.location.href = 'login.html';
}

/**
 * Obtener token para peticiones al backend
 * 
 * @returns {string|null} Token de autenticación
 */
export function obtenerTokenActual() {
    return obtenerToken();
}