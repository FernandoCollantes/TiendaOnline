/**
 * ============================================================================
 * LÓGICA DE LA PÁGINA DE LOGIN
 * ============================================================================
 * 
 * Flujo completo:
 * 1. Al cargar la página, verificar si ya hay sesión activa
 * 2. Si hay sesión → redirigir a dashboard
 * 3. Si no hay sesión → mostrar formulario
 * 4. Al hacer submit → validar, enviar al backend, guardar datos, redirigir
 */

import { login } from '../utils/api.js';
import { 
    guardarToken, 
    guardarUsuario, 
    guardarTienda,
    obtenerToken 
} from '../utils/localStorage.js';

// ============================================================================
// ELEMENTOS DEL DOM
// ============================================================================

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const mensajeDiv = document.getElementById('mensaje');

// ============================================================================
// VERIFICAR SESIÓN AL CARGAR LA PÁGINA
// ============================================================================

/**
 * Si el usuario ya tiene un token válido en LocalStorage,
 * no tiene sentido que esté en la página de login
 */
document.addEventListener('DOMContentLoaded', () => {
    const token = obtenerToken();
    
    if (token) {
        // Ya hay sesión activa, redirigir al dashboard
        window.location.href = 'dashboard.html';
    }
});

// ============================================================================
// MANEJO DEL FORMULARIO
// ============================================================================

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evitar que el formulario recargue la página
    
    // Obtener valores del formulario
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Validación básica en el cliente
    if (!username || !password) {
        mostrarMensaje('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    btnLogin.disabled = true;
    btnLogin.classList.add('loading');
    btnLogin.textContent = 'Iniciando sesión...';
    
    try {
        // Llamar a la API de login
        const respuesta = await login(username, password);
        
        // Verificar que el login fue exitoso
        if (respuesta.success) {
            // Extraer datos de la respuesta
            const { token, usuario, tienda } = respuesta.data;
            
            /**
             * PASO CRÍTICO: Guardar todo en LocalStorage
             * 
             * ¿Por qué guardamos la tienda completa?
             * - Para evitar peticiones constantes al servidor
             * - El cliente tiene TODO lo necesario para navegar
             * - Solo volverá al servidor para validar el carrito
             */
            guardarToken(token);
            guardarUsuario(usuario);
            guardarTienda(tienda);
            
            // Mostrar mensaje de éxito
            mostrarMensaje(respuesta.message || '¡Bienvenido!', 'success');
            
            // Redirigir al dashboard después de 1 segundo
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            // El servidor respondió pero el login falló
            mostrarMensaje(respuesta.message || 'Error en el login', 'error');
            habilitarBoton();
        }
        
    } catch (error) {
        // Error de red o del servidor
        console.error('Error en login:', error);
        mostrarMensaje(
            error.message || 'Error al conectar con el servidor. Verifica tu conexión.',
            'error'
        );
        habilitarBoton();
    }
});

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Mostrar mensaje de error o éxito
 * 
 * @param {string} texto - Mensaje a mostrar
 * @param {string} tipo - 'success' o 'error'
 */
function mostrarMensaje(texto, tipo = 'error') {
    mensajeDiv.textContent = texto;
    mensajeDiv.className = tipo === 'success' ? 'alert alert-success' : 'alert alert-error';
    mensajeDiv.classList.remove('hidden');
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        mensajeDiv.classList.add('hidden');
    }, 5000);
}

/**
 * Rehabilitar el botón de login después de un intento
 */
function habilitarBoton() {
    btnLogin.disabled = false;
    btnLogin.classList.remove('loading');
    btnLogin.textContent = 'Iniciar Sesión';
}

/**
 * ============================================================================
 * DEBUGGING (solo para desarrollo)
 * ============================================================================
 * 
 * Descomentar para ver en consola lo que se guarda en LocalStorage
 */

// console.log(' Debug - Token:', obtenerToken());
// console.log(' Debug - Usuario:', obtenerUsuario());
// console.log(' Debug - Tienda:', obtenerTienda());
