/**
 * ============================================================================
 * PÁGINA: DETALLE DE PRODUCTO
 * ============================================================================
 *
 * Funcionalidades:
 * 1. Obtener ID del producto desde la URL
 * 2. Mostrar detalles completos del producto
 * 3. Selector de cantidad
 * 4. Añadir al carrito con cantidad seleccionada
 * 5. Registrar como producto visto
 * 6. Mostrar productos relacionados (misma categoría)
 */

import { protegerPagina, obtenerUsuarioActual, logout } from "../utils/auth.js";
import {
  obtenerTienda,
  obtenerProductosVistos,
  guardarProductosVistos,
} from "../utils/localStorage.js";
import { crearProductCard } from "../components/productCard.js";
import { añadirAlCarrito, actualizarBadgeCarrito } from "../components/cart.js";

// Proteger la página
if (!protegerPagina()) {
  throw new Error("No autenticado");
}

// Elementos del DOM
const userName = document.getElementById("userName");
const btnLogout = document.getElementById("btnLogout");
const breadcrumbCategory = document.getElementById("breadcrumbCategory");
const breadcrumbProduct = document.getElementById("breadcrumbProduct");
const productDetail = document.getElementById("productDetail");
const productosRelacionados = document.getElementById("productosRelacionados");

// Variables
let productoActual = null;
let cantidadSeleccionada = 1;

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  inicializarProducto();
});

function inicializarProducto() {
  // Mostrar nombre de usuario
  const usuario = obtenerUsuarioActual();
  if (usuario) {
    userName.textContent = usuario.nombre || usuario.username;
  }

  // Actualizar badge del carrito
  actualizarBadgeCarrito();

  // Configurar logout
  btnLogout.addEventListener("click", () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      logout();
    }
  });

  // Obtener ID del producto desde la URL
  const urlParams = new URLSearchParams(window.location.search);
  const productoId = parseInt(urlParams.get("id"));

  if (!productoId) {
    productDetail.innerHTML =
      '<p class="text-center">Producto no encontrado</p>';
    return;
  }

  // Cargar el producto
  cargarProducto(productoId);
}

// ============================================================================
// CARGAR PRODUCTO
// ============================================================================

function cargarProducto(productoId) {
  const tienda = obtenerTienda();

  if (!tienda || !tienda.productos) {
    productDetail.innerHTML =
      '<p class="text-center">Error al cargar el producto</p>';
    return;
  }

  // Buscar el producto
  const producto = tienda.productos.find((p) => p.id === productoId);

  if (!producto) {
    productDetail.innerHTML =
      '<p class="text-center">Producto no encontrado</p>';
    return;
  }

  productoActual = producto;

  // Actualizar breadcrumb
  const categoria = tienda.categorias.find(
    (c) => c.id === producto.id_categoria
  );
  if (categoria) {
    breadcrumbCategory.textContent = categoria.nombre;
  }
  breadcrumbProduct.textContent = producto.nombre;

  // Registrar como visto
  registrarProductoVisto(productoId);

  // Mostrar detalles
  mostrarDetalleProducto(producto);

  // Cargar productos relacionados
  cargarProductosRelacionados(producto.id_categoria, productoId);
}

// ============================================================================
// MOSTRAR DETALLE DEL PRODUCTO
// ============================================================================

function mostrarDetalleProducto(producto) {
  // Icono según categoría
  const iconos = {
    1: "../assets/images/categories/laptop.png",
    2: "../assets/images/categories/smartphone.png",
    3: "../assets/images/categories/tablet.png",
    4: "../assets/images/categories/accessories.png",
  };
  const icono =
    iconos[producto.id_categoria] || "../assets/images/categories/default.png";

  // Badge destacado
  const badgeDestacado = producto.destacado
    ? '<span class="product-detail-badge"> Destacado</span>'
    : "";

  // Estado del stock
  let stockHTML = "";
  let stockClass = "";
  let stockIcon = "";

  if (producto.stock > 10) {
    stockClass = "stock-available";
    stockIcon = "";
    stockHTML = `<span class="${stockClass}">En stock (${producto.stock} unidades)</span>`;
  } else if (producto.stock > 0) {
    stockClass = "stock-low";
    stockIcon = "";
    stockHTML = `<span class="${stockClass}">Stock limitado (${producto.stock} unidades)</span>`;
  } else {
    stockClass = "stock-out";
    stockIcon = "";
    stockHTML = `<span class="${stockClass}">Sin stock</span>`;
  }

  // Especificaciones
  let especificacionesHTML = "";
  if (producto.especificaciones) {
    const specs = Object.entries(producto.especificaciones)
      .map(
        ([key, value]) => `
                <div class="spec-item">
                    <span class="spec-label">${capitalizar(key)}</span>
                    <span class="spec-value">${value}</span>
                </div>
            `
      )
      .join("");

    especificacionesHTML = `
            <div class="product-specs">
                <h3>Especificaciones</h3>
                <div class="specs-list">
                    ${specs}
                </div>
            </div>
        `;
  }

  // HTML completo
  const html = `
        <div class="product-detail-image">
            <img src="${icono}" alt="${producto.nombre}" class="product-detail-icon">
        </div>
        <div class="product-detail-info">
            ${badgeDestacado}
            <h1 class="product-detail-title">${producto.nombre}</h1>
            <p class="product-detail-description">${producto.descripcion}</p>
            <div class="product-detail-price">€${producto.precio.toFixed(
              2
            )}</div>
            
            <div class="product-stock">
                <span class="stock-icon">${stockIcon}</span>
                <span class="stock-text">${stockHTML}</span>
            </div>
            
            ${especificacionesHTML}
            
            <div class="quantity-controls">
                <span class="quantity-label">Cantidad:</span>
                <div class="quantity-selector">
                    <button class="quantity-btn" id="btnDecrease" ${
                      cantidadSeleccionada <= 1 ? "disabled" : ""
                    }>-</button>
                    <span class="quantity-value" id="quantityValue">${cantidadSeleccionada}</span>
                    <button class="quantity-btn" id="btnIncrease" ${
                      cantidadSeleccionada >= producto.stock ? "disabled" : ""
                    }>+</button>
                </div>
            </div>
            
            <div class="product-actions">
                <button class="btn btn-primary btn-add-to-cart" id="btnAddToCart" ${
                  producto.stock === 0 ? "disabled" : ""
                }>
                    ${producto.stock === 0 ? "Sin Stock" : "Añadir al Carrito"}
                </button>
                <button class="btn btn-outline btn-back" onclick="history.back()">
                    Volver
                </button>
            </div>
        </div>
    `;

  productDetail.innerHTML = html;

  // Configurar eventos
  configurarEventosCantidad();
  configurarEventoCarrito();
}

