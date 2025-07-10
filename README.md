# 📊 Dashboard de Saldos y Liquidez

Una aplicación web moderna para visualizar y gestionar datos de saldos y liquidez a partir de archivos Excel, con sistema de autenticación y roles de usuario.

## 🚀 Características

- **🔐 Autenticación y Roles**: Sistema de usuarios con roles (Admin, Manager, User, Viewer)
- **📁 Carga de Excel**: Procesamiento automático de archivos Excel con datos financieros
- **📊 Visualización**: Dashboard interactivo con métricas y gráficos
- **💻 Interfaz Moderna**: Diseño responsivo con Tailwind CSS
- **🔍 Análisis**: Visualización de saldos, liquidez, entradas y salidas
- **🛡️ Seguridad**: JWT tokens y encriptación de contraseñas

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Base de Datos**: SQLite con Prisma ORM
- **Autenticación**: JWT tokens, bcrypt
- **Excel Processing**: XLSX library
- **UI**: Lucide React icons, componentes personalizados

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn

## ⚡ Instalación Rápida

1. **Clonar o navegar al directorio del proyecto**
   ```bash
   cd balance-liquidez-dashboard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Crear usuario administrador inicial**
   ```bash
   npx tsx scripts/seed.ts
   ```

5. **Ejecutar la aplicación**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 👤 Credenciales de Acceso

Después de ejecutar el script de inicialización, puedes acceder con:

- **Administrador**: `admin@balancedashboard.com` / `admin123`

O puedes registrar nuevos usuarios desde la página de registro.

## 📊 Formato de Archivo Excel

Para cargar datos correctamente, tu archivo Excel debe contener las siguientes columnas:

### Columnas Requeridas:
- **Cuenta** (o Account): Código o nombre de la cuenta
- **Descripción** (o Description): Descripción de la cuenta
- **Saldo Inicial**: Saldo al inicio del período
- **Saldo Final**: Saldo al final del período
- **Entradas** (o Débitos): Movimientos de entrada
- **Salidas** (o Créditos): Movimientos de salida

### Columnas Opcionales:
- **Fecha**: Fecha del registro (si no se proporciona, usa la fecha actual)
- **Moneda**: Moneda de los valores (por defecto ARS)
- **Categoría**: Categorización adicional

### Ejemplo de Estructura:
```
| Cuenta | Descripción    | Saldo Inicial | Saldo Final | Entradas | Salidas | Fecha      | Moneda |
|--------|----------------|---------------|-------------|----------|---------|------------|--------|
| 1001   | Caja y Bancos  | 100000        | 150000      | 75000    | 25000   | 2024-01-01 | ARS    |
| 1002   | Clientes       | 50000         | 45000       | 20000    | 25000   | 2024-01-01 | ARS    |
```

## 🎯 Uso de la Aplicación

### 1. Inicio de Sesión
- Accede con tus credenciales
- Si no tienes cuenta, regístrate desde el enlace en la página de login

### 2. Dashboard Principal
- Visualiza resumen de saldos totales
- Ve métricas de liquidez
- Revisa entradas y salidas totales
- Consulta los datos más recientes

### 3. Cargar Archivo Excel
- Haz clic en "Subir Excel" desde el dashboard
- Arrastra y suelta tu archivo o selecciónalo
- La aplicación validará la estructura automáticamente
- Una vez procesado, verás el resumen de registros importados

### 4. Roles de Usuario

- **ADMIN**: Acceso completo, puede ver datos de todos los usuarios
- **MANAGER**: Gestión de datos y usuarios de su área
- **USER**: Puede cargar y ver sus propios datos
- **VIEWER**: Solo lectura de datos

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en producción
npm run lint         # Verificar código con ESLint

# Base de datos
npx prisma studio    # Interfaz web para la base de datos
npx prisma migrate   # Ejecutar migraciones
npx prisma generate  # Regenerar cliente de Prisma

# Utilidades
npx tsx scripts/seed.ts  # Crear usuarios de ejemplo
```

## 📁 Estructura del Proyecto

```
balance-liquidez-dashboard/
├── src/
│   ├── app/                 # Páginas de Next.js
│   │   ├── api/            # Endpoints de API
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── login/          # Página de login
│   │   ├── register/       # Página de registro
│   │   └── upload/         # Página de carga
│   ├── components/         # Componentes React
│   │   └── ui/            # Componentes de UI
│   └── lib/               # Utilidades y configuración
│       ├── auth.ts        # Funciones de autenticación
│       ├── excel-parser.ts # Procesamiento de Excel
│       ├── prisma.ts      # Cliente de base de datos
│       └── utils.ts       # Utilidades generales
├── prisma/
│   └── schema.prisma      # Esquema de base de datos
├── scripts/
│   └── seed.ts           # Script de inicialización
└── package.json
```

## 🔒 Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT para autenticación
- Validación de archivos subidos
- Autorización basada en roles
- Protección de rutas API

## 🐛 Solución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Error: Base de datos no encontrada
```bash
npx prisma db push
```

### Problemas con la carga de Excel
- Verifica que el archivo tenga las columnas requeridas
- Asegúrate de que los valores numéricos estén en formato correcto
- Revisa que no haya filas completamente vacías

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

1. Revisa la consola del navegador para errores
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que la base de datos esté configurada correctamente

## 🔄 Próximas Características

- [ ] Gráficos avanzados con Chart.js
- [ ] Exportación de reportes
- [ ] Filtros y búsqueda avanzada
- [ ] Notificaciones en tiempo real
- [ ] Integración con APIs externas
- [ ] Dashboard de administración

---

¡Disfruta usando el Dashboard de Saldos y Liquidez! 🎉