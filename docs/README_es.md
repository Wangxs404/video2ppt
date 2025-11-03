# 🎬 Video2PPT - Herramienta de Conversión de Video a PowerPoint

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

🚀 **[Inicio Rápido](#inicio-rápido)** | 📖 **[Documentación Completa](#documentación)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)** | 🌍 **[Volver al Principal](../README.md)**

---

Convierta archivos de video automáticamente en presentaciones de PowerPoint. Esta herramienta extrae fotogramas clave de videos y genera hermosas presentaciones de PowerPoint.

## ✨ Características

- 🎬 **Extracción de Fotogramas de Video** - Extrae automáticamente fotogramas clave de videos
- 📊 **Generación de PPT** - Genera hermosas presentaciones de PowerPoint
- ⏱️ **Configuración Flexible** - Admite intervalos de extracción de fotogramas personalizables
- 🚀 **Alto Rendimiento** - Procesamiento rápido con tamaños de archivo pequeños
- 🖼️ **Diseño Profesional** - Las imágenes llenan toda la diapositiva
- 📋 **Limpieza Automática** - Limpieza automática de archivos temporales

## 🚀 Inicio Rápido

### Requisitos

- Python 3.7+
- FFmpeg (opcional, para procesamiento avanzado de video)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/wangxs404/video2ppt.git
cd video2ppt

# Instalar dependencias
pip install -r requirements.txt
```

### Uso Básico

```bash
# Forma más simple - usar configuración predeterminada
python3 video2ppt.py video.mp4

# Especificar archivo de salida e intervalo de extracción de fotogramas
python3 video2ppt.py video.mp4 -o output.pptx -i 10

# Ver todas las opciones disponibles
python3 video2ppt.py -h
```

## 📋 Ejemplos de Uso

### Vista Previa Rápida (Procesamiento Más Rápido)
```bash
python3 video2ppt.py video.mp4 -i 20
```
- Intervalo: Cada 20 fotogramas
- Resultado: Menos diapositivas, tamaño de archivo más pequeño, procesamiento más rápido

### Conversión Estándar (Recomendado) ⭐
```bash
python3 video2ppt.py video.mp4 -i 10 -o output.pptx
```
- Intervalo: Cada 10 fotogramas
- Resultado: Calidad y tamaño de archivo equilibrados

### Alta Calidad (Más Diapositivas)
```bash
python3 video2ppt.py video.mp4 -i 5 -o output_hq.pptx
```
- Intervalo: Cada 5 fotogramas
- Resultado: Más diapositivas, archivo más grande, mejor calidad

## 📊 Métricas de Rendimiento

| Parámetro | Tiempo de Procesamiento | Tamaño de Archivo | Cantidad de Diapositivas |
|-----------|------------------------|-------------------|------------------------|
| -i 10 | ~14.5 segundos | ~17 MB | ~225 diapositivas |
| -i 5 | ~28 segundos | ~33 MB | ~449 diapositivas |
| -i 1 | ~90+ segundos | ~80+ MB | ~2237 diapositivas |

*Prueba basada en video MP4 de 76MB, 37 minutos*

## 📖 Documentación

### Opciones de Línea de Comandos

```
uso: video2ppt.py [-h] [-o SALIDA] [-i INTERVALO] video_entrada

argumentos posicionales:
  video_entrada         Ruta del archivo de video de entrada

argumentos opcionales:
  -h, --help           Mostrar mensaje de ayuda y salir
  -o, --output SALIDA  Ruta del archivo PowerPoint de salida (predeterminado: output.pptx)
  -i, --interval INTERVALO
                       Intervalo de extracción de fotogramas (predeterminado: 10)
```

### Ejemplos con Diferentes Formatos

**Video MP4**
```bash
python3 video2ppt.py lecture.mp4 -o lecture.pptx
```

**Video AVI**
```bash
python3 video2ppt.py presentation.avi -o presentation.pptx
```

**Video MOV (Mac)**
```bash
python3 video2ppt.py video.mov -o output.pptx
```

## 🛠️ Stack Tecnológico

- **OpenCV** - Procesamiento de video y extracción de fotogramas
- **python-pptx** - Generación de archivos PowerPoint
- **Pillow** - Procesamiento y redimensionamiento de imágenes
- **NumPy** - Cálculos numéricos

## 💡 Preguntas Frecuentes

### P: ¿Qué formatos de video son compatibles?
R: La mayoría de formatos compatibles con OpenCV (MP4, AVI, MOV, MKV, FLV, WMV, etc.)

### P: ¿Cómo puedo acelerar el procesamiento?
R: Aumente el valor del parámetro `-i`. Por ejemplo, `-i 20` será 4 veces más rápido que `-i 5`

### P: ¿Cómo puedo reducir el tamaño del archivo?
R: Use un intervalo de extracción de fotogramas más grande. Por ejemplo, `-i 10` resultará en archivos ~90% más pequeños comparado con `-i 5`

### P: ¿Puedo personalizar el diseño de la diapositiva?
R: Actualmente, la herramienta usa un diseño estándar. Los diseños personalizados serán compatibles en versiones futuras.

### P: ¿Cuál es la duración máxima de video compatible?
R: No hay un límite estricto, pero el tiempo de procesamiento depende de la duración del video y del parámetro de intervalo.

### P: ¿Requiere conexión a Internet?
R: No, todo el procesamiento se realiza localmente en su máquina.

### P: ¿Puedo ejecutar esto en macOS/Linux?
R: Sí, esta herramienta es multiplataforma y funciona en Windows, macOS y Linux.

## 🐛 Solución de Problemas

### Problema: Error "OpenCV not found"
```bash
# Solución: Instalar OpenCV
pip install opencv-python
```

### Problema: Error "No module named 'pptx'"
```bash
# Solución: Instalar python-pptx
pip install python-pptx
```

### Problema: Archivo de video no reconocido
- Asegúrese de que la ruta del archivo de video sea correcta
- Verifique si el formato de video es compatible
- Intente con un archivo de video diferente

## 📝 Registro de Cambios

### v1.0.0 (2025-11-03)
- Versión inicial
- Conversión básica de video a PowerPoint
- Extracción de fotogramas con intervalos personalizables
- Compatibilidad con múltiples formatos de video

## 🤝 Contribuyendo

¡Las contribuciones son bienvenidas! Siéntase libre de enviar un Pull Request.

## 📜 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](../LICENSE) para más detalles.

## 🔗 Enlaces

- [Repositorio de GitHub](https://github.com/wangxs404/video2ppt)
- [GitHub Issues](https://github.com/wangxs404/video2ppt/issues)
- [Licencia MIT](https://opensource.org/licenses/MIT)

---

**Última Actualización:** 2025-11-03
