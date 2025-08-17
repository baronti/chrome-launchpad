#!/bin/bash

# Script de deploy completo para servidor VPS
# Ejecutar directamente en el servidor donde está clonado el repositorio

echo "🚀 Iniciando deploy completo del dashboard"
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuración del servidor (personaliza estos valores)
SERVER_USER="wwbaro"  # Usuario del servidor
DOMAIN="dashboard.baronti.cl"
PROJECT_DIR="/home/$SERVER_USER/$DOMAIN/dashboard-code"  # Directorio del código fuente
WEB_ROOT="/home/$SERVER_USER/$DOMAIN"  # Directorio público del sitio
BACKUP_DIR="/home/$SERVER_USER/backups"

# Función para mostrar errores y salir
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

# Función para mostrar proceso
show_process() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

# Función para crear backup
create_backup() {
    if [ -d "$WEB_ROOT" ] && [ "$(ls -A $WEB_ROOT 2>/dev/null | grep -v dashboard-code)" ]; then
        show_info "Creando backup del sitio actual..."
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="dashboard-backup-$(date +%Y%m%d-%H%M%S)"
        # Solo hacer backup de los archivos web, no del código fuente
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
        find "$WEB_ROOT" -maxdepth 1 -type f -exec cp {} "$BACKUP_DIR/$BACKUP_NAME"/ \; 2>/dev/null || true
        show_success "Backup creado: $BACKUP_DIR/$BACKUP_NAME"
        echo "$BACKUP_DIR/$BACKUP_NAME" > /tmp/last_backup_path
    else
        show_info "No existe sitio anterior, omitiendo backup..."
    fi
}

# Función para rollback
rollback() {
    if [ -f "/tmp/last_backup_path" ]; then
        BACKUP_PATH=$(cat /tmp/last_backup_path)
        if [ -d "$BACKUP_PATH" ]; then
            show_warning "Ejecutando rollback..."
            rm -rf "$WEB_ROOT"
            cp -r "$BACKUP_PATH" "$WEB_ROOT"
            show_success "Rollback completado"
        fi
    fi
}

# Mostrar información de debug
show_info "Directorio actual: $(pwd)"
show_info "Directorio del proyecto: $PROJECT_DIR"
show_info "Directorio web: $WEB_ROOT"

# Cambiar al directorio del proyecto
show_process "Cambiando al directorio del proyecto..."
cd "$PROJECT_DIR" || show_error "No se pudo acceder al directorio del proyecto: $PROJECT_DIR"
show_success "Directorio cambiado a: $(pwd)"

# Verificar que estamos en un repositorio git
if [ ! -d ".git" ]; then
    show_error "No se encontró repositorio git en: $PROJECT_DIR"
fi

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    show_error "No se encontró package.json en: $PROJECT_DIR"
fi

# Paso 1: Actualizar código desde repositorio
show_process "Paso 1: Actualizando código desde repositorio..."
git fetch origin || show_error "Fallo al hacer fetch del repositorio"
git pull origin main || show_error "Fallo al hacer pull del repositorio"
show_success "Código actualizado desde repositorio"

# Paso 2: Instalar/actualizar dependencias
show_process "Paso 2: Instalando dependencias..."
npm install || show_error "Fallo al instalar dependencias"
show_success "Dependencias instaladas correctamente"

# Paso 3: Limpiar build anterior
show_process "Paso 3: Limpiando build anterior..."
rm -rf dist/
show_success "Build anterior eliminado"

# Paso 4: Compilar para producción
show_process "Paso 4: Compilando proyecto para producción..."
npm run build || show_error "Fallo al compilar el proyecto"
show_success "Proyecto compilado exitosamente"

# Verificar que la carpeta dist se generó correctamente
if [ ! -d "dist" ]; then
    show_error "La carpeta 'dist' no se generó. Verifica el proceso de build."
fi

# Verificar que dist no está vacía
if [ -z "$(ls -A dist)" ]; then
    show_error "La carpeta 'dist' está vacía. Verifica el proceso de build."
fi

# Paso 5: Crear backup del sitio actual
show_process "Paso 5: Creando backup del sitio actual..."
create_backup

# Paso 6: Preparar directorio web
show_process "Paso 6: Preparando directorio web..."
sudo mkdir -p "$WEB_ROOT" || show_error "Fallo al crear directorio web"
show_success "Directorio web preparado"

# Paso 7: Desplegar archivos
show_process "Paso 7: Desplegando archivos al servidor web..."

# Mostrar información de debug antes de copiar
show_info "Contenido actual de dist:"
ls -la "$PROJECT_DIR/dist/" || show_error "No se pudo listar el contenido de dist"

# Limpiar directorio web actual (preservar dashboard-code)
show_info "Limpiando archivos web anteriores..."
find "$WEB_ROOT" -maxdepth 1 -type f -delete 2>/dev/null || true
find "$WEB_ROOT" -maxdepth 1 -type d -name "assets" -exec rm -rf {} \; 2>/dev/null || true

# Copiar nuevos archivos desde el directorio del proyecto
show_info "Copiando desde: $PROJECT_DIR/dist/* hacia: $WEB_ROOT/"
sudo cp -r "$PROJECT_DIR/dist"/* "$WEB_ROOT"/ || {
    show_error "Fallo al copiar archivos. Ejecutando rollback..."
    rollback
    show_error "Deploy fallido, sitio restaurado"
}
show_success "Archivos desplegados correctamente"

# Paso 8: Configurar permisos
show_process "Paso 8: Configurando permisos..."
sudo chown -R "$SERVER_USER:$SERVER_USER" "$WEB_ROOT" || show_error "Fallo al configurar propietario"
sudo chmod -R 755 "$WEB_ROOT" || show_error "Fallo al configurar permisos"
show_success "Permisos configurados correctamente"

# Paso 9: Verificar archivos principales
show_process "Paso 9: Verificando deploy..."
if [ ! -f "$WEB_ROOT/index.html" ]; then
    show_error "index.html no encontrado en el directorio web. Deploy fallido."
fi

# Contar archivos desplegados
FILE_COUNT=$(find "$WEB_ROOT" -type f | wc -l)
show_info "Archivos desplegados: $FILE_COUNT"

# Paso 10: Limpiar archivos temporales
show_process "Paso 10: Limpieza final..."
rm -f /tmp/last_backup_path
show_success "Limpieza completada"

# Resumen final
echo ""
echo "🎉 ¡DEPLOY COMPLETADO EXITOSAMENTE! 🎉"
echo "====================================="
echo -e "${GREEN}✅ Sitio actualizado en: https://$DOMAIN${NC}"
echo -e "${BLUE}📁 Archivos en: $WEB_ROOT${NC}"
echo -e "${BLUE}📊 Total de archivos: $FILE_COUNT${NC}"
echo -e "${YELLOW}💾 Backup disponible en: $BACKUP_DIR${NC}"
echo ""
show_info "Verifica que el sitio funcione correctamente visitando: https://$DOMAIN"
echo ""