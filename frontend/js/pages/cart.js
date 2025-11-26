/**
 * ============================================================================
 * PÁGINA: CARRITO DE COMPRAS
 * ============================================================================
 * 
 * Funcionalidades:
 * 1. Mostrar productos del carrito
 * 2. Modificar cantidades
 * 3. Eliminar productos
 * 4. Calcular totales (subtotal, IVA, total)
 * 5. Validar y procesar compra con el backend
 */

import { protegerPagina, obtenerUsuarioActual, logout, obtenerTokenActual } from '../utils/auth.js';
import { obtenerCarrito, guardarCarrito, obtenerTienda, vaciarCarrito } from '../utils/localStorage.js';
import { actualizarCantidad, eliminarDelCarrito, obtenerTotalCarrito, actualizarBadgeCarrito } from '../components/cart.js';
import { validarCarrito } from '../utils/api.js';

// Proteger la página
if (!protegerPagina()) {
    throw new Error('No autenticado');
}

// Elementos del DOM
const userName = document.getElementById('userName');
const btnLogout = document.getElementById('btnLogout');
const cartItems = document.getElementById('cartItems');
const subtotalElement = document.getElementById('subtotal');
const ivaElement = document.getElementById('iva');
const totalElement = document.getElementById('total');
const btnCheckout = document.getElementById('btnCheckout');
const btnContinueShopping = document.getElementById('btnContinueShopping');
const confirmModal = document.getElementById('confirmModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const orderNumber = document.getElementById('orderNumber');
const orderTotal = document.getElementById('orderTotal');

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrito();
});

function inicializarCarrito() {
    // Mostrar nombre de usuario
    const usuario = obtenerUsuarioActual();
    if (usuario) {
        userName.textContent = usuario.nombre || usuario.username;
    }
    
    // Actualizar badge del carrito
    actualizarBadgeCarrito();
    
    // Configurar logout
    btnLogout.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logout();
        }
    });
    
    // Configurar botón continuar comprando
    btnContinueShopping.addEventListener('click', () => {
        window.location.href = 'dashboard.html';
    });
    
    // Configurar botón checkout
    btnCheckout.addEventListener('click', procesarCompra);
    
    // Configurar botón cerrar modal
    btnCloseModal.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
        window.location.href = 'dashboard.html';
    });
    
    // Cargar productos del carrito
    cargarCarrito();
}

// ============================================================================
// CARGAR CARRITO
// ============================================================================

function cargarCarrito() {
    const carrito = obtenerCarrito();
    
    if (!carrito || carrito.length === 0) {
        mostrarCarritoVacio();
        return;
    }
    
    mostrarProductosCarrito(carrito);
    actualizarTotales();
}

function mostrarCarritoVacio() {
    cartItems.innerHTML = `
        <div class="cart-empty">
            <div class="cart-empty-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>¡Explora nuestros productos y añade algunos al carrito!</p>
            <a href="dashboard.html" class="btn btn-primary">
                Ir a la Tienda
            </a>
        </div>
    `;
    
    // Deshabilitar botón de checkout
    btnCheckout.disabled = true;
    
    // Resetear totales
    subtotalElement.textContent = '€0.00';
    ivaElement.textContent = '€0.00';
    totalElement.textContent = '€0.00';
}

