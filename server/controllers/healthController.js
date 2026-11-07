import Task from '../models/Task.js';

export const getHealthStatus = (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend API is running optimally 🚀',
    timestamp: new Date().toISOString()
  });
};
