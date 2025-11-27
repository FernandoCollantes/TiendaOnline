![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?logo=php)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)

***RECOMENDACIÓN: ABRIR COMPLETAMENTE; NO EN PREVIEW!***
🛒 TiendaOnline - E-commerce con API REST y LocalStorage
Aplicación web completa de comercio electrónico con autenticación basada en tokens, gestión de carrito y almacenamiento local inteligente.

📋 Descripción
TiendaOnline es una aplicación web moderna que implementa un sistema completo de e-commerce utilizando arquitectura cliente-servidor. El proyecto destaca por su gestión eficiente de datos mediante LocalStorage, reduciendo la carga en el servidor y mejorando la experiencia del usuario.

✨ Características Principales
🔐 Autenticación segura con tokens JWT
💾 Gestión inteligente de LocalStorage - Catálogo completo cargado tras login
🛍️ Carrito de compras con validación de precios en servidor
📱 Diseño responsive adaptado a móvil, tablet y escritorio
🎨 Interfaz moderna con animaciones y transiciones suaves
👁️ Productos vistos recientemente para mejorar la UX
⚡ Navegación instantánea sin consultas constantes al servidor
🔒 Validación de precios para prevenir manipulaciones del cliente
🏗️ Arquitectura del Proyecto
Flujo de Funcionamiento
1. Usuario hace LOGIN
   ↓
2. Servidor valida credenciales
   ↓
3. Servidor devuelve: TOKEN + CATÁLOGO COMPLETO
   ↓
4. Cliente almacena TODO en LocalStorage
   ↓
5. Navegación usa SOLO LocalStorage (sin peticiones al servidor)
   ↓
6. Al finalizar compra → Servidor valida precios con token
Ventajas de este Enfoque
✅ Menor carga en servidor - Una sola petición tras login
✅ Navegación instantánea - Sin latencia de red
✅ Experiencia fluida - No hay tiempos de espera
✅ Seguridad mantenida - Validación de precios en servidor

🚀 Tecnologías Utilizadas
Frontend
HTML5 - Estructura semántica
CSS3 / SCSS - Estilos modulares con preprocesador
JavaScript ES6+ - Vanilla JS con módulos
LocalStorage API - Persistencia de datos en cliente
Fetch API - Comunicación con backend
Backend
PHP 8.x - API REST
JSON - Base de datos simulada
JWT Tokens - Autenticación
Herramientas
XAMPP - Servidor local Apache + PHP
Git - Control de versiones
SCSS - Preprocesador CSS
📁 Estructura del Proyecto
tienda-online/
│
├── 📄 index.html                    # Página de entrada (redirige a login)
├── 📄 README.md                     # Documentación del proyecto
├── 📄 PRUEBAS_API.md               # Guía de testing de endpoints
│
├── 📂 backend/                      # Servidor PHP
│   ├── 📂 api/                     # Endpoints de la API REST
│   │   ├── login.php               # POST - Autenticación de usuarios
│   │   ├── carrito.php             # POST - Validación y procesamiento del carrito
│   │   ├── productos_vistos.php    # GET/POST - Productos vistos recientemente
│   │   ├── config.php              # Configuración de CORS y headers
│   │   └── token.php               # Utilidades para manejo de tokens
│   │
│   ├── 📂 data/                    # Base de datos JSON
│   │   ├── usuarios.json           # Usuarios del sistema
│   │   └── tienda.json             # Catálogo (categorías + productos)
│   │
│   └── 📂 utils/                   # Utilidades compartidas
│       └── token.php               # Generación y validación de tokens
│
└── 📂 frontend/                     # Cliente web
    │
    ├── 📂 pages/                   # Páginas HTML
    │   ├── login.html              # Formulario de autenticación
    │   ├── dashboard.html          # Panel principal con productos destacados
    │   ├── categories.html         # Listado de categorías
    │   ├── product.html            # Ficha detallada de producto
    │   └── cart.html               # Carrito de compras
    │
    ├── 📂 js/                      # JavaScript modular
    │   ├── 📂 pages/               # Lógica específica de cada página
    │   │   ├── login.js            # Manejo del formulario de login
    │   │   ├── dashboard.js        # Carga de productos destacados
    │   │   ├── categories.js       # Renderizado de categorías
    │   │   ├── product.js          # Ficha de producto y añadir al carrito
    │   │   └── cart.js             # Gestión del carrito y checkout
    │   │
    │   ├── 📂 components/          # Componentes reutilizables
    │   │   ├── navbar.js           # Barra de navegación dinámica
    │   │   ├── productCard.js      # Tarjeta de producto
    │   │   └── cart.js             # Utilidades del carrito
    │   │
    │   └── 📂 utils/               # Utilidades y helpers
    │       ├── api.js              # Comunicación con backend (fetch)
    │       ├── auth.js             # Verificación de autenticación
    │       └── localStorage.js     # Gestión centralizada de LocalStorage
    │
    ├── 📂 css/                     # Estilos compilados
    │   └── main.css                # CSS final (generado desde SCSS)
    │
    ├── 📂 scss/                    # Estilos modulares
    │   ├── main.scss               # Archivo principal
    │   ├── 📂 abstracts/           # Variables, mixins, funciones
    │   ├── 📂 base/                # Reset, tipografía, utilidades
    │   ├── 📂 components/          # Estilos de componentes (botones, cards, navbar...)
    │   ├── 📂 layout/              # Grid, contenedores
    │   └── 📂 pages/               # Estilos específicos de páginas
    │
    └── 📂 assets/                  # Recursos estáticos
        └── 📂 images/
            ├── 📂 categories/      # Imágenes de categorías
            └── 📂 products/        # Imágenes de productos
