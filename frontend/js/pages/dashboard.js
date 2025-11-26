
/**
 * ============================================================================
 * PÁGINA: DASHBOARD
 * ============================================================================
 * 
 * Funcionalidades:
 * 1. Verificar autenticación
 * 2. Mostrar productos destacados
 * 3. Mostrar categorías
 * 4. Gestionar carrito
 * 5. Mostrar productos vistos recientemente
 */

import { protegerPagina, obtenerUsuarioActual, logout } from '../utils/auth.js';
import { obtenerTienda, obtenerProductosVistos } from '../utils/localStorage.js';
import { crearProductCard, crearCategoryCard } from '../components/productCard.js';
import { añadirAlCarrito, actualizarBadgeCarrito } from '../components/cart.js';

// ============================================================================
// PROTEGER LA PÁGINA
// ============================================================================

// Si no está autenticado, redirige a login
if (!protegerPagina()) {
    // protegerPagina() ya redirige, esto es por seguridad
    throw new Error('No autenticado');
}

// ============================================================================
// ELEMENTOS DEL DOM
// ============================================================================

const userName = document.getElementById('userName');
const welcomeName = document.getElementById('welcomeName');
const btnLogout = document.getElementById('btnLogout');
const productosDestacadosGrid = document.getElementById('productosDestacados');
const categoriasGrid = document.getElementById('categoriasGrid');
const productosVistosGrid = document.getElementById('productosVistos');
const seccionProductosVistos = document.getElementById('seccionProductosVistos');

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    inicializarDashboard();
});

/**
 * Función principal de inicialización
 */
function inicializarDashboard() {
    // 1. Mostrar información del usuario
    mostrarDatosUsuario();
    
    // 2. Cargar productos destacados
    cargarProductosDestacados();
    
    // 3. Cargar categorías
    cargarCategorias();
    
    // 4. Cargar productos vistos recientemente
    cargarProductosVistos();
    
    // 5. Actualizar badge del carrito
    actualizarBadgeCarrito();
    
    // 6. Configurar evento de logout
    btnLogout.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            logout();
        }
    });
}

// ============================================================================
// MOSTRAR DATOS DEL USUARIO
// ============================================================================

function mostrarDatosUsuario() {
    const usuario = obtenerUsuarioActual();
    
    if (usuario) {
        userName.textContent = usuario.nombre || usuario.username;
        welcomeName.textContent = usuario.nombre || usuario.username;
    }
}

// ============================================================================
// CARGAR PRODUCTOS DESTACADOS
// ============================================================================

/**
 * Cargar y mostrar productos destacados desde LocalStorage
 */
function cargarProductosDestacados() {
    console.log('🔍 Iniciando cargarProductosDestacados');
    
    const tienda = obtenerTienda();
    console.log('🔍 Tienda obtenida:', tienda);
    
    if (!tienda || !tienda.productos) {
        console.log('❌ No hay tienda o productos');
        productosDestacadosGrid.innerHTML = '<p class="text-center">No hay productos disponibles</p>';
        return;
    }
    
    const productosDestacados = tienda.productos.filter(p => p.destacado === true);
    console.log('🔍 Productos destacados encontrados:', productosDestacados.length);
    
    if (productosDestacados.length === 0) {
        productosDestacadosGrid.innerHTML = '<p class="text-center">No hay productos destacados</p>';
        return;
    }
    
    const productosHTML = productosDestacados
        .map(producto => crearProductCard(producto))
        .join('');
    
    console.log('🔍 HTML generado, longitud:', productosHTML.length);
    console.log('🔍 Primeros 200 caracteres:', productosHTML.substring(0, 200));
    
    productosDestacadosGrid.innerHTML = productosHTML;
    
    console.log('✅ innerHTML asignado');
    console.log('🔍 Contenido actual del grid:', productosDestacadosGrid.innerHTML.substring(0, 200));
    
    configurarEventosProductos(tienda.productos);
}
// ============================================================================
// CARGAR CATEGORÍAS
// ============================================================================

/**
 * Cargar y mostrar categorías desde LocalStorage
 */
