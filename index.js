const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Variables globales
let browser = null;

// Inicializar navegador
async function initBrowser() {
  try {
    console.log('🚀 Iniciando navegador...');
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
    console.log('✅ Navegador iniciado');
  } catch (error) {
    console.error('❌ Error iniciando navegador:', error);
    process.exit(1);
  }
}

// Endpoint principal: convertir HTML a PDF
app.post('/convert', async (req, res) => {
  const startTime = Date.now();
  console.log('📄 Nueva conversión HTML→PDF');
  
  try {
    const { html, filename, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({
        error: 'HTML content is required'
      });
    }
    
    const page = await browser.newPage();
    
    try {
      // Configurar página
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1
      });
      
      // Cargar HTML
      await page.setContent(html, {
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000
      });
      
      // Configuración PDF
      const pdfOptions = {
        format: options.format || 'A4',
        margin: {
          top: options.marginTop || '20mm',
          right: options.marginRight || '20mm',
          bottom: options.marginBottom || '20mm',
          left: options.marginLeft || '20mm'
        },
        printBackground: options.printBackground !== false,
        preferCSSPageSize: true
      };
      
      // Generar PDF
      const pdfBuffer = await page.pdf(pdfOptions);
      
      const processingTime = Date.now() - startTime;
      const responseFilename = filename || `documento_${Date.now()}.pdf`;
      
      // Enviar PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${responseFilename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('X-Processing-Time', `${processingTime}ms`);
      
      res.send(pdfBuffer);
      
      console.log(`✅ PDF generado en ${processingTime}ms`);
      
    } finally {
      await page.close();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HTML2PDF Converter',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    browser: browser !== null
  });
});

// Info del servicio
app.get('/', (req, res) => {
  res.json({
    service: 'HTML2PDF Converter',
    version: '1.0.0',
    endpoints: {
      convert: 'POST /convert',
      health: 'GET /health'
    },
    usage: {
      method: 'POST',
      url: '/convert',
      body: {
        html: 'HTML content (required)',
        filename: 'output filename (optional)',
        options: {
          format: 'A4, Letter, etc (optional)',
          marginTop: 'margin in mm (optional)',
          marginRight: 'margin in mm (optional)',
          marginBottom: 'margin in mm (optional)',
          marginLeft: 'margin in mm (optional)',
          printBackground: 'true/false (optional)'
        }
      }
    }
  });
});

// Cierre graceful
process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Cerrando...');
  if (browser) {
    await browser.close();
  }
  process.exit(0);
});

// Iniciar servidor
async function start() {
  await initBrowser();
  
  app.listen(PORT, () => {
    console.log(`🌐 Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`📍 Convert: POST http://localhost:${PORT}/convert`);
  });
}

start().catch(console.error);
