# PRUEBAS DE LA API REST - TIENDA ONLINE

## Configuración Base
- **Base URL**: `http://localhost/TiendaOnline/backend/api/`
- **Headers comunes**: `Content-Type: application/json`

---

## 1. TEST: Login Exitoso

**Endpoint**: `POST http://localhost/tienda-online/backend/api/login.php`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta Esperada** (200 OK):
```json
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
```

**¿Qué verificar?**
- ✅ Status code 200
- ✅ success = true
- ✅ Token presente y no vacío
- ✅ Datos del usuario correctos
- ✅ Tienda contiene categorías y productos

---

## 2. TEST: Login con Credenciales Incorrectas

**Endpoint**: `POST http://localhost/tienda-online/backend/api/login.php`

**Body**:
```json
{
  "username": "admin",
  "password": "contraseña_incorrecta"
}
```

**Respuesta Esperada** (401 Unauthorized):
```json
{
  "success": false,
  "data": null,
  "message": "Credenciales incorrectas."
}
```

**¿Qué verificar?**
- ✅ Status code 401
- ✅ success = false
- ✅ Mensaje de error apropiado

---

## 3. TEST: Login sin Datos

**Endpoint**: `POST http://localhost/tienda-online/backend/api/login.php`

**Body**:
```json
{}
```

**Respuesta Esperada** (400 Bad Request):
```json
{
  "success": false,
  "data": null,
  "message": "Faltan credenciales. Proporciona username y password."
}
```

---

## 4. TEST: Carrito - Sin Token (Debe Fallar)

**Endpoint**: `POST http://localhost/tienda-online/backend/api/carrito.php`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "carrito": [
    {
      "id": 1,
      "cantidad": 2,
      "precio": 2299.99
    }
  ]
}
```

**Respuesta Esperada** (401 Unauthorized):
```json
{
  "success": false,
  "data": null,
  "message": "Token no proporcionado. Debes iniciar sesión."
}
```

**¿Qué verificar?**
- ✅ Status code 401
- ✅ El endpoint rechaza peticiones sin autenticación

---

## 5. TEST: Carrito - Con Token Válido

**IMPORTANTE**: Primero debes hacer login (test #1) y copiar el token de la respuesta.

**Endpoint**: `POST http://localhost/tienda-online/backend/api/carrito.php`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer [PEGAR_AQUÍ_EL_TOKEN_DEL_LOGIN]
```

**Body**:
```json
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
```

**Respuesta Esperada** (200 OK):
```json
{
  "success": true,
  "data": {
    "numero_pedido": "PED-1234567890-1",
    "usuario_id": 1,
    "usuario_nombre": "admin",
    "fecha": "2024-11-25 10:30:00",
    "productos": [...],
    "total": 5799.97,
    "estado": "confirmado"
  },
  "message": "¡Pedido confirmado exitosamente!"
}
```

**¿Qué verificar?**
- ✅ Status code 200
- ✅ success = true
- ✅ Total calculado correctamente: (2299.99 * 2) + (1199.99 * 1) = 5799.97
- ✅ Número de pedido generado

---

## 6. TEST: Carrito - Precio Manipulado (Debe Fallar)

**Endpoint**: `POST http://localhost/tienda-online/backend/api/carrito.php`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer [TU_TOKEN]
```

**Body** (precio alterado, real es 2299.99):
```json
{
  "carrito": [
    {
      "id": 1,
      "cantidad": 1,
      "precio": 10.00
    }
  ]
}
```

**Respuesta Esperada** (400 Bad Request):
```json
{
  "success": false,
  "data": {
    "errores": [
      "Precio manipulado en producto 'MacBook Pro 14'. Precio real: €2299.99, precio enviado: €10"
    ]
  },
  "message": "Se encontraron problemas con el carrito."
}
```

**¿Qué verificar?**
- ✅ Status code 400
- ✅ El servidor detectó la manipulación de precio
- ✅ Mensaje de error específico

---

## 7. TEST: Productos Vistos - POST

**Endpoint**: `POST http://localhost/tienda-online/backend/api/productos_vistos.php`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer [TU_TOKEN]
```

**Body**:
```json
{
  "producto_id": 5,
  "timestamp": 1700000000
}
```

**Respuesta Esperada** (200 OK):
```json
{
  "success": true,
  "data": {
    "usuario_id": 1,
    "producto": {
      "id": 5,
      "nombre": "Samsung Galaxy S24",
      "precio": 899.99
    },
    "timestamp": 1700000000,
    "fecha": "2024-11-14 14:13:20"
  },
  "message": "Producto registrado como visto."
}
```

---

## Checklist de Pruebas

- [ ] Login exitoso funciona
- [ ] Login con credenciales incorrectas rechaza apropiadamente
- [ ] Login sin datos devuelve error 400
- [ ] Carrito sin token devuelve error 401
- [ ] Carrito con token válido procesa correctamente
- [ ] Carrito detecta manipulación de precios
- [ ] Productos vistos registra correctamente

---

## Notas

Si alguna prueba falla, revisar:
1. XAMPP Apache está corriendo
2. Ruta correcta en htdocs
3. Archivos JSON existen y tienen datos válidos
4. Headers CORS configurados correctamente