function cargarCategorias() {
    const tienda = obtenerTienda();
    
    if (!tienda || !tienda.categorias) {
        categoriasGrid.innerHTML = '<p class="text-center">No hay categorías disponibles</p>';
        return;
    }
    
    // Generar HTML de las tarjetas de categorías
    const categoriasHTML = tienda.categorias
        .map(categoria => crearCategoryCard(categoria))
        .join('');
    
    categoriasGrid.innerHTML = categoriasHTML;
    
    // Añadir event listeners a las categorías
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const categoryId = card.dataset.categoryId;
            // Redirigir a página de categorías con el ID
            window.location.href = `categories.html?categoria=${categoryId}`;
        });
    });
}

// ============================================================================
// CARGAR PRODUCTOS VISTOS RECIENTEMENTE
// ============================================================================

/**
 * Cargar productos vistos desde LocalStorage
 */
function cargarProductosVistos() {
    const productosVistos = obtenerProductosVistos();
    
    if (!productosVistos || productosVistos.length === 0) {
        // No hay productos vistos, ocultar la sección
        seccionProductosVistos.classList.add('hidden');
        return;
    }
    
    // Mostrar la sección
    seccionProductosVistos.classList.remove('hidden');
    
    // Obtener información completa de los productos desde la tienda
    const tienda = obtenerTienda();
    const productosCompletos = productosVistos
        .map(id => tienda.productos.find(p => p.id === id))
        .filter(p => p !== undefined) // Filtrar productos que ya no existen
        .slice(0, 4); // Mostrar máximo 4
    
    if (productosCompletos.length === 0) {
        seccionProductosVistos.classList.add('hidden');
        return;
    }
    
    // Generar HTML
    const productosHTML = productosCompletos
        .map(producto => crearProductCard(producto))
        .join('');
    
    productosVistosGrid.innerHTML = productosHTML;
    
    // Añadir event listeners
    configurarEventosProductos(tienda.productos);
}

// ============================================================================
// CONFIGURAR EVENTOS DE PRODUCTOS
// ============================================================================

/**
 * Configurar eventos para las tarjetas de productos
 * - Click en la tarjeta: ver detalles
 * - Click en "Añadir al carrito": añadir producto
 * 
 * @param {Array} todosLosProductos - Array completo de productos para buscar
 */
function configurarEventosProductos(todosLosProductos) {
    // Evento: Click en tarjeta → Ver detalles del producto
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Si el click fue en el botón de añadir al carrito, no hacer nada
            if (e.target.classList.contains('btn-add-cart')) {
                return;
            }
            
            const productId = parseInt(card.dataset.productId);
            // Redirigir a página de detalles del producto
            window.location.href = `product.html?id=${productId}`;
        });
    });
    
    // Evento: Click en botón "Añadir al carrito"
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se active el evento del card
            
            const productId = parseInt(button.dataset.productId);
            const producto = todosLosProductos.find(p => p.id === productId);
            
            if (producto) {
                // Añadir al carrito
                añadirAlCarrito(producto);
                
                // Actualizar badge
                actualizarBadgeCarrito();
                
                // Feedback visual
                mostrarNotificacion(`✅ ${producto.nombre} añadido al carrito`);
                
                // Animación del botón
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

/**
 * Mostrar notificación temporal
 * 
 * @param {string} mensaje - Mensaje a mostrar
 */
function mostrarNotificacion(mensaje) {
    // Crear elemento de notificación
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
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Añadir animaciones CSS para las notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * ============================================================================
 * RESUMEN DEL FLUJO:
 * ============================================================================
 * 
 * 1. Verificar autenticación (protegerPagina)
 * 2. Mostrar nombre del usuario
 * 3. Cargar productos destacados desde LocalStorage
 * 4. Cargar categorías desde LocalStorage
 * 5. Cargar productos vistos (si existen)
 * 6. Click en producto → Redirige a product.html?id=X
 * 7. Click en categoría → Redirige a categories.html?categoria=X
 * 8. Click en "Añadir al carrito" → Guarda en LocalStorage + actualiza badge
 * 9. Click en "Cerrar sesión" → Limpia LocalStorage + redirige a login
 */