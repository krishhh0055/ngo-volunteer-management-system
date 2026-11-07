import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './server/routes/index.js';

dotenv.config();

const app = express();
import mongoose from 'mongoose';
import archivePlugin from './server/models/plugins/archivePlugin.js';

// Apply the global archive plugin so all deletes are safely captured
mongoose.plugin(archivePlugin);

// ... (existing imports and code)
const PORT = process.env.PORT || 5001;

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ngo-vms')
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve your frontend files (if building for production, usually 'dist' folder)
// For local development, Vite serves the frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for SPA (React Router) if building for production
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});