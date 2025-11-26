/**
 * ============================================================================
 * PÁGINA: CATEGORÍAS
 * ============================================================================
 * 
 * Funcionalidades:
 * 1. Mostrar todas las categorías
 * 2. Filtrar productos por categoría
 * 3. Detectar categoría desde URL (si viene desde el dashboard)
 * 4. Añadir productos al carrito
 */

import { protegerPagina, logout } from '../utils/auth.js';
import { obtenerTienda } from '../utils/localStorage.js';
import { crearProductCard } from '../components/productCard.js';
import { añadirAlCarrito, actualizarBadgeCarrito } from '../components/cart.js';

// Proteger la página
if (!protegerPagina()) {
    throw new Error('No autenticado');
}

// Elementos del DOM
const categoryTitle = document.getElementById('categoryTitle');
const categoryDescription = document.getElementById('categoryDescription');
const categoryButtons = document.getElementById('categoryButtons');
const productosGrid = document.getElementById('productosGrid');
const btnLogout = document.getElementById('btnLogout');

// Variable para almacenar la categoría seleccionada
let categoriaActual = 'todas';

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarCategorias();
});

function inicializarCategorias() {
    // Actualizar badge del carrito
    actualizarBadgeCarrito();
    
    // Configurar logout
    btnLogout.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logout();
        }
    });
    
    // Obtener categoría desde la URL si existe
    const urlParams = new URLSearchParams(window.location.search);
    const categoriaId = urlParams.get('categoria');
    
    if (categoriaId) {
        categoriaActual = parseInt(categoriaId);
    }
    
    // Cargar categorías y productos
    cargarBotonesCategorias();
    cargarProductos();
}

// ============================================================================
// CARGAR BOTONES DE CATEGORÍAS
// ============================================================================

function cargarBotonesCategorias() {
    const tienda = obtenerTienda();
    
    if (!tienda || !tienda.categorias) {
        return;
    }
    
    // Crear botón para cada categoría
    const botonesHTML = tienda.categorias.map(cat => `
        <button class="filter-btn" data-category="${cat.id}">
            ${cat.nombre}
        </button>
    `).join('');
    
    categoryButtons.innerHTML = botonesHTML;
    
    // Añadir event listeners
    const allFilterButtons = document.querySelectorAll('.filter-btn');
    allFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            // Actualizar botón activo
            allFilterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Actualizar categoría actual
            if (category === 'todas') {
                categoriaActual = 'todas';
                categoryTitle.textContent = 'Todas las Categorías';
                categoryDescription.textContent = 'Explora nuestros productos';
            } else {
                categoriaActual = parseInt(category);
                const cat = tienda.categorias.find(c => c.id === categoriaActual);
                if (cat) {
                    categoryTitle.textContent = cat.nombre;
                    categoryDescription.textContent = cat.descripcion;
                }
            }
            
            // Recargar productos con el filtro
            cargarProductos();
        });
    });
    
    // Si hay una categoría preseleccionada, activar su botón
    if (categoriaActual !== 'todas') {
        const btnToActivate = document.querySelector(`[data-category="${categoriaActual}"]`);
        if (btnToActivate) {
            document.querySelector('[data-category="todas"]').classList.remove('active');
            btnToActivate.classList.add('active');
            
            const tienda = obtenerTienda();
            const cat = tienda.categorias.find(c => c.id === categoriaActual);
            if (cat) {
                categoryTitle.textContent = cat.nombre;
                categoryDescription.textContent = cat.descripcion;
            }
        }
    }
}

// ============================================================================
// CARGAR PRODUCTOS (CON FILTRO)
// ============================================================================

function cargarProductos() {
    const tienda = obtenerTienda();
    
    if (!tienda || !tienda.productos) {
        productosGrid.innerHTML = '<p class="text-center">No hay productos disponibles</p>';
        return;
    }
    
    // Filtrar productos según categoría
    let productosFiltrados;
    
    if (categoriaActual === 'todas') {
        productosFiltrados = tienda.productos;
    } else {
        productosFiltrados = tienda.productos.filter(
            p => p.id_categoria === categoriaActual
        );
    }
    
    // Verificar si hay productos
    if (productosFiltrados.length === 0) {
        productosGrid.innerHTML = '<p class="text-center">No hay productos en esta categoría</p>';
        return;
    }
    
    // Generar HTML
    const productosHTML = productosFiltrados
        .map(producto => crearProductCard(producto))
        .join('');
    
    productosGrid.innerHTML = productosHTML;
    
    // Configurar eventos
    configurarEventosProductos(tienda.productos);
}

// ============================================================================
// CONFIGURAR EVENTOS DE PRODUCTOS
// ============================================================================

function configurarEventosProductos(todosLosProductos) {
    // Click en tarjeta → Ver detalles
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-cart')) {
                return;
            }
            
            const productId = parseInt(card.dataset.productId);
            window.location.href = `product.html?id=${productId}`;
        });
    });
    
    // Click en botón → Añadir al carrito
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const productId = parseInt(button.dataset.productId);
            const producto = todosLosProductos.find(p => p.id === productId);
            
            if (producto) {
                añadirAlCarrito(producto);
                actualizarBadgeCarrito();
                mostrarNotificacion(`✅ ${producto.nombre} añadido al carrito`);
                
                button.textContent = '✓ Añadido';
                button.style.backgroundColor = 'var(--accent-color)';
                
                setTimeout(() => {
                    button.textContent = 'Añadir al Carrito';
                    button.style.backgroundColor = '';
                }, 2000);
            }
        });
    });
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion';
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background-color: var(--accent-color);
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