# Generador de Flyers - Documentación

Herramienta web para crear flyers personalizados para eventos, meetups y charlas.

## 🚀 Características Principales

### Formatos Soportados
- **1:1** - Cuadrado (Instagram Post)
- **4:5** - Vertical (Instagram Feed)
- **9:16** - Vertical (Stories/TikTok)
- **16:9** - Horizontal (YouTube)
- **4:3** - Clásico Horizontal
- **3:4** - Clásico Vertical
- **21:9** - Ultra-wide

### Personalización de Contenido

#### Título y Subtítulo
- Título principal editable con tamaño de fuente ajustable
- Subtítulo configurable
- Control independiente de tamaño de fuente

#### Fecha y Hora
- Día de la semana
- Mes y día
- Año
- Hora del evento
- Colores personalizables para cajas de fecha y ubicación

#### Ubicación
- Dos líneas editables para información del lugar
- Color de fondo personalizable

#### Ponentes
- Soporte para 0-4 ponentes
- **Imagen**: Carga de foto con ajustes interactivos
  - Arrastre con mouse para reposicionar
  - Zoom con Shift + Rueda del mouse (50% - 200%)
  - Posición y zoom se guardan por ponente
- **Información**: Nombre, rol/título y empresa
- Ajustes automáticos por formato

#### Call to Action / Registro
- Emoji/ícono personalizable
- Texto destacado
- Texto de llamado
- URL de registro
- **Nota**: Se oculta automáticamente en formato 16:9

#### Patrocinadores
- Soporte para 1-6 logos
- Carga de imágenes
- Ajuste automático de tamaño por formato

### Diseño y Estilo

#### Colores
- Color de fondo principal
- Transparencia de imagen de fondo (0-100%)
- Color de texto general
- Colores independientes para:
  - Caja de fecha
  - Caja de tiempo/ubicación

#### Tipografía
Familias de fuente disponibles:
- Ubuntu
- Roboto
- Open Sans
- Montserrat
- Arial
- Helvetica

#### Imagen de Fondo
- Carga personalizada
- Control de opacidad
- Se mantiene al exportar

### Exportación

#### Formatos de Salida
- **PNG de alta resolución** (2400px base)
- **Vista previa** en modal
- **Copiar al portapapeles**

#### Calidad
- Escalado inteligente según formato
- Factor de escala automático
- Resolución optimizada para impresión y digital

### Configuración

#### Guardar/Cargar
- **Exportar configuración**: Guarda todos los ajustes en JSON
- **Importar configuración**: Carga configuración previamente guardada
- Incluye:
  - Textos y contenidos
  - Colores y diseño
  - Configuración de ponentes
  - Posiciones y zoom de imágenes

## 🎨 Ajustes Específicos por Formato

### Formato 16:9 (Horizontal - YouTube)
- **Call to Action**: Oculto automáticamente
- **Imágenes de ponentes**: 170px de altura
- **Fuentes aumentadas**:
  - Día de semana: 24px
  - Mes/día: 32px
  - Año: 24px
  - Hora: 28px
  - Ubicación: 26px
  - Nombre ponente: 24px
  - Rol/Compañía: 25px
- **Sponsors**: Logos más grandes (80px altura)
- **Gap entre cajas**: 15px
- **Padding derecho**: Mejor centrado visual

### Formato 1:1 (Cuadrado - Instagram)
- **Imágenes de ponentes**: 160px de altura
- **Fuentes aumentadas**:
  - Nombre ponente: 24px
  - Rol/Compañía: 20px
- Diseño balanceado para vista cuadrada

### Formato 9:16 (Vertical - Stories)
- **Imágenes de ponentes**: 320px de altura
- Optimizado para aprovechar el espacio vertical
- Fuentes reducidas para mejor proporción

## 📋 Uso Básico

1. **Seleccionar formato** del flyer
2. **Configurar contenido**:
   - Título y subtítulo
   - Fecha, hora y ubicación
   - Número de ponentes
3. **Subir imágenes**:
   - Fondo del evento
   - Fotos de ponentes
   - Logos de patrocinadores
4. **Ajustar diseño**:
   - Colores de fondo y texto
   - Fuente tipográfica
   - Opacidad del fondo
5. **Ajustar imágenes de ponentes**:
   - Arrastrar para reposicionar
   - Shift + Scroll para zoom
6. **Vista previa y descarga**:
   - Botón "Vista Previa" para ver en alta resolución
   - Botón "Descargar" para guardar PNG
   - Opción de copiar al portapapeles

## 💾 Gestión de Configuraciones

### Exportar
- Haz clic en "Exportar Configuración"
- Se descarga un archivo JSON con todos los ajustes
- Útil para crear plantillas reutilizables

### Importar
- Selecciona un archivo JSON de configuración
- Haz clic en "Cargar Configuración"
- Todos los ajustes se restauran automáticamente

## 🎯 Consejos de Uso

- **Imágenes de ponentes**: Usa fotos con buena resolución y fondos uniformes
- **Formato 16:9**: Ideal para presentaciones y YouTube
- **Formato 1:1**: Perfecto para Instagram posts
- **Formato 9:16**: Optimizado para Stories y Reels
- **Colores**: Asegúrate de tener buen contraste entre texto y fondo
- **Repositorio de imágenes**: Las posiciones se guardan automáticamente

## 🔧 Tecnologías

- HTML5
- CSS3 (con variables CSS para escalado dinámico)
- JavaScript Vanilla
- html2canvas (para exportación de imágenes)
- Google Fonts (Ubuntu, Roboto, Open Sans, Montserrat)


**Versión**: 1.0  
**Última actualización**: Febrero 2026
