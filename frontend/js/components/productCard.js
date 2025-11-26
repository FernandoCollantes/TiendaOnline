/**
 * ============================================================================
 * COMPONENTE: TARJETA DE PRODUCTO
 * ============================================================================
 * 
 * Componente reutilizable para mostrar productos
 * Se usa en: dashboard, categories, product
 */

/**
 * Crear HTML de una tarjeta de producto
 * 
 * @param {object} producto - Objeto con datos del producto
 * @returns {string} HTML de la tarjeta
 */
export function crearProductCard(producto) {
    // Determinar si es producto destacado
    const badgeDestacado = producto.destacado 
        ? '<span class="product-badge">⭐ Destacado</span>' 
        : '';
    
    // Icono según categoría (simplificado)
    const iconos = {
        1: '💻', // Portátiles
        2: '📱', // Smartphones
        3: '📱', // Tablets
        4: '🎧'  // Accesorios
    };
    const icono = iconos[producto.id_categoria] || '📦';
    
    return `
        <div class="product-card" data-product-id="${producto.id}">
            <div class="product-image">
                ${icono}
            </div>
            <div class="product-body">
                ${badgeDestacado}
                <h3 class="product-title">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-footer">
                    <span class="product-price">€${producto.precio.toFixed(2)}</span>
                    <button class="btn-add-cart" data-product-id="${producto.id}">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Crear HTML de una tarjeta de categoría
 * 
 * @param {object} categoria - Objeto con datos de la categoría
 * @returns {string} HTML de la tarjeta
 */
export function crearCategoryCard(categoria) {
    // Iconos para cada categoría
    const iconos = {
        1: '💻',
        2: '📱',
        3: '📱',
        4: '🎧'
    };
    const icono = iconos[categoria.id] || '📦';
    
    return `
        <div class="category-card" data-category-id="${categoria.id}">
            <div class="category-icon">${icono}</div>
            <h3 class="category-name">${categoria.nombre}</h3>
            <p class="category-description">${categoria.descripcion}</p>
        </div>
    `;
}