# Guía de Despliegue - dashboard.baronti.cl

Esta guía te ayudará a desplegar el Dashboard en tu VPS con AlmaLinux + EasyApache.

## 📋 Requisitos Previos

1. ✅ Subdominio `dashboard.baronti.cl` creado y configurado en tu VPS
2. ✅ Acceso SSH a tu VPS
3. ✅ Apache configurado y funcionando
4. ✅ Node.js y npm instalados en tu máquina local

## 🚀 Proceso de Despliegue

### Opción A: Deploy Automático (Recomendado)

```bash
# En tu máquina local, ejecuta:
chmod +x deploy.sh
./deploy.sh
```

Sigue las instrucciones que aparecerán en pantalla.

### Opción B: Deploy Manual

#### Paso 1: En tu máquina local

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar para producción
npm run build

# 3. Comprimir archivos
tar -czf dashboard-build.tar.gz -C dist .
```

#### Paso 2: Subir archivos al VPS

```bash
# Subir el archivo comprimido
scp dashboard-build.tar.gz usuario@tu-servidor-ip:/home/usuario/

# Conectar por SSH
ssh usuario@tu-servidor-ip
```

#### Paso 3: En el VPS

```bash
# Crear directorio del subdominio
sudo mkdir -p /home/usuario/public_html/dashboard.baronti.cl/

# Extraer archivos
sudo tar -xzf dashboard-build.tar.gz -C /home/usuario/public_html/dashboard.baronti.cl/

# Establecer permisos correctos
sudo chown -R usuario:usuario /home/usuario/public_html/dashboard.baronti.cl/
sudo chmod -R 755 /home/usuario/public_html/dashboard.baronti.cl/

# Limpiar archivo temporal
rm dashboard-build.tar.gz
```

#### Paso 4: Configurar SSL (si no está configurado)

```bash
sudo certbot --apache -d dashboard.baronti.cl
```

## 📁 Estructura Final Esperada

```
/home/usuario/public_html/dashboard.baronti.cl/
├── index.html
├── .htaccess
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    └── [otros archivos]
```

## ✅ Verificar Funcionamiento

1. 🌐 Visita `https://dashboard.baronti.cl`
2. 🔄 Verifica que las rutas funcionen (ejemplo: refrescar la página)
3. 💾 Prueba que localStorage funcione (agregar un sitio web)
4. 📱 Verifica que sea responsive
5. 🔒 Confirma que HTTPS esté funcionando

## 🐛 Solución de Problemas

### Error: "No se puede cargar la página"
- Verifica que el subdominio apunte al directorio correcto
- Revisa los logs de Apache: `sudo tail -f /var/log/httpd/error_log`

### Error: "404 al refrescar la página"
- Asegúrate de que el archivo `.htaccess` esté presente
- Verifica que mod_rewrite esté habilitado en Apache

### Error: "Sitio no seguro"
- Ejecuta: `sudo certbot --apache -d dashboard.baronti.cl`
- Verifica en cPanel que el SSL esté activo

### Problema: "Los datos no se guardan"
- localStorage funciona automáticamente
- Los datos se guardan por navegador/usuario
- No requiere configuración adicional

## 🔧 Configuraciones Adicionales

### Configurar en cPanel (si aplicable)
1. Ve a "Subdominios" en cPanel
2. Verifica que `dashboard.baronti.cl` apunte a la carpeta correcta
3. Activa "Force HTTPS Redirect"

### Optimizaciones Opcionales
- El archivo `.htaccess` incluye compresión gzip
- Cache de archivos estáticos configurado
- Headers de seguridad básicos

## 📞 Soporte

Si encuentras problemas:
1. Verifica los logs de Apache
2. Revisa que todos los archivos estén en su lugar
3. Confirma permisos de archivos/directorios
4. Verifica configuración DNS del subdominio

## 🎯 Resultado Final

Una vez completado el despliegue:
- ✅ Dashboard accesible en `https://dashboard.baronti.cl`
- ✅ Funcionalidad completa (agregar/editar sitios, pestañas, notas)
- ✅ Datos persistentes por usuario/navegador
- ✅ Compatible con todos los navegadores modernos
- ✅ SSL/HTTPS configurado automáticamente
- ✅ Optimizado para producción (compresión, cache, etc.)