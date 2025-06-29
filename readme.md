# 📄 HTML2PDF Converter Service

Servicio web para convertir HTML a PDF usando Puppeteer. Diseñado específicamente para generar informes oficiales con formato profesional.

## 🚀 Características

- ✅ Conversión HTML → PDF de alta calidad
- ✅ Formato A4 profesional
- ✅ Márgenes configurables
- ✅ Soporte para CSS y fondos
- ✅ API REST simple
- ✅ Docker ready
- ✅ Deploy fácil en Railway

## 📦 Instalación

### Opción 1: Docker (Recomendado)
```bash
git clone https://github.com/tu-usuario/html2pdf-service.git
cd html2pdf-service
docker-compose up -d
```

### Opción 2: Local
```bash
git clone https://github.com/tu-usuario/html2pdf-service.git
cd html2pdf-service
npm install
npm start
```

## 📡 API Reference

### POST /convert
Convierte HTML a PDF

**Request:**
```json
{
  "html": "<html><body><h1>Mi documento</h1></body></html>",
  "filename": "mi_documento.pdf",
  "options": {
    "format": "A4",
    "marginTop": "20mm",
    "marginRight": "20mm", 
    "marginBottom": "20mm",
    "marginLeft": "20mm",
    "printBackground": true
  }
}
```

**Response:** Archivo PDF binario

**cURL Example:**
```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"html":"<html><body><h1>Test</h1></body></html>","filename":"test.pdf"}' \
  --output documento.pdf
```

### GET /health
Verifica el estado del servicio

**Response:**
```json
{
  "status": "OK",
  "service": "HTML2PDF Converter",
  "version": "1.0.0",
  "uptime": 12345,
  "timestamp": "2025-06-29T10:30:00.000Z",
  "browser_active": true
}
```

### GET /
Información del servicio y documentación

## 🔧 Configuración

### Variables de Entorno
- `PORT`: Puerto del servidor (default: 3000)
- `NODE_ENV`: Ambiente (production/development)

### Opciones de PDF
- `format`: A4, A3, A5, Letter, Legal, Tabloid
- `marginTop/Right/Bottom/Left`: Márgenes en mm, cm, in, px
- `printBackground`: true/false - Incluir fondos CSS

## 🚀 Deploy en Railway

1. **Fork este repositorio**
2. **Conectar a Railway:**
   - Ve a [railway.app](https://railway.app)
   - Click "Deploy from GitHub repo"
   - Selecciona tu fork
3. **Deploy automático:**
   - Railway detecta el Dockerfile
   - Se despliega automáticamente
   - Obtienes URL tipo: `https://html2pdf-service.up.railway.app`

## 💻 Uso desde n8n

### Nodo HTTP Request
```javascript
// Configuración del nodo HTTP Request
{
  "method": "POST",
  "url": "https://tu-servicio.up.railway.app/convert",
  "body": {
    "html": "={{ $json.html_content }}",
    "filename": "={{ $json.filename }}.pdf",
    "options": {
      "format": "A4",
      "marginTop": "20mm",
      "marginRight": "20mm",
      "marginBottom": "20mm", 
      "marginLeft": "20mm",
      "printBackground": true
    }
  },
  "encoding": null,
  "responseType": "arraybuffer"
}
```

### Nodo Code (alternativo)
```javascript
const response = await this.helpers.request({
  method: 'POST',
  url: 'https://tu-servicio.up.railway.app/convert',
  body: {
    html: inputData.html_content,
    filename: inputData.filename + '.pdf',
    options: {
      format: 'A4',
      marginTop: '20mm',
      printBackground: true
    }
  },
  encoding: null
});

return [{ 
  json: { success: true },
  binary: {
    data: response,
    mimeType: 'application/pdf',
    fileName: inputData.filename + '.pdf'
  }
}];
```

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Modo desarrollo (con nodemon)
npm run dev

# Producción
npm start

# Con Docker
docker-compose up --build
```

## 📊 Performance

- **Tiempo promedio:** 1-3 segundos por conversión
- **Memoria:** ~512MB por instancia
- **Concurrencia:** Soporta múltiples conversiones simultáneas
- **Límites:** 50MB máximo de HTML input

## 🔒 Seguridad

- Usuario no-root en container
- Sin persistencia de archivos temporales
- CORS configurado
- Input validation
- Timeouts configurados

## 🐛 Troubleshooting

### Error: "Browser not launched"
```bash
# Reiniciar servicio
docker-compose restart
```

### Error: "HTML content is required"
Verificar que el campo `html` esté presente en el request body.

### PDF en blanco
Verificar que el HTML tenga contenido visible y CSS válido.

## 📄 License

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🤝 Contributing

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📞 Soporte

- **Issues:** [GitHub Issues](https://github.com/tu-usuario/html2pdf-service/issues)
- **Docs:** Este README
- **Health check:** `GET /health` en tu instancia