// ============================================================================
// EVENTOS DE CANTIDAD
// ============================================================================

function configurarEventosCantidad() {
  const btnDecrease = document.getElementById("btnDecrease");
  const btnIncrease = document.getElementById("btnIncrease");
  const quantityValue = document.getElementById("quantityValue");

  btnDecrease.addEventListener("click", () => {
    if (cantidadSeleccionada > 1) {
      cantidadSeleccionada--;
      quantityValue.textContent = cantidadSeleccionada;

      btnDecrease.disabled = cantidadSeleccionada <= 1;
      btnIncrease.disabled = cantidadSeleccionada >= productoActual.stock;
    }
  });

  btnIncrease.addEventListener("click", () => {
    if (cantidadSeleccionada < productoActual.stock) {
      cantidadSeleccionada++;
      quantityValue.textContent = cantidadSeleccionada;

      btnDecrease.disabled = cantidadSeleccionada <= 1;
      btnIncrease.disabled = cantidadSeleccionada >= productoActual.stock;
    }
  });
}

// ============================================================================
// EVENTO AÑADIR AL CARRITO
// ============================================================================

function configurarEventoCarrito() {
  const btnAddToCart = document.getElementById("btnAddToCart");

  btnAddToCart.addEventListener("click", () => {
    if (productoActual.stock === 0) return;

    // Añadir al carrito la cantidad seleccionada
    for (let i = 0; i < cantidadSeleccionada; i++) {
      añadirAlCarrito(productoActual);
    }

    actualizarBadgeCarrito();
    mostrarNotificacion(
      ` ${cantidadSeleccionada} x ${productoActual.nombre} añadido al carrito`
    );

    // Feedback visual
    btnAddToCart.textContent = "✓ Añadido";
    btnAddToCart.style.backgroundColor = "var(--accent-color)";

    setTimeout(() => {
      btnAddToCart.textContent = "Añadir al Carrito";
      btnAddToCart.style.backgroundColor = "";
    }, 2000);
  });
}

// ============================================================================
// REGISTRAR PRODUCTO VISTO
// ============================================================================

function registrarProductoVisto(productoId) {
  let productosVistos = obtenerProductosVistos();

  // Eliminar si ya existe (para ponerlo al principio)
  productosVistos = productosVistos.filter((id) => id !== productoId);

  // Añadir al principio
  productosVistos.unshift(productoId);

  // Limitar a 10 productos vistos
  if (productosVistos.length > 10) {
    productosVistos = productosVistos.slice(0, 10);
  }

  guardarProductosVistos(productosVistos);
}

// ============================================================================
// PRODUCTOS RELACIONADOS
// ============================================================================

function cargarProductosRelacionados(categoriaId, productoActualId) {
  const tienda = obtenerTienda();

  if (!tienda || !tienda.productos) {
    return;
  }

  // Filtrar productos de la misma categoría, excluyendo el actual
  const relacionados = tienda.productos
    .filter((p) => p.id_categoria === categoriaId && p.id !== productoActualId)
    .slice(0, 4); // Máximo 4 productos

  if (relacionados.length === 0) {
    productosRelacionados.innerHTML =
      '<p class="text-center">No hay productos relacionados</p>';
    return;
  }

  const html = relacionados.map((p) => crearProductCard(p)).join("");
  productosRelacionados.innerHTML = html;

  // Configurar eventos (click en tarjeta y añadir al carrito)
  configurarEventosRelacionados(tienda.productos);
}

function configurarEventosRelacionados(todosLosProductos) {
  const productCards = document.querySelectorAll(
    "#productosRelacionados .product-card"
  );
  productCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-add-cart")) {
        return;
      }

      const productId = parseInt(card.dataset.productId);
      window.location.href = `product.html?id=${productId}`;
    });
  });

  const addToCartButtons = document.querySelectorAll(
    "#productosRelacionados .btn-add-cart"
  );
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();

      const productId = parseInt(button.dataset.productId);
      const producto = todosLosProductos.find((p) => p.id === productId);

      if (producto) {
        añadirAlCarrito(producto);
        actualizarBadgeCarrito();
        mostrarNotificacion(` ${producto.nombre} añadido al carrito`);
      }
    });
  });
}

// ============================================================================
// UTILIDADES
// ============================================================================

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}

function mostrarNotificacion(mensaje) {
  const notificacion = document.createElement("div");
  notificacion.className = "notificacion";
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
    notificacion.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}