function mostrarProductosCarrito(carrito) {
    // Obtener información completa de los productos desde la tienda
    const tienda = obtenerTienda();
    
    const itemsHTML = carrito.map(item => {
        // Buscar info completa del producto
        const producto = tienda.productos.find(p => p.id === item.id);
        
        if (!producto) return '';
        
        // Icono según categoría
        const iconos = {
            1: '💻',
            2: '📱',
            3: '📱',
            4: '🎧'
        };
        const icono = iconos[producto.id_categoria] || '📦';
        
        const subtotal = item.precio * item.cantidad;
        
        return `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    ${icono}
                </div>
                <div class="cart-item-info">
                    <h3 class="cart-item-name">${item.nombre}</h3>
                    <p class="cart-item-price">€${item.precio.toFixed(2)} / unidad</p>
                </div>
                <div class="cart-item-controls">
                    <div class="cart-item-quantity">
                        <button class="cart-qty-btn btn-decrease" data-product-id="${item.id}" ${item.cantidad <= 1 ? 'disabled' : ''}>
                            -
                        </button>
                        <span class="cart-qty-value">${item.cantidad}</span>
                        <button class="cart-qty-btn btn-increase" data-product-id="${item.id}" ${item.cantidad >= producto.stock ? 'disabled' : ''}>
                            +
                        </button>
                    </div>
                    <div class="cart-item-subtotal">€${subtotal.toFixed(2)}</div>
                    <button class="cart-item-remove" data-product-id="${item.id}">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    cartItems.innerHTML = itemsHTML;
    
    // Configurar eventos
    configurarEventosCarrito();
}

// ============================================================================
// EVENTOS DEL CARRITO
// ============================================================================

function configurarEventosCarrito() {
    // Botones de disminuir cantidad
    const decreaseButtons = document.querySelectorAll('.btn-decrease');
    decreaseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.productId);
            const carrito = obtenerCarrito();
            const item = carrito.find(i => i.id === productId);
            
            if (item && item.cantidad > 1) {
                actualizarCantidad(productId, item.cantidad - 1);
                cargarCarrito();
                actualizarBadgeCarrito();
            }
        });
    });
    
    // Botones de aumentar cantidad
    const increaseButtons = document.querySelectorAll('.btn-increase');
    increaseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.productId);
            const carrito = obtenerCarrito();
            const item = carrito.find(i => i.id === productId);
            const tienda = obtenerTienda();
            const producto = tienda.productos.find(p => p.id === productId);
            
            if (item && producto && item.cantidad < producto.stock) {
                actualizarCantidad(productId, item.cantidad + 1);
                cargarCarrito();
                actualizarBadgeCarrito();
            }
        });
    });
    
    // Botones de eliminar
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.productId);
            
            if (confirm('¿Estás seguro de eliminar este producto del carrito?')) {
                eliminarDelCarrito(productId);
                cargarCarrito();
                actualizarBadgeCarrito();
                mostrarNotificacion('Producto eliminado del carrito');
            }
        });
    });
}

// ============================================================================
// CALCULAR TOTALES
// ============================================================================

function actualizarTotales() {
    const subtotal = obtenerTotalCarrito();
    const iva = subtotal * 0.21; // 21% IVA
    const total = subtotal + iva;
    
    subtotalElement.textContent = `€${subtotal.toFixed(2)}`;
    ivaElement.textContent = `€${iva.toFixed(2)}`;
    totalElement.textContent = `€${total.toFixed(2)}`;
}

// ============================================================================
// PROCESAR COMPRA
// ============================================================================

async function procesarCompra() {
    const carrito = obtenerCarrito();
    
    if (!carrito || carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'error');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    btnCheckout.disabled = true;
    btnCheckout.textContent = 'Procesando...';
    
    try {
        // Obtener token
        const token = obtenerTokenActual();
        
        // Enviar al backend para validar precios
        const respuesta = await validarCarrito(carrito, token);
        
        if (respuesta.success) {
            // Compra exitosa
            const pedido = respuesta.data;
            
            // Vaciar el carrito
            vaciarCarrito();
            actualizarBadgeCarrito();
            
            // Mostrar modal de confirmación
            orderNumber.textContent = pedido.numero_pedido;
            orderTotal.textContent = `€${pedido.total.toFixed(2)}`;
            confirmModal.classList.remove('hidden');
            
        } else {
            // Error en la validación
            mostrarNotificacion(respuesta.message || 'Error al procesar la compra', 'error');
            btnCheckout.disabled = false;
            btnCheckout.textContent = 'Finalizar Compra';
        }
        
    } catch (error) {
        console.error('Error al procesar compra:', error);
        mostrarNotificacion('Error al conectar con el servidor', 'error');
        btnCheckout.disabled = false;
        btnCheckout.textContent = 'Finalizar Compra';
    }
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

function mostrarNotificacion(mensaje, tipo = 'success') {
    const color = tipo === 'success' ? 'var(--accent-color)' : 'var(--danger-color)';
    
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: ${color};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}