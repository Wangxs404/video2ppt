# 🎬 Video2PPT - Herramienta de Conversión de Video a PowerPoint

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.7+](https://img.shields.io/badge/Python-3.7%2B-blue)](https://www.python.org/downloads/)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/wangxs404/video2ppt)

🚀 **[Inicio Rápido](#inicio-rápido)** | 📖 **[Documentación Completa](#documentación)** | 💬 **[GitHub Issues](https://github.com/wangxs404/video2ppt/issues)** | 🌍 **[Volver al Principal](../README.md)**

---

Convierta archivos de video automáticamente en presentaciones de PowerPoint. Esta herramienta extrae fotogramas de videos a intervalos de tiempo especificados y genera hermosas presentaciones de PowerPoint.

## ✨ Características

- 🎬 **Extracción de Fotogramas de Video** - Extrae automáticamente fotogramas a intervalos de tiempo especificados (en segundos)
- 📊 **Generación de PPT** - Genera hermosas presentaciones de PowerPoint
- ⏱️ **Configuración Flexible** - Admite intervalos de extracción de fotogramas personalizables
- 🚀 **Alto Rendimiento** - Procesamiento rápido con tamaños de archivo pequeños
- 🖼️ **Diseño Profesional** - Las imágenes llenan toda la diapositiva
- 📋 **Limpieza Automática** - Limpieza automática de archivos temporales

## 🚀 Inicio Rápido

### Requisitos

- Python 3.7+

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/wangxs404/video2ppt.git
cd video2ppt

# Instalar dependencias
pip install -r requirements.txt
```

### Uso Básico

```bash
# Predeterminado: extraer 1 fotograma por segundo
python3 main.py video.mp4

# Extraer 1 fotograma cada 5 segundos
python3 main.py video.mp4 -i 5 -o output.pptx

# Extraer 1 fotograma cada 10 segundos (modo rápido)
python3 main.py video.mp4 -i 10

# Ver todas las opciones disponibles
python3 main.py -h
```

## 📋 Ejemplos de Uso

### Ejemplo 1: Vista Previa Rápida (Procesamiento Más Rápido)
```bash
python3 main.py video.mp4 -i 10
```
- Intervalo: Extraer 1 fotograma cada 10 segundos
- Resultado: Menos diapositivas, tamaño de archivo más pequeño, procesamiento más rápido (~7 segundos)

### Ejemplo 2: Conversión Estándar (Recomendado) ⭐
```bash
python3 main.py video.mp4 -i 5 -o output.pptx
```
- Intervalo: Extraer 1 fotograma cada 5 segundos
- Resultado: Calidad y tamaño de archivo equilibrados (~14 segundos)

### Ejemplo 3: Conversión de Alta Calidad (Más Detalle)
```bash
python3 main.py video.mp4 -i 2 -o detailed.pptx
```
- Intervalo: Extraer 1 fotograma cada 2 segundos
- Resultado: Más diapositivas, archivo más grande, mejor calidad (~28 segundos)

### Ejemplo 4: Modo Predeterminado (Máximo Detalle)
```bash
python3 main.py video.mp4 -i 1 -o maximum.pptx
```
- Intervalo: Extraer 1 fotograma cada 1 segundo (predeterminado)
- Resultado: Máximo fotogramas, archivo más grande (~55 segundos para video de 37 minutos)

## 📊 Métricas de Rendimiento

Basado en video MP4 de 76MB, 37 minutos:

| Intervalo (segundos) | Fotogramas/Segundo | Tiempo de Procesamiento | Tamaño de Archivo | Cantidad de Diapositivas |
|---------------------|-------------------|------------------------|-------------------|------------------------|
| -i 10 | 0.1 fps | ~7 segundos | ~9 MB | ~222 diapositivas |
| -i 5 | 0.2 fps | ~14 segundos | ~17 MB | ~444 diapositivas |
| -i 2 | 0.5 fps | ~28 segundos | ~33 MB | ~1110 diapositivas |
| -i 1 | 1.0 fps | ~55 segundos | ~80+ MB | ~2220 diapositivas |

**Recomendación:** Use `-i 5` para el mejor equilibrio entre calidad y tamaño de archivo.

## 📖 Documentación

### Opciones de Línea de Comandos

```
uso: main.py [-h] [-o SALIDA] [-i INTERVALO] video

argumentos posicionales:
  video                 Ruta del archivo de video de entrada

argumentos opcionales:
  -h, --help           Mostrar este mensaje de ayuda y salir
  -o, --output SALIDA  Ruta del archivo PowerPoint de salida (predeterminado: video_name_output.pptx)
  -i, --interval INTERVALO
                       Intervalo de extracción de fotogramas en segundos (predeterminado: 1)
```

### Ejemplos con Diferentes Formatos de Video

**Video MP4**
```bash
python3 main.py lecture.mp4 -o lecture.pptx
```

**Video AVI**
```bash
python3 main.py presentation.avi -o presentation.pptx -i 3
```

**Video MOV (Mac)**
```bash
python3 main.py video.mov -o output.pptx -i 2
```

## 🛠️ Stack Tecnológico

- **OpenCV** - Procesamiento de video y extracción de fotogramas
- **python-pptx** - Generación de archivos PowerPoint
- **Pillow** - Procesamiento y redimensionamiento de imágenes
- **NumPy** - Cálculos numéricos

## 💡 Preguntas Frecuentes

### P: ¿Qué formatos de video son compatibles?
R: La mayoría de formatos compatibles con OpenCV (MP4, AVI, MOV, MKV, FLV, WMV, etc.)

### P: ¿Cómo funcionan los intervalos?
R: El parámetro `-i` especifica segundos entre fotogramas. Por ejemplo, `-i 5` significa extraer 1 fotograma cada 5 segundos.

### P: ¿Cómo puedo acelerar el procesamiento?
R: Aumente el valor del parámetro `-i`. Por ejemplo, `-i 10` será 5 veces más rápido que `-i 2` pero extraerá menos fotogramas.

### P: ¿Cómo puedo reducir el tamaño del archivo?
R: Use un intervalo de extracción de fotogramas más grande. Por ejemplo, `-i 10` produce archivos ~90% más pequeños comparado con `-i 1`.

### P: ¿Puedo personalizar el diseño de la diapositiva?
R: Actualmente, la herramienta usa un diseño estándar de imagen de diapositiva completa. Los diseños personalizados serán compatibles en versiones futuras.

### P: ¿Cuál es la duración máxima de video compatible?
R: No hay un límite estricto, pero el tiempo de procesamiento depende de la duración del video y del parámetro de intervalo.

### P: ¿Requiere conexión a Internet?
R: No, todo el procesamiento se realiza localmente en su máquina.

### P: ¿Puedo ejecutar esto en macOS/Linux/Windows?
R: Sí, esta herramienta es multiplataforma y funciona en todos los sistemas.

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
- Conversión de video a PowerPoint con extracción de fotogramas basada en tiempo
- Extracción de fotogramas a intervalos de tiempo personalizables (en segundos)
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
