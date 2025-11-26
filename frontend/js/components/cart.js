/**
 * ============================================================================
 * COMPONENTE: GESTIÓN DEL CARRITO
 * ============================================================================
 * 
 * Funciones para añadir, eliminar y gestionar productos en el carrito
 */

import { obtenerCarrito, guardarCarrito } from '../utils/localStorage.js';

/**
 * Añadir producto al carrito
 * 
 * @param {object} producto - Producto a añadir
 * @returns {object} Carrito actualizado
 */
export function añadirAlCarrito(producto) {
    let carrito = obtenerCarrito();
    
    // Verificar si el producto ya está en el carrito
    const index = carrito.findIndex(item => item.id === producto.id);
    
    if (index !== -1) {
        // Ya existe, incrementar cantidad
        carrito[index].cantidad += 1;
    } else {
        // No existe, añadir nuevo
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    
    // Guardar en LocalStorage
    guardarCarrito(carrito);
    
    return carrito;
}

/**
 * Obtener cantidad total de productos en el carrito
 * 
 * @returns {number} Total de productos
 */
export function obtenerCantidadCarrito() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/**
 * Actualizar el badge del carrito en la UI
 */
export function actualizarBadgeCarrito() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const cantidad = obtenerCantidadCarrito();
        
        if (cantidad > 0) {
            badge.textContent = cantidad;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

/**
 * Eliminar producto del carrito
 * 
 * @param {number} productoId - ID del producto a eliminar
 */
export function eliminarDelCarrito(productoId) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito(carrito);
    return carrito;
}

/**
 * Actualizar cantidad de un producto en el carrito
 * 
 * @param {number} productoId - ID del producto
 * @param {number} nuevaCantidad - Nueva cantidad
 */
export function actualizarCantidad(productoId, nuevaCantidad) {
    let carrito = obtenerCarrito();
    const index = carrito.findIndex(item => item.id === productoId);
    
    if (index !== -1) {
        if (nuevaCantidad <= 0) {
            // Si la cantidad es 0 o negativa, eliminar del carrito
            carrito.splice(index, 1);
        } else {
            carrito[index].cantidad = nuevaCantidad;
        }
    }
    
    guardarCarrito(carrito);
    return carrito;
}

/**
 * Vaciar el carrito completamente
 */
export function vaciarCarrito() {
    guardarCarrito([]);
}

/**
 * Obtener total del carrito
 * 
 * @returns {number} Total en euros
 */
export function obtenerTotalCarrito() {
    const carrito = obtenerCarrito();
    return carrito.reduce((total, item) => {
        return total + (item.precio * item.cantidad);
    }, 0);
}