/**
 * Production server for serving the Vite-built React application
 * Uses Express to serve static files and handle SPA routing
 */

const express = require('express');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  const health = { status: 'healthy', timestamp: new Date().toISOString() };
  console.log('✅ Health check:', health);
  res.status(200).json(health);
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log(`📄 Serving SPA for: ${req.url} -> ${indexPath}`);
  res.sendFile(indexPath);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Health check available at http://0.0.0.0:${PORT}/health`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
