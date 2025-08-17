#!/bin/bash

# Script de despliegue para dashboard.baronti.cl
# Ejecutar en tu máquina local

echo "🚀 Iniciando proceso de deploy para dashboard.baronti.cl"
echo "================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración (personaliza estos valores)
VPS_USER="usuario"  # Reemplaza con tu usuario
VPS_HOST="tu-servidor-ip"  # Reemplaza con tu IP del servidor
VPS_PATH="/home/usuario/public_html/dashboard.baronti.cl"  # Ajusta la ruta

# Función para mostrar errores
show_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Función para mostrar éxito
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para mostrar advertencia
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para mostrar info
show_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar que estamos en el directorio correcto del proyecto
if [ ! -f "package.json" ]; then
    show_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
fi

# Paso 1: Instalar dependencias
show_info "Paso 1: Instalando dependencias..."
npm install || show_error "Fallo al instalar dependencias"
show_success "Dependencias instaladas"

# Paso 2: Compilar para producción
show_info "Paso 2: Compilando proyecto para producción..."
npm run build || show_error "Fallo al compilar el proyecto"
show_success "Proyecto compilado exitosamente"

# Paso 3: Verificar que la carpeta dist existe
if [ ! -d "dist" ]; then
    show_error "La carpeta 'dist' no se generó. Verifica el proceso de build."
fi

# Paso 4: Comprimir archivos
show_info "Paso 3: Comprimiendo archivos..."
tar -czf dashboard-build.tar.gz -C dist .
show_success "Archivos comprimidos en dashboard-build.tar.gz"

# Paso 5: Mostrar siguiente paso
echo ""
show_warning "SIGUIENTE PASO - Ejecutar en tu VPS:"
echo ""
echo -e "${BLUE}# 1. Subir archivo al VPS:${NC}"
echo "scp dashboard-build.tar.gz $VPS_USER@$VPS_HOST:/home/$VPS_USER/"
echo ""
echo -e "${BLUE}# 2. Conectar por SSH:${NC}"
echo "ssh $VPS_USER@$VPS_HOST"
echo ""
echo -e "${BLUE}# 3. Ejecutar en el VPS:${NC}"
echo "cd ~"
echo "sudo mkdir -p $VPS_PATH"
echo "sudo tar -xzf dashboard-build.tar.gz -C $VPS_PATH"
echo "sudo chown -R $VPS_USER:$VPS_USER $VPS_PATH"
echo "sudo chmod -R 755 $VPS_PATH"
echo "rm dashboard-build.tar.gz"
echo ""
echo -e "${BLUE}# 4. Configurar SSL (si no está configurado):${NC}"
echo "sudo certbot --apache -d dashboard.baronti.cl"
echo ""
show_success "Archivos listos para deploy! 🎉"
echo ""
show_info "El dashboard estará disponible en: https://dashboard.baronti.cl"