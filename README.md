# Sistema de Compras y Contrataciones — Front-end

Interfaz web del Caso B (Fase 4) de la Cooperativa Guayacán.

Consume la API del repositorio **compras-back**, que debe estar instalada y corriendo primero.

---

## Requisitos

| Herramienta | Versión |
|---|---|
| Node.js | 22 o superior (probado con 24) |
| pnpm | 10 |
| API compras-back | Corriendo en `http://compras-back.local` |

Instalar pnpm (una sola vez):
```bash
npm install -g pnpm
```

---

## Pasos de instalación

### 1. Clonar el proyecto
En la terminal de Laragon (**Menú → Terminal**):
```bash
cd C:\laragon\www
git clone https://github.com/CASTILLOAXEL/compras-front.git
cd compras-front
```

### 2. Instalar las dependencias
```bash
pnpm install
```

### 3. Configurar el `.env`
```bash
copy .env.example .env
```

Debe tener la dirección de la API:
```env
NUXT_API_URL=http://compras-back.local
```

### 4. Levantar el proyecto
```bash
pnpm dev
```

### 5. Abrir en el navegador
```
http://localhost:3000
```

---

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Super Administrador | `admin@compras.test` | `Gy202600` |
| Solicitante | `solicitante@compras.test` | `Gy202600` |
