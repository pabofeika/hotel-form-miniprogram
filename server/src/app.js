const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const config = require('./config');
const logger = require('./config/logger');

// Route imports
const authRoutes = require('./routes/auth');
const formRoutes = require('./routes/forms');
const recordRoutes = require('./routes/records');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const adminAuthRoutes = require('./routes/admin/auth');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminRecordRoutes = require('./routes/admin/records');
const adminFormRoutes = require('./routes/admin/forms');

const app = express();

// --- Global Middleware ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('short', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
});
app.use('/api/', limiter);

// --- API Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/forms', formRoutes);
app.use('/api/v1/records', recordRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/admin', adminDashboardRoutes);
app.use('/api/v1/admin/records', adminRecordRoutes);
app.use('/api/v1/admin', adminFormRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', timestamp: new Date().toISOString() });
});

// Serve admin dashboard static files
app.use('/admin', express.static(path.resolve(__dirname, '../../admin-dashboard/public')));

// Error handler
app.use(errorHandler);

module.exports = app;
