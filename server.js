const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Variable global para el navegador
let browser = null;

// Inicializar navegador al arrancar
async function initBrowser() {
  try {
    console.log('🚀 Iniciando navegador Puppeteer...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    console.log('✅ Navegador iniciado correctamente');
  } catch (error) {
    console.error('❌ Error iniciando navegador:', error);
    process.exit(1);
  }
}

// Endpoint principal para convertir HTML a PDF
app.post('/convert', async (req, res) => {
  const startTime = Date.now();
  console.log(`📄 Nueva solicitud de conversión HTML→PDF`);
  
  try {
    const { html, filename, options = {} } = req.body;
    
    // Validar entrada
    if (!html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required',
        message: 'Debes proporcionar el contenido HTML en el campo "html"'
      });
    }
    
    // Configuración por defecto para PDF
    const pdfOptions = {
      format: options.format || 'A4',
      margin: {
        top: options.marginTop || '20mm',
        right: options.marginRight || '20mm',
        bottom: options.marginBottom || '20mm',
        left: options.marginLeft || '20mm'
      },
      printBackground: options.printBackground !== false,
      preferCSSPageSize: true,
      displayHeaderFooter: false
    };
    
    console.log('🔧 Configuración PDF:', pdfOptions);
    
    // Crear nueva página
    const page = await browser.newPage();
    
    try {
      // Configurar viewport
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1
      });
      
      // Cargar HTML
      console.log('📝 Cargando contenido HTML...');
      await page.setContent(html, {
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000
      });
      
      // Generar PDF
      console.log('🔄 Generando PDF...');
      const pdfBuffer = await page.pdf(pdfOptions);
      
      console.log(`✅ PDF generado: ${pdfBuffer.length} bytes`);
      
      // Preparar respuesta
      const responseFilename = filename || `documento_${Date.now()}.pdf`;
      const processingTime = Date.now() - startTime;
      
      // Enviar PDF como respuesta
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${responseFilename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('X-Processing-Time', `${processingTime}ms`);
      
      res.send(pdfBuffer);
      
      console.log(`🎉 Conversión completada en ${processingTime}ms`);
      
    } finally {
      // Cerrar página para liberar memoria
      await page.close();
    }
    
  } catch (error) {
    console.error('❌ Error en conversión:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error interno del servidor durante la conversión'
    });
  }
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HTML2PDF Converter',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    browser_active: browser !== null
  });
});

// Endpoint de información
app.get('/', (req, res) => {
  res.json({
    service: 'HTML2PDF Converter Service',
    version: '1.0.0',
    endpoints: {
      convert: 'POST /convert',
      health: 'GET /health'
    },
    usage: {
      convert: {
        method: 'POST',
        url: '/convert',
        body: {
          html: 'string (required) - HTML content to convert',
          filename: 'string (optional) - Output filename',
          options: {
            format: 'string (optional) - A4, A3, Letter, etc.',
            marginTop: 'string (optional) - Top margin (default: 20mm)',
            marginRight: 'string (optional) - Right margin (default: 20mm)', 
            marginBottom: 'string (optional) - Bottom margin (default: 20mm)',
            marginLeft: 'string (optional) - Left margin (default: 20mm)',
            printBackground: 'boolean (optional) - Include backgrounds (default: true)'
          }
        }
      }
    }
  });
});

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando servicio...');
  if (browser) {
    await browser.close();
    console.log('✅ Navegador cerrado');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando servicio...');
  if (browser) {
    await browser.close();
    console.log('✅ Navegador cerrado');
  }
  process.exit(0);
});

// Iniciar servidor
async function startServer() {
  await initBrowser();
  
  app.listen(PORT, () => {
    console.log(`🌐 Servidor HTML2PDF corriendo en puerto ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Endpoint conversión: http://localhost:${PORT}/convert`);
  });
}

startServer().catch(console.error);