🔧 Instalación y Configuración
Requisitos Previos
XAMPP (o cualquier servidor Apache + PHP)
Navegador web moderno (Chrome, Firefox, Edge, Safari)
Editor de código (opcional, para modificaciones)
Paso 1: Clonar el Repositorio
bash
git clone https://github.com/tu-usuario/tienda-online.git
Paso 2: Configurar XAMPP
Copia la carpeta tienda-online en C:\xampp\htdocs\ (Windows) o /opt/lampp/htdocs/ (Linux)
Inicia Apache desde el panel de control de XAMPP
Verifica que PHP esté activo
Paso 3: Acceder a la Aplicación
Abre tu navegador y ve a:

http://localhost/tienda-online/
O directamente al login:

http://localhost/tienda-online/frontend/pages/login.html
👤 Usuarios de Prueba
Usuario	Contraseña	Perfil
admin	admin123	Administrador
fernando	fernando123	Usuario Normal
usuario	usuario123	Usuario Test
🔌 API REST - Endpoints
Base URL
http://localhost/tienda-online/backend/api/
1. Login - Autenticación
Endpoint: POST /login.php

Request Body:

json
{
  "username": "admin",
  "password": "admin123"
}
Response (200 OK):

json
{
  "success": true,
  "data": {
    "token": "eyJ1c2VyX2lk...",
    "expiracion": 1234567890,
    "usuario": {
      "id": 1,
      "username": "admin",
      "email": "admin@tienda.com",
      "nombre": "Administrador"
    },
    "tienda": {
      "categorias": [...],
      "productos": [...]
    }
  },
  "message": "Login exitoso. Bienvenido Administrador"
}
2. Carrito - Procesamiento de Pedido
Endpoint: POST /carrito.php

Headers:

Content-Type: application/json
Authorization: Bearer {token}
Request Body:

json
{
  "carrito": [
    {
      "id": 1,
      "cantidad": 2,
      "precio": 2299.99
    },
    {
      "id": 4,
      "cantidad": 1,
      "precio": 1199.99
    }
  ]
}
Response (200 OK):

json
{
  "success": true,
  "data": {
    "numero_pedido": "PED-1234567890-1",
    "usuario_id": 1,
    "fecha": "2024-11-25 10:30:00",
    "total": 5799.97,
    "estado": "confirmado"
  },
  "message": "¡Pedido confirmado exitosamente!"
}
3. Productos Vistos Recientemente
Endpoint: POST /productos_vistos.php

Headers:

Content-Type: application/json
Authorization: Bearer {token}
Request Body:

json
{
  "producto_id": 5,
  "timestamp": 1700000000
}
🛡️ Seguridad Implementada
Validación de Tokens
Todos los endpoints protegidos requieren Authorization: Bearer {token}
Los tokens se validan en cada petición
Sin token válido → Error 401 Unauthorized
Prevención de Manipulación de Precios
php
// El servidor SIEMPRE verifica que los precios del carrito
// coincidan con los precios reales de la base de datos
if ($precio_enviado !== $precio_real) {
    return error("Precio manipulado detectado");
}
Protección de Páginas
javascript
// Cada página protegida verifica autenticación
import { protegerPagina } from './utils/auth.js';
protegerPagina(); // Redirige a login si no hay token
💾 Gestión de LocalStorage
Datos Almacenados
Clave	Contenido	Cuándo se Crea
auth_token	Token JWT de autenticación	Tras login exitoso
user_data	Información del usuario	Tras login exitoso
tienda_data	Catálogo completo (categorías + productos)	Tras login exitoso
carrito	Array de productos en el carrito	Al añadir productos
productos_vistos	IDs de productos visitados	Al ver un producto
Limpieza al Cerrar Sesión
javascript
// Al hacer logout, se eliminan TODOS los datos
export function cerrarSesion() {
    eliminar('auth_token');
    eliminar('user_data');
    eliminar('tienda_data');
    eliminar('carrito');
    eliminar('productos_vistos');
}
🎨 Características de Diseño
Responsive Design
📱 Mobile First - Optimizado para dispositivos móviles
💻 Tablet & Desktop - Adaptación fluida a pantallas grandes
🔄 Breakpoints personalizados con SCSS mixins
Efectos Visuales
✨ Transiciones suaves en hover y click
🎭 Animaciones de entrada para productos y categorías
🌈 Degradados modernos en botones y cards
🖼️ Imágenes optimizadas con lazy loading
Componentes Reutilizables
🧩 Navbar dinámico que muestra usuario autenticado
🎴 Product Cards con información completa
🛒 Carrito flotante con contador de items
📦 Loader animado durante peticiones
🧪 Testing de la API
Hemos incluido un archivo PRUEBAS_API.md con tests completos para todos los endpoints.

Tests Disponibles
✅ Login exitoso
✅ Login con credenciales incorrectas
✅ Carrito sin token (debe fallar)
✅ Carrito con token válido
✅ Detección de precios manipulados
✅ Registro de productos vistos

Herramientas Recomendadas
Postman - Cliente API visual
Thunder Client - Extensión de VS Code
cURL - Línea de comandos
📊 Catálogo de Productos
Categorías Disponibles
💻 Portátiles - 3 productos (MacBook Pro 14, Dell XPS 15, Lenovo ThinkPad X1)
📱 Smartphones - 3 productos (iPhone 15 Pro, Samsung Galaxy S24, Google Pixel 8)
📟 Tablets - 2 productos (iPad Pro 12.9, Samsung Galaxy Tab S9)
🎧 Accesorios - 4 productos (AirPods Pro 2, Magic Mouse, Logitech MX Master 3S, Samsung 980 Pro SSD)
Total: 12 productos con especificaciones detalladas, imágenes y control de stock.

🔄 Flujo de Usuario
1. Inicio de Sesión
Usuario ingresa credenciales → Servidor valida → Devuelve token + catálogo
→ Cliente guarda en LocalStorage → Redirige a Dashboard
2. Navegación
Dashboard → Categorías → Producto → Añadir al carrito
    ↑          ↑           ↑              ↑
    └──── TODOS los datos desde LocalStorage ────┘
3. Compra
Carrito → Enviar pedido al servidor → Validar precios
→ Confirmar pedido → Vaciar carrito → Mostrar confirmación
4. Cierre de Sesión
Logout → Limpiar TODO el LocalStorage → Redirigir a Login
📚 Conceptos Aprendidos
Este proyecto implementa los siguientes conceptos del módulo DWEC:

RA4 - Estructuras Definidas por el Usuario
✅ Objetos personalizados - Clases para Producto, Usuario, Carrito
✅ Arrays complejos - Gestión de productos, categorías, carrito
✅ Métodos y propiedades - Encapsulación de lógica de negocio

Funcionalidades Avanzadas
✅ LocalStorage API - Persistencia de datos en cliente
✅ Fetch API - Peticiones HTTP asíncronas
✅ Módulos ES6 - Código modular y mantenible
✅ Autenticación por tokens - Seguridad en aplicaciones web
✅ Validación de datos - Cliente y servidor

🚀 Mejoras Futuras
 Implementar paginación en listado de productos
 Añadir filtros por precio y especificaciones
 Sistema de valoraciones y comentarios
 Historial de pedidos del usuario
 Panel de administración para gestionar productos
 Integración con pasarela de pago real
 Sistema de notificaciones en tiempo real
 Wishlist / Lista de deseos
 Búsqueda avanzada de productos
 Modo oscuro / Selector de temas

👨‍💻 Autor
Fernando Collantes

📧 Email: fernando@tienda.com
🎓 Módulo: Desarrollo Web en Entorno Cliente (DWEC)
👨‍🏫 Profesor: Carlos Basulto Pardo
🏫 Centro: Desarrollo de Aplicaciones Multiplataforma/Web
📄 Licencia
Este proyecto fue desarrollado con fines educativos como parte del módulo profesional de Desarrollo Web en Entorno Cliente.

🙏 Agradecimientos
A Carlos Basulto Pardo por la guía y especificaciones del proyecto
A la comunidad de desarrolladores por recursos y documentación

📞 Soporte
Si encuentras algún problema o tienes sugerencias:

Revisa la documentación en PRUEBAS_API.md
Verifica que Apache esté corriendo en XAMPP
Comprueba que las rutas sean correctas
Abre un issue en GitHub

<div align="center">

⭐ Si te ha gustado este proyecto, dale una estrella ⭐

Desarrollado usando HTML, CSS, JavaScript y PHP

</div>